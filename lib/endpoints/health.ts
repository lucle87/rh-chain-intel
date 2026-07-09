// Trang thai mang Robinhood Chain: block, gas, tx/ngay, block time, so dia chi.
import { getStats, EXPLORER, CHAIN_ID } from "@/lib/rhchain";

export async function getHealth() {
  const s = await getStats();
  const gas = s?.gas_prices || {};
  return {
    type: "rh-chain-health",
    chainId: CHAIN_ID,
    latestBlock: s?.total_blocks != null ? Number(s.total_blocks) : null,
    averageBlockTimeMs: s?.average_block_time != null ? Number(s.average_block_time) : null,
    gasPricesGwei: { slow: gas.slow ?? null, average: gas.average ?? null, fast: gas.fast ?? null },
    totalAddresses: s?.total_addresses != null ? Number(s.total_addresses) : null,
    totalTransactions: s?.total_transactions != null ? Number(s.total_transactions) : null,
    transactionsToday: s?.transactions_today != null ? Number(s.transactions_today) : null,
    networkUtilizationPct: s?.network_utilization_percentage != null ? Number(s.network_utilization_percentage) : null,
    ethPriceUsd: s?.coin_price != null ? Number(s.coin_price) : null,
    explorer: EXPLORER,
    note: "Live network stats for Robinhood Chain (L2 on Arbitrum) from Blockscout. Public read-only data.",
  };
}
