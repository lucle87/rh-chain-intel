import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getScore } from "@/lib/endpoints/score";
import { isAddress } from "@/lib/rhchain";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const address = (b?.address || b?.wallet || "").toString().trim();
  if (!isAddress(address)) return jsonError("Missing or invalid 'address' (0x...).");
  try { return jsonOk(await getScore(address)); }
  catch (e: any) { return jsonError("score failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("score", handler, {
  description: "Activity score (0-100) for a Robinhood Chain wallet from tx count, balance, and token activity, with a tier (dormant/low/moderate/active/very active). Body: { address }.",
  input: { address: "0x0000000000000000000000000000000000000000" },
  inputSchema: { properties: { address: { type: "string", description: "Wallet address (0x...)." } }, required: ["address"] },
  outputSchema: { properties: { score: { type: "number" }, tier: { type: "string" }, breakdown: { type: "object" } } },
});
