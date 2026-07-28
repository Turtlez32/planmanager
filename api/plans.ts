import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as db from "../lib/db.js";

const BASE_URL = process.env.BASE_URL ?? "https://plans.turtlez.au";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const plans = await db.listPlans(false);

  const body = plans.map((p) => ({
    slug: p.slug,
    title: p.title,
    url: `${BASE_URL}/p/${p.slug}`,
    owner: p.owner_principal,
    revision: p.revision,
    updated_at: p.updated_at,
  }));

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(body);
}
