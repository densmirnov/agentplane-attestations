import {
  createAdapterArtifact,
  defineRuntimeAdapter,
} from "../lib/runtime-adapter.mjs";

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function ensureActor(actor, path) {
  assert(isObject(actor), `${path} must be an object.`);
  assert(
    typeof actor.kind === "string" && actor.kind.length > 0,
    `${path}.kind must be a non-empty string.`,
  );
  assert(
    typeof actor.id === "string" && actor.id.length > 0,
    `${path}.id must be a non-empty string.`,
  );
  return {
    kind: actor.kind,
    id: actor.id,
    ...(actor.displayName ? { displayName: actor.displayName } : {}),
  };
}

function validateOpenclawSnapshot(snapshot) {
  assert(isObject(snapshot), "openclaw snapshot must be an object.");
  assert(
    snapshot.runtime === "openclaw",
    'openclaw snapshot must declare runtime="openclaw".',
  );
  assert(isObject(snapshot.agent), "agent must be present.");
  assert(isObject(snapshot.program), "program must be present.");
  assert(isObject(snapshot.run), "run must be present.");
  assert(isObject(snapshot.delivery), "delivery must be present.");
  assert(isObject(snapshot.validation), "validation must be present.");
  assert(
    typeof snapshot.agent.agentId === "string" &&
      snapshot.agent.agentId.length > 0,
    "agent.agentId is required.",
  );
  assert(
    typeof snapshot.agent.displayName === "string" &&
      snapshot.agent.displayName.length > 0,
    "agent.displayName is required.",
  );
  assert(
    typeof snapshot.agent.harness === "string" &&
      snapshot.agent.harness.length > 0,
    "agent.harness is required.",
  );
  assert(
    typeof snapshot.agent.model === "string" && snapshot.agent.model.length > 0,
    "agent.model is required.",
  );
  assert(
    typeof snapshot.program.name === "string" &&
      snapshot.program.name.length > 0,
    "program.name is required.",
  );
  assert(
    typeof snapshot.program.theme === "string" &&
      snapshot.program.theme.length > 0,
    "program.theme is required.",
  );
  assert(
    typeof snapshot.program.problem === "string" &&
      snapshot.program.problem.length > 0,
    "program.problem is required.",
  );
  assert(
    typeof snapshot.run.id === "string" && snapshot.run.id.length > 0,
    "run.id is required.",
  );
  assert(
    typeof snapshot.run.title === "string" && snapshot.run.title.length > 0,
    "run.title is required.",
  );
  assert(
    typeof snapshot.run.objective === "string" &&
      snapshot.run.objective.length > 0,
    "run.objective is required.",
  );
  assert(
    typeof snapshot.delivery.repo === "string" &&
      snapshot.delivery.repo.length > 0,
    "delivery.repo is required.",
  );
  assert(
    typeof snapshot.delivery.branch === "string" &&
      snapshot.delivery.branch.length > 0,
    "delivery.branch is required.",
  );
  assert(
    Array.isArray(snapshot.validation.checks),
    "validation.checks must be an array.",
  );
}

function runRef(snapshot) {
  return {
    kind: "run",
    id: snapshot.run.id,
  };
}

function agentProducer(snapshot) {
  return {
    kind: "agent",
    id: snapshot.agent.agentId,
    displayName: snapshot.agent.displayName,
  };
}

function listReviewDecisions(snapshot) {
  if (Array.isArray(snapshot.review?.decisions)) {
    return snapshot.review.decisions;
  }

  if (snapshot.review?.decision) {
    return [snapshot.review.decision];
  }

  return [];
}

function listAnnotations(snapshot) {
  if (Array.isArray(snapshot.annotations)) {
    return snapshot.annotations;
  }

  if (Array.isArray(snapshot.notes)) {
    return snapshot.notes;
  }

  return [];
}

