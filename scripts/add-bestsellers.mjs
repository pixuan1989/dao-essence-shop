/**
 * add-bestsellers.mjs
 * -------------------
 * 自主挑选贴合 DaoEssence（玄学圈 + 泛玄学圈）调性的真实 Amazon 爆款，
 * 追加进 data/amazon-products.json（不改动已有的 25 个商品）。
 *
 * 策略：
 *  - 对“有研究佐证的具体 ASIN（seedAsin）”直接抓取 dp 页详情；
 *  - 对“关键词”类，按 popularity-rank 搜索，取首个有效 data-asin，再抓 dp 页。
 * 每个商品保留个性化字段（elements / categories / zodiac / tags / icon）。
 *
 * Run:  node scripts/add-bestsellers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'amazon-products.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// 研究佐证的真实爆款（2026 销售数据）。seedAsin 优先使用，确保抓到真正的爆款。
const WISHLIST = [
  {
    id: 'tarot-beginner-deck',
    name: 'Tarot Cards for Beginners',
    nameZh: '初学者塔罗牌',
    keywords: 'tarot cards for beginners with guidebook meanings',
    seedAsin: 'B09WBHNQYK', // Witchy Cauldron Tarot — 8K+ reviews, 4.8
    categories: ['tarot', 'divination', 'oracle'],
    elements: ['fire', 'water'],
    zodiac: [],
    tags: ['tarot', 'divination', 'cards', 'beginner'],
    icon: 'cards',
  },
  {
    id: 'angel-oracle-deck',
    name: 'Mystic Manifesting Oracle Deck',
    nameZh: '神秘显化神谕卡',
    keywords: 'mystic manifesting oracle deck cards',
    seedAsin: 'B0F526BKRY', // Mystic Manifesting Oracle — 400/mo, 4.7
    categories: ['oracle', 'divination', 'manifestation'],
    elements: ['water', 'air'],
    zodiac: [],
    tags: ['oracle', 'divination', 'manifestation', 'cards'],
    icon: 'cards',
  },
  {
    id: 'chakra-crystal-kit',
    name: 'Healing Crystals & Chakra Kit',
    nameZh: '七脉轮疗愈水晶套装',
    keywords: 'chakra healing crystals kit tumbled stones set',
    categories: ['crystals', 'healing', 'chakra'],
    elements: ['wood', 'fire', 'earth', 'metal', 'water'],
    zodiac: [],
    tags: ['crystal', 'chakra', 'healing', 'kit'],
    icon: 'crystal',
  },
  {
    id: 'sage-palo-santo-kit',
    name: 'White Sage & Palo Santo Smudge Kit',
    nameZh: '白鼠尾草与圣木净化套装',
    keywords: 'white sage palo santo smudge kit abalone shell',
    categories: ['cleansing', 'feng-shui', 'ritual'],
    elements: ['air', 'fire'],
    zodiac: [],
    tags: ['smudge', 'sage', 'palosanto', 'cleansing'],
    icon: 'leaf',
  },
  {
    id: 'rose-quartz-crystal',
    name: 'Rose Quartz Crystal',
    nameZh: '粉晶（爱情之石）',
    keywords: 'rose quartz crystal palm stone love',
    categories: ['crystals', 'love', 'healing'],
    elements: ['water', 'earth'],
    zodiac: ['Taurus', 'Libra'],
    tags: ['crystal', 'rose-quartz', 'love'],
    icon: 'crystal',
  },
  {
    id: 'moon-phase-wall-art',
    name: 'Moon Phase Wall Decor',
    nameZh: '月光相位墙面装饰',
    keywords: 'moon phase wall decor hanging gold',
    categories: ['decor', 'astrology', 'zodiac-horoscope'],
    elements: ['water', 'metal'],
    zodiac: [],
    tags: ['moon', 'decor', 'celestial', 'astrology'],
    icon: 'moon',
  },
  {
    id: 'manifestation-journal',
    name: 'Manifestation & Gratitude Journal',
    nameZh: '显化与感恩日记',
    keywords: 'manifestation journal law of attraction gratitude',
    categories: ['manifestation', 'self-help', 'journal'],
    elements: ['wood', 'fire', 'earth', 'metal', 'water'],
    zodiac: [],
    tags: ['journal', 'manifestation', 'gratitude', 'law-of-attraction'],
    icon: 'book',
  },
  {
    id: 'crystal-suncatcher',
    name: 'Crystal Prism Suncatcher',
    nameZh: '水晶棱镜捕光挂饰',
    keywords: 'crystal prism suncatcher hanging rainbow',
    categories: ['decor', 'crystals', 'home'],
    elements: ['water', 'metal'],
    zodiac: [],
    tags: ['crystal', 'suncatcher', 'decor', 'rainbow'],
    icon: 'crystal',
  },
];

function bigImage(url) {
  if (!url) return url;
  return url.replace(/(\/images\/I\/[^.]+(?:\._[^.]+)?)\._AC_[^.]+_\.jpg/i, '$1._AC_SL1500_.jpg')
            .replace(/(\.jpg)\?.*$/, '$1');
}

async function searchFirstAsin(page, kw) {
  await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(kw)}&s=popularity-rank`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('div[data-asin]'));
    for (const n of nodes) {
      const asin = n.getAttribute('data-asin');
      if (!asin || asin.length < 8) continue;
      const title = n.querySelector('h2 a span, h2 span');
      if (title && title.textContent.trim()) return asin;
    }
    return '';
  });
}

async function scrapeDp(page, asin) {
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
  const existing = new Set(products.map(p => p.id));
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: UA });

  let added = 0;
  for (const w of WISHLIST) {
    if (existing.has(w.id)) { console.log(`⏭️  skip existing ${w.id}`); continue; }
    let asin = w.seedAsin || '';
    if (!asin) {
      asin = await searchFirstAsin(page, w.keywords);
      console.log(`  🔎 ${w.id}: search "${w.keywords}" -> ASIN ${asin || '(none)'}`);
      if (!asin) { console.error(`  ⚠️  ${w.id} no ASIN found, skipped`); continue; }
      await new Promise(r => setTimeout(r, 1500));
    }
    const d = await scrapeDp(page, asin);
    const entry = {
      id: w.id,
      name: d.title && d.title.length < 80 ? d.title : w.name,
      nameZh: w.nameZh,
      price: d.price || '',
      image: bigImage(d.img) || '',
      keywords: w.keywords,
      rating: d.rating || '',
      reviews: d.reviews || '',
      categories: w.categories,
      elements: w.elements,
      zodiac: w.zodiac,
      tags: w.tags,
      icon: w.icon,
      asin,
    };
    products.push(entry);
    added++;
    console.log(`  ✅ ${w.id}: ${entry.name} | ${entry.price || '?'} | ${entry.rating || '?'} (${entry.reviews || '-'} reviews) | img=${entry.image ? 'Y' : 'n'}`);
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ Added ${added} best-seller products. Total now: ${products.length}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
