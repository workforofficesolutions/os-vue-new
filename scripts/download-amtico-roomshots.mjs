// scripts/download-amtico-roomshots.mjs
//
// Usage:
//   node scripts/download-amtico-roomshots.mjs amtico-roomshots-collections.json
//   FORCE=true node scripts/download-amtico-roomshots.mjs amtico-roomshots-collections.json
//   HEADFUL=true node scripts/download-amtico-roomshots.mjs amtico-roomshots-collections.json
//
// Input JSON format (array):
// [
//   { "folder": "spacia", "slug": "amtico-spacia", "count": 6 },
//   { "folder": "signature", "slug": "amtico-signature", "count": 6 }
// ]
//
// Notes:
// - URL is built as: https://www.amtico.com/commercial/collections/<slug>/
// - Saves to: /public/brand/amtico/products/<folder>/roomshots/room-1.webp ... room-<count>.webp
//
// Optional env:
//   FORCE=true
//   HEADFUL=true
//   COUNT=6                 # default roomshots per collection if item.count missing
//   CONCURRENCY=2           # parallel downloads per collection
//   MAX_WIDTH=2200          # downscale roomshots to this width
//   TARGET_KB=650           # best-effort final size per image
//   START_QUALITY=78
//   MIN_QUALITY=45
//
// Install sharp (recommended):
//   npm i sharp

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const INPUT = process.argv[2];
if (!INPUT) {
    console.error("❌ Please pass a JSON file. Example: node scripts/download-amtico-roomshots.mjs amtico-roomshots-collections.json");
    process.exit(1);
}

const FORCE = String(process.env.FORCE || "").toLowerCase() === "true";
const HEADFUL = String(process.env.HEADFUL || "").toLowerCase() === "true";
const DEFAULT_COUNT = Number(process.env.COUNT || 6);
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 2));

const MAX_WIDTH = Number(process.env.MAX_WIDTH || 2200);
const TARGET_KB = Number(process.env.TARGET_KB || 650);
const TARGET_BYTES = Math.max(1, TARGET_KB) * 1024;
const START_QUALITY = Number(process.env.START_QUALITY || 78);
const MIN_QUALITY = Number(process.env.MIN_QUALITY || 45);

