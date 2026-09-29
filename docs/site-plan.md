# MultiTrack site plan

MultiTrack is an independent product incubated by Monark (Monark-branded: **false**). This plan is the source of truth for what ships on `develop`; it is kept in sync with the code.

Sources read: the Lovable app on `main` (`src/pages/Index.tsx` and `src/components/*`), the live Lovable site, and the project documentation at https://www.monark.io/en/project/multichain-portfolio-tracker (authoritative), plus `repos-and-websites.md` (branding rule) and sections 9, 11 and 12 of the Monark brand guidelines.

---

## 1. Product brief

**Target user.** People who already hold crypto in more than one place: a hot wallet for everyday use, a cold wallet for savings, a trading wallet on an L2, a few NFTs on another network. Typically a self-directed retail investor, a Web3 developer or student who has accumulated test and real assets across networks, or a small-business owner who needs a clean record for an accountant. Secondary audience: design-conscious developers evaluating how a read-only multichain dashboard should be built.

**Core job to be done.** "Tell me what I own across all my wallets and networks, what it is worth, what it cost me and what happened to it, without making me add up five block explorers or hand over a private key. And when tax season comes, give me a file I can trust."

**Domain concepts.**

| Concept | Meaning in MultiTrack |
|-|-|
| Wallet | An address the user tracks. Either *connected* (proved by a signature) or *watch-only* (address pasted in). Has a label and a tag (for example "Cold storage", "Trading"). |
| Network | A chain MultiTrack reads. The demo reads five testnets: Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia and Polygon Amoy. |
| Sync | One read of one network for all tracked wallets. States: queued, syncing, synced (with block height and time), failed (RPC timeout), stale. |
| Position | One asset merged across every wallet and network (for example tUSDC on four networks is one position with a per-network split). This is the normalization step the documentation calls the "data aggregation and normalization engine". |
| Holding horizon tag | Long-term, short-term or untagged, set per position, used to filter and in exports. |
| Cost basis | What the user paid for a position, computed from history with ACB (average cost, the Canadian rule) or FIFO. |
| Activity | Normalized history across networks: receive, send, swap, bridge, NFT mint, NFT transfer, approval, each with gas paid. |
| Export | A CSV of transactions, realized gains or holdings for a tax year and a set of wallets. |

**What the Lovable version got wrong or left out.**

- It was a static screenshot. "Connect" flipped a boolean; no wallet was ever read, nothing synced, nothing could fail.
- It showed chains as separate silos (a pie of "Ethereum / Bitcoin / Polygon / BSC") and never merged the same asset across networks, which is the whole point of a multichain tracker.
- No cost basis, no profit and loss, no tagging, no filtering, no export: every button ("Export CSV", "Load more", "Analytics", "Profile") was dead.
- Performance was six hard-coded monthly points with no time ranges.
- Purple-to-blue gradients, frosted glass and emoji buttons: the generic 2023 crypto look.
- A single fixed English banner; no French, no disclaimers near financial figures, no empty, loading or error states, no mobile layout for the dashboard.

## 2. Value proposition

> **For anyone holding crypto in more than one wallet or network, MultiTrack turns scattered balances into one reconciled portfolio, with cost basis, history and tax-ready exports, read-only and without a private key, instead of a spreadsheet stitched together from block explorers.**

Supporting benefits (outcomes):

1. **Know your real total in seconds.** Every wallet and network adds up to one number you can trust, with the freshness of each network shown next to it.
2. **See one asset as one position.** tUSDC on four networks is one line with its split one tap away, so you rebalance what you actually hold.
3. **Hand your accountant a clean file.** Realized gains and full history for the year, computed with ACB or FIFO, in one CSV.

## 3. Hero

