---
id: "202603131519-F5JEWC"
title: "Confirm live Base anchor with deployer key"
status: "DOING"
priority: "med"
owner: "CODER"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T15:20:30.030Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T15:23:50.874Z"
  updated_by: "CODER"
  note: "Command: npm test | Result: pass | Evidence: 13 tests passed after adding BASE_DEPLOYER_PRIVATE_KEY support. Scope: attestation, anchor, extractor, and demo paths. Command: npm run demo | Result: pass | Evidence: regenerated trusted demo artifacts from task 202603131341-YNE1V9. Scope: trusted/rejected demo generation. Command: deployer balance precheck | Result: pass | Evidence: address 0xc9EF33216b7EDa860Fd1F6CC991cc51257dC532d had 0.019381686024969107 ETH on Base. Scope: live submit safety check. Command: set -a; source .env >/dev/null 2>&1; node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit | Result: pass | Evidence: confirmed Base tx 0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934 at block 43312987 with success status. Scope: real on-chain attestation anchor. Command: node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html | Result: pass | Evidence: trusted report rendered with confirmed txUrl. Scope: judge-facing report linkage. Command: regenerate index from confirmed anchor | Result: pass | Evidence: artifacts/index.html now shows Anchor mode confirmed and the trusted task source. Scope: demo entrypoint freshness. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: adding BASE_DEPLOYER_PRIVATE_KEY support to the live anchor flow, then using it to submit one real Base anchor transaction for the trusted attestation and rerendering the confirmed report."
events:
  -
    type: "status"
    at: "2026-03-13T15:20:43.825Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: adding BASE_DEPLOYER_PRIVATE_KEY support to the live anchor flow, then using it to submit one real Base anchor transaction for the trusted attestation and rerendering the confirmed report."
  -
    type: "verify"
    at: "2026-03-13T15:23:50.874Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm test | Result: pass | Evidence: 13 tests passed after adding BASE_DEPLOYER_PRIVATE_KEY support. Scope: attestation, anchor, extractor, and demo paths. Command: npm run demo | Result: pass | Evidence: regenerated trusted demo artifacts from task 202603131341-YNE1V9. Scope: trusted/rejected demo generation. Command: deployer balance precheck | Result: pass | Evidence: address 0xc9EF33216b7EDa860Fd1F6CC991cc51257dC532d had 0.019381686024969107 ETH on Base. Scope: live submit safety check. Command: set -a; source .env >/dev/null 2>&1; node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit | Result: pass | Evidence: confirmed Base tx 0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934 at block 43312987 with success status. Scope: real on-chain attestation anchor. Command: node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html | Result: pass | Evidence: trusted report rendered with confirmed txUrl. Scope: judge-facing report linkage. Command: regenerate index from confirmed anchor | Result: pass | Evidence: artifacts/index.html now shows Anchor mode confirmed and the trusted task source. Scope: demo entrypoint freshness. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation."
doc_version: 3
doc_updated_at: "2026-03-13T15:23:50.875Z"
doc_updated_by: "CODER"
description: "Accept BASE_DEPLOYER_PRIVATE_KEY as the live signer source, submit one real Base anchor transaction for the trusted attestation, rerender the trusted report, and record confirmed tx evidence."
id_source: "generated"
---
## Summary

Confirm live Base anchor with deployer key

Accept BASE_DEPLOYER_PRIVATE_KEY as the live signer source, submit one real Base anchor transaction for the trusted attestation, rerender the trusted report, and record confirmed tx evidence.

## Scope

- In scope: Accept BASE_DEPLOYER_PRIVATE_KEY as the live signer source, submit one real Base anchor transaction for the trusted attestation, rerender the trusted report, and record confirmed tx evidence.
- Out of scope: unrelated refactors not required for "Confirm live Base anchor with deployer key".

## Plan

1. Update the anchor flow to accept BASE_DEPLOYER_PRIVATE_KEY as a first-class signer env alias alongside BASE_PRIVATE_KEY and document the runtime contract. 2. Regenerate the trusted demo artifacts, submit one real Base anchor transaction for artifacts/trusted-attestation.json, and rerender the trusted report with the confirmed anchor receipt. 3. Record the confirmed tx evidence in task docs and verification output without exposing private material. 4. Stop immediately if the live submit fails for an external chain or balance reason instead of widening scope.

## Verify Steps

