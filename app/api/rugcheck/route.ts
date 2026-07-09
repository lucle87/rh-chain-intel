import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getRugcheck } from "@/lib/endpoints/rugcheck";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const address = (b?.address || b?.token || "").toString().trim();
  if (!address) return jsonError("Missing 'address' (token contract 0x...).");
  try { return jsonOk(await getRugcheck(address)); }
  catch (e: any) { return jsonError("rugcheck failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("rugcheck", handler, {
  description: "Rug check a token on Robinhood Chain via holder concentration: top holder %, top-10 %, burned %, holder count, scam flag. Returns GO/CAUTION/DANGER. Catches whale-dump/rug risk. Does NOT check mint authority/honeypot/tax (GoPlus does not support this chain yet). Body: { address }.",
  input: { address: "0x020bfC650A365f8BB26819deAAbF3E21291018b4" },
  inputSchema: { properties: { address: { type: "string", description: "Token contract address (0x...)." } }, required: ["address"] },
  outputSchema: { properties: { verdict: { type: "string" }, concentration: { type: "object" }, flags: { type: "array" } } },
});