- **Headline (EN):** Every wallet, every chain, one honest number. *(7 words)*
- **Headline (FR):** Tous vos portefeuilles, toutes vos chaînes, un seul vrai total.
- **Subheadline (EN):** MultiTrack reads your wallets on five networks, merges the same asset wherever it lives and shows what you own, what it cost and what changed. Read-only: it never asks for a key.
- **Subheadline (FR):** MultiTrack lit vos portefeuilles sur cinq réseaux, regroupe un même actif où qu'il se trouve et vous montre ce que vous détenez, ce qu'il vous a coûté et ce qui a bougé. En lecture seule : aucune clé demandée.
- **Primary CTA:** "Open the demo dashboard" / « Ouvrir le tableau de bord » → `/{locale}/app`
- **Secondary CTA:** "How it reads your chains" / « Comment il lit vos chaînes » → `/{locale}/how-it-works`
- **Hero visual:** a live product card built in code, not a picture. The total value counts up, the **strata band** (one horizontal band, one layer per network) settles into place, three merged positions list their per-network split, and a sync line reads "5 networks · synced just now". Why: the product's core idea (many layers, one total) is visible in two seconds, and it is the real component used in the app, so the page never oversells.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections in order |
|-|-|-|
| `/` (home) | Explain the product and send people into the demo | Hero with live strata card · "Already multichain" problem strip · Strata section (rock photo, "every network is a layer") · Four feature highlights with mini UIs · Tax-season section (photo + export preview) · FAQ · Closing CTA |
| `/app` | Overview dashboard (connect gate when disconnected) | Connect gate or: header (total, change, sync line) · strata band filter · performance chart (7D/30D/90D/1Y) · top positions · sync panel · recent activity |
| `/app/holdings` | All positions, NFTs | Filter bar (network, wallet, tag, hide dust, sort) · positions table with expandable per-network split and tag control · NFTs grid tab |
| `/app/activity` | Normalized history | Filters (type, network, wallet, search) · grouped-by-day list · load more · transaction detail sheet |
| `/app/wallets` | Manage tracked wallets | Wallet list (label, tag, networks, value, remove) · add-wallet form with lookup |
| `/app/export` | Tax and records export | Form (year, wallets, cost-basis method, report type) · generation progress · preview and download |
| `/how-it-works` | Credibility for the developer and student audience: how read-only aggregation, normalization, pricing and failure handling work. It needs its own page because it is long-form and diagram-led, and the home page must stay short. | Intro · pipeline diagram (wallets → network readers → normalize → price → your view) · read-only promise (what it reads, what it never touches) · freshness and failures · "Swap the demo for real chains" developer note · CTA |
| `/credits` | Photo credits (required by the asset rules) | Photo list with photographers and links |
| `/pricing` | Internal strategy review only. **Never linked**, excluded from the sitemap, `robots: noindex, nofollow`. | Three tiers · reasoning |
| 404 | Friendly not-found in both languages | Message · links home and to the demo |

**Header:** wordmark (left) · links: Product (home), How it works, Demo · EN/FR switch · theme toggle · primary pill "Open the demo". In the app, the header action becomes the `connect-wallet` component plus a "Demo · simulated data" badge. Mobile: wordmark + menu button opening a full-height sheet.

**App navigation:** left rail on desktop (Overview, Holdings, Activity, Wallets, Export, then Demo controls); a five-tab bottom bar on mobile, with safe-area padding.

**Footer:** one-line product description · links (Product, How it works, Demo, Credits, GitHub repo, project page on monark.io) · "Demo · simulated data" and "Testnet demo · not financial advice · no real funds" · "Built with Monark" credit (small, muted, links to monark.io) · photo credit link.

## 5. Feature highlights

| Feature | User benefit | Where on the site | Proving flow |
|-|-|-|-|
| **Strata band** (one total, one layer per network) | See where your money lives at a glance and filter everything by tapping a layer | Home hero; top of `/app` | Flow 1 (first sync builds the band), Flow 3 (tap a layer to filter) |
| **Merged positions** | One asset is one position, with its per-network and per-wallet split | Home features; `/app/holdings` | Flow 3 |
| **Visible sync** | Know how fresh each number is; a network that fails never silently zeroes your balance | Home features; `/app` sync panel; `/how-it-works` | Flow 1 (a network fails, retry) |
| **Wallet and horizon tags** | Separate cold storage from trading, long-term from short-term | Home features; `/app/wallets`, `/app/holdings` | Flow 2, Flow 3 |
| **Normalized activity** | One history across networks, with gas, searchable | `/app/activity` | Flow 4 |
| **Tax-ready export** | Realized gains with ACB or FIFO, ready for an accountant | Home tax section; `/app/export` | Flow 5 |

## 6. Key flows

