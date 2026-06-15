import { randomBytes } from "crypto";

console.log("CLAUDE_MCP_TOKEN=" + randomBytes(32).toString("hex"));
console.log("CODEX_MCP_TOKEN=" + randomBytes(32).toString("hex"));
console.log("ADMIN_MCP_TOKEN=" + randomBytes(32).toString("hex"));
