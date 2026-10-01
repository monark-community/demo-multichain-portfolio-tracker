// Typed domain model for the simulated MultiTrack data layer. UI code only
// depends on these types and on the functions exported from src/lib/demo, so
// the simulation can be swapped for real readers (viem/wagmi, an indexer and
// a price API) without touching components.

export type NetworkId = "eth-sepolia" | "base-sepolia" | "arb-sepolia" | "op-sepolia" | "polygon-amoy"

export type TokenSymbol =
  | "tETH"
  | "tWBTC"
  | "tUSDC"
  | "tDAI"
  | "tLINK"
  | "tPOL"
  | "tARB"
  | "tOP"
  | "tUNI"

export interface Network {
  id: NetworkId
  name: string
  /** CSS variable holding the network's strata colour. */
  color: string
  chainId: number
  nativeSymbol: TokenSymbol
  /** Average block time in seconds, used to simulate block heights. */
  blockTime: number
  /** Block height at the demo epoch (2026-01-01T00:00Z). */
  epochBlock: number
  explorer: string
}

export interface Token {
  symbol: TokenSymbol
  name: string
  decimals: number
  /** Reference price in USD at "now". */
  price: number
  /** Price one year ago, relative to the reference price (0.8 = 20 % lower). */
  yearAgo: number
  /** Daily volatility of the simulated random walk. */
  vol: number
  stable?: boolean
}

export type WalletKind = "connected" | "watch"
export type WalletTag = "everyday" | "cold" | "trading" | "savings" | "other"
export type Horizon = "long" | "short" | "none"

export interface TrackedWallet {
  id: string
  address: string
  label: string
  tag: WalletTag
  kind: WalletKind
  addedAt: number
}

/** One token balance of one wallet on one network. */
export interface Balance {
  walletId: string
  network: NetworkId
  symbol: TokenSymbol
  amount: number
  /** Average cost per unit in USD (ACB). */
  unitCost: number
}

export interface Nft {
  id: string
  walletId: string
  network: NetworkId
  collection: string
  name: string
  tokenId: number
  estimateUsd: number
  acquiredAt: number
  seed: number
}

export type TxType = "receive" | "send" | "swap" | "bridge" | "mint" | "nft-transfer" | "approve"

export interface TokenMove {
  symbol: TokenSymbol
  amount: number
}

export interface Tx {
  hash: string
  walletId: string
  network: NetworkId
  type: TxType
  timestamp: number
  block: number
  status: "confirmed" | "failed"
  in?: TokenMove
  out?: TokenMove
  /** Counterparty address or a known contract label key. */
  counterparty?: string
  counterpartyLabel?: string
  toNetwork?: NetworkId
  nftName?: string
  gasNative: number
  gasSymbol: TokenSymbol
  gasUsd: number
}

export type SyncStatus = "idle" | "queued" | "syncing" | "synced" | "failed"

export interface NetworkSync {
  status: SyncStatus
  /** Last block read successfully. */
  block?: number
  /** Time of the last successful read. */
  syncedAt?: number
  /** Block shown while syncing (ticks up). */
  progressBlock?: number
}

export interface DemoControls {
  failNextRead: boolean
  failNextExport: boolean
  slow: boolean
}

export type Session = "disconnected" | "connecting" | "rejected" | "connected"

export interface DemoState {
  version: 1
  session: Session
  wallets: TrackedWallet[]
  horizons: Partial<Record<TokenSymbol, Horizon>>
  sync: Record<NetworkId, NetworkSync>
  controls: DemoControls
  /** Unix ms when the dataset was generated (anchors relative dates). */
  seededAt: number
}

/** A position is one asset merged across every wallet and network. */
export interface Position {
  symbol: TokenSymbol
  amount: number
  valueUsd: number
  costUsd: number
  pnlUsd: number
  pnlPct: number
  change24hPct: number
  price: number
  horizon: Horizon
  parts: Balance[]
  networks: NetworkId[]
}

export interface PortfolioFilter {
  networks?: NetworkId[]
  walletIds?: string[]
  horizon?: Horizon | "all"
}

export type CostMethod = "acb" | "fifo"
export type ReportKind = "gains" | "transactions" | "holdings"

export interface ExportRequest {
  year: number
  walletIds: string[]
  method: CostMethod
  kind: ReportKind
}

export interface GainRow {
  date: number
  hash: string
  network: NetworkId
  wallet: string
  symbol: TokenSymbol
  amount: number
  proceedsUsd: number
  costUsd: number
  gainUsd: number
}

export interface ExportResult {
  request: ExportRequest
  txCount: number
  disposals: number
  proceedsUsd: number
  costUsd: number
  gainUsd: number
  gasUsd: number
  csv: string
  fileName: string
  previewHeader: string[]
  preview: string[][]
  rowCount: number
}
