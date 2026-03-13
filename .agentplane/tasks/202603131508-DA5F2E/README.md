---
id: "202603131508-DA5F2E"
title: "Polish judge-facing demo surface"
result_summary: "The demo now uses a real completed agentplane task for the trusted path, produces clearer judge-facing reports and index pages, and ships with a reproducible 2-3 minute walkthrough script."
status: "DONE"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T15:09:26.699Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T15:16:36.323Z"
  updated_by: "CODER"
  note: "Command: npm test | Result: pass | Evidence: 13 tests passed including the real-task demo regression test. Scope: attestation, anchor, extractor, and demo generation paths. Command: npm run demo | Result: pass | Evidence: emitted trusted and rejected demo artifacts with the trusted path sourced from task 202603131341-YNE1V9. Scope: judge-facing end-to-end flow. Command: rg -n \"Trusted path source task|real completed agentplane task|trusted-report\\.html|rejected-report\\.html|Base anchor receipt|Walkthrough\" artifacts/index.html | Result: pass | Evidence: generated index contains real-task framing, trusted/rejected links, anchor wording, and walkthrough block. Scope: demo index narrative. Command: sed -n '1,220p' docs/demo-script.md | Result: pass | Evidence: demo script documents the 2-3 minute talk track and exact commands. Scope: presentation docs. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
commit:
  hash: "e489f68f1b110a49b2620f00f570bd8a5a26e701"
  message: "✨ demo: polish judge-facing surface"
comments:
  -
    author: "CODER"
    body: "Start: reworking the demo to use real agentplane task evidence for the trusted path, improving judge-facing narrative surfaces, and adding a short demo script for the hackathon walkthrough."
  -
    author: "CODER"
    body: "Verified: shipped a judge-facing demo flow built on real completed task evidence, updated narrative surfaces, and added a concise walkthrough script while preserving trusted/rejected/anchor semantics."
events:
  -
    type: "status"
    at: "2026-03-13T15:09:41.586Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reworking the demo to use real agentplane task evidence for the trusted path, improving judge-facing narrative surfaces, and adding a short demo script for the hackathon walkthrough."
  -
    type: "verify"
    at: "2026-03-13T15:16:36.323Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm test | Result: pass | Evidence: 13 tests passed including the real-task demo regression test. Scope: attestation, anchor, extractor, and demo generation paths. Command: npm run demo | Result: pass | Evidence: emitted trusted and rejected demo artifacts with the trusted path sourced from task 202603131341-YNE1V9. Scope: judge-facing end-to-end flow. Command: rg -n \"Trusted path source task|real completed agentplane task|trusted-report\\.html|rejected-report\\.html|Base anchor receipt|Walkthrough\" artifacts/index.html | Result: pass | Evidence: generated index contains real-task framing, trusted/rejected links, anchor wording, and walkthrough block. Scope: demo index narrative. Command: sed -n '1,220p' docs/demo-script.md | Result: pass | Evidence: demo script documents the 2-3 minute talk track and exact commands. Scope: presentation docs. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
  -
    type: "status"
    at: "2026-03-13T15:17:24.141Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: shipped a judge-facing demo flow built on real completed task evidence, updated narrative surfaces, and added a concise walkthrough script while preserving trusted/rejected/anchor semantics."
doc_version: 3
doc_updated_at: "2026-03-13T15:17:24.142Z"
doc_updated_by: "CODER"
description: "Build a judge-oriented demo flow around real agentplane task evidence, clearer trusted/reject/anchor narrative, and a short demo script for hackathon presentation."
id_source: "generated"
---
## Summary

Polish judge-facing demo surface

Build a judge-oriented demo flow around real agentplane task evidence, clearer trusted/reject/anchor narrative, and a short demo script for hackathon presentation.

## Scope

- In scope: Build a judge-oriented demo flow around real agentplane task evidence, clearer trusted/reject/anchor narrative, and a short demo script for hackathon presentation.
- Out of scope: unrelated refactors not required for "Polish judge-facing demo surface".

