// scripts/scrape-amtico-access.mjs
import fs from "fs/promises";
import { chromium } from "playwright";

const URL = "https://www.amtico.com/commercial/products/?collection=Amtico+Access";
const EXPECTED_COUNT = 24;

const OUTFILE = "amtico-access-variants.json";
const PRODUCT_SLUG = "access";
const IMAGE_BASE = `/brand/amtico/products/${PRODUCT_SLUG}/variants/${PRODUCT_SLUG}-`;

// minimal palette (mostly browns/woods/whites/greys)
const SWATCHES = [
  "#F5F3EE", "#EFECE6", "#E6E1D9", "#D6D0C6", "#C6BEB2", "#B9B0A4",
  "#A79D90", "#9B948A", "#8D877D", "#7F7A71", "#6F6B63", "#615D56",
  "#B08A6A", "#A07B5B", "#8E6A4D", "#7B5A40", "#6A4C35", "#5B3F2C"
];

function hashToIndex(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

function buildVariant(nameRaw, codeRaw) {
  const code = String(codeRaw).trim().toUpperCase();
  const name = String(nameRaw).trim();
  const codeLower = code.toLowerCase();
  return {
    name: `${name} ${code}`.replace(/\s+/g, " ").trim(),
    code,
    image: `${IMAGE_BASE}${codeLower}.webp`,
    swatch: SWATCHES[hashToIndex(code, SWATCHES.length)],
  };
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 900;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total > document.body.scrollHeight + 2000) {
          clearInterval(timer);
          resolve();
        }
      }, 120);
    });
  });
}

async function main() {
  const headful = String(process.env.HEADFUL || "").toLowerCase() === "true";
  const browser = await chromium.launch({ headless: !headful });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // In case it lazy-loads tiles
  await autoScroll(page);
  await page.waitForTimeout(800);

  // 1) Collect unique SX5… codes from the collection page.
  const codes = await page.evaluate(() => {
    const CODE_RE = /\bSX5[A-Z0-9]{3,}\b/g;

    const fromText = (document.body?.innerText || '').match(CODE_RE) || [];

    const fromLinks = Array.from(document.querySelectorAll('a[href]'))
      .map(a => String(a.getAttribute('href') || ''))
      .flatMap(href => href.match(CODE_RE) || []);

    const fromImgs = Array.from(document.querySelectorAll('img[src]'))
      .map(img => String(img.getAttribute('src') || ''))
      .flatMap(src => src.match(CODE_RE) || []);

    const all = [...fromText, ...fromLinks, ...fromImgs]
      .map(s => String(s).trim().toUpperCase())
      .filter(s => s.startsWith('SX5'));

    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  });

  console.log(`Collected ${codes.length} unique SX5 codes from the collection page.`);

  // 2) Resolve each code to its real product name by requesting the product detail page.
  // Using the DE path is stable and still contains the correct H1 product name.
  const PRODUCT_PAGE_BASE = 'https://www.amtico.com/de/produkte/';

  const decodeEntities = (str) => {
    return String(str)
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractNameFromHtml = (html, code) => {
    const h = String(html || '');

    // Prefer H1 (this is the actual product name)
    const h1 = h.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1 && h1[1]) return decodeEntities(h1[1]);

    // Fallback: og:title often looks like "Organza Weave | SX5A3806 | Amtico ..."
    const og = h.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (og && og[1]) {
      const raw = decodeEntities(og[1]);
      const first = raw.split('|')[0]?.trim();
      if (first) return first;
    }

    // Last resort: try to find a "# Name" style heading in rendered text blocks
    const re = new RegExp(`${code}\\s*<`, 'i');
    if (re.test(h)) {
      // Try to capture the nearest preceding heading (very defensive)
      const head = h.match(/<h1[^>]*>([^<]+)<\/h1>/i) || h.match(/<h2[^>]*>([^<]+)<\/h2>/i);
      if (head && head[1]) return decodeEntities(head[1]);
    }

    return '';
  };

  const request = page.context().request;

  const resolved = [];
  for (const code of codes) {
    const url = `${PRODUCT_PAGE_BASE}${code.toLowerCase()}/`;
    try {
      const resp = await request.get(url);
      if (!resp.ok()) {
        console.warn(`⚠️ ${code}: HTTP ${resp.status()} when requesting ${url}`);
        continue;
      }
      const html = await resp.text();
      const name = extractNameFromHtml(html, code);
      if (!name) {
        console.warn(`⚠️ ${code}: Could not extract name from product page.`);
        continue;
      }
      resolved.push(buildVariant(name, code));
    } catch (e) {
      console.warn(`⚠️ ${code}: request failed (${e?.message || e}).`);
    }
  }

  const map = new Map(resolved.map(v => [v.code, v]));

  // Keep only valid Access codes (SX5…) and sort
  const variants = Array.from(map.values())
    .filter((v) => /^SX5[A-Z0-9]{3,}$/.test(v.code))
    .sort((a, b) => a.code.localeCompare(b.code));

  if (variants.length !== EXPECTED_COUNT) {
    console.warn(`⚠️ Expected ${EXPECTED_COUNT} variants, got ${variants.length}.`);
  } else {
    console.log(`✓ Found all ${EXPECTED_COUNT} variants.`);
  }

  await fs.writeFile(OUTFILE, JSON.stringify(variants, null, 2) + "\n", "utf8");
  console.log(`✅ Wrote ${variants.length} variants to ./${OUTFILE}`);

  await browser.close();
}

main().catch((e) => {
  console.error("❌ Scrape failed:", e);
  process.exit(1);
});