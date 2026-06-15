import type { VercelRequest, VercelResponse } from "@vercel/node";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { authenticate } from "../lib/auth.js";
import { buildMcpServer } from "../lib/mcp-server.js";
import { ForbiddenError, NotFoundError, ConflictError } from "../lib/plans.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = authenticate(req.headers.authorization);
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const server = buildMcpServer(auth);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.message });
    } else if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
    } else if (err instanceof ConflictError) {
      res.status(409).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
