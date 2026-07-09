// Robinhood Chain data: Blockscout REST v2 + JSON-RPC. Public, khong key. Da verify raw.
import { fetchJson } from "@/lib/http";
import { cached } from "@/lib/cache";

const BLOCKSCOUT = "https://robinhoodchain.blockscout.com/api/v2";
const RPC = "https://rpc.mainnet.chain.robinhood.com";
export const CHAIN_ID = 4663;
export const EXPLORER = "https://robinhoodchain.blockscout.com";

export function isAddress(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test((s || "").trim());
}
export function isTxHash(s: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test((s || "").trim());
}

// Blockscout GET helper
async function bs<T = any>(path: string, ttlMs: number): Promise<T> {
  return cached("rh:" + path, ttlMs, async () => {
    return await fetchJson<T>(BLOCKSCOUT + path, { timeoutMs: 7000 });
  });
}

// stats mang
export async function getStats(): Promise<any> { return bs("/stats", 15000); }
// dia chi (balance, is_contract, reputation, scam...)
export async function getAddress(addr: string): Promise<any> { return bs("/addresses/" + addr.toLowerCase(), 20000); }
// token cua 1 dia chi
export async function getAddressTokens(addr: string): Promise<any> { return bs("/addresses/" + addr.toLowerCase() + "/tokens?type=ERC-20", 20000); }
// dem tx cua dia chi (counters)
export async function getAddressCounters(addr: string): Promise<any> {
  try { return await bs("/addresses/" + addr.toLowerCase() + "/counters", 20000); } catch { return null; }
}
// danh sach token toan chain
export async function getTokens(query?: string): Promise<any> {
  const q = query ? "?q=" + encodeURIComponent(query) : "";
  return bs("/tokens" + q, 30000);
}
// chi tiet 1 token
export async function getToken(addr: string): Promise<any> { return bs("/tokens/" + addr.toLowerCase(), 30000); }
// tx moi nhat toan chain
export async function getMainTxs(): Promise<any> { return bs("/main-page/transactions", 10000); }
// chi tiet 1 tx
export async function getTx(hash: string): Promise<any> { return bs("/transactions/" + hash.toLowerCase(), 20000); }

// RPC: so tx (nonce) cua dia chi - de tinh score chinh xac
export async function rpcTxCount(addr: string): Promise<number> {
  try {
    const data: any = await fetchJson(RPC, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionCount", params: [addr, "latest"], id: 1 }), timeoutMs: 6000 });
    return data?.result ? parseInt(data.result, 16) : 0;
  } catch { return 0; }
}

// format wei (18 decimals) -> so doc duoc
export function fromWei(v: any, decimals = 18): number {
  if (v == null) return 0;
  try { const s = BigInt(v); const d = BigInt(10) ** BigInt(decimals); return Number(s * BigInt(1000000) / d) / 1000000; } catch { return 0; }
}

// holder cua 1 token (list + value), de tinh concentration
export async function getTokenHolders(addr: string): Promise<any> { return bs("/tokens/" + addr.toLowerCase() + "/holders", 30000); }
// counter cua token (holders, transfers)
export async function getTokenCounters(addr: string): Promise<any> {
  try { return await bs("/tokens/" + addr.toLowerCase() + "/counters", 30000); } catch { return null; }
}

// transfer toi 1 dia chi burn (de tinh burn stats)
export async function getBurnTransfers(burnAddr: string): Promise<any> {
  return bs("/addresses/" + burnAddr.toLowerCase() + "/token-transfers?type=ERC-20", 20000);
}
