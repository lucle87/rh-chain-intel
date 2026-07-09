// Snapshot vi tren Robinhood Chain: balance ETH, loai account, scam flag, reputation, token nam giu.
import { getAddress, getAddressTokens, rpcTxCount, fromWei, EXPLORER } from "@/lib/rhchain";

export async function getWallet(address: string, deep: boolean) {
  const addr = address.toLowerCase();
  const [a, txCount] = await Promise.all([
    getAddress(addr).catch(() => null),
    rpcTxCount(addr).catch(() => 0),
  ]);
  if (!a) return { type: "rh-wallet", address, found: false, note: "No data for this address on Robinhood Chain." };

  const balanceEth = fromWei(a.coin_balance, 18);
  const ethPrice = a.exchange_rate ? Number(a.exchange_rate) : null;

  let tokens: any[] = [];
  if (deep) {
    const t = await getAddressTokens(addr).catch(() => null);
    const items = Array.isArray(t?.items) ? t.items : [];
    tokens = items.slice(0, 25).map((it: any) => {
      const tok = it.token || {};
      const dec = tok.decimals ? Number(tok.decimals) : 18;
      return { symbol: tok.symbol || null, name: tok.name || null, address: tok.address_hash || tok.address || null, balance: fromWei(it.value, dec), type: tok.type || null };
    });
  }

  return {
    type: "rh-wallet", address, found: true,
    isContract: !!a.is_contract,
    isScam: !!a.is_scam,
    reputation: a.reputation || null,
    ensName: a.ens_domain_name || null,
    name: a.name || null,
    balanceEth,
    balanceUsd: ethPrice != null ? Math.round(balanceEth * ethPrice * 100) / 100 : null,
    txCount,
    hasTokens: !!a.has_tokens,
    hasTokenTransfers: !!a.has_token_transfers,
    isVerifiedContract: !!a.is_verified,
    ...(deep ? { tokens } : { tokensNote: "Set deep=true to include token holdings." }),
    explorer: EXPLORER + "/address/" + address,
    note: "Wallet snapshot on Robinhood Chain from Blockscout + RPC. isScam/reputation are Blockscout signals, not a guarantee. Public read-only data.",
  };
}
