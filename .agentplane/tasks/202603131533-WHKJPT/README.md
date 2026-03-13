---
id: "202603131533-WHKJPT"
title: "Add universal runtime interoperability profile and openclaw reference adapter"
status: "DOING"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T15:34:42.546Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the stretch interoperability proof with a reference openclaw adapter, canonical fixtures, documentation, and regression coverage while keeping the scope local and runtime-agnostic."
events:
  -
    type: "status"
    at: "2026-03-13T15:34:51.256Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the stretch interoperability proof with a reference openclaw adapter, canonical fixtures, documentation, and regression coverage while keeping the scope local and runtime-agnostic."
doc_version: 3
doc_updated_at: "2026-03-13T15:34:51.257Z"
doc_updated_by: "CODER"
description: "Implement Epic 6 stretch scope with an interoperability profile, openclaw reference adapter, example snapshots, and regression coverage without introducing external runtime dependencies."
id_source: "generated"
---
## Summary

Add universal runtime interoperability profile and openclaw reference adapter

Implement Epic 6 stretch scope with an interoperability profile, openclaw reference adapter, example snapshots, and regression coverage without introducing external runtime dependencies.

## Scope

- In scope: Implement Epic 6 stretch scope with an interoperability profile, openclaw reference adapter, example snapshots, and regression coverage without introducing external runtime dependencies.
- Out of scope: unrelated refactors not required for "Add universal runtime interoperability profile and openclaw reference adapter".

## Plan

1. Add a reference openclaw adapter plus runtime snapshot fixtures that prove the canonical bundle contract works outside agentplane without external dependencies. 2. Document a universal runtime interoperability profile with adapter checklist, supported artifact expectations, and clear observed-vs-inferred boundaries for third-party runtimes. 3. Extend CLI-facing coverage and regression tests so openclaw and agentplane both verify through the same attestation pipeline, then record verification evidence and findings.

## Verify Steps

1. Run `node src/cli.mjs adapt --adapter openclaw --input examples/openclaw-runtime-passing.json --output artifacts/test-openclaw-bundle.json`. Expected: a valid canonical bundle is written with adapter provenance for `openclaw`.
2. Run `node src/cli.mjs generate --input artifacts/test-openclaw-bundle.json --output artifacts/test-openclaw-attestation.json` and `node src/cli.mjs verify --input artifacts/test-openclaw-attestation.json --expect trusted`. Expected: the reference `openclaw` path produces a trusted attestation through the same universal pipeline.
3. Run `npm test`, `agentplane doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: regression coverage passes and repository policy checks remain green.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-03-13

- `node src/cli.mjs adapt --adapter openclaw --input examples/openclaw-runtime-passing.json --output artifacts/test-openclaw-bundle.json`
  - Result: pass
  - Evidence: bundleId=`openclaw-reference-passing`, artifactCount=`6`
- `node src/cli.mjs generate --input artifacts/test-openclaw-bundle.json --output artifacts/test-openclaw-attestation.json`
  - Result: pass
  - Evidence: verdict=`trusted`, score=`90`
- `node src/cli.mjs verify --input artifacts/test-openclaw-attestation.json --expect trusted`
  - Result: pass
  - Evidence: actualVerdict=`trusted`, integrityValid=`true`, warning=`No Base anchor is present.`
- `npm test`
  - Result: pass
  - Evidence: `17` tests passed, `0` failed
- `agentplane doctor`
  - Result: pass
  - Evidence: workflow doctor check OK, findings=`0`
- `node .agentplane/policy/check-routing.mjs`
  - Result: pass
  - Evidence: `policy routing OK`
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The repository now ships a second reference adapter with a deliberately different runtime shape, proving the attestation core does not depend on `agentplane` internals.
- The `openclaw` trusted path reaches `trusted` with score `90` without a Base anchor, which is consistent with the current trust policy and leaves an explicit provenance warning instead of a hidden assumption.
- The `openclaw` adapter is intentionally a local interoperability reference, not a claim of official upstream runtime integration.
