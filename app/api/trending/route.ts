import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getTrending } from "@/lib/endpoints/trending";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const limit = b?.limit ? Number(b.limit) : 15;
  const includeStock = b?.includeStock === true || b?.includeStock === "true";
  try { return jsonOk(await getTrending({ limit, includeStock })); }
  catch (e: any) { return jsonError("trending failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("trending", handler, {
  description: "Trending tokens on Robinhood Chain by 24h volume: meme/community tokens that are pumping right now. Stablecoins and wrapped tokens excluded; Stock Tokens excluded unless includeStock=true. Body: { limit?, includeStock? }.",
  input: { limit: 15 },
  inputSchema: { properties: { limit: { type: "number", description: "1-50 (default 15)." }, includeStock: { type: "boolean", description: "Include Robinhood Stock Tokens." } } },
  outputSchema: { properties: { count: { type: "number" }, tokens: { type: "array" } } },
});
