"use client"

import { useSyncExternalStore } from "react"

import { COLD_WALLET, MAIN_WALLET, NETWORK_IDS, blockAt } from "./catalog"
import { balancesOf, networksOf } from "./holdings"
import { livePrice } from "./prices"
import { uid } from "./random"
import { buildExport, type CsvLabels } from "./tax"
import type {
  DemoControls,
  DemoState,
  ExportRequest,
  ExportResult,
  Horizon,
  NetworkId,
  NetworkSync,
  TokenSymbol,
  TrackedWallet,
  WalletTag,
} from "./types"

const KEY = "multitrack-demo-v1"
const STALE_AFTER = 6 * 3_600_000

function emptySync(): Record<NetworkId, NetworkSync> {
  return Object.fromEntries(NETWORK_IDS.map((n) => [n, { status: "idle" }])) as Record<NetworkId, NetworkSync>
}

function initial(): DemoState {
  return {
    version: 1,
    session: "disconnected",
    wallets: [],
    horizons: { tWBTC: "long", tETH: "long", tARB: "short" },
    sync: emptySync(),
    controls: { failNextRead: false, failNextExport: false, slow: false },
    seededAt: Date.UTC(2026, 8, 29, 14, 0),
  }
}

const SERVER_STATE: DemoState = initial()
let state: DemoState = SERVER_STATE
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  let next = initial()
  next.seededAt = Date.now()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed?.version === 1) next = { ...next, ...parsed, controls: { ...next.controls, ...parsed.controls } }
    }
  } catch {
    // Private mode or corrupted storage: start fresh.
  }
  // Interrupted runs never resume half-way.
  if (next.session === "connecting") next.session = "disconnected"
  for (const n of NETWORK_IDS) {
    const s = next.sync[n]
    if (!s) next.sync[n] = { status: "idle" }
    else if (s.status === "queued" || s.status === "syncing") next.sync[n] = { ...s, status: s.syncedAt ? "synced" : "idle" }
  }
  if (Date.now() - next.seededAt > STALE_AFTER) next.seededAt = Date.now()
  state = next
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: the demo keeps working in memory.
  }
}

function set(patch: Partial<DemoState> | ((s: DemoState) => Partial<DemoState>)) {
  const p = typeof patch === "function" ? patch(state) : patch
  state = { ...state, ...p }
  persist()
  for (const l of listeners) l()
}

function setSync(id: NetworkId, s: Partial<NetworkSync>) {
  set((st) => ({ sync: { ...st.sync, [id]: { ...st.sync[id], ...s } } }))
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): DemoState {
  load()
  return state
}

export function useDemo(): DemoState & { ready: boolean } {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE)
  return { ...s, ready: s !== SERVER_STATE }
}

export function getState(): DemoState {
  load()
  return state
}

// ---------------------------------------------------------------- latency

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
function latency(min: number, max: number) {
  const f = state.controls.slow ? 2.4 : 1
  return sleep((min + Math.random() * (max - min)) * f)
}

/** Consume the "fail the next network read" switch. */
function takeReadFailure(): boolean {
  if (!state.controls.failNextRead) return false
  set((s) => ({ controls: { ...s.controls, failNextRead: false } }))
  return true
}

// ---------------------------------------------------------------- session

export function requestConnect() {
  set({ session: "connecting" })
}

export function rejectConnect() {
  set({ session: "rejected" })
}

export async function approveConnect(labels: { main: string; cold: string }) {
  await latency(700, 1100)
  const now = Date.now()
  set((s) => {
    const wallets = s.wallets.length
      ? s.wallets
      : [
          wallet(MAIN_WALLET.address, labels.main, MAIN_WALLET.tag, "connected", now),
          wallet(COLD_WALLET.address, labels.cold, COLD_WALLET.tag, "watch", now),
        ]
    return { session: "connected", wallets, seededAt: s.wallets.length ? s.seededAt : now }
  })
  void syncAll()
}

export function disconnect() {
  set({ session: "disconnected" })
}

function wallet(address: string, label: string, tag: WalletTag, kind: TrackedWallet["kind"], at: number): TrackedWallet {
  return { id: uid("w"), address, label, tag, kind, addedAt: at }
}

// ---------------------------------------------------------------- sync

let syncRun = 0

async function readNetwork(id: NetworkId, fail: boolean, run: number) {
  setSync(id, { status: "syncing", progressBlock: blockAt(id, Date.now()) - 1800 })
  const steps = 6
  for (let i = 1; i <= steps; i++) {
    await latency(110, 260)
    if (run !== syncRun) return
    const target = blockAt(id, Date.now())
    setSync(id, { progressBlock: Math.round(target - 1800 * (1 - i / steps)) })
  }
  if (fail) {
    setSync(id, { status: "failed", progressBlock: undefined })
    return
  }
  const now = Date.now()
  setSync(id, { status: "synced", block: blockAt(id, now), syncedAt: now, progressBlock: undefined })
}

