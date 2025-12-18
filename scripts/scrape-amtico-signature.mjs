#!/usr/bin/env node
/**
 * Amtico Signature scraper (SPECIFIC to Signature).
 *
 * What was going wrong before:
 * - Cookie banner button is “Allow all” (Cookiebot), not “Accept all cookies”.
 * - Paging CTA is “Load 100 more products” (or similar), not “Load more”.
 *
 * This script:
 * - Opens Signature collection page
 * - Accepts Cookiebot / commercial overlay
 * - Clicks the “Load N more products” button until all products are loaded
 * - Extracts product name + AR0 code from product tiles
 * - Outputs to amtico-signature-variants.json
 *
 * Run:
 *   node scripts/scrape-amtico-signature.mjs
 *
 * Debug (watch browser):
 *   HEADFUL=true node scripts/scrape-amtico-signature.mjs
 */

import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const URL = 'https://www.amtico.com/commercial/products/?collection=Amtico+Signature'
const PRODUCT_FOLDER = 'signature'
const IMAGE_PREFIX = 'signature'
const OUT_FILE = 'amtico-signature-variants.json'

const HEADFUL = (process.env.HEADFUL || '').toLowerCase() === 'true'

// Product pages look like: /commercial/products/ar0w8430/
const PRODUCT_HREF_RE = /\/commercial\/products\/([a-z0-9-]+)\/?$/i

function isRealProductCode(code) {
  // Signature products use AR0… codes. This prevents accidental non-product matches.
  return !!code && /^AR0[0-9A-Z]{4,12}$/i.test(code)
}

async function clickText(page, text, timeout = 2000) {
  const loc = page.getByText(text, { exact: false })
  if (await loc.first().isVisible({ timeout }).catch(() => false)) {
    await loc.first().click({ timeout }).catch(() => {})
    return true
  }
  return false
}

async function dismissOverlays(page) {
  // Language / welcome overlay
  await clickText(page, 'Continue to Commercial')

  // Cookiebot uses “Allow all”
  await clickText(page, 'Allow all')
  await clickText(page, 'Allow selection')

  // Other cookie banners (fallbacks)
  await clickText(page, 'Accept all cookies')
  await clickText(page, 'Accept All Cookies')
  await clickText(page, 'Accept cookies')
  await clickText(page, 'I agree')
  await clickText(page, 'Agree')
}

async function getProductAnchors(page) {
  // Only anchors that look like a product detail page
  return page.$$eval('a[href^="/commercial/products/"]', (as) =>
    as
      .map((a) => ({
        href: a.getAttribute('href') || '',
        text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
      }))
      .filter((x) => x.href && !x.href.includes('?'))
  )
}

function buildVariant({ href, text }) {
  const m = href.match(PRODUCT_HREF_RE)
  if (!m) return null

  const code = (m[1] || '').toUpperCase()
  if (!isRealProductCode(code)) return null

  // Ensure output always ends with the code.
  let nameOnly = (text || '').trim()
  if (nameOnly) {
    const re = new RegExp(`\\b${code}\\b`, 'i')
    nameOnly = nameOnly.replace(re, '').replace(/\s+/g, ' ').trim()
  }

  const fullName = nameOnly ? `${nameOnly} ${code}` : code

  return {
    name: fullName,
    image: `/brand/amtico/products/${PRODUCT_FOLDER}/variants/${IMAGE_PREFIX}-${code.toLowerCase()}.webp`,
  }
}

async function clickLoadMoreProducts(page) {
  // The button is usually “Load 100 more products” (number may vary)
  const btn = page.getByRole('button', { name: /load\s*\d*\s*more\s*products?/i })
  if (await btn.first().isVisible().catch(() => false)) {
    await btn.first().click().catch(() => {})
    return true
  }

  // Fallback: any visible button containing “Load” + “more products”
  const btn2 = page.getByRole('button', { name: /load.*more.*products?/i })
  if (await btn2.first().isVisible().catch(() => false)) {
    await btn2.first().click().catch(() => {})
    return true
  }

  return false
}

async function loadAllProducts(page) {
  // Click paging + scroll until product-link count stops increasing.
  let prev = 0
  let stable = 0

  const getCount = async () => (await getProductAnchors(page)).length
  prev = await getCount()

  while (stable < 12) {
    await dismissOverlays(page)

    // Scroll to the bottom to ensure the paging CTA is in view.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(800)

    // Click “Load N more products” if present
    const clicked = await clickLoadMoreProducts(page)
    if (clicked) {
      await page.waitForTimeout(1200)
    }

    // Small extra scroll steps for lazy-loading
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.scrollBy(0, Math.max(500, Math.floor(window.innerHeight * 0.9))))
      await page.waitForTimeout(400)
    }

    // Wait briefly for count increase
    try {
      await page.waitForFunction(
        (p) => document.querySelectorAll('a[href^="/commercial/products/"]').length > p,
        prev,
        { timeout: 3500 }
      )
    } catch {
      // ignore
    }

    const count = await getCount()
    if (count > prev) {
      prev = count
      stable = 0
    } else {
      stable += 1
    }
  }
}

const browser = await chromium.launch({ headless: !HEADFUL })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  await dismissOverlays(page)

  await loadAllProducts(page)

  const anchors = await getProductAnchors(page)
  const byCode = new Map()

  for (const a of anchors) {
    const v = buildVariant(a)
    if (!v) continue
    const codeKey = v.image.split('-').pop().replace('.webp', '')
    if (!byCode.has(codeKey)) byCode.set(codeKey, v)
  }

  const variants = Array.from(byCode.values()).sort((a, b) => a.name.localeCompare(b.name))

  console.log(`Found links: ${anchors.length}`)
  console.log(`Found Signature variants: ${variants.length}`)

  await fs.writeFile(OUT_FILE, JSON.stringify(variants, null, 2), 'utf8')
  console.log(`Wrote ${variants.length} variants to ${OUT_FILE}`)

  if (variants.length !== 167) {
    console.log(
      `NOTE: Expected 167 Signature products. Got ${variants.length}. ` +
        `If this is still low, run with HEADFUL=true and confirm the script is clicking “Load 100 more products”.`
    )
  }
} finally {
  await browser.close().catch(() => {})
}
