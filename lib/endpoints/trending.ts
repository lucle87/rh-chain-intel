// Token dang "nong" tren Robinhood Chain: sort theo volume 24h.
// Loc bo Stock Token (Robinhood-issued), stablecoin, wrapped (WETH/USDE...) de chi ra meme/community token that su pump.
import { getTokens, EXPLORER } from "@/lib/rhchain";

const NON_MEME = new Set(["WETH","WBTC","USDC","USDT","USDE","USDG","STEAKUSDG","DAI","ETH","REWARDS"]);
function isNonMeme(sym: string, name: string): boolean {
  const s = (sym || "").toUpperCase();
  if (NON_MEME.has(s)) return true;
  if (/stable|wrapped|\bUSD\b/i.test(name || "")) return true;
  return false;
}

export async function getTrending(opts: { limit?: number; includeStock?: boolean }) {
  const limit = Math.min(Math.max(opts.limit || 15, 1), 50);
  const data = await getTokens();
  let items = Array.isArray(data?.items) ? data.items : [];

  items = items.filter((t: any) => {
    const isStock = (t.name || "").includes("Robinhood Token");
    if (isStock && !opts.includeStock) return false;
    if (isNonMeme(t.symbol, t.name)) return false;
    const vol = Number(t.volume_24h || 0);
    return vol > 0;
  });

  items.sort((a: any, b: any) => Number(b.volume_24h || 0) - Number(a.volume_24h || 0));

  const tokens = items.slice(0, limit).map((t: any, i: number) => ({
    rank: i + 1,
    symbol: t.symbol || null,
    name: t.name || null,
    address: t.address_hash || null,
    volume24hUsd: t.volume_24h != null ? Math.round(Number(t.volume_24h) * 100) / 100 : null,
    holders: t.holders_count != null ? Number(t.holders_count) : null,
    marketCapUsd: t.circulating_market_cap != null ? Math.round(Number(t.circulating_market_cap) * 100) / 100 : null,
    priceUsd: t.exchange_rate != null ? Number(t.exchange_rate) : null,
    isStockToken: (t.name || "").includes("Robinhood Token"),
    icon: t.icon_url || null,
    explorer: EXPLORER + "/token/" + (t.address_hash || ""),
  }));

  return {
    type: "rh-trending",
    count: tokens.length,
    sortedBy: "volume_24h",
    filter: { includeStock: !!opts.includeStock, excluded: "stablecoins, wrapped tokens" },
    tokens,
    note: "Trending tokens on Robinhood Chain by 24h volume (Blockscout). Stablecoins/wrapped tokens excluded; Stock Tokens excluded unless includeStock=true. High volume can mean genuine interest OR wash trading; combine with /api/rugcheck before acting. Public read-only data; NOT investment advice.",
  };
}
