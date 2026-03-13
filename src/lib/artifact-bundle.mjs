import { canonicalize, canonicalStringify } from "./canonical-json.mjs";
import { sha256Hex } from "./hash.mjs";

const ARTIFACT_KINDS = new Set([
  "intent",
  "approval",
  "execution",
  "verification",
  "conversation",
  "anchor",
  "note",
]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function latestArtifact(artifacts, kind) {
  return (
    artifacts
      .filter((artifact) => artifact.kind === kind)
      .sort((left, right) =>
        String(left.generatedAt).localeCompare(String(right.generatedAt)),
      )
      .at(-1) ?? null
  );
}

function validateActor(actor, path, errors) {
  if (!isObject(actor)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isNonEmptyString(actor.kind)) {
    errors.push(`${path}.kind must be a non-empty string.`);
  }
  if (!isNonEmptyString(actor.id)) {
    errors.push(`${path}.id must be a non-empty string.`);
  }
}

function validateSubject(subject, errors) {
  if (!isObject(subject)) {
    errors.push("subject must be an object.");
    return;
  }

  if (subject.kind !== "agent") {
    errors.push('subject.kind must equal "agent".');
  }
  for (const field of ["agentId", "displayName", "harness", "model"]) {
    if (!isNonEmptyString(subject[field])) {
      errors.push(`subject.${field} must be a non-empty string.`);
    }
  }

  if (subject.operator !== undefined) {
    validateActor(subject.operator, "subject.operator", errors);
  }
}

function validateContext(context, errors) {
  if (!isObject(context)) {
    errors.push("context must be an object.");
    return;
  }

  if (!isObject(context.project)) {
    errors.push("context.project must be an object.");
  } else {
    for (const field of ["name", "theme", "problem"]) {
      if (!isNonEmptyString(context.project[field])) {
        errors.push(`context.project.${field} must be a non-empty string.`);
      }
    }
  }

  if (!isObject(context.task)) {
    errors.push("context.task must be an object.");
  } else {
    for (const field of ["id", "title"]) {
      if (!isNonEmptyString(context.task[field])) {
        errors.push(`context.task.${field} must be a non-empty string.`);
      }
    }
  }

  if (!isObject(context.source)) {
    errors.push("context.source must be an object.");
  } else {
    for (const field of ["repo", "branch"]) {
      if (!isNonEmptyString(context.source[field])) {
        errors.push(`context.source.${field} must be a non-empty string.`);
      }
    }
  }
}

function validateAdapterMetadata(adapter, errors) {
  if (!isObject(adapter)) {
    errors.push("adapter must be an object when present.");
    return;
  }

  for (const field of ["adapterId", "runtime", "version"]) {
    if (!isNonEmptyString(adapter[field])) {
      errors.push(`adapter.${field} must be a non-empty string.`);
    }
  }
}

function validateArtifactPayload(artifact, path, errors) {
  const { payload } = artifact;
  if (!isObject(payload)) {
    errors.push(`${path}.payload must be an object.`);
    return;
  }

  switch (artifact.kind) {
    case "intent":
      if (!isNonEmptyString(payload.summary)) {
        errors.push(`${path}.payload.summary must be a non-empty string.`);
      }
      break;
    case "approval":
      if (
        !["approved", "rejected", "waived", "missing"].includes(payload.status)
      ) {
        errors.push(
          `${path}.payload.status must be approved, rejected, waived, or missing.`,
        );
      }
      break;
    case "execution":
      if (!isNonEmptyString(payload.repo)) {
        errors.push(`${path}.payload.repo must be a non-empty string.`);
      }
      if (!isNonEmptyString(payload.branch)) {
        errors.push(`${path}.payload.branch must be a non-empty string.`);
      }
      if (
        payload.filesChanged !== undefined &&
        !Array.isArray(payload.filesChanged)
      ) {
        errors.push(
          `${path}.payload.filesChanged must be an array when present.`,
        );
      }
      break;
    case "verification":
      if (!Array.isArray(payload.checks) || payload.checks.length === 0) {
        errors.push(`${path}.payload.checks must be a non-empty array.`);
      }
      break;
    case "conversation":
      if (typeof payload.attached !== "boolean") {
        errors.push(`${path}.payload.attached must be boolean.`);
      }
      break;
    case "anchor":
      if (!isNonEmptyString(payload.kind)) {
        errors.push(`${path}.payload.kind must be a non-empty string.`);
      }
      if (
        !isNonEmptyString(payload.txUrl) &&
        !isNonEmptyString(payload.reference)
      ) {
        errors.push(`${path}.payload must contain txUrl or reference.`);
      }
      break;
    case "note":
      if (!isNonEmptyString(payload.text)) {
        errors.push(`${path}.payload.text must be a non-empty string.`);
      }
      break;
    default:
      errors.push(`${path}.kind is not supported.`);
  }
}

function validateArtifact(artifact, index, errors) {
  const path = `artifacts[${index}]`;

  if (!isObject(artifact)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!isNonEmptyString(artifact.artifactId)) {
    errors.push(`${path}.artifactId must be a non-empty string.`);
  }
  if (!ARTIFACT_KINDS.has(artifact.kind)) {
    errors.push(
      `${path}.kind must be one of ${Array.from(ARTIFACT_KINDS).join(", ")}.`,
    );
  }
  if (!isNonEmptyString(artifact.generatedAt)) {
    errors.push(`${path}.generatedAt must be a non-empty string.`);
  }
  validateActor(artifact.producer, `${path}.producer`, errors);

  if (!isObject(artifact.subjectRef)) {
    errors.push(`${path}.subjectRef must be an object.`);
  } else {
    if (!isNonEmptyString(artifact.subjectRef.kind)) {
      errors.push(`${path}.subjectRef.kind must be a non-empty string.`);
    }
    if (!isNonEmptyString(artifact.subjectRef.id)) {
      errors.push(`${path}.subjectRef.id must be a non-empty string.`);
    }
  }

  if (!isNonEmptyString(artifact.mediaType)) {
    errors.push(`${path}.mediaType must be a non-empty string.`);
  }

  validateArtifactPayload(artifact, path, errors);
}

function summarizeArtifact(artifact) {
  return {
    artifactId: artifact.artifactId,
    kind: artifact.kind,
    generatedAt: artifact.generatedAt,
    producer: artifact.producer,
    mediaType: artifact.mediaType,
    payloadDigest: sha256Hex(
      canonicalStringify(canonicalize(artifact.payload)),
    ),
    locator: artifact.locator ?? null,
  };
}

function normalizeExecution(bundle, executionArtifact) {
  if (!executionArtifact) {
    return {
      repo: bundle.context.source.repo,
      branch: bundle.context.source.branch,
      commit: bundle.context.source.commit ?? null,
      filesChanged: [],
      diffStat: {
        added: 0,
        deleted: 0,
      },
    };
  }

  return {
    repo: executionArtifact.payload.repo,
    branch: executionArtifact.payload.branch,
    commit:
      executionArtifact.payload.commit ?? bundle.context.source.commit ?? null,
    filesChanged: executionArtifact.payload.filesChanged ?? [],
    diffStat: executionArtifact.payload.diffStat ?? {
      added: 0,
      deleted: 0,
    },
  };
}

export function isArtifactBundleInput(input) {
  return (
    isObject(input) &&
    Array.isArray(input.artifacts) &&
    isNonEmptyString(input.bundleId)
  );
}

export function validateArtifactBundle(bundle) {
  const errors = [];

  if (!isObject(bundle)) {
    return { valid: false, errors: ["bundle must be an object."] };
  }

  if (bundle.schemaVersion !== "1.0.0") {
    errors.push('schemaVersion must equal "1.0.0".');
  }
  if (!isNonEmptyString(bundle.bundleId)) {
    errors.push("bundleId must be a non-empty string.");
  }
  if (bundle.adapter !== undefined) {
    validateAdapterMetadata(bundle.adapter, errors);
  }

  validateSubject(bundle.subject, errors);
  validateContext(bundle.context, errors);

  if (!Array.isArray(bundle.artifacts) || bundle.artifacts.length === 0) {
    errors.push("artifacts must be a non-empty array.");
  } else {
    const seenArtifactIds = new Set();
    for (const [index, artifact] of bundle.artifacts.entries()) {
      validateArtifact(artifact, index, errors);
      if (isNonEmptyString(artifact?.artifactId)) {
        if (seenArtifactIds.has(artifact.artifactId)) {
          errors.push(
            `artifacts[${index}].artifactId must be unique within the bundle.`,
          );
        }
        seenArtifactIds.add(artifact.artifactId);
      }
    }
  }

  if (
    !Array.isArray(bundle.artifacts) ||
    !bundle.artifacts.some((artifact) => artifact.kind === "intent")
  ) {
    errors.push("At least one intent artifact is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeArtifactBundle(inputBundle) {
  const bundle = canonicalize(inputBundle);
  const validation = validateArtifactBundle(bundle);
  if (!validation.valid) {
    throw new Error(
      `Invalid artifact bundle:\n- ${validation.errors.join("\n- ")}`,
    );
  }

  const intentArtifact = latestArtifact(bundle.artifacts, "intent");
  const approvalArtifact = latestArtifact(bundle.artifacts, "approval");
  const executionArtifact = latestArtifact(bundle.artifacts, "execution");
  const verificationArtifact = latestArtifact(bundle.artifacts, "verification");
  const conversationArtifact = latestArtifact(bundle.artifacts, "conversation");
  const anchorArtifact = latestArtifact(bundle.artifacts, "anchor");
  const noteArtifacts = bundle.artifacts.filter(
    (artifact) => artifact.kind === "note",
  );

  const evidence = {
    meta: {
      agentName: bundle.subject.displayName,
      harness: bundle.subject.harness,
      model: bundle.subject.model,
      maintainer:
        bundle.subject.operator?.displayName ??
        bundle.subject.operator?.id ??
        null,
    },
    project: bundle.context.project,
    task: {
      id: bundle.context.task.id,
      title: bundle.context.task.title,
      approved: approvalArtifact?.payload.status === "approved",
      approvedBy:
        approvalArtifact?.producer.displayName ??
        approvalArtifact?.producer.id ??
        null,
      approvedAt: approvalArtifact?.generatedAt ?? null,
      summary: intentArtifact.payload.summary,
    },
    execution: normalizeExecution(bundle, executionArtifact),
    verification: {
      conversationLogAttached:
        conversationArtifact?.payload.attached ??
        verificationArtifact?.payload.conversationLogAttached ??
        false,
      checks: verificationArtifact?.payload.checks ?? [],
    },
    approvals: {
      human: {
        status: approvalArtifact?.payload.status ?? "missing",
        actor:
          approvalArtifact?.producer.displayName ??
          approvalArtifact?.producer.id ??
          null,
      },
    },
    anchors: {
      registration: anchorArtifact
        ? {
            kind: anchorArtifact.payload.kind,
            chain: anchorArtifact.payload.chain ?? null,
            txUrl:
              anchorArtifact.payload.txUrl ??
              anchorArtifact.payload.reference ??
              null,
          }
        : null,
    },
    notes: noteArtifacts.map((artifact) => artifact.payload.text),
  };

  return {
    evidence,
    inputSurface: {
      type: "artifact-bundle",
      schemaVersion: bundle.schemaVersion,
      bundleId: bundle.bundleId,
      bundleDigest: sha256Hex(canonicalStringify(bundle)),
      artifactCount: bundle.artifacts.length,
      adapter: bundle.adapter
        ? {
            adapterId: bundle.adapter.adapterId,
            runtime: bundle.adapter.runtime,
            version: bundle.adapter.version,
          }
        : null,
      artifacts: bundle.artifacts.map(summarizeArtifact),
    },
  };
}

export function normalizeAttestationInput(input) {
  if (isArtifactBundleInput(input)) {
    return normalizeArtifactBundle(input);
  }

  return {
    evidence: canonicalize(input),
    inputSurface: {
      type: "legacy-evidence",
      warning:
        "Legacy evidence-shaped input is supported for compatibility, but artifact bundle is the canonical format.",
    },
  };
}
