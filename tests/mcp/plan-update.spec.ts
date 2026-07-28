import { test, expect } from "@playwright/test";
import { createPlan, deletePlan, getPlan, updatePlan } from "../helpers/mcp-client.js";

test.describe("plan_update authorization", () => {
  const createdSlugs: string[] = [];

  test.afterEach(async () => {
    while (createdSlugs.length) {
      const slug = createdSlugs.pop()!;
      await deletePlan(slug, true, "admin").catch(() => {});
    }
  });

  // The ownership check removal (lib/plans.ts) isn't deployed to production yet — unskip once it's live.
  test.skip("codex can update a plan claude owns (cross-review workflow)", async () => {
    const created = await createPlan("Cross-review test (claude-owned)", "<p>v1</p>", "claude");
    createdSlugs.push(created.slug);

    const result = await updatePlan(
      created.slug,
      "Cross-review test (claude-owned)",
      "<p>v2 via codex</p>",
      "codex",
      created.revision,
    );

    expect(result.isError).toBe(false);
    expect(result.data?.revision).toBe(created.revision + 1);

    const meta = await getPlan(created.slug, "admin");
    expect(meta.owner).toBe("claude"); // ownership doesn't transfer on a cross-principal update
    expect(meta.revision).toBe(created.revision + 1);
  });

  test.skip("claude can update a plan codex owns (cross-review workflow)", async () => {
    const created = await createPlan("Cross-review test (codex-owned)", "<p>v1</p>", "codex");
    createdSlugs.push(created.slug);

    const result = await updatePlan(
      created.slug,
      "Cross-review test (codex-owned)",
      "<p>v2 via claude</p>",
      "claude",
      created.revision,
    );

    expect(result.isError).toBe(false);
    expect(result.data?.revision).toBe(created.revision + 1);

    const meta = await getPlan(created.slug, "admin");
    expect(meta.owner).toBe("codex");
  });

  test("update rejects a stale/mismatched revision (conflict detection)", async () => {
    const created = await createPlan("Conflict detection test", "<p>v1</p>", "claude");
    createdSlugs.push(created.slug);

    const result = await updatePlan(
      created.slug,
      "Conflict detection test",
      "<p>v2</p>",
      "claude", // same owner — isolates conflict detection from the cross-principal update behavior below
      created.revision + 5,
    );

    expect(result.isError).toBe(true);
    expect(result.text).toContain("Revision conflict");
  });

  test("update rejects an unknown slug", async () => {
    const result = await updatePlan("zzzzzzzz", "Doesn't exist", "<p>v1</p>", "claude");
    expect(result.isError).toBe(true);
    expect(result.text).toContain("Plan not found");
  });
});
