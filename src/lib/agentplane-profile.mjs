function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeObjects(base, override) {
  if (!isObject(base) || !isObject(override)) {
    return override ?? base;
  }

  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) {
      continue;
    }

    if (isObject(value) && isObject(base[key])) {
      merged[key] = mergeObjects(base[key], value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

export const DEFAULT_AGENTPLANE_PROFILE = Object.freeze({
  subject: {
    agentId: "agentplane",
    displayName: "agentplane",
    harness: "codex-cli",
    model: "gpt-5",
    operator: {
      kind: "human",
      id: "densmirnov",
      displayName: "Denis Smirnov",
    },
  },
  project: {
    name: "agentplane Attestations",
    theme: "Agents that trust",
    problem:
      "Humans and downstream agents need a portable way to decide whether agent output is trustworthy.",
  },
  approvalActors: {
    ORCHESTRATOR: {
      kind: "policy",
      id: "ORCHESTRATOR",
      displayName: "ORCHESTRATOR",
    },
  },
  verificationProducer: {
    kind: "system",
    id: "agentplane-verify",
    displayName: "agentplane verify",
  },
  conversationProducer: {
    kind: "system",
    id: "agentplane-task-history",
    displayName: "agentplane task history",
  },
  defaultAnchor: {
    kind: "hackathon-registration",
    chain: "Base",
    producer: {
      kind: "chain",
      id: "base-mainnet",
      displayName: "Base Mainnet",
    },
    txUrl:
      "https://basescan.org/tx/0x2f06bc4d286d50e20aa55e4fc6bdb762c20cf219298be55aa688955c53e4230e",
  },
});

export function resolveAgentplaneProfile(overrides = {}) {
  return mergeObjects(DEFAULT_AGENTPLANE_PROFILE, overrides);
}