All latency is simulated (400 ms to 2.5 s per step, slower with the "Slow network" demo control). Demo controls (in the app rail and the mobile header) offer: *Fail the next network read*, *Fail the next export*, *Slow network*, and *Reset demo*.

**Flow 1 · Connect and first sync**
1. Visitor opens `/app` and sees the connect gate ("Connect a demo wallet" or "Explore with a sample portfolio").
2. The simulated wallet prompt asks to approve a read-only sign-in (**pending**: "Waiting for your wallet…").
   - **Failed:** the visitor clicks *Reject* → inline message "You declined the sign-in. Nothing was shared." with *Try again*.
3. **Confirmed:** the sync panel runs: each of the five networks goes queued → syncing (block counter) → synced, and the strata band grows layer by layer while the total counts up.
4. **Failed read:** with *Fail the next network read* on (or randomly never, the demo is deterministic), Polygon Amoy times out: its layer is hatched, a banner says "Polygon Amoy didn't answer. Its balances are from the last good read, 2 h ago." → *Retry Polygon Amoy* → synced.

**Flow 2 · Track another wallet**
1. `/app/wallets` → *Add a wallet*. Paste an address (sample chips: "A trading wallet", "An empty address", "A typo").
2. Validation: invalid length or characters → "That isn't a valid address. EVM addresses start with 0x and have 40 hex characters."; already tracked → "You already track this wallet as “Main”."
3. **Pending:** "Looking this address up on 5 networks…" with per-network ticks.
4. **Confirmed:** "Found activity on 3 networks · $4,812.40". Name it, choose a tag, *Start tracking* → toast, the new layer slides into the strata band.
5. **Empty:** "No activity on any supported network." → *Track it anyway* or *Cancel*.
6. **Failed:** with *Fail the next network read*, lookup fails → "We couldn't reach Base Sepolia. Try again in a moment." → *Retry lookup*.

**Flow 3 · Read the portfolio**
1. On `/app`, tap a strata layer (for example Arbitrum Sepolia): the total, chart and positions filter to that network; *Clear filter* returns.
2. `/app/holdings`: filter by wallet, network and tag; toggle *Hide balances under $1*; sort by value, 24 h change or P&L.
3. Expand tUSDC: its per-network and per-wallet split, cost basis, unrealized P&L.
4. Set its horizon to *Long-term* → saved (toast "tUSDC tagged long-term").
5. **Empty:** a filter that matches nothing → "Nothing matches these filters." with *Clear filters*.
6. NFTs tab: grid of collectibles with network, wallet and last sale estimate.

**Flow 4 · Trace activity**
1. `/app/activity`: history grouped by day across networks.
2. Filter by type (swap, bridge, NFT…), network or wallet; search by token, address or hash.
3. *Load more* (**pending** skeleton rows, then 20 more); at the end, "That's everything since you started tracking."
4. Open a transaction: sheet with from/to, amounts, gas in the native token and in dollars, block, status and a simulated explorer link.
5. **Empty:** "No activity matches “0xdead”." with *Clear search*. **Failed:** with *Fail the next network read*, load more fails → "Loading more failed. Your filters are kept." → *Try again*.

**Flow 5 · Export for taxes**
1. `/app/export`: choose tax year (2025 or 2026 to date), wallets, cost-basis method (ACB or FIFO) and report (realized gains, all transactions, year-end holdings).
2. *Generate report* → **pending** steps: "Gathering 214 transactions" → "Pricing each one at its time" → "Computing gains with ACB".
3. **Confirmed:** summary (proceeds, cost basis, realized gain, short-term vs long-term), a 5-row preview, *Download CSV* (a real file generated in the browser).
4. **Failed:** with *Fail the next export*, pricing fails → "3 transactions had no price at their time." → *Use the nearest hourly price and retry* → confirmed.
5. Every export view carries "Not tax advice. Check with a professional."

## 7. Content (EN / FR)

Tone: calm, exact, a little dry. Short sentences, numbers over adjectives, no hype, no "revolutionize". Addresses the user as *you* / *vous*. French is written for Québec and France readers alike (vouvoiement, *portefeuille* for wallet, *réseau* for network, *on-chain* kept).

### Header and footer

