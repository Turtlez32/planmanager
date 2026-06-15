import { timingSafeEqual } from "crypto";

export type Principal = "claude" | "codex" | "admin";

export interface AuthContext {
  principal: Principal;
  isAdmin: boolean;
}

function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function authenticate(authHeader: string | undefined): AuthContext | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  const { CLAUDE_MCP_TOKEN, CODEX_MCP_TOKEN, ADMIN_MCP_TOKEN } = process.env;

  if (CLAUDE_MCP_TOKEN && safeCompare(token, CLAUDE_MCP_TOKEN)) {
    return { principal: "claude", isAdmin: false };
  }
  if (CODEX_MCP_TOKEN && safeCompare(token, CODEX_MCP_TOKEN)) {
    return { principal: "codex", isAdmin: false };
  }
  if (ADMIN_MCP_TOKEN && safeCompare(token, ADMIN_MCP_TOKEN)) {
    return { principal: "admin", isAdmin: true };
  }

  return null;
}
