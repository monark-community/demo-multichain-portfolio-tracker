// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start     (serves on http://localhost:3148)
//        pnpm screenshots             (BASE_URL defaults to http://localhost:3148)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
// ONLY=<substring> limits the run to matching variants (e.g. ONLY=en-390-light).
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3148"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: { connect: "Connect demo wallet", signIn: "Sign in", reject: "Reject", portfolio: "Portfolio", menu: "Open menu", controls: "Demo controls" },
  fr: { connect: "Connecter le portefeuille démo", signIn: "M'identifier", reject: "Refuser", portfolio: "Portefeuille", menu: "Ouvrir le menu", controls: "Contrôles de la démo" },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "reduce",
    hasTouch: w < 768,
    isMobile: w < 768,
    acceptDownloads: true,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

async function eagerImages(page) {
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("img")]
    for (const i of imgs) i.loading = "eager"
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener("load", r, { once: true }); setTimeout(r, 3000) }))))
  })
}

const shot = async (page, v, name, fullPage = false) => {
  const file = `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`
  if (fullPage) {
    await eagerImages(page)
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  await page.waitForTimeout(250)
  await page.screenshot({ path: file, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const main = (page) => page.locator("#main")

async function setControl(page, v, name, on = true) {
  await page.getByRole("button", { name: L[v.locale].controls }).first().click()
  const dialog = page.getByRole("dialog")
  await dialog.waitFor()
  const sw = dialog.getByRole("switch", { name })
  if ((await sw.getAttribute("aria-checked")) !== String(on)) await sw.click()
  await page.keyboard.press("Escape")
  await dialog.waitFor({ state: "detached" })
}

async function waitSynced(page) {
  await page.waitForFunction(() => {
    try {
      const s = JSON.parse(localStorage.getItem("multitrack-demo-v1") || "{}")
      return s.sync && Object.values(s.sync).every((x) => x.status === "synced" || x.status === "failed")
    } catch {
      return false
    }
  }, null, { timeout: 20000 })
  await page.waitForTimeout(300)
}

async function connect(page, v, capture) {
  const t = L[v.locale]
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = main(page).getByRole("button", { name: t.connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "app-01-gate", true)
  await btn.click()
  await page.getByRole("dialog").waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  if (capture) {
    await page.getByRole("dialog").getByRole("button", { name: t.reject }).click()
    await page.getByRole("alert").first().waitFor()
    await shot(page, v, "flow1-connect-rejected")
    await main(page).getByRole("button", { name: /Try again|Réessayer/ }).click()
    await page.getByRole("dialog").waitFor()
  }
  await page.getByRole("dialog").getByRole("button", { name: t.signIn }).click()
  await page.getByRole("heading", { level: 1, name: t.portfolio }).waitFor({ timeout: 10000 })
  if (capture) {
    await page.waitForTimeout(700)
    await shot(page, v, "flow1-syncing")
  }
  await waitSynced(page)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(300)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: L[v.locale].menu }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  // Flow 1: connect, reject, approve, sync sweep
  await connect(page, v, true)
  await shot(page, v, "flow1-synced", true)

  // Flow 1 failure: a network read fails, then retry
  await setControl(page, v, "Fail the next network read")
  await main(page).getByRole("button", { name: "Refresh all" }).first().click()
  await page.getByText("didn't answer").first().waitFor({ timeout: 20000 })
  await waitSynced(page)
  await shot(page, v, "flow1-network-failed", true)
  await main(page).getByRole("button", { name: "Retry Polygon Amoy" }).first().click()
  await page.getByText("didn't answer").first().waitFor({ state: "detached", timeout: 15000 })
  await waitSynced(page)

  // Flow 3: filter by a layer, then holdings
  await main(page).getByRole("button", { name: /Arbitrum Sepolia/ }).first().click()
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-filtered", true)
  await page.goto(`${BASE}/${v.locale}/app/holdings`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Holdings" }).waitFor()
  await shot(page, v, "flow3-holdings", true)
  await page.getByRole("button", { name: "Show where tUSDC sits" }).click()
  await page.getByRole("radio", { name: "Long-term" }).click()
  await page.getByText("tUSDC tagged long-term").waitFor()
  await page.getByRole("button", { name: "Show where tUSDC sits" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-position-split")
  await page.getByRole("button", { name: "Cold storage", exact: true }).click()
  await page.getByRole("button", { name: "Short-term", exact: true }).click()
  await page.getByText("Nothing matches these filters.").waitFor()
  await page.getByText("Nothing matches these filters.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-empty")
  await page.getByRole("tab", { name: "Collectibles" }).click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-nfts", true)

  // Flow 4: activity
  await page.goto(`${BASE}/${v.locale}/app/activity`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Activity" }).waitFor()
  await shot(page, v, "flow4-activity", true)
  await page.getByLabel("Search activity").fill("0xdead")
  await page.getByText("No activity matches").waitFor()
  await shot(page, v, "flow4-empty-search")
  await page.getByRole("button", { name: "Clear search" }).click()
  await page.getByRole("button", { name: "Swaps", exact: true }).click()
  await page.locator("section[aria-label='Activity'] ul li button").first().click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow4-tx-sheet")
  await page.keyboard.press("Escape")
  await page.getByRole("dialog").waitFor({ state: "detached" })
  await page.getByRole("button", { name: "All", exact: true }).click()
  await setControl(page, v, "Fail the next network read")
  await page.getByRole("button", { name: "Load more" }).click()
  await page.getByText("Loading more failed").waitFor({ timeout: 10000 })
  await page.getByText("Loading more failed").scrollIntoViewIfNeeded()
  await shot(page, v, "flow4-load-failed")
  await page.getByRole("button", { name: "Try again" }).click()
  await page.getByText("Loading more failed").waitFor({ state: "detached", timeout: 10000 })

  // Flow 2: track another wallet
  await page.goto(`${BASE}/${v.locale}/app/wallets`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Wallets" }).waitFor()
  await shot(page, v, "flow2-wallets", true)
  await page.getByRole("button", { name: "A typo" }).click()
  await page.getByText("That isn't a valid address").waitFor()
  await page.getByText("That isn't a valid address").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-invalid")
  await page.getByRole("button", { name: "An empty address" }).click()
  await page.getByText("No activity on any supported network.").waitFor({ timeout: 10000 })
  await page.getByText("No activity on any supported network.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-empty")
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  await setControl(page, v, "Fail the next network read")
  await page.getByRole("button", { name: "A trading wallet" }).click()
  await page.getByText("We couldn't reach Base Sepolia").waitFor({ timeout: 10000 })
  await page.getByText("We couldn't reach Base Sepolia").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-lookup-failed")
  await page.getByRole("button", { name: "Retry lookup" }).click()
  await page.getByText("Looking this address up").waitFor()
  await page.waitForTimeout(700)
  await page.getByText("Looking this address up").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-looking")
  await page.getByText(/Found activity on/).waitFor({ timeout: 10000 })
  await page.getByText(/Found activity on/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-found")
  await page.getByRole("button", { name: "Start tracking" }).click()
  await page.getByText("Now tracking Trading").waitFor()
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow2-tracked")
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Portfolio" }).waitFor()
  await page.waitForTimeout(500)
  await shot(page, v, "flow2-overview-after", true)

  // Flow 5: export
  await page.goto(`${BASE}/${v.locale}/app/export`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Export for taxes" }).waitFor()
  await shot(page, v, "flow5-form", true)
  await setControl(page, v, "Fail the next export")
  await page.getByRole("button", { name: "Generate report" }).click()
  await page.getByText("Pricing each one at its time").waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow5-running")
  await page.getByText("had no price at their time").waitFor({ timeout: 10000 })
  await page.getByText("had no price at their time").scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-failed")
  await page.getByRole("button", { name: "Use the nearest hourly price and retry" }).click()
  await page.getByText("Your report is ready").waitFor({ timeout: 10000 })
  await page.getByText("Your report is ready").scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-ready")
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV" }).click()])
  console.log("    download:", download.suggestedFilename())
  await page.waitForTimeout(400)
  await shot(page, v, "flow5-downloaded")

  // Demo controls
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: L[v.locale].controls }).first().click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "app-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(300)
  await shot(page, v, "page-home", true)
  await page.goto(`${BASE}/fr/how-it-works`, { waitUntil: "networkidle" })
  await shot(page, v, "page-how-it-works", true)
  await connect(page, v, true)
  await shot(page, v, "flow1-synced", true)
  await page.goto(`${BASE}/fr/app/holdings`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Voir où se trouve le tUSDC" }).click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-holdings", true)
  await page.goto(`${BASE}/fr/app/activity`, { waitUntil: "networkidle" })
  await shot(page, v, "flow4-activity")
  await page.goto(`${BASE}/fr/app/wallets`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Un portefeuille de trading" }).click()
  await page.getByText(/Activité trouvée sur/).waitFor({ timeout: 10000 })
  await page.getByText(/Activité trouvée sur/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-found")
  await page.goto(`${BASE}/fr/app/export`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Générer le rapport" }).click()
  await page.getByText("Votre rapport est prêt").waitFor({ timeout: 10000 })
  await shot(page, v, "flow5-ready", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
