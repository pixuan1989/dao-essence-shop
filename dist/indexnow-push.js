/**
 * indexnow-push.js
 * Push all site URLs to Bing via IndexNow API.
 * Run: node indexnow-push.js
 * 
 * This script reads sitemap.xml, extracts all URLs,
 * and pushes them to Bing's IndexNow endpoint.
 */

const SITE_HOST = 'www.daoessentia.com';
const INDEXNOW_KEY = '5ad49cf218073b6e';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

// All important URLs to push (hardcoded for reliability)
const URLS = [
  'https://www.daoessentia.com/',
  'https://www.daoessentia.com/shop.html',
  'https://www.daoessentia.com/culture.html',
  'https://www.daoessentia.com/guide.html',
  'https://www.daoessentia.com/about.html',
  'https://www.daoessentia.com/contact.html',
  'https://www.daoessentia.com/bazi-form.html',
  'https://www.daoessentia.com/privacy.html',
  'https://www.daoessentia.com/terms.html',
  'https://www.daoessentia.com/blog/',
  'https://www.daoessentia.com/blog/index.html',
  'https://www.daoessentia.com/blog/bazi-astrology.html',
  'https://www.daoessentia.com/blog/zodiac-horoscope.html',
  'https://www.daoessentia.com/blog/feng-shui.html',
  'https://www.daoessentia.com/blog/daily-horoscope.html',
  'https://www.daoessentia.com/blog/lucky-tips.html',
  'https://www.daoessentia.com/blog/five-elements-theory-wu-xing-guide.html',
  'https://www.daoessentia.com/blog/taoist-meditation-guide.html',
  'https://www.daoessentia.com/blog/what-is-bazi-beginners-guide.html',
];

async function pushToIndexNow() {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    urlList: URLS
  };

  console.log(`Pushing ${URLS.length} URLs to IndexNow...`);
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
      console.log('✅ Success! URLs submitted to Bing, Naver, Yandex, and other IndexNow partners.');
    } else if (response.status === 202) {
      console.log('✅ Accepted. Key verification pending.');
    } else {
      console.log(`⚠️ Unexpected response. Check key file exists at: https://${SITE_HOST}/${INDEXNOW_KEY}.txt`);
    }
  } catch (error) {
    console.error('❌ Push failed:', error.message);
  }
}

pushToIndexNow();
