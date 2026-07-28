import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = `${process.env.BASE_URL ?? "https://plans.turtlez.au"}/api/mcp`;

function requireToken(): string {
  const token = process.env.CLAUDE_MCP_TOKEN;
  if (!token) {
    throw new Error(
      "CLAUDE_MCP_TOKEN is not set — export it (see .env.example) to run tests that create/manage plans.",
    );
  }
  return token;
}

async function connect(): Promise<Client> {
  const token = requireToken();
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: "playwright-tests", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

async function callTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const client = await connect();
  try {
    const result = await client.callTool({ name, arguments: args });
    const content = (result.content as Array<{ type: string; text: string }>)[0];
    return JSON.parse(content.text) as T;
  } finally {
    await client.close();
  }
}

export interface CreatedPlan {
  slug: string;
  url: string;
  revision: number;
}

export function createPlan(title: string, html: string): Promise<CreatedPlan> {
  return callTool<CreatedPlan>("plan_create", { title, html });
}

export function deletePlan(slug: string, hard = false): Promise<{ deleted: string; hard: boolean }> {
  return callTool("plan_delete", { slug, hard });
}
