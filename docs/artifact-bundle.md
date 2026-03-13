# Artifact Bundle

`artifact bundle` is the canonical input contract for the universal attestation layer.

The format is intended to be reusable across agents, runtimes, and domains. It captures raw artifacts first and lets the attestor derive claims later.

## Design goals

1. Separate evidence from derived trust claims.
2. Make every input artifact individually addressable and attributable.
3. Preserve enough structure for machines to validate and normalize bundles.
4. Stay small enough to generate from local agent workflows without extra infrastructure.

## Top-level shape

```json
{
  "schemaVersion": "1.0.0",
  "bundleId": "bundle-passing-demo",
  "adapter": {},
  "subject": {},
  "context": {},
  "artifacts": []
}
```

## Invariants

1. `schemaVersion` version-locks the input contract.
2. `bundleId` is stable for the bundle instance.
3. optional `adapter` identifies which runtime adapter emitted the bundle
4. `subject` describes the attested agent identity, not the verdict.
5. `context` provides shared task/project/source metadata that multiple artifacts can reference.
6. `artifacts` contains raw observations or decisions only.
7. Trust score, trust verdict, and derived claims are forbidden as input artifacts. They belong to the attestation output.
8. `artifactId` values are unique within one bundle.
9. Every artifact has one primary `kind`, one `producer`, one `subjectRef`, one `generatedAt`, and one `payload`.

## Direct vs adapter-emitted bundles

Bundles may be created in two ways:

1. directly by a system that already speaks the canonical format
2. through a runtime adapter that translates a runtime-native snapshot into canonical artifacts

When a bundle is emitted by an adapter, the top-level optional `adapter` block should identify the adapter provenance.

## Canonical artifact kinds

### `intent`

Declares requested work or claimed outcome.

Expected payload fields:

- `summary`
- optional `scope`
- optional `requestedOutcome`

### `approval`

Captures an explicit approval/rejection/waiver decision by a human, system, or policy actor.

Expected payload fields:

- `status`: `approved` | `rejected` | `waived` | `missing`
- optional `rationale`

### `execution`

Captures observed execution facts.

Expected payload fields:

- `repo`
- `branch`
- optional `commit`
- optional `filesChanged`
- optional `diffStat`

### `verification`

Captures checks run against the work product.

Expected payload fields:

- `checks`
- optional `conversationLogAttached`

### `conversation`

Captures conversation-log availability or location.

Expected payload fields:

- `attached`
- optional `uri`
- optional `summary`

### `anchor`

Captures an external provenance anchor such as a chain transaction or registry entry.

Expected payload fields:

- `kind`
- optional `chain`
- optional `txUrl`
- optional `reference`

### `note`

Captures freeform context that should not change trust policy semantics directly.

Expected payload fields:

- `text`

## Why this is more universal than the old evidence JSON

The older input format embedded already-normalized policy facts such as `task.approved` or `verification.conversationLogAttached` directly into one domain object. That works for one product, but it mixes:

1. raw evidence
2. normalization logic
3. policy assumptions
4. attestation presentation

The bundle format fixes that by keeping raw artifacts independent and typed.

## Normalization model

The current attestation core derives a simplified evidence view from the bundle:

- latest `intent` artifact -> task summary
- approval artifacts -> `task.approved`, `approvals.primary`, `approvals.decisions`, and optional `approvals.humanSignoff`
- latest `execution` artifact -> repo/branch/commit/files
- latest `verification` artifact -> checks
- latest `conversation` artifact -> conversation log availability
- latest `anchor` artifact -> provenance anchor
- `note` artifacts -> notes array

This is an implementation choice, not a schema law. Other attestors can derive a different internal view from the same bundle.

## Approval semantics

Approval is evidence-first.

That means:

1. the input artifact records who made the decision and what the status was
2. the attestor may derive trust from that decision
3. the attestor must not silently rewrite a policy or system decision into a human decision

The current normalization model therefore keeps:

- the primary observed approval decision
- the full list of approval decisions in the bundle
- an optional derived `humanSignoff` convenience field when a human approved decision is present

This lets runtimes keep their real actor model while still supporting downstream trust policy.