1. Run `npm test`. Expected: all existing attestation, anchor, and demo tests still pass after adding the deployer-key env alias.
2. Run `npm run demo`. Expected: trusted demo artifacts are regenerated from the real completed task and ready for live anchoring.
3. Run `set -a; source .env >/dev/null 2>&1; node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit && node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html`. Expected: a confirmed Base `txUrl` is written into the trusted anchor receipt and the trusted report renders against that confirmed receipt.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
- Command: `npm test`
  Result: pass
  Evidence: `13` tests passed after adding the deployer-key env alias; attestation, anchor, extractor, and demo regressions remained green.
  Scope: repository code paths touched by the live-anchor fix.
- Command: `npm run demo`
  Result: pass
  Evidence: regenerated trusted demo artifacts from the real completed task `202603131341-YNE1V9` and produced fresh `trusted-attestation.json` and `trusted-anchor.json`.
  Scope: end-to-end trusted/rejected demo generation before live submission.
- Command: `set -a; source .env >/dev/null 2>&1; node --input-type=module -e '...'`
  Result: pass
  Evidence: derived deployer address `0xc9EF33216b7EDa860Fd1F6CC991cc51257dC532d` and confirmed Base balance `0.019381686024969107 ETH` before submit.
  Scope: preflight safety check for the funded Base deployer wallet.
- Command: `set -a; source .env >/dev/null 2>&1; node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit`
  Result: pass
  Evidence: confirmed Base transaction `0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934` at block `43312987`; receipt status `success`; explorer `https://basescan.org/tx/0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934`.
  Scope: real attestation-digest anchor on Base using the deployer key from `.env`.
- Command: `node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html`
  Result: pass
  Evidence: trusted report rendered against the confirmed anchor receipt and includes the confirmed Base `txUrl`.
  Scope: judge-facing report linkage to the live on-chain attestation anchor.
- Command: `node --input-type=module -e '...'`
  Result: pass
  Evidence: regenerated `artifacts/index.html` from the confirmed trusted anchor so the index now shows `Anchor mode: confirmed`.
  Scope: stale-artifact refresh for the judge entrypoint after live submit.
- Command: `rg -n "confirmed Base anchor evidence|tx/0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934|Anchor mode: confirmed|Trusted path source task" artifacts/index.html artifacts/trusted-report.html`
  Result: pass
  Evidence: confirmed entrypoint and trusted report both reference the live anchored state and the correct task source.
  Scope: generated demo artifact correctness after live submit.
- Command: `agentplane doctor`
  Result: pass
  Evidence: workflow doctor reported `ok=true` with `findings=0`.
  Scope: repository workflow health after live-anchor verification.
- Command: `node .agentplane/policy/check-routing.mjs`
  Result: pass
  Evidence: output `policy routing OK`.
  Scope: policy routing validity after code and docs changes.

#### 2026-03-13T15:23:50.874Z — VERIFY — ok

By: CODER

Note: Command: npm test | Result: pass | Evidence: 13 tests passed after adding BASE_DEPLOYER_PRIVATE_KEY support. Scope: attestation, anchor, extractor, and demo paths. Command: npm run demo | Result: pass | Evidence: regenerated trusted demo artifacts from task 202603131341-YNE1V9. Scope: trusted/rejected demo generation. Command: deployer balance precheck | Result: pass | Evidence: address 0xc9EF33216b7EDa860Fd1F6CC991cc51257dC532d had 0.019381686024969107 ETH on Base. Scope: live submit safety check. Command: set -a; source .env >/dev/null 2>&1; node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit | Result: pass | Evidence: confirmed Base tx 0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934 at block 43312987 with success status. Scope: real on-chain attestation anchor. Command: node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html | Result: pass | Evidence: trusted report rendered with confirmed txUrl. Scope: judge-facing report linkage. Command: regenerate index from confirmed anchor | Result: pass | Evidence: artifacts/index.html now shows Anchor mode confirmed and the trusted task source. Scope: demo entrypoint freshness. Command: agentplane doctor | Result: pass | Evidence: ok true with findings 0. Scope: workflow health. Command: node .agentplane/policy/check-routing.mjs | Result: pass | Evidence: policy routing OK. Scope: policy validation.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T15:20:43.825Z, excerpt_hash=sha256:a62338b64858b1090354fcc41cf779f3bd85d7da01a2d4c8f14fe12bb59d8bfe

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- The live Base anchor blocker is now removed for the current demo artifacts: trusted path and judge entrypoint both reference a confirmed on-chain digest anchor.
- The code now accepts either `BASE_PRIVATE_KEY` or `BASE_DEPLOYER_PRIVATE_KEY`, matching the actual repository secret naming.
