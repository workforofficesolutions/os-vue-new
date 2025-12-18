// scripts/download-amtico-variant-images.mjs
//
// Usage:
//   node scripts/download-amtico-variant-images.mjs amtico-first-variants.json
//   FORCE=true node scripts/download-amtico-variant-images.mjs amtico-first-variants.json
//
// What it does:
// - For each variant, fetches https://www.amtico.com/commercial/products/<codeLower>/
// - Downloads TWO images:
//   1) Primary (tile/flat) -> saved WITHOUT h- prefix
//   2) Hover (portrait/vertical for this specific code) -> saved WITH h- prefix
//
// Install sharp:
//   npm i sharp

import fs from "node:fs/promises";
import path from "node:path";

const VARIANTS_JSON = process.argv[2];
if (!VARIANTS_JSON) {
  console.error("❌ Please pass a variants JSON file, e.g. amtico-first-variants.json");
  process.exit(1);
}

const FORCE = String(process.env.FORCE || "").toLowerCase() === "true";
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);

let sharp = null;
try {
  const mod = await import("sharp");
  sharp = mod.default || mod;
} catch {
  // sharp is optional
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function codeFromVariant(v) {
  if (v.code) return String(v.code).trim().toUpperCase();

  const base = path.basename(v.image || "");
  const m = base.match(/-([a-z0-9]+)\.(webp|png|jpe?g)$/i);
  return m ? m[1].toUpperCase() : null;
}

function localPathFromVariantImage(imagePath) {
  return path.join(process.cwd(), "public", String(imagePath).replace(/^\//, ""));
}

function hoverImagePathFromVariantImage(imagePath) {
  const p = String(imagePath || "");
  const dir = path.posix.dirname(p);
  const base = path.posix.basename(p);
  return `${dir}/h-${base}`;
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

function pickOgImage(html) {
  const og =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og?.[1]) return og[1];

  const tw =
    html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  if (tw?.[1]) return tw[1];

  return null;
}

function uniqueUrlsFromHtml(html) {
  const urls = html.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  const set = new Set();
  for (const u of urls) set.add(u.replace(/&amp;/g, "&"));
  return Array.from(set);
}

function pickTileOrFlatImage(html, code) {
  const lower = String(code || "").toLowerCase();
  const urls = uniqueUrlsFromHtml(html);

  const swatch = urls.find((u) =>
    /\.(png|jpe?g|webp)(\?|$)/i.test(u) &&
    (u.toLowerCase().includes(`${lower}-swatch`) || (u.toLowerCase().includes(lower) && /swatch/i.test(u)))
  );
  if (swatch) return swatch;

  const tile = urls.find((u) =>
    /\.(png|jpe?g|webp)(\?|$)/i.test(u) &&
    u.toLowerCase().includes(lower) &&
    /tile/i.test(u) &&
    !/swatch/i.test(u)
  );
  if (tile) return tile;

  const anyFlat = urls.find((u) =>
    /\.(png|jpe?g|webp)(\?|$)/i.test(u) &&
    u.toLowerCase().includes(lower) &&
    !/swatch/i.test(u) &&
    !/hover|rollover|lifestyle|roomset|roomshot|scene/i.test(u)
  );
  if (anyFlat) return anyFlat;

  return null;
}

function findAllImagesForCode(html, code) {
  const lower = String(code || "").toLowerCase();
  const urls = uniqueUrlsFromHtml(html);

  // Return ALL images that contain this product code (excluding swatches)
  return urls.filter((u) =>
    /\.(png|jpe?g|webp)(\?|$)/i.test(u) &&
    u.toLowerCase().includes(lower) &&
    !/swatch/i.test(u)
  );
}

async function getImageDimensions(buffer) {
  if (!sharp) return null;
  
  try {
    const metadata = await sharp(buffer).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch {
    return null;
  }
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function downloadOne(variant) {
  const code = codeFromVariant(variant);
  if (!code) throw new Error(`No code found for variant: ${JSON.stringify(variant)}`);

  const productUrl = `https://www.amtico.com/commercial/products/${code.toLowerCase()}/`;
  const primaryPath = localPathFromVariantImage(variant.image);
  const hoverVariantImage = hoverImagePathFromVariantImage(variant.image);
  const hoverPath = localPathFromVariantImage(hoverVariantImage);

  if (!FORCE) {
    try {
      await fs.access(primaryPath);
      await fs.access(hoverPath);
      return { code, skipped: true };
    } catch {}
  }

  const pageRes = await fetchWithTimeout(productUrl);
  if (!pageRes.ok) throw new Error(`Failed product page ${productUrl} (${pageRes.status})`);
  const html = await pageRes.text();

  const tileOrFlatUrl = pickTileOrFlatImage(html, code);
  const ogUrl = pickOgImage(html);
  
  // Primary: use tile/flat or fallback to og
  const primaryUrl = tileOrFlatUrl || ogUrl;
  if (!primaryUrl) throw new Error(`No primary image found on ${productUrl}`);

  // Find ALL images for this specific product code
  const allCodeImages = findAllImagesForCode(html, code);
  
  let hoverUrl = ogUrl || primaryUrl;

  // If we have sharp and multiple images for this code, check dimensions
  if (sharp && allCodeImages.length > 1) {
    try {
      console.error(`  🔍 Checking ${allCodeImages.length} images for ${code}...`);
      
      const imageData = await Promise.all(
        allCodeImages.map(async (url) => {
          try {
            const res = await fetchWithTimeout(url);
            if (!res.ok) return null;
            const buf = Buffer.from(await res.arrayBuffer());
            const dims = await getImageDimensions(buf);
            return { url, buffer: buf, dims };
          } catch {
            return null;
          }
        })
      );

      const validImages = imageData.filter(Boolean);
      
      // Find the most portrait image (highest height/width ratio)
      let bestPortrait = null;
      let bestRatio = 0;

      for (const img of validImages) {
        if (img.dims && img.dims.height > img.dims.width) {
          const ratio = img.dims.height / img.dims.width;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPortrait = img;
          }
        }
      }

      if (bestPortrait) {
        hoverUrl = bestPortrait.url;
        console.error(`  ✓ Selected portrait image: ${bestPortrait.dims.width}x${bestPortrait.dims.height} (ratio: ${bestRatio.toFixed(2)})`);
      } else {
        console.error(`  ⚠️  No portrait images found, using fallback`);
      }
    } catch (e) {
      console.error(`  ⚠️  Could not compare dimensions for ${code}: ${e.message}`);
    }
  }

  const primaryRes = await fetchWithTimeout(primaryUrl);
  if (!primaryRes.ok) throw new Error(`Failed image ${primaryUrl} (${primaryRes.status})`);
  const primaryBuf = Buffer.from(await primaryRes.arrayBuffer());

  const hoverRes = await fetchWithTimeout(hoverUrl);
  if (!hoverRes.ok) throw new Error(`Failed image ${hoverUrl} (${hoverRes.status})`);
  const hoverBuf = Buffer.from(await hoverRes.arrayBuffer());

  await ensureDir(primaryPath);
  await ensureDir(hoverPath);

  if (sharp) {
    await sharp(primaryBuf).webp({ quality: 82 }).toFile(primaryPath);
    await sharp(hoverBuf).webp({ quality: 82 }).toFile(hoverPath);
  } else {
    await fs.writeFile(primaryPath, primaryBuf);
    await fs.writeFile(hoverPath, hoverBuf);
  }

  return { code, skipped: false };
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

async function main() {
  const jsonPath = path.isAbsolute(VARIANTS_JSON)
    ? VARIANTS_JSON
    : path.join(process.cwd(), VARIANTS_JSON);

  const variants = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error("Variants JSON is empty or not an array.");
  }

  console.error(`▶ Variants: ${variants.length}`);
  console.error(`▶ Concurrency: ${CONCURRENCY}`);
  console.error(`▶ sharp: ${sharp ? "enabled (required for dimension checking)" : "NOT installed"}`);

  const results = await pool(variants, downloadOne, CONCURRENCY);
  const ok = results.filter((r) => r && !r.error);
  const errs = results.filter((r) => r && r.error);

  console.error(`✅ Done. Success: ${ok.length}, Errors: ${errs.length}`);
  if (errs.length) {
    console.error("---- Errors (first 10) ----");
    for (const e of errs.slice(0, 10)) console.error(e.error);
  }
}

main().catch((e) => {
  console.error("❌", e?.message || e);
  process.exit(1);
});
