// Rugcheck meme/token tren Robinhood Chain qua holder-concentration (Blockscout).
// Phat hien: 1 vi giu qua nhieu (dump/rug risk), tap trung top-10, holder qua it, scam flag.
// GIOI HAN: KHONG check mint authority / honeypot / tax (GoPlus chua ho tro chain 4663).
import { getToken, getTokenHolders, fromWei, isAddress, EXPLORER } from "@/lib/rhchain";

const BURN_ADDRS = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
]);

export async function getRugcheck(address: string) {
  if (!isAddress(address)) return { type: "rh-rugcheck", address, found: false, note: "Invalid token address." };
  const [tok, holdersData] = await Promise.all([
    getToken(address).catch(() => null),
    getTokenHolders(address).catch(() => null),
  ]);
  if (!tok) return { type: "rh-rugcheck", address, found: false, note: "Token not found on Robinhood Chain." };

  const decimals = tok.decimals ? Number(tok.decimals) : 18;
  const totalSupply = tok.total_supply ? Number(fromWei(tok.total_supply, decimals)) : 0;
  const holderCount = tok.holders_count != null ? Number(tok.holders_count) : null;
  const isStockToken = (tok.name || "").includes("Robinhood Token");

  const items: any[] = Array.isArray(holdersData?.items) ? holdersData.items : [];
  // tinh % tung holder, tach burn
  let burnedPct = 0;
  const holders = items.map((h: any) => {
    const bal = Number(fromWei(h.value, decimals));
    const pct = totalSupply > 0 ? (bal / totalSupply) * 100 : 0;
    const addr = (h.address?.hash || "").toLowerCase();
    const isBurn = BURN_ADDRS.has(addr);
    if (isBurn) burnedPct += pct;
    return { address: h.address?.hash || null, balance: bal, pct: Math.round(pct * 100) / 100, isBurn, isContract: !!h.address?.is_contract };
  });

  // concentration KHONG tinh burn
  const live = holders.filter((h) => !h.isBurn);
  const topHolderPct = live.length ? live[0].pct : 0;
  const top10Pct = Math.round(live.slice(0, 10).reduce((a, h) => a + h.pct, 0) * 100) / 100;

  // cham diem rui ro
  const flags: string[] = [];
  let risk = "GO";
  if (tok.is_scam) { flags.push("Flagged as scam by Blockscout."); risk = "DANGER"; }
  if (topHolderPct >= 50) { flags.push("Top holder controls " + topHolderPct.toFixed(1) + "% of supply (dump/rug risk)."); risk = "DANGER"; }
  else if (topHolderPct >= 25) { flags.push("Top holder controls " + topHolderPct.toFixed(1) + "% (high concentration)."); if (risk === "GO") risk = "CAUTION"; }
  if (top10Pct >= 80 && topHolderPct < 50) { flags.push("Top 10 holders control " + top10Pct.toFixed(1) + "% (concentrated)."); if (risk === "GO") risk = "CAUTION"; }
  if (holderCount != null && holderCount < 20) { flags.push("Only " + holderCount + " holders (very new/thin)."); if (risk === "GO") risk = "CAUTION"; }

  if (!flags.length) flags.push("No concentration or scam red flags found in holder distribution.");

  return {
    type: "rh-rugcheck", address, found: true,
    symbol: tok.symbol || null,
    name: tok.name || null,
    isStockToken,
    verdict: risk, // GO | CAUTION | DANGER
    concentration: { topHolderPct: Math.round(topHolderPct * 100) / 100, top10Pct, burnedPct: Math.round(burnedPct * 100) / 100 },
    holderCount,
    totalSupply,
    isScam: !!tok.is_scam,
    topHolders: live.slice(0, 10),
    flags,
    explorer: EXPLORER + "/token/" + address,
    note: "Holder-concentration rug check on Robinhood Chain (Blockscout). Detects whale concentration, burn, scam flag, thin holders. Does NOT check mint authority, honeypot, or trading tax (GoPlus does not yet support this chain). GO = no concentration flags found, NOT a guarantee or full audit. Stock Tokens are Robinhood-issued and naturally concentrated (few holders); judge them differently from meme tokens.",
  };
}