| Key | EN | FR |
|-|-|-|
| Nav | Product · How it works · Demo | Produit · Fonctionnement · Démo |
| Header action | Open the demo | Ouvrir la démo |
| Footer line | One reconciled view of every wallet, on every network. Read-only. | Une vue réconciliée de tous vos portefeuilles, sur tous les réseaux. En lecture seule. |
| Disclaimer | Demo · simulated data | Démo · données simulées |
| Money disclaimer | Testnet demo · not financial advice · no real funds | Démo sur testnet · pas un conseil financier · aucun fonds réel |
| Credit | Built with Monark | Propulsé par Monark |

### Home

**Problem strip.** EN heading: "Your portfolio is already multichain. Your tools aren't." Body: "Three wallets, five networks, one spreadsheet that's wrong by Friday. Explorers show one address on one chain; exchanges show only what they hold." Stats: "5 explorers to check" · "3 wallets to add up" · "0 cost basis anywhere".
FR heading: « Votre portefeuille est déjà multichaîne. Vos outils, non. » Body : « Trois portefeuilles, cinq réseaux et un tableur faux dès vendredi. Un explorateur montre une adresse sur une chaîne ; une plateforme d'échange, seulement ce qu'elle garde. » Stats : « 5 explorateurs à consulter » · « 3 portefeuilles à additionner » · « 0 prix de revient nulle part ».

**Strata section.** EN heading: "Every network is a layer. Your total is the rock." Body: "MultiTrack draws your portfolio as one band. Each layer is a network, sized by what you hold there. Tap a layer and the whole dashboard follows; if a network is slow, its layer says so instead of quietly dropping to zero."
FR heading: « Chaque réseau est une strate. Votre total, c'est la roche. » Body : « MultiTrack dessine votre portefeuille en une seule bande. Chaque strate est un réseau, à la taille de ce que vous y détenez. Touchez une strate et tout le tableau de bord suit ; si un réseau tarde, sa strate l'indique au lieu de tomber discrètement à zéro. »

**Features.**
1. EN "One asset, one line" — "tUSDC on four networks is a single position. Open it to see where each dollar sits and what it cost." / FR « Un actif, une ligne » — « Du tUSDC sur quatre réseaux, c'est une seule position. Ouvrez-la pour voir où dort chaque dollar et ce qu'il vous a coûté. »
2. EN "Sync you can see" — "Every network shows its block height and last read. A failed read is flagged and retried, never hidden." / FR « Une synchro visible » — « Chaque réseau affiche sa hauteur de bloc et sa dernière lecture. Une lecture ratée est signalée et relancée, jamais masquée. »
3. EN "Tags that mean something" — "Label wallets as cold storage or trading, positions as long- or short-term, and filter everything by them." / FR « Des étiquettes utiles » — « Classez vos portefeuilles (épargne à froid, trading) et vos positions (long ou court terme), puis filtrez tout en fonction. »
4. EN "History that reads like a ledger" — "Sends, swaps, bridges and mints from every network in one timeline, with the gas you paid." / FR « Un historique qui se lit comme un grand livre » — « Envois, échanges, ponts et frappes de tous les réseaux dans une seule chronologie, avec les frais de gaz payés. »

**Tax section.** EN heading: "Tax season, minus the marathon." Body: "Pick a year and a method, ACB or FIFO. MultiTrack prices every disposal at its time and hands you realized gains in one CSV your accountant can open." CTA: "Try the export". FR heading : « La saison des impôts, sans le marathon. » Body : « Choisissez une année et une méthode, PBR ou PEPS. MultiTrack valorise chaque cession au moment où elle a eu lieu et vous remet vos gains réalisés dans un seul CSV que votre comptable saura ouvrir. » CTA : « Essayer l'export ».

