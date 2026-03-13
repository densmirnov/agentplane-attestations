# Devfolio Submission Copy

This document converts the shipped repository state into field-ready submission text for Devfolio-style forms.

It does not replace [SUBMISSION.md](/Users/densmirnov/Desktop/synthesis-hackathon/SUBMISSION.md).
Instead, it turns that repository evidence into concise copy blocks plus a final submission dry run.

## Source Basis

This document is grounded in:

1. the shipped repository state
2. the local snapshot of the current Synthesis skill page in [docs/synthesis-skill-2026-03-13.md](/Users/densmirnov/Desktop/synthesis-hackathon/docs/synthesis-skill-2026-03-13.md)

It is not based on older public hackathon pages.

Important boundary:

1. the current skill snapshot is strongest on registration and general rules
2. it explicitly says final submissions will open later
3. this document therefore treats repository evidence as primary for shipped behavior and uses the skill snapshot only for current platform-level constraints such as harness/model disclosure

## Field-Ready Copy

### Project Name

`agentplane Attestations`

### Tagline

`A trust gate for agent-delivered work.`

### Short Description

`agentplane Attestations` turns approved scope, execution evidence, verification results, and portable provenance into attestations that tell humans and downstream agents whether a result should be accepted, reviewed, or refused.

### Expanded Description

Most agent workflows show output, not trust. If an agent changes code, a human, CI pipeline, or another agent still needs to decide whether the scope was approved, whether the claimed work actually happened, whether required checks passed, and whether there is portable provenance for the result.

`agentplane Attestations` is a trust gate for agent-delivered work. It converts runtime-native evidence into a canonical artifact bundle, derives a verifiable attestation from that evidence, and outputs a clear verdict: `trusted`, `caution`, or `reject`. The system is intentionally designed to refuse trust when evidence is weak.

The shipped build includes a real `agentplane` task-backed trusted path, a controlled rejected path, a confirmed Base attestation-digest anchor for the trusted path, a judge-facing demo surface, and a universal adapter contract that can support other runtimes without inheriting `agentplane` internals.

### Problem

Agent output is easy to generate and hard to trust. Teams still need an explicit answer to four questions before they can safely accept, merge, or deploy agent-delivered work:

1. Was the scope explicitly approved?
2. Did the runtime actually execute the claimed work?
3. Did the required checks pass?
4. Is there portable provenance for what happened?

Without that layer, agent workflows become guesswork plus logs.

### Solution

`agentplane Attestations` separates runtime-native evidence from trust evaluation:

1. a runtime exports or is adapted into a canonical `artifact bundle`
2. the attestation core derives claims and computes integrity digests
3. the trust policy evaluates the evidence and returns `trusted`, `caution`, or `reject`
4. the result is rendered into a portable report
5. the attestation digest can be anchored on Base as sidecar provenance

The negative path is a first-class product behavior. If approval or verification evidence is insufficient, the system refuses trust instead of producing a misleading pass.

### Technical Differentiation

The key technical difference is the boundary between runtime-native state and canonical trust evaluation.

The project does not hardcode one runtime's internal task model into the trust layer. Instead, it uses:

1. runtime-native snapshots
2. runtime adapters
3. a canonical artifact bundle
4. a runtime-agnostic attestation core
5. verification and report rendering

This means `agentplane` can use attestations natively, while other runtimes can integrate through the same adapter contract without inheriting `agentplane` internals. The repository ships a real `agentplane` adapter and a reference `openclaw` interoperability adapter to prove that separation.

### Theme Fit

This is a direct fit for `Agents that trust`.

The project is not another generic coding agent. It solves the trust adjudication layer around agent output: whether humans, CI systems, or downstream agents should accept a result.

### On-Chain Contribution

The project uses Base in two distinct ways:

1. the hackathon registration identity is anchored on Base
2. the trusted demo path has a confirmed Base transaction anchoring the attestation digest

Important boundary:

1. only the attestation digest is anchored on-chain
2. the full attestation payload remains off-chain
3. the anchor receipt is sidecar provenance, not part of the immutable attestation core

Confirmed attestation anchor:

`https://basescan.org/tx/0x9c6ec8585f139255fa613427ea4c5c9ed412c6f32a0138f1db05fc1473d0b934`

### What Ships Today

1. canonical artifact bundle format
2. runtime-agnostic attestation core
3. built-in `agentplane` adapter
4. real `agentplane` task extraction for the trusted path
5. trust-policy evaluation with `trusted`, `caution`, and `reject`
6. judge-facing trusted and rejected reports
7. confirmed Base anchor for the trusted attestation digest
8. submission freeze flow with a file-hash manifest

### Stack Disclosure And `submissionMetadata`

The current Synthesis skill snapshot says that registration-time `agentHarness` and `model` may later be superseded by the project's `submissionMetadata` at submission time. Treat that as the canonical place to describe what was actually used for the shipped build.

Use this disclosure logic:

1. primary build harness: `codex-cli`
2. primary build model: `gpt-5`
3. `agentplane` is the product and orchestration frame, not a platform harness enum from the skill page
4. `openclaw` appears in this repository only as a reference interoperability adapter, not as the primary harness used to build the submission

If the form has a free-text stack field, use:

`Built primarily with codex-cli on gpt-5. agentplane is the product and orchestration layer. openclaw appears only as a reference interoperability adapter, not as the primary harness used to build the submission.`

### Demo Walkthrough Copy

Open `artifacts/index.html` and show:

1. the trusted path generated from a real completed `agentplane` task
2. the trusted report with exact task, commit, verification, and anchor evidence
3. the rejected report showing the product refusing trust when evidence is insufficient
4. the Base transaction proving the attestation digest anchor

Close with:

`agentplane Attestations tells humans and downstream agents whether a result should be accepted, reviewed, or refused.`

### Conversation Log Reference

If the form asks for a `conversationLog`, use:

`See docs/conversation-log.md and the linked task READMEs under .agentplane/tasks/. Those artifacts contain the planning checkpoints, execution notes, verification evidence, status transitions, and commit traceability for the human-agent collaboration.`

## Submission Dry Run

### Repository-Proven Facts

These claims are already supported by repository evidence:

1. the trusted path is derived from a real completed `agentplane` task
2. the project has a controlled rejected path
3. the attestation digest for the trusted path has a confirmed Base anchor
4. the trust layer is runtime-agnostic at the adapter boundary
5. the repository includes a reproducible `freeze` command with hash manifest output

### Manual External Values

These values must be filled manually at submit time because the repository cannot prove them from a local checkout:

1. the public repository URL
2. the demo video URL
3. the public hosted demo URL, if one is used
4. final teammate profile links

### Dry-Run Sequence

1. Ensure the repository remote that judges will open is public.
2. Run `npm install`.
3. Run `npm test`.
4. Run `npm run freeze`.
5. Open `artifacts/freeze/freeze-manifest.json`.
6. Confirm that the manifest shows the expected branch, commit, trusted verdict, rejected verdict, and copied docs.
7. If you want to freeze a pre-existing trusted attestation plus matching anchor pair, run:

```bash
node src/cli.mjs freeze \
  --trusted-attestation artifacts/trusted-attestation.json \
  --trusted-anchor artifacts/trusted-anchor.json
```

8. Check that submission copy does not claim the full attestation is on-chain.
9. If the UI exposes harness or model disclosure fields, align them with the actual shipped build via the `submissionMetadata` logic above: `codex-cli` and `gpt-5`, not `openclaw`.
10. Paste the text blocks above into the form.
11. If the UI asks for a single repo evidence pointer, use `SUBMISSION.md` and `docs/conversation-log.md`.

## Weakest Link

The weakest remaining product claim is the rejected demo path. The trusted path is real-task-backed, but the rejected path is still a controlled negative fixture rather than a real failed `agentplane` lifecycle. Do not describe the rejected path as a real failed production run.
