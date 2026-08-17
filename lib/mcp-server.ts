import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthContext } from "./auth.js";
import * as plans from "./plans.js";
import {
  PLAN_TEMPLATE_FILENAME,
  PLAN_TEMPLATE_INSTRUCTIONS,
  PLAN_TEMPLATE_VERSION,
  readPlanTemplate,
} from "./plan-template.js";

export function buildMcpServer(auth: AuthContext): McpServer {
  const server = new McpServer({
    name: "planmanager",
    version: "1.1.0",
  });

  server.tool(
    "template_read",
    "Read the canonical PlanManager HTML layout. Call this before plan_create or plan_update, use it as the starting document, and adapt its example modules to the plan while preserving the shared visual system.",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            filename: PLAN_TEMPLATE_FILENAME,
            version: PLAN_TEMPLATE_VERSION,
            instructions: PLAN_TEMPLATE_INSTRUCTIONS,
            html: readPlanTemplate(),
          }),
        },
      ],
    }),
  );

  server.tool(
    "plan_create",
    "Create a new plan and return its public slug URL. REQUIRED WORKFLOW: call template_read first, begin with its HTML, replace the example content, and preserve the shared layout system unless the plan genuinely needs a module adapted.",
    {
      title: z.string().min(1).max(200).describe("Plan title"),
      html: z.string().min(1).describe("Complete plan HTML derived from the latest template_read result"),
    },
    async ({ title, html }) => {
      const plan = await plans.createPlan(auth, title, html);
      const baseUrl = process.env.BASE_URL ?? "";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              slug: plan.slug,
              url: `${baseUrl}/p/${plan.slug}`,
              revision: plan.revision,
            }),
          },
        ],
      };
    },
  );

  server.tool(
    "plan_update",
    "Update an existing plan you own. For layout changes or substantial rewrites, call template_read first and keep the plan aligned with its shared visual system.",
    {
      slug: z.string().length(8).describe("Plan slug"),
      title: z.string().min(1).max(200).describe("Plan title"),
      html: z.string().min(1).describe("Complete updated plan HTML aligned with the latest template_read result"),
      revision: z.number().int().optional().describe("Expected current revision for conflict detection"),
    },
    async ({ slug, title, html, revision }) => {
      const plan = await plans.updatePlan(auth, slug, title, html, revision);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              slug: plan.slug,
              revision: plan.revision,
              updated_at: plan.updated_at,
            }),
          },
        ],
      };
    },
  );

  server.tool(
    "plan_delete",
    "Soft-delete a plan you own. Use hard=true (admin only) to permanently remove.",
    {
      slug: z.string().length(8).describe("Plan slug"),
      hard: z.boolean().optional().default(false).describe("Permanent delete (admin only)"),
    },
    async ({ slug, hard }) => {
      await plans.deletePlan(auth, slug, hard);
      return {
        content: [{ type: "text", text: JSON.stringify({ deleted: slug, hard }) }],
      };
    },
  );

  server.tool(
    "plan_list",
    "List all active plans. Admins also see soft-deleted plans.",
    {},
    async () => {
      const rows = await plans.listPlans(auth);
      const baseUrl = process.env.BASE_URL ?? "";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              rows.map((p) => ({
                slug: p.slug,
                title: p.title,
                url: `${baseUrl}/p/${p.slug}`,
                owner: p.owner_principal,
                revision: p.revision,
                updated_at: p.updated_at,
                deleted: p.deleted_at !== null,
              })),
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "plan_get",
    "Get metadata for a single plan by slug.",
    {
      slug: z.string().length(8).describe("Plan slug"),
    },
    async ({ slug }) => {
      const plan = await plans.getPlan(slug);
      const baseUrl = process.env.BASE_URL ?? "";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              slug: plan.slug,
              title: plan.title,
              url: `${baseUrl}/p/${plan.slug}`,
              owner: plan.owner_principal,
              revision: plan.revision,
              created_at: plan.created_at,
              updated_at: plan.updated_at,
            }),
          },
        ],
      };
    },
  );

  return server;
}
