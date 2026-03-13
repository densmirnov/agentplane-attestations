# Demo Script

## Goal

Explain `agentplane Attestations` in 2-3 minutes without requiring judges to read source code.

## Setup

Run:

```bash
npm run demo
```

Then open:

- `artifacts/index.html`

The trusted path is generated from the real completed `agentplane` task `202603131341-YNE1V9`.
The rejected path remains a controlled negative fixture.

## Talk Track

### 1. Problem

Most agent demos show output, not trust.
If an agent changes code, a human, CI, or another agent still needs to decide whether that result should be accepted.

### 2. Trusted path

Open the trusted card and say:

- this attestation comes from a real completed `agentplane` task, not hand-authored demo JSON
- the system observed approved scope, execution proof, changed files, and passing verification checks
- because those signals satisfy policy, the verdict is `trusted`

Then open:

- `artifacts/trusted-report.html`

Point to:

- the recommended action
- why the system trusted the result
- the exact task, commit, and verification evidence

### 3. Anchor

Still on the trusted path, explain:

- the attestation core stays off-chain
- only the attestation digest is prepared for anchoring on Base
- the anchor receipt is portable evidence that can later point to a confirmed Base transaction

If no signer secret is configured, say this explicitly:

- the repo currently demonstrates the prepared anchor path
- live submission is implemented but intentionally fails closed without `BASE_PRIVATE_KEY`

### 4. Rejected path

Open:

- `artifacts/rejected-report.html`

Say:

- this is the same product doing the opposite job
- it is refusing trust because approval and verification evidence are insufficient
- that negative path is essential; otherwise this is just logging with better styling

### 5. Close

End with:

`agentplane Attestations` is a trust gate for agent-delivered work.
It tells humans and downstream agents whether a result should be accepted, reviewed, or refused.

## Optional live-anchor step

If a funded Base demo wallet is available, run:

```bash
BASE_PRIVATE_KEY=0x... node src/cli.mjs anchor --input artifacts/trusted-attestation.json --output artifacts/trusted-anchor.json --submit
node src/cli.mjs render --input artifacts/trusted-attestation.json --anchor artifacts/trusted-anchor.json --output artifacts/trusted-report.html
```

Use this only if the wallet is funded and intended for demo transactions.
