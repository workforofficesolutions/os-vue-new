// #!/usr/bin/env node
// Scrape Amtico Click Smart collection variants (29 items)
// URL: https://www.amtico.com/commercial/products/?collection=Amtico+Click+Smart
// Output (repo root): ./amtico-click-smart-variants.json
// Each item: { name: "<Name> <CODE>", code: "<CODE>", image: "/brand/amtico/products/clicksmart/variants/clicksmart-<codelower>.webp", swatch: "#RRGGBB" }

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const URL = 'https://www.amtico.com/commercial/products/?collection=Amtico+Click+Smart';
const EXPECTED_COUNT = 29;
const OUTFILE = path.resolve(process.cwd(), 'amtico-click-smart-variants.json');

// Click Smart codes appear like: SB5W3012 (example)
const CODE_RE = /\bSB5[A-Z]\d{4}\b/gi;

// Minimal, mostly wood/neutral palette (no images required)
const SWATCH_PALETTE = [
  '#F5F3EE', '#EFECE6', '#E6E1D9', '#D6D0C6', '#C6BEB2', '#B9B0A4',
  '#AFA69A', '#9B948A', '#8D877D', '#7F7A71', '#6F6B63', '#615D56',
  '#B08A6A', '#A07B5B', '#8E6A4D', '#7B5A40', '#6A4C35', '#5B3F2C'
];

function swatchForCode(code) {
  // Stable pick from palette based on code chars
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SWATCH_PALETTE[h % SWATCH_PALETTE.length];
}

function normalizeNameFromText(rawText, code) {
  // Try to get a clean name by removing the code and extra UI strings
  let t = (rawText || '').replace(/\s+/g, ' ').trim();

  // Remove common noisy UI fragments if they appear
  t = t
    .replace(/\bClear\s+filters\b/gi, '')
    .replace(/\bClear\s+Filters\b/gi, '')
    .replace(/\bFilters\b/gi, '')
    .replace(/\bClear\b/gi, '')
    .trim();

  // Remove collection label if it leaks into card text
  t = t
    .replace(/\bAmtico\s+Click\s+Smart\b/gi, '')
    .replace(/\bClick\s+Smart\b/gi, '')
    .trim();

  // Prefer: text before code
  const idx = t.toUpperCase().indexOf(code);
  if (idx > 0) {
    const before = t.slice(0, idx).trim();
    if (before) return before;
  }

  // Fallback: remove the code and trim
  return t.replace(new RegExp(code, 'i'), '').trim();
}

function stripCollectionPrefix(nameOnly) {
  return (nameOnly || '')
    .replace(/^Amtico\s+Click\s+Smart\s*/i, '')
    .replace(/^Click\s+Smart\s*/i, '')
    .trim();
}

async function extractNameFromCard(card, code) {
  // Prefer explicit labels/alt text over whole-card innerText
  const selectors = [
    'img[alt]',
    'img[title]',
    '[class*="title" i]',
    '[class*="name" i]',
    'h1, h2, h3, h4',
    'p'
  ];

  for (const sel of selectors) {
    const loc = card.locator(sel).first();
    if (!(await loc.count())) continue;

    // alt/title are attributes, others are text
    let raw = '';
    if (sel.startsWith('img[')) {
      const attr = sel.includes('alt') ? 'alt' : 'title';
      raw = (await loc.getAttribute(attr).catch(() => '')) || '';
    } else {
      raw = (await loc.innerText().catch(() => '')) || '';
    }

    if (!raw) continue;

    const maybe = stripCollectionPrefix(normalizeNameFromText(raw, code));
    if (maybe && !/^amtico\s+click\s+smart$/i.test(maybe)) return maybe;
  }

  // Fallback to whole card text
  const cardText = (await card.innerText().catch(() => '')) || '';
  return stripCollectionPrefix(normalizeNameFromText(cardText, code));
}

async function acceptCookiesIfPresent(page) {
  // Best-effort cookie banners (won't fail if not present)
  const candidates = [
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '#CybotCookiebotDialogBodyButtonAccept',
    'button:has-text("Allow all")',
    'button:has-text("Accept all")',
    'button:has-text("Accept")',
    'button:has-text("I agree")',
    'button:has-text("Agree")'
  ];
  for (const sel of candidates) {
    const btn = page.locator(sel).first();
    if (await btn.count()) {
      try {
        await btn.click({ timeout: 1500 });
        return;
      } catch {
        // ignore
      }
    }
  }
}

async function scrape() {
  const headful = String(process.env.HEADFUL || '').toLowerCase() === 'true';
  const browser = await chromium.launch({ headless: !headful });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await acceptCookiesIfPresent(page);

  // Ensure product tiles have rendered (wait for at least one SB5 code on the page)
  await page.waitForSelector('text=/\\bSB5[A-Z]\\d{4}\\b/i', { timeout: 20000 }).catch(() => {});

  // Wait for results area to appear (best-effort)
  await page.waitForTimeout(1500);

  const map = new Map(); // code -> { name, code, image, swatch }

  // Helper: collect from product cards by anchoring on the SB5 code elements.
  // The grid cards typically contain:
  //   <CODE> (e.g., SB5S2789)
  //   <Name> (e.g., Lyme)
  //   Amtico Click Smart
  //   Order FREE Sample
  const collectFromCards = async () => {
    const codeEls = page.locator('text=/\\bSB5[A-Z]\\d{4}\\b/i');
    const count = await codeEls.count();
    if (!count) return;

    for (let i = 0; i < count; i++) {
      const codeEl = codeEls.nth(i);
      const rawCode = ((await codeEl.innerText().catch(() => '')) || '').match(CODE_RE)?.[0];
      if (!rawCode) continue;
      const code = rawCode.toUpperCase();
      if (map.has(code)) continue;

      // Find the nearest container that looks like a product tile
      const card = codeEl.locator(
        'xpath=ancestor::*[self::article or self::li or self::div][.//button[contains(., "Order")]]'
      ).first();

      const cardText = (await card.innerText().catch(() => '')) || '';
      const lines = cardText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => !/amtico\s+click\s+smart/i.test(l))
        .filter((l) => !/order\s+free\s+sample/i.test(l))
        .filter((l) => !/showing\s+\d+/i.test(l));

      // Prefer the line immediately after the code line
      let nameOnly = '';
      const codeIdx = lines.findIndex((l) => l.toUpperCase() === code || l.toUpperCase().includes(code));
      if (codeIdx >= 0 && lines[codeIdx + 1]) {
        nameOnly = lines[codeIdx + 1].trim();
      }

      // Fallback: first non-code line
      if (!nameOnly) {
        nameOnly =
          lines.find((l) => {
            const up = l.toUpperCase();
            if (up === code) return false;
            if (CODE_RE.test(up)) return false;
            if (/^SB5[A-Z]\d{4}$/i.test(up)) return false;
            return true;
          }) || '';
      }

      // Last resort: try the previous heuristics (and optionally the detail page)
      if (!nameOnly) {
        nameOnly = await extractNameFromCard(card, code);
      }

      // If we still don't have a meaningful name, skip (better than writing wrong data)
      if (!nameOnly || /^amtico\s+click\s+smart$/i.test(nameOnly)) continue;

      map.set(code, {
        name: `${nameOnly} ${code}`,
        code,
        image: `/brand/amtico/products/clicksmart/variants/clicksmart-${code.toLowerCase()}.webp`,
        swatch: swatchForCode(code)
      });
    }
  };

  // Helper: click "Load more" if present
  const clickLoadMoreIfPresent = async () => {
    const btn = page.locator('button:has-text("Load")').first();
    if (await btn.count()) {
      try {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(1200);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  // Scroll/load loop
  for (let round = 0; round < 10; round++) {
    await collectFromCards();

    if (map.size >= EXPECTED_COUNT) break;

    const loadedMore = await clickLoadMoreIfPresent();
    if (!loadedMore) {
      const codesOnPage = page.locator('text=/\\bSB5[A-Z]\\d{4}\\b/i');
      const n = await codesOnPage.count();
      if (n > 0) {
        await codesOnPage.nth(n - 1).scrollIntoViewIfNeeded().catch(() => {});
      } else {
        await page.evaluate(() => window.scrollBy(0, 1200)).catch(() => {});
      }
      await page.waitForTimeout(800);
    }
  }

  // Fallback: if cards didn't yield enough, scan all visible text for codes,
  // then try to resolve the label near each code.
  if (map.size < EXPECTED_COUNT) {
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const codes = Array.from(new Set((bodyText.match(CODE_RE) || []).map((c) => c.toUpperCase())));

    // Try to resolve each code to a nearby title element
    for (const code of codes) {
      if (map.has(code)) continue;

      // Locate an element containing the code, then walk up to a card-ish container
      const codeEl = page.locator(`text=${code}`).first();
      if (!(await codeEl.count())) continue;

      const card = codeEl.locator('xpath=ancestor::*[self::article or self::li or self::div][1]');
      let nameOnly = await extractNameFromCard(card, code);

      if (!nameOnly || /showing\s+\d+/i.test(nameOnly)) continue;

      map.set(code, {
        name: `${nameOnly} ${code}`,
        code,
        image: `/brand/amtico/products/clicksmart/variants/clicksmart-${code.toLowerCase()}.webp`,
        swatch: swatchForCode(code)
      });
    }
  }

  const variants = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  if (variants.length !== EXPECTED_COUNT) {
    console.warn(`⚠️ Expected ${EXPECTED_COUNT} variants, got ${variants.length}.`);
  } else {
    console.log(`✓ Found all ${EXPECTED_COUNT} variants.`);
  }

  await fs.writeFile(OUTFILE, JSON.stringify(variants, null, 2) + '\n', 'utf8');
  console.log(`✅ Wrote ${variants.length} variants to ./${path.basename(OUTFILE)}`);

  await browser.close();
}

scrape().catch((err) => {
  console.error('❌ Scrape failed:', err);
  process.exit(1);
});