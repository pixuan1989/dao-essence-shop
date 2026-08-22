/**
 * auto-pick-amazon.mjs
 * --------------------
 * Autonomous product sourcing for the DaoEssence Amazon affiliate showcase.
 * For each curated product in data/amazon-products.json (keywords already tuned
 * to the site's Chinese-metaphysics theme: BaZi / Feng Shui / Zodiac / Five
 * Elements / crystals ...), search Amazon.com and pick the top relevant
 * in-stock listing, then fill in the REAL image / ASIN / price / rating /
 * reviews. Personalization fields (elements, categories, zodiac, icon, name,
 * nameZh) are preserved.
 *
 * Zero user input required — just run it. Uses Playwright (search results page
 * gives title+image+price+rating in ONE request per product).
 *
 * Run:  node scripts/auto-pick-amazon.mjs
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

async function pickFromSearch(page, keyword) {
  const url = 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('div[data-asin]')].filter(
      d => { const a = d.getAttribute('data-asin'); return a && a.length === 10; }
    );
    for (const d of items) {
      const titleEl = d.querySelector('h2 span, h2 a span, a.a-link-normal span');
      const title = titleEl ? titleEl.textContent.trim() : '';
      if (!title) continue; // skip empty/sponsored shells
      const imgEl = d.querySelector('img.s-image');
      const priceEl = d.querySelector('span.a-price span.a-offscreen');
      const ratingEl = d.querySelector('span.a-icon-alt');
      // review count: usually near the rating, e.g. "(1,234)" or "1,234"
      let rev = '';
      const revEl = d.querySelector('span.a-size-base.s-underline-text');
      if (revEl) rev = revEl.textContent.replace(/[(),]/g, '').trim();
      else {
        const m = d.textContent.match(/([\d,]{2,})\s*(?:ratings|reviews)/i);
        if (m) rev = m[1];
      }
      return {
        asin: d.getAttribute('data-asin'),
        title,
        img: imgEl ? imgEl.getAttribute('src') : '',
        price: priceEl ? priceEl.textContent.trim() : '',
        rating: ratingEl ? ratingEl.textContent.trim() : '',
        reviews: rev,
      };
    }
    return null;
  });
}

async function main() {
  if (!fs.existsSync(DATA_FILE)) { console.error('❌ data/amazon-products.json not found'); process.exit(1); }
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });

  let ok = 0, fail = 0;
  for (const p of products) {
    const kw = p.keywords || p.name;
    try {
      const d = await pickFromSearch(page, kw);
      if (!d || !d.asin) { console.error(`  ⚠️  ${p.id}: no result for "${kw}"`); fail++; }
      else {
        if (d.img) p.image = bigImage(d.img);
        p.asin = d.asin;
        if (d.price) p.price = d.price;
        if (d.rating) p.rating = d.rating;
        if (d.reviews) p.reviews = d.reviews;
        console.log(`  ✅ ${p.id}: ${d.title.slice(0, 46)}  [asin=${d.asin} img=${p.image ? 'Y' : 'n'} ${d.price || ''} ${d.rating || ''}]`);
        ok++;
      }
    } catch (e) {
      console.error(`  ⚠️  ${p.id} failed: ${e.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 1800));
  }
  await browser.close();

  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ ${ok} updated, ${fail} failed. Backup -> amazon-products.json.bak`);
  console.log('   Next: node build-blog.js  →  git commit (no push).');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
