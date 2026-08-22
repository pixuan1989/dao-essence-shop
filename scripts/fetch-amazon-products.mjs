/**
 * fetch-amazon-products.mjs
 * --------------------------
 * Pull REAL Amazon product data (title, image, price, rating, reviews,
 * official affiliate link) for every entry in data/amazon-products.json
 * via the Amazon Product Advertising API 5.0 (PA-API).
 *
 * Zero external dependencies — AWS SigV4 signing is implemented inline
 * with Node's built-in crypto + fetch (Node 18+).
 *
 * Credentials are read from environment variables (NEVER hard-coded):
 *   PAAPI_ACCESS_KEY      AWS Access Key Id     (required)
 *   PAAPI_SECRET_KEY      AWS Secret Access Key (required)
 *   PAAPI_PARTNER_TAG     Associate tag         (default: daoessence25-20)
 *   PAAPI_HOST            API host              (default: webservices.amazon.com)
 *   PAAPI_REGION          signing region        (default: us-east-1)
 *   PAAPI_MARKETPLACE     Marketplace           (default: www.amazon.com)
 *
 * Usage:
 *   export PAAPI_ACCESS_KEY=... PAAPI_SECRET_KEY=...
 *   node scripts/fetch-amazon-products.mjs
 *   (or fill scripts/ENV_TEMPLATE.txt and rename to .env — auto-loaded)
 *
 * Prerequisite: the Associate account must be PA-API eligible
 * (3 qualified sales in 180 days, or approved by Amazon).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'amazon-products.json');

// Load .env from project root (gitignored) so the user only edits a file.
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (!(k in process.env)) process.env[k] = v;
  }
}

const ACCESS_KEY = process.env.PAAPI_ACCESS_KEY;
const SECRET_KEY = process.env.PAAPI_SECRET_KEY;
const PARTNER_TAG = process.env.PAAPI_PARTNER_TAG || 'daoessence25-20';
const HOST = process.env.PAAPI_HOST || 'webservices.amazon.com';
const REGION = process.env.PAAPI_REGION || 'us-east-1';
const MARKETPLACE = process.env.PAAPI_MARKETPLACE || 'www.amazon.com';
const SERVICE = 'ProductAdvertisingAPI';

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ Missing credentials. Set PAAPI_ACCESS_KEY and PAAPI_SECRET_KEY.');
  console.error('   Copy .env.example to .env, fill in the keys, then re-run.');
  process.exit(1);
}

// ── AWS SigV4 (PA-API flavour) ──────────────────────────────────────────────
function hmac(key, msg) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest();
}
function getSignatureKey(key, dateStamp, region, service) {
  let k = hmac('AWS4' + key, dateStamp);
  k = hmac(k, region);
  k = hmac(k, service);
  k = hmac(k, 'aws4_request');
  return k;
}

async function paapi(operation, payloadObj) {
  const endpoint = `https://${HOST}/paapi5/${operation.toLowerCase()}`;
  const amzTarget = `com.amazon.paapi5.v1.ProductAdvertisingAPI_20220926.${operation}`;
  const payload = JSON.stringify(payloadObj);
  const payloadHash = crypto.createHash('sha256').update(payload, 'utf8').digest('hex');

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').replace('Z', 'Z'); // 20240101T000000Z
  const dateStamp = amzDate.slice(0, 8);

  const contentEncoding = 'amz-1.0';
  const contentType = 'application/json; charset=utf-8';
  const canonicalHeaders =
    `content-encoding:${contentEncoding}\n` +
    `content-type:${contentType}\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${amzTarget}\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest =
    `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign =
    `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n` +
    crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');

  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, SERVICE);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'content-encoding': contentEncoding,
      'content-type': contentType,
      host: HOST,
      'x-amz-date': amzDate,
      'x-amz-target': amzTarget,
    },
    body: payload,
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try { detail = JSON.parse(text).Errors?.map(e => e.Message).join('; '); } catch (_) {}
    throw new Error(`PA-API ${operation} failed (${res.status}): ${detail}`);
  }
  return JSON.parse(text);
}

// ── Extract a usable product from a PA-API item ─────────────────────────────
function pickItem(items) {
  if (!items || !items.length) return null;
  // prefer an item that actually has an image + offer
  return items.find(i => i.Images && i.Images.Primary && i.Images.Primary.Large) || items[0];
}

function extract(p, item) {
  const updated = { ...p };
  if (!item) return updated;

  updated.asin = item.ASIN || updated.asin;
  if (item.ItemInfo && item.ItemInfo.Title && item.ItemInfo.Title.DisplayValue) {
    updated.name = item.ItemInfo.Title.DisplayValue; // real English title
  }
  const img = item.Images && item.Images.Primary && item.Images.Primary.Large;
  if (img && img.URL) updated.image = img.URL;

  const listing = item.Offers && item.Offers.Listings && item.Offers.Listings[0];
  if (listing && listing.Price && listing.Price.DisplayAmount) {
    updated.price = listing.Price.DisplayAmount;
  }
  if (item.CustomerReviews) {
    if (item.CustomerReviews.StarRating && item.CustomerReviews.StarRating.DisplayValue) {
      updated.rating = item.CustomerReviews.StarRating.DisplayValue;
    }
    if (typeof item.CustomerReviews.Count === 'number') {
      updated.reviews = String(item.CustomerReviews.Count);
    }
  }
  return updated;
}

const RESOURCES = [
  'Images.Primary.Large',
  'ItemInfo.Title',
  'Offers.Listings.Price',
  'CustomerReviews.StarRating',
  'CustomerReviews.Count',
];

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ data/amazon-products.json not found at', DATA_FILE);
    process.exit(1);
  }
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`📦 Loaded ${products.length} products. Backing up original...`);
  fs.writeFileSync(DATA_FILE + '.bak', JSON.stringify(products, null, 2));

  let ok = 0, failed = 0;
  for (const p of products) {
    const kw = p.keywords || p.name;
    try {
      const data = await paapi('SearchItems', {
        Keywords: kw,
        PartnerTag: PARTNER_TAG,
        PartnerType: 'Associates',
        Marketplace: MARKETPLACE,
        Resources: RESOURCES,
      });
      const items = (data.SearchResult && data.SearchResult.Items) || [];
      const item = pickItem(items);
      const before = { image: !!p.image, asin: !!p.asin };
      Object.assign(p, extract(p, item));
      const got = (p.image && !before.image) || (p.asin && !before.asin) ? '+' : '·';
      console.log(`  ${got} ${p.id}: ${p.name.slice(0, 46)}  [asin=${p.asin || '-'} img=${p.image ? 'Y' : 'n'}]`);
      ok++;
    } catch (e) {
      console.error(`  ⚠️ ${p.id} skipped: ${e.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 350)); // be gentle on rate limits
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log(`\n✅ Done. ${ok} updated, ${failed} failed. Wrote ${DATA_FILE}`);
  console.log('   Next: run `node build-blog.js` to refresh dist/, then commit.');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
