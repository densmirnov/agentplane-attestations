function hasExecutionProof(execution) {
  return Boolean(execution?.repo && execution?.branch && execution?.commit);
}

function hasChangedFiles(execution) {
  return Array.isArray(execution?.filesChanged) && execution.filesChanged.length > 0;
}

function hasHumanApproval(approvals) {
  return approvals?.human?.status === 'approved';
}

function hasRegistrationAnchor(anchors) {
  return Boolean(anchors?.registration?.txUrl && anchors?.registration?.chain === 'Base');
}

function getRequiredChecks(checks) {
  return (checks ?? []).filter((check) => check.required);
}

function allRequiredChecksPass(checks) {
  const requiredChecks = getRequiredChecks(checks);
  return requiredChecks.length > 0 && requiredChecks.every((check) => check.status === 'pass');
}

function hasConversationLog(verification) {
  return verification?.conversationLogAttached === true;
}

export function evaluateTrust(evidence) {
  const reasons = [];
  const warnings = [];
  let score = 0;

  if (evidence?.task?.approved) {
    score += 20;
    reasons.push('Approved scope is present.');
  } else {
    warnings.push('Missing approved scope.');
  }

  if (hasHumanApproval(evidence?.approvals)) {
    score += 10;
    reasons.push('Human approval is attached.');
  } else {
    warnings.push('Human approval is missing.');
  }

  if (hasExecutionProof(evidence?.execution)) {
    score += 15;
    reasons.push('Execution proof includes repo, branch, and commit.');
  } else {
    warnings.push('Execution proof is incomplete.');
  }

  if (hasChangedFiles(evidence?.execution)) {
    score += 10;
    reasons.push('Changed files are listed.');
  } else {
    warnings.push('No changed files were captured.');
  }

  if (allRequiredChecksPass(evidence?.verification?.checks)) {
    score += 25;
    reasons.push('All required verification checks passed.');
  } else {
    warnings.push('One or more required verification checks failed.');
  }

  if (hasConversationLog(evidence?.verification)) {
    score += 10;
    reasons.push('Conversation log is attached.');
  } else {
    warnings.push('Conversation log is missing.');
  }

  if (hasRegistrationAnchor(evidence?.anchors)) {
    score += 10;
    reasons.push('A Base anchor is present.');
  } else {
    warnings.push('No Base anchor is present.');
  }

  const hardFailure =
    !evidence?.task?.approved ||
    !hasHumanApproval(evidence?.approvals) ||
    !allRequiredChecksPass(evidence?.verification?.checks);

  let verdict = 'reject';
  if (!hardFailure && score >= 80) {
    verdict = 'trusted';
  } else if (!hardFailure && score >= 55) {
    verdict = 'caution';
  }

  return {
    score,
    verdict,
    reasons,
    warnings
  };
}