**FAQ.**
1. EN "Does MultiTrack need my private key or seed phrase?" — "Never. It reads public blockchain data for the addresses you give it. Connecting a wallet only proves the address is yours; it can't move anything." / FR « MultiTrack a-t-il besoin de ma clé privée ou de ma phrase secrète ? » — « Jamais. Il lit les données publiques des adresses que vous lui donnez. Connecter un portefeuille prouve seulement que l'adresse est à vous ; rien ne peut être déplacé. »
2. EN "Which networks does it read?" — "The demo reads five testnets: Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia and Polygon Amoy. Adding a network means adding one reader, not a new app." / FR « Quels réseaux sont lus ? » — « La démo lit cinq testnets : Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia et Polygon Amoy. Ajouter un réseau, c'est ajouter un lecteur, pas une nouvelle application. »
3. EN "What happens when a network is down?" — "Its layer is marked stale and keeps the last good balances, with the time of that read. Nothing drops to zero without telling you." / FR « Que se passe-t-il quand un réseau est en panne ? » — « Sa strate est marquée comme périmée et garde les derniers soldes valides, avec l'heure de cette lecture. Rien ne tombe à zéro sans vous prévenir. »
4. EN "Is the export tax advice?" — "No. It is a clean record of what happened, priced at the time. Tax rules differ by country; check with a professional." / FR « L'export est-il un conseil fiscal ? » — « Non. C'est un relevé propre de ce qui s'est passé, valorisé au bon moment. Les règles varient selon les pays ; consultez un professionnel. »
5. EN "Is any of this real?" — "Not yet. This is a demo on simulated testnet data: no real wallet, no real funds. The data layer is built to be swapped for live network readers." / FR « Est-ce que tout ça est réel ? » — « Pas encore. C'est une démo sur des données de testnet simulées : aucun vrai portefeuille, aucun fonds réel. La couche de données est conçue pour être remplacée par de vrais lecteurs réseau. »

**Closing CTA.** EN "Open the dashboard. It already has a portfolio in it." / FR « Ouvrez le tableau de bord. Un portefeuille vous y attend déjà. »

### App (key strings)

| Where | EN | FR |
|-|-|-|
| Gate heading | See every wallet in one place | Tous vos portefeuilles au même endroit |
| Gate body | Connect a demo wallet to sign in read-only. MultiTrack will read five test networks and build your portfolio. | Connectez un portefeuille de démo pour vous identifier en lecture seule. MultiTrack lira cinq réseaux de test et construira votre portefeuille. |
| Gate action | Connect demo wallet | Connecter le portefeuille démo |
| Wallet prompt | MultiTrack asks you to sign in. This signature is free and can't move funds. | MultiTrack vous demande de vous identifier. Cette signature est gratuite et ne peut déplacer aucun fonds. |
| Rejected | You declined the sign-in. Nothing was shared. | Vous avez refusé l'identification. Rien n'a été partagé. |
| Sync pending | Reading {network}… block {block} | Lecture de {network}… bloc {block} |
| Sync failed | {network} didn't answer. Its balances are from the last good read, {time}. | {network} n'a pas répondu. Ses soldes datent de la dernière lecture valide, {time}. |
| Holdings empty | Nothing matches these filters. | Rien ne correspond à ces filtres. |
| Activity end | That's everything since you started tracking. | C'est tout depuis le début du suivi. |
| Activity empty | No activity matches “{q}”. | Aucune activité ne correspond à « {q} ». |
| Wallets empty | You aren't tracking any wallet yet. | Vous ne suivez encore aucun portefeuille. |
| Lookup empty | No activity on any supported network. | Aucune activité sur les réseaux pris en charge. |
| Export failed | {n} transactions had no price at their time. | {n} transactions n'avaient pas de prix au moment voulu. |
| Export disclaimer | Not tax advice. Check with a professional. | Pas un conseil fiscal. Consultez un professionnel. |
| Reset | Reset demo | Réinitialiser la démo |
| Generic error | Something went wrong on our side. Your data is safe; try again. | Un problème est survenu de notre côté. Vos données sont intactes ; réessayez. |
| 404 | This page isn't on any chain we read. | Cette page n'existe sur aucune chaîne que nous lisons. |

The complete strings live in `src/i18n/dictionaries/en.ts` and `fr.ts`.

## 8. Aesthetics

**Concept: "Surveyed, layered, calm, exact."** MultiTrack's visual world is the geological survey and the paper ledger, not the trading floor. People open a portfolio tracker to feel oriented, not excited: they want to know where everything is and whether the number is right. Survey maps and strata diagrams are the oldest way of showing many layers adding up to one thing, and they carry authority without hype. Paper tones, ink, ochre survey markers and earthy layer colours make MultiTrack look like an instrument you can trust with money, and they are nothing like the neon and purple of crypto dashboards.

