import { test, expect } from "@playwright/test";
import { readTemplate } from "../helpers/mcp-client.js";

test.describe("template_read", () => {
  test("returns the versioned canonical HTML layout and agent instructions", async () => {
    const template = await readTemplate("codex");

    expect(template.filename).toBe("plan-layout-template.html");
    expect(template.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(template.instructions.join(" ")).toContain("starting point");
    expect(template.html).toContain("<!doctype html>");
    expect(template.html).toContain("TEMPLATE CONTRACT");
    expect(template.html).toContain("Detailed feature specification");
    expect(template.html).toContain("Layout styling");
  });
});
