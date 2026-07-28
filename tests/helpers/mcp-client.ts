import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = `${process.env.BASE_URL ?? "https://plans.turtlez.au"}/api/mcp`;

export type Principal = "claude" | "codex" | "admin";

const TOKEN_ENV_VAR: Record<Principal, string> = {
  claude: "CLAUDE_MCP_TOKEN",
  codex: "CODEX_MCP_TOKEN",
  admin: "ADMIN_MCP_TOKEN",
};

function requireToken(principal: Principal): string {
  const envVar = TOKEN_ENV_VAR[principal];
  const token = process.env[envVar];
  if (!token) {
    throw new Error(`${envVar} is not set — export it (see .env.example) to run tests as "${principal}".`);
  }
  return token;
}

async function connect(principal: Principal): Promise<Client> {
  const token = requireToken(principal);
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  const client = new Client({ name: "playwright-tests", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

async function callTool<T>(
  principal: Principal,
  name: string,
  args: Record<string, unknown>,
): Promise<{ data?: T; isError: boolean; text: string }> {
  const client = await connect(principal);
  try {
    const result = await client.callTool({ name, arguments: args });
    const content = (result.content as Array<{ type: string; text: string }>)[0];
    const isError = result.isError === true;
    return {
      data: isError ? undefined : (JSON.parse(content.text) as T),
      isError,
      text: content.text,
    };
  } finally {
    await client.close();
  }
}

async function callToolOrThrow<T>(principal: Principal, name: string, args: Record<string, unknown>): Promise<T> {
  const { data, isError, text } = await callTool<T>(principal, name, args);
  if (isError) throw new Error(`${name} failed: ${text}`);
  return data as T;
}

export interface CreatedPlan {
  slug: string;
  url: string;
  revision: number;
}

export interface UpdatedPlan {
  slug: string;
  revision: number;
  updated_at: string;
}

export interface PlanMeta {
  slug: string;
  title: string;
  url: string;
  owner: Principal;
  revision: number;
  created_at: string;
  updated_at: string;
}

export function createPlan(title: string, html: string, as: Principal = "claude"): Promise<CreatedPlan> {
  return callToolOrThrow<CreatedPlan>(as, "plan_create", { title, html });
}

export function deletePlan(
  slug: string,
  hard = false,
  as: Principal = "claude",
): Promise<{ deleted: string; hard: boolean }> {
  return callToolOrThrow(as, "plan_delete", { slug, hard });
}

export function getPlan(slug: string, as: Principal = "claude"): Promise<PlanMeta> {
  return callToolOrThrow<PlanMeta>(as, "plan_get", { slug });
}

// Does not throw on failure — callers assert on `isError` to test authorization/conflict behavior.
export function updatePlan(
  slug: string,
  title: string,
  html: string,
  as: Principal,
  revision?: number,
): Promise<{ data?: UpdatedPlan; isError: boolean; text: string }> {
  return callTool<UpdatedPlan>(as, "plan_update", { slug, title, html, revision });
}
