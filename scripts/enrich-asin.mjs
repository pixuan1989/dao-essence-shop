/**
 * enrich-asin.mjs
 * ---------------
 * Second pass: for every product that now has a real ASIN (filled by
 * auto-pick-amazon.mjs), scrape its Amazon product page to reliably fill
 * image / price / rating / reviews. Keeps the curated `name` / `nameZh` and
 * all personalization fields. Uses the validated dp-page extraction.
 *
 * Run:  node scripts/enrich-asin.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'amazon-products.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

function bigImage(url) {
  if (!url) return url;
  return url.replace(/(\/images\/I\/[^.]+(?:\._[^.]+)?)\._AC_[^.]+_\.jpg/i, '$1._AC_SL1500_.jpg')
            .replace(/(\.jpg)\?.*$/, '$1');
}

async function scrape(page, asin) {
  await page.goto(`https://www.amazon.com/dp/${asin}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
    const reviews = txt('#acrCustomerReviewText').replace(/[(),]/g, '').trim();
    const price = txt('.a-price .a-offscreen') || txt('#priceblock_ourprice') || txt('#price_inside_buybox');
    return { title, img, rating, reviews, price };
  });
}

async function main() {
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const targets = products.filter(p => p.asin);
  console.log(`🔧 Enriching ${targets.length} products with real ASINs...`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });

  let ok = 0, fail = 0;
  for (const p of targets) {
    try {
      const d = await scrape(page, p.asin);
      if (d.img) p.image = bigImage(d.img);
      if (d.price) p.price = d.price;
      if (d.rating) p.rating = d.rating;
      if (d.reviews) p.reviews = d.reviews;
      console.log(`  ✅ ${p.id}: img=${p.image ? 'Y' : 'n'} ${p.price || ''} ${p.rating || ''} (${p.reviews || '-'} reviews)`);
      ok++;
    } catch (e) {
      console.error(`  ⚠️  ${p.id} failed: ${e.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  await browser.close();

  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ ${ok} enriched, ${fail} failed.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