/** Read every network, staggered like a survey sweep. One may fail on request. */
export async function syncAll() {
  const run = ++syncRun
  const failing: NetworkId | null = takeReadFailure() ? "polygon-amoy" : null
  set((s) => ({
    sync: Object.fromEntries(NETWORK_IDS.map((n) => [n, { ...s.sync[n], status: "queued" }])) as Record<NetworkId, NetworkSync>,
  }))
  await Promise.all(
    NETWORK_IDS.map(async (id, i) => {
      await sleep(i * 380 * (state.controls.slow ? 2 : 1))
      if (run !== syncRun) return
      await readNetwork(id, id === failing, run)
    })
  )
}

export async function retryNetwork(id: NetworkId) {
  const fail = takeReadFailure()
  setSync(id, { status: "queued" })
  await latency(250, 450)
  await readNetwork(id, fail, syncRun)
}

// ---------------------------------------------------------------- wallets

export type LookupResult =
  | { status: "found"; networks: NetworkId[]; valueUsd: number }
  | { status: "empty" }
  | { status: "failed"; network: NetworkId }

/** Look an address up on every network (flow 2). Reports progress per network. */
export async function lookupAddress(address: string, onProgress: (done: NetworkId[]) => void): Promise<LookupResult> {
  const fail = takeReadFailure()
  const done: NetworkId[] = []
  for (const id of NETWORK_IDS) {
    await latency(220, 520)
    if (fail && id === "base-sepolia") return { status: "failed", network: id }
    done.push(id)
    onProgress([...done])
  }
  const networks = networksOf(address)
  if (networks.length === 0) return { status: "empty" }
  const probe: TrackedWallet = { id: "probe", address, label: "", tag: "other", kind: "watch", addedAt: 0 }
  const valueUsd = balancesOf(probe).reduce((s, b) => s + b.amount * livePrice(b.symbol, 0), 0)
  return { status: "found", networks, valueUsd }
}

export function addWallet(address: string, label: string, tag: WalletTag): TrackedWallet {
  const w = wallet(address.toLowerCase(), label, tag, "watch", Date.now())
  set((s) => ({ wallets: [...s.wallets, w] }))
  return w
}

export function updateWallet(id: string, patch: Pick<TrackedWallet, "label" | "tag">) {
  set((s) => ({ wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...patch } : w)) }))
}

export function removeWallet(id: string) {
  set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) }))
}

// ---------------------------------------------------------------- positions

export function setHorizon(symbol: TokenSymbol, horizon: Horizon) {
  set((s) => ({ horizons: { ...s.horizons, [symbol]: horizon } }))
}

// ---------------------------------------------------------------- activity paging

export async function loadMore(): Promise<"ok" | "failed"> {
  const fail = takeReadFailure()
  await latency(600, 1100)
  return fail ? "failed" : "ok"
}

// ---------------------------------------------------------------- export

export type ExportStep = "gather" | "price" | "compute"

export class MissingPricesError extends Error {
  constructor(public count: number) {
    super("missing-prices")
  }
}

export async function runExport(
  req: ExportRequest,
  labels: CsvLabels,
  onStep: (step: ExportStep) => void,
  opts: { nearestPrice?: boolean } = {}
): Promise<ExportResult> {
  onStep("gather")
  await latency(700, 1000)
  onStep("price")
  await latency(900, 1300)
  if (state.controls.failNextExport && !opts.nearestPrice) {
    set((s) => ({ controls: { ...s.controls, failNextExport: false } }))
    throw new MissingPricesError(3)
  }
  onStep("compute")
  await latency(600, 900)
  return buildExport(req, state.wallets, state.seededAt, labels)
}

// ---------------------------------------------------------------- demo controls

export function setControl<K extends keyof DemoControls>(key: K, value: DemoControls[K]) {
  set((s) => ({ controls: { ...s.controls, [key]: value } }))
}

export function resetDemo() {
  syncRun++
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  state = { ...initial(), seededAt: Date.now() }
  persist()
  for (const l of listeners) l()
}

// ---------------------------------------------------------------- price tick

const TICK_MS = 20_000
let tick = 0
let timer: ReturnType<typeof setInterval> | null = null
const tickListeners = new Set<() => void>()

function subscribeTick(l: () => void) {
  tickListeners.add(l)
  if (!timer) {
    tick = Math.floor(Date.now() / TICK_MS)
    timer = setInterval(() => {
      tick = Math.floor(Date.now() / TICK_MS)
      for (const x of tickListeners) x()
    }, TICK_MS)
  }
  return () => {
    tickListeners.delete(l)
    if (tickListeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

/** Current price bucket; 0 on the server. Prices wobble slightly every 20 s. */
export function usePriceTick(): number {
  return useSyncExternalStore(
    subscribeTick,
    () => (tick || Math.floor(Date.now() / TICK_MS)),
    () => 0
  )
}
