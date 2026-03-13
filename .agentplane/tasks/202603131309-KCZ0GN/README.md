---
id: "202603131309-KCZ0GN"
title: "Harden trust semantics for universal approval evidence"
status: "DOING"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T13:10:28.090Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T13:17:42.296Z"
  updated_by: "CODER"
  note: "Approval semantics are now normalized as explicit observed decisions, the trust engine no longer depends on a hidden human-only approval bucket, and real task plus fixture paths remain trusted or rejected as expected."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: harden approval semantics across normalization, policy, extractor, and tests so trust no longer depends on a hidden human-only approval assumption."
events:
  -
    type: "status"
    at: "2026-03-13T13:16:06.339Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: harden approval semantics across normalization, policy, extractor, and tests so trust no longer depends on a hidden human-only approval assumption."
  -
    type: "verify"
    at: "2026-03-13T13:17:42.296Z"
    author: "CODER"
    state: "ok"
    note: "Approval semantics are now normalized as explicit observed decisions, the trust engine no longer depends on a hidden human-only approval bucket, and real task plus fixture paths remain trusted or rejected as expected."
doc_version: 3
doc_updated_at: "2026-03-13T13:17:42.298Z"
doc_updated_by: "CODER"
description: "Implement Epic 1 by replacing the human-only approval assumption with a universal approval decision model across normalized evidence, trust policy, extractor behavior, tests, and docs."
id_source: "generated"
---
## Summary

Implement Epic 1 by replacing the human-only approval assumption with a universal approval decision model across normalized evidence, trust policy, extractor behavior, tests, and docs.

## Scope

In scope: update normalization and trust policy to reason about explicit approval decisions rather than a hard-coded `approvals.human` shape; preserve observed approval actor types in the `agentplane` extractor; update attestation claims and regression tests; document the resulting approval ontology in the canonical docs.

Out of scope: changing the top-level artifact bundle schema unless strictly necessary, adding on-chain anchoring, or polishing the demo surface beyond what is required to keep the existing flows correct.

## Plan

1. Inspect the current approval mapping across artifact normalization, trust policy, attestation claims, and the `agentplane` extractor.
2. Introduce a universal approval decision model in normalized evidence and update trust evaluation to use explicit observed decisions instead of `human` coercion.
3. Update the `agentplane` extractor, claims, tests, and docs so real task-backed attestations remain truthful and existing trusted/rejected paths remain valid.
4. Run the smallest sufficient verification suite, record evidence, and finish the task with traceable commits.

## Verify Steps

1. Generate normalized evidence from approval artifacts and confirm the resulting structure preserves approval status plus observed actor type without forcing everything into `approvals.human`.
2. Run the real `agentplane` task extraction and attestation flow and confirm a trusted verdict can still be produced from explicit approval decision evidence.
3. Run regression tests and confirm fixture-driven trusted and rejected paths still pass after the approval-model change.
4. Confirm the canonical docs describe the new approval semantics and distinguish observed approval decisions from derived trust claims.

## Verification

Pre-execution baseline: the repository already had a universal artifact bundle and a real task extraction path, but the normalized evidence model and trust policy still reduced approval semantics to a hidden human-only shape, which contradicted the canonical bundle vocabulary.

- Command: `node --input-type=module -e "import { readFileSync } from \"node:fs\"; import { normalizeArtifactBundle } from \"./src/lib/artifact-bundle.mjs\"; const bundle = JSON.parse(readFileSync(\"examples/passing-bundle.json\", \"utf8\")); const { evidence } = normalizeArtifactBundle(bundle); console.log(JSON.stringify({ primaryStatus: evidence.approvals.primary.status, primaryActorKind: evidence.approvals.primary.actorKind, humanSignoffAttached: Boolean(evidence.approvals.humanSignoff), taskApprovalActorKind: evidence.task.approvalActorKind }, null, 2));"`
- Result: pass
- Evidence: normalized evidence preserved `primaryStatus=approved`, `primaryActorKind=human`, `humanSignoffAttached=true`, and `taskApprovalActorKind=human` without relying on `approvals.human`.
- Scope: approval normalization semantics from canonical bundle input.

- Command: `npm run extract:agentplane:task`
- Result: pass
- Evidence: extracted `artifacts/extracted-runtime.json` for task `202603131024-THDVQ1`; the runtime snapshot now records approval as an observed policy actor instead of a coerced human actor.
- Scope: real `agentplane` task extraction path.

- Command: `npm run adapt:agentplane:task`
- Result: pass
- Evidence: the built-in `agentplane` adapter still emitted a valid canonical bundle from the real task snapshot with `bundleId=agentplane-task-202603131024-THDVQ1` and `artifactCount=11`.
- Scope: extractor compatibility with the adapter and canonical bundle path.

- Command: `node src/cli.mjs generate --input artifacts/extracted-bundle.json --output artifacts/extracted-attestation.json`
- Result: pass
- Evidence: generated `att-c092a462c7871323`; verdict=`trusted`; score=`100`.
- Scope: real task bundle -> attestation generation after the approval-model change.

- Command: `node src/cli.mjs verify --input artifacts/extracted-attestation.json --expect trusted`
- Result: pass
- Evidence: actual verdict matched expected verdict `trusted`; integrity valid; policy satisfied; no warnings or errors.
- Scope: trust adjudication for the real task path under the new approval semantics.

- Command: `npm test`
- Result: pass
- Evidence: `10` tests passed, including policy approval artifacts, approval normalization semantics, real task extraction, real task attestation, and CLI extraction.
- Scope: regression coverage for universal approval semantics, extractor behavior, and compatibility with existing trusted and rejected flows.

- Command: `npm run demo`
- Result: pass
- Evidence: fixture-driven demo still produced trusted and rejected paths with passing verdict score `100` and failing verdict score `0`.
- Scope: backward compatibility for the existing hackathon demo path.

- Command: `rg -n "Approval semantics|approvals\.primary|approvals\.decisions|humanSignoff|must not silently rewrite" docs/artifact-bundle.md`
- Result: pass
- Evidence: canonical docs now describe `approvals.primary`, `approvals.decisions`, optional `humanSignoff`, and the rule that a policy or system decision must not be silently rewritten into a human decision.
- Scope: documentation of the hardened approval ontology.

<!-- BEGIN VERIFICATION RESULTS -->
#### 2026-03-13T13:17:42.296Z — VERIFY — ok

By: CODER

Note: Approval semantics are now normalized as explicit observed decisions, the trust engine no longer depends on a hidden human-only approval bucket, and real task plus fixture paths remain trusted or rejected as expected.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T13:17:33.110Z, excerpt_hash=sha256:9b901d7ff9d099518e21c3feff9f38fa8adbdfe9abba200135f7a35b6b6fc518

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the normalization, policy, extractor, test, and documentation changes introduced by this task, then rerun the existing real-task and fixture demo flows to confirm the repository is back on the previous human-only approval model.

## Findings

Epic 1 is now resolved at the semantics layer: approval evidence is normalized as an observed decision with actor type instead of a hard-coded human bucket, and trust policy now requires an approved decision rather than a fabricated human approval. The remaining product choice is policy, not ontology: human signoff is still represented as a stronger detail in claims, but it is no longer required for a trusted verdict when the runtime truthfully exposes a policy-approved decision.
