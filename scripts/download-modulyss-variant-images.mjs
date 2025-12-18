// scripts/download-modulyss-variant-images.mjs
//
// Usage (preferred): pass a JSON file of Modulyss PRODUCTS (array), each with { slug, variants:[{name,image}] }
//   node scripts/download-modulyss-variant-images.mjs modulyss-products.json
//
// Usage (single product): pass a JSON file of VARIANTS (array) + slug
//   node scripts/download-modulyss-variant-images.mjs modulyss-willow-variants.json willow
//
// Optional env:
//   FORCE=true            # re-download even if file exists
//   CONCURRENCY=6         # parallel image downloads
//   LOCALE=en-GB          # locale in URL (default en-GB)
//   CATEGORY=carpet       # category in URL (default carpet)
//   TARGET_KB=300         # target max file size per image (best-effort)
//   VARIANT_MAX_WIDTH=900 # resize variants to this width (best-effort)
//   ROOMSHOT_MAX_WIDTH=1600 # resize roomshots to this width (best-effort)
//   START_QUALITY=70      # initial WebP quality
//   MIN_QUALITY=35        # minimum WebP quality before shrinking further
//   PROBE_N=4             # max candidates to probe per code
//   MAX_SQUARE_DIM=1400   # upper bound when preferring tiles
//
// Install sharp (recommended for .webp):
//   npm i sharp

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const INPUT = process.argv[2];
const SINGLE_SLUG = process.argv[3];

if (!INPUT) {
    console.error("❌ Please pass an input file (JSON with products or variants).");
    process.exit(1);
}

const FORCE = String(process.env.FORCE || "").toLowerCase() === "true";
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);
const LOCALE = process.env.LOCALE || "en-GB";
const CATEGORY = process.env.CATEGORY || "carpet";

const TARGET_KB = Number(process.env.TARGET_KB || 300);
const TARGET_BYTES = Math.max(1, TARGET_KB) * 1024;

// Downscale + compress to keep website-friendly sizes.
const VARIANT_MAX_WIDTH = Number(process.env.VARIANT_MAX_WIDTH || 900);
const ROOMSHOT_MAX_WIDTH = Number(process.env.ROOMSHOT_MAX_WIDTH || 1600);

const START_QUALITY = Number(process.env.START_QUALITY || 70);
const MIN_QUALITY = Number(process.env.MIN_QUALITY || 35);
const MIN_WIDTH = Number(process.env.MIN_WIDTH || 480);

const PROBE_N = Number(process.env.PROBE_N || 4);
const MAX_SQUARE_DIM = Number(process.env.MAX_SQUARE_DIM || 1400);
const MIN_BYTES_FOR_TILE = 5 * 1024; // 5 KB threshold to drop tiny swatches