let sharp = null;
try {
    const mod = await import("sharp");
    sharp = mod.default || mod;
} catch {
    // optional
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function localPathFromPublicPath(publicPath) {
    return path.join(process.cwd(), "public", String(publicPath).replace(/^\//, ""));
}

async function ensureDir(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function fetchWithTimeout(url, ms = 45000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
        const res = await fetch(url, {
            signal: ctrl.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (Node.js)",
                "Accept-Language": "en-GB,en;q=0.9",
            },
        });
        return res;
    } finally {
        clearTimeout(t);
    }
}

function looksLikeRoomshot(u) {
    const s = String(u || "").toLowerCase();
    return /room|lifestyle|interior|installation|installed|scene|in-situ|case-study|project/i.test(s);
}

function looksLikeTiny(u) {
    const s = String(u || "").toLowerCase();
    return /icon|logo|sprite|swatch|thumbnail|thumb|_50x50|_100x100|w=50|w=100/i.test(s);
}

function normalizeUrl(u) {
    if (!u) return null;

    const raw = String(u).trim().replace(/&amp;/g, "&");
    if (!raw) return null;

    // Ignore common broken relative Cloudinary transforms that appear in srcset
    // like: "f_auto/v.../path/image_650x800.jpg" (no leading slash / scheme)
    if (/^(f_auto|q_auto|c_fill|c_fit|c_scale|w_\d+)/i.test(raw)) return null;

    // Drop data URIs
    if (raw.startsWith("data:")) return null;

    if (raw.startsWith("//")) return `https:${raw}`;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

    // Allow site-relative paths
    if (raw.startsWith("/")) return `https://www.amtico.com${raw}`;

    // Anything else is ambiguous (and often breaks). Skip it.
    return null;
}

function scoreRoomshotUrl(u) {
    const s = String(u || "").toLowerCase();
    let score = 0;

    if (looksLikeRoomshot(u)) score += 60;
    if (looksLikeTiny(u)) score -= 120;

    // Prefer JPG/WEBP over PNG generally (but not mandatory)
    if (s.includes(".jpg") || s.includes(".jpeg")) score += 8;
    if (s.includes(".webp")) score += 6;

    // Prefer URLs that hint higher res
    // (common patterns: width=, w=, 1920, 2560, etc.)
    const wParam = s.match(/[?&](w|width)=(\d{3,5})/);
    if (wParam?.[2]) {
        const w = Number(wParam[2]);
        if (w >= 1600) score += 20;
        else if (w >= 1200) score += 12;
        else if (w >= 800) score += 6;
    }

    // Some CDNs embed sizes like "..._1920x1080..."
    const token = s.match(/_(\d{3,5})x(\d{3,5})_/);
    if (token?.[1] && token?.[2]) {
        const maxDim = Math.max(Number(token[1]), Number(token[2]));
        if (maxDim >= 1800) score += 18;
        else if (maxDim >= 1200) score += 10;
        else if (maxDim >= 800) score += 5;
    }

    return score;
}

async function chooseEnglishIfPresent(page) {
    try {
        const dialog = page.locator('[role="dialog"], [aria-modal="true"], .modal, .Modal, .MuiDialog-root').first();
        const english = dialog
            .locator('a:has-text("English"), button:has-text("English"), [role="button"]:has-text("English")')
            .first();

        if (await english.isVisible({ timeout: 1200 }).catch(() => false)) {
            await english.click({ timeout: 8000, force: true }).catch(() => { });
            await page.waitForTimeout(800);
            return true;
        }
    } catch { }
    return false;
}

async function dismissOverlays(page) {
    await chooseEnglishIfPresent(page);

    // Cookiebot iframe
    try {
        const frame = page.frameLocator('iframe[id^="CybotCookiebotDialogBody"], iframe[src*="cookiebot"]');
        const acceptAll = frame.getByRole("button", { name: /accept all/i }).first();
        const accept = frame.getByRole("button", { name: /^accept$/i }).first();
        if (await acceptAll.isVisible({ timeout: 800 }).catch(() => false)) await acceptAll.click({ timeout: 2000 }).catch(() => { });
        else if (await accept.isVisible({ timeout: 800 }).catch(() => false)) await accept.click({ timeout: 2000 }).catch(() => { });
    } catch { }

    // Generic accept/close
    try {
        const acceptAll = page.getByRole("button", { name: /accept all/i }).first();
        const accept = page.getByRole("button", { name: /accept/i }).first();
        const close = page.getByRole("button", { name: /close/i }).first();
        if (await acceptAll.isVisible({ timeout: 600 }).catch(() => false)) await acceptAll.click({ timeout: 1200 }).catch(() => { });
        if (await accept.isVisible({ timeout: 600 }).catch(() => false)) await accept.click({ timeout: 1200 }).catch(() => { });
        if (await close.isVisible({ timeout: 600 }).catch(() => false)) await close.click({ timeout: 1200 }).catch(() => { });
    } catch { }
}

async function autoScroll(page) {
    for (let i = 0; i < 10; i += 1) {
        await page.evaluate(() => window.scrollBy(0, Math.max(900, window.innerHeight)));
        await page.waitForTimeout(500);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
}

async function extractRoomshotCandidates(page) {
    const urls = await page.evaluate(() => {
        const out = new Set();

        // Prefer resolved URLs the browser actually chose (absolute, correct CDN)
        for (const img of Array.from(document.querySelectorAll("img"))) {
            const current = img.currentSrc;
            if (current) out.add(current);

            const src = img.getAttribute("src");
            if (src) out.add(src);

            const srcset = img.getAttribute("srcset");
            if (srcset) {
                for (const part of srcset.split(",")) {
                    const u = part.trim().split(/\s+/)[0];
                    if (u) out.add(u);
                }
            }
        }

        // Also include <source srcset> (picture/video patterns)
        for (const s of Array.from(document.querySelectorAll("source[srcset]"))) {
            const srcset = s.getAttribute("srcset");
            if (!srcset) continue;
            for (const part of srcset.split(",")) {
                const u = part.trim().split(/\s+/)[0];
                if (u) out.add(u);
            }
        }

        // background-image urls
        for (const el of Array.from(document.querySelectorAll("*"))) {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (!bg || bg === "none") continue;
            const m = bg.match(/url\(["']?([^"')]+)["']?\)/i);
            if (m?.[1]) out.add(m[1]);
        }

        return Array.from(out);
    });

    const cleaned = urls
        .map(normalizeUrl)
        .filter(Boolean)
        .filter((u) => /\.(jpe?g|png|webp)(\?|$)/i.test(u))
        .filter((u) => !looksLikeTiny(u));

    // Dedup by pathname (strip query)
    const seen = new Set();
    const dedup = [];
    for (const u of cleaned) {
        const key = u.split("?")[0].toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        dedup.push(u);
    }

    // IMPORTANT: We do NOT require the URL to “look like roomshot” anymore.
    // Some Amtico collection pages don’t label room images with predictable tokens.
    // We pick the biggest images by probing dimensions below.

    return dedup.sort((a, b) => scoreRoomshotUrl(b) - scoreRoomshotUrl(a));
}
async function getDimsFromBuffer(buf) {
    if (!sharp) return null;
    try {
        const meta = await sharp(buf).metadata();
        if (!meta?.width || !meta?.height) return null;
        return { width: meta.width, height: meta.height };
    } catch {
        return null;
    }
}

function area(d) {
    return (d?.width || 0) * (d?.height || 0);
}

async function pickTopByDimensions(candidates, count) {
    // If we can’t probe, just take first N by heuristic score
    if (!sharp) return candidates.slice(0, count);

    const PROBE = Math.min(24, Math.max(6, count * 6));
    const probeList = candidates.slice(0, PROBE);

    const probed = [];
    for (const u of probeList) {
        try {
            const res = await fetchWithTimeout(u);
            if (!res.ok) continue;
            const buf = Buffer.from(await res.arrayBuffer());

            // Skip extremely small assets (icons, tiny thumbs)
            if (buf.length < 12 * 1024) continue;

            const dims = await getDimsFromBuffer(buf);
            if (!dims) continue;

            // Prefer genuinely “big” imagery
            const maxDim = Math.max(dims.width, dims.height);
            const minDim = Math.min(dims.width, dims.height);
            if (maxDim < 900 || minDim < 500) continue;

            probed.push({ u, dims, bytes: buf.length });
        } catch {
            // ignore
        }
        await sleep(40);
    }

    if (!probed.length) return candidates.slice(0, count);

    // Sort by total pixel area, then by max dimension
    probed.sort((a, b) => {
        const da = area(a.dims);
        const db = area(b.dims);
        if (db !== da) return db - da;
        const ma = Math.max(a.dims.width, a.dims.height);
        const mb = Math.max(b.dims.width, b.dims.height);
        return mb - ma;
    });

    return probed.slice(0, count).map((x) => x.u);
}

async function compressRoomshotToWebp(buf) {
    if (!sharp) return buf;

    let quality = Math.min(95, Math.max(1, START_QUALITY));
    let width = Math.max(800, MAX_WIDTH);

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const out = await sharp(buf)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality, effort: 6, smartSubsample: true })
            .toBuffer();

        if (out.length <= TARGET_BYTES) return out;

        if (quality > MIN_QUALITY) {
            quality = Math.max(MIN_QUALITY, quality - 8);
            continue;
        }

        // quality already low, reduce width
        width = Math.max(800, Math.floor(width * 0.85));
        quality = Math.min(95, Math.max(MIN_QUALITY, START_QUALITY));
    }

    return sharp(buf).rotate().webp({ quality: MIN_QUALITY, effort: 6 }).toBuffer();
}

