function normalizeDecision(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    status: value.status ?? "missing",
    actorKind: value.actorKind ?? null,
    actorId: value.actorId ?? null,
    actorName: value.actorName ?? null,
    rationale: value.rationale ?? null,
    observedAt: value.observedAt ?? null,
    locator: value.locator ?? null,
  };
}

function normalizeLegacyHumanApproval(humanApproval) {
  if (!humanApproval || typeof humanApproval !== "object") {
    return null;
  }

  return {
    status: humanApproval.status ?? "missing",
    actorKind: "human",
    actorId: humanApproval.actorId ?? null,
    actorName: humanApproval.actor ?? humanApproval.actorName ?? null,
    rationale: humanApproval.rationale ?? null,
    observedAt: humanApproval.observedAt ?? null,
    locator: humanApproval.locator ?? null,
  };
}

export function getApprovalDecisions(approvals) {
  if (Array.isArray(approvals?.decisions) && approvals.decisions.length > 0) {
    return approvals.decisions.map(normalizeDecision).filter(Boolean);
  }

  const primary = normalizeDecision(approvals?.primary);
  if (primary) {
    return [primary];
  }

  const legacyHuman = normalizeLegacyHumanApproval(approvals?.human);
  if (legacyHuman) {
    return [legacyHuman];
  }

  return [];
}

export function getPrimaryApprovalDecision(approvals) {
  const decisions = getApprovalDecisions(approvals);
  return (
    decisions.at(-1) ?? {
      status: "missing",
      actorKind: null,
      actorId: null,
      actorName: null,
      rationale: null,
      observedAt: null,
      locator: null,
    }
  );
}

export function getHumanSignoff(approvals) {
  return (
    getApprovalDecisions(approvals).findLast(
      (decision) =>
        decision.actorKind === "human" && decision.status === "approved",
    ) ?? null
  );
}

export function hasApprovedDecision(approvals) {
  return getPrimaryApprovalDecision(approvals).status === "approved";
}

export function hasHumanSignoff(approvals) {
  return Boolean(getHumanSignoff(approvals));
}
