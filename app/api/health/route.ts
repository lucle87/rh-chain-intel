import { NextRequest } from "next/server";
import { makePaidPost, readBody, jsonError, jsonOk } from "@/lib/x402route";
import { getHealth } from "@/lib/endpoints/health";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(_req: NextRequest) {
  try { return jsonOk(await getHealth()); }
  catch (e: any) { return jsonError("health failed: " + (e?.message || "unknown"), 502); }
}
export const { GET, POST } = makePaidPost("health", handler, {
  description: "Live network health of Robinhood Chain (Ethereum L2 on Arbitrum): latest block, average block time, gas prices, total/today transactions, total addresses, ETH price. No input.",
  input: {},
  inputSchema: { properties: {} },
  outputSchema: { properties: { latestBlock: { type: "number" }, gasPricesGwei: { type: "object" }, transactionsToday: { type: "number" } } },
});
