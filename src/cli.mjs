import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getRuntimeAdapter, listRuntimeAdapters } from "./adapters/index.mjs";
import { resolveAgentplaneProfile } from "./lib/agentplane-profile.mjs";
import { extractAgentplaneTaskSnapshot } from "./lib/agentplane-task-extractor.mjs";
import {
  anchorAttestation,
  validateAttestationAnchorReceipt,
} from "./lib/anchor.mjs";
import { createAttestation, verifyAttestation } from "./lib/attestation.mjs";
import { ensureAvatarPng } from "./lib/avatar.mjs";
import { canonicalStringify } from "./lib/canonical-json.mjs";
import { buildDemoIndex, renderAttestationReport } from "./lib/report.mjs";
import { adaptRuntimeSnapshot } from "./lib/runtime-adapter.mjs";

const DEFAULT_DEMO_TRUSTED_TASK_ID = "202603131341-YNE1V9";

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(resolve(filePath), "utf8"));
}

function loadProfile(options) {
  if (!options.profile) {
    return resolveAgentplaneProfile();
  }

  return resolveAgentplaneProfile(readJson(options.profile));
}

function writeJson(filePath, value) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
  writeFileSync(resolve(filePath), `${canonicalStringify(value)}\n`);
}

function writeText(filePath, value) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
  writeFileSync(resolve(filePath), value);
}

function printSummary(summary) {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  node src/cli.mjs extract --task-id <id> --output <runtime-snapshot.json> [--profile <profile.json>]",
      "  node src/cli.mjs adapt --adapter <id> --input <runtime-snapshot.json> --output <bundle.json>",
      "  node src/cli.mjs adapt --adapter agentplane --task-id <id> --output <bundle.json> [--profile <profile.json>]",
      "  node src/cli.mjs generate --input <artifact-bundle.json> --output <attestation.json>",
      "  node src/cli.mjs anchor --input <attestation.json> --output <anchor.json> [--submit] [--rpc-url <url>]",
      "  node src/cli.mjs verify --input <attestation.json> [--expect trusted|caution|reject]",
      "  node src/cli.mjs render --input <attestation.json> --output <report.html> [--anchor <anchor.json>]",
      `  node src/cli.mjs demo [--task-id ${DEFAULT_DEMO_TRUSTED_TASK_ID}] [--output-dir artifacts]`,
      "",
      `Available adapters: ${listRuntimeAdapters()
        .map((adapter) => adapter.adapterId)
        .join(", ")}`,
    ].join("\n"),
  );
  process.stderr.write("\n");
}

function runExtract(options) {
  if (!options["task-id"] || !options.output) {
    throw new Error("extract requires --task-id and --output");
  }

  const snapshot = extractAgentplaneTaskSnapshot({
    taskId: options["task-id"],
    profile: loadProfile(options),
  });
  writeJson(options.output, snapshot);

  printSummary({
    command: "extract",
    runtime: snapshot.runtime,
    taskId: options["task-id"],
    output: options.output,
    commit: snapshot.execution.commit,
    filesChanged: snapshot.execution.filesChanged.length,
    checkCount: snapshot.verification.checks.length,
  });
}

function runAdapt(options) {
  if (!options.adapter || !options.output) {
    throw new Error("adapt requires --adapter and --output");
  }

  const adapter = getRuntimeAdapter(options.adapter);
  let snapshot = null;

  if (options.input) {
    snapshot = readJson(options.input);
  } else if (options["task-id"]) {
    if (adapter.adapterId !== "agentplane") {
      throw new Error(
        "task extraction is currently supported only for --adapter agentplane",
      );
    }

    snapshot = extractAgentplaneTaskSnapshot({
      taskId: options["task-id"],
      profile: loadProfile(options),
    });
  } else {
    throw new Error("adapt requires either --input or --task-id");
  }

  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  writeJson(options.output, bundle);

  printSummary({
    command: "adapt",
    adapter: adapter.adapterId,
    runtime: adapter.runtime,
    input: options.input ?? null,
    taskId: options["task-id"] ?? null,
    output: options.output,
    bundleId: bundle.bundleId,
    artifactCount: bundle.artifacts.length,
  });
}

function runGenerate(options) {
  if (!options.input || !options.output) {
    throw new Error("generate requires --input and --output");
  }

  const input = readJson(options.input);
  const attestation = createAttestation(input);
  writeJson(options.output, attestation);

  printSummary({
    command: "generate",
    input: options.input,
    inputType: attestation.inputSurface.type,
    output: options.output,
    attestationId: attestation.attestationId,
    verdict: attestation.trust.verdict,
    score: attestation.trust.score,
    bundleId: attestation.inputSurface.bundleId ?? null,
  });
}

async function runAnchor(options) {
  if (!options.input || !options.output) {
    throw new Error("anchor requires --input and --output");
  }

  const attestation = readJson(options.input);
  const receipt = await anchorAttestation(attestation, {
    submit: Boolean(options.submit),
    rpcUrl: options["rpc-url"] ?? process.env.BASE_RPC_URL,
  });
  writeJson(options.output, receipt);

  printSummary({
    command: "anchor",
    input: options.input,
    output: options.output,
    attestationId: receipt.attestationId,
    digest: receipt.attestationDigest,
    mode: receipt.submission.mode,
    status: receipt.submission.status,
    txHash: receipt.submission.txHash,
    txUrl: receipt.submission.txUrl,
    error: receipt.submission.error,
  });

  if (options.submit && receipt.submission.status !== "confirmed") {
    process.exitCode = 1;
  }
}