**Palette** (hex; shadcn roles; ratios are WCAG 2.1 contrast, computed from WCAG relative luminance during planning):

| Role | Light | Dark |
|-|-|-|
| background | `#F3F1EA` paper | `#111714` night ink |
| foreground | `#18211D` ink | `#E9E6DC` bone |
| card | `#FBFAF6` | `#171F1B` |
| primary | `#C8961E` ochre | `#DDAA3B` ochre |
| primary-foreground | `#18211D` | `#111714` |
| muted | `#E8E5DB` | `#222B26` |
| muted-foreground | `#555E58` | `#A2A99F` |
| accent | `#ECE3C9` | `#2A3129` |
| accent-foreground | `#18211D` | `#E9E6DC` |
| border | `#D8D4C7` | `#2E3833` |
| ring | `#8C6508` | `#DDAA3B` |
| destructive | `#A5361F` brick | `#E0735B` |
| gain (extra token) | `#2D6A3E` moss | `#7CC08A` |
| loss (extra token) | `#A5361F` brick | `#EC8A73` |
| ochre-ink (links, eyebrows) | `#7F5B06` | `#E3B552` |
| chart-1 (Ethereum Sepolia) | `#B07D12` ochre | `#DDAA3B` |
| chart-2 (Base Sepolia) | `#4E7A3A` moss | `#8DB870` |
| chart-3 (Arbitrum Sepolia) | `#B0573A` clay | `#E08864` |
| chart-4 (Optimism Sepolia) | `#3B6D70` slate | `#6FAFB0` |
| chart-5 (Polygon Amoy) | `#7A5A7C` heather | `#B99ABB` |

Contrast checks (text pairs need 4.5:1, UI and chart marks 3:1):

| Pair | Light | Dark |
|-|-|-|
| foreground / background | 14.58 | 14.54 |
| foreground / card | 15.78 | 13.47 |
| muted-foreground / background | 5.94 | 7.53 |
| muted-foreground / muted | 5.33 | 6.04 |
| primary-foreground / primary | 6.15 | 8.55 |
| accent-foreground / accent | 12.87 | 10.71 |
| destructive-foreground / destructive | 6.67 (white) | 5.86 |
| gain / card | 6.20 | 7.82 |
| loss / card | 6.39 | 6.77 |
| ochre-ink / background | 5.46 | 9.51 |
| ring / background | 4.67 | 8.55 |
| chart-1…5 / card | 3.47, 4.82, 4.71, 5.57, 5.61 | 7.92, 7.39, 6.31, 6.76, 6.73 |

Network colours are MultiTrack's own strata palette, deliberately not the chains' brand colours (which would reintroduce the blue-purple look). Every coloured mark is paired with the network name; gains and losses always carry a sign and an arrow, never colour alone.

**Type** (two families via `next/font/google`):
- **Schibsted Grotesk** (400, 500, 700, 800) for everything readable: a newsroom grotesque with a firm, slightly condensed voice that reads as editorial and precise, not techy. Tabular figures for all amounts.
- **JetBrains Mono** (400, 500) for addresses, hashes, block heights and small labels, where character-level accuracy matters.
- Scale: display `clamp(2.4rem, 6vw, 4.25rem)`/1.02, weight 800, tracking -0.035em · h2 `clamp(1.75rem, 3.5vw, 2.5rem)`/1.1, 700 · h3 1.25rem/1.3, 700 · body 1rem/1.6, 400 · small 0.875rem · label 0.75rem mono, uppercase, tracking 0.08em.

**Logo.** A mark made of three stacked horizontal bars of different lengths inside an ink square (a strata core sample and a stacked allocation bar at once), the top bar in ochre. Wordmark "MultiTrack" in Schibsted Grotesk 800 with tight tracking. Favicon: the mark alone (`src/app/icon.svg`).

**Shape.**
- Radius 6px (controls), 10px (cards); pill only for the primary header action and chips.
- 1px hairline borders do the work; almost no shadows (only on popovers and sheets, a soft 0 8px 24px ink at 12%).
- Horizontal rules and thin contour lines as section dividers, like a survey sheet.
- Motion: 180–260 ms ease-out; count-up totals; strata layers grow from the left; everything respects `prefers-reduced-motion` (settled final states).

