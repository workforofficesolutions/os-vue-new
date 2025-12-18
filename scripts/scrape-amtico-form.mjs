// scripts/scrape-amtico-form-variants.mjs
// Run:
//   npm i -D playwright
//   node scripts/scrape-amtico-form-variants.mjs
//
// Output:
//   tmp/amtico-form-variants.snippet.js
//   amtico-form-variants.json

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const TARGET_URL = "https://www.amtico.com/commercial/products?collection=Amtico+Form";
const BRAND = "amtico";
const PRODUCT_FOLDER = "form";

const OUT_DIR = path.resolve("tmp");

// JSON requested at project root (same level as package.json)
const OUT_JSON = path.resolve("amtico-form-variants.json");

// Keep snippet in tmp (handy), but also easy to find
const OUT_SNIPPET = path.join(OUT_DIR, "amtico-form-variants.snippet.js");

// ---------- helpers ----------
function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function variantCodeFromUrl(productUrl) {
  try {
    const u = new globalThis.URL(productUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

function imagePathFromCode(code) {
  return `/brand/${BRAND}/products/${PRODUCT_FOLDER}/variants/${PRODUCT_FOLDER}-${String(code).toLowerCase()}.webp`;
}

function withCodeSuffix(name, code) {
  const n = String(name || "").trim();
  const c = String(code || "").trim().toUpperCase();
  if (!n) return c;
  if (!c) return n;

  // If name already ends with the code (case-insensitive), avoid duplicating it
  const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\s*${escaped}\\s*$`, "i");
  const base = n.replace(re, "").trim();

  return `${base} ${c}`.trim();
}

function isLikelyVariantCode(code) {
  const c = String(code || "").trim();
  // Real Amtico SKUs/codes include digits and typically have no hyphens.
  // This filters out collection/landing slugs like `amtico-form`.
  return c.length > 0 && !c.includes("-") && /\d/.test(c) && c.length <= 16;
}

// Deterministic “nice enough” hex from a string (no external libs)
function swatchFromString(str) {
  const s = String(str || "");
  let h = 2166136261; // FNV-ish
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Map to HSL-ish range, then convert to RGB -> HEX
  const hue = Math.abs(h) % 360;
  const sat = 55 + (Math.abs(h >> 8) % 25); // 55–79
  const lit = 45 + (Math.abs(h >> 16) % 15); // 45–59

  const [r, g, b] = hslToRgb(hue / 360, sat / 100, lit / 100);
  return rgbToHex(r, g, b);
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

async function tryAcceptCookies(page) {
  const candidates = [
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("I Accept")',
    'button:has-text("Allow all")',
    'button:has-text("Allow All")',
  ];
  for (const sel of candidates) {
    try {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0) {
        await loc.click({ timeout: 1500 });
        return;
      }
    } catch {}
  }
}

async function trySelectCommercial(page) {
  // Some regions see a gate asking Residential vs Commercial
  const button = page.getByRole("button", { name: /continue to commercial/i }).first();
  const link = page.getByRole("link", { name: /continue to commercial/i }).first();

  try {
    if ((await button.count()) > 0) {
      await button.click({ timeout: 2000 });
      await page.waitForTimeout(800);
      return;
    }
  } catch {}

  try {
    if ((await link.count()) > 0) {
      await link.click({ timeout: 2000 });
      await page.waitForTimeout(800);
      return;
    }
  } catch {}
}

async function autoScroll(page) {
  // In case the listing lazy-loads
  let lastHeight = 0;
  for (let i = 0; i < 12; i++) {
    const height = await page.evaluate(() => document.body.scrollHeight);
    if (height === lastHeight) break;
    lastHeight = height;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

// ---------- main ----------
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const headless = process.env.HEADFUL ? false : true;
  const browser = await chromium.launch({ headless });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
  await tryAcceptCookies(page);
  await trySelectCommercial(page);

  // Let JS render the listing
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1200);
  await autoScroll(page);

  // Scrape product cards from the listing page only
  const raw = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/commercial/products/"]'));

    const items = anchors
      .map((a) => {
        const href = a.href || "";
        // Exclude the listing page itself (has querystring "collection=" etc)
        if (!href.includes("/commercial/products/")) return null;

        // Try best-effort “name” extraction from within/around the anchor
        const direct = (a.textContent || "").replace(/\s+/g, " ").trim();
        const aria = (a.getAttribute("aria-label") || "").trim();
        const titleAttr = (a.getAttribute("title") || "").trim();

        // Look for headings near this link (common in card UIs)
        const card = a.closest("article, li, div");
        const heading =
          card?.querySelector("h1,h2,h3,h4")?.textContent?.replace(/\s+/g, " ")?.trim() || "";

        const name = direct || aria || titleAttr || heading || "";

        return { href, name };
      })
      .filter(Boolean);

    return items;
  });

  // Filter to likely product detail links (remove duplicates and weird ones)
  const cleaned = uniqBy(
    raw
      .map((x) => ({
        href: x.href,
        name: (x.name || "").replace(/\s+/g, " ").trim(),
      }))
      .filter((x) => x.href && !x.href.includes("collection=")),
    (x) => x.href
  );

  const variants = cleaned
    .map((x) => {
      const codeRaw = variantCodeFromUrl(x.href);
      const code = String(codeRaw || "").trim();
      const displayName = withCodeSuffix(x.name || code, code);

      return {
        name: displayName,
        code: code.toUpperCase(),
        image: imagePathFromCode(code),
        swatch: swatchFromString(displayName),
      };
    })
    .filter((v) => isLikelyVariantCode(v.code) && v.name);

  // De-dupe by code and sort for stable output
  const uniqueVariants = uniqBy(variants, (v) => v.code).sort((a, b) => a.name.localeCompare(b.name));

  if (uniqueVariants.length !== 40) {
    console.warn(`⚠️ Found ${uniqueVariants.length} variants (expected 40).`);
    console.warn("First 10 scraped:", uniqueVariants.slice(0, 10).map(v => v.name));
  } else {
    console.log(`✓ Found all 40 variants.`);
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(uniqueVariants, null, 2), "utf8");

  const lines = uniqueVariants.map(
    (v) => `{ name: ${JSON.stringify(v.name)}, image: ${JSON.stringify(v.image)}, swatch: ${JSON.stringify(v.swatch)} },`
  );

  const snippet =
`// Amtico Form (paste into catalog.js for product id: 50)
variants: [
  ${lines.join("\n  ")}
],
`;

  fs.writeFileSync(OUT_SNIPPET, snippet, "utf8");

  await browser.close();

  console.log(`Snippet: ${OUT_SNIPPET}`);
  console.log(`JSON:    ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});