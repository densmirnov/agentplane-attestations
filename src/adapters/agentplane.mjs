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

function validateAgentplaneSnapshot(snapshot) {
  assert(isObject(snapshot), "agentplane snapshot must be an object.");
  assert(
    snapshot.runtime === "agentplane",
    'agentplane snapshot must declare runtime="agentplane".',
  );
  assert(isObject(snapshot.subject), "subject must be present.");
  assert(isObject(snapshot.project), "project must be present.");
  assert(isObject(snapshot.task), "task must be present.");
  assert(isObject(snapshot.execution), "execution must be present.");
  assert(isObject(snapshot.verification), "verification must be present.");
  assert(
    typeof snapshot.subject.agentId === "string" &&
      snapshot.subject.agentId.length > 0,
    "subject.agentId is required.",
  );
  assert(
    typeof snapshot.subject.displayName === "string" &&
      snapshot.subject.displayName.length > 0,
    "subject.displayName is required.",
  );
  assert(
    typeof snapshot.subject.harness === "string" &&
      snapshot.subject.harness.length > 0,
    "subject.harness is required.",
  );
  assert(
    typeof snapshot.subject.model === "string" &&
      snapshot.subject.model.length > 0,
    "subject.model is required.",
  );
  assert(
    typeof snapshot.project.name === "string" &&
      snapshot.project.name.length > 0,
    "project.name is required.",
  );
  assert(
    typeof snapshot.project.theme === "string" &&
      snapshot.project.theme.length > 0,
    "project.theme is required.",
  );
  assert(
    typeof snapshot.project.problem === "string" &&
      snapshot.project.problem.length > 0,
    "project.problem is required.",
  );
  assert(
    typeof snapshot.task.id === "string" && snapshot.task.id.length > 0,
    "task.id is required.",
  );
  assert(
    typeof snapshot.task.title === "string" && snapshot.task.title.length > 0,
    "task.title is required.",
  );
  assert(
    typeof snapshot.task.summary === "string" &&
      snapshot.task.summary.length > 0,
    "task.summary is required.",
  );
  assert(
    typeof snapshot.execution.repo === "string" &&
      snapshot.execution.repo.length > 0,
    "execution.repo is required.",
  );
  assert(
    typeof snapshot.execution.branch === "string" &&
      snapshot.execution.branch.length > 0,
    "execution.branch is required.",
  );
  assert(
    Array.isArray(snapshot.verification.checks),
    "verification.checks must be an array.",
  );
}

function taskRef(snapshot) {
  return {
    kind: "task",
    id: snapshot.task.id,
  };
}

function agentProducer(snapshot) {
  return {
    kind: "agent",
    id: snapshot.subject.agentId,
    displayName: snapshot.subject.displayName,
  };
}

function listApprovalDecisions(snapshot) {
  if (Array.isArray(snapshot.approvals?.decisions)) {
    return snapshot.approvals.decisions;
  }

  if (snapshot.approvals?.primary) {
    return [snapshot.approvals.primary];
  }

  if (snapshot.approvals?.human) {
    return [snapshot.approvals.human];
  }

  return [];
}

export const agentplaneAdapter = defineRuntimeAdapter({
  adapterId: "agentplane",
  runtime: "agentplane",
  version: "1.0.0",
  description:
    "Maps agentplane runtime snapshots into canonical artifact bundles.",
  adapt(snapshot) {
    validateAgentplaneSnapshot(snapshot);

    const artifacts = [];
    artifacts.push(
      createAdapterArtifact({
        artifactId: "intent-1",
        kind: "intent",
        generatedAt:
          snapshot.task.generatedAt ?? snapshot.execution.generatedAt,
        producer: agentProducer(snapshot),
        subjectRef: taskRef(snapshot),
        ...(snapshot.task.locator ? { locator: snapshot.task.locator } : {}),
        payload: {
          summary: snapshot.task.summary,
          ...(snapshot.task.scope ? { scope: snapshot.task.scope } : {}),
          ...(snapshot.task.requestedOutcome
            ? { requestedOutcome: snapshot.task.requestedOutcome }
            : {}),
        },
      }),
    );

    for (const [index, approval] of listApprovalDecisions(snapshot).entries()) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: `approval-${index + 1}`,
          kind: "approval",
          generatedAt: approval.generatedAt ?? snapshot.task.generatedAt,
          producer: ensureActor(approval.actor, `approvals[${index}].actor`),
          subjectRef: taskRef(snapshot),
          ...(approval.locator ? { locator: approval.locator } : {}),
          payload: {
            status: approval.status,
            ...(approval.rationale ? { rationale: approval.rationale } : {}),
          },
        }),
      );
    }

    artifacts.push(
      createAdapterArtifact({
        artifactId: "execution-1",
        kind: "execution",
        generatedAt: snapshot.execution.generatedAt,
        producer: ensureActor(
          snapshot.execution.producer ?? agentProducer(snapshot),
          "execution.producer",
        ),
        subjectRef: taskRef(snapshot),
        ...(snapshot.execution.locator
          ? { locator: snapshot.execution.locator }
          : {}),
        payload: {
          repo: snapshot.execution.repo,
          branch: snapshot.execution.branch,
          commit: snapshot.execution.commit ?? null,
          filesChanged: snapshot.execution.filesChanged ?? [],
          diffStat: snapshot.execution.diffStat ?? {
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
        generatedAt: snapshot.verification.generatedAt,
        producer: ensureActor(
          snapshot.verification.producer,
          "verification.producer",
        ),
        subjectRef: taskRef(snapshot),
        ...(snapshot.verification.locator
          ? { locator: snapshot.verification.locator }
          : {}),
        payload: {
          conversationLogAttached:
            snapshot.verification.conversationLogAttached ?? false,
          checks: snapshot.verification.checks,
        },
      }),
    );

    if (snapshot.conversation) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: "conversation-1",
          kind: "conversation",
          generatedAt: snapshot.conversation.generatedAt,
          producer: ensureActor(
            snapshot.conversation.producer,
            "conversation.producer",
          ),
          subjectRef: taskRef(snapshot),
          ...(snapshot.conversation.locator
            ? { locator: snapshot.conversation.locator }
            : {}),
          payload: {
            attached: snapshot.conversation.attached,
            ...(snapshot.conversation.uri
              ? { uri: snapshot.conversation.uri }
              : {}),
            ...(snapshot.conversation.summary
              ? { summary: snapshot.conversation.summary }
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
            id: snapshot.subject.agentId,
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

    for (const [index, note] of (snapshot.notes ?? []).entries()) {
      artifacts.push(
        createAdapterArtifact({
          artifactId: `note-${index + 1}`,
          kind: "note",
          generatedAt: note.generatedAt,
          producer: ensureActor(
            note.producer ?? agentProducer(snapshot),
            `notes[${index}].producer`,
          ),
          subjectRef: note.subjectRef ?? taskRef(snapshot),
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
      bundleId: snapshot.bundleId ?? `agentplane-${snapshot.task.id}`,
      subject: {
        kind: "agent",
        agentId: snapshot.subject.agentId,
        displayName: snapshot.subject.displayName,
        harness: snapshot.subject.harness,
        model: snapshot.subject.model,
        ...(snapshot.subject.operator
          ? {
              operator: ensureActor(
                snapshot.subject.operator,
                "subject.operator",
              ),
            }
          : {}),
      },
      context: {
        project: snapshot.project,
        task: {
          id: snapshot.task.id,
          title: snapshot.task.title,
        },
        source: {
          repo: snapshot.execution.repo,
          branch: snapshot.execution.branch,
          commit: snapshot.execution.commit ?? null,
        },
      },
      artifacts,
    };
  },
});
