# Universal Attestation Layer

This repository now separates the attestation system into a runtime-agnostic core and runtime-specific adapters.

## Layering

1. `runtime-native snapshot`
   Each runtime owns its own internal shape. This is where `agentplane`, `openclaw`, or any future system keeps native semantics.
2. `runtime adapter`
   The adapter knows how to translate one runtime-native snapshot into canonical artifacts.
3. `artifact bundle`
   The canonical evidence envelope shared across runtimes.
4. `attestation core`
   The runtime-agnostic layer that derives claims, computes integrity digests, and evaluates trust policy.
5. `verification + presentation`
   CLI verification, reports, and future consumer integrations.

## Why this matters

Without this layering, the project stays accidentally coupled to `agentplane`.

That breaks two important goals:

1. `openclaw` or any other runtime cannot integrate cleanly.
2. `agentplane` itself cannot later treat attestations as a built-in capability with a clean boundary between runtime state and attestation logic.

## Boundary rules

Universal core rules:

- must not know runtime-native task/event/state formats
- may know only canonical artifact bundle shape
- may derive claims and verdicts from canonical artifacts

Adapter rules:

- may know runtime-native shapes
- must emit canonical artifact bundles
- must not emit trust verdicts as input artifacts

## Built-in path today

The repository ships one first-party adapter:

- `agentplane`

This is a reference implementation, not a privileged core dependency. The goal is to make future adapters look structurally similar.
