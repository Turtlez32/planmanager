import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthContext } from "./auth.js";
import * as plans from "./plans.js";

export function buildMcpServer(auth: AuthContext): McpServer {
  const server = new McpServer({
    name: "planmanager",
    version: "1.0.0",
  });

  server.tool(
    "plan_create",
    "Create a new plan and return its public slug URL.",
    {
      title: z.string().min(1).max(200).describe("Plan title"),
      html: z.string().min(1).describe("Full HTML content of the plan"),
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
    "Update an existing plan you own.",
    {
      slug: z.string().length(8).describe("Plan slug"),
      title: z.string().min(1).max(200).describe("Plan title"),
      html: z.string().min(1).describe("Full HTML content of the plan"),
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
