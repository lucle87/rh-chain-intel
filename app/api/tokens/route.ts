import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getTokensList } from "@/lib/endpoints/tokens";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const query = b?.query ? String(b.query).trim() : undefined;
  const stockOnly = b?.stockOnly === true || b?.stockOnly === "true";
  const limit = b?.limit ? Number(b.limit) : 25;
  try { return jsonOk(await getTokensList({ query, stockOnly, limit })); }
  catch (e: any) { return jsonError("tokens failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("tokens", handler, {
  description: "Screen tokens on Robinhood Chain sorted by holders: tokenized Stock Tokens (MSTR, GME, ASML, TSM...) and community tokens. Filter with stockOnly=true or a name/symbol query. Body: { query?, stockOnly?, limit? }.",
  input: { stockOnly: true, limit: 25 },
  inputSchema: { properties: { query: { type: "string", description: "Search name/symbol." }, stockOnly: { type: "boolean", description: "Only Robinhood Stock Tokens." }, limit: { type: "number", description: "1-50 (default 25)." } } },
  outputSchema: { properties: { count: { type: "number" }, tokens: { type: "array" } } },
});
