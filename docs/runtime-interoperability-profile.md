# Runtime Interoperability Profile

This profile defines the minimum contract for runtimes that want to emit portable attestations without inheriting `agentplane` internals.

It is intentionally small:

- keep runtime-native state local to the runtime
- export only canonical evidence into the artifact bundle
- let the universal core derive trust from evidence instead of runtime-specific claims

## Canonical Invariants

These fields must stay canonical across all runtimes:

1. top-level bundle envelope:
   - `schemaVersion`
   - `bundleId`
   - `subject`
   - `context`
   - `artifacts`
2. artifact envelope:
   - `artifactId`
   - `kind`
   - `generatedAt`
   - `producer`
   - `subjectRef`
   - `mediaType`
   - `payload`
3. trust remains derived output:
   - runtimes must not emit trust score as an input artifact
   - runtimes must not emit final trust verdict as an input artifact

## Adapter Freedom

These areas remain runtime-specific:

1. the runtime-native snapshot shape
2. runtime-specific locator schemes such as `openclaw://...` or file paths
3. internal names for work units such as `task`, `run`, `job`, or `session`
4. internal review process names such as `approval`, `review`, `gate`, or `policy checkpoint`

The adapter is the only place where runtime-native data is translated into canonical artifacts.

## Minimum Compatible Export

A runtime is considered compatible when it can emit a bundle with truthful evidence for:

1. one `intent` artifact
2. at least one `approval` artifact, even if the status is `rejected`, `waived`, or `missing`
3. one `execution` artifact
4. one `verification` artifact

This is enough for the universal core to evaluate the run, even if the result is `reject`.

## Minimum Trusted Candidate

A runtime can realistically reach `trusted` only when it exports enough evidence for all of these signals:

1. an approved decision is present
2. execution proof includes `repo`, `branch`, and `commit`
3. changed files are captured
4. all required verification checks pass
5. conversation evidence is attached

A Base anchor is recommended for stronger provenance, but it is not required for a `trusted` verdict under the current policy.

## Approval Semantics

Approval guidance for third-party runtimes:

1. preserve the observed actor kind
   - `policy` stays `policy`
   - `system` stays `system`
   - `human` stays `human`
2. preserve the observed status
   - `approved`
   - `rejected`
   - `waived`
   - `missing`
3. do not coerce a policy decision into human signoff
4. emit multiple approval artifacts in chronological order when the runtime has multiple review checkpoints

The universal core treats the latest approval artifact as the primary decision and separately detects human signoff when it actually exists.

## Evidence Semantics

Evidence guidance for third-party runtimes:

1. use `locator` when the runtime has a stable reference back to native evidence
2. keep payloads observational and specific
3. include conversation evidence only when the transcript or audit trail truly exists
4. keep on-chain anchors honest:
   - if only a digest is anchored, say only that
   - do not imply the full payload is on-chain

## Adapter Authoring Checklist

1. Define a runtime-native snapshot shape that reflects the runtime's real semantics.
2. Implement `adapt(snapshot) -> artifact bundle`.
3. Validate the adapter output against [artifact-bundle.schema.json](/Users/densmirnov/Desktop/synthesis-hackathon/schemas/artifact-bundle.schema.json).
4. Preserve observed actor kinds and review statuses without coercion.
5. Keep trust verdicts and trust scores out of input artifacts.
6. Add one passing fixture and one failing fixture for the runtime.
7. Verify that both fixtures run through the same universal attestation pipeline.

## Reference Implementations

The repository currently ships two adapter references:

1. `agentplane`
   - backed by real task extraction from `.agentplane/tasks/<id>/README.md`
2. `openclaw`
   - a reference adapter with illustrative runtime snapshots
   - not an official upstream `openclaw` integration

The goal of the `openclaw` path is to prove interoperability, not to claim coverage of the full external runtime.
