# Runtime Adapter Contract

The runtime adapter contract is the extension point for systems like `agentplane` or `openclaw`.

## Contract

Each adapter exposes:

- `adapterId`
- `runtime`
- `version`
- `description`
- `adapt(snapshot) -> artifact bundle`

The universal core does not inspect runtime-native snapshots. It only consumes the canonical artifact bundle returned by the adapter.

## Required properties

An adapter must:

1. accept a runtime-native snapshot owned by that runtime
2. produce a canonical artifact bundle that satisfies [schemas/artifact-bundle.schema.json](/Users/densmirnov/Desktop/synthesis-hackathon/schemas/artifact-bundle.schema.json)
3. attach adapter provenance into the bundle via the optional top-level `adapter` block
4. keep trust verdicts out of input artifacts

## Minimal adapter responsibilities

An adapter is responsible for mapping runtime-native data into canonical artifacts such as:

- `intent`
- `approval`
- `execution`
- `verification`
- `conversation`
- `anchor`
- `note`

It is not responsible for:

- computing final trust score
- computing final trust verdict
- rendering reports

## Built-in reference

The repository includes a first-party `agentplane` adapter and example runtime snapshots in:

- [agentplane-runtime-passing.json](/Users/densmirnov/Desktop/synthesis-hackathon/examples/agentplane-runtime-passing.json)
- [agentplane-runtime-failing.json](/Users/densmirnov/Desktop/synthesis-hackathon/examples/agentplane-runtime-failing.json)

Future runtimes such as `openclaw` should implement the same contract, but with their own snapshot shape.
