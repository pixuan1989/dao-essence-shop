/**
 * pick-best.mjs
 * -------------
 * 把指定商品升级为"同品类里评论数最高、且评分>=minRating"的真实爆款。
 * 思路：popularity-rank 搜索 -> 取前 N 个候选 ASIN -> 逐个抓 dp 页拿
 * (reviews 数值, rating 数值, price, image, title) -> 选 rating>=minRating
 * 中 reviews 最大者；若都不达标则退而取 reviews 最大者。
 * 保留原 entry 的个性化字段（nameZh/elements/categories/zodiac/tags/icon）。
 *
 * Run:  node scripts/pick-best.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'amazon-products.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// 需要升级的商品：保留个性化字段，仅换 keyword 与更严格的筛选。
const TARGETS = [
  { id: 'angel-oracle-deck',   keywords: 'oracle cards deck popular best seller', minRating: 4.6 },
  { id: 'rose-quartz-crystal', keywords: 'natural rose quartz crystal healing',   minRating: 4.6 },
  { id: 'moon-phase-wall-art', keywords: '3d moon lamp rechargeable celestial',   minRating: 4.5, renameTo: 'moon-lamp' },
  { id: 'manifestation-journal', keywords: 'manifestation gratitude journal law attraction', minRating: 4.6 },
];

function bigImage(url) {
  if (!url) return url;
  return url.replace(/(\/images\/I\/[^.]+(?:\._[^.]+)?)\._AC_[^.]+_\.jpg/i, '$1._AC_SL1500_.jpg')
            .replace(/(\.jpg)\?.*$/, '$1');
}
function numReviews(s) { const m = String(s || '').replace(/,/g, '').match(/(\d+)/); return m ? +m[1] : 0; }
function numRating(s) { const m = String(s || '').match(/([\d.]+)/); return m ? +m[1] : 0; }

async function searchCandidates(page, kw, n = 5) {
  await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(kw)}&s=popularity-rank`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const asins = await page.evaluate((n) => {
    const out = [];
    for (const el of document.querySelectorAll('div[data-asin]')) {
      const asin = el.getAttribute('data-asin');
      if (!asin || asin.length < 8) continue;
      const t = el.querySelector('h2 a span, h2 span');
      if (t && t.textContent.trim()) out.push(asin);
      if (out.length >= n) break;
    }
    return out;
  }, n);
  return asins;
}

async function scrapeDp(page, asin) {
  await page.goto(`https://www.amazon.com/dp/${asin}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2200);
  return page.evaluate(() => {
    const meta = (p) => { const m = document.querySelector(`meta[property="${p}"]`); return m ? m.getAttribute('content') : ''; };
    const txt = (sel) => { const e = document.querySelector(sel); return e ? e.textContent.trim() : ''; };
    let img = '';
    for (const sel of ['#landingImage', '#imgTagWrapperId img', '.a-dynamic-image', '#ivLargeImage img', '#main-image']) {
      const el = document.querySelector(sel);
      if (el && el.getAttribute('src')) { img = el.getAttribute('src'); break; }
    }
    if (!img) img = meta('og:image');
    const ratingEl = document.querySelector('#acrPopover') || document.querySelector('[data-hook="rating"]');
    const rating = ratingEl ? (ratingEl.getAttribute('title') || ratingEl.textContent).trim() : '';
    const reviews = txt('#acrCustomerReviewText').replace(/[(),]/g, '').trim();
    const price = txt('.a-price .a-offscreen') || txt('#priceblock_ourprice') || txt('#price_inside_buybox');
    const title = txt('#productTitle') || meta('og:title');
    return { title, img, rating, reviews, price };
  });
}

async function main() {
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const byId = new Map(products.map(p => [p.id, p]));
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });

  for (const t of TARGETS) {
    const old = byId.get(t.id);
    if (!old) { console.log(`⏭️  ${t.id} not found`); continue; }
    console.log(`\n🔍 ${t.id} (kw: ${t.keywords})`);
    const cands = await searchCandidates(page, t.keywords, 5);
    console.log(`   candidates: ${cands.join(', ') || '(none)'}`);
    if (!cands.length) { console.error(`   ⚠️  no candidates, skipped`); continue; }

    const scored = [];
    for (const asin of cands) {
      const d = await scrapeDp(page, asin);
      const rv = numReviews(d.reviews), rt = numRating(d.rating);
      scored.push({ asin, rv, rt, d });
      console.log(`     ${asin}: ${rt}★ ${rv} reviews | ${d.price || '?'} | ${d.title ? d.title.slice(0, 50) : ''}`);
      await new Promise(r => setTimeout(r, 1200));
    }
    const qualified = scored.filter(s => s.rt >= t.minRating);
    const pool = qualified.length ? qualified : scored;
    pool.sort((a, b) => b.rv - a.rv);
    const best = pool[0];

    const newId = t.renameTo || t.id;
    const entry = {
      ...old,
      id: newId,
      name: best.d.title && best.d.title.length < 80 ? best.d.title : old.name,
      price: best.d.price || old.price,
      image: bigImage(best.d.img) || old.image,
      rating: best.d.rating || old.rating,
      reviews: best.d.reviews || old.reviews,
      asin: best.asin,
      keywords: t.keywords,
    };

    // 处理 id 改名
    const idx = products.findIndex(p => p.id === t.id);
    if (newId !== t.id) {
      products.splice(idx, 1);
      if (byId.has(newId)) { /* 理论上不会冲突 */ }
    } else {
      products.splice(idx, 1);
    }
    products.push(entry);
    byId.delete(t.id);
    byId.set(newId, entry);

    console.log(`   ✅ -> ${newId} | ${entry.name} | ${entry.price} | ${entry.rating} (${entry.reviews} reviews) | img=${entry.image ? 'Y' : 'n'}`);
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ Done. Total products: ${products.length}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
