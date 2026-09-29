# MultiTrack

**Every wallet, every chain, one honest number.**

MultiTrack is a read-only multichain portfolio tracker. It reads your wallets on five networks, merges the same asset wherever it lives into one position, shows cost basis, profit and loss and a normalized activity history, and exports realized gains for tax season (ACB or FIFO). It never asks for a private key.

This repository is the demo site: a Next.js app where every network read, price and wallet signature is simulated, so each flow (including failures) can be completed end to end. MultiTrack is an independent product incubated by [Monark](https://www.monark.io). Project page: https://www.monark.io/en/project/multichain-portfolio-tracker

> Demo · simulated data. Testnet demo · not financial advice · no real funds.

## Run it locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3148
```

Checks and production build:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start        # http://localhost:3148
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` is optional (canonical URLs, sitemap, Open Graph); it defaults to `https://multitrack.monark.io`.

## What you can do in the demo

1. **Connect and sync**: sign in with the demo wallet (or reject it), then watch five testnets being read one by one. The portfolio's strata band grows layer by layer.
2. **Track another wallet**: paste an address or try a sample (a trading wallet, an empty address, a typo); see validation, per-network lookup, empty and failed states.
3. **Read the portfolio**: filter by network (tap a layer), wallet or holding horizon; open a position to see where it sits on each network; tag it long- or short-term; browse collectibles.
4. **Trace activity**: one timeline across networks, with search, filters, paging and a transaction detail sheet.
5. **Export for taxes**: pick a year, wallets, ACB or FIFO and a report; generate and download a real CSV.

**Demo controls** (flask icon in the app) make the simulation misbehave on purpose: fail the next network read, fail the next export, or slow every read down. **Reset demo** clears everything stored in the browser.

## How the simulation works

Everything simulated lives behind a small typed data layer in `src/lib/demo/`, so it can be swapped for real readers (viem/wagmi clients, an indexer and a price API) without touching UI code:

| File | Role |
|-|-|
| `types.ts` | Domain model: networks, wallets, balances, positions, transactions, sync state, exports |
| `catalog.ts` | The five testnets, test tokens (`tETH`, `tWBTC`, `tUSDC`…), the sample wallets |
| `holdings.ts` | Balances and NFTs per address (hand-written profiles, or deterministic from the address) |
| `activity.ts` | Deterministic, believable transaction history per wallet |
| `prices.ts` | Price series pinned at both ends (a Brownian bridge), price at any time, "live" wobble |
| `portfolio.ts` | Merging balances into positions, totals, per-network shares, performance series |
| `tax.ts` | Realized gains with ACB or FIFO, CSV generation |
| `store.ts` | Client store (`useSyncExternalStore`), `localStorage` persistence with try/catch, latency, the sync engine and every action |

Demo state persists in `localStorage` (`multitrack-demo-v1`). All randomness is seeded, so the same address always shows the same history.

## Project structure

```
src/
  app/
    [locale]/            EN/FR routes: home, how-it-works, app/*, credits, pricing (unlinked), 404
    globals.css          Theme tokens (paper, ink, ochre, strata palette), utilities
    sitemap.ts robots.ts icon.svg
  components/
    ui/                  Monark UI registry components, re-themed
    site/                Header, footer, logo, locale switch, theme toggle
    home/                Hero strata card, feature mini UIs
    demo/                App shell and every demo view
  i18n/                  Locale config and typed EN/FR dictionaries
  lib/demo/              The simulated data layer
  proxy.ts               Redirects / to the visitor's language
docs/
  site-plan.md           Product brief, identity, flows, copy (matches what shipped)
  assets.md              Photo credits and built-in assets
  screenshots/           Playwright screenshots (390px and 1440px, light and dark, EN and FR)
scripts/screenshots.mjs  Regenerates the screenshots against a running production build
```

Stack: Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui on the [Monark UI registry](https://ui.monark.io), `lucide-react`. Charts are hand-drawn SVG, so no chart library is shipped.

## Screenshots

```bash
pnpm build && pnpm start      # in one terminal
pnpm screenshots              # in another; ONLY=en-390-light limits the run
```

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, `pnpm install`, `pnpm build`). No `vercel.json` and no environment variables are required. The Node version is pinned in `package.json` (`engines.node`).
