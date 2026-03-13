---
id: "202603131548-841XQC"
title: "Add submission freeze manifest and release flow"
status: "DOING"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T15:48:55.576Z"
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
    body: "Start: implement a canonical submission freeze flow that rebuilds the demo, snapshots final docs, and emits a manifest with hashes and anchor state without adding external deployment or submission dependencies."
events:
  -
    type: "status"
    at: "2026-03-13T15:49:14.987Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement a canonical submission freeze flow that rebuilds the demo, snapshots final docs, and emits a manifest with hashes and anchor state without adding external deployment or submission dependencies."
doc_version: 3
doc_updated_at: "2026-03-13T15:49:14.988Z"
doc_updated_by: "CODER"
description: "Implement a submission freeze command that rebuilds demo artifacts, validates key evidence, snapshots final docs, and writes a manifest with file hashes for reproducible hackathon packaging."
id_source: "generated"
---
## Summary

Add submission freeze manifest and release flow

Implement a submission freeze command that rebuilds demo artifacts, validates key evidence, snapshots final docs, and writes a manifest with file hashes for reproducible hackathon packaging.

## Scope

- In scope: Implement a submission freeze command that rebuilds demo artifacts, validates key evidence, snapshots final docs, and writes a manifest with file hashes for reproducible hackathon packaging.
- Out of scope: unrelated refactors not required for "Add submission freeze manifest and release flow".

## Plan

1. Add a freeze command that rebuilds the canonical demo, snapshots submission-facing docs, and writes a manifest with repository metadata plus file hashes. 2. Keep freeze as a thin orchestration layer over the existing demo, attestation, anchor, and report logic so packaging does not fork the trust pipeline. 3. Extend tests and docs to prove freeze works from a clean checkout and is explicit about prepared versus confirmed anchor evidence.

## Verify Steps

1. Run `node src/cli.mjs freeze --output-dir artifacts/test-freeze`. Expected: the command rebuilds demo assets, snapshots submission docs, and writes `freeze-manifest.json` with hash entries and repository metadata.
2. Inspect `artifacts/test-freeze/freeze-manifest.json`. Expected: it lists the trusted and rejected demo artifacts plus copied submission docs, and records whether the trusted anchor is `prepared` or `confirmed`.
3. Run `npm test`, `agentplane doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: regression coverage passes and repository policy checks remain green.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-03-13

- `node src/cli.mjs freeze --output-dir artifacts/test-freeze`
  - Result: pass
  - Evidence: manifest=`artifacts/test-freeze/freeze-manifest.json`, trustedVerdict=`trusted`, rejectedVerdict=`reject`, anchor.mode=`prepared`
- `sed -n '1,240p' artifacts/test-freeze/freeze-manifest.json`
  - Result: pass
  - Evidence: manifest includes repository metadata, `15` hashed files, copied submission docs, and explicit trusted-attestation plus anchor sources
- `node src/cli.mjs demo --output-dir artifacts/test-freeze-source`
  - Result: pass
  - Evidence: generated a matching trusted attestation and anchor pair for freeze-pair validation
- `npm test`
  - Result: pass
  - Evidence: `19` tests passed, `0` failed, including freeze manifest and paired attestation/anchor tests
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

- The repository now has a single `freeze` command that rebuilds the canonical demo, snapshots submission-facing docs, and writes a hash manifest instead of relying on manual packaging steps.
- Freeze distinguishes between regenerated evidence and frozen trusted attestation or anchor overrides, which avoids falsely implying that an old confirmed anchor can be attached to a new digest.
- The optional paired override path requires both a matching trusted attestation and anchor receipt; otherwise the command fails closed.
