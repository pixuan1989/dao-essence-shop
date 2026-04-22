/**
 * sync-product-zh.mjs
 * Build-time script: auto-translates new Creem products to Traditional Chinese
 * and updates i18n/product-zh-map.json
 *
 * Called from build-blog.js during Vercel build.
 * Requires: DASHSCOPE_API_KEY + CREEM_API_KEY env vars
 *
 * Flow:
 *   1. Fetch all active products from Creem API
 *   2. Load existing i18n/product-zh-map.json
 *   3. Find products without Chinese translations
 *   4. Call DashScope API to translate name + description
 *   5. Write updated map back to JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const PRODUCT_ZH_MAP_PATH = path.join(ROOT_DIR, 'i18n', 'product-zh-map.json');

// Hidden product IDs (tool unlocks, not shown in /shop)
const HIDDEN_PRODUCT_IDS = new Set([
  'prod_3fJInBNekM9UVJwtClgUtx',  // Almanac Full Access ($2.99)
  'prod_2wj3G9PQp6ZlbD8oFJdr2X',  // Soulmate Timing Unlock ($2.99)
]);

const DASHSCOPE_MODEL = 'qwen-plus';
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const CREEM_API_BASE = 'https://api.creem.io/v1';

/**
 * Load existing product-zh-map.json
 */
function loadProductZhMap() {
  try {
    const raw = fs.readFileSync(PRODUCT_ZH_MAP_PATH, 'utf-8');
    const data = JSON.parse(raw);
    // Remove _comment key for comparison
    const map = { ...data };
    delete map._comment;
    return map;
  } catch {
    console.warn('  ⚠️ product-zh-map.json not found or invalid, starting fresh');
    return {};
  }
}

/**
 * Save product-zh-map.json (preserving _comment)
 */
function saveProductZhMap(map) {
  const existing = loadProductZhMap();
  // Preserve existing translations, merge new ones
  const merged = { ...existing, ...map };
  const output = {
    _comment: 'Auto-generated product Chinese translations. Updated by scripts/sync-product-zh.mjs during build. Do not edit manually — add new entries via Creem sync.',
    ...merged
  };
  fs.writeFileSync(PRODUCT_ZH_MAP_PATH, JSON.stringify(output, null, 2) + '\n', 'utf-8');
}

/**
 * Fetch all active products from Creem API
 */
async function fetchCreemProducts() {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    console.warn('  ⚠️ CREEM_API_KEY not set, cannot fetch products');
    return [];
  }

  const url = `${CREEM_API_BASE}/products/search`;
  console.log(`  📡 Fetching products from Creem API...`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) throw new Error(`Creem API ${res.status}: ${res.statusText}`);

    const data = await res.json();
    const products = (data.items || []).filter(p => p.status === 'active');
    console.log(`  ✅ Fetched ${products.length} active products`);
    return products;
  } catch (err) {
    console.warn(`  ⚠️ Creem API fetch failed: ${err.message}`);
    return [];
  }
}

/**
 * Call DashScope API for translation
 */
async function callDashScope(messages, maxTokens = 500) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY not set');

  const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DASHSCOPE_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: maxTokens
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DashScope API error ${res.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

/**
 * Translate a single product's name and description
 */
async function translateProduct(name, description, retryCount = 1) {
  const systemPrompt = `你是一位專業的中國玄學/靈性產品翻譯專家。將產品名稱和描述翻譯為繁體中文（港台風格）。

規則：
1. 繁體中文，港台慣用語
2. 保留品牌名 DaoEssence 不翻譯
3. 產品名簡潔有力，產品描述專業但親切
4. 輸出 JSON 格式：{"nameCN":"翻譯名","descriptionCN":"翻譯描述"}
5. 只輸出 JSON，不要其他內容`;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const userPrompt = `翻譯以下產品資訊為繁體中文：

產品名稱：${name}
產品描述：${description || 'No description'}`;

      const result = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 500);

      if (!result) throw new Error('Empty response');

      // Parse JSON from response (handle markdown code blocks)
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        nameCN: parsed.nameCN || name,
        descriptionCN: parsed.descriptionCN || description || '暫無描述'
      };
    } catch (err) {
      if (attempt < retryCount) {
        console.warn(`    ⚠️ Attempt ${attempt + 1} failed: ${err.message}, retrying...`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error(`    ❌ Translation failed after ${retryCount + 1} attempts: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

/**
 * Main sync function
 * @returns {Object} The complete product-zh-map (existing + new)
 */
export async function syncProductTranslations() {
  console.log('🔄 Syncing product Chinese translations...');

  // Step 1: Load existing map
  const existingMap = loadProductZhMap();
  console.log(`  📋 Existing translations: ${Object.keys(existingMap).length} products`);

  // Step 2: Fetch products from Creem API
  const products = await fetchCreemProducts();
  if (products.length === 0) {
    console.log('  ℹ️ No products fetched, keeping existing map');
    return existingMap;
  }

  // Step 3: Find products that need translation
  const toTranslate = products.filter(p => {
    if (HIDDEN_PRODUCT_IDS.has(p.id)) return false; // Skip hidden products
    if (existingMap[p.id]) return false; // Already translated
    return true;
  });

  if (toTranslate.length === 0) {
    console.log('  ✅ All products already have Chinese translations');
    return existingMap;
  }

  console.log(`  🌐 Found ${toTranslate.length} products needing translation`);

  // Step 4: Translate each product
  const newTranslations = {};
  for (const product of toTranslate) {
    console.log(`  📝 Translating: ${product.name} (${product.id})`);
    const translation = await translateProduct(product.name, product.description);

    if (translation) {
      newTranslations[product.id] = translation;
      console.log(`    ✅ ${translation.nameCN}`);
    }

    // Rate limit: 1 second between translations
    if (toTranslate.indexOf(product) < toTranslate.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Step 5: Save updated map
  if (Object.keys(newTranslations).length > 0) {
    saveProductZhMap(newTranslations);
    console.log(`  💾 Saved ${Object.keys(newTranslations).length} new translations to product-zh-map.json`);
  }

  // Return the complete merged map
  const completeMap = { ...existingMap, ...newTranslations };
  return completeMap;
}
