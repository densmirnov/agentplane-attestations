# agentplane Attestations

`agentplane Attestations` turns agent work into portable trust artifacts.

The MVP builds a verifiable attestation from local execution evidence, scores its trustworthiness against explicit policy rules, and renders a lightweight demo report for hackathon walkthroughs.

The canonical input surface is now an `artifact bundle`: a typed, immutable-style collection of raw artifacts from which trust claims are derived.
Above that, the repository now exposes a runtime-agnostic universal layer so different systems can plug in through adapters instead of hard-coding runtime logic into the attestation core.

## Why this fits Synthesis

- Theme fit: `Agents that trust`
- Demo fit: one successful attestation and one rejected attestation
- Utility fit: the same trust layer can be embedded back into `agentplane`
- Extensibility fit: non-`agentplane` runtimes can integrate by implementing the adapter contract

## MVP shape

The current MVP is intentionally narrow:

- ingest a canonical artifact bundle from JSON
- accept runtime-native snapshots through adapters and convert them into canonical bundles
- extract a real completed `agentplane` task into a runtime snapshot before adaptation
- generate a signed-style attestation object with stable hashes
- derive a deterministic attestation-specific Base anchor payload from the attestation digest
- verify the attestation against explicit trust policy rules
- render a static HTML report for demo use
- show a negative path where trust is rejected

Out of scope for this iteration:

- production deployment
- wallet UX
- multi-agent networking
- contract deployment or custom on-chain protocol design

## Commands

Requirements:

- Node.js 24+

Run the full demo:

```bash
npm run demo
```

By default the trusted demo path is generated from the real completed `agentplane` task `202603131341-YNE1V9`.
The rejected path stays a controlled negative fixture so the product can demonstrate both acceptance and refusal.

Run tests:

```bash
npm test
```

Generate only the fixture-based passing attestation:

```bash
npm run attest:pass
```

Prepare a fixture-based Base anchor receipt from the attestation digest:

```bash
npm run anchor:pass
```

Adapt a passing fixture `agentplane` runtime snapshot into a canonical bundle:

```bash
npm run adapt:agentplane:pass
```

Extract a real completed `agentplane` task into a runtime snapshot:

```bash
npm run extract:agentplane:task
```

Adapt a real completed `agentplane` task directly into a canonical bundle:

```bash
npm run adapt:agentplane:task
```

Verify only the fixture-based passing attestation:

```bash
npm run verify:pass
```

Render the fixture-based passing report:

```bash
npm run report:pass
```

Render the trusted demo report with its attestation-specific Base anchor receipt:

```bash
node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html
```

Generate a live Base transaction for an attestation digest:

```bash
BASE_DEPLOYER_PRIVATE_KEY=0x... node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit
```

If `BASE_RPC_URL` is unset, the command uses the default public Base RPC from `viem`.
The submit path accepts either `BASE_PRIVATE_KEY` or `BASE_DEPLOYER_PRIVATE_KEY`.
Only the attestation digest is intended for on-chain anchoring. The full attestation payload remains off-chain.

## Output

Generated files land in `artifacts/`:

- `trusted-runtime.json`
- `trusted-bundle.json`
- `rejected-bundle.json`
- `trusted-attestation.json`
- `rejected-attestation.json`
- `trusted-anchor.json`
- `trusted-report.html`
- `rejected-report.html`
- `index.html`
- `agentplane-avatar.png`

## Demo story

1. Open `artifacts/index.html`.
2. Show the trusted path generated from a real completed `agentplane` task with approved scope, execution evidence, verification checks, and a prepared or confirmed Base digest anchor.
3. Show the existing Base registration anchor as separate provenance, not as a substitute for attestation anchoring.
4. Show the rejected path with missing approval and failed checks.
5. Explain that the product value is not logging. It is policy-backed trust adjudication that can be consumed by humans, CI, and downstream agents.
6. Explain that the same attestation core works through a built-in `agentplane` adapter today and through third-party adapters later.

A concise walkthrough is available in [docs/demo-script.md](/Users/densmirnov/Desktop/synthesis-hackathon/docs/demo-script.md).

## Base Anchor Model

The on-chain unit is deliberately narrow:

- the attestation digest is the anchor subject
- the transaction calldata is a deterministic `agentplane-attestation:v1:<digest>` message
- the anchor receipt is stored as a sidecar artifact, not merged back into the attestation core
- the report can render both the attestation and its anchor receipt together

This keeps the attestation immutable while still linking it to a public Base transaction when signer credentials are available.

## Canonical Input Format

The primary ingestion path is the artifact bundle described in [docs/artifact-bundle.md](/Users/densmirnov/Desktop/synthesis-hackathon/docs/artifact-bundle.md).

Machine-readable schema:

- [schemas/artifact-bundle.schema.json](/Users/densmirnov/Desktop/synthesis-hackathon/schemas/artifact-bundle.schema.json)

The bundle is intentionally evidence-first:

- input artifacts capture observations, approvals, execution traces, verification checks, anchors, and notes
- trust score and verdict are derived by the attestor and are not valid input artifacts
- each artifact has its own identity, producer, timestamp, subject reference, and payload

## Universal Layer

The runtime-agnostic layer is described in [docs/universal-attestation-layer.md](/Users/densmirnov/Desktop/synthesis-hackathon/docs/universal-attestation-layer.md).

The adapter contract is described in [docs/runtime-adapter-contract.md](/Users/densmirnov/Desktop/synthesis-hackathon/docs/runtime-adapter-contract.md).

The intended layering is:

1. runtime-native snapshot
2. runtime adapter
3. canonical artifact bundle
4. attestation core
5. trust verification and report rendering

Built-in today:

- `agentplane` adapter
- `agentplane` task extractor for `.agentplane/tasks/<id>/README.md` plus git commit evidence

Target for future integrations:

- `openclaw`
- any other agent runtime that can export enough provenance to satisfy the adapter contract
