// Tra cuu 1 giao dich tren Robinhood Chain theo hash.
import { getTx, isTxHash, fromWei, EXPLORER } from "@/lib/rhchain";

export async function getTxDetail(hash: string) {
  if (!isTxHash(hash)) return { type: "rh-tx", hash, found: false, note: "Invalid transaction hash." };
  const t = await getTx(hash).catch(() => null);
  if (!t) return { type: "rh-tx", hash, found: false, note: "Transaction not found on Robinhood Chain." };
  return {
    type: "rh-tx", hash, found: true,
    status: t.status || t.result || null,
    method: t.method || null,
    from: t.from?.hash || null,
    to: t.to?.hash || null,
    toName: t.to?.name || null,
    toIsContract: !!t.to?.is_contract,
    valueEth: fromWei(t.value, 18),
    feeEth: t.fee?.value ? fromWei(t.fee.value, 18) : null,
    blockNumber: t.block_number ?? null,
    timestamp: t.timestamp || null,
    transactionTypes: t.transaction_types || [],
    hasTokenTransfers: Array.isArray(t.token_transfers) && t.token_transfers.length > 0,
    explorer: EXPLORER + "/tx/" + hash,
    note: "Transaction detail on Robinhood Chain from Blockscout. Public read-only data.",
  };
}
