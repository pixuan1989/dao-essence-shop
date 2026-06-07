/**
 * indexnow-push.js
 * Push all site URLs to Bing/Yandex/Naver via IndexNow API.
 * Run: node indexnow-push.js
 *
 * Reads sitemap.xml dynamically (no hardcoded URLs).
 * Also works standalone outside of build-blog.js.
 */

const SITE_HOST = 'www.daoessentia.com';
const INDEXNOW_KEY = '5ad49cf218073b6e';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

const fs = require('fs');
const path = require('path');

async function pushToIndexNow() {
    // Try to read from dist/sitemap.xml first, then public/sitemap.xml, then fallback
    const sitemapPaths = [
        path.join(__dirname, 'dist', 'sitemap.xml'),
        path.join(__dirname, 'public', 'sitemap.xml'),
        path.join(__dirname, 'sitemap.xml'),
    ];

    let sitemapContent = null;
    for (const p of sitemapPaths) {
        if (fs.existsSync(p)) {
            sitemapContent = fs.readFileSync(p, 'utf-8');
            console.log(`Using sitemap: ${p}`);
            break;
        }
    }

    if (!sitemapContent) {
        console.error('❌ sitemap.xml not found. Run build-blog.js first, or provide a path.');
        process.exit(1);
    }

    // Extract all <loc> URLs from sitemap
    const urls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

    if (urls.length === 0) {
        console.error('❌ No URLs found in sitemap.xml');
        process.exit(1);
    }

    const payload = {
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        urlList: urls
    };

    console.log(`Pushing ${urls.length} URLs to IndexNow...`);
    console.log(`Host: ${SITE_HOST}`);
    console.log(`Key: ${INDEXNOW_KEY}`);

    try {
        const response = await fetch(INDEXNOW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });

        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (response.status === 200) {
            console.log('✅ Success! URLs submitted to Bing, Yandex, Naver, and other IndexNow partners.');
        } else if (response.status === 202) {
            console.log('✅ Accepted. Key verification pending.');
        } else {
            const text = await response.text();
            console.warn(`⚠️ Unexpected response: ${text}`);
            console.warn(`Check key file exists at: https://${SITE_HOST}/${INDEXNOW_KEY}.txt`);
        }
    } catch (error) {
        console.error('❌ Push failed:', error.message);
    }
}

pushToIndexNow();
