import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "../fixtures.js";

interface Sample {
  name: string;
  ms: number;
}

const samples: Sample[] = [];

async function timed<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  samples.push({ name, ms: performance.now() - start });
  return result;
}

test.describe("round-trip latency", () => {
  test("plan create -> viewer render round trip", async ({ page, plan }) => {
    const created = await timed("mcp:plan_create", () =>
      plan("Playwright Benchmark Plan", "<p>benchmark content</p>"),
    );

    const res = await timed("http:GET /p/:slug", () => page.goto(`/p/${created.slug}`));
    expect(res?.status()).toBe(200);

    await timed("http:GET /api/health", async () => page.request.get("/api/health"));
    await timed("http:GET /api/plans", async () => page.request.get("/api/plans"));
  });

  test.afterAll(async () => {
    await mkdir("benchmark-results", { recursive: true });
    const run = { timestamp: new Date().toISOString(), samples };
    await writeFile(
      `benchmark-results/${Date.now()}.json`,
      JSON.stringify(run, null, 2),
    );
  });
});
