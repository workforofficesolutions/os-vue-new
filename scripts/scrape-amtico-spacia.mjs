import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

// NOTE:
// Amtico uses a “Residential / Commercial” gate. In headless runs, the products grid often
// won’t render until the site preference is set. We therefore:
// 1) Open the homepage, click “Continue to Commercial” (sets the preference)
// 2) Navigate to the Spacia filtered products URL
// 3) Click “Load more” if present, and/or scroll until no new items appear
// 4) Extract codes + names from either card text OR the href

const HOME = "https://www.amtico.com/";
const URL = "https://www.amtico.com/commercial/products/?collection=Amtico+Spacia";

function toImagePath(code) {
  return `/brand/amtico/products/spacia/variants/spacia-${code.toLowerCase()}.webp`;
}

function normText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function parseCodeFromHref(href) {
  const h = href || "";
  // examples:
  // https://www.amtico.com/commercial/products/ss5w3312/
  // https://www.amtico.com/products/ss5w3312/
  const m = h.match(/\/(ss[0-9a-z]+)\/?$/i);
  return m ? m[1].toUpperCase() : null;
}

function parseNameAndCodeFromText(text) {
  const t = normText(text);
  // expects "... SS5W3312" at end
  const m = t.match(/^(.*)\s+(SS[0-9A-Z]+)$/i);
  if (!m) return null;
  return { name: `${m[1].trim()} ${m[2].toUpperCase()}`, code: m[2].toUpperCase() };
}

async function ensureCommercialPreference(page) {
  await page.goto(HOME, { waitUntil: "domcontentloaded" });

  // If the gate exists, click through to Commercial and wait until we’re on /commercial
  const commercialBtn = page.getByRole("link", { name: /continue to commercial/i });
  if (await commercialBtn.count()) {
    await Promise.all([
      page.waitForURL(/\/commercial\b/i, { timeout: 30000 }).catch(() => null),
      commercialBtn.first().click().catch(() => null),
    ]);
  }
}

async function loadAllResults(page) {
  // Some builds use a “Load more” button instead of infinite scroll.
  for (let i = 0; i < 80; i++) {
    const loadMore = page.getByRole("button", { name: /load more/i });
    if (await loadMore.count()) {
      const btn = loadMore.first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => null);
        await page.waitForTimeout(900);
        continue;
      }
    }
    break;
  }

  // Fallback: auto-scroll the main page (works if it’s infinite scroll)
  let lastCount = 0;
  for (let i = 0; i < 60; i++) {
    // scroll a bit (not only to bottom, because some sites need incremental scroll)
    await page.evaluate(() => window.scrollBy(0, Math.max(600, window.innerHeight)));
    await page.waitForTimeout(600);

    const curCount = await page
      .locator('a[href*="/commercial/products/"]')
      .count()
      .catch(() => 0);

    if (curCount > lastCount) {
      lastCount = curCount;
      continue;
    }

    // one extra “to bottom” nudge
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);

    const curCount2 = await page
      .locator('a[href*="/commercial/products/"]')
      .count()
      .catch(() => 0);

    if (curCount2 === lastCount) break;
    lastCount = curCount2;
  }
}

const args = process.argv.slice(2);
const countOnly = args.includes("--count");
const outIdx = args.indexOf("--out");
const outFile = outIdx >= 0 ? args[outIdx + 1] : null;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1) Set preference to Commercial (otherwise the products grid can be missing in headless)
  await ensureCommercialPreference(page);

  // 2) Now go to the actual products listing URL
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // If the gate is still present on this page, click it here too.
  const gateBtn = page.getByRole("link", { name: /continue to commercial/i });
  if (await gateBtn.count()) {
    await gateBtn.first().click().catch(() => null);
    await page.waitForTimeout(1500);
    // return to listing with filter param
    await page.goto(URL, { waitUntil: "domcontentloaded" });
  }

  // 3) Wait for any product links to appear
  await page.waitForTimeout(2500);
  // This selector is intentionally broad; we dedupe later.
  await page
    .waitForSelector('a[href*="/commercial/products/"]', { timeout: 20000 })
    .catch(() => null);

  // 4) Load everything we can (load-more or infinite scroll)
  await loadAllResults(page);

  // 5) Collect candidate anchors
  const raw = await page.$$eval(
    'a[href*="/commercial/products/"]',
    (as) =>
      as.map((a) => ({
        href: a.href || "",
        text: (a.textContent || "").replace(/\s+/g, " ").trim(),
      }))
  );

  const byCode = new Map();

  for (const r of raw) {
    const parsedText = parseNameAndCodeFromText(r.text);
    const code = parsedText?.code || parseCodeFromHref(r.href);

    // If we still can’t get a code, skip (we only want variants with SS codes)
    if (!code) continue;

    // Prefer the richest “name” we can get
    const name = parsedText?.name || `${normText(r.text)} ${code}`.trim();

    byCode.set(code, {
      name,
      image: toImagePath(code),
    });
  }

  const variants = [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));

  // Ensure “Muted Oak …” is first if present
  const mutedIdx = variants.findIndex((v) => /^Muted Oak\s+SS/i.test(v.name));
  if (mutedIdx > 0) variants.unshift(variants.splice(mutedIdx, 1)[0]);

  // Always show the count clearly in the terminal
  console.error(`Found variants: ${variants.length}`);

  // Optional modes:
  // 1) --count  -> prints only the number to stdout
  // 2) --out <file> -> writes the JSON array to a file and prints a friendly message
  if (countOnly) {
    console.log(String(variants.length));
  } else if (outFile) {
    await writeFile(outFile, JSON.stringify(variants, null, 2), "utf8");
    console.log(`Wrote ${variants.length} variants to ${outFile}`);
  } else {
    // Default: print only the JSON array (easy to paste into catalog.js)
    console.log(JSON.stringify(variants, null, 2));
  }

  await browser.close();
})();