import { test as base } from "@playwright/test";
import { createPlan, deletePlan, type CreatedPlan } from "./helpers/mcp-client.js";

export const test = base.extend<{ plan: (title: string, html: string) => Promise<CreatedPlan> }>({
  plan: async ({}, use) => {
    const created: string[] = [];

    await use(async (title: string, html: string) => {
      const plan = await createPlan(title, html);
      created.push(plan.slug);
      return plan;
    });

    for (const slug of created) {
      // hard delete requires admin auth — using the owning principal's token here
      // throws ForbiddenError and silently leaves the plan live in production.
      await deletePlan(slug, true, "admin").catch(() => {
        // best-effort cleanup — don't fail the test run over a leftover fixture plan
      });
    }
  },
});

export { expect } from "@playwright/test";
