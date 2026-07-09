// Chi tiet 1 token tren Robinhood Chain theo address.
import { getToken, isAddress, EXPLORER } from "@/lib/rhchain";

export async function getTokenDetail(address: string) {
  if (!isAddress(address)) return { type: "rh-token", address, found: false, note: "Invalid token address." };
  const t = await getToken(address).catch(() => null);
  if (!t) return { type: "rh-token", address, found: false, note: "Token not found on Robinhood Chain." };
  return {
    type: "rh-token", address, found: true,
    symbol: t.symbol || null,
    name: t.name || null,
    tokenType: t.type || null,
    decimals: t.decimals != null ? Number(t.decimals) : null,
    holders: t.holders_count != null ? Number(t.holders_count) : null,
    totalSupply: t.total_supply || null,
    priceUsd: t.exchange_rate != null ? Number(t.exchange_rate) : null,
    marketCapUsd: t.circulating_market_cap != null ? Number(t.circulating_market_cap) : null,
    volume24h: t.volume_24h != null ? Number(t.volume_24h) : null,
    isStockToken: (t.name || "").includes("Robinhood Token"),
    icon: t.icon_url || null,
    explorer: EXPLORER + "/token/" + address,
    note: "Token detail on Robinhood Chain from Blockscout. Public read-only data; NOT investment advice.",
  };
}
