---
id: "202603131341-YNE1V9"
title: "Add attestation-specific Base anchor flow"
status: "DOING"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T13:42:36.230Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T14:16:19.491Z"
  updated_by: "CODER"
  note: "Command: npm test | Result: pass | Evidence: 12 tests passed including anchor flow coverage. Scope: attestation core and Base anchor helpers. Command: npm run demo | Result: pass | Evidence: generated passing and failing demo artifacts plus passing-anchor.json. Scope: integrated demo path. Command: node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor.json | Result: pass | Evidence: wrote deterministic prepared anchor receipt for the passing attestation. Scope: attestation-specific digest anchor generation. Command: node src/cli.mjs render --input artifacts/passing-attestation.json --anchor artifacts/passing-anchor.json --output artifacts/passing-report.html | Result: pass | Evidence: report rendered with explicit digest-only on-chain disclaimer. Scope: report linkage. Command: node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor-submit.json --submit | Result: fail | Evidence: exited with BASE_PRIVATE_KEY required error, proving fail-closed live submit behavior. Scope: signer-secret guardrail. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implementing attestation-specific Base anchor flow with deterministic digest/payload generation, optional live write when signer env is present, report linkage, tests, and docs updates."
events:
  -
    type: "status"
    at: "2026-03-13T13:42:53.626Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing attestation-specific Base anchor flow with deterministic digest/payload generation, optional live write when signer env is present, report linkage, tests, and docs updates."
  -
    type: "verify"
    at: "2026-03-13T14:16:19.491Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm test | Result: pass | Evidence: 12 tests passed including anchor flow coverage. Scope: attestation core and Base anchor helpers. Command: npm run demo | Result: pass | Evidence: generated passing and failing demo artifacts plus passing-anchor.json. Scope: integrated demo path. Command: node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor.json | Result: pass | Evidence: wrote deterministic prepared anchor receipt for the passing attestation. Scope: attestation-specific digest anchor generation. Command: node src/cli.mjs render --input artifacts/passing-attestation.json --anchor artifacts/passing-anchor.json --output artifacts/passing-report.html | Result: pass | Evidence: report rendered with explicit digest-only on-chain disclaimer. Scope: report linkage. Command: node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor-submit.json --submit | Result: fail | Evidence: exited with BASE_PRIVATE_KEY required error, proving fail-closed live submit behavior. Scope: signer-secret guardrail. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
doc_version: 3
doc_updated_at: "2026-03-13T14:16:19.492Z"
doc_updated_by: "CODER"
description: "Implement deterministic attestation digest anchoring with optional live Base write, report linkage, and docs without overstating on-chain coverage."
id_source: "generated"
---
## Summary

Add attestation-specific Base anchor flow

Implement deterministic attestation digest anchoring with optional live Base write, report linkage, and docs without overstating on-chain coverage.

## Scope

- In scope: Implement deterministic attestation digest anchoring with optional live Base write, report linkage, and docs without overstating on-chain coverage.
- In scope: Support offline digest and payload generation even when no Base signer environment is configured.
- Out of scope: unrelated refactors not required for "Add attestation-specific Base anchor flow".
- Out of scope: wallet UX, contract deployment, or any claim that the full attestation payload is stored on-chain.

## Plan

1. Inspect current attestation/report flow and choose the smallest integration point for digest anchoring. 2. Add an attestation-specific Base anchor module and CLI command that always produces deterministic digest/payload artifacts and optionally performs a live Base write when signer env is present. 3. Thread anchor results into attestation output, verification, and HTML report without claiming that the full payload is on-chain. 4. Add tests and docs covering offline payload generation, optional live-write requirements, and report linkage.

## Verify Steps

1. Run `npm test`. Expected: all attestation and anchor-related tests pass, including offline payload generation and no-regression checks for existing attestation flows.
2. Run `node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor.json`. Expected: deterministic anchor payload is written, attestation linkage is recorded, and the command does not require signer secrets.
3. Run `node src/cli.mjs render --input artifacts/passing-attestation.json --anchor artifacts/passing-anchor.json --output artifacts/passing-report.html`. Expected: the report shows attestation-specific anchor status without claiming that the full payload is on-chain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
- Command: `npm test`
  Result: pass
  Evidence: `12` tests passed, including deterministic anchor receipt generation and CLI anchor flow without signer secrets.
  Scope: regression coverage for attestation core, real `agentplane` extraction path, and new Base anchor helpers.
- Command: `npm run demo`
  Result: pass
  Evidence: demo emitted passing/failing bundles and attestations plus `artifacts/passing-anchor.json`; passing path stayed `trusted` with `score=100`.
  Scope: integrated artifact generation, demo reports, and offline anchor sidecar generation.
- Command: `node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor.json`
  Result: pass
  Evidence: wrote deterministic anchor receipt for attestation `att-7b9d45f7b89825af` with `mode=prepared` and `status=not-submitted`.
  Scope: attestation-specific digest extraction and offline Base anchor payload generation.
- Command: `node src/cli.mjs render --input artifacts/passing-attestation.json --anchor artifacts/passing-anchor.json --output artifacts/passing-report.html`
  Result: pass
  Evidence: report rendered successfully and includes the explicit disclaimer that only the attestation digest is intended for on-chain anchoring.
  Scope: report linkage between attestation core, anchor receipt, and registration anchor provenance.
- Command: `node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor-submit.json --submit`
  Result: fail
  Evidence: command exited with code `1` and wrote `error=\"BASE_PRIVATE_KEY is required when --submit is used.\"`
  Scope: live Base submission guardrail when signer secrets are absent.
- Command: `agentplane doctor`
  Result: pass
  Evidence: workflow doctor reported `ok=true` with `findings=0`.
  Scope: repository workflow health after implementation.
- Command: `node .agentplane/policy/check-routing.mjs`
  Result: pass
  Evidence: output `policy routing OK`.
  Scope: policy routing validity after code and docs changes.

#### 2026-03-13T14:16:19.491Z — VERIFY — ok

By: CODER

Note: Command: npm test | Result: pass | Evidence: 12 tests passed including anchor flow coverage. Scope: attestation core and Base anchor helpers. Command: npm run demo | Result: pass | Evidence: generated passing and failing demo artifacts plus passing-anchor.json. Scope: integrated demo path. Command: node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor.json | Result: pass | Evidence: wrote deterministic prepared anchor receipt for the passing attestation. Scope: attestation-specific digest anchor generation. Command: node src/cli.mjs render --input artifacts/passing-attestation.json --anchor artifacts/passing-anchor.json --output artifacts/passing-report.html | Result: pass | Evidence: report rendered with explicit digest-only on-chain disclaimer. Scope: report linkage. Command: node src/cli.mjs anchor --input artifacts/passing-attestation.json --output artifacts/passing-anchor-submit.json --submit | Result: fail | Evidence: exited with BASE_PRIVATE_KEY required error, proving fail-closed live submit behavior. Scope: signer-secret guardrail. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T13:42:53.627Z, excerpt_hash=sha256:0b855d73817f4ff20a5e4d1c8b82cdb5d3a15aca96fe73fd920f77e968d10b83

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Live Base submission is implemented but not exercised in this session because the repository has no `BASE_PRIVATE_KEY`; current evidence proves the prepared path and the fail-closed submit guard.
- `node_modules` needed to be added to `.gitignore` because `npm install viem` would otherwise leave an unintended untracked directory in the worktree.
