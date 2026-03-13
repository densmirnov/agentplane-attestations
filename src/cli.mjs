import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
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
import { sha256Hex } from "./lib/hash.mjs";
import { buildDemoIndex, renderAttestationReport } from "./lib/report.mjs";
import { adaptRuntimeSnapshot } from "./lib/runtime-adapter.mjs";

const DEFAULT_DEMO_TRUSTED_TASK_ID = "202603131341-YNE1V9";
const DEFAULT_FREEZE_OUTPUT_DIR = "artifacts/freeze";
const FREEZE_DOCS = [
  "README.md",
  "SUBMISSION.md",
  "docs/conversation-log.md",
  "docs/demo-script.md",
  "docs/runtime-interoperability-profile.md",
];

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

function copyFileToOutput(sourcePath, outputPath) {
  mkdirSync(dirname(resolve(outputPath)), { recursive: true });
  copyFileSync(resolve(sourcePath), resolve(outputPath));
}

function printSummary(summary) {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

function gitOutput(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
  }).trim();
}

function describeFile(filePath) {
  const resolvedPath = resolve(filePath);
  const stat = statSync(resolvedPath);
  const content = readFileSync(resolvedPath);
  return {
    path: relative(resolve("."), resolvedPath),
    bytes: stat.size,
    sha256: sha256Hex(content),
  };
}

function resolveTrustedAttestationOverride(options) {
  if (!options["trusted-attestation"]) {
    return null;
  }

  const attestation = readJson(options["trusted-attestation"]);
  const verification = verifyAttestation(attestation);
  if (!verification.integrityValid) {
    throw new Error(
      `trusted attestation override is invalid:\n- ${verification.errors.join("\n- ")}`,
    );
  }

  return {
    attestation,
    verification,
    taskId: attestation.evidence?.task?.id ?? null,
    sourcePath: resolve(options["trusted-attestation"]),
  };
}

function resolveTrustedAnchorOverride(attestation, options) {
  if (!options["trusted-anchor"]) {
    return null;
  }

  const anchorReceipt = readJson(options["trusted-anchor"]);
  const validation = validateAttestationAnchorReceipt(
    attestation,
    anchorReceipt,
  );
  if (!validation.valid) {
    throw new Error(
      `trusted anchor override does not match the attestation:\n- ${validation.errors.join("\n- ")}`,
    );
  }

  return {
    receipt: anchorReceipt,
    sourcePath: resolve(options["trusted-anchor"]),
  };
}

async function buildDemoArtifacts(options) {
  const outputDir = resolve(options["output-dir"] ?? "artifacts");
  mkdirSync(outputDir, { recursive: true });
  const adapter = getRuntimeAdapter("agentplane");
  const trustedAttestationOverride = resolveTrustedAttestationOverride(options);
  if (
    options["task-id"] &&
    trustedAttestationOverride?.taskId &&
    options["task-id"] !== trustedAttestationOverride.taskId
  ) {
    throw new Error(
      `trusted attestation override taskId ${trustedAttestationOverride.taskId} does not match --task-id ${options["task-id"]}.`,
    );
  }
  const trustedTaskId =
    options["task-id"] ??
    trustedAttestationOverride?.taskId ??
    DEFAULT_DEMO_TRUSTED_TASK_ID;
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

  const generatedTrustedAttestation = createAttestation(trustedBundle);
  if (
    trustedAttestationOverride &&
    trustedAttestationOverride.attestation.integrity.evidenceDigest !==
      generatedTrustedAttestation.integrity.evidenceDigest
  ) {
    throw new Error(
      "trusted attestation override does not match the current task extraction evidence.",
    );
  }
  const trustedAttestation =
    trustedAttestationOverride?.attestation ?? generatedTrustedAttestation;
  const rejectedAttestation = createAttestation(rejectedBundle);

  const trustedAttestationPath = resolve(outputDir, "trusted-attestation.json");
  const rejectedAttestationPath = resolve(
    outputDir,
    "rejected-attestation.json",
  );
  writeJson(trustedAttestationPath, trustedAttestation);
  writeJson(rejectedAttestationPath, rejectedAttestation);

  const trustedVerification =
    trustedAttestationOverride?.verification ??
    verifyAttestation(trustedAttestation);
  const rejectedVerification = verifyAttestation(rejectedAttestation);
  const preparedAnchor = await anchorAttestation(trustedAttestation);
  const trustedAnchorOverride = resolveTrustedAnchorOverride(
    trustedAttestation,
    options,
  );
  const trustedAnchor = trustedAnchorOverride?.receipt ?? preparedAnchor;
  const trustedAnchorPath = resolve(outputDir, "trusted-anchor.json");
  writeJson(trustedAnchorPath, trustedAnchor);

  const avatarPath = ensureAvatarPng(outputDir);
  const trustedReportPath = resolve(outputDir, "trusted-report.html");
  const rejectedReportPath = resolve(outputDir, "rejected-report.html");
  const indexPath = resolve(outputDir, "index.html");

  writeText(
    trustedReportPath,
    renderAttestationReport({
      attestation: trustedAttestation,
      verification: trustedVerification,
      anchorReceipt: trustedAnchor,
      avatarFileName: avatarPath.split("/").at(-1),
    }),
  );
  writeText(
    rejectedReportPath,
    renderAttestationReport({
      attestation: rejectedAttestation,
      verification: rejectedVerification,
      avatarFileName: avatarPath.split("/").at(-1),
    }),
  );
  writeText(
    indexPath,
    buildDemoIndex({
      trusted: trustedAttestation,
      rejected: rejectedAttestation,
      trustedVerification,
      rejectedVerification,
      trustedAnchor,
      trustedTaskId,
    }),
  );

  return {
    outputDir,
    trustedTaskId,
    trustedSnapshot,
    trustedBundle,
    rejectedBundle,
    trustedAttestation,
    rejectedAttestation,
    trustedVerification,
    rejectedVerification,
    trustedAnchor,
    trustedAnchorSourcePath: trustedAnchorOverride?.sourcePath ?? null,
    trustedAttestationSourcePath:
      trustedAttestationOverride?.sourcePath ?? null,
    files: {
      trustedRuntimePath,
      trustedBundlePath,
      rejectedBundlePath,
      trustedAttestationPath,
      rejectedAttestationPath,
      trustedAnchorPath,
      trustedReportPath,
      rejectedReportPath,
      indexPath,
      avatarPath,
    },
  };
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
      `  node src/cli.mjs freeze [--task-id ${DEFAULT_DEMO_TRUSTED_TASK_ID}] [--output-dir ${DEFAULT_FREEZE_OUTPUT_DIR}] [--trusted-attestation <attestation.json>] [--trusted-anchor <anchor.json>]`,
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
  const demo = await buildDemoArtifacts(options);

  printSummary({
    command: "demo",
    outputDir: demo.outputDir,
    trustedTaskId: demo.trustedTaskId,
    trusted: {
      verdict: demo.trustedVerification.verdict,
      score: demo.trustedVerification.score,
      bundleId: demo.trustedAttestation.inputSurface.bundleId,
      anchorMode: demo.trustedAnchor.submission.mode,
    },
    rejected: {
      verdict: demo.rejectedVerification.verdict,
      score: demo.rejectedVerification.score,
      bundleId: demo.rejectedAttestation.inputSurface.bundleId,
    },
    files: [
      demo.files.trustedRuntimePath,
      demo.files.trustedBundlePath,
      demo.files.rejectedBundlePath,
      demo.files.trustedAttestationPath,
      demo.files.rejectedAttestationPath,
      demo.files.trustedAnchorPath,
      demo.files.trustedReportPath,
      demo.files.rejectedReportPath,
      demo.files.indexPath,
      demo.files.avatarPath,
    ],
  });
}

