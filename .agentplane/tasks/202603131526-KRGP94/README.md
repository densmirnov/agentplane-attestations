---
id: "202603131526-KRGP94"
title: "Assemble submission evidence pack"
status: "DOING"
priority: "med"
owner: "DOCS"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T15:26:54.823Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T15:30:06.087Z"
  updated_by: "DOCS"
  note: "Command: sed -n '1,260p' SUBMISSION.md | Result: pass | Evidence: submission pack contains problem, architecture, on-chain evidence, judge asset map, repro commands, and checklist. Scope: primary submission entrypoint. Command: sed -n '1,320p' docs/conversation-log.md | Result: pass | Evidence: conversation log doc maps tasks, README evidence, and commits into a single reference path. Scope: collaboration evidence. Command: rg -n \"One-line summary|Architecture Summary|On-Chain Evidence|Judge Asset Map|Repro Commands|Repo Hygiene Checklist|Suggested Submission Framing|Canonical Timeline|Suggested ConversationLog Reference\" SUBMISSION.md docs/conversation-log.md | Result: pass | Evidence: all required submission-pack sections were found. Scope: structural completeness. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: assembling a submission-ready evidence pack with a single submission summary, explicit conversation-log evidence map, and reproducible demo/judging asset checklist based on shipped behavior."
events:
  -
    type: "status"
    at: "2026-03-13T15:27:02.170Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: assembling a submission-ready evidence pack with a single submission summary, explicit conversation-log evidence map, and reproducible demo/judging asset checklist based on shipped behavior."
  -
    type: "verify"
    at: "2026-03-13T15:30:06.087Z"
    author: "DOCS"
    state: "ok"
    note: "Command: sed -n '1,260p' SUBMISSION.md | Result: pass | Evidence: submission pack contains problem, architecture, on-chain evidence, judge asset map, repro commands, and checklist. Scope: primary submission entrypoint. Command: sed -n '1,320p' docs/conversation-log.md | Result: pass | Evidence: conversation log doc maps tasks, README evidence, and commits into a single reference path. Scope: collaboration evidence. Command: rg -n \"One-line summary|Architecture Summary|On-Chain Evidence|Judge Asset Map|Repro Commands|Repo Hygiene Checklist|Suggested Submission Framing|Canonical Timeline|Suggested ConversationLog Reference\" SUBMISSION.md docs/conversation-log.md | Result: pass | Evidence: all required submission-pack sections were found. Scope: structural completeness. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
doc_version: 3
doc_updated_at: "2026-03-13T15:30:06.089Z"
doc_updated_by: "DOCS"
description: "Package the shipped demo, architecture summary, conversation evidence path, and repo hygiene checklist into submission-ready repository artifacts."
id_source: "generated"
---
## Summary

Assemble submission evidence pack

Package the shipped demo, architecture summary, conversation evidence path, and repo hygiene checklist into submission-ready repository artifacts.

## Scope

- In scope: Package the shipped demo, architecture summary, conversation evidence path, and repo hygiene checklist into submission-ready repository artifacts.
- Out of scope: unrelated refactors not required for "Assemble submission evidence pack".

## Plan

1. Audit the current README, demo script, roadmap, and task history to identify what submission evidence already exists and what is still implicit. 2. Create a submission-ready document set that covers problem statement, architecture summary, on-chain evidence, reproducible demo commands, repo hygiene checklist, and explicit judge-facing asset links. 3. Create a conversationLog evidence document or export strategy that points submission-time consumers to the exact task READMEs, comments, events, and commits that capture human-agent collaboration. 4. Verify the pack with docs checks and targeted content inspection so a submission can be assembled from repository artifacts without guesswork.

## Verify Steps

1. Review `SUBMISSION.md`. Expected: it contains a concise problem statement, architecture summary, judge asset map, reproducible demo commands, on-chain evidence, and a repo hygiene checklist aligned with shipped behavior.
2. Review `docs/conversation-log.md`. Expected: it points to the exact task READMEs, comments/events, and commits that capture human-agent collaboration and can be used as the `conversationLog` evidence path.
3. Run `agentplane doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: both pass after the docs-only changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
- Command: `sed -n '1,260p' SUBMISSION.md`
  Result: pass
  Evidence: submission pack contains the project summary, problem statement, architecture summary, on-chain evidence, judge asset map, repro commands, and submission-time hygiene checklist.
  Scope: primary submission-ready repository entrypoint.
  Links: `SUBMISSION.md`
- Command: `sed -n '1,320p' docs/conversation-log.md`
  Result: pass
  Evidence: conversation log doc maps the hackathon timeline to exact task READMEs, verification notes, and commits, and includes a suggested `conversationLog` reference for submission.
  Scope: conversation evidence path for judging and submission.
  Links: `docs/conversation-log.md`
- Command: `rg -n "One-line summary|Architecture Summary|On-Chain Evidence|Judge Asset Map|Repro Commands|Repo Hygiene Checklist|Suggested Submission Framing|Canonical Timeline|Suggested ConversationLog Reference" SUBMISSION.md docs/conversation-log.md`
  Result: pass
  Evidence: all required submission-pack and conversation-log sections were found in the expected files.
  Scope: structural completeness of the submission evidence pack.
  Links: `SUBMISSION.md`, `docs/conversation-log.md`
- Command: `agentplane doctor`
  Result: pass
  Evidence: workflow doctor reported `ok=true` with `findings=0`.
  Scope: repository workflow health after docs-only changes.
  Links: `SUBMISSION.md`, `docs/conversation-log.md`, `README.md`
- Command: `node .agentplane/policy/check-routing.mjs`
  Result: pass
  Evidence: output `policy routing OK`.
  Scope: policy routing validity after docs-only changes.
  Links: `README.md`, `SUBMISSION.md`, `docs/conversation-log.md`

#### 2026-03-13T15:30:06.087Z — VERIFY — ok

By: DOCS

Note: Command: sed -n '1,260p' SUBMISSION.md | Result: pass | Evidence: submission pack contains problem, architecture, on-chain evidence, judge asset map, repro commands, and checklist. Scope: primary submission entrypoint. Command: sed -n '1,320p' docs/conversation-log.md | Result: pass | Evidence: conversation log doc maps tasks, README evidence, and commits into a single reference path. Scope: collaboration evidence. Command: rg -n "One-line summary|Architecture Summary|On-Chain Evidence|Judge Asset Map|Repro Commands|Repo Hygiene Checklist|Suggested Submission Framing|Canonical Timeline|Suggested ConversationLog Reference" SUBMISSION.md docs/conversation-log.md | Result: pass | Evidence: all required submission-pack sections were found. Scope: structural completeness. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T15:27:02.171Z, excerpt_hash=sha256:b22e2838df2d24405036e12161fe4d635f4aa6ad12a40cf2956379c562714e67

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The repository now has a single submission entrypoint plus a separate conversation-evidence map, which removes guesswork when the hackathon submission UI opens.
- Public-repo status is intentionally left as a submission-time checklist item because it cannot be proven from the local checkout alone.
