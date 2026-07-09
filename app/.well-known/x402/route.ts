// /.well-known/x402 - manifest cho x402 discovery crawler (x402scan, 402 Index...) doc truc tiep.
// Dang toi thieu spec-compliant: resources la mang cac URL day du (khong phai object) de qua validator.
import { CATALOG } from "@/lib/catalog";
import { BASE_URL, PAY_TO, NETWORK_LABEL, X402_NETWORK, priceUsdFor } from "@/lib/x402config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const body = {
    x402Version: 2,
    name: "rh-chain-intel",
    description: "Pay-per-call Robinhood Chain (chain_id 4663) data for AI agents: wallet, token, rugcheck, trending, burn. USDC via x402 on Base.",
    // resources: mang URL string (agentcash-discovery WellKnownDocSchema yeu cau z.array(z.string()))
    resources: CATALOG.map((i) => BASE_URL + i.path),
    // endpoints: chi tiet cho crawler hieu hon (khong bat buoc nhung huu ich)
    endpoints: CATALOG.map((i) => ({
      resource: BASE_URL + i.path,
      method: "POST",
      description: i.description,
      price: priceUsdFor(i.key) + " USDC",
      network: X402_NETWORK,
      payTo: PAY_TO,
      asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      inputSchema: i.inputSchema,
      outputSchema: i.outputSchema,
    })),
    payment: { protocol: "x402", network: NETWORK_LABEL, asset: "USDC", payTo: PAY_TO },
    contact: process.env.CONTACT_EMAIL || "vanlucpdu@gmail.com",
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-expose-headers": "*",
      "cache-control": "public, max-age=300",
    },
  });
}
