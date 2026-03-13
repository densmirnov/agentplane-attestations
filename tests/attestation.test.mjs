import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getRuntimeAdapter } from "../src/adapters/index.mjs";
import {
  createAttestation,
  verifyAttestation,
} from "../src/lib/attestation.mjs";
import { validateArtifactBundle } from "../src/lib/artifact-bundle.mjs";
import { adaptRuntimeSnapshot } from "../src/lib/runtime-adapter.mjs";

function loadJson(filePath) {
  return JSON.parse(readFileSync(new URL(filePath, import.meta.url), "utf8"));
}

test("passing bundle generates a trusted attestation", () => {
  const bundle = loadJson("../examples/passing-bundle.json");
  const validation = validateArtifactBundle(bundle);
  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(validation.valid, true);
  assert.equal(verification.integrityValid, true);
  assert.equal(verification.verdict, "trusted");
  assert.equal(verification.policySatisfied, true);
  assert.match(attestation.attestationId, /^att-/);
  assert.equal(attestation.inputSurface.type, "artifact-bundle");
  assert.equal(attestation.inputSurface.bundleId, "bundle-passing-demo");
});

test("failing bundle generates a rejected attestation", () => {
  const bundle = loadJson("../examples/failing-bundle.json");
  const validation = validateArtifactBundle(bundle);
  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(validation.valid, true);
  assert.equal(verification.integrityValid, true);
  assert.equal(verification.verdict, "reject");
  assert.equal(verification.policySatisfied, false);
  assert.ok(verification.warnings.length > 0);
});

test("bundle validation rejects malformed artifact bundles", () => {
  const invalidBundle = {
    schemaVersion: "1.0.0",
    bundleId: "invalid-bundle",
    subject: {
      kind: "agent",
      agentId: "agentplane",
      displayName: "agentplane",
      harness: "codex-cli",
      model: "gpt-5",
    },
    context: {
      project: {
        name: "agentplane Attestations",
        theme: "Agents that trust",
        problem: "Verify trust in agent output.",
      },
      task: {
        id: "broken-task",
        title: "Broken bundle",
      },
      source: {
        repo: "synthesis-hackathon",
        branch: "main",
      },
    },
    artifacts: [
      {
        artifactId: "approval-1",
        kind: "approval",
        generatedAt: "2026-03-13T10:00:00.000Z",
        producer: {
          kind: "human",
          id: "densmirnov",
        },
        subjectRef: {
          kind: "task",
          id: "broken-task",
        },
        mediaType: "application/json",
        payload: {
          status: "approved",
        },
      },
    ],
  };

  const validation = validateArtifactBundle(invalidBundle);

  assert.equal(validation.valid, false);
  assert.ok(
    validation.errors.some((error) =>
      error.includes("At least one intent artifact is required."),
    ),
  );
});

test("agentplane adapter emits a canonical artifact bundle", () => {
  const adapter = getRuntimeAdapter("agentplane");
  const snapshot = loadJson("../examples/agentplane-runtime-passing.json");
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  const validation = validateArtifactBundle(bundle);

  assert.equal(validation.valid, true);
  assert.equal(bundle.adapter.adapterId, "agentplane");
  assert.equal(bundle.adapter.runtime, "agentplane");
  assert.ok(bundle.artifacts.some((artifact) => artifact.kind === "intent"));
  assert.ok(
    bundle.artifacts.some((artifact) => artifact.kind === "verification"),
  );
});

test("agentplane adapter path generates a trusted attestation", () => {
  const adapter = getRuntimeAdapter("agentplane");
  const snapshot = loadJson("../examples/agentplane-runtime-passing.json");
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(attestation.inputSurface.adapter.adapterId, "agentplane");
  assert.equal(attestation.inputSurface.adapter.runtime, "agentplane");
  assert.equal(verification.verdict, "trusted");
});