let sharp = null;
try {
    const mod = await import("sharp");
    sharp = mod.default || mod;
} catch {
    // sharp is optional, but recommended
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
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

function localPathFromPublicPath(publicPath) {
    return path.join(process.cwd(), "public", String(publicPath).replace(/^\//, ""));
}

async function ensureDir(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function extractVariantKey(variant) {
    const name = String(variant?.name || "").trim();
    const img = path.posix.basename(String(variant?.image || ""));

    const isGradient =
        /gradient/i.test(name) ||
        /gradient/i.test(img);

    // Prefer numeric code from end of name: "Mezzo Gradient 389" -> "389"
    const m1 = name.match(/(\d+)\s*$/);
    let code = m1?.[1];

    if (!code) {
        const m2 = img.match(/-(\d+)\.(webp|png|jpe?g)$/i);
        if (m2?.[1]) code = m2[1];
    }

    if (!code) return null;

    return {
        code,
        isGradient,
        key: `${code}${isGradient ? "-gradient" : "-base"}`,
    };
}


function uniqueUrlsFromHtml(html) {
    const urls = html.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    const set = new Set();
    for (const u of urls) set.add(u.replace(/&amp;/g, "&"));
    return Array.from(set);
}

function sliceBetween(html, startMarker, endMarker) {
    const s = html.indexOf(startMarker);
    if (s === -1) return null;

    const from = s + startMarker.length;
    const e = endMarker ? html.indexOf(endMarker, from) : -1;

    const to = e === -1 ? html.length : e;
    return html.slice(from, to);
}

function looksLikeRoomshotUrl(u) {
    const lu = String(u || "").toLowerCase();
    return /room|roomshot|lifestyle|interior|scene|application|install/i.test(lu);
}

function parseSizeToken(u) {
    const lu = String(u || "").toLowerCase();
    const m = lu.match(/_(\d{2,4})x(\d{2,4})_/);
    if (!m) return null;
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (!w || !h) return null;
    return { w, h };
}

function isLowResSwatch(u) {
    const lu = String(u || "").toLowerCase();
    if (lu.includes("_50x50_") || /\b50x50\b/.test(lu)) return true;
    const sz = parseSizeToken(u);
    if (!sz) return false;
    return Math.max(sz.w, sz.h) <= 120; // treat <=120px as swatch-like
}

function isTileLikeUrl(u) {
    const lu = String(u || "").toLowerCase();

    // We want the BIG square tile downloads, not the tiny swatches.
    if (isLowResSwatch(u)) return false;

    const sz = parseSizeToken(u);
    if (sz) {
        const ratio = sz.w / sz.h;
        const squareish = ratio > 0.85 && ratio < 1.15;
        if (squareish && Math.max(sz.w, sz.h) >= 300) return true;
    }

    // Fallback hint
    return /\btile\b/.test(lu);
}

function scoreVariantCandidateUrl(u) {
    const lu = String(u || "").toLowerCase();
    let s = 0;

    // Prefer official download CDN
    if (lu.includes("wasabisys.com/modulyss")) s += 50;

    // Never use tiny swatches
    if (isLowResSwatch(u)) s -= 250;

    // Prefer square-ish, larger assets
    const sz = parseSizeToken(u);
    if (sz) {
        const ratio = sz.w / sz.h;
        const squareish = ratio > 0.85 && ratio < 1.15;
        if (squareish) s += 60;

        const maxDim = Math.max(sz.w, sz.h);
        if (maxDim >= 800) s += 30;
        else if (maxDim >= 500) s += 20;
        else if (maxDim >= 300) s += 10;
    }

    // Mild preference for explicit tile wording
    if (/\btile\b/.test(lu)) s += 10;

    // Avoid swatch keyword
    if (/swatch/i.test(lu)) s -= 120;

    // BIG penalty: never prefer lifestyle/room imagery for variants
    if (looksLikeRoomshotUrl(u)) s -= 200;

    // Slight preference for jpg
    if (lu.endsWith(".jpg") || lu.includes(".jpg?")) s += 2;

    return s;
}

function absolutizeModulyssUrl(u) {
    if (!u) return null;
    const url = String(u).replace(/&amp;/g, "&");
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) return `https://modulyss.com${url}`;
    return url;
}

function extractDownloadImageLinks(html) {
    const out = [];
    const re = /<a[^>]+href=["']([^"']+)["'][^>]*>\s*Download image\s*<\/a>/gi;
    let m;

    while ((m = re.exec(html))) {
        const href = absolutizeModulyssUrl(m[1]);
        if (!href) continue;

        // Look just above link: e.g. "Mezzo 389" or "Mezzo Gradient 389"
        const start = Math.max(0, m.index - 400);
        const end = m.index + 20;
        const chunk = html.slice(start, end);

        // Match collection label + numeric code
        // e.g. "Mezzo 389", "Mezzo Gradient 389"
        const mLabel = chunk.match(/([A-Za-z]+(?:\s+Gradient)?)\s+(\d{2,4})/i);
        if (!mLabel) continue;

        const label = mLabel[1];      // "Mezzo" or "Mezzo Gradient"
        const code = mLabel[2];       // "389"
        const isGradient = /gradient/i.test(label);

        if (looksLikeRoomshotUrl(href)) continue;

        const key = `${code}${isGradient ? "-gradient" : "-base"}`;
        out.push({ key, code, isGradient, href });
    }
    return out;
}



function buildVariantDownloadHrefMap(html) {
    // Tight slice for the real Colours block
    const coloursSection =
        sliceBetween(html, "Colours\n-------", "\nMix&match\n") ||
        sliceBetween(html, "Colours\n-------", "\nProjects using") ||
        html;

    if (coloursSection === html) {
        console.error("  ⚠️  Could not find Colours section, using full HTML");
    }

    const links = extractDownloadImageLinks(coloursSection);

    const map = new Map();
    for (const { key, href } of links) {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(href);
    }
    for (const [k, arr] of map.entries()) {
        map.set(k, Array.from(new Set(arr)));
    }
    return map;

}


function buildVariantCandidateMap(html) {
    const coloursSection =
        sliceBetween(html, "##  Colours", "##") ||
        sliceBetween(html, "## Colours", "##") ||
        sliceBetween(html, "##Colours", "##") ||
        html;

    const urls = uniqueUrlsFromHtml(coloursSection);

    const imageUrls = urls
        .filter((u) => /\.(jpe?g|png|webp)(\?|$)/i.test(u))
        .map((u) => u.replace(/&amp;/g, "&"));

    const buckets = new Map();

    for (const u of imageUrls) {
        const m =
            u.match(/\/\d+_(\d+)_\d+x\d+_/i) || // /46_130_800x800_0.jpg
            u.match(/\/\d+_(\d+)_/i) ||
            u.match(/[_-](\d{2,4})[_-]/i) ||
            u.match(/[_-](\d{2,4})\.(jpe?g|png|webp)/i);

        const code = m?.[1];
        if (!code) continue;

        if (!buckets.has(code)) buckets.set(code, new Set());
        buckets.get(code).add(u);
    }

    const out = new Map();
    for (const [code, set] of buckets.entries()) {
        const arr = Array.from(set.values()).sort((a, b) => scoreVariantCandidateUrl(b) - scoreVariantCandidateUrl(a));
        out.set(code, arr);
    }

    return out;
}

async function getImageDims(buffer) {
    if (!sharp) return null;
    try {
        const meta = await sharp(buffer).metadata();
        if (!meta?.width || !meta?.height) return null;
        return { width: meta.width, height: meta.height };
    } catch {
        return null;
    }
}

function aspectRatioScore(dims) {
    const r = dims.height / dims.width;
    return Math.abs(1 - r);
}

async function pickBestVariantUrl(code, candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) return null;

    // If sharp not available, just pick first non-roomshot
    if (!sharp) {
        const nonRoom = candidates.find((u) => !looksLikeRoomshotUrl(u));
        return nonRoom || candidates[0];
    }

    // Probe up to PROBE_N candidates and drop anything <= 5KB
    const probeUrls = candidates.slice(0, Math.max(PROBE_N, 1));
    const probed = [];

    for (const u of probeUrls) {
        try {
            const res = await fetchWithTimeout(u);
            if (!res.ok) continue;
            const buf = Buffer.from(await res.arrayBuffer());

            // Skip tiny assets (low-res swatches/icons)
            if (buf.length <= MIN_BYTES_FOR_TILE) {
                continue;
            }

            const dims = await getImageDims(buf);
            if (!dims) continue;

            const maxDim = Math.max(dims.width, dims.height);
            probed.push({ u, dims, maxDim });
        } catch {
            // ignore
        }
    }

    // If nothing survived the 5KB filter, fall back to first non-roomshot candidate
    if (probed.length === 0) {
        const nonRoom = candidates.find((u) => !looksLikeRoomshotUrl(u));
        return nonRoom || candidates[0];
    }

    const ranked = probed
        .map((x) => ({
            ...x,
            squareScore: aspectRatioScore(x.dims),
            roomPenalty: looksLikeRoomshotUrl(x.u) ? 1 : 0,
            tooBigPenalty: x.maxDim > MAX_SQUARE_DIM ? 1 : 0,
        }))
        .sort((a, b) => {
            if (a.squareScore !== b.squareScore) return a.squareScore - b.squareScore;
            if (a.roomPenalty !== b.roomPenalty) return a.roomPenalty - b.roomPenalty;
            if (a.tooBigPenalty !== b.tooBigPenalty) return a.tooBigPenalty - b.tooBigPenalty;
            return a.maxDim - b.maxDim;
        });

    return ranked[0]?.u || candidates[0];
}

function pickOgImage(html) {
    const og =
        html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (og?.[1]) return og[1].replace(/&amp;/g, "&");

    const tw =
        html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (tw?.[1]) return tw[1].replace(/&amp;/g, "&");

    return null;
}

function buildRoomshotUrlList(html, slug, desiredCount = 6) {
    const roomSection =
        sliceBetween(html, "## Roomshots", "##") ||
        sliceBetween(html, "##Roomshots", "##") ||
        html;

    const urls = uniqueUrlsFromHtml(roomSection)
        .filter((u) => /\.(jpe?g|png|webp)(\?|$)/i.test(u))
        .map((u) => u.replace(/&amp;/g, "&"));

    const s = String(slug || "").toLowerCase();

    function score(u) {
        const lu = u.toLowerCase();
        let sc = 0;

        if (lu.includes("wasabisys.com/modulyss")) sc += 50;
        if (/room|roomshot|lifestyle|interior|scene|application|install/i.test(lu)) sc += 25;
        if (s && lu.includes(s)) sc += 15;
        if (lu.includes("_50x50_") || /50x50/i.test(lu)) sc -= 15;
        if (/swatch/i.test(lu)) sc -= 20;
        if (lu.endsWith(".jpg") || lu.includes(".jpg?")) sc += 2;

        return sc;
    }

    const candidates = urls.filter((u) => {
        const lu = u.toLowerCase();
        if (/\/\d+_\d+_50x50_/i.test(u)) return false;
        if (/swatch/i.test(lu)) return false;
        if (/50x50/.test(lu)) return false;
        return true;
    });

    const ranked = candidates
        .map((u) => ({ u, sc: score(u) }))
        .sort((a, b) => b.sc - a.sc)
        .map((x) => x.u);

    const out = [];
    const seen = new Set();
    for (const u of ranked) {
        if (seen.has(u)) continue;
        seen.add(u);
        out.push(u);
        if (out.length >= Math.max(0, desiredCount)) break;
    }

    if (out.length === 0) {
        const og = pickOgImage(html);
        if (og) out.push(og);
    }

    return out;
}

let warnedNoSharp = false;

async function compressToWebp(buf, { maxWidth }) {
    let width = Math.max(MIN_WIDTH, Number(maxWidth || VARIANT_MAX_WIDTH));
    let quality = Math.min(95, Math.max(1, START_QUALITY));

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const webpBuf = await sharp(buf)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .webp({
                quality,
                effort: 6,
                smartSubsample: true,
            })
            .toBuffer();

        if (webpBuf.length <= TARGET_BYTES) return webpBuf;

        if (quality > MIN_QUALITY) {
            quality = Math.max(MIN_QUALITY, quality - 10);
            continue;
        }

        if (width > MIN_WIDTH) {
            width = Math.max(MIN_WIDTH, Math.floor(width * 0.8));
            quality = Math.min(95, Math.max(MIN_QUALITY, START_QUALITY));
            continue;
        }

        return webpBuf;
    }

    return sharp(buf).rotate().webp({ quality: MIN_QUALITY, effort: 6 }).toBuffer();
}

async function downloadAndSaveImage(url, outPath, { kind = "variant" } = {}) {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`Failed image ${url} (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());

    await ensureDir(outPath);

    if (!sharp) {
        if (!warnedNoSharp) {
            warnedNoSharp = true;
            console.error("⚠️  sharp is NOT installed. Images will be saved uncompressed (may be large). Run: npm i sharp");
        }
        await fs.writeFile(outPath, buf);
        return;
    }

    const maxWidth = kind === "roomshot" ? ROOMSHOT_MAX_WIDTH : VARIANT_MAX_WIDTH;
    const webpBuf = await compressToWebp(buf, { maxWidth });
    await fs.writeFile(outPath, webpBuf);
}

async function pool(items, worker, concurrency) {
    const results = [];
    let i = 0;

    async function run() {
        while (i < items.length) {
            const idx = i++;
            try {
                results[idx] = await worker(items[idx]);
            } catch (e) {
                results[idx] = { error: String(e?.message || e), item: items[idx] };
            }
            await sleep(80);
        }
    }

    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, run));
    return results;
}

async function loadInput(filePath) {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (abs.endsWith(".json")) {
        return JSON.parse(await fs.readFile(abs, "utf8"));
    }

    const mod = await import(pathToFileURL(abs).href);
    return mod.default || mod.catalog || mod.products || mod.data || mod;
}

function collectionUrl(slug) {
    return `https://modulyss.com/${LOCALE}/${CATEGORY}/collections/${slug}`;
}

async function processOneProduct({ slug, variants, roomshots }) {
    if (!slug) throw new Error("Product missing slug");
    if (!Array.isArray(variants) || variants.length === 0) throw new Error(`No variants for ${slug}`);

    const url = collectionUrl(slug);
    const pageRes = await fetchWithTimeout(url);
    if (!pageRes.ok) throw new Error(`Failed collection page ${url} (${pageRes.status})`);
    const html = await pageRes.text();

    const downloadHrefMap = buildVariantDownloadHrefMap(html);
    const candidateMap = buildVariantCandidateMap(html);

    const desiredRoomCount = Array.isArray(roomshots) ? roomshots.length : 0;
    const roomshotUrls = desiredRoomCount ? buildRoomshotUrlList(html, slug, desiredRoomCount) : [];

    if (desiredRoomCount && roomshotUrls.length < desiredRoomCount) {
        console.error(
            `  ⚠️ Roomshots: expected ${desiredRoomCount}, found ${roomshotUrls.length} candidates on page for ${slug}.`
        );
    }

    async function variantWorker(variant) {
        const vk = extractVariantKey(variant);
        if (!vk) throw new Error(`No code found for variant: ${JSON.stringify(variant)}`);
        const { code, isGradient, key } = vk;

        // 1) Prefer exact match from Colours (base vs gradient)
        let dl = (downloadHrefMap.get(key) || [])[0];

        // 2) Fallback: if no gradient-specific link, try plain code bucket (for older collections)
        if (!dl && downloadHrefMap.has(code)) {
            dl = (downloadHrefMap.get(code) || [])[0];
        }

        // 3) Fallback to candidate map (with 5KB filter inside pickBestVariantUrl)
        let imgUrl = dl;
        if (!imgUrl) {
            const candidates = candidateMap.get(code) || [];
            imgUrl = await pickBestVariantUrl(code, candidates);
        }

        if (!imgUrl) {
            throw new Error(
                `No image URL found on ${slug} page for code ${code} (${isGradient ? "gradient" : "base"})`
            );
        }

        const outPath = localPathFromPublicPath(variant.image);
        if (!FORCE) {
            try {
                await fs.access(outPath);
                return { slug, type: "variant", code, skipped: true };
            } catch { }
        }

        await downloadAndSaveImage(imgUrl, outPath, { kind: "variant" });
        return { slug, type: "variant", code, skipped: false };
    }



    async function roomshotWorker(roomshotPath, index) {
        const outPath = localPathFromPublicPath(roomshotPath);

        if (!FORCE) {
            try {
                await fs.access(outPath);
                return { slug, type: "roomshot", index: index + 1, skipped: true };
            } catch { }
        }

        const url = roomshotUrls[index];
        if (!url) throw new Error(`No roomshot URL available for ${slug} room-${index + 1}`);

        await downloadAndSaveImage(url, outPath, { kind: "roomshot" });
        return { slug, type: "roomshot", index: index + 1, skipped: false };
    }

    const variantResults = await pool(variants, variantWorker, CONCURRENCY);

    let roomshotResults = [];
    if (Array.isArray(roomshots) && roomshots.length) {
        const roomConcurrency = Math.max(1, Math.min(3, CONCURRENCY));
        const indexed = roomshots.map((p, i) => ({ p, i }));
        roomshotResults = await pool(
            indexed,
            async ({ p, i }) => roomshotWorker(p, i),
            roomConcurrency
        );
    }

    return [...variantResults, ...roomshotResults];
}

async function main() {
    const input = await loadInput(INPUT);

    if (Array.isArray(input) && input.length && input[0]?.variants) {
        const products = input;
        console.error(`▶ Products: ${products.length}`);
        console.error(`▶ Concurrency: ${CONCURRENCY}`);
        console.error(`▶ sharp: ${sharp ? "enabled" : "NOT installed"}`);

        let totalOk = 0,
            totalErr = 0;

        for (const p of products) {
            console.error(`\n— ${p.slug} —`);
            try {
                const r = await processOneProduct(p);
                const ok = r.filter((x) => x && !x.error);
                const err = r.filter((x) => x && x.error);
                totalOk += ok.length;
                totalErr += err.length;
                if (err.length) {
                    console.error(`  ⚠️ Errors (${err.length}) sample: ${err[0].error}`);
                } else {
                    console.error(`  ✅ Done (${ok.length})`);
                }
            } catch (e) {
                totalErr += 1;
                console.error(`  ❌ ${e?.message || e}`);
            }
            await sleep(150);
        }

        console.error(`\n✅ Finished. Success: ${totalOk}, Errors: ${totalErr}`);
        return;
    }

    if (Array.isArray(input) && input.length && input[0]?.image && !input[0]?.variants) {
        if (!SINGLE_SLUG) {
            console.error("❌ Variants array provided, but no slug given. Example: node ... variants.json willow");
            process.exit(1);
        }
        const results = await processOneProduct({ slug: SINGLE_SLUG, variants: input });
        const ok = results.filter((x) => x && !x.error);
        const err = results.filter((x) => x && x.error);

        console.error(`✅ Done. Success: ${ok.length}, Errors: ${err.length}`);
        if (err.length) console.error(`First error: ${err[0].error}`);
        return;
    }

    throw new Error("Input format not recognized. Pass products[] or variants[] + slug.");
}

main().catch((e) => {
    console.error("❌", e?.message || e);
    process.exit(1);
});
