---
id: "202603131548-841XQC"
title: "Add submission freeze manifest and release flow"
result_summary: "Submission packaging is now reproducible from one command with explicit manifest metadata, hashed files, and honest handling of regenerated versus frozen trust evidence."
status: "DONE"
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
  state: "ok"
  updated_at: "2026-03-13T15:55:15.934Z"
  updated_by: "CODER"
  note: "Verified: the submission freeze flow rebuilds demo assets, snapshots submission docs, writes a hash manifest, and passes regression plus policy checks."
commit:
  hash: "6cad33bcbda46be0d10f0a6bdacdfd8c271e3f39"
  message: "🧊 release: add submission freeze flow"
comments:
  -
    author: "CODER"
    body: "Start: implement a canonical submission freeze flow that rebuilds the demo, snapshots final docs, and emits a manifest with hashes and anchor state without adding external deployment or submission dependencies."
  -
    author: "CODER"
    body: "Verified: added a canonical freeze command that rebuilds final artifacts, snapshots submission-facing docs, records hash manifests, and fails closed on mismatched attestation-anchor pairs."
events:
  -
    type: "status"
    at: "2026-03-13T15:49:14.987Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement a canonical submission freeze flow that rebuilds the demo, snapshots final docs, and emits a manifest with hashes and anchor state without adding external deployment or submission dependencies."
  -
    type: "verify"
    at: "2026-03-13T15:55:15.934Z"
    author: "CODER"
    state: "ok"
    note: "Verified: the submission freeze flow rebuilds demo assets, snapshots submission docs, writes a hash manifest, and passes regression plus policy checks."
  -
    type: "status"
    at: "2026-03-13T15:55:21.947Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: added a canonical freeze command that rebuilds final artifacts, snapshots submission-facing docs, records hash manifests, and fails closed on mismatched attestation-anchor pairs."
doc_version: 3
doc_updated_at: "2026-03-13T15:55:21.949Z"
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

#### 2026-03-13T15:55:15.934Z — VERIFY — ok

By: CODER

Note: Verified: the submission freeze flow rebuilds demo assets, snapshots submission docs, writes a hash manifest, and passes regression plus policy checks.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T15:49:14.988Z, excerpt_hash=sha256:700ab7c54484437facd09cf04b77dbc336fee4172c4dad56765483578465c9e6

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The repository now has a single `freeze` command that rebuilds the canonical demo, snapshots submission-facing docs, and writes a hash manifest instead of relying on manual packaging steps.
- Freeze distinguishes between regenerated evidence and frozen trusted attestation or anchor overrides, which avoids falsely implying that an old confirmed anchor can be attached to a new digest.
- The optional paired override path requires both a matching trusted attestation and anchor receipt; otherwise the command fails closed.