export const openclawAdapter = defineRuntimeAdapter({
  adapterId: "openclaw",
  runtime: "openclaw",
  version: "0.1.0",
  description:
    "Reference adapter that maps OpenClaw-style runtime snapshots into canonical artifact bundles.",
  adapt(snapshot) {
    validateOpenclawSnapshot(snapshot);

    const artifacts = [];

    artifacts.push(
      createAdapterArtifact({
        artifactId: "intent-1",
        kind: "intent",
        generatedAt: snapshot.run.openedAt ?? snapshot.delivery.producedAt,
        producer: agentProducer(snapshot),
        subjectRef: runRef(snapshot),
        ...(snapshot.run.locator ? { locator: snapshot.run.locator } : {}),
        payload: {
          summary: snapshot.run.objective,
          ...(snapshot.run.scope ? { scope: snapshot.run.scope } : {}),
          ...(snapshot.run.requestedOutcome
            ? { requestedOutcome: snapshot.run.requestedOutcome }
            : {}),
        },
      }),
    );

    for (const [index, decision] of listReviewDecisions(snapshot).entries()) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: `approval-${index + 1}`,
          kind: "approval",
          generatedAt: decision.decidedAt ?? snapshot.run.openedAt,
          producer: ensureActor(decision.actor, `review.decisions[${index}].actor`),
          subjectRef: runRef(snapshot),
          ...(decision.locator ? { locator: decision.locator } : {}),
          payload: {
            status: decision.status,
            ...(decision.rationale ? { rationale: decision.rationale } : {}),
          },
        }),
      );
    }

    artifacts.push(
      createAdapterArtifact({
        artifactId: "execution-1",
        kind: "execution",
        generatedAt: snapshot.delivery.producedAt,
        producer: ensureActor(
          snapshot.delivery.producer ?? agentProducer(snapshot),
          "delivery.producer",
        ),
        subjectRef: runRef(snapshot),
        ...(snapshot.delivery.locator
          ? { locator: snapshot.delivery.locator }
          : {}),
        payload: {
          repo: snapshot.delivery.repo,
          branch: snapshot.delivery.branch,
          commit: snapshot.delivery.commit ?? null,
          filesChanged: snapshot.delivery.filesChanged ?? [],
          diffStat: snapshot.delivery.diffStat ?? {
            added: 0,
            deleted: 0,
          },
        },
      }),
    );

    artifacts.push(
      createAdapterArtifact({
        artifactId: "verification-1",
        kind: "verification",
        generatedAt: snapshot.validation.producedAt,
        producer: ensureActor(
          snapshot.validation.producer,
          "validation.producer",
        ),
        subjectRef: runRef(snapshot),
        ...(snapshot.validation.locator
          ? { locator: snapshot.validation.locator }
          : {}),
        payload: {
          conversationLogAttached:
            snapshot.validation.conversationLogAttached ?? false,
          checks: snapshot.validation.checks,
        },
      }),
    );

    if (snapshot.transcript) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: "conversation-1",
          kind: "conversation",
          generatedAt: snapshot.transcript.producedAt,
          producer: ensureActor(
            snapshot.transcript.producer,
            "transcript.producer",
          ),
          subjectRef: runRef(snapshot),
          ...(snapshot.transcript.locator
            ? { locator: snapshot.transcript.locator }
            : {}),
          payload: {
            attached: snapshot.transcript.attached,
            ...(snapshot.transcript.uri
              ? { uri: snapshot.transcript.uri }
              : {}),
            ...(snapshot.transcript.summary
              ? { summary: snapshot.transcript.summary }
              : {}),
          },
        }),
      );
    }

    for (const [index, anchor] of (snapshot.anchors ?? []).entries()) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: `anchor-${index + 1}`,
          kind: "anchor",
          generatedAt: anchor.generatedAt,
          producer: ensureActor(anchor.producer, `anchors[${index}].producer`),
          subjectRef: anchor.subjectRef ?? {
            kind: "agent",
            id: snapshot.agent.agentId,
          },
          ...(anchor.locator ? { locator: anchor.locator } : {}),
          payload: {
            kind: anchor.kind,
            ...(anchor.chain ? { chain: anchor.chain } : {}),
            ...(anchor.txUrl ? { txUrl: anchor.txUrl } : {}),
            ...(anchor.reference ? { reference: anchor.reference } : {}),
          },
        }),
      );
    }

    for (const [index, note] of listAnnotations(snapshot).entries()) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: `note-${index + 1}`,
          kind: "note",
          generatedAt: note.generatedAt,
          producer: ensureActor(
            note.producer ?? agentProducer(snapshot),
            `annotations[${index}].producer`,
          ),
          subjectRef: note.subjectRef ?? runRef(snapshot),
          mediaType: note.mediaType ?? "text/plain",
          ...(note.locator ? { locator: note.locator } : {}),
          payload: {
            text: note.text,
          },
        }),
      );
    }

    return {
      schemaVersion: "1.0.0",
      bundleId: snapshot.bundleId ?? `openclaw-${snapshot.run.id}`,
      subject: {
        kind: "agent",
        agentId: snapshot.agent.agentId,
        displayName: snapshot.agent.displayName,
        harness: snapshot.agent.harness,
        model: snapshot.agent.model,
        ...(snapshot.agent.operator
          ? {
              operator: ensureActor(snapshot.agent.operator, "agent.operator"),
            }
          : {}),
      },
      context: {
        project: snapshot.program,
        task: {
          id: snapshot.run.id,
          title: snapshot.run.title,
        },
        source: {
          repo: snapshot.delivery.repo,
          branch: snapshot.delivery.branch,
          commit: snapshot.delivery.commit ?? null,
        },
      },
      artifacts,
    };
  },
});