function buildFreezeManifest({ freezeDir, demo, copiedDocs }) {
  const repoRoot = resolve(".");
  const freezeFiles = [
    demo.files.trustedRuntimePath,
    demo.files.trustedBundlePath,
    demo.files.rejectedBundlePath,
    demo.files.trustedAttestationPath,
    demo.files.rejectedAttestationPath,
    demo.files.trustedAnchorPath,
    demo.files.trustedReportPath,
    demo.files.rejectedReportPath,
    demo.files.indexPath,
    demo.files.avatarPath,
    ...copiedDocs.map((doc) => doc.outputPath),
  ];

  return {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    command: "freeze",
    freezeDir: relative(repoRoot, freezeDir),
    repo: {
      branch: gitOutput(["rev-parse", "--abbrev-ref", "HEAD"]),
      commit: gitOutput(["rev-parse", "HEAD"]),
      cleanTrackedWorktree:
        gitOutput(["status", "--short", "--untracked-files=no"]) === "",
    },
    trustedTaskId: demo.trustedTaskId,
    trusted: {
      attestationId: demo.trustedAttestation.attestationId,
      verdict: demo.trustedVerification.verdict,
      score: demo.trustedVerification.score,
      bundleId: demo.trustedAttestation.inputSurface.bundleId,
    },
    rejected: {
      attestationId: demo.rejectedAttestation.attestationId,
      verdict: demo.rejectedVerification.verdict,
      score: demo.rejectedVerification.score,
      bundleId: demo.rejectedAttestation.inputSurface.bundleId,
    },
    anchor: {
      mode: demo.trustedAnchor.submission.mode,
      status: demo.trustedAnchor.submission.status,
      txHash: demo.trustedAnchor.submission.txHash,
      txUrl: demo.trustedAnchor.submission.txUrl,
      source:
        demo.trustedAnchorSourcePath !== null
          ? relative(repoRoot, demo.trustedAnchorSourcePath)
          : "generated-during-freeze",
    },
    trustedAttestation: {
      source:
        demo.trustedAttestationSourcePath !== null
          ? relative(repoRoot, demo.trustedAttestationSourcePath)
          : "generated-during-freeze",
    },
    documents: copiedDocs.map((doc) => ({
      source: doc.sourcePath,
      path: relative(repoRoot, doc.outputPath),
    })),
    files: freezeFiles.map(describeFile),
  };
}

async function runFreeze(options) {
  const freezeDir = resolve(options["output-dir"] ?? DEFAULT_FREEZE_OUTPUT_DIR);
  const demo = await buildDemoArtifacts({
    ...options,
    "output-dir": freezeDir,
  });

  const copiedDocs = FREEZE_DOCS.map((sourcePath) => {
    const outputPath = resolve(freezeDir, sourcePath);
    copyFileToOutput(sourcePath, outputPath);
    return {
      sourcePath,
      outputPath,
    };
  });

  const manifest = buildFreezeManifest({
    freezeDir,
    demo,
    copiedDocs,
  });
  const manifestPath = resolve(freezeDir, "freeze-manifest.json");
  writeJson(manifestPath, manifest);

  printSummary({
    command: "freeze",
    outputDir: freezeDir,
    manifest: manifestPath,
    trustedTaskId: demo.trustedTaskId,
    trustedVerdict: demo.trustedVerification.verdict,
    rejectedVerdict: demo.rejectedVerification.verdict,
    anchor: manifest.anchor,
    trustedAttestation: manifest.trustedAttestation,
    documentCount: copiedDocs.length,
    fileCount: manifest.files.length,
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
    case "freeze":
      await runFreeze(options);
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
