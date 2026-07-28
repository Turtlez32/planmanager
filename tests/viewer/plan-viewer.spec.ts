import { test, expect } from "../fixtures.js";

test("renders a plan's HTML content at its public slug URL", async ({ page, plan }) => {
  const created = await plan("Playwright Viewer Test", "<h1>Hello from Playwright</h1><p>Body copy.</p>");

  await page.goto(`/p/${created.slug}`);

  await expect(page).toHaveTitle("Playwright Viewer Test");
  await expect(page.getByRole("heading", { name: "Hello from Playwright" })).toBeVisible();
  await expect(page.getByText("Body copy.")).toBeVisible();
});

test("strips <script> tags from plan HTML before rendering (XSS sanitization)", async ({ page, plan }) => {
  const payload = '<p>safe content</p><script>window.__xss = true;</script>';
  const created = await plan("Playwright Sanitization Test", payload);

  await page.goto(`/p/${created.slug}`);

  await expect(page.getByText("safe content")).toBeVisible();
  const scriptCount = await page.locator("script").count();
  expect(scriptCount).toBe(0);
  const xssFlag = await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss);
  expect(xssFlag).toBeUndefined();
});

test("returns 404 for a well-formed but non-existent slug", async ({ page }) => {
  const res = await page.goto("/p/aaaaaaaa");
  expect(res?.status()).toBe(404);
});

test("returns 400 for a malformed slug", async ({ page }) => {
  const res = await page.goto("/p/not-a-valid-slug!!");
  expect(res?.status()).toBe(400);
});
