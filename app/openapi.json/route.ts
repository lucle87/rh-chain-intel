// openapi.json tu sinh tu CATALOG. Them endpoint = openapi tu cap nhat.
import { CATALOG } from "@/lib/catalog";
import { BASE_URL, PAY_TO, X402_NETWORK, priceUsdFor } from "@/lib/x402config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const paths: any = {};
  for (const item of CATALOG) {
    const priceUsd = priceUsdFor(item.key);
    paths[item.path] = {
      post: {
        operationId: item.key,
        summary: item.title,
        description: item.description,
        "x-agent-guidance": {
          whenToUse: item.agentGuidance.whenToUse,
          input: item.agentGuidance.input,
          output: item.agentGuidance.output,
          paymentFlow: item.agentGuidance.paymentFlow,
        },
        "x-payment-info": {
          x402Version: 2,
          price: { mode: "fixed", amount: priceUsd, currency: "USD" },
          protocols: ["x402"],
          network: X402_NETWORK,
          asset: "USDC",
          payTo: PAY_TO,
        },
        requestBody: {
          required: true,
          content: { "application/json": { schema: item.inputSchema } },
        },
        responses: {
          "200": {
            description: item.title + " result.",
            content: { "application/json": { schema: item.outputSchema } },
          },
          "400": { description: "Bad Request - missing/invalid input." },
          "402": { description: "Payment Required (x402, USDC on Base)." },
        },
      },
    };
  }

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "rh-chain-intel - Robinhood Chain data for AI agents",
      version: "1.0.0",
      description:
        "On-chain data for Robinhood Chain (Ethereum L2 on Arbitrum, mainnet since July 2026) for AI agents: network health, wallet snapshots and activity scores, a token screener covering tokenized Stock Tokens (MSTR, GME, ASML...) and community tokens, token detail, and transaction lookup. Free public data (Blockscout + RPC), paid per call via x402 (USDC on Base). No API key. Public read-only; NOT investment advice.",
      contact: { name: "rh-chain-intel", email: process.env.CONTACT_EMAIL || "vanlucpdu@gmail.com", url: BASE_URL },
    },
    servers: [{ url: BASE_URL }],
    "x-docs": { llmsTxt: BASE_URL + "/llms.txt" },
    "x-guidance":
      "rh-chain-intel gives AI agents on-chain data for Robinhood Chain: /api/health for network status, /api/wallet for a wallet snapshot (balance, tx count, scam/reputation, token holdings), /api/score for a 0-100 activity score, /api/tokens to screen Stock Tokens and community tokens, /api/token for one token detail, /api/tx to look up a transaction, /api/rugcheck to check holder concentration for rug risk, /api/trending to see which tokens are pumping by 24h volume. Free public data from Blockscout and JSON-RPC. Each endpoint is a paid POST via x402 (USDC on Base). Public read-only; NOT investment advice.",
    x402Version: 2,
    "x-discovery": { ownershipProofs: [PAY_TO] },
    paths,
  };

  return new Response(JSON.stringify(spec, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
