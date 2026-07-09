// Activity score 0-100 cho vi Robinhood Chain: dua tren balance + so tx + co token.
import { getAddress, rpcTxCount, fromWei } from "@/lib/rhchain";

export async function getScore(address: string) {
  const addr = address.toLowerCase();
  const [a, txCount] = await Promise.all([
    getAddress(addr).catch(() => null),
    rpcTxCount(addr).catch(() => 0),
  ]);
  if (!a) return { type: "rh-score", address, found: false, score: 0, note: "No data for this address." };

  const balanceEth = fromWei(a.coin_balance, 18);
  // cham diem: tx (toi da 50), balance (toi da 30), co token/transfer (20)
  const txScore = Math.min(50, Math.round(Math.log10(txCount + 1) * 25));
  const balScore = Math.min(30, Math.round(Math.log10(balanceEth * 1000 + 1) * 10));
  const tokenScore = (a.has_tokens ? 10 : 0) + (a.has_token_transfers ? 10 : 0);
  const score = Math.min(100, txScore + balScore + tokenScore);

  let tier = "dormant";
  if (score >= 75) tier = "very active";
  else if (score >= 50) tier = "active";
  else if (score >= 25) tier = "moderate";
  else if (score > 0) tier = "low";

  return {
    type: "rh-score", address, found: true,
    score, tier,
    breakdown: { txCount, txScore, balanceEth, balScore, tokenScore },
    flags: { isContract: !!a.is_contract, isScam: !!a.is_scam },
    note: "Activity score (0-100) for a Robinhood Chain wallet from tx count, balance, and token activity. Heuristic, not an official metric. Public read-only data.",
  };
}