**Imagery.** Photography is documentary and quiet, warm-neutral grade: real rock strata for the core metaphor, one real person at a desk for the tax-season moment. No screens-with-candlesticks, no coins, no hands holding phones with charts. Illustrations are diagrams drawn in code with the strata palette (pipeline diagram, mini UIs).

**Signature moments.**
1. **The strata band settles.** On first sync, each network's layer grows in as its read completes and the total counts up; tapping a layer filters the whole dashboard.
2. **The survey sweep.** The sync panel reads network by network, with block counters ticking; a failed network turns hatched and stale, never zero, and retries in place.
3. **The merge.** A position opens into its per-network split: a mini strata bar and rows for each network and wallet, showing that four balances are one asset.

**What we deliberately avoid, and why.** Purple or blue gradients and "AI glow" (the Lovable look and every other crypto dashboard), frosted glass, neon, cyber grids, glowing coins and 3D blobs (they signal speculation, not stewardship). Chain brand colours as the palette (they would turn into a rainbow of blues and purples). The default shadcn look (black primary, zinc, 0.5rem radius everywhere, Inter-like type): replaced by paper, ink, ochre, a newsroom grotesque and hairlines. Also: dark-mode-only design; MultiTrack defaults to the light paper theme with a considered dark "night survey" theme.

## 9. Assets

| File | Purpose and placement |
|-|-|
| `public/images/strata.jpg` | Layered volcanic rock strata (Lanzarote). Home "Every network is a layer" section; how-it-works header band. |
| `public/images/desk-evening.jpg` | A person stretching at a desk under a lamp at the end of the day. Home tax-season section. |
| `src/app/icon.svg` | Favicon (the strata mark). |
| `src/app/[locale]/opengraph-image.tsx` | Generated Open Graph image: wordmark, headline and a strata band, per locale. |

Built in code: strata band, hero card, pipeline diagram, feature mini UIs, NFT artwork (generated SVG from each token id), network dots. Icons: `lucide-react` only. Full photo credits in `docs/assets.md` and on `/credits`.

## 10. Pricing strategy

Model: **free viewer, paid ledger.** Viewing a portfolio must be free: that is how Zerion, Zapper and DeBank set expectations, and trust is earned by being useful before asking for money. The moment of real value is tax season and record keeping, where people already pay $49–$199 a year (Koinly, CoinTracker). MultiTrack is read-only, so there is no transaction or protocol fee to take.

| Tier | Price | Includes |
|-|-|-|
| Survey | $0 | Up to 3 wallets, all supported networks, 12 months of history, holdings CSV |
| Ledger | $8 / month or $72 / year | Unlimited wallets, full history, tax exports (ACB and FIFO, realized gains), horizon tags, price alerts |
| Advisor | $29 / month per advisor | Up to 25 client portfolios, read-only share links, branded PDF reports, priority support |

`/pricing` exists as a designed page for internal review only: never linked, not in the sitemap, `noindex, nofollow`. No price is mentioned anywhere else on the site.

## 11. Out of scope

- Real wallet connection, signatures, RPC calls or price feeds (all simulated in `src/lib/demo/`).
- Sending, swapping or any transaction that moves value; MultiTrack is read-only by design.
- Mainnet networks, non-EVM networks (Bitcoin, Solana) and DeFi position decoding (LP, lending); noted as future readers.
- Accounts, cloud sync or a backend; demo state lives in `localStorage` only.
- Real tax computation for a specific jurisdiction; the export is a record, not advice.
- Price alerts and advisor features (priced on `/pricing`, not built in the demo).

## Decisions made while working unattended

- **Token names.** The demo uses testnet-prefixed tokens (`tETH`, `tWBTC`, `tUSDC`, `tDAI`, `tLINK`, `tPOL`, `tARB`, `tOP`, `tUNI`) and the Monark DeFi family's reference prices where they overlap ($3,200, $64,000, $1, $1, $14.50), so no real mainnet asset is implied.
- **Networks.** Five EVM testnets; the chains' own names are kept since they are the real test networks users would recognise.
- **Performance chart** plots the value of current holdings over time (honestly labelled), not a reconstructed historical balance.
- **Cost basis** defaults to ACB (average cost), the Canadian rule, with FIFO as an option.
- **Locales** format numbers and dates with `en-CA` and `fr-CA`.
