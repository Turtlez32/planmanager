import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as db from "../lib/db.js";

const BASE_URL = process.env.BASE_URL ?? "https://plans.turtlez.au";

function ownerColor(owner: string): string {
  return (
    { claude: "#A78BFA", codex: "#7DD3C8", admin: "#F5C842" }[owner] ?? "#fff"
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderPlanRow(p: db.PlanRow): string {
  const color = ownerColor(p.owner_principal);
  const date = formatDate(p.updated_at);
  const url = `${BASE_URL}/p/${p.slug}`;
  return `
    <a href="${url}" class="plan-card">
      <div class="plan-dot" style="background:${color}"></div>
      <div class="plan-body">
        <div class="plan-title">${escHtml(p.title)}</div>
        <div class="plan-meta">${escHtml(p.owner_principal)} · rev ${p.revision} · ${date}</div>
      </div>
      <span class="plan-arrow">›</span>
    </a>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPage(plans: db.PlanRow[]): string {
  const rows = plans.map(renderPlanRow).join("\n");
  const count = plans.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Plans — Turtleware</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { min-height: 100vh; }
    body { font-family: 'DM Sans', Georgia, sans-serif; background: #1A1523; color: #fff; }

    .page { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }

    .header { margin-bottom: 48px; }
    .header-eyebrow {
      font-family: 'DM Mono', monospace;
      font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase;
      color: rgba(255,255,255,0.38); margin-bottom: 8px;
    }
    .header-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(2.4rem, 6vw, 3.8rem);
      line-height: 0.95; letter-spacing: -0.02em; color: #fff; margin-bottom: 16px;
    }
    .header-title em { font-style: italic; color: #A78BFA; }
    .header-sub { font-size: 14px; color: rgba(255,255,255,0.45); font-weight: 300; }

    .section-label {
      font-family: 'DM Mono', monospace;
      font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase;
      color: rgba(255,255,255,0.3); margin-bottom: 16px;
    }
    .count-badge {
      display: inline-block; font-family: 'DM Mono', monospace; font-size: 11px;
      color: #A78BFA; background: rgba(167,139,250,0.12);
      border: 1px solid rgba(167,139,250,0.2); border-radius: 20px;
      padding: 3px 10px; margin-left: 10px; letter-spacing: 0.5px;
    }

    .plan-list { display: flex; flex-direction: column; gap: 10px; }

    .plan-card {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; text-decoration: none; color: inherit;
      transition: background 0.15s, border-color 0.15s;
    }
    .plan-card:hover {
      background: rgba(167,139,250,0.08);
      border-color: rgba(167,139,250,0.25);
    }

    .plan-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .plan-body { flex: 1; min-width: 0; }
    .plan-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 17px; color: #fff;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
    }
    .plan-meta {
      font-family: 'DM Mono', monospace;
      font-size: 11px; color: rgba(255,255,255,0.32); letter-spacing: 0.3px;
    }
    .plan-arrow { font-size: 18px; color: rgba(255,255,255,0.2); flex-shrink: 0; }

    .empty { padding: 48px 0; text-align: center; font-family: 'DM Mono', monospace;
      font-size: 13px; color: rgba(255,255,255,0.28); letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <p class="header-eyebrow">Turtleware · plans.turtlez.au</p>
      <h1 class="header-title">Plan<br /><em>Manager</em></h1>
      <p class="header-sub">Active plans created by Claude, Codex, and admin.</p>
    </header>

    ${count === 0
      ? `<div class="empty">No plans yet.</div>`
      : `<p class="section-label">All plans <span class="count-badge">${count}</span></p>
         <div class="plan-list">${rows}</div>`
    }
  </div>
</body>
</html>`;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const plans = await db.listPlans(false);
  const html = renderPage(plans);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  return res.status(200).send(html);
}
