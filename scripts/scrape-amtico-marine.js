// scrape-amtico-marine.js
// Run (prints JSON to stdout):
//   HEADFUL=true node scripts/scrape-amtico-marine.js > amtico-marine-variants.json
//
// Output shape:
//   [{ name, code, image, swatch }, ...]

import { chromium } from "playwright";
import fs from "node:fs/promises";

const URL = "https://www.amtico.com/commercial/products/?collection=Amtico+Marine";
const PRODUCT_FOLDER = "marine";
const EXPECTED_COUNT = 76;
const OUTFILE = "amtico-marine-variants.json";

// Minimal but more distinct (mostly neutrals/woods/greys, a few muted accents)
const SWATCH_PALETTE = [
  "#F7F4EE", "#F2EFE7", "#ECE6DC", "#E5DED2", "#DDD4C6", "#D3C8B8",
  "#C9BDAA", "#BFAF99", "#B4A189", "#A9957B", "#9F876B", "#946F55",
  "#8A6046", "#7D533B", "#704933", "#64402D", "#583A29", "#4E3427",
  "#463126", "#3F2E25", "#3A3430", "#4B4A46", "#5A5A56", "#6B6A66",
  "#7C7A75", "#8D8B86", "#9E9C97", "#B0AEA9", "#C2C0BB", "#D6D4CF",
  // muted accents (still subtle)
  "#7B8A86", "#6F7C86", "#7A6F86", "#8A7B6F"
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickIfVisible(page, locator) {
  try {
    if (await locator.first().isVisible({ timeout: 1500 })) {
      await locator.first().click({ timeout: 1500 });
      return true;
    }
  } catch {}
  return false;
}

async function chooseEnglishIfPresent(page) {
  // Amtico sometimes shows a full-screen language gate modal.
  // Do NOT rely on exact copy; just click an English option if it's visible.
  try {
    const dialog = page.locator('[role="dialog"], [aria-modal="true"], .modal, .Modal, .MuiDialog-root').first();

    const englishInDialog = dialog
      .locator('a:has-text("English"), button:has-text("English"), [role="button"]:has-text("English")')
      .first();

    const englishGlobal = page
      .locator('a:has-text("English"), button:has-text("English"), [role="button"]:has-text("English")')
      .first();

    const target = (await englishInDialog.isVisible({ timeout: 1200 }).catch(() => false))
      ? englishInDialog
      : (await englishGlobal.isVisible({ timeout: 1200 }).catch(() => false))
        ? englishGlobal
        : null;

    if (!target) return false;

    await Promise.all([
      page.waitForLoadState("domcontentloaded").catch(() => {}),
      target.click({ timeout: 8000, force: true }).catch(() => {})
    ]);

    await page.waitForTimeout(900);
    return true;
  } catch {
    return false;
  }
}

async function dismissOverlays(page) {
  // Language gate (seen on many Amtico pages)
  await chooseEnglishIfPresent(page);

  // Cookiebot often lives in an iframe
  try {
    const frame = page.frameLocator('iframe[id^="CybotCookiebotDialogBody"], iframe[src*="cookiebot"]');
    const acceptAll = frame.getByRole("button", { name: /accept all/i }).first();
    const accept = frame.getByRole("button", { name: /^accept$/i }).first();

    if (await acceptAll.isVisible({ timeout: 800 }).catch(() => false)) {
      await acceptAll.click({ timeout: 2000 }).catch(() => {});
    } else if (await accept.isVisible({ timeout: 800 }).catch(() => false)) {
      await accept.click({ timeout: 2000 }).catch(() => {});
    }
  } catch {}

  // Region/welcome overlays
  await clickIfVisible(page, page.getByRole("button", { name: /continue to commercial/i }));
  await clickIfVisible(page, page.getByRole("link", { name: /continue to commercial/i }));

  // Cookies
  await clickIfVisible(page, page.getByRole("button", { name: /accept all/i }));
  await clickIfVisible(page, page.getByRole("button", { name: /accept/i }));
  await clickIfVisible(page, page.getByRole("button", { name: /allow all/i }));

  // Generic close
  await clickIfVisible(page, page.getByRole("button", { name: /^close$/i }));
  await clickIfVisible(page, page.getByRole("button", { name: /close/i }));
}

async function clickLoadMoreIfPresent(page) {
  // Many Amtico collection pages require clicking "Load 100 more products" (or similar).
  // Do a single best-effort click if the button is visible.
  try {
    const btn = page.getByRole("button", { name: /load\s+\d+\s+more\s+products?/i }).first();
    const btn2 = page.locator('button:has-text("Load")').filter({ hasText: /more products/i }).first();

    const target = (await btn.isVisible({ timeout: 800 }).catch(() => false)) ? btn : btn2;
    if (await target.isVisible({ timeout: 800 }).catch(() => false)) {
      await target.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(700);
      return true;
    }
  } catch {}
  return false;
}

function extractCode(text) {
  // Amtico codes can be short (e.g. MP028) or longer (e.g. AM5W2514, SX5A5607)
  const matches = (text || "").match(/\b[A-Z0-9]{4,12}\b/g) || [];
  const withDigit = matches.filter((m) => /\d/.test(m));
  const pool = withDigit.length ? withDigit : matches;
  return pool.length ? pool[pool.length - 1] : null;
}

function cleanName(name) {
  return (name || "")
    .replace(/\s+/g, " ")
    .replace(/clear filters?/gi, "")
    .replace(/\bfilters?\b/gi, "")
    .replace(/showing\s+\d+\s+of\s+\d+\s+pages?/gi, "")
    .replace(/add to basket/gi, "")
    .replace(/order samples?/gi, "")
    .replace(/amtico\s+marine/gi, "")
    .replace(/favourite/gi, "")
    .replace(/loved items?/gi, "")
    .trim();
}

function pickBestName({ heading, imgAlt, cardText, code }) {
  const candidates = [heading, imgAlt, cardText]
    .map((s) => cleanName(s))
    .filter(Boolean);

  let name = candidates[0] || "";
  if (!name || name.length < 3) name = `Amtico Marine ${code}`;

  // Ensure code is present at end
  if (code && !name.toUpperCase().includes(code.toUpperCase())) {
    name = `${name} ${code}`.trim();
  }

  return name;
}

function extractHexFromStyle(style) {
  if (!style) return null;

  const hex = style.match(/#([0-9a-f]{3}|[0-9a-f]{6})/i)?.[0];
  if (hex) return hex.toUpperCase();

  const rgb = style.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
  if (!rgb) return null;

  const [r, g, b] = rgb.slice(1, 4).map((n) => Math.max(0, Math.min(255, +n)));
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hashStringToIndex(str, modulo) {
  // Small deterministic hash (stable across runs)
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % modulo;
}

function swatchForCode(code) {
  const idx = hashStringToIndex(String(code || ""), SWATCH_PALETTE.length);
  return SWATCH_PALETTE[idx];
}

async function autoScrollUntilStable(page, { stableRounds = 4 } = {}) {
  let lastCount = 0;
  let stable = 0;

  // Try a few rounds of: dismiss overlays -> click load more -> scroll -> re-measure.
  while (stable < stableRounds) {
    await dismissOverlays(page);
    await chooseEnglishIfPresent(page);

    // Click "Load more" if visible (sometimes appears mid-page)
    await clickLoadMoreIfPresent(page);

    // Scroll a bit (not always full height; some pages lazy-load in chunks)
    await page.evaluate(() => window.scrollBy(0, Math.max(800, window.innerHeight)));
    await sleep(600);

    await dismissOverlays(page);
    await chooseEnglishIfPresent(page);

    const count = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/commercial/products/"]'));
      const codes = new Set();

      for (const a of links) {
        const href = a.getAttribute("href") || "";
        const m = href.match(/\/commercial\/products\/([^/?#]+)\/?/i);
        if (!m) continue;
        const seg = (m[1] || "").trim();
        if (!seg) continue;
        if (seg.toLowerCase() === "products") continue;
        if (seg.includes("collection=")) continue;
        codes.add(seg.toUpperCase());
      }

      return codes.size;
    });

    if (count === lastCount && count > 0) stable += 1;
    else stable = 0;

    lastCount = count;

    if (lastCount >= EXPECTED_COUNT) break;
  }

  // Return to top so later reads are consistent
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
}

async function main() {
  const headful = String(process.env.HEADFUL || "").toLowerCase() === "true";

  const browser = await chromium.launch({
    headless: !headful,
    slowMo: headful ? 30 : 0,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: "en-GB",
    extraHTTPHeaders: {
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await chooseEnglishIfPresent(page);
  await dismissOverlays(page);
  await page.waitForTimeout(1500);
  await dismissOverlays(page);
  await clickLoadMoreIfPresent(page);
  await page.waitForTimeout(500);
  await dismissOverlays(page);
  await clickLoadMoreIfPresent(page);
  await page.waitForTimeout(500);
  await dismissOverlays(page);
  await clickLoadMoreIfPresent(page);
  await dismissOverlays(page);

  await autoScrollUntilStable(page);

  const raw = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/commercial/products/"]'));
    const out = new Map();

    for (const a of links) {
      const href = a.getAttribute("href") || "";
      const m = href.match(/\/commercial\/products\/([^/?#]+)\/?/i);
      if (!m) continue;

      const seg = (m[1] || "").trim();
      if (!seg) continue;
      if (seg.toLowerCase() === "products") continue;
      if (seg.includes("collection=")) continue;

      const code = seg.toUpperCase();

      const card = a.closest("article") || a.closest("li") || a.closest("div") || a.parentElement;
      if (!card) continue;

      const cardText = (card.textContent || "").replace(/\s+/g, " ").trim();
      const heading = card.querySelector("h1,h2,h3,h4")?.textContent?.trim() || "";
      const imgAlt = card.querySelector("img[alt]")?.getAttribute("alt")?.trim() || "";

      const swatchEl =
        card.querySelector('[style*="background-color"]') ||
        card.querySelector('[style*="background:"]') ||
        card.querySelector('[style*="background"]') ||
        null;
      const swatchStyle = swatchEl?.getAttribute("style") || "";

      // Prefer the first seen card for a given code (avoid duplicates)
      if (!out.has(code)) out.set(code, { code, heading, imgAlt, cardText, swatchStyle });
    }

    return Array.from(out.values());
  });

  const variants = [];
  for (const r of raw) {
    const code = r.code || extractCode(r.heading) || extractCode(r.imgAlt) || extractCode(r.cardText);
    if (!code) continue;

    const name = pickBestName({ heading: r.heading, imgAlt: r.imgAlt, cardText: r.cardText, code });

    // IMPORTANT: Always output a swatch.
    // If we can read a real swatch from the listing card, use it.
    // Otherwise generate a distinct minimal colour deterministically from the code.
    const swatch = extractHexFromStyle(r.swatchStyle) || swatchForCode(code);

    variants.push({
      name,
      code,
      image: `/brand/amtico/products/${PRODUCT_FOLDER}/variants/${PRODUCT_FOLDER}-${code.toLowerCase()}.webp`,
      swatch,
    });
  }

  // De-dupe by code
  const byCode = new Map();
  for (const v of variants) byCode.set(v.code, v);
  const finalList = Array.from(byCode.values()).sort((a, b) => a.code.localeCompare(b.code));

  if (finalList.length !== EXPECTED_COUNT) {
    console.error(`WARNING: Expected ${EXPECTED_COUNT} variants, got ${finalList.length}.`);
    console.error(`Tip: run with HEADFUL=true and ensure any welcome/cookie overlays are dismissed.`);
  }

  await fs.writeFile(OUTFILE, JSON.stringify(finalList, null, 2) + "\n", "utf8");
  console.error(`✅ Wrote ${finalList.length} variants to ./${OUTFILE}`);
  console.log(JSON.stringify(finalList, null, 2));
  await context.close();
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
