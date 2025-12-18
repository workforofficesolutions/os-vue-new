// scripts/scrape-amtico-decor.mjs
import fs from "fs/promises";
import { chromium } from "playwright";

const URL = "https://www.amtico.com/commercial/products?collection=Amtico+Decor";
const OUTFILE = "amtico-decor.variants.json";
const EXPECTED = 45;

// minimal palette, reused cyclically
const PALETTE = [
  "#F2F1EE", "#E6E1D9", "#D6D0C6", "#C6BEB2",
  "#B9B0A4", "#A48F7A", "#9B948A", "#8D877D",
  "#8D7E6C", "#7F7A71", "#6F6B63", "#615D56",
];

const pickSwatch = (code) => {
  const n = Number(code.replace(/\D/g, "")) || 0; // DC623 -> 623
  return PALETTE[n % PALETTE.length];
};

const toOneLineJsonArray = (arr) =>
  "[\n" + arr.map((o) => "  " + JSON.stringify(o)).join(",\n") + "\n]\n";

async function main() {
  const headless = process.env.HEADFUL ? false : true;
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // try to accept cookies if a banner exists (safe no-op if not)
  const accept = page.getByRole("button", { name: /accept/i });
  if (await accept.count()) await accept.first().click().catch(() => {});

  // scroll a bit to ensure all tiles lazy-render
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(250);
  }

  const items = await page.$$eval(
    'a[href*="/commercial/products/"][href*="/products/"]',
    (links) =>
      links
        .map((a) => ({
          href: a.getAttribute("href") || "",
          text: (a.textContent || "").replace(/\s+/g, " ").trim(),
        }))
        .filter((x) => x.href && x.text)
  );

  const map = new Map();

  for (const it of items) {
    const m = (it.href + " " + it.text).match(/\bDC\d{3}\b/i);
    if (!m) continue;

    const code = m[0].toUpperCase();
    const nameOnly = it.text.replace(new RegExp(`\\b${code}\\b`, "i"), "").trim();
    if (!nameOnly) continue;

    map.set(code, {
      name: `${nameOnly} ${code}`,
      code,
      image: `/brand/amtico/products/decor/variants/decor-${code.toLowerCase()}.webp`,
      swatch: pickSwatch(code),
    });
  }

  const variants = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  if (variants.length !== EXPECTED) {
    throw new Error(`Expected ${EXPECTED} variants, got ${variants.length}.`);
  }

  await fs.writeFile(OUTFILE, toOneLineJsonArray(variants), "utf8");
  console.log(`✓ Wrote ${variants.length} variants to ./${OUTFILE}`);

  await browser.close();
}

main().catch((e) => {
  console.error("❌ Scrape failed:", e.message || e);
  process.exit(1);
});