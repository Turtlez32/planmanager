import { neon } from "@neondatabase/serverless";

const url = process.env.POSTGRES_URL;
if (!url) throw new Error("POSTGRES_URL is not set");

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS plans (
    id               SERIAL PRIMARY KEY,
    slug             TEXT NOT NULL UNIQUE,
    title            TEXT NOT NULL,
    blob_url         TEXT NOT NULL,
    owner_principal  TEXT NOT NULL,
    updated_by       TEXT NOT NULL,
    revision         INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
  )
`;

await sql`CREATE INDEX IF NOT EXISTS plans_slug_idx ON plans (slug)`;
await sql`CREATE INDEX IF NOT EXISTS plans_deleted_at_idx ON plans (deleted_at)`;

console.log("Migration complete.");
