/**
 * add-chinese-bestsellers.mjs
 * ---------------------------
 * 中式传统玄学：新增真实爆款（经典书籍 + 器物），并升级现有偏弱/坏掉的
 * 中式商品为同品类真实高热高口碑 ASIN。
 * 选择逻辑：popularity-rank 搜索 -> 取前 N 候选 -> 逐个抓 dp 拿
 * (reviews 数值, rating 数值, price, image, title) -> 选 rating>=minRating
 * 中 reviews 最大者；都不达标则退而取 reviews 最大者。
 *
 * Run:  node scripts/add-chinese-bestsellers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'amazon-products.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// mode: 'add' 新商品（需 categories/elements/tags/nameZh/icon）；'upgrade' 升级现有（保留个性化字段）
const ITEMS = [
  { mode: 'add', id: 'art-of-war-book', keywords: 'art of war sun tzu', minRating: 4.6,
    nameZh: '孙子兵法', categories: ['chinese-wisdom', 'strategy'], elements: ['metal', 'wood'], zodiac: [],
    tags: ['sun-tzu', 'strategy', 'book', 'wisdom'], icon: 'book' },
  { mode: 'add', id: 'tao-of-pooh-book', keywords: 'tao of pooh benjamin hoff', minRating: 4.6,
    nameZh: '道之小熊（道德经趣读）', categories: ['tao', 'chinese-wisdom', 'self-help'], elements: ['wood', 'water'], zodiac: [],
    tags: ['tao', 'pooh', 'book'], icon: 'book' },
  { mode: 'add', id: 'laughing-buddha-statue', keywords: 'laughing buddha statue decor', minRating: 4.5,
    nameZh: '笑佛（弥勒）摆件', categories: ['feng-shui', 'decor', 'buddhism'], elements: ['earth', 'metal'], zodiac: [],
    tags: ['buddha', 'laughing-buddha', 'decor', 'feng-shui'], icon: 'zen' },
  { mode: 'add', id: 'lucky-bamboo', keywords: 'lucky bamboo plant feng shui', minRating: 4.4,
    nameZh: '开运竹（富贵竹）', categories: ['feng-shui', 'decor', 'plants'], elements: ['wood', 'water'], zodiac: [],
    tags: ['lucky-bamboo', 'plant', 'feng-shui'], icon: 'tree' },
  { mode: 'add', id: 'between-heaven-earth-book', keywords: 'between heaven and earth chinese medicine five elements', minRating: 4.5,
    nameZh: '《天地之间》（五行与中医）', categories: ['five-elements', 'bazi-astrology', 'chinese-medicine'], elements: ['wood', 'fire', 'earth', 'metal', 'water'], zodiac: [],
    tags: ['five-elements', 'tcm', 'book'], icon: 'book' },

  { mode: 'upgrade', id: 'tao-te-ching-book', keywords: 'tao te ching lao tzu', minRating: 4.6 },
  { mode: 'upgrade', id: 'feng-shui-book', keywords: 'feng shui for dummies', minRating: 4.5 },
  { mode: 'upgrade', id: 'jade-bangle', keywords: 'jade bangle bracelet real jade women', minRating: 4.4 },
  { mode: 'upgrade', id: 'zodiac-necklace', keywords: 'chinese zodiac necklace pendant', minRating: 4.5 },
  { mode: 'upgrade', id: 'pixiu-wealth-bracelet', keywords: 'pixiu bracelet wealth red string', minRating: 4.5 },
];

function bigImage(url) {
  if (!url) return url;
  return url.replace(/(\/images\/I\/[^.]+(?:\._[^.]+)?)\._AC_[^.]+_\.jpg/i, '$1._AC_SL1500_.jpg').replace(/(\.jpg)\?.*$/, '$1');
}
function numReviews(s) { const m = String(s || '').replace(/,/g, '').match(/(\d+)/); return m ? +m[1] : 0; }
function numRating(s) { const m = String(s || '').match(/([\d.]+)/); return m ? +m[1] : 0; }
function cleanTitle(t) {
  if (!t) return '';
  t = t.replace(/\s+/g, ' ').trim();
  return t.length > 78 ? t.slice(0, 75).trim() + '…' : t;
}

async function searchCandidates(page, kw, n = 4) {
  await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(kw)}&s=popularity-rank`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate((n) => {
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

async function pickBest(page, kw, minRating, n = 4) {
  const cands = await searchCandidates(page, kw, n);
  if (!cands.length) return null;
  const scored = [];
  for (const asin of cands) {
    const d = await scrapeDp(page, asin);
    scored.push({ asin, d, rv: numReviews(d.reviews), rt: numRating(d.rating) });
    await new Promise(r => setTimeout(r, 1300));
  }
  const q = scored.filter(s => s.rt >= minRating);
  const pool = q.length ? q : scored;
  pool.sort((a, b) => b.rv - a.rv);
  return pool[0];
}

async function main() {
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const byId = new Map(products.map(p => [p.id, p]));
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });

  for (const it of ITEMS) {
    console.log(`\n🔍 ${it.mode} ${it.id} (kw: ${it.keywords}, minRating ${it.minRating})`);
    const best = await pickBest(page, it.keywords, it.minRating, 4);
    if (!best) { console.error('   ⚠️  no candidates, skipped'); continue; }
    const d = best.d;
    console.log(`   -> ${best.asin} | ${d.rating} (${d.reviews} reviews) | ${d.price || '?'} | ${cleanTitle(d.title)}`);

    if (it.mode === 'add') {
      if (byId.has(it.id)) { console.log('   ⏭️  id exists, skip'); continue; }
      products.push({
        id: it.id, name: cleanTitle(d.title) || it.id, nameZh: it.nameZh,
        price: d.price || '', image: bigImage(d.img) || '',
        keywords: it.keywords, rating: d.rating || '', reviews: d.reviews || '',
        categories: it.categories, elements: it.elements, zodiac: it.zodiac,
        tags: it.tags, icon: it.icon, asin: best.asin,
      });
      byId.set(it.id, products[products.length - 1]);
    } else {
      const old = byId.get(it.id);
      if (!old) { console.log('   ⏭️  not found, skip'); continue; }
      old.asin = best.asin;
      old.name = cleanTitle(d.title) || old.name;
      old.price = d.price || old.price;
      old.image = bigImage(d.img) || old.image;
      old.rating = d.rating || old.rating;
      old.reviews = d.reviews || old.reviews;
      old.keywords = it.keywords;
    }
    await new Promise(r => setTimeout(r, 800));
  }

  await browser.close();
  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ Done. Total products: ${products.length}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
