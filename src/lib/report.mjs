function badgeClass(verdict) {
  switch (verdict) {
    case "trusted":
      return "trusted";
    case "caution":
      return "caution";
    default:
      return "reject";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderCheckList(checks) {
  return checks
    .map(
      (check) =>
        `<li><strong>${escapeHtml(check.name)}</strong> · ${escapeHtml(check.status)}${
          check.required ? " · required" : ""
        }</li>`,
    )
    .join("");
}

function recommendedAction(verdict) {
  switch (verdict) {
    case "trusted":
      return "Accept this result for downstream use";
    case "caution":
      return "Review manually before accepting";
    default:
      return "Do not accept this result yet";
  }
}

function verdictSummary(verdict) {
  switch (verdict) {
    case "trusted":
      return "This run met the trust gate: approved scope, observed execution, passing checks, and portable provenance.";
    case "caution":
      return "This run has meaningful evidence, but not enough to automate trust without human review.";
    default:
      return "This run failed the trust gate. The system is refusing trust instead of asking you to guess.";
  }
}

export function renderAttestationReport({
  attestation,
  verification,
  anchorReceipt = null,
  avatarFileName,
}) {
  const registrationAnchor = attestation.anchors?.registration;
  const attestationAnchor = anchorReceipt?.submission ?? null;
  const filesChanged = attestation.evidence.execution.filesChanged ?? [];
  const adapter = attestation.inputSurface?.adapter;
  const realRuntimePath =
    attestation.inputSurface?.bundleId?.startsWith("agentplane-task-") ?? false;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(attestation.product)} · ${escapeHtml(attestation.attestationId)}</title>
    <style>
      :root {
        --bg: #08111f;
        --panel: rgba(11, 17, 31, 0.88);
        --panel-border: rgba(164, 188, 212, 0.18);
        --text: #edf3e8;
        --muted: #98a9bc;
        --trusted: #2cb67d;
        --caution: #f59e0b;
        --reject: #ef4444;
        --accent: #7dd3fc;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "IBM Plex Sans", "Trebuchet MS", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(44, 182, 125, 0.22), transparent 28%),
          radial-gradient(circle at top right, rgba(125, 211, 252, 0.18), transparent 24%),
          linear-gradient(180deg, #08111f 0%, #0f1b31 100%);
      }

      main {
        max-width: 1120px;
        margin: 0 auto;
        padding: 48px 24px 64px;
      }

      .hero,
      .summary,
      .grid > section {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 24px;
        backdrop-filter: blur(18px);
      }

      .hero {
        display: grid;
        grid-template-columns: 96px 1fr;
        gap: 24px;
        padding: 28px;
      }

      .avatar {
        width: 96px;
        height: 96px;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      h1 {
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .subtitle {
        margin-top: 12px;
        color: var(--muted);
        max-width: 62ch;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }

      .badge,
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.03);
        font-size: 0.95rem;
      }

      .badge.trusted {
        border-color: rgba(44, 182, 125, 0.4);
        color: var(--trusted);
      }

      .badge.caution {
        border-color: rgba(245, 158, 11, 0.4);
        color: var(--caution);
      }

      .badge.reject {
        border-color: rgba(239, 68, 68, 0.4);
        color: var(--reject);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 22px;
      }

      .grid > section {
        padding: 22px;
      }

      h2 {
        font-size: 1.1rem;
        letter-spacing: 0.01em;
      }

      ul {
        margin: 14px 0 0;
        padding-left: 20px;
        color: var(--muted);
      }

      li + li {
        margin-top: 8px;
      }

      a {
        color: var(--accent);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 18px;
      }

      .stats div {
        padding: 14px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .stats strong {
        display: block;
        font-size: 1.55rem;
        line-height: 1;
      }

      .stats span {
        display: block;
        margin-top: 8px;
        color: var(--muted);
      }

      .summary {
        margin-top: 22px;
        padding: 24px 28px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 18px;
        margin-top: 18px;
      }

      .summary-grid div {
        padding: 16px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .eyebrow {
        color: var(--accent);
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      code {
        font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
        color: #d2e8ff;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <img class="avatar" src="${escapeHtml(avatarFileName)}" alt="agentplane favicon-style avatar" />
        <div>
          <div class="meta">
            <span class="badge ${badgeClass(verification.verdict)}">${escapeHtml(
              verification.verdict.toUpperCase(),
            )}</span>
            <span class="chip">Score ${escapeHtml(verification.score)}</span>
            <span class="chip">${escapeHtml(recommendedAction(verification.verdict))}</span>
            <span class="chip">${escapeHtml(attestation.subject.harness)} · ${escapeHtml(
              attestation.subject.model,
            )}</span>
          </div>
          <h1>${escapeHtml(attestation.product)}</h1>
          <p class="subtitle">${escapeHtml(verdictSummary(verification.verdict))}</p>
          <div class="stats">
            <div><strong>${escapeHtml(attestation.evidence.task.id)}</strong><span>Task ID</span></div>
            <div><strong>${escapeHtml(String(filesChanged.length))}</strong><span>Changed files</span></div>
            <div><strong>${escapeHtml(attestation.project.theme)}</strong><span>Theme</span></div>
          </div>
        </div>
      </section>

      <section class="summary">
        <p class="eyebrow">Why this matters</p>
        <p class="subtitle">Most agent demos show output. This report shows whether that output should be accepted, merged, or deployed.</p>
        <div class="summary-grid">
          <div>
            <h2>Decision</h2>
            <p class="subtitle">${escapeHtml(recommendedAction(verification.verdict))}</p>
          </div>
          <div>
            <h2>Evidence source</h2>
            <p class="subtitle">${escapeHtml(
              realRuntimePath
                ? "Trusted path is derived from a real completed agentplane task."
                : "This attestation was generated from a canonical bundle fixture.",
            )}</p>
          </div>
          <div>
            <h2>Anchor state</h2>
            <p class="subtitle">${escapeHtml(
              attestationAnchor?.txUrl
                ? "Digest confirmed on Base."
                : anchorReceipt
                  ? `Digest prepared for Base anchoring (${anchorReceipt.submission.mode}).`
                  : "No attestation-specific Base anchor prepared.",
            )}</p>
          </div>
        </div>
      </section>

      <section class="grid">
        <section>
          <h2>Claims</h2>
          <ul>${renderList(
            Object.entries(attestation.claims).map(
              ([claim, value]) => `${claim}: ${value ? "yes" : "no"}`,
            ),
          )}</ul>
        </section>

        <section>
          <h2>Input surface</h2>
          <ul>${renderList([
            `type: ${attestation.inputSurface?.type ?? "unknown"}`,
            `bundle id: ${attestation.inputSurface?.bundleId ?? "n/a"}`,
            `adapter: ${adapter ? `${adapter.adapterId} (${adapter.runtime})` : "direct bundle"}`,
          ])}</ul>
        </section>

        <section>
          <h2>Verification checks</h2>
          <ul>${renderCheckList(attestation.evidence.verification.checks)}</ul>
        </section>

        <section>
          <h2>Why it was trusted</h2>
          <ul>${renderList(verification.reasons)}</ul>
        </section>

        <section>
          <h2>Why trust would be refused</h2>
          <ul>${renderList(verification.warnings.length > 0 ? verification.warnings : ["No warnings."])}</ul>
        </section>

        <section>
          <h2>Execution proof</h2>
          <ul>${renderList([
            `repo: ${attestation.evidence.execution.repo ?? "n/a"}`,
            `branch: ${attestation.evidence.execution.branch ?? "n/a"}`,
            `commit: ${attestation.evidence.execution.commit ?? "n/a"}`,
            `added lines: ${attestation.evidence.execution.diffStat.added}`,
            `deleted lines: ${attestation.evidence.execution.diffStat.deleted}`,
          ])}</ul>
        </section>

        <section>
          <h2>Attestation anchor</h2>
          <ul>${renderList([
            anchorReceipt
              ? `chain: ${anchorReceipt.network.chain}`
              : "chain: none",
            anchorReceipt
              ? `mode: ${anchorReceipt.submission.mode}`
              : "mode: not prepared",
            anchorReceipt
              ? `protocol: ${anchorReceipt.anchorSubject.protocol}`
              : "protocol: n/a",
            `digest: ${attestation.integrity.attestationDigest.slice(0, 18)}...`,
          ])}</ul>
          ${
            attestationAnchor?.txUrl
              ? `<p class="subtitle" style="margin-top: 14px;">Attestation digest anchored on Base: <a href="${escapeHtml(
                  attestationAnchor.txUrl,
                )}">${escapeHtml(attestationAnchor.txUrl)}</a></p>`
              : anchorReceipt
                ? '<p class="subtitle" style="margin-top: 14px;">Anchor payload is prepared. Only the attestation digest is intended for on-chain anchoring; the full attestation remains off-chain.</p>'
                : '<p class="subtitle" style="margin-top: 14px;">No attestation-specific Base anchor has been prepared yet.</p>'
          }
        </section>

        <section>
          <h2>Registration anchor</h2>
          <ul>${renderList([
            registrationAnchor
              ? `chain: ${registrationAnchor.chain}`
              : "chain: none",
            registrationAnchor
              ? `kind: ${registrationAnchor.kind}`
              : "kind: none",
            anchorReceipt?.anchorSubject?.message
              ? `payload: ${anchorReceipt.anchorSubject.message.slice(0, 40)}...`
              : "payload: n/a",
          ])}</ul>
          ${
            registrationAnchor
              ? `<p class="subtitle" style="margin-top: 14px;">Hackathon registration anchor: <a href="${escapeHtml(
                  registrationAnchor.txUrl,
                )}">${escapeHtml(registrationAnchor.txUrl)}</a></p>`
              : '<p class="subtitle" style="margin-top: 14px;">No registration anchor is attached.</p>'
          }
        </section>
      </section>
    </main>
  </body>
</html>`;
}

export function buildDemoIndex({
  trusted,
  rejected,
  trustedVerification,
  rejectedVerification,
  trustedAnchor = null,
  trustedTaskId = null,
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>agentplane Attestations Demo</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "IBM Plex Sans", "Trebuchet MS", sans-serif;
        color: #edf3e8;
        background:
          radial-gradient(circle at top left, rgba(44, 182, 125, 0.18), transparent 24%),
          linear-gradient(180deg, #07111f 0%, #102038 100%);
      }

      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 48px 24px 64px;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        font-size: clamp(2.2rem, 5vw, 3.6rem);
        letter-spacing: -0.05em;
      }

      p {
        margin-top: 14px;
        color: #9bb0c5;
        max-width: 60ch;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 28px;
      }

      .card {
        padding: 22px;
        border-radius: 24px;
        background: rgba(6, 12, 24, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .tag {
        display: inline-block;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.03);
      }

      a {
        color: #7dd3fc;
      }

      ul {
        margin: 16px 0 0;
        padding-left: 20px;
        color: #c7d6e6;
      }

      .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.95fr);
        gap: 20px;
        margin-top: 28px;
      }

      .panel {
        padding: 24px;
        border-radius: 24px;
        background: rgba(6, 12, 24, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .eyebrow {
        color: #7dd3fc;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
    </style>
  </head>
  <body>
    <main>
      <span class="tag">Hackathon MVP</span>
      <h1>agentplane Attestations</h1>
      <p>Trust is not a log dump. This demo shows a trust gate for agent-delivered work: one real completed task gets accepted, one controlled negative path gets rejected, and the trusted digest can be prepared for Base anchoring.</p>

      <section class="hero-grid">
        <article class="panel">
          <p class="eyebrow">Judge framing</p>
          <h2 style="margin-top: 8px;">What you should see in under three minutes</h2>
          <ul>
            <li>A real completed agentplane task becomes a trusted attestation.</li>
            <li>A negative path is explicitly rejected instead of silently passing through.</li>
            <li>The trusted attestation produces a portable Base anchor receipt tied only to its digest.</li>
          </ul>
        </article>

        <article class="panel">
          <p class="eyebrow">Trusted source</p>
          <h2 style="margin-top: 8px;">Real task evidence</h2>
          <p>Trusted path source task: <strong>${escapeHtml(trustedTaskId ?? trusted.evidence.task.id)}</strong></p>
          <ul>
            <li>Verdict: ${escapeHtml(trustedVerification.verdict)}</li>
            <li>Score: ${escapeHtml(trustedVerification.score)}</li>
            <li>Anchor mode: ${escapeHtml(trustedAnchor?.submission?.mode ?? "none")}</li>
          </ul>
        </article>
      </section>

      <section class="cards">
        <article class="card">
          <h2>Trusted path</h2>
          <p>Task ${escapeHtml(trusted.evidence.task.id)} scored ${escapeHtml(
            trustedVerification.score,
          )} and produced a ${escapeHtml(trustedVerification.verdict)} verdict${
            trustedAnchor
              ? ` with ${escapeHtml(trustedAnchor.submission.mode)} Base anchor evidence.`
              : "."
          }</p>
          <ul>
            <li><a href="./trusted-attestation.json">Open trusted attestation JSON</a></li>
            ${
              trustedAnchor
                ? '<li><a href="./trusted-anchor.json">Open trusted anchor receipt</a></li>'
                : ""
            }
            <li><a href="./trusted-report.html">Open trusted report</a></li>
          </ul>
        </article>

        <article class="card">
          <h2>Rejected path</h2>
          <p>Task ${escapeHtml(rejected.evidence.task.id)} scored ${escapeHtml(
            rejectedVerification.score,
          )} and produced a ${escapeHtml(rejectedVerification.verdict)} verdict.</p>
          <ul>
            <li><a href="./rejected-attestation.json">Open rejected attestation JSON</a></li>
            <li><a href="./rejected-report.html">Open rejected report</a></li>
          </ul>
        </article>

        <article class="card">
          <h2>Walkthrough</h2>
          <p>Use the scripted flow instead of ad-libbing the product story.</p>
          <ul>
            <li><a href="../docs/demo-script.md">Open demo script</a></li>
            <li><a href="./trusted-runtime.json">Open trusted runtime snapshot</a></li>
            <li><a href="../README.md">Open README</a></li>
          </ul>
        </article>
      </section>
    </main>
  </body>
</html>`;
}
