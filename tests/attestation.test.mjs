import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { getRuntimeAdapter } from "../src/adapters/index.mjs";
import { extractAgentplaneTaskSnapshot } from "../src/lib/agentplane-task-extractor.mjs";
import {
  buildAttestationAnchorReceipt,
  validateAttestationAnchorReceipt,
} from "../src/lib/anchor.mjs";
import {
  createAttestation,
  verifyAttestation,
} from "../src/lib/attestation.mjs";
import {
  normalizeArtifactBundle,
  validateArtifactBundle,
} from "../src/lib/artifact-bundle.mjs";
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

test("openclaw adapter emits a canonical artifact bundle", () => {
  const adapter = getRuntimeAdapter("openclaw");
  const snapshot = loadJson("../examples/openclaw-runtime-passing.json");
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  const validation = validateArtifactBundle(bundle);

  assert.equal(validation.valid, true);
  assert.equal(bundle.adapter.adapterId, "openclaw");
  assert.equal(bundle.adapter.runtime, "openclaw");
  assert.ok(bundle.artifacts.some((artifact) => artifact.kind === "intent"));
  assert.ok(bundle.artifacts.some((artifact) => artifact.kind === "approval"));
  assert.ok(
    bundle.artifacts.some((artifact) => artifact.subjectRef.kind === "run"),
  );
});

test("openclaw adapter path generates a trusted attestation", () => {
  const adapter = getRuntimeAdapter("openclaw");
  const snapshot = loadJson("../examples/openclaw-runtime-passing.json");
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(attestation.inputSurface.adapter.adapterId, "openclaw");
  assert.equal(attestation.inputSurface.adapter.runtime, "openclaw");
  assert.equal(verification.verdict, "trusted");
  assert.equal(attestation.claims.approvedDecisionAttached, true);
  assert.equal(attestation.claims.humanSignoffAttached, false);
});

test("openclaw failing path generates a rejected attestation", () => {
  const adapter = getRuntimeAdapter("openclaw");
  const snapshot = loadJson("../examples/openclaw-runtime-failing.json");
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(attestation.inputSurface.adapter.adapterId, "openclaw");
  assert.equal(verification.verdict, "reject");
  assert.equal(attestation.claims.approvedDecisionAttached, false);
});

test("policy approval artifacts can still produce a trusted attestation", () => {
  const bundle = loadJson("../examples/passing-bundle.json");
  bundle.artifacts = bundle.artifacts.map((artifact) =>
    artifact.kind === "approval"
      ? {
          ...artifact,
          producer: {
            kind: "policy",
            id: "ORCHESTRATOR",
            displayName: "ORCHESTRATOR",
          },
        }
      : artifact,
  );

  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(verification.verdict, "trusted");
  assert.equal(attestation.claims.approvedDecisionAttached, true);
  assert.equal(attestation.claims.humanSignoffAttached, false);
});

test("bundle normalization preserves approval actor semantics", () => {
  const bundle = loadJson("../examples/passing-bundle.json");
  const { evidence } = normalizeArtifactBundle(bundle);

  assert.equal(evidence.approvals.primary.status, "approved");
  assert.equal(evidence.approvals.primary.actorKind, "human");
  assert.equal(evidence.approvals.humanSignoff.actorKind, "human");
  assert.equal(evidence.task.approvalActorKind, "human");
});

test("real agentplane task extractor emits a trusted runtime snapshot", () => {
  const snapshot = extractAgentplaneTaskSnapshot({
    taskId: "202603131024-THDVQ1",
  });

  assert.equal(snapshot.runtime, "agentplane");
  assert.equal(snapshot.task.id, "202603131024-THDVQ1");
  assert.equal(
    snapshot.execution.commit,
    "5a9d8c57afbe78a193f48bec679e6c4e758c16c0",
  );
  assert.ok(
    snapshot.execution.filesChanged.includes("src/adapters/agentplane.mjs"),
  );
  assert.ok(snapshot.verification.checks.length >= 4);
  assert.equal(snapshot.approvals.primary.status, "approved");
  assert.equal(snapshot.approvals.primary.actor.kind, "policy");
  assert.equal(snapshot.approvals.primary.actor.id, "ORCHESTRATOR");
  assert.equal(snapshot.conversation.attached, true);
});

test("real agentplane task path generates a trusted attestation", () => {
  const adapter = getRuntimeAdapter("agentplane");
  const snapshot = extractAgentplaneTaskSnapshot({
    taskId: "202603131024-THDVQ1",
  });
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  const attestation = createAttestation(bundle);
  const verification = verifyAttestation(attestation);

  assert.equal(verification.verdict, "trusted");
  assert.equal(attestation.inputSurface.adapter.adapterId, "agentplane");
  assert.equal(attestation.claims.approvedDecisionAttached, true);
  assert.equal(attestation.claims.humanSignoffAttached, false);
  assert.equal(
    attestation.inputSurface.bundleId,
    "agentplane-task-202603131024-THDVQ1",
  );
});

