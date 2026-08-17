import { readFileSync } from "node:fs";
import { join } from "node:path";

export const PLAN_TEMPLATE_VERSION = "1.0.0";
export const PLAN_TEMPLATE_FILENAME = "plan-layout-template.html";

let cachedTemplate: string | undefined;

export function readPlanTemplate(): string {
  cachedTemplate ??= readFileSync(join(process.cwd(), PLAN_TEMPLATE_FILENAME), "utf8");
  return cachedTemplate;
}

export const PLAN_TEMPLATE_INSTRUCTIONS = [
  "Use this template as the starting point for every PlanManager plan.",
  "Preserve the document shell, design tokens, responsive rules, major section order, and reusable class names.",
  "Replace all example content with plan-specific content.",
  "Adapt, repeat, or omit content modules when the plan requires it, but keep the overall visual system consistent.",
  "Return a complete, self-contained HTML document to plan_create or plan_update.",
];
