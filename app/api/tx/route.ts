import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getTxDetail } from "@/lib/endpoints/tx";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(req: NextRequest) {
  const b = await readBody(req);
  const hash = (b?.hash || b?.tx || "").toString().trim();
  if (!hash) return jsonError("Missing 'hash' (tx hash 0x...).");
  try { return jsonOk(await getTxDetail(hash)); }
  catch (e: any) { return jsonError("tx failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("tx", handler, {
  description: "Look up a transaction on Robinhood Chain by hash: status, method, from/to, value, fee, block, timestamp, whether it moved tokens. Body: { hash }.",
  input: { hash: "0xd88ce0518824499639ca28531cc0baaa33a77d53017201824b3654270b6f3fc0" },
  inputSchema: { properties: { hash: { type: "string", description: "Transaction hash (0x...)." } }, required: ["hash"] },
  outputSchema: { properties: { status: { type: "string" }, method: { type: "string" }, valueEth: { type: "number" } } },
});
