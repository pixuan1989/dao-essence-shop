const https = require('https');

const urls = [
  'https://www.daoessentia.com/',
  'https://www.daoessentia.com/shop',
  'https://www.daoessentia.com/culture',
  'https://www.daoessentia.com/about',
  'https://www.daoessentia.com/contact',
  'https://www.daoessentia.com/product-detail?id=prod_3btZfL4MwsO2xSr7AB3J8S',
  'https://www.daoessentia.com/product-detail?id=natural-agarwood',
  'https://www.daoessentia.com/product-detail?id=custom-protection-token',
  'https://www.daoessentia.com/bazi-form',
  'https://www.daoessentia.com/privacy',
  'https://www.daoessentia.com/terms',
  'https://www.daoessentia.com/checkout',
  'https://www.daoessentia.com/blog/',
  'https://www.daoessentia.com/blog/five-elements-theory-wu-xing-guide',
  'https://www.daoessentia.com/blog/taoist-meditation-guide',
  'https://www.daoessentia.com/blog/what-is-bazi-beginners-guide',
  'https://www.daoessentia.com/blog/bazi-astrology',
  'https://www.daoessentia.com/blog/zodiac-horoscope',
  'https://www.daoessentia.com/blog/feng-shui',
  'https://www.daoessentia.com/blog/daily-horoscope',
  'https://www.daoessentia.com/blog/lucky-tips',
];

function postIndexNow() {
  const host = 'api.indexnow.org';
  const path = '/indexnow'; // must be lowercase
  const key = 'a1b2c3d4e5f6a7b8'; // valid hex key, 16 chars

  const postData = JSON.stringify({
    host: 'www.daoessentia.com',
    key: key,
    urlList: urls,
  });

  const options = {
    hostname: host,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n[IndexNow] Status: ${res.statusCode}`);
        console.log(`[IndexNow] Response: ${data}`);
        resolve();
      });
    });
    req.on('error', (e) => { console.error(`[IndexNow] Error: ${e.message}`); reject(e); });
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log(`Submitting ${urls.length} URLs to IndexNow (Bing/Yahoo)...`);
  await postIndexNow();
  console.log('\nDone!');
}

main().catch(console.error);