async function downloadOneImage(url, outPath) {
    if (!FORCE) {
        try {
            await fs.access(outPath);
            return { skipped: true };
        } catch { }
    }

    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`Failed ${url} (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());

    await ensureDir(outPath);
    const outBuf = await compressRoomshotToWebp(buf);
    await fs.writeFile(outPath, outBuf);

    return { skipped: false, bytes: outBuf.length };
}

async function pool(items, worker, concurrency) {
    const results = [];
    let i = 0;

    async function run() {
        while (i < items.length) {
            const idx = i++;
            try {
                results[idx] = await worker(items[idx], idx);
            } catch (e) {
                results[idx] = { error: String(e?.message || e), item: items[idx] };
            }
            await sleep(80);
        }
    }

    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, run));
    return results;
}

function collectionUrl(slug) {
    return `https://www.amtico.com/commercial/collections/${slug.replace(/^\/|\/$/g, "")}/`;
}

async function main() {
    const abs = path.isAbsolute(INPUT) ? INPUT : path.join(process.cwd(), INPUT);
    const collections = JSON.parse(await fs.readFile(abs, "utf8"));

    if (!Array.isArray(collections) || collections.length === 0) {
        throw new Error("Input must be a JSON array of { folder, slug, count }.");
    }

    const browser = await chromium.launch({ headless: !HEADFUL, slowMo: HEADFUL ? 30 : 0 });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: "en-GB",
        extraHTTPHeaders: { "Accept-Language": "en-GB,en;q=0.9" },
    });

    const page = await context.newPage();
    page.setDefaultTimeout(60000);

    const output = [];

    for (const item of collections) {
        const folder = String(item.folder || "").trim().toLowerCase();
        const slug = String(item.slug || "").trim().toLowerCase();
        const count = Number(item.count || DEFAULT_COUNT);

        if (!folder || !slug) {
            console.error("⚠️ Skipping item missing folder/slug:", item);
            continue;
        }

        const url = collectionUrl(slug);
        console.error(`\n— ${folder} —`);
        console.error(`  ▶ ${url}`);

        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1200);
        await dismissOverlays(page);
        await autoScroll(page);
        await dismissOverlays(page);

        const candidates = await extractRoomshotCandidates(page);
        if (!candidates.length) {
            console.error("  ❌ No suitable image candidates found on page.");
            output.push({ folder, slug, roomshots: [] });
            continue;
        }

        // Pick the biggest images by probing dimensions (landscape or portrait).
        const picked = await pickTopByDimensions(candidates, count);
        console.error(`  ✓ Candidates: ${candidates.length}, picked (largest): ${picked.length}`);

        const roomshots = [];
        const tasks = picked.map((imgUrl, i) => {
            const publicPath = `/brand/amtico/products/${folder}/roomshots/room-${i + 1}.webp`;
            const outPath = localPathFromPublicPath(publicPath);
            roomshots.push(publicPath);
            return { imgUrl, outPath };
        });

        const results = await pool(
            tasks,
            async (t) => downloadOneImage(t.imgUrl, t.outPath),
            Math.min(CONCURRENCY, 3)
        );

        const errs = results.filter((r) => r?.error);
        if (errs.length) console.error(`  ⚠️ Errors: ${errs.length} (first: ${errs[0].error})`);
        else console.error(`  ✅ Downloaded ${tasks.length}`);

        output.push({ folder, slug, roomshots });
    }

    await context.close();
    await browser.close();

    // Print a JSON you can paste back into catalog objects if needed
    console.log(JSON.stringify(output, null, 2));
}

main().catch((e) => {
    console.error("❌", e?.message || e);
    process.exit(1);
});