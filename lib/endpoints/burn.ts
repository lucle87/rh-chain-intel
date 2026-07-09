// Burn stats cho token tren Robinhood Chain: dem transfer toi burn address, tinh % supply da burn.
import { getToken, getTokenHolders, fromWei, isAddress, EXPLORER } from "@/lib/rhchain";

const BURN_ADDRS = ["0x000000000000000000000000000000000000dead", "0x0000000000000000000000000000000000000000"];

export async function getBurnStats(address: string) {
  if (!isAddress(address)) return { type: "rh-burn", address, found: false, note: "Invalid token address." };
  const tok = await getToken(address).catch(() => null);
  if (!tok) return { type: "rh-burn", address, found: false, note: "Token not found on Robinhood Chain." };

  const decimals = tok.decimals ? Number(tok.decimals) : 18;
  const totalSupply = tok.total_supply ? Number(fromWei(tok.total_supply, decimals)) : 0;

  // lay holder list, cong so du cua cac dia chi burn
  const holdersData = await getTokenHolders(address).catch(() => null);
  const items: any[] = Array.isArray(holdersData?.items) ? holdersData.items : [];
  let burnedRaw = 0;
  const burnHolders: any[] = [];
  for (const h of items) {
    const addr = (h.address?.hash || "").toLowerCase();
    if (BURN_ADDRS.includes(addr)) {
      const bal = Number(fromWei(h.value, decimals));
      burnedRaw += bal;
      burnHolders.push({ address: h.address?.hash, balance: bal });
    }
  }
  const burnedPct = totalSupply > 0 ? Math.round((burnedRaw / totalSupply) * 10000) / 100 : 0;

  return {
    type: "rh-burn", address, found: true,
    symbol: tok.symbol || null,
    name: tok.name || null,
    totalSupply,
    burnedAmount: Math.round(burnedRaw * 1000000) / 1000000,
    burnedPct, // % supply da burn
    burnAddresses: burnHolders,
    isStockToken: (tok.name || "").includes("Robinhood Token"),
    explorer: EXPLORER + "/token/" + address,
    note: "Burn stats on Robinhood Chain from Blockscout: tokens sent to 0x0 and 0x...dEaD, as amount and % of total supply. High burn can signal deflationary design OR a locked/discarded supply; interpret with other signals. Public read-only data; NOT investment advice.",
  };
}
