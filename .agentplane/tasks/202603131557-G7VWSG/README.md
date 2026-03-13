---
id: "202603131557-G7VWSG"
title: "Prepare Devfolio submission copy and dry-run checklist"
status: "DOING"
priority: "med"
owner: "DOCS"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T15:58:40.342Z"
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
    author: "DOCS"
    body: "Start: prepare a field-by-field Devfolio submission pack and a final judging dry-run checklist based only on shipped repository behavior, current artifacts, and explicit manual submit-time actions."
events:
  -
    type: "status"
    at: "2026-03-13T15:58:45.991Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: prepare a field-by-field Devfolio submission pack and a final judging dry-run checklist based only on shipped repository behavior, current artifacts, and explicit manual submit-time actions."
doc_version: 3
doc_updated_at: "2026-03-13T15:58:45.993Z"
doc_updated_by: "DOCS"
description: "Add a docs-only Devfolio-oriented submission pack with field-ready copy, manual external-value checklist, and a final judging dry-run sequence derived from the shipped repository state."
id_source: "generated"
---
## Summary

Prepare Devfolio submission copy and dry-run checklist

Add a docs-only Devfolio-oriented submission pack with field-ready copy, manual external-value checklist, and a final judging dry-run sequence derived from the shipped repository state.

## Scope

- In scope: Add a docs-only Devfolio-oriented submission pack with field-ready copy, manual external-value checklist, and a final judging dry-run sequence derived from the shipped repository state.
- Out of scope: unrelated refactors not required for "Prepare Devfolio submission copy and dry-run checklist".

## Plan

1. Add a Devfolio-oriented submission document with field-ready copy derived only from shipped behavior, current on-chain evidence, and existing repo artifacts. 2. Add a judging dry-run checklist that separates repository-proven facts from manual external submission steps such as public URLs or video links. 3. Update the canonical submission entrypoints so the new copy is discoverable, then run docs verification and record the evidence.

## Verify Steps

1. Review the new Devfolio copy document. Expected: it contains field-ready text for the main submission sections and does not overclaim unsupported behavior.
2. Review the updated submission entrypoint docs. Expected: the new document is discoverable from the canonical submission surfaces.
3. Run `agentplane doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: docs changes keep repository policy checks green.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-03-13

- `sed -n '1,320p' DEVFOLIO.md`
  - Result: pass
  - Evidence: document contains field-ready submission copy, on-chain boundaries, dry-run steps, and an explicit weakest-link section
- `rg -n "Project Name|Short Description|Expanded Description|Technical Differentiation|On-Chain Contribution|Submission Dry Run|Weakest Link|DEVFOLIO.md" DEVFOLIO.md README.md SUBMISSION.md`
  - Result: pass
  - Evidence: new Devfolio pack is discoverable from canonical submission entrypoints
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

- The repository now has a field-by-field Devfolio submission document instead of relying on manual extraction from `SUBMISSION.md`.
- The dry-run section separates repository-proven facts from external manual values, which reduces overclaim risk during final submission.
- The new document honestly states that the rejected path is currently a controlled negative fixture, not a real failed `agentplane` lifecycle.
