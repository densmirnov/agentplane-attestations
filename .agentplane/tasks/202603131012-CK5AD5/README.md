---
id: "202603131012-CK5AD5"
title: "Formalize universal artifact bundle for agent attestations"
result_summary: "Formalized artifact bundle as the canonical attestation input format and wired the MVP to consume it."
status: "DONE"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T10:14:01.926Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T10:22:00.181Z"
  updated_by: "CODER"
  note: "The Attestations MVP now treats artifact bundle as the canonical input surface, documents the bundle contract, validates bundle structure, and generates attestations from bundle-based fixtures."
commit:
  hash: "b7b5544476fcd7a874a22be7fde95364630936a2"
  message: "✨ CK5AD5 task: formalize universal artifact bundle input"
comments:
  -
    author: "CODER"
    body: "Start: formalize the universal artifact bundle, implement canonical ingestion, and update the Attestations MVP to consume bundle-based inputs."
  -
    author: "CODER"
    body: "Verified: the project now defines a universal artifact-bundle input contract, validates it, and generates attestations from canonical bundle fixtures instead of ad hoc evidence JSON."
events:
  -
    type: "status"
    at: "2026-03-13T10:14:19.305Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: formalize the universal artifact bundle, implement canonical ingestion, and update the Attestations MVP to consume bundle-based inputs."
  -
    type: "verify"
    at: "2026-03-13T10:22:00.181Z"
    author: "CODER"
    state: "ok"
    note: "The Attestations MVP now treats artifact bundle as the canonical input surface, documents the bundle contract, validates bundle structure, and generates attestations from bundle-based fixtures."
  -
    type: "status"
    at: "2026-03-13T10:22:11.045Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: the project now defines a universal artifact-bundle input contract, validates it, and generates attestations from canonical bundle fixtures instead of ad hoc evidence JSON."
doc_version: 3
doc_updated_at: "2026-03-13T10:22:11.047Z"
doc_updated_by: "CODER"
description: "Define a reusable input format for agent evidence artifacts, document its invariants, and teach the Attestations MVP to consume the bundle format as the canonical input surface."
id_source: "generated"
---
## Summary

Define a reusable bundle format for agent evidence artifacts, document its invariants, and make it the canonical input surface for `agentplane Attestations`.

## Scope

In scope: formal specification for the bundle contract, machine-readable schemas, normalization/validation code, updated fixtures, and attestation generation from the canonical bundle format.

Out of scope: production signing, external interoperability negotiations, or non-essential UI changes.

## Plan

1. Define a universal artifact bundle contract and its core invariants.
2. Document the bundle structure and add machine-readable schema files.
3. Implement bundle normalization and validation so the CLI can generate attestations from canonical artifact inputs.
4. Update fixtures and tests to cover both valid bundle ingestion and policy behavior.

## Verify Steps

1. Validate that the repository contains a written artifact-bundle spec and machine-readable schemas for the canonical input format.
2. Run the CLI against bundle-based fixtures and confirm it generates attestations from the new canonical input surface.
3. Run tests that cover bundle normalization/validation and confirm trusted vs rejected policy behavior still works.
4. Confirm the README and examples describe the bundle format as the primary ingestion path rather than ad hoc evidence JSON.

## Verification

Pre-execution baseline: the MVP accepted ad hoc evidence-shaped JSON fixtures directly, which made the input format tightly coupled to the current policy model and weak as a reusable inter-agent contract.

- Command: `ls -1 schemas docs examples`
- Result: pass
- Evidence: repository now contains `docs/artifact-bundle.md`, `schemas/artifact-bundle.schema.json`, `examples/passing-bundle.json`, and `examples/failing-bundle.json`.
- Scope: written specification and machine-readable schema presence.

- Command: `npm run attest:pass`
- Result: pass
- Evidence: CLI generated an attestation from `examples/passing-bundle.json` with `inputType=artifact-bundle`, `bundleId=bundle-passing-demo`, verdict `trusted`, and score `100`.
- Scope: canonical bundle ingestion via generation path.

- Command: `npm test`
- Result: pass
- Evidence: `3` tests passed; coverage includes passing bundle, failing bundle, and malformed bundle rejection.
- Scope: bundle validation, normalization, and trust-policy behavior.

- Command: `npm run demo`
- Result: pass
- Evidence: demo output reports `bundle-passing-demo` as `trusted` and `bundle-failing-demo` as `reject`, and regenerates the HTML reports plus attestation JSON files.
- Scope: end-to-end demo pipeline from bundle fixtures.

- Command: `rg -n "canonical input|artifact bundle|passing-bundle|artifact-bundle.schema.json" README.md docs/artifact-bundle.md package.json`
- Result: pass
- Evidence: README, docs, and package scripts all point to artifact bundle as the canonical input surface.
- Scope: documentation and examples alignment.

<!-- BEGIN VERIFICATION RESULTS -->
#### 2026-03-13T10:22:00.181Z — VERIFY — ok

By: CODER

Note: The Attestations MVP now treats artifact bundle as the canonical input surface, documents the bundle contract, validates bundle structure, and generates attestations from bundle-based fixtures.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T10:14:19.306Z, excerpt_hash=sha256:92240fb5835026a17873e56617dd1a15a5c116200a7745a0066f03faa8a9f53b

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove the new schema/spec/normalization files, restore the prior fixture format, and rerun the demo/tests to confirm the previous ingestion path still works.

## Findings

The current weak point is no longer raw format ambiguity, but semantic governance. The repository now has a canonical artifact bundle, yet “universal” still depends on which artifact kinds are standardized across runtimes. The strongest next move is to freeze a minimal interoperable vocabulary around `intent`, `approval`, `execution`, `verification`, `conversation`, `anchor`, and `note`, and keep product-specific trust logic downstream from that layer.
