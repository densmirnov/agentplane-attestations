---
id: "202603131302-MYY6HC"
title: "Create hackathon roadmap epics for agentplane Attestations"
status: "DOING"
priority: "med"
owner: "DOCS"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-03-13T13:03:55.221Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-03-13T13:06:45.613Z"
  updated_by: "DOCS"
  note: "ROADMAP.md now captures the shipped baseline, the remaining must-ship hackathon epics, stretch scope, and scope guardrails without drifting into speculative platform backlog."
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: audit the shipped MVP state, translate the remaining hackathon work into prioritized epics, and write ROADMAP.md as the canonical execution plan for the rest of the hackathon."
events:
  -
    type: "status"
    at: "2026-03-13T13:04:02.379Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: audit the shipped MVP state, translate the remaining hackathon work into prioritized epics, and write ROADMAP.md as the canonical execution plan for the rest of the hackathon."
  -
    type: "verify"
    at: "2026-03-13T13:06:45.613Z"
    author: "DOCS"
    state: "ok"
    note: "ROADMAP.md now captures the shipped baseline, the remaining must-ship hackathon epics, stretch scope, and scope guardrails without drifting into speculative platform backlog."
doc_version: 3
doc_updated_at: "2026-03-13T13:06:45.614Z"
doc_updated_by: "DOCS"
description: "Author ROADMAP.md with a prioritized set of hackathon epics, scope boundaries, acceptance criteria, and stretch items so the team can execute against a clear delivery plan."
id_source: "generated"
---
## Summary

Author `ROADMAP.md` as the canonical hackathon delivery plan for `agentplane Attestations`, including prioritized epics, scope boundaries, acceptance criteria, dependencies, and a clear split between must-ship work and stretch work.

## Scope

In scope: a root-level `ROADMAP.md` that reflects the current repository baseline, identifies the remaining hackathon implementation work, defines epic-level deliverables and acceptance criteria, and marks non-goals that should stay outside the hackathon scope.

Out of scope: implementing roadmap items, changing product logic, or turning the roadmap into an unbounded long-term platform backlog.

## Plan

1. Audit the current repository state, the current MVP baseline, and the strongest remaining product and judging gaps.
2. Design a hackathon-first epic structure that distinguishes shipped baseline, must-ship epics, and stretch epics.
3. Author `ROADMAP.md` in English with priorities, goals, deliverables, acceptance criteria, dependencies, and non-goals.
4. Run docs-only verification, record evidence, and finish the task with traceable commits.

## Verify Steps

1. Confirm `ROADMAP.md` exists at the repository root and describes the current shipped baseline plus the remaining hackathon work instead of generic future ideas.
2. Confirm each roadmap epic includes at least a goal, why it matters, concrete deliverables, acceptance criteria, and a priority marker.
3. Confirm the roadmap clearly separates `must-ship` work from `stretch` work and includes explicit non-goals to control hackathon scope.
4. Run docs-only verification checks and confirm the repository remains healthy after the documentation change.

## Verification

Pre-execution baseline: the repository had a working MVP and several closed implementation tasks, but it did not yet have a single canonical roadmap that separated shipped baseline, must-ship hackathon work, and stretch work.

- Command: `node .agentplane/policy/check-routing.mjs`
- Result: pass
- Evidence: policy routing check returned `policy routing OK`.
- Scope: docs-only routing compliance for the repository policy graph.
- Links: `ROADMAP.md`

- Command: `agentplane doctor`
- Result: pass
- Evidence: workflow doctor returned `doctor (OK)` with `findings=0`.
- Scope: repository health after the docs-only change.
- Links: `ROADMAP.md`

- Command: `rg -n "^# Hackathon Roadmap|^## Current Baseline|^## Hackathon Success Criteria|^## Scope Guardrails|^## Delivery Sequence|^## Epics|^## Must-Ship Order|^## Practical Rule" ROADMAP.md`
- Result: pass
- Evidence: confirmed the roadmap contains the root execution sections for baseline, success criteria, scope control, epic planning, must-ship order, and the final prioritization rule.
- Scope: roadmap structure and required planning sections.
- Links: `ROADMAP.md`

- Command: `rg -n "^### Epic |^Status:|^Priority:|^Goal:|^Deliverables:|^Acceptance criteria:|^Non-goals:" ROADMAP.md`
- Result: pass
- Evidence: confirmed all six roadmap epics expose explicit status, priority, goal, deliverables, acceptance criteria, and non-goals, while Epic 0 records the already-shipped baseline.
- Scope: epic-level completeness and scope-control fields.
- Links: `ROADMAP.md`

<!-- BEGIN VERIFICATION RESULTS -->
#### 2026-03-13T13:06:45.613Z — VERIFY — ok

By: DOCS

Note: ROADMAP.md now captures the shipped baseline, the remaining must-ship hackathon epics, stretch scope, and scope guardrails without drifting into speculative platform backlog.

VerifyStepsRef: doc_version=3, doc_updated_at=2026-03-13T13:06:37.458Z, excerpt_hash=sha256:7592507ba5704d794e55f99f8bc5bff600e8622cf1adc79b3d257640c59c025e

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove `ROADMAP.md`, revert the task README updates for this task, and rerun docs verification to confirm the repository returns to the prior documentation-only state.

## Findings

The main documentation risk is not missing detail; it is scope inflation. A useful hackathon roadmap must prioritize execution order and demo relevance over completeness, otherwise it becomes a disguised product wishlist.
