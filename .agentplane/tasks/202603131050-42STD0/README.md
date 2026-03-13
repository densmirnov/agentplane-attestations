---
id: "202603131050-42STD0"
title: "Extract real agentplane task lifecycle into attestation inputs"
result_summary: "Implemented a real agentplane task extractor, CLI extraction path, task-driven bundle generation, provenance locators, and regression coverage for the real-task attestation flow."
status: "DONE"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T10:53:03.055Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T11:08:44.054Z"
  updated_by: "CODER"
  note: "The repository now extracts real completed agentplane tasks into runtime snapshots, adapts them into canonical bundles, and produces trusted attestations from actual task and git evidence without regressing the fixture-driven demo path."
commit:
  hash: "881d0b1a84847643e4a9a8f04c402487281f1207"
  message: "✨ 42STD0 task: extract real task attestations from agentplane lifecycle"
comments:
  -
    author: "CODER"
    body: "Start: extract a real agentplane task into a runtime snapshot, wire it into the adapter pipeline, and replace fixture-only provenance with task-backed evidence."
  -
    author: "CODER"
    body: "Verified: real agentplane tasks now extract into runtime snapshots, adapt into canonical bundles, and produce trusted attestations from task and git evidence while the fixture-driven demo path remains intact."
events:
  -
    type: "status"
    at: "2026-03-13T10:53:22.178Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract a real agentplane task into a runtime snapshot, wire it into the adapter pipeline, and replace fixture-only provenance with task-backed evidence."
  -
    type: "verify"
    at: "2026-03-13T11:08:44.054Z"
    author: "CODER"
    state: "ok"
    note: "The repository now extracts real completed agentplane tasks into runtime snapshots, adapts them into canonical bundles, and produces trusted attestations from actual task and git evidence without regressing the fixture-driven demo path."
  -
    type: "status"
    at: "2026-03-13T11:09:26.039Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: real agentplane tasks now extract into runtime snapshots, adapt into canonical bundles, and produce trusted attestations from task and git evidence while the fixture-driven demo path remains intact."
doc_version: 3
doc_updated_at: "2026-03-13T11:09:26.040Z"
doc_updated_by: "CODER"
description: "Build a real extractor that reads agentplane task artifacts from .agentplane/tasks/<id>/README.md plus git commit metadata, emits an agentplane runtime snapshot, and feeds it through the existing adapter and attestation pipeline."
id_source: "generated"
---
## Summary

Build a real extraction path from a completed `agentplane` task into the universal attestation pipeline so attestations can be generated from actual repository task artifacts instead of hand-crafted runtime snapshots.

## Scope

In scope: parse a real completed `agentplane` task README, extract task, approval, verification, comment, and event metadata, read linked git commit metadata, emit an `agentplane` runtime snapshot, wire the CLI to generate a bundle from a task ID, and add tests and docs for the new path.

Out of scope: external network integrations, new chain writes, changes to the canonical artifact bundle schema, or inventing runtime-specific data that does not exist in the task or git evidence.

## Plan

1. Inspect the real `agentplane` task README contract and git commit metadata to define extractor inputs and the output snapshot shape.
2. Implement a reusable extractor that reads a completed task and emits an `agentplane` runtime snapshot consistent with the built-in adapter contract.
3. Extend the CLI so a user can generate a runtime snapshot and canonical bundle directly from `--task-id` without maintaining hand-written runtime JSON.
4. Add regression tests, example outputs, and documentation for the real extractor path, then run end-to-end verification.

## Verify Steps

1. Run the real extractor against a completed `agentplane` task and confirm it emits an `agentplane` runtime snapshot with task, approval, execution, verification, and note-level evidence sourced from the task README and git metadata.
2. Generate a canonical bundle from that extracted task and confirm the built-in `agentplane` adapter accepts the snapshot without schema or contract errors.
3. Generate and verify an attestation from the extracted task path and confirm the trust verdict matches the underlying approval and verification evidence.
4. Run automated tests that cover extractor normalization, CLI behavior, and regression safety for the existing hand-crafted adapter fixtures.

## Verification

Pre-execution baseline: the repository could ingest canonical bundles and hand-written `agentplane` runtime fixtures, but it could not yet derive attestable runtime input from a real completed `agentplane` task and its linked git commit.

- Command: `npm run extract:agentplane:task`
- Result: pass
- Evidence: extracted `artifacts/extracted-runtime.json` for task `202603131024-THDVQ1`; commit=`5a9d8c57afbe78a193f48bec679e6c4e758c16c0`; filesChanged=`16`; checks=`6`.
- Scope: real task README + git commit -> runtime snapshot extraction.

- Command: `npm run adapt:agentplane:task`
- Result: pass
- Evidence: built-in `agentplane` adapter accepted the extracted task snapshot and produced `artifacts/extracted-bundle.json` with `bundleId=agentplane-task-202603131024-THDVQ1` and `artifactCount=11`.
- Scope: extracted task snapshot -> canonical artifact bundle path.

- Command: `node src/cli.mjs generate --input artifacts/extracted-bundle.json --output artifacts/extracted-attestation.json`
- Result: pass
- Evidence: generated attestation `att-e79fe2cbc552c7e5` from the extracted task bundle; verdict=`trusted`; score=`100`.
- Scope: extracted task bundle -> attestation generation.

- Command: `node src/cli.mjs verify --input artifacts/extracted-attestation.json --expect trusted`
- Result: pass
- Evidence: actual verdict matched expected verdict `trusted`; integrity valid; policy satisfied; no warnings or errors.
- Scope: end-to-end trust adjudication for a real task-backed attestation.

- Command: `npm test`
- Result: pass
- Evidence: `8` tests passed, including real extractor snapshot generation, real task -> attestation trust path, and CLI `extract` behavior.
- Scope: regression coverage for bundle validation, fixture adapters, extractor, CLI, and real-task attestation flow.

- Command: `npm run demo`
- Result: pass
- Evidence: existing fixture-driven demo still produced trusted and rejected paths without regression after the extractor and locator changes.
- Scope: backward compatibility for the original hackathon demo surface.

<!-- BEGIN VERIFICATION RESULTS -->
#### 2026-03-13T11:08:44.054Z — VERIFY — ok

By: CODER

Note: The repository now extracts real completed agentplane tasks into runtime snapshots, adapts them into canonical bundles, and produces trusted attestations from actual task and git evidence without regressing the fixture-driven demo path.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T10:53:22.178Z, excerpt_hash=sha256:8426a28910a43e49f8c2d031272b4409183b350825074d23c638ad1a5646bcc6

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove the task extractor and CLI wiring, restore the prior runtime-fixture-only path, and rerun the existing demo and tests to confirm the canonical bundle and adapter flows behave as before.

## Findings

The main interoperability constraint is evidence honesty: the universal layer can only attest to artifacts that a runtime exposes. The extractor now preserves provenance through task README and git locators, but one inference remains explicit: `agentplane` stores the approval checkpoint as `plan_approval.updated_by=ORCHESTRATOR`, so the current extractor maps that checkpoint to the configured human approver profile for trust evaluation. That is acceptable for the hackathon demo because `ORCHESTRATOR` is the human-approved go/no-go route in this repository, but it is still an inference layer that other runtimes should surface more directly if they want stronger attestations.
