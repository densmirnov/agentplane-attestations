# Hackathon Roadmap

This roadmap is the execution plan for the rest of the Synthesis hackathon.

It is intentionally narrow:

- ship a credible trust product
- maximize demo clarity
- strengthen judging signals
- avoid platform sprawl

## Product Thesis

`agentplane Attestations` turns agent work into portable trust artifacts.

The product answers one question:

Can a human, CI system, or downstream agent trust this task result enough to accept, merge, or deploy it?

## Current Baseline

The repository already ships the following baseline:

- canonical `artifact bundle` input format
- runtime-agnostic attestation layer
- built-in `agentplane` adapter
- real `agentplane` task extraction into runtime snapshots
- attestation generation and verification
- trusted and rejected demo paths
- static HTML report surface

Current references:

- [README.md](README.md)
- [docs/artifact-bundle.md](docs/artifact-bundle.md)
- [docs/universal-attestation-layer.md](docs/universal-attestation-layer.md)
- [docs/runtime-adapter-contract.md](docs/runtime-adapter-contract.md)

## Hackathon Success Criteria

The hackathon build is successful only if all of the following are true:

1. The demo shows both a trusted path and a rejected path.
2. The trust verdict is backed by explicit evidence, not hidden assumptions.
3. At least one attestation-specific artifact is anchored on Base.
4. The repository contains enough evidence and documentation to support submission, judging, and future reuse.
5. The system is useful for `agentplane` itself after the hackathon.

## Scope Guardrails

These items are explicitly out of scope for the hackathon build:

- agent marketplace
- token, staking, or escrow mechanics
- full wallet UX
- production deployment surface beyond demo needs
- multi-agent network protocol
- generalized governance platform

## Delivery Sequence

The recommended order is:

1. harden trust semantics
2. make attestations feel native inside `agentplane`
3. add an attestation-specific on-chain anchor
4. polish the judge-facing demo path
5. package submission evidence
6. only then spend time on multi-runtime stretch work

## Epics

### Epic 0 — Shipped Baseline

Status: shipped baseline  
Priority: foundation

Goal:
Establish a working attestation pipeline before adding higher-risk hackathon work.

Delivered baseline:

- canonical bundle schema and validation
- universal layer and adapter contract
- first-party `agentplane` adapter
- real task extraction from `.agentplane/tasks/<id>/README.md` plus git commit metadata
- verification and report rendering

Acceptance criteria:

- a real completed `agentplane` task can be turned into a runtime snapshot, bundle, attestation, and verified report
- trusted and rejected demo fixtures continue to work

### Epic 1 — Trust Semantics Hardening

Status: not started  
Priority: must-ship

Goal:
Remove hidden approval assumptions and align trust evaluation with the universal artifact model.

Why it matters:

- current trust semantics still overfit `agentplane`
- universal adoption fails if other runtimes must pretend to have a human approval shape
- judges will punish trust claims that rely on inference instead of explicit evidence

Deliverables:

- explicit approval ontology in normalized evidence
- extractor output that preserves observed actor type instead of coercing it into `human`
- policy update that distinguishes approved decision, human signoff, and policy/system approval
- updated docs that explain what is observed versus inferred
- regression tests for approval variants and negative paths

Acceptance criteria:

- a trusted verdict no longer depends on a fake human mapping inside the extractor
- approval evidence remains truthful to runtime-native data
- positive and negative trust tests still pass after the model change

Non-goals:

- redesigning the canonical artifact bundle schema unless strictly necessary

Dependencies:

- depends on Epic 0 baseline

### Epic 2 — Native Agentplane Attestations

Status: partially shipped  
Priority: must-ship

Goal:
Make attestations feel like a built-in `agentplane` capability instead of a sidecar demo flow.

Why it matters:

- the strongest product story is that `agentplane` benefits from this trust layer itself
- native workflow integration creates a clearer and more believable demo
- it reduces friction for future real-world use

Deliverables:

- stable CLI path for task-backed attestation generation
- improved task-to-attestation UX and output organization
- clearer provenance fields for task, commit, verification, and report outputs
- documentation for the end-to-end operator flow

Acceptance criteria:

