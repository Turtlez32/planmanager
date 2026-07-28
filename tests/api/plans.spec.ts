import { test, expect } from "../fixtures.js";

test("GET /api/plans lists an active plan with expected shape", async ({ request, plan }) => {
  const created = await plan("Playwright API list test", "<p>list test</p>");

  const res = await request.get("/api/plans");
  expect(res.status()).toBe(200);

  const plans = await res.json();
  const found = plans.find((p: { slug: string }) => p.slug === created.slug);

  expect(found).toBeDefined();
  expect(found.title).toBe("Playwright API list test");
  expect(found.url).toBe(created.url);
  expect(found.owner).toBe("claude");
});

test("GET /api/plans rejects non-GET methods", async ({ request }) => {
  const res = await request.post("/api/plans");
  expect(res.status()).toBe(405);
});
