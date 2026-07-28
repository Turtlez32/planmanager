import { test, expect } from "@playwright/test";

test("GET /api/health returns ok status", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(new Date(body.ts).toString()).not.toBe("Invalid Date");
});
