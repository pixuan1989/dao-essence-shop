/**
 * ingest-amazon-urls.mjs
 * -----------------------
 * Route C (no PA-API): fill data/amazon-products.json with REAL Amazon data
 * (title, image, price, rating, reviews, ASIN) by scraping the product pages
 * the user provides.
 *
 * Input: scripts/product-sources.txt  (gitignored — public URLs are fine, but
 *        we don't commit it by default). One line per product:
 *            <productId>|<amazon-url-or-asin>
 *        e.g.  ic-ing-book|https://www.amazon.com/dp/B00XIN20EE
 *        The productId must match an `id` already in amazon-products.json so we
 *        keep the curated personalization fields (elements/categories/zodiac/...).
 *
 * Uses Playwright (already installed) to load each page and extract data.
 * Run:  node scripts/ingest-amazon-urls.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'amazon-products.json');
const SRC_FILE = path.join(__dirname, 'product-sources.txt');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

function asinFrom(s) {
  const m = s.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/i);
  return m ? (m[1] || m[2]).toUpperCase() : null;
}
// Upgrade Amazon image to a large, card-friendly size.
function bigImage(url) {
  if (!url) return url;
  return url.replace(/(\/images\/I\/[^.]+(?:\._[^.]+)?)\._AC_[^.]+_\.jpg/i, '$1._AC_SL1500_.jpg')
            .replace(/(\.jpg)\?.*$/, '$1');
}

async function scrape(page, urlOrAsin) {
  const url = /^https?:\/\//.test(urlOrAsin)
    ? urlOrAsin
    : `https://www.amazon.com/dp/${urlOrAsin}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const meta = (p) => { const m = document.querySelector(`meta[property="${p}"]`); return m ? m.getAttribute('content') : ''; };
    const txt = (sel) => { const e = document.querySelector(sel); return e ? e.textContent.trim() : ''; };
    let img = '';
    for (const sel of ['#landingImage', '#imgTagWrapperId img', '.a-dynamic-image', '#ivLargeImage img', '#main-image']) {
      const el = document.querySelector(sel);
      if (el && el.getAttribute('src')) { img = el.getAttribute('src'); break; }
    }
    if (!img) img = meta('og:image');
    const title = txt('#productTitle') || meta('og:title');
    const ratingEl = document.querySelector('#acrPopover') || document.querySelector('[data-hook="rating"]');
    const rating = ratingEl ? (ratingEl.getAttribute('title') || ratingEl.textContent).trim() : '';
    const reviews = txt('#acrCustomerReviewText');
    let price = txt('.a-price .a-offscreen') || txt('#priceblock_ourprice') || txt('#price_inside_buybox');
    return { title, img, rating, reviews, price };
  });
}

async function main() {
  if (!fs.existsSync(SRC_FILE)) {
    console.error(`❌ Missing ${SRC_FILE}. Create it with lines: <productId>|<amazon-url>`);
    process.exit(1);
  }
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const byId = new Map(products.map(p => [p.id, p]));
  const lines = fs.readFileSync(SRC_FILE, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);

  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });

  let ok = 0, fail = 0;
  for (const line of lines) {
    const [id, src] = line.split('|').map(s => s.trim());
    const p = byId.get(id);
    if (!p) { console.error(`  ⚠️  unknown product id: ${id} (skipped)`); fail++; continue; }
    try {
      const d = await scrape(page, src);
      const asin = asinFrom(src) || asinFrom(d.img || '');
      if (d.title) p.name = d.title;
      if (d.img) p.image = bigImage(d.img);
      if (asin) p.asin = asin;
      if (d.price) p.price = d.price;
      if (d.rating) p.rating = d.rating;
      if (d.reviews) p.reviews = d.reviews.replace(/[(),]/g, '').trim();
      console.log(`  ✅ ${id}: ${p.name.slice(0, 44)}  [img=${p.image ? 'Y' : 'n'} asin=${p.asin || '-'}]`);
      ok++;
    } catch (e) {
      console.error(`  ⚠️  ${id} failed: ${e.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 1200));
  }
  await browser.close();

  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ ${ok} updated, ${fail} failed. Backup -> amazon-products.json.bak`);
  console.log('   Next: node build-blog.js  →  git commit (no push).');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