test("attestation anchor receipt is deterministic and matches the attestation", () => {
  const bundle = loadJson("../examples/passing-bundle.json");
  const attestation = createAttestation(bundle);
  const receipt = buildAttestationAnchorReceipt(attestation, {
    createdAt: "2026-03-13T12:00:00.000Z",
    rpcUrl: "https://mainnet.base.org",
  });
  const validation = validateAttestationAnchorReceipt(attestation, receipt);

  assert.equal(validation.valid, true);
  assert.equal(receipt.network.chain, "Base");
  assert.equal(receipt.anchorSubject.protocol, "agentplane-attestation:v1");
  assert.equal(
    receipt.anchorSubject.message,
    `agentplane-attestation:v1:${attestation.integrity.attestationDigest}`,
  );
  assert.match(receipt.anchorSubject.calldata, /^0x[0-9a-f]+$/);
  assert.equal(receipt.submission.status, "not-submitted");
});

test("CLI extract command writes a runtime snapshot for a real task", () => {
  const outputPath = "artifacts/test-extracted-runtime.json";
  execFileSync(
    "node",
    [
      "src/cli.mjs",
      "extract",
      "--task-id",
      "202603131024-THDVQ1",
      "--output",
      outputPath,
    ],
    {
      encoding: "utf8",
    },
  );

  const snapshot = loadJson(`../${outputPath}`);
  assert.equal(snapshot.task.id, "202603131024-THDVQ1");
  assert.equal(snapshot.runtime, "agentplane");
});

test("CLI anchor command writes a prepared anchor receipt without signer secrets", () => {
  const attestationPath = "artifacts/test-anchor-attestation.json";
  const anchorPath = "artifacts/test-anchor.json";

  execFileSync(
    "node",
    [
      "src/cli.mjs",
      "generate",
      "--input",
      "examples/passing-bundle.json",
      "--output",
      attestationPath,
    ],
    {
      encoding: "utf8",
    },
  );

  execFileSync(
    "node",
    [
      "src/cli.mjs",
      "anchor",
      "--input",
      attestationPath,
      "--output",
      anchorPath,
    ],
    {
      encoding: "utf8",
    },
  );

  const attestation = loadJson(`../${attestationPath}`);
  const anchorReceipt = loadJson(`../${anchorPath}`);
  const validation = validateAttestationAnchorReceipt(
    attestation,
    anchorReceipt,
  );

  assert.equal(validation.valid, true);
  assert.equal(anchorReceipt.submission.mode, "prepared");
  assert.equal(anchorReceipt.submission.status, "not-submitted");
  assert.equal(anchorReceipt.submission.txHash, null);
});

test("CLI adapt command supports the openclaw reference adapter", () => {
  const bundlePath = "artifacts/test-openclaw-bundle.json";
  const attestationPath = "artifacts/test-openclaw-attestation.json";

  execFileSync(
    "node",
    [
      "src/cli.mjs",
      "adapt",
      "--adapter",
      "openclaw",
      "--input",
      "examples/openclaw-runtime-passing.json",
      "--output",
      bundlePath,
    ],
    {
      encoding: "utf8",
    },
  );

  execFileSync(
    "node",
    [
      "src/cli.mjs",
      "generate",
      "--input",
      bundlePath,
      "--output",
      attestationPath,
    ],
    {
      encoding: "utf8",
    },
  );

  const bundle = loadJson(`../${bundlePath}`);
  const attestation = loadJson(`../${attestationPath}`);
  const verification = verifyAttestation(attestation);

  assert.equal(bundle.adapter.adapterId, "openclaw");
  assert.equal(attestation.inputSurface.bundleId, "openclaw-reference-passing");
  assert.equal(verification.verdict, "trusted");
});

test("CLI demo command builds a judge-facing demo from a real completed task", () => {
  const outputDir = "artifacts/test-demo";

  execFileSync("node", ["src/cli.mjs", "demo", "--output-dir", outputDir], {
    encoding: "utf8",
  });

  const trustedRuntime = loadJson(`../${outputDir}/trusted-runtime.json`);
  const trustedBundle = loadJson(`../${outputDir}/trusted-bundle.json`);
  const trustedAnchor = loadJson(`../${outputDir}/trusted-anchor.json`);
  const indexHtml = readFileSync(
    new URL(`../${outputDir}/index.html`, import.meta.url),
    "utf8",
  );

  assert.equal(trustedRuntime.task.id, "202603131341-YNE1V9");
  assert.equal(trustedBundle.context.task.id, "202603131341-YNE1V9");
  assert.equal(trustedAnchor.submission.status, "not-submitted");
  assert.match(indexHtml, /Trusted path source task/);
  assert.match(indexHtml, /trusted-report\.html/);
  assert.match(indexHtml, /rejected-report\.html/);
});
