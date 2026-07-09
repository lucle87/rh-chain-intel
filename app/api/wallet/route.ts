import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getWallet } from "@/lib/endpoints/wallet";
import { isAddress } from "@/lib/rhchain";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const address = (b?.address || b?.wallet || "").toString().trim();
  const deep = b?.deep === true || b?.deep === "true";
  if (!isAddress(address)) return jsonError("Missing or invalid 'address' (0x...).");
  try { return jsonOk(await getWallet(address, deep)); }
  catch (e: any) { return jsonError("wallet failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("wallet", handler, {
  description: "Wallet snapshot on Robinhood Chain: ETH balance (+USD), tx count, account type, scam/reputation flags, and (deep=true) token holdings. Body: { address, deep? }.",
  input: { address: "0x0000000000000000000000000000000000000000", deep: false },
  inputSchema: { properties: { address: { type: "string", description: "Wallet address (0x...)." }, deep: { type: "boolean", description: "Include token holdings." } }, required: ["address"] },
  outputSchema: { properties: { balanceEth: { type: "number" }, txCount: { type: "number" }, isScam: { type: "boolean" } } },
});