## Plan

1. Rework the demo entrypoint so the trusted path is generated from a real completed agentplane task while the rejected path remains a controlled negative fixture. 2. Improve the judge-facing HTML surfaces so they explain trusted, rejected, and anchored states in product terms instead of raw implementation vocabulary. 3. Add a concise demo script/brief for the 2-3 minute hackathon walkthrough and update README commands/story accordingly. 4. Add or update tests so the new demo path remains reproducible from a clean checkout.

## Verify Steps

1. Run `npm test`. Expected: demo-related tests pass without regressing existing attestation, adapter, and anchor flows.
2. Run `npm run demo`. Expected: the trusted demo path is generated from a real completed `agentplane` task and the output includes passing bundle, attestation, anchor receipt, reports, and index.
3. Review `artifacts/index.html` and `docs/demo-script.md`. Expected: the judge-facing narrative makes the trusted, rejected, and anchored states understandable without reading the implementation.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
- Command: `npm test`
  Result: pass
  Evidence: `13` tests passed, including the new demo-path test that asserts `npm run demo` builds trusted artifacts from the real completed task `202603131341-YNE1V9`.
  Scope: regression coverage for attestation core, anchors, extractor path, and judge-facing demo generation.
- Command: `npm run demo`
  Result: pass
  Evidence: generated `trusted-runtime.json`, `trusted-bundle.json`, `trusted-attestation.json`, `trusted-anchor.json`, `trusted-report.html`, `rejected-*` artifacts, and `index.html`; trusted path stayed `trusted` with `score=100`.
  Scope: end-to-end judge-facing demo flow with real task evidence on the trusted side.
- Command: `rg -n "Trusted path source task|real completed agentplane task|trusted-report\\.html|rejected-report\\.html|Base anchor receipt|Walkthrough" artifacts/index.html`
  Result: pass
  Evidence: index contains the real-task framing, trusted/rejected report links, anchor phrasing, and walkthrough section.
  Scope: judge-facing narrative quality in the generated demo entrypoint.
- Command: `sed -n '1,220p' docs/demo-script.md`
  Result: pass
  Evidence: script documents the 2-3 minute walkthrough, exact commands, trusted/rejected/anchor talk track, and honest live-anchor limitation.
  Scope: reproducible presentation flow for judges.
- Command: `agentplane doctor`
  Result: pass
  Evidence: workflow doctor reported `ok=true` with `findings=0`.
  Scope: repository workflow health after demo-surface changes.
- Command: `node .agentplane/policy/check-routing.mjs`
  Result: pass
  Evidence: output `policy routing OK`.
  Scope: policy routing validity after code and docs changes.

#### 2026-03-13T15:16:36.323Z — VERIFY — ok

By: CODER

Note: Command: npm test | Result: pass | Evidence: 13 tests passed including the real-task demo regression test. Scope: attestation, anchor, extractor, and demo generation paths. Command: npm run demo | Result: pass | Evidence: emitted trusted and rejected demo artifacts with the trusted path sourced from task 202603131341-YNE1V9. Scope: judge-facing end-to-end flow. Command: rg -n "Trusted path source task|real completed agentplane task|trusted-report\.html|rejected-report\.html|Base anchor receipt|Walkthrough" artifacts/index.html | Result: pass | Evidence: generated index contains real-task framing, trusted/rejected links, anchor wording, and walkthrough block. Scope: demo index narrative. Command: sed -n '1,220p' docs/demo-script.md | Result: pass | Evidence: demo script documents the 2-3 minute talk track and exact commands. Scope: presentation docs. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T15:09:41.587Z, excerpt_hash=sha256:d96d406a3ee98aecd4862d30e555a6e10aeb050094c8cb2fb59a81b7b3fc733d

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The trusted demo path now uses real completed task evidence instead of a hand-authored passing fixture, which materially strengthens the hackathon story.
- The chain limitation remains external to this task: the demo shows a prepared attestation anchor unless a funded Base signer is supplied at runtime.
