import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getBurnStats } from "@/lib/endpoints/burn";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const address = (b?.address || b?.token || "").toString().trim();
  if (!address) return jsonError("Missing 'address' (token contract 0x...).");
  try { return jsonOk(await getBurnStats(address)); }
  catch (e: any) { return jsonError("burn failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("burn", handler, {
  description: "Burn stats for a token on Robinhood Chain: amount sent to burn addresses (0x0, 0x...dEaD) and % of total supply burned. Body: { address }.",
  input: { address: "0x020bfC650A365f8BB26819deAAbF3E21291018b4" },
  inputSchema: { properties: { address: { type: "string", description: "Token contract address (0x...)." } }, required: ["address"] },
  outputSchema: { properties: { burnedAmount: { type: "number" }, burnedPct: { type: "number" } } },
});
