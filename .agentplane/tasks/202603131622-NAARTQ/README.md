---
id: "202603131622-NAARTQ"
title: "Align Devfolio copy with current Synthesis skill snapshot"
status: "DOING"
priority: "med"
owner: "DOCS"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T16:22:58.559Z"
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
    body: "Start: revise the Devfolio copy so it cites the current local Synthesis skill snapshot, explains submissionMetadata correctly, and distinguishes the primary codex-cli build stack from the reference openclaw adapter."
events:
  -
    type: "status"
    at: "2026-03-13T16:23:04.597Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: revise the Devfolio copy so it cites the current local Synthesis skill snapshot, explains submissionMetadata correctly, and distinguishes the primary codex-cli build stack from the reference openclaw adapter."
doc_version: 3
doc_updated_at: "2026-03-13T16:23:04.599Z"
doc_updated_by: "DOCS"
description: "Update DEVFOLIO.md to reference the current Synthesis skill snapshot instead of old page assumptions and add a precise submissionMetadata note for actual harness and model disclosure."
id_source: "generated"
---
## Summary

Align Devfolio copy with current Synthesis skill snapshot

Update DEVFOLIO.md to reference the current Synthesis skill snapshot instead of old page assumptions and add a precise submissionMetadata note for actual harness and model disclosure.

## Scope

- In scope: Update DEVFOLIO.md to reference the current Synthesis skill snapshot instead of old page assumptions and add a precise submissionMetadata note for actual harness and model disclosure.
- Out of scope: unrelated refactors not required for "Align Devfolio copy with current Synthesis skill snapshot".

## Plan

1. Update DEVFOLIO.md so its form assumptions explicitly point to the current local Synthesis skill snapshot rather than an older public page. 2. Add a precise submissionMetadata note for actual harness and model disclosure, including the distinction between the primary build stack and the reference openclaw interoperability adapter. 3. Verify the updated copy with targeted docs inspection plus policy checks and record the evidence.

## Verify Steps

1. Review `DEVFOLIO.md`. Expected: it references the current local Synthesis skill snapshot and no longer relies on assumptions from an older hackathon page.
2. Search `DEVFOLIO.md` for `submissionMetadata`, `codex-cli`, `gpt-5`, and `openclaw`. Expected: the document clearly explains actual stack disclosure and the non-primary role of the `openclaw` reference adapter.
3. Run `agentplane doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: docs changes keep repository policy checks green.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-03-13

- `sed -n '1,260p' DEVFOLIO.md`
  - Result: pass
  - Evidence: document now references the local current skill snapshot and adds a dedicated stack-disclosure block for `submissionMetadata`
- `rg -n "Source Basis|submissionMetadata|codex-cli|gpt-5|openclaw|older public hackathon pages" DEVFOLIO.md`
  - Result: pass
  - Evidence: copy explicitly distinguishes the current source basis, primary build stack, and the non-primary role of the `openclaw` reference adapter
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

- `DEVFOLIO.md` no longer relies on assumptions from an older public hackathon page and now explicitly points to the local snapshot of the current Synthesis skill page.
- The document now states that `submissionMetadata` should be treated as the canonical submission-time source for actual harness and model disclosure when registration-time stack labels are no longer sufficient.
- The stack note now clearly distinguishes the shipped build stack (`codex-cli` + `gpt-5`) from the repository's `openclaw` reference interoperability adapter.
