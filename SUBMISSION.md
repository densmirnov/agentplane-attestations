# Submission Pack

## Project

**Name:** `agentplane Attestations`

**One-line summary:**  
A trust gate for agent-delivered work that turns execution evidence into portable attestations so humans and downstream agents can decide whether a result should be accepted, reviewed, or refused.

## Problem

Most agent workflows show output, not trust.

If an agent changes code, a human, CI pipeline, or another agent still needs to answer:

- was the scope explicitly approved
- did the agent actually execute the claimed work
- did the required checks pass
- is there portable provenance for what happened

Without that layer, agent output is hard to trust operationally.

## Solution

`agentplane Attestations` converts task evidence into a verifiable attestation with:

- explicit scope and approval evidence
- execution proof and changed-file evidence
- verification results
- portable trust verdicts (`trusted`, `caution`, `reject`)
- Base-linked attestation-digest anchoring

The negative path is first-class: the system is designed to refuse trust when evidence is insufficient.

## Why This Fits Synthesis

- Theme fit: `Agents that trust`
- Product fit: trust adjudication for agent output instead of another generic coding agent
- Utility fit: the same layer can be embedded back into `agentplane`
- Extensibility fit: the attestation core is runtime-agnostic and adapter-based

## What Ships Today

- canonical artifact-bundle input format
- universal attestation core
- built-in `agentplane` runtime adapter
- real `agentplane` task extraction path
- trust-policy evaluation
- trusted and rejected demo paths
- confirmed Base attestation-digest anchor for the trusted path
- judge-facing demo surface and walkthrough

## Architecture Summary

The shipped layering is:

1. runtime-native snapshot
2. runtime adapter
3. canonical artifact bundle
4. attestation core
5. trust verification and report rendering
6. optional Base anchor receipt for the attestation digest

Core repository references:

- runtime adapter contract: `docs/runtime-adapter-contract.md`
- universal layer summary: `docs/universal-attestation-layer.md`
- canonical bundle format: `docs/artifact-bundle.md`

## On-Chain Evidence

### Registration Identity

- Synthesis registration anchor:
  `https://basescan.org/tx/0x2f06bc4d286d50e20aa55e4fc6bdb762c20cf219298be55aa688955c53e4230e`

This is the agent's hackathon registration identity anchor on Base.

### Attestation Anchor

- confirmed attestation anchor:
  `https://basescan.org/tx/0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934`

Important boundary:

- only the attestation digest is anchored on Base
- the full attestation payload remains off-chain
- the anchor receipt is a sidecar artifact, not part of the immutable attestation core

## Judge Asset Map

- Demo entrypoint: `artifacts/index.html`
- Trusted report: `artifacts/trusted-report.html`
- Rejected report: `artifacts/rejected-report.html`
- Trusted attestation JSON: `artifacts/trusted-attestation.json`
- Trusted anchor receipt: `artifacts/trusted-anchor.json`
- Demo walkthrough: `docs/demo-script.md`
- Conversation evidence map: `docs/conversation-log.md`

## Repro Commands

Requirements:

- Node.js 24+

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm test
```

Generate the demo:

```bash
npm run demo
```

Freeze the final submission pack:

```bash
npm run freeze
```

Open:

- `artifacts/index.html`
- `artifacts/freeze/freeze-manifest.json`

Optional: regenerate a live Base anchor if a funded signer env is available:

```bash
node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit
node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html
```

The submit path accepts either `BASE_PRIVATE_KEY` or `BASE_DEPLOYER_PRIVATE_KEY`.

If a trusted attestation and its matching anchor already exist and you want the freeze bundle to snapshot that exact pair, run:

```bash
node src/cli.mjs freeze --trusted-attestation artifacts/trusted-attestation.json --trusted-anchor artifacts/trusted-anchor.json
```

## Submission-Time Repo Hygiene Checklist

Confirmed now:

- [x] Demo is reproducible from repository commands.
- [x] Trusted path is derived from a real completed `agentplane` task.
- [x] Rejected path is preserved as a first-class negative case.
- [x] A confirmed Base attestation anchor exists for the trusted path.
- [x] Conversation evidence is discoverable through task artifacts and commits.
- [x] Secrets are gitignored (`.env`, `node_modules`, generated artifacts).

Confirm before pressing submit:

- [ ] Repository remote is public and accessible to judges.
- [ ] Submission text matches shipped behavior and does not overclaim on-chain coverage.
- [ ] If the form requests a `conversationLog`, use the path strategy in `docs/conversation-log.md`.
- [ ] Demo assets are regenerated from the latest clean checkout if code changed after this pack.

## Suggested Submission Framing

If a form asks for a short description:

> agentplane Attestations is a trust gate for agent-delivered work. It turns approved scope, execution evidence, verification results, and portable provenance into attestations that tell humans and downstream agents whether a result should be accepted, reviewed, or refused.

If a form asks for technical differentiation:

> The project separates runtime-native evidence from canonical trust evaluation. A built-in `agentplane` adapter already emits compatible bundles, and the same attestation core can be reused by other runtimes through the adapter contract without inheriting `agentplane` internals.
