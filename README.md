# agentplane Attestations

`agentplane Attestations` turns agent work into portable trust artifacts.

The MVP builds a verifiable attestation from local execution evidence, scores its trustworthiness against explicit policy rules, and renders a lightweight demo report for hackathon walkthroughs.

The canonical input surface is now an `artifact bundle`: a typed, immutable-style collection of raw artifacts from which trust claims are derived.

## Why this fits Synthesis

- Theme fit: `Agents that trust`
- Demo fit: one successful attestation and one rejected attestation
- Utility fit: the same trust layer can be embedded back into `agentplane`

## MVP shape

The current MVP is intentionally narrow:

- ingest a canonical artifact bundle from JSON
- generate a signed-style attestation object with stable hashes
- verify the attestation against explicit trust policy rules
- render a static HTML report for demo use
- show a negative path where trust is rejected

Out of scope for this iteration:

- production deployment
- wallet UX
- multi-agent networking
- live on-chain writes beyond the existing hackathon registration anchor

## Commands

Requirements:

- Node.js 24+

Run the full demo:

```bash
npm run demo
```

Run tests:

```bash
npm test
```

Generate only the passing attestation:

```bash
npm run attest:pass
```

Verify only the passing attestation:

```bash
npm run verify:pass
```

Render the passing demo page:

```bash
npm run report:pass
```

## Output

Generated files land in `artifacts/`:

- `passing-attestation.json`
- `failing-attestation.json`
- `passing-report.html`
- `failing-report.html`
- `index.html`
- `agentplane-avatar.png`

## Demo story

1. Show a passing attestation with approved scope, execution evidence, verification checks, and a Base registration anchor.
2. Show a failing attestation with missing approval and failed checks.
3. Explain that the product value is not logging. It is policy-backed trust adjudication that can be consumed by humans, CI, and downstream agents.

## Canonical Input Format

The primary ingestion path is the artifact bundle described in [docs/artifact-bundle.md](/Users/densmirnov/Desktop/synthesis-hackathon/docs/artifact-bundle.md).

Machine-readable schema:

- [schemas/artifact-bundle.schema.json](/Users/densmirnov/Desktop/synthesis-hackathon/schemas/artifact-bundle.schema.json)

The bundle is intentionally evidence-first:

- input artifacts capture observations, approvals, execution traces, verification checks, anchors, and notes
- trust score and verdict are derived by the attestor and are not valid input artifacts
- each artifact has its own identity, producer, timestamp, subject reference, and payload
