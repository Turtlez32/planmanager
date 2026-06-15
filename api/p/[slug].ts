import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPlanBySlug } from "../../lib/db.js";
import { downloadPlanHtml } from "../../lib/blob.js";
import { sanitize, SECURITY_HEADERS } from "../../lib/content.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const slug = req.query["slug"];
  if (typeof slug !== "string" || !/^[a-z0-9]{8}$/.test(slug)) {
    res.status(400).end("Invalid slug");
    return;
  }

  const plan = await getPlanBySlug(slug);
  if (!plan) {
    res.status(404).end("Plan not found");
    return;
  }

  const raw = await downloadPlanHtml(plan.blob_url);
  const safe = sanitize(raw);

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(k, v);
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.status(200).end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(plan.title)}</title>
</head>
<body>
${safe}
</body>
</html>`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
