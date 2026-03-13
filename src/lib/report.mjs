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

export function renderAttestationReport({
  attestation,
  verification,
  avatarFileName,
}) {
  const anchor = attestation.anchors?.registration;
  const filesChanged = attestation.evidence.execution.filesChanged ?? [];
  const adapter = attestation.inputSurface?.adapter;

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
            <span class="chip">${escapeHtml(attestation.subject.harness)} · ${escapeHtml(
              attestation.subject.model,
            )}</span>
          </div>
          <h1>${escapeHtml(attestation.product)}</h1>
          <p class="subtitle">${escapeHtml(attestation.project.problem)}</p>
          <div class="stats">
            <div><strong>${escapeHtml(attestation.evidence.task.id)}</strong><span>Task ID</span></div>
            <div><strong>${escapeHtml(String(filesChanged.length))}</strong><span>Changed files</span></div>
            <div><strong>${escapeHtml(attestation.project.theme)}</strong><span>Theme</span></div>
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
          <h2>Trust reasons</h2>
          <ul>${renderList(verification.reasons)}</ul>
        </section>

        <section>
          <h2>Warnings</h2>
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
          <h2>Anchor</h2>
          <ul>${renderList([
            anchor ? `chain: ${anchor.chain}` : "chain: none",
            anchor ? `kind: ${anchor.kind}` : "kind: none",
            `digest: ${attestation.integrity.attestationDigest.slice(0, 18)}...`,
          ])}</ul>
          ${
            anchor
              ? `<p class="subtitle" style="margin-top: 14px;">Public registration anchor: <a href="${escapeHtml(
                  anchor.txUrl,
                )}">${escapeHtml(anchor.txUrl)}</a></p>`
              : '<p class="subtitle" style="margin-top: 14px;">No Base anchor is attached.</p>'
          }
        </section>
      </section>
    </main>
  </body>
</html>`;
}

export function buildDemoIndex({
  passing,
  failing,
  passingVerification,
  failingVerification,
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
    </style>
  </head>
  <body>
    <main>
      <span class="tag">Hackathon MVP</span>
      <h1>agentplane Attestations</h1>
      <p>Trust is not a log dump. This demo compares a trusted attestation and a rejected attestation produced from explicit evidence and policy rules, both emitted through the built-in agentplane runtime adapter.</p>

      <section class="cards">
        <article class="card">
          <h2>Trusted path</h2>
          <p>Task ${escapeHtml(passing.evidence.task.id)} scored ${escapeHtml(
            passingVerification.score,
          )} and produced a ${escapeHtml(passingVerification.verdict)} verdict.</p>
          <ul>
            <li><a href="./passing-attestation.json">Open passing attestation JSON</a></li>
            <li><a href="./passing-report.html">Open passing report</a></li>
          </ul>
        </article>

        <article class="card">
          <h2>Rejected path</h2>
          <p>Task ${escapeHtml(failing.evidence.task.id)} scored ${escapeHtml(
            failingVerification.score,
          )} and produced a ${escapeHtml(failingVerification.verdict)} verdict.</p>
          <ul>
            <li><a href="./failing-attestation.json">Open failing attestation JSON</a></li>
            <li><a href="./failing-report.html">Open failing report</a></li>
          </ul>
        </article>
      </section>
    </main>
  </body>
</html>`;
}
