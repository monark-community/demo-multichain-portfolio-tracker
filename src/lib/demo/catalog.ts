import type { Network, NetworkId, Token, TokenSymbol, WalletTag } from "./types"

export const NETWORKS: Network[] = [
  {
    id: "eth-sepolia",
    name: "Ethereum Sepolia",
    color: "var(--chart-1)",
    chainId: 11155111,
    nativeSymbol: "tETH",
    blockTime: 12,
    epochBlock: 9_874_210,
    explorer: "https://sepolia.etherscan.io",
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    color: "var(--chart-2)",
    chainId: 84532,
    nativeSymbol: "tETH",
    blockTime: 2,
    epochBlock: 35_412_880,
    explorer: "https://sepolia.basescan.org",
  },
  {
    id: "arb-sepolia",
    name: "Arbitrum Sepolia",
    color: "var(--chart-3)",
    chainId: 421614,
    nativeSymbol: "tETH",
    blockTime: 0.25,
    epochBlock: 228_640_115,
    explorer: "https://sepolia.arbiscan.io",
  },
  {
    id: "op-sepolia",
    name: "Optimism Sepolia",
    color: "var(--chart-4)",
    chainId: 11155420,
    nativeSymbol: "tETH",
    blockTime: 2,
    epochBlock: 37_095_402,
    explorer: "https://sepolia-optimism.etherscan.io",
  },
  {
    id: "polygon-amoy",
    name: "Polygon Amoy",
    color: "var(--chart-5)",
    chainId: 80002,
    nativeSymbol: "tPOL",
    blockTime: 2,
    epochBlock: 30_418_775,
    explorer: "https://amoy.polygonscan.com",
  },
]

export const NETWORK_IDS = NETWORKS.map((n) => n.id)

export function network(id: NetworkId): Network {
  return NETWORKS.find((n) => n.id === id) as Network
}

const EPOCH = Date.UTC(2026, 0, 1)

/** Simulated block height of a network at a given time. */
export function blockAt(id: NetworkId, time: number): number {
  const n = network(id)
  return Math.max(1, Math.round(n.epochBlock + (time - EPOCH) / 1000 / n.blockTime))
}

export const TOKENS: Record<TokenSymbol, Token> = {
  tETH: { symbol: "tETH", name: "Test Ether", decimals: 18, price: 3200, yearAgo: 0.74, vol: 0.032 },
  tWBTC: { symbol: "tWBTC", name: "Test Wrapped Bitcoin", decimals: 8, price: 64000, yearAgo: 0.81, vol: 0.026 },
  tUSDC: { symbol: "tUSDC", name: "Test USD Coin", decimals: 6, price: 1, yearAgo: 1, vol: 0.0006, stable: true },
  tDAI: { symbol: "tDAI", name: "Test Dai", decimals: 18, price: 1, yearAgo: 1, vol: 0.0008, stable: true },
  tLINK: { symbol: "tLINK", name: "Test Chainlink", decimals: 18, price: 14.5, yearAgo: 0.92, vol: 0.041 },
  tPOL: { symbol: "tPOL", name: "Test Polygon", decimals: 18, price: 0.42, yearAgo: 1.38, vol: 0.045 },
  tARB: { symbol: "tARB", name: "Test Arbitrum", decimals: 18, price: 0.78, yearAgo: 1.22, vol: 0.047 },
  tOP: { symbol: "tOP", name: "Test Optimism", decimals: 18, price: 1.65, yearAgo: 1.1, vol: 0.046 },
  tUNI: { symbol: "tUNI", name: "Test Uniswap", decimals: 18, price: 9.8, yearAgo: 0.86, vol: 0.043 },
}

export const TOKEN_SYMBOLS = Object.keys(TOKENS) as TokenSymbol[]

/** Named contracts, so activity reads like a ledger rather than a hex dump. */
export const CONTRACTS = {
  router: { address: "0x3bfa4769fb09eefc5a80d6e87c3b9c650f7ae48e", label: "Uniswap v3 router" },
  bridge: { address: "0x5e4e65926ba27467555eb562121fac00d24e9dd2", label: "Canonical bridge" },
  faucet: { address: "0x2a5c7e9b0d1f4386e8a1b2c3d4e5f60718293a4b", label: "Testnet faucet" },
  aave: { address: "0x6ae43d3271ff6888e7fc43fd7321a503ff738951", label: "Aave v3 pool" },
  opensea: { address: "0x00000000000000adc04c56bf30ac9d3c0aaf14dc", label: "Seaport 1.6" },
} as const

export type ProfileBalance = [NetworkId, TokenSymbol, number, number] // network, token, amount, unit cost

export interface WalletProfile {
  address: string
  label: { en: string; fr: string }
  tag: WalletTag
  balances: ProfileBalance[]
  nfts: { network: NetworkId; collection: string; name: string; tokenId: number; estimateUsd: number; daysAgo: number }[]
  /** Approximate number of transactions to generate. */
  activity: number
}