function runVerify(options) {
  if (!options.input) {
    throw new Error("verify requires --input");
  }

  const expectedVerdict = options.expect ?? "trusted";
  const attestation = readJson(options.input);
  const result = verifyAttestation(attestation);

  printSummary({
    command: "verify",
    input: options.input,
    expectedVerdict,
    actualVerdict: result.verdict,
    score: result.score,
    integrityValid: result.integrityValid,
    policySatisfied: result.policySatisfied,
    errors: result.errors,
    warnings: result.warnings,
  });

  if (result.verdict !== expectedVerdict || !result.integrityValid) {
    process.exitCode = 1;
  }
}

function runRender(options) {
  if (!options.input || !options.output) {
    throw new Error("render requires --input and --output");
  }

  const attestation = readJson(options.input);
  const verification = verifyAttestation(attestation);
  const anchorReceipt = options.anchor ? readJson(options.anchor) : null;
  const anchorValidation =
    anchorReceipt !== null
      ? validateAttestationAnchorReceipt(attestation, anchorReceipt)
      : { valid: true, errors: [] };

  if (!anchorValidation.valid) {
    throw new Error(
      `Anchor receipt does not match the attestation:\n- ${anchorValidation.errors.join("\n- ")}`,
    );
  }

  const outputPath = resolve(options.output);
  const avatarPath = ensureAvatarPng(dirname(outputPath));
  const html = renderAttestationReport({
    attestation,
    verification,
    anchorReceipt,
    avatarFileName: avatarPath.split("/").at(-1),
  });

  writeText(outputPath, html);

  printSummary({
    command: "render",
    input: options.input,
    output: options.output,
    verdict: verification.verdict,
    anchor: options.anchor ?? null,
    avatar: avatarPath,
  });
}

async function runDemo(options) {
  const outputDir = resolve(options["output-dir"] ?? "artifacts");
  mkdirSync(outputDir, { recursive: true });
  const adapter = getRuntimeAdapter("agentplane");
  const trustedTaskId = options["task-id"] ?? DEFAULT_DEMO_TRUSTED_TASK_ID;
  const trustedSnapshot = extractAgentplaneTaskSnapshot({
    taskId: trustedTaskId,
    profile: loadProfile(options),
  });

  const trustedBundle = adaptRuntimeSnapshot({
    adapter,
    snapshot: trustedSnapshot,
  });
  const rejectedBundle = adaptRuntimeSnapshot({
    adapter,
    snapshot: readJson("examples/agentplane-runtime-failing.json"),
  });

  const trustedRuntimePath = resolve(outputDir, "trusted-runtime.json");
  const trustedBundlePath = resolve(outputDir, "trusted-bundle.json");
  const rejectedBundlePath = resolve(outputDir, "rejected-bundle.json");
  writeJson(trustedRuntimePath, trustedSnapshot);
  writeJson(trustedBundlePath, trustedBundle);
  writeJson(rejectedBundlePath, rejectedBundle);

  const trustedAttestation = createAttestation(trustedBundle);
  const rejectedAttestation = createAttestation(rejectedBundle);

  const trustedAttestationPath = resolve(outputDir, "trusted-attestation.json");
  const rejectedAttestationPath = resolve(
    outputDir,
    "rejected-attestation.json",
  );
  writeJson(trustedAttestationPath, trustedAttestation);
  writeJson(rejectedAttestationPath, rejectedAttestation);

  const trustedVerification = verifyAttestation(trustedAttestation);
  const rejectedVerification = verifyAttestation(rejectedAttestation);
  const trustedAnchor = await anchorAttestation(trustedAttestation);
  const trustedAnchorPath = resolve(outputDir, "trusted-anchor.json");
  writeJson(trustedAnchorPath, trustedAnchor);

  const avatarPath = ensureAvatarPng(outputDir);
  writeText(
    resolve(outputDir, "trusted-report.html"),
    renderAttestationReport({
      attestation: trustedAttestation,
      verification: trustedVerification,
      anchorReceipt: trustedAnchor,
      avatarFileName: avatarPath.split("/").at(-1),
    }),
  );
  writeText(
    resolve(outputDir, "rejected-report.html"),
    renderAttestationReport({
      attestation: rejectedAttestation,
      verification: rejectedVerification,
      avatarFileName: avatarPath.split("/").at(-1),
    }),
  );
  writeText(
    resolve(outputDir, "index.html"),
    buildDemoIndex({
      trusted: trustedAttestation,
      rejected: rejectedAttestation,
      trustedVerification,
      rejectedVerification,
      trustedAnchor,
      trustedTaskId,
    }),
  );

  printSummary({
    command: "demo",
    outputDir,
    trustedTaskId,
    trusted: {
      verdict: trustedVerification.verdict,
      score: trustedVerification.score,
      bundleId: trustedAttestation.inputSurface.bundleId,
      anchorMode: trustedAnchor.submission.mode,
    },
    rejected: {
      verdict: rejectedVerification.verdict,
      score: rejectedVerification.score,
      bundleId: rejectedAttestation.inputSurface.bundleId,
    },
    files: [
      trustedRuntimePath,
      trustedBundlePath,
      rejectedBundlePath,
      trustedAttestationPath,
      rejectedAttestationPath,
      trustedAnchorPath,
      resolve(outputDir, "trusted-report.html"),
      resolve(outputDir, "rejected-report.html"),
      resolve(outputDir, "index.html"),
      avatarPath,
    ],
  });
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);

  switch (command) {
    case "extract":
      runExtract(options);
      return;
    case "generate":
      runGenerate(options);
      return;
    case "adapt":
      runAdapt(options);
      return;
    case "anchor":
      await runAnchor(options);
      return;
    case "verify":
      runVerify(options);
      return;
    case "render":
      runRender(options);
      return;
    case "demo":
      await runDemo(options);
      return;
    default:
      usage();
      process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
