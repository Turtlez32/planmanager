import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set");
  return neon(url);
}

export interface PlanRow {
  id: number;
  slug: string;
  title: string;
  blob_url: string;
  owner_principal: string;
  updated_by: string;
  revision: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export async function getPlanBySlug(slug: string): Promise<PlanRow | null> {
  const sql = getDb();
  const rows = await sql<PlanRow[]>`
    SELECT * FROM plans WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getPlanById(id: number): Promise<PlanRow | null> {
  const sql = getDb();
  const rows = await sql<PlanRow[]>`
    SELECT * FROM plans WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function listPlans(includeDeleted = false): Promise<PlanRow[]> {
  const sql = getDb();
  if (includeDeleted) {
    return sql<PlanRow[]>`SELECT * FROM plans ORDER BY updated_at DESC`;
  }
  return sql<PlanRow[]>`SELECT * FROM plans WHERE deleted_at IS NULL ORDER BY updated_at DESC`;
}

export async function createPlan(
  slug: string,
  title: string,
  blobUrl: string,
  ownerPrincipal: string,
): Promise<PlanRow> {
  const sql = getDb();
  const rows = await sql<PlanRow[]>`
    INSERT INTO plans (slug, title, blob_url, owner_principal, updated_by)
    VALUES (${slug}, ${title}, ${blobUrl}, ${ownerPrincipal}, ${ownerPrincipal})
    RETURNING *
  `;
  return rows[0]!;
}

export async function updatePlan(
  id: number,
  title: string,
  blobUrl: string,
  updatedBy: string,
): Promise<PlanRow> {
  const sql = getDb();
  const rows = await sql<PlanRow[]>`
    UPDATE plans
    SET title = ${title}, blob_url = ${blobUrl}, updated_by = ${updatedBy},
        revision = revision + 1, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0]!;
}

export async function softDeletePlan(id: number): Promise<void> {
  const sql = getDb();
  await sql`UPDATE plans SET deleted_at = NOW() WHERE id = ${id}`;
}

export async function hardDeletePlan(id: number): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM plans WHERE id = ${id}`;
}