- a user can generate a task-backed attestation from a completed `agentplane` task with one documented flow
- outputs include bundle, attestation, and report artifacts without manual JSON editing
- the flow is documented well enough to run from a clean checkout

Non-goals:

- deep integration into upstream `agentplane` CLI during the hackathon

Dependencies:

- depends on Epic 1 trust semantics hardening for the cleanest final UX

### Epic 3 — On-Chain Attestation Anchor

Status: not started  
Priority: must-ship

Goal:
Anchor the attestation digest itself on Base, not just the hackathon registration identity.

Why it matters:

- this is the clearest upgrade over the current baseline
- it turns the chain element into part of the trust flow instead of decorative context
- it increases judging leverage for on-chain artifacts

Deliverables:

- deterministic attestation digest extraction
- anchor payload generation
- one real Base transaction for the demo or final submission
- report linkage from attestation to anchor transaction
- documentation of what is anchored and what remains off-chain

Acceptance criteria:

- at least one real attestation digest can be anchored on Base
- the report clearly links the attestation to the anchor artifact
- the system never claims that the full attestation payload lives on-chain when only the digest does

Non-goals:

- tokenization
- staking
- generalized reputation contracts

Dependencies:

- depends on Epic 2 native attestation flow

### Epic 4 — Judge-Facing Demo Surface

Status: partially shipped  
Priority: must-ship

Goal:
Turn the current technical demo into a tight 2–3 minute product demonstration.

Why it matters:

- strong internal architecture is not enough for a hackathon win
- the demo must make the trust value obvious in seconds
- judges need to understand both why the system trusts and why it refuses trust

Deliverables:

- polished passing and failing reports
- concise on-screen explanation of verdict reasons
- demo-ready sample flow built from real task evidence
- crisp narrative for trusted path, rejected path, and on-chain anchor
- light branding and asset consistency for the presentation surface

Acceptance criteria:

- the demo can show trusted, rejected, and anchored states in one coherent flow
- a judge can understand the product value without reading implementation docs
- the negative path is preserved as a first-class part of the presentation

Non-goals:

- a full marketing site
- heavy frontend polish unrelated to the demo story

Dependencies:

- depends on Epics 1 through 3

### Epic 5 — Submission Evidence Pack

Status: not started  
Priority: must-ship

Goal:
Package the project for judging and submission without losing traceability.

Why it matters:

- teams often lose points because the product is stronger than the submission package
- the hackathon explicitly values evidence, code, and conversation history

Deliverables:

- `conversationLog` export strategy or linked evidence path
- concise architecture and problem statement summary
- submission-ready demo script
- checklist for public repo hygiene and judging assets
- final list of commands to reproduce the demo

Acceptance criteria:

- submission materials can be assembled from repository artifacts without guesswork
- conversation and implementation evidence are discoverable
- the demo script aligns with shipped behavior and current repository commands

Non-goals:

- writing speculative post-hackathon investor materials

Dependencies:

- depends on Epics 3 and 4

### Epic 6 — Universal Runtime Interoperability Profile

Status: not started  
Priority: stretch

Goal:
Prove that the attestation layer is genuinely reusable beyond `agentplane`.

Why it matters:

- this is the strongest long-term moat
- it gives the project a larger product category than one internal tool
- it makes `openclaw`-style integration a credible next step

Deliverables:

- a minimal interoperability profile for runtimes
- adapter authoring checklist
- approval and evidence semantics guidance for third-party runtimes
- optional mock or reference adapter surface for a non-`agentplane` runtime

Acceptance criteria:

- another runtime team could understand how to emit compatible artifacts without reading `agentplane` internals
- the universal layer documents what must stay canonical versus adapter-specific

Non-goals:

- implementing a full `openclaw` integration during the hackathon unless all must-ship epics are already done

Dependencies:

- depends on Epic 1

## Must-Ship Order

Before demo freeze:

1. Epic 1
2. Epic 2
3. Epic 3

Before final submission:

1. Epic 4
2. Epic 5

Only if time remains:

1. Epic 6

## Practical Rule

If a task does not improve one of these outcomes, it should not displace must-ship work:

- trust correctness
- demo clarity
- on-chain proof
- submission readiness
- post-hackathon usefulness inside `agentplane`
