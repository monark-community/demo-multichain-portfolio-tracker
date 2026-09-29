// Public surface of the simulated data layer. Swap these implementations for
// real readers (viem/wagmi + an indexer + a price API) and the UI stays as is.
export * from "./types"
export { NETWORKS, NETWORK_IDS, TOKENS, TOKEN_SYMBOLS, network, blockAt, MAIN_WALLET, COLD_WALLET, SAMPLE_TRADING, SAMPLE_EMPTY, SAMPLE_TYPO } from "./catalog"
export { balancesOf, nftsOf, networksOf } from "./holdings"
export { activityFor, activityOf, txValueUsd } from "./activity"
export { priceAt, livePrice } from "./prices"
export { readableBalances, filterBalances, positions, totals, byNetwork, history, RANGES, DUST_USD, type Range, type Point, type Totals, type NetworkShare } from "./portfolio"
export { taxYears, type CsvLabels } from "./tax"
export { checkAddress, normalizeAddress, shortAddress } from "./address"
