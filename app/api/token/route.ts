import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getTokenDetail } from "@/lib/endpoints/token";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const address = (b?.address || b?.token || "").toString().trim();
  if (!address) return jsonError("Missing 'address' (token contract 0x...).");
  try { return jsonOk(await getTokenDetail(address)); }
  catch (e: any) { return jsonError("token failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("token", handler, {
  description: "Detail for one token on Robinhood Chain by contract address: symbol, name, holders, supply, price, market cap, 24h volume, whether it is a Robinhood Stock Token. Body: { address }.",
  input: { address: "0xec262a75e413fAfD0dF80480274532C79D42da09" },
  inputSchema: { properties: { address: { type: "string", description: "Token contract address (0x...)." } }, required: ["address"] },
  outputSchema: { properties: { symbol: { type: "string" }, holders: { type: "number" }, isStockToken: { type: "boolean" } } },
});
