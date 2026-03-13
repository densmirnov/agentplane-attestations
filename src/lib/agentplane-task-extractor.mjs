import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import { canonicalize } from "./canonical-json.mjs";
import { resolveAgentplaneProfile } from "./agentplane-profile.mjs";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function runCommand(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trimEnd();
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    throw new Error(
      `${command} ${args.join(" ")} failed${stderr ? `: ${stderr}` : "."}`,
    );
  }
}

function loadTaskMetadata(taskId, cwd) {
  return JSON.parse(runCommand("agentplane", ["task", "show", taskId], cwd));
}

function readTaskReadme(taskId, cwd) {
  const readmePath = resolve(cwd, ".agentplane", "tasks", taskId, "README.md");
  return {
    readmePath,
    content: readFileSync(readmePath, "utf8"),
  };
}

function splitReadme(readmeContent) {
  const match = readmeContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1] : readmeContent;
}

export function parseReadmeSections(readmeContent) {
  const body = splitReadme(readmeContent);
  const sections = {};
  let currentSection = null;
  let buffer = [];

  for (const line of body.split(/\r?\n/)) {
    const headingMatch = line.match(/^## (.+)$/);
    if (headingMatch) {
      if (currentSection) {
        sections[currentSection] = buffer.join("\n").trim();
      }
      currentSection = headingMatch[1];
      buffer = [];
      continue;
    }

    if (currentSection) {
      buffer.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = buffer.join("\n").trim();
  }

  return sections;
}

function readRuntimeVersion(cwd) {
  const configPath = resolve(cwd, ".agentplane", "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  return config.framework?.cli?.expected_version ?? "unknown";
}

function cleanCommandLabel(value) {
  return String(value ?? "")
    .trim()
    .replace(/^`/, "")
    .replace(/`$/, "");
}

function parseDiffCount(value) {
  return /^\d+$/.test(value) ? Number(value) : 0;
}

function resolveBranchForCommit(commitHash, cwd) {
  const currentBranch = runCommand(
    "git",
    ["rev-parse", "--abbrev-ref", "HEAD"],
    cwd,
  ).trim();

  if (!isNonEmptyString(commitHash)) {
    return currentBranch;
  }

  const branchesOutput = runCommand(
    "git",
    ["branch", "--contains", commitHash, "--format=%(refname:short)"],
    cwd,
  );
  const branches = branchesOutput
    .split(/\r?\n/)
    .map((branch) => branch.trim())
    .filter(Boolean);

  if (branches.includes(currentBranch)) {
    return currentBranch;
  }
  if (branches.includes("main")) {
    return "main";
  }

  return branches[0] ?? currentBranch;
}

function loadCommitMetadata(commitHash, cwd) {
  if (!isNonEmptyString(commitHash)) {
    return null;
  }

  const output = runCommand(
    "git",
    ["show", "--numstat", "--format=%H%n%aI%n%an%n%s", commitHash],
    cwd,
  );
  const [resolvedHash, authoredAt, authorName, subject, ...rows] =
    output.split(/\r?\n/);

  const filesChanged = [];
  let added = 0;
  let deleted = 0;

  for (const row of rows) {
    if (!row.trim()) {
      continue;
    }

    const [addedValue, deletedValue, ...pathParts] = row.split("\t");
    if (pathParts.length === 0) {
      continue;
    }

    filesChanged.push(pathParts.join("\t"));
    added += parseDiffCount(addedValue);
    deleted += parseDiffCount(deletedValue);
  }

  return {
    hash: resolvedHash,
    authoredAt,
    authorName,
    subject,
    filesChanged,
    diffStat: {
      added,
      deleted,
    },
  };
}

function pickFirstTimestamp(values) {
  return values.find(isNonEmptyString) ?? new Date().toISOString();
}

function pickLatestTimestamp(values) {
  const timestamps = values.filter(isNonEmptyString).sort();
  return timestamps.at(-1) ?? pickFirstTimestamp(values);
}

function normalizeParagraphs(sectionText) {
  return (sectionText ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function stripVerificationResults(sectionText) {
  return String(sectionText ?? "")
    .replace(
      /<!-- BEGIN VERIFICATION RESULTS -->[\s\S]*?<!-- END VERIFICATION RESULTS -->/g,
      "",
    )
    .trim();
}

function parseVerificationChecks(sectionText, verificationState) {
  const cleanedSection = stripVerificationResults(sectionText);
  const lines = cleanedSection.split(/\r?\n/);
  const checks = [];
  let currentBlock = null;
  let lastKey = null;

  function pushCurrentBlock() {
    if (!currentBlock) {
      return;
    }

    const label =
      currentBlock.Command ??
      currentBlock.Skipped ??
      `verification-check-${checks.length + 1}`;
    const result = String(currentBlock.Result ?? "")
      .trim()
      .toLowerCase();
    const status = currentBlock.Skipped
      ? "skip"
      : result === "pass"
        ? "pass"
        : result === "fail"
          ? "fail"
          : verificationState === "ok"
            ? "pass"
            : "fail";

    checks.push(
      canonicalize({
        name: cleanCommandLabel(label),
        required: true,
        status,
        ...(currentBlock.Evidence
          ? { evidence: currentBlock.Evidence.trim() }
          : {}),
        ...(currentBlock.Scope ? { scope: currentBlock.Scope.trim() } : {}),
        ...(currentBlock.Reason ? { reason: currentBlock.Reason.trim() } : {}),
        ...(currentBlock.Risk ? { risk: currentBlock.Risk.trim() } : {}),
        ...(currentBlock.Approval
          ? { approval: currentBlock.Approval.trim() }
          : {}),
      }),
    );

    currentBlock = null;
    lastKey = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    const itemMatch = trimmed.match(/^- ([A-Za-z ]+):\s*(.*)$/);
    if (itemMatch) {
      const [, key, value] = itemMatch;
      if (
        currentBlock &&
        (key === "Command" || key === "Skipped") &&
        (currentBlock.Command || currentBlock.Skipped)
      ) {
        pushCurrentBlock();
      }

      currentBlock ??= {};
      currentBlock[key] = value.trim();
      lastKey = key;
      continue;
    }

    if (!trimmed) {
      pushCurrentBlock();
      continue;
    }

    if (currentBlock && lastKey) {
      currentBlock[lastKey] = `${currentBlock[lastKey]} ${trimmed}`.trim();
    }
  }

  pushCurrentBlock();

  if (checks.length > 0) {
    return checks;
  }

  return [
    {
      name: "Task verification state",
      required: true,
      status: verificationState === "ok" ? "pass" : "fail",
    },
  ];
}

function normalizeApprovalState(state) {
  if (state === "approved") {
    return "approved";
  }
  if (state === "rejected") {
    return "rejected";
  }
  if (state === "waived") {
    return "waived";
  }

  return "missing";
}

function buildObservedApprovalActor(metadata, profile) {
  const updatedBy = metadata.plan_approval?.updated_by;
  if (
    isNonEmptyString(updatedBy) &&
    profile.approvalActors &&
    profile.approvalActors[updatedBy]
  ) {
    return profile.approvalActors[updatedBy];
  }

  if (isNonEmptyString(updatedBy)) {
    return {
      kind: "system",
      id: updatedBy,
      displayName: updatedBy,
    };
  }

  return {
    kind: "system",
    id: "agentplane-approval",
    displayName: "agentplane approval",
  };
}

function buildApprovalRationale(metadata) {
  if (!isNonEmptyString(metadata.plan_approval?.updated_by)) {
    return "No explicit plan approval route was recorded.";
  }

  return `Task plan approval was recorded by ${metadata.plan_approval.updated_by} through the agentplane approval checkpoint.`;
}

function buildConversationSummary(metadata) {
  const commentCount = metadata.comments?.length ?? 0;
  const eventCount = metadata.events?.length ?? 0;
  return `Task history captured ${commentCount} comments and ${eventCount} events in agentplane task artifacts.`;
}

function buildNotes({ metadata, sections, readmeLocatorPath, subject }) {
  const producer = {
    kind: "agent",
    id: subject.agentId,
    displayName: subject.displayName,
  };
  const notes = [];

  if (isNonEmptyString(sections.Findings)) {
    notes.push({
      generatedAt: metadata.doc_updated_at,
      producer,
      locator: {
        type: "agentplane-readme-section",
        path: readmeLocatorPath,
        section: "Findings",
      },
      text: sections.Findings.trim(),
    });
  }

  const verificationNarrative = normalizeParagraphs(
    stripVerificationResults(sections.Verification),
  )
    .filter((paragraph) => !paragraph.startsWith("- Command:"))
    .join(" ");
  if (isNonEmptyString(verificationNarrative)) {
    notes.push({
      generatedAt: metadata.verification?.updated_at ?? metadata.doc_updated_at,
      producer,
      locator: {
        type: "agentplane-readme-section",
        path: readmeLocatorPath,
        section: "Verification",
      },
      text: verificationNarrative,
    });
  }

  for (const [index, event] of (metadata.events ?? []).entries()) {
    const fragments = [
      `type=${event.type}`,
      event.from && event.to ? `${event.from}->${event.to}` : null,
      event.state ? `state=${event.state}` : null,
      event.note ?? null,
    ].filter(Boolean);
    notes.push({
      generatedAt: event.at,
      producer,
      locator: {
        type: "agentplane-task-event",
        path: readmeLocatorPath,
        index,
      },
      text: fragments.join(" | "),
    });
  }

  return notes;
}

export function extractAgentplaneTaskSnapshot({
  taskId,
  cwd = process.cwd(),
  profile: profileOverrides = {},
}) {
  const profile = resolveAgentplaneProfile(profileOverrides);
  const metadata = loadTaskMetadata(taskId, cwd);
  const { readmePath, content } = readTaskReadme(taskId, cwd);
  const sections = parseReadmeSections(content);
  const commitHash = metadata.commit?.hash ?? null;
  const commitMetadata = loadCommitMetadata(commitHash, cwd);
  const repoRoot = runCommand("git", ["rev-parse", "--show-toplevel"], cwd);
  const repoName = basename(repoRoot);
  const branch = resolveBranchForCommit(commitHash, cwd);
  const readmeLocatorPath = relative(cwd, readmePath);
  const taskGeneratedAt = pickFirstTimestamp([
    metadata.events?.[0]?.at,
    metadata.plan_approval?.updated_at,
    metadata.doc_updated_at,
    commitMetadata?.authoredAt,
  ]);
  const verificationChecks = parseVerificationChecks(
    sections.Verification,
    metadata.verification?.state,
  );
  const conversationAttached =
    (metadata.comments?.length ?? 0) > 0 || (metadata.events?.length ?? 0) > 0;
  const primaryApproval = {
    status: normalizeApprovalState(metadata.plan_approval?.state),
    generatedAt:
      metadata.plan_approval?.updated_at ??
      metadata.doc_updated_at ??
      taskGeneratedAt,
    actor: buildObservedApprovalActor(metadata, profile),
    rationale: buildApprovalRationale(metadata),
    locator: {
      type: "agentplane-frontmatter",
      path: readmeLocatorPath,
      field: "plan_approval",
    },
  };

  return canonicalize({
    runtime: "agentplane",
    runtimeVersion: readRuntimeVersion(cwd),
    bundleId: `agentplane-task-${metadata.id}`,
    subject: profile.subject,
    project: profile.project,
    task: {
      id: metadata.id,
      title: metadata.title,
      generatedAt: taskGeneratedAt,
      locator: {
        type: "agentplane-readme-section",
        path: readmeLocatorPath,
        section: "Summary",
      },
      summary:
        normalizeParagraphs(sections.Summary)[0] ??
        metadata.description ??
        metadata.title,
      ...(normalizeParagraphs(sections.Scope).length > 0
        ? { scope: normalizeParagraphs(sections.Scope) }
        : {}),
      ...(isNonEmptyString(metadata.description)
        ? { requestedOutcome: metadata.description }
        : {}),
    },
    approvals: {
      primary: primaryApproval,
      decisions: [primaryApproval],
    },
    execution: {
      generatedAt:
        commitMetadata?.authoredAt ??
        metadata.doc_updated_at ??
        taskGeneratedAt,
      producer: {
        kind: "agent",
        id: profile.subject.agentId,
        displayName: profile.subject.displayName,
      },
      repo: repoName,
      branch,
      commit: commitHash,
      filesChanged: commitMetadata?.filesChanged ?? [],
      diffStat: commitMetadata?.diffStat ?? {
        added: 0,
        deleted: 0,
      },
      locator: commitMetadata
        ? {
            type: "git-commit",
            hash: commitMetadata.hash,
            subject: commitMetadata.subject,
            authorName: commitMetadata.authorName,
          }
        : {
            type: "agentplane-frontmatter",
            path: readmeLocatorPath,
            field: "commit",
          },
    },
    verification: {
      generatedAt:
        metadata.verification?.updated_at ??
        pickLatestTimestamp((metadata.events ?? []).map((event) => event.at)) ??
        metadata.doc_updated_at,
      producer: profile.verificationProducer,
      conversationLogAttached: conversationAttached,
      checks: verificationChecks,
      locator: {
        type: "agentplane-readme-section",
        path: readmeLocatorPath,
        section: "Verification",
      },
    },
    conversation: {
      generatedAt: pickLatestTimestamp([
        ...(metadata.events ?? []).map((event) => event.at),
        metadata.doc_updated_at,
      ]),
      producer: profile.conversationProducer,
      attached: conversationAttached,
      summary: buildConversationSummary(metadata),
      locator: {
        type: "agentplane-task-history",
        path: readmeLocatorPath,
      },
    },
    ...(profile.defaultAnchor
      ? {
          anchors: [
            {
              generatedAt:
                metadata.plan_approval?.updated_at ??
                metadata.doc_updated_at ??
                taskGeneratedAt,
              producer: profile.defaultAnchor.producer,
              kind: profile.defaultAnchor.kind,
              chain: profile.defaultAnchor.chain,
              txUrl: profile.defaultAnchor.txUrl,
              locator: {
                type: "agentplane-profile-default",
                source: "DEFAULT_AGENTPLANE_PROFILE",
              },
            },
          ],
        }
      : {}),
    notes: buildNotes({
      metadata,
      sections,
      readmeLocatorPath,
      subject: profile.subject,
    }),
  });
}
