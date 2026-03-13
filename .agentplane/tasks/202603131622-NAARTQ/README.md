---
id: "202603131622-NAARTQ"
title: "Align Devfolio copy with current Synthesis skill snapshot"
result_summary: "Devfolio submission copy now reflects the current Synthesis source basis and gives a precise, non-misleading stack disclosure path for submission-time metadata."
status: "DONE"
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
  state: "ok"
  updated_at: "2026-03-13T16:24:31.704Z"
  updated_by: "DOCS"
  note: "Verified: aligned the Devfolio copy with the current local Synthesis skill snapshot, added an explicit submissionMetadata note, and clarified the difference between the primary build stack and the openclaw reference adapter."
commit:
  hash: "aa5042d0229c0b87dda4f25aa43ff91b7dbe3956"
  message: "📝 docs: align Devfolio copy with current skill snapshot"
comments:
  -
    author: "DOCS"
    body: "Start: revise the Devfolio copy so it cites the current local Synthesis skill snapshot, explains submissionMetadata correctly, and distinguishes the primary codex-cli build stack from the reference openclaw adapter."
  -
    author: "DOCS"
    body: "Verified: updated DEVFOLIO.md to cite the current local Synthesis skill snapshot, document submissionMetadata as the canonical stack-disclosure surface, and distinguish the primary codex-cli build stack from the reference openclaw adapter."
events:
  -
    type: "status"
    at: "2026-03-13T16:23:04.597Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: revise the Devfolio copy so it cites the current local Synthesis skill snapshot, explains submissionMetadata correctly, and distinguishes the primary codex-cli build stack from the reference openclaw adapter."
  -
    type: "verify"
    at: "2026-03-13T16:24:31.704Z"
    author: "DOCS"
    state: "ok"
    note: "Verified: aligned the Devfolio copy with the current local Synthesis skill snapshot, added an explicit submissionMetadata note, and clarified the difference between the primary build stack and the openclaw reference adapter."
  -
    type: "status"
    at: "2026-03-13T16:24:40.513Z"
    author: "DOCS"
    from: "DOING"
    to: "DONE"
    note: "Verified: updated DEVFOLIO.md to cite the current local Synthesis skill snapshot, document submissionMetadata as the canonical stack-disclosure surface, and distinguish the primary codex-cli build stack from the reference openclaw adapter."
doc_version: 3
doc_updated_at: "2026-03-13T16:24:40.514Z"
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

#### 2026-03-13T16:24:31.704Z — VERIFY — ok

By: DOCS

Note: Verified: aligned the Devfolio copy with the current local Synthesis skill snapshot, added an explicit submissionMetadata note, and clarified the difference between the primary build stack and the openclaw reference adapter.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T16:23:04.599Z, excerpt_hash=sha256:0e98131a95115dd00a5461bd6e69779d54228c645ce8907898a8acb91e0bdf49

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- `DEVFOLIO.md` no longer relies on assumptions from an older public hackathon page and now explicitly points to the local snapshot of the current Synthesis skill page.
- The document now states that `submissionMetadata` should be treated as the canonical submission-time source for actual harness and model disclosure when registration-time stack labels are no longer sufficient.
- The stack note now clearly distinguishes the shipped build stack (`codex-cli` + `gpt-5`) from the repository's `openclaw` reference interoperability adapter.