/** The wallet the visitor "connects". */
export const MAIN_WALLET: WalletProfile = {
  address: "0x7c3e9a1d5b4f2e8a6c0b9d3e1f7a2c5b8e4d6a91",
  label: { en: "Everyday", fr: "Au quotidien" },
  tag: "everyday",
  balances: [
    ["eth-sepolia", "tETH", 2.4815, 2410],
    ["eth-sepolia", "tUSDC", 3250, 1],
    ["eth-sepolia", "tLINK", 184.2, 11.2],
    ["eth-sepolia", "tUNI", 96.5, 7.1],
    ["base-sepolia", "tETH", 0.8421, 2655],
    ["base-sepolia", "tUSDC", 1412.36, 1],
    ["base-sepolia", "tDAI", 820, 1],
    ["arb-sepolia", "tETH", 0.311, 2890],
    ["arb-sepolia", "tARB", 1840, 1.12],
    ["arb-sepolia", "tUSDC", 640.12, 1],
    ["arb-sepolia", "tLINK", 42, 16.1],
    ["op-sepolia", "tETH", 0.1904, 3010],
    ["op-sepolia", "tOP", 512.4, 2.05],
    ["op-sepolia", "tUSDC", 210, 1],
    ["polygon-amoy", "tPOL", 2315.7, 0.55],
    ["polygon-amoy", "tUSDC", 388.4, 1],
    ["polygon-amoy", "tDAI", 145.2, 1],
    // Dust left behind by old swaps, hidden by "Hide balances under $1".
    ["op-sepolia", "tUNI", 0.046, 8.4],
    ["polygon-amoy", "tARB", 0.52, 1.3],
  ],
  nfts: [
    { network: "base-sepolia", collection: "Contour Studies", name: "Contour Study #218", tokenId: 218, estimateUsd: 184, daysAgo: 212 },
    { network: "base-sepolia", collection: "Contour Studies", name: "Contour Study #577", tokenId: 577, estimateUsd: 162, daysAgo: 96 },
    { network: "eth-sepolia", collection: "Field Notes", name: "Field Note 0041", tokenId: 41, estimateUsd: 410, daysAgo: 301 },
    { network: "op-sepolia", collection: "Tidepool Pass", name: "Tidepool Pass · Season 2", tokenId: 1093, estimateUsd: 58, daysAgo: 44 },
    { network: "polygon-amoy", collection: "Quiet Blocks", name: "Quiet Block 7/64", tokenId: 7, estimateUsd: 27, daysAgo: 150 },
  ],
  activity: 84,
}

/** A watch-only cold wallet, tracked from the start. */
export const COLD_WALLET: WalletProfile = {
  address: "0x1f9b0c7e2d4a86b3f5e1c09d7a4b2e6f8c3d5a07",
  label: { en: "Cold storage", fr: "Stockage à froid" },
  tag: "cold",
  balances: [
    ["eth-sepolia", "tWBTC", 0.1825, 41800],
    ["eth-sepolia", "tETH", 4.12, 1985],
    ["arb-sepolia", "tWBTC", 0.04, 47250],
  ],
  nfts: [],
  activity: 12,
}

/** Sample addresses offered in the "Track another wallet" flow. */
export const SAMPLE_TRADING: WalletProfile = {
  address: "0x9a4d2c61e8b07f35d1c4a9e2b6f08d3c7e5a1b24",
  label: { en: "Trading", fr: "Trading" },
  tag: "trading",
  balances: [
    ["base-sepolia", "tETH", 0.62, 3105],
    ["base-sepolia", "tUSDC", 1250, 1],
    ["arb-sepolia", "tARB", 900, 0.84],
    ["arb-sepolia", "tETH", 0.15, 3350],
    ["op-sepolia", "tOP", 300, 1.48],
  ],
  nfts: [
    { network: "base-sepolia", collection: "Contour Studies", name: "Contour Study #904", tokenId: 904, estimateUsd: 149, daysAgo: 20 },
  ],
  activity: 26,
}

export const SAMPLE_EMPTY = "0x3b8e0d52c1a947f6e2d8b5c30a1f7e94d6c2b815"
export const SAMPLE_TYPO = "0x9a4d2c61e8b07f35d1c4a9e2b6f08d3c7e5a1b2"

export const PROFILES: WalletProfile[] = [MAIN_WALLET, COLD_WALLET, SAMPLE_TRADING]

export function profileFor(address: string): WalletProfile | undefined {
  const a = address.toLowerCase()
  return PROFILES.find((p) => p.address === a)
}

export const NFT_COLLECTIONS = ["Contour Studies", "Field Notes", "Tidepool Pass", "Quiet Blocks"] as const
