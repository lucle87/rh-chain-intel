import { priceUsdFor } from "@/lib/x402config";
export type AgentGuidance = { whenToUse: string; input: string; output: string; paymentFlow: string };
export type CatalogItem = { key: string; path: string; title: string; description: string; inputSchema: any; outputSchema: any; agentGuidance: AgentGuidance };
const PAY = "First call returns HTTP 402 with an x402 payment requirement (USDC on Base). Pay with an x402 client, then retry to get 200.";
const ADDR = { type: "object", properties: { address: { type: "string", description: "Address (0x...).", examples: ["0x0000000000000000000000000000000000000000"] } }, required: ["address"] };

export const CATALOG: CatalogItem[] = [
  {
    key: "health", path: "/api/health", title: "Chain Health",
    description: "Live network health of Robinhood Chain (Ethereum L2 on Arbitrum): latest block, average block time, gas prices, total and today's transactions, total addresses, ETH price. No input.",
    agentGuidance: { whenToUse: "Use to check if Robinhood Chain is live and how busy it is before interacting, or to monitor network activity.", input: "POST JSON: {} (no params).", output: "latestBlock, averageBlockTimeMs, gasPricesGwei{}, totalTransactions, transactionsToday, totalAddresses, ethPriceUsd.", paymentFlow: PAY },
    inputSchema: { type: "object", properties: {} },
    outputSchema: { type: "object", properties: { latestBlock: { type: "number" }, transactionsToday: { type: "number" }, gasPricesGwei: { type: "object" } } },
  },
  {
    key: "wallet", path: "/api/wallet", title: "Wallet Snapshot",
    description: "Wallet snapshot on Robinhood Chain: ETH balance (+USD), transaction count, account type (wallet/contract), scam and reputation flags, and optionally (deep=true) token holdings. Body: { address, deep? }.",
    agentGuidance: { whenToUse: "Use before sending funds to or interacting with an address, or to summarize a wallet's state on Robinhood Chain. Set deep=true to also list token holdings.", input: "POST JSON: { address (0x...), deep? }.", output: "balanceEth, balanceUsd, txCount, isContract, isScam, reputation, tokens[] (if deep).", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { address: { type: "string" }, deep: { type: "boolean" } }, required: ["address"] },
    outputSchema: { type: "object", properties: { balanceEth: { type: "number" }, txCount: { type: "number" }, isScam: { type: "boolean" } } },
  },
  {
    key: "score", path: "/api/score", title: "Wallet Activity Score",
    description: "Activity score (0-100) for a Robinhood Chain wallet, derived from transaction count, balance, and token activity, with a tier (dormant/low/moderate/active/very active). Body: { address }.",
    agentGuidance: { whenToUse: "Use for a quick single-number read of how active/established a wallet is on Robinhood Chain, e.g. to filter counterparties. For full detail use /api/wallet.", input: "POST JSON: { address (0x...) }.", output: "score (0-100), tier, breakdown{txCount, balanceEth, ...}.", paymentFlow: PAY },
    inputSchema: ADDR,
    outputSchema: { type: "object", properties: { score: { type: "number" }, tier: { type: "string" } } },
  },
  {
    key: "tokens", path: "/api/tokens", title: "Token Screener",
    description: "Screen tokens on Robinhood Chain sorted by holders: tokenized Stock Tokens (MSTR, GME, ASML, TSM, IonQ...) and community tokens. Filter with stockOnly=true, or a name/symbol query. Body: { query?, stockOnly?, limit? }.",
    agentGuidance: { whenToUse: "Use to discover what tokens exist on Robinhood Chain, or to list only Robinhood Stock Tokens (stockOnly=true). For one token's detail use /api/token.", input: "POST JSON: { query?, stockOnly?, limit? (1-50) }.", output: "tokens[] each with symbol, name, address, holders, priceUsd, marketCapUsd, volume24h, isStockToken.", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { query: { type: "string" }, stockOnly: { type: "boolean" }, limit: { type: "number" } } },
    outputSchema: { type: "object", properties: { count: { type: "number" }, tokens: { type: "array" } } },
  },
  {
    key: "token", path: "/api/token", title: "Token Detail",
    description: "Detail for one token on Robinhood Chain by contract address: symbol, name, token type, holders, supply, price, market cap, 24h volume, and whether it is a Robinhood Stock Token. Body: { address }.",
    agentGuidance: { whenToUse: "Use to read one token's holders/price/market cap before interacting or trading. Get the address from /api/tokens.", input: "POST JSON: { address (token contract 0x...) }.", output: "symbol, name, holders, totalSupply, priceUsd, marketCapUsd, volume24h, isStockToken.", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] },
    outputSchema: { type: "object", properties: { symbol: { type: "string" }, holders: { type: "number" }, isStockToken: { type: "boolean" } } },
  },
  {
    key: "tx", path: "/api/tx", title: "Transaction Lookup",
    description: "Look up a transaction on Robinhood Chain by hash: status, method, from/to, value, fee, block, timestamp, and whether it moved tokens. Body: { hash }.",
    agentGuidance: { whenToUse: "Use to check the outcome/details of a specific transaction without opening the block explorer.", input: "POST JSON: { hash (0x...) }.", output: "status, method, from, to, valueEth, feeEth, blockNumber, timestamp, hasTokenTransfers.", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { hash: { type: "string" } }, required: ["hash"] },
    outputSchema: { type: "object", properties: { status: { type: "string" }, method: { type: "string" }, valueEth: { type: "number" } } },
  },
  {
    key: "rugcheck", path: "/api/rugcheck", title: "Token Rug Check",
    description: "Rug check a token on Robinhood Chain via holder concentration: top holder %, top-10 %, burned %, holder count, and scam flag. Returns GO/CAUTION/DANGER. Catches whale-controlled dump/rug risk on new meme tokens. Does NOT check mint authority, honeypot, or trading tax (GoPlus does not yet support this chain). Body: { address }.",
    agentGuidance: { whenToUse: "Use before buying/interacting with a new or meme token on Robinhood Chain, to catch whale concentration and scam flags. Note it checks holder distribution, not contract-level honeypot/mint; for Stock Tokens (Robinhood-issued) high concentration is expected and not a red flag.", input: "POST JSON: { address (token 0x...) }.", output: "verdict (GO|CAUTION|DANGER), concentration{topHolderPct, top10Pct, burnedPct}, holderCount, isScam, topHolders[], flags[].", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] },
    outputSchema: { type: "object", properties: { verdict: { type: "string" }, concentration: { type: "object" }, flags: { type: "array" } } },
  },
  {
    key: "trending", path: "/api/trending", title: "Trending Tokens",
    description: "Trending tokens on Robinhood Chain by 24h volume: meme/community tokens pumping right now. Stablecoins and wrapped tokens are excluded; Stock Tokens excluded unless includeStock=true. Body: { limit?, includeStock? }.",
    agentGuidance: { whenToUse: "Use when the user asks what is hot/pumping on Robinhood Chain right now, or to surface meme tokens by activity. Combine with /api/rugcheck to check safety before acting, since high volume can include wash trading.", input: "POST JSON: { limit? (1-50), includeStock? }.", output: "tokens[] ranked by volume24hUsd, each with symbol, name, address, holders, marketCapUsd, priceUsd.", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { limit: { type: "number" }, includeStock: { type: "boolean" } } },
    outputSchema: { type: "object", properties: { count: { type: "number" }, tokens: { type: "array" } } },
  },
  {
    key: "burn", path: "/api/burn", title: "Token Burn Stats",
    description: "Burn stats for a token on Robinhood Chain: amount sent to burn addresses (0x0 and 0x...dEaD) and the percentage of total supply burned. Body: { address }.",
    agentGuidance: { whenToUse: "Use to check how much of a token's supply has been burned (deflationary signal) before evaluating a meme or community token. Pair with /api/rugcheck for a fuller safety read.", input: "POST JSON: { address (token 0x...) }.", output: "burnedAmount, burnedPct, totalSupply, burnAddresses[].", paymentFlow: PAY },
    inputSchema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] },
    outputSchema: { type: "object", properties: { burnedAmount: { type: "number" }, burnedPct: { type: "number" } } },
  },
];
export function priceOf(key: string): string { return priceUsdFor(key); }
