// Screen token tren Robinhood Chain: Stock Tokens (NVDA, MSTR...) + meme, sap theo holders.
// Loc tuy chon: stockOnly (chi Robinhood Token) hoac query tim ten/symbol.
import { getTokens, EXPLORER } from "@/lib/rhchain";

export async function getTokensList(opts: { query?: string; stockOnly?: boolean; limit?: number }) {
  const limit = Math.min(Math.max(opts.limit || 25, 1), 50);
  const data = await getTokens(opts.query);
  let items = Array.isArray(data?.items) ? data.items : [];

  // stockOnly: token Robinhood chinh thuc thuong co ten "... • Robinhood Token"
  if (opts.stockOnly) items = items.filter((t: any) => (t.name || "").includes("Robinhood Token"));

  const tokens = items.slice(0, limit).map((t: any) => ({
    symbol: t.symbol || null,
    name: t.name || null,
    address: t.address_hash || null,
    type: t.type || null,
    holders: t.holders_count != null ? Number(t.holders_count) : null,
    priceUsd: t.exchange_rate != null ? Number(t.exchange_rate) : null,
    marketCapUsd: t.circulating_market_cap != null ? Number(t.circulating_market_cap) : null,
    volume24h: t.volume_24h != null ? Number(t.volume_24h) : null,
    isStockToken: (t.name || "").includes("Robinhood Token"),
    icon: t.icon_url || null,
  }));
  return {
    type: "rh-tokens",
    count: tokens.length,
    filter: { query: opts.query || null, stockOnly: !!opts.stockOnly },
    tokens,
    note: "Tokens on Robinhood Chain from Blockscout. Stock Tokens (e.g. MSTR, GME, ASML) are tokenized equity exposure issued by Robinhood; others are community tokens. Public read-only data; NOT investment advice.",
  };
}
