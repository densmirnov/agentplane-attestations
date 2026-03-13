import { canonicalize, canonicalStringify } from "./canonical-json.mjs";
import { sha256Hex } from "./hash.mjs";
import { normalizeAttestationInput } from "./artifact-bundle.mjs";
import { evaluateTrust } from "./policy.mjs";

function makeClaims(evidence) {
  const checks = evidence?.verification?.checks ?? [];
  const requiredChecks = checks.filter((check) => check.required);

  return {
    scopeApproved: evidence?.task?.approved === true,
    humanApproved: evidence?.approvals?.human?.status === "approved",
    executionObserved: Boolean(
      evidence?.execution?.repo && evidence?.execution?.branch,
    ),
    verificationPassed:
      requiredChecks.length > 0 &&
      requiredChecks.every((check) => check.status === "pass"),
    anchoredOnBase: Boolean(evidence?.anchors?.registration?.txUrl),
  };
}

function digestWithoutSelfHash(attestation) {
  const digestable = structuredClone(attestation);
  delete digestable.integrity.attestationDigest;
  return sha256Hex(canonicalStringify(digestable));
}

export function createAttestation(inputEvidence) {
  const { evidence, inputSurface } = normalizeAttestationInput(inputEvidence);
  const trust = evaluateTrust(evidence);
  const evidenceDigest = sha256Hex(canonicalStringify(evidence));
  const attestationId = `att-${sha256Hex(`${evidence.task.id}:${evidenceDigest}`).slice(0, 16)}`;

  const attestation = {
    schemaVersion: "1.0.0",
    product: "agentplane Attestations",
    attestationId,
    issuedAt: new Date().toISOString(),
    subject: {
      agentName: evidence.meta.agentName,
      harness: evidence.meta.harness,
      model: evidence.meta.model,
      maintainer: evidence.meta.maintainer,
    },
    project: {
      name: evidence.project.name,
      theme: evidence.project.theme,
      problem: evidence.project.problem,
    },
    inputSurface,
    claims: makeClaims(evidence),
    trust,
    evidence,
    anchors: evidence.anchors,
    presentation: {
      avatarHint: "favicon-style-png",
    },
    integrity: {
      hashAlgorithm: "sha256",
      evidenceDigest,
      attestationDigest: null,
    },
  };

  attestation.integrity.attestationDigest = digestWithoutSelfHash(attestation);
  return attestation;
}

function validateStructure(attestation) {
  const errors = [];

  if (!attestation?.schemaVersion) {
    errors.push("Missing schemaVersion.");
  }
  if (!attestation?.attestationId) {
    errors.push("Missing attestationId.");
  }
  if (!attestation?.evidence) {
    errors.push("Missing evidence block.");
  }
  if (!attestation?.inputSurface) {
    errors.push("Missing inputSurface block.");
  }
  if (!attestation?.integrity?.evidenceDigest) {
    errors.push("Missing integrity.evidenceDigest.");
  }
  if (!attestation?.integrity?.attestationDigest) {
    errors.push("Missing integrity.attestationDigest.");
  }

  return errors;
}

export function verifyAttestation(attestation) {
  const errors = validateStructure(attestation);
  const warnings = [];

  if (errors.length > 0) {
    return {
      integrityValid: false,
      policySatisfied: false,
      verdict: "reject",
      score: 0,
      reasons: [],
      warnings,
      errors,
    };
  }

  const expectedEvidenceDigest = sha256Hex(
    canonicalStringify(canonicalize(attestation.evidence)),
  );
  if (attestation.integrity.evidenceDigest !== expectedEvidenceDigest) {
    errors.push("Evidence digest mismatch.");
  }

  const expectedDigest = digestWithoutSelfHash(attestation);
  if (attestation.integrity.attestationDigest !== expectedDigest) {
    errors.push("Attestation digest mismatch.");
  }

  const recomputedTrust = evaluateTrust(attestation.evidence);
  if (attestation.trust.score !== recomputedTrust.score) {
    warnings.push("Stored score differs from recomputed score.");
  }
  if (attestation.trust.verdict !== recomputedTrust.verdict) {
    warnings.push("Stored verdict differs from recomputed verdict.");
  }

  return {
    integrityValid: errors.length === 0,
    policySatisfied: recomputedTrust.verdict !== "reject",
    verdict: recomputedTrust.verdict,
    score: recomputedTrust.score,
    reasons: recomputedTrust.reasons,
    warnings: [...recomputedTrust.warnings, ...warnings],
    errors,
  };
}
