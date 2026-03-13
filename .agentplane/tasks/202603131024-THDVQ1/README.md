---
id: "202603131024-THDVQ1"
title: "Extract universal attestation layer and runtime adapter contract"
result_summary: "Extracted the universal attestation layer and first runtime adapter contract for future multi-runtime integrations."
status: "DONE"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T10:25:02.306Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T10:44:12.607Z"
  updated_by: "CODER"
  note: "The repository now separates a universal attestation layer from runtime adapters, ships a built-in agentplane adapter, preserves direct bundle ingestion, and documents openclaw-style future integrations through the adapter contract."
commit:
  hash: "5a9d8c57afbe78a193f48bec679e6c4e758c16c0"
  message: "✨ THDVQ1 task: extract universal attestation layer and adapter contract"
comments:
  -
    author: "CODER"
    body: "Start: extract a runtime-agnostic attestation layer, formalize a runtime adapter contract, and add the first built-in agentplane adapter without baking runtime logic into the core."
  -
    author: "CODER"
    body: "Verified: the project now exposes a runtime-agnostic attestation layer, a formal adapter contract, and a built-in agentplane adapter while keeping the canonical bundle path intact."
events:
  -
    type: "status"
    at: "2026-03-13T10:25:16.707Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract a runtime-agnostic attestation layer, formalize a runtime adapter contract, and add the first built-in agentplane adapter without baking runtime logic into the core."
  -
    type: "verify"
    at: "2026-03-13T10:44:12.607Z"
    author: "CODER"
    state: "ok"
    note: "The repository now separates a universal attestation layer from runtime adapters, ships a built-in agentplane adapter, preserves direct bundle ingestion, and documents openclaw-style future integrations through the adapter contract."
  -
    type: "status"
    at: "2026-03-13T10:44:26.100Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: the project now exposes a runtime-agnostic attestation layer, a formal adapter contract, and a built-in agentplane adapter while keeping the canonical bundle path intact."
doc_version: 3
doc_updated_at: "2026-03-13T10:44:26.101Z"
doc_updated_by: "CODER"
description: "Make the attestation system runtime-agnostic by defining a universal layer above artifact bundles, formalizing an adapter contract for runtimes like agentplane or openclaw, and shipping the first built-in agentplane adapter."
id_source: "generated"
---
## Summary

Make the attestation system runtime-agnostic by defining a universal layer above artifact bundles, formalizing an adapter contract for runtimes like `agentplane` or `openclaw`, and shipping the first built-in `agentplane` adapter.

## Scope

In scope: universal layer specification, runtime adapter contract, generic adapter helpers, first-party `agentplane` adapter, adapter-driven fixtures, and CLI/test coverage for the adapter path.

Out of scope: hard-coding or inventing `openclaw` internals, external network integrations, or production-grade package publishing.

## Plan

1. Define a runtime-agnostic attestation layer above the canonical artifact bundle.
2. Document an adapter contract that any runtime can implement to emit compatible artifact bundles.
3. Implement generic adapter helpers plus the first built-in agentplane adapter.
4. Update CLI, fixtures, and tests so the project can build attestations through the adapter path as well as direct bundle ingestion.

## Verify Steps

1. Confirm the repository contains written docs that separate the universal attestation layer from runtime-specific adapters.
2. Run the adapter path for the built-in `agentplane` adapter and confirm it emits a canonical artifact bundle and a valid attestation.
3. Run tests that cover generic adapter helpers, adapter normalization, and end-to-end trusted/rejected behavior.
4. Confirm the CLI and examples present runtime adapters as the extension mechanism for non-`agentplane` systems instead of embedding runtime-specific logic in the core format.

## Verification

Pre-execution baseline: the repository already had a universal artifact bundle, but the product surface still conflated the attestation core with the `agentplane` runtime, which weakens future reuse by systems like `openclaw`.

- Command: `rg -n "universal layer|runtime adapter|openclaw|agentplane adapter|canonical input surface" README.md docs src`
- Result: pass
- Evidence: repository docs now explicitly separate universal layer, runtime adapter contract, canonical bundle, and name `openclaw` only as a future adapter target rather than embedded runtime logic.
- Scope: architectural separation and documentation contract.

- Command: `npm run adapt:agentplane:pass`
- Result: pass
- Evidence: built-in `agentplane` adapter emitted `artifacts/passing-bundle.json` with `bundleId=bundle-passing-demo` and `artifactCount=7`.
- Scope: adapter-driven bundle generation path.

- Command: `npm run demo`
- Result: pass
- Evidence: end-to-end demo produced trusted and rejected attestations through the built-in `agentplane` adapter path.
- Scope: adapter -> bundle -> attestation -> report flow.

- Command: `npm test`
- Result: pass
- Evidence: `5` tests passed, including bundle validation, direct bundle attestation, adapter bundle emission, and adapter-driven trusted attestation.
- Scope: regression coverage for universal core and adapter layer.

- Command: `npm run attest:pass`
- Result: pass
- Evidence: direct canonical-bundle ingestion still generates a trusted attestation, so the new adapter layer did not break the existing universal input path.
- Scope: backward-compatible direct bundle path.

- Command: `rg -n "Input surface|adapter:" artifacts/passing-report.html artifacts/failing-report.html`
- Result: pass
- Evidence: generated reports expose `Input surface` and show `adapter: agentplane (agentplane)` for both trusted and rejected examples.
- Scope: adapter provenance on the demo surface.

<!-- BEGIN VERIFICATION RESULTS -->
#### 2026-03-13T10:44:12.607Z — VERIFY — ok

By: CODER

Note: The repository now separates a universal attestation layer from runtime adapters, ships a built-in agentplane adapter, preserves direct bundle ingestion, and documents openclaw-style future integrations through the adapter contract.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T10:25:16.708Z, excerpt_hash=sha256:55198491f97fbced22e41974fc936800735ff6abc8db440bb3d231e87e7ae7d8

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove the adapter contract and runtime adapter files, restore the prior direct bundle-only flow, and rerun the existing demo/tests to confirm the previous ingestion path still works.

## Findings

The architectural risk is still semantic leakage, but the repository now has a concrete guardrail against it: runtime-native snapshots live behind adapters, while the attestation core only sees canonical bundles. The next weak link is vocabulary governance. If future integrations overload `intent`, `approval`, or `verification` with incompatible meanings, the layer will fragment despite shared JSON shape. The right next step is to stabilize a small interoperability profile and keep runtime-specific richness in adapter-owned extensions rather than the universal core.
