import type { AuthContext } from "./auth.js";
import * as db from "./db.js";
import { uploadPlanHtml, deletePlanBlob } from "./blob.js";
import { generateSlug } from "./slug.js";

export class ForbiddenError extends Error {}
export class NotFoundError extends Error {}
export class ConflictError extends Error {}

export async function createPlan(
  auth: AuthContext,
  title: string,
  html: string,
): Promise<db.PlanRow> {
  const slug = generateSlug();
  const blobUrl = await uploadPlanHtml(slug, html);
  return db.createPlan(slug, title, blobUrl, auth.principal);
}

export async function updatePlan(
  auth: AuthContext,
  slug: string,
  title: string,
  html: string,
  expectedRevision?: number,
): Promise<db.PlanRow> {
  const plan = await db.getPlanBySlug(slug);
  if (!plan) throw new NotFoundError(`Plan not found: ${slug}`);

  if (expectedRevision !== undefined && plan.revision !== expectedRevision) {
    throw new ConflictError(
      `Revision conflict: expected ${expectedRevision}, got ${plan.revision}`,
    );
  }

  const blobUrl = await uploadPlanHtml(slug, html);
  return db.updatePlan(plan.id, title, blobUrl, auth.principal);
}

export async function deletePlan(
  auth: AuthContext,
  slug: string,
  hard = false,
): Promise<void> {
  const plan = await db.getPlanBySlug(slug);
  if (!plan) throw new NotFoundError(`Plan not found: ${slug}`);

  if (!auth.isAdmin && plan.owner_principal !== auth.principal) {
    throw new ForbiddenError("You do not own this plan");
  }

  if (hard) {
    if (!auth.isAdmin) throw new ForbiddenError("Hard delete requires admin");
    await deletePlanBlob(plan.blob_url);
    await db.hardDeletePlan(plan.id);
  } else {
    await db.softDeletePlan(plan.id);
  }
}

export async function listPlans(auth: AuthContext): Promise<db.PlanRow[]> {
  return db.listPlans(auth.isAdmin);
}

export async function getPlan(slug: string): Promise<db.PlanRow> {
  const plan = await db.getPlanBySlug(slug);
  if (!plan) throw new NotFoundError(`Plan not found: ${slug}`);
  return plan;
}
