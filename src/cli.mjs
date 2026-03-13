import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getRuntimeAdapter, listRuntimeAdapters } from "./adapters/index.mjs";
import { createAttestation, verifyAttestation } from "./lib/attestation.mjs";
import { ensureAvatarPng } from "./lib/avatar.mjs";
import { canonicalStringify } from "./lib/canonical-json.mjs";
import { buildDemoIndex, renderAttestationReport } from "./lib/report.mjs";
import { adaptRuntimeSnapshot } from "./lib/runtime-adapter.mjs";

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
      "  node src/cli.mjs adapt --adapter <id> --input <runtime-snapshot.json> --output <bundle.json>",
      "  node src/cli.mjs generate --input <artifact-bundle.json> --output <attestation.json>",
      "  node src/cli.mjs verify --input <attestation.json> [--expect trusted|caution|reject]",
      "  node src/cli.mjs render --input <attestation.json> --output <report.html>",
      "  node src/cli.mjs demo [--output-dir artifacts]",
      "",
      `Available adapters: ${listRuntimeAdapters()
        .map((adapter) => adapter.adapterId)
        .join(", ")}`,
    ].join("\n"),
  );
  process.stderr.write("\n");
}

function runAdapt(options) {
  if (!options.adapter || !options.input || !options.output) {
    throw new Error("adapt requires --adapter, --input, and --output");
  }

  const adapter = getRuntimeAdapter(options.adapter);
  const snapshot = readJson(options.input);
  const bundle = adaptRuntimeSnapshot({ adapter, snapshot });
  writeJson(options.output, bundle);

  printSummary({
    command: "adapt",
    adapter: adapter.adapterId,
    runtime: adapter.runtime,
    input: options.input,
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
  const outputPath = resolve(options.output);
  const avatarPath = ensureAvatarPng(dirname(outputPath));
  const html = renderAttestationReport({
    attestation,
    verification,
    avatarFileName: avatarPath.split("/").at(-1),
  });

  writeText(outputPath, html);

  printSummary({
    command: "render",
    input: options.input,
    output: options.output,
    verdict: verification.verdict,
    avatar: avatarPath,
  });
}

function runDemo(options) {
  const outputDir = resolve(options["output-dir"] ?? "artifacts");
  mkdirSync(outputDir, { recursive: true });
  const adapter = getRuntimeAdapter("agentplane");

  const passingBundle = adaptRuntimeSnapshot({
    adapter,
    snapshot: readJson("examples/agentplane-runtime-passing.json"),
  });
  const failingBundle = adaptRuntimeSnapshot({
    adapter,
    snapshot: readJson("examples/agentplane-runtime-failing.json"),
  });

  writeJson(resolve(outputDir, "passing-bundle.json"), passingBundle);
  writeJson(resolve(outputDir, "failing-bundle.json"), failingBundle);

  const passingAttestation = createAttestation(passingBundle);
  const failingAttestation = createAttestation(failingBundle);

  const passingAttestationPath = resolve(outputDir, "passing-attestation.json");
  const failingAttestationPath = resolve(outputDir, "failing-attestation.json");
  writeJson(passingAttestationPath, passingAttestation);
  writeJson(failingAttestationPath, failingAttestation);

  const passingVerification = verifyAttestation(passingAttestation);
  const failingVerification = verifyAttestation(failingAttestation);

  const avatarPath = ensureAvatarPng(outputDir);
  writeText(
    resolve(outputDir, "passing-report.html"),
    renderAttestationReport({
      attestation: passingAttestation,
      verification: passingVerification,
      avatarFileName: avatarPath.split("/").at(-1),
    }),
  );
  writeText(
    resolve(outputDir, "failing-report.html"),
    renderAttestationReport({
      attestation: failingAttestation,
      verification: failingVerification,
      avatarFileName: avatarPath.split("/").at(-1),
    }),
  );
  writeText(
    resolve(outputDir, "index.html"),
    buildDemoIndex({
      passing: passingAttestation,
      failing: failingAttestation,
      passingVerification,
      failingVerification,
    }),
  );

  printSummary({
    command: "demo",
    outputDir,
    passing: {
      verdict: passingVerification.verdict,
      score: passingVerification.score,
      bundleId: passingAttestation.inputSurface.bundleId,
    },
    failing: {
      verdict: failingVerification.verdict,
      score: failingVerification.score,
      bundleId: failingAttestation.inputSurface.bundleId,
    },
    files: [
      resolve(outputDir, "passing-bundle.json"),
      resolve(outputDir, "failing-bundle.json"),
      passingAttestationPath,
      failingAttestationPath,
      resolve(outputDir, "passing-report.html"),
      resolve(outputDir, "failing-report.html"),
      resolve(outputDir, "index.html"),
      avatarPath,
    ],
  });
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);

  switch (command) {
    case "generate":
      runGenerate(options);
      return;
    case "adapt":
      runAdapt(options);
      return;
    case "verify":
      runVerify(options);
      return;
    case "render":
      runRender(options);
      return;
    case "demo":
      runDemo(options);
      return;
    default:
      usage();
      process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
