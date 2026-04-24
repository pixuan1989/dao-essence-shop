/**
 * DaoEssence Index Check Script
 * Step 1: Fetch sitemap URLs
 * Step 2: Bing GetUrlInfo for each URL (crawl status)
 * Step 3: Tech check for unfetched URLs
 * Step 4: AI word scan + violation word scan for unfetched tech-OK URLs
 * Step 5: Auto-submit URLs to Bing + IndexNow
 */

const https = require('https');
const http = require('http');

const BING_API_KEY = '223da655c8aa4a82951d2eabe7bfe283';
const SITE_URL = 'www.daoessentia.com';
const INDEXNOW_KEY = '5ad49cf218073b6e';

// AI high-frequency words
const AI_WORDS = [
  'delve into', 'tapestry', 'landscape', 'realm', 'crucial', 'foster',
  'leverage', 'facilitate', 'robust', 'nuanced', 'furthermore', 'moreover',
  'additionally', 'in conclusion', "it's worth noting", 'paramount',
  'embark on', 'unlock', 'transform', 'seamless', 'comprehensive'
];

// Violation words (SEO black-hat, medical, fake promises)
const VIOLATION_WORDS = [
  'buy links', 'link farm', 'keyword stuffing', 'cloaking',
  'cure', 'treatment', 'diagnose', 'prescription', 'medication',
  'guaranteed', '100% effective', 'miracle', 'overnight results',
  'clickbait', 'free money', 'get rich quick'
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, { timeout: 20000, ...options }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    https.get(url, { timeout: 15000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.substring(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function bingGetUrlInfo(pageUrl) {
  const encoded = encodeURIComponent(pageUrl);
  const api = `https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo?siteUrl=${encodeURIComponent('https://' + SITE_URL)}&url=${encoded}&apikey=${BING_API_KEY}`;
  return fetchJSON(api);
}

async function main() {
  console.log('='.repeat(60));
  console.log('  DaoEssence Index Check');
  console.log(`  ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Step 1: Get sitemap URLs
  console.log('\n[Step 1] Fetching sitemap...');
  let sitemapUrls = [];
  try {
    const resp = await fetch('https://www.daoessentia.com/sitemap.xml');
    const matches = resp.body.match(/<loc>([^<]+)<\/loc>/g) || [];
    sitemapUrls = matches.map(m => m.replace(/<\/?loc>/g, '')).sort();
    console.log(`  Found ${sitemapUrls.length} URLs in sitemap`);
  } catch (e) {
    console.log(`  ERROR fetching sitemap: ${e.message}`);
    return;
  }

  // Step 2: Bing GetUrlInfo for each URL
  console.log('\n[Step 2] Checking Bing crawl status (1.5s interval)...');
  const bingResults = [];
  const crawled = [];
  const discovered = [];
  const notFound = [];

  for (let i = 0; i < sitemapUrls.length; i++) {
    const url = sitemapUrls[i];
    const shortName = url === 'https://www.daoessentia.com/' ? '/' : url.replace('https://www.daoessentia.com/', '');
    process.stdout.write(`  [${i + 1}/${sitemapUrls.length}] ${shortName.substring(0, 60).padEnd(60)} `);

    try {
      const resp = await bingGetUrlInfo(url);
      const d = resp.d;

      if (d && d.LastCrawledDate && !d.LastCrawledDate.includes('(0)')) {
        const ts = parseInt(d.LastCrawledDate.match(/\d+/)[0]);
        const date = new Date(ts).toISOString().split('T')[0];
        console.log(`CRAWLED (last: ${date}, doc: ${d.DocumentSize})`);
        crawled.push({ url, shortName, lastCrawled: date, docSize: d.DocumentSize });
      } else if (d && d.DiscoveryDate && !d.DiscoveryDate.includes('(0)')) {
        const ts = parseInt(d.DiscoveryDate.match(/\d+/)[0]);
        const date = new Date(ts).toISOString().split('T')[0];
        console.log(`DISCOVERED (${date}, not yet crawled)`);
        discovered.push({ url, shortName, discoveryDate: date, docSize: d.DocumentSize });
      } else if (d) {
        console.log(`NO_DATA (HttpStatus: ${d.HttpStatus}, DocSize: ${d.DocumentSize})`);
        notFound.push({ url, shortName, httpStatus: d.HttpStatus, docSize: d.DocumentSize });
      } else {
        console.log('NO_RESPONSE (empty d)');
        notFound.push({ url, shortName, httpStatus: '-', docSize: '-' });
      }
    } catch (e) {
      console.log(`API_ERROR: ${e.message.substring(0, 80)}`);
      notFound.push({ url, shortName, httpStatus: 'API_ERR', docSize: '-' });
    }

    await sleep(1500);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  BING CRAWL SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Total sitemap URLs:  ${sitemapUrls.length}`);
  console.log(`  Bing CRAWLED:        ${crawled.length}`);
  console.log(`  Bing DISCOVERED:     ${discovered.length}`);
  console.log(`  Bing NOT FOUND:      ${notFound.length}`);

  // Step 3: Tech check for not-discovered URLs (notFound + discovered)
  const needsCheck = [...notFound, ...discovered];
  console.log(`\n[Step 3] Tech check for ${needsCheck.length} URLs not yet crawled...`);
  
  const techIssues = [];
  const techOK = [];

  for (const item of needsCheck) {
    process.stdout.write(`  ${item.shortName.substring(0, 55).padEnd(55)} `);
    
    try {
      const resp = await fetch(item.url, { method: 'GET', followRedirects: false });
      const body = resp.body;
      const issues = [];

      // HTTP status
      if (resp.status !== 200) issues.push(`HTTP ${resp.status}`);

      // robots meta
      const robotsMatch = body.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
        || body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
      if (robotsMatch && robotsMatch[1].includes('noindex')) issues.push('noindex meta');

      // X-Robots-Tag header
      const xr = (resp.headers['x-robots-tag'] || '').toLowerCase();
      if (xr.includes('noindex')) issues.push('X-Robots-Tag: noindex');

      // canonical
      const canMatch = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
        || body.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      if (canMatch) {
        const can = canMatch[1].replace(/\/$/, '');
        const urlNorm = item.url.replace(/\/$/, '');
        if (can !== urlNorm && !item.url.startsWith(can)) issues.push(`canonical mismatch -> ${can}`);
      }

      // Content size
      if (body.length < 500) issues.push(`content too small (${body.length} chars)`);

      if (issues.length > 0) {
        console.log(`ISSUE: ${issues.join(', ')}`);
        techIssues.push({ ...item, issues });
      } else {
        console.log('OK');
        techOK.push(item);
      }
    } catch (e) {
      console.log(`FETCH ERROR: ${e.message.substring(0, 60)}`);
      techIssues.push({ ...item, issues: ['fetch error: ' + e.message.substring(0, 50)] });
    }

    await sleep(800);
  }

  // Step 4: AI + violation word scan for tech-OK URLs
  console.log(`\n[Step 4] AI word + violation scan for ${techOK.length} tech-OK URLs...`);
  
  const aiFlags = [];
  const violationFlags = [];

  for (const item of techOK) {
    try {
      const resp = await fetch(item.url);
      const body = resp.body.toLowerCase();
      
      // Strip HTML tags for text analysis
      const text = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');

      // AI word scan
      const aiHits = [];
      for (const word of AI_WORDS) {
        if (text.includes(word)) aiHits.push(word);
      }
      if (aiHits.length >= 3) {
        console.log(`  AI: ${item.shortName.substring(0, 50)} -> ${aiHits.length} hits: ${aiHits.join(', ')}`);
        aiFlags.push({ ...item, aiHits, aiCount: aiHits.length });
      } else if (aiHits.length > 0) {
        console.log(`  ai: ${item.shortName.substring(0, 50)} -> ${aiHits.length} hits (minor)`);
      }

      // Violation word scan
      const violHits = [];
      for (const word of VIOLATION_WORDS) {
        if (text.includes(word)) violHits.push(word);
      }
      if (violHits.length > 0) {
        console.log(`  VIOLATION: ${item.shortName.substring(0, 50)} -> ${violHits.join(', ')}`);
        violationFlags.push({ ...item, violHits });
      }
    } catch (e) {
      console.log(`  ERROR scanning ${item.shortName}: ${e.message.substring(0, 50)}`);
    }
    await sleep(500);
  }

  if (aiFlags.length === 0 && violationFlags.length === 0) {
    console.log('  No AI or violation issues found.');
  }

  // Step 5: Auto-submit tech-OK URLs
  console.log(`\n[Step 5] Auto-submitting ${techOK.length} tech-OK URLs...`);

  // Bing SubmitUrlBatch (max 50 per request)
  if (techOK.length > 0) {
    const batches = [];
    for (let i = 0; i < techOK.length; i += 50) {
      batches.push(techOK.slice(i, i + 50).map(u => u.url));
    }
    
    for (const batch of batches) {
      try {
        const postData = JSON.stringify({ siteUrl: `https://${SITE_URL}`, urlList: batch });
        const result = await new Promise((resolve, reject) => {
          const req = https.request({
            hostname: 'ssl.bing.com',
            path: `/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
          }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
          });
          req.on('error', reject);
          req.write(postData);
          req.end();
        });
        console.log(`  Bing SubmitUrlBatch: ${result.status} (${batch.length} URLs)`);
      } catch (e) {
        console.log(`  Bing SubmitUrlBatch ERROR: ${e.message.substring(0, 80)}`);
      }
    }
  }

  // IndexNow
  if (techOK.length > 0) {
    try {
      const indexNowData = JSON.stringify({
        host: SITE_URL,
        key: INDEXNOW_KEY,
        urlList: techOK.map(u => u.url)
      });
      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.indexnow.org',
          path: '/IndexNow',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(indexNowData) }
        }, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode }));
        });
        req.on('error', reject);
        req.write(indexNowData);
        req.end();
      });
      console.log(`  IndexNow: ${result.status} (${techOK.length} URLs)`);
    } catch (e) {
      console.log(`  IndexNow ERROR: ${e.message.substring(0, 80)}`);
    }
  }

  // Google Indexing API
  console.log(`\n  Google Indexing API: ${techOK.length} URLs (requires JWT script)`);
  console.log(`  Run manually: node scripts/gsc-site-verify.cjs + POST to indexing.googleapis.com`);

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('  FINAL REPORT');
  console.log('='.repeat(60));

  console.log(`\n--- Part 1: BING CRAWL STATUS ---`);
  console.log(`  Crawled:    ${crawled.length} / ${sitemapUrls.length}`);
  console.log(`  Discovered: ${discovered.length}`);
  console.log(`  Not Found:  ${notFound.length}`);

  if (crawled.length > 0) {
    console.log(`\n  Crawled URLs:`);
    crawled.forEach(u => console.log(`    ${u.shortName} (last: ${u.lastCrawled}, doc: ${u.docSize})`));
  }

  console.log(`\n--- Part 2: TECHNICAL ISSUES (must fix) ---`);
  if (techIssues.length === 0) {
    console.log('  None - all URLs pass technical checks.');
  } else {
    techIssues.forEach(u => console.log(`    ${u.shortName}: ${u.issues.join(', ')}`));
  }

  console.log(`\n--- Part 3: AI TRACE + VIOLATION WORDS ---`);
  console.log(`  AI heavy (>=3 words): ${aiFlags.length}`);
  console.log(`  Violation words:      ${violationFlags.length}`);
  if (aiFlags.length > 0) {
    aiFlags.forEach(u => console.log(`    ${u.shortName}: ${u.aiHits.join(', ')} (${u.aiCount})`));
  }
  if (violationFlags.length > 0) {
    violationFlags.forEach(u => console.log(`    ${u.shortName}: ${u.violHits.join(', ')}`));
  }

  console.log(`\n--- Part 4: PENDING REVIEW (tech OK, not crawled by Bing) ---`);
  const pending = techOK.filter(u => !aiFlags.find(a => a.url === u.url) && !violationFlags.find(v => v.url === u.url));
  if (pending.length === 0) {
    console.log('  None - all URLs are either crawled or have issues flagged above.');
  } else {
    console.log(`  ${pending.length} URLs have no technical/AI/violation issues but are not crawled by Bing:`);
    pending.forEach(u => console.log(`    ${u.shortName}`));
    console.log(`\n  Possible reasons: new page not yet discovered, low page authority,`);
    console.log(`  content quality score insufficient, or duplicate content.`);
    console.log(`  Recommendation: wait 3-7 days after submission, then check Bing Webmaster Tools.`);
  }

  console.log(`\n--- Part 5: GOOGLE INDEX STATUS ---`);
  console.log(`  Cannot check via API (GSC API unavailable from service account).`);
  console.log(`  Please manually check at: https://search.google.com/search-console`);
  console.log(`  Property: daoessentia.com (domain property, more complete data)`);

  console.log('\n' + '='.repeat(60));
  console.log(`  Done. ${techOK.length} URLs submitted to Bing + IndexNow.`);
  console.log('='.repeat(60));
}

main().catch(console.error);
