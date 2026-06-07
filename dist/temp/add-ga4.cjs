const fs = require('fs');
const path = require('path');

const GA_ID = 'G-FX0T6YB6DE';
const GA_BLOCK = [
  '    <!-- Google Analytics -->',
  '    <script async src="https://www.googletagmanager.com/gtag/js?id=' + GA_ID + '"></script>',
  '    <script>',
  '      window.dataLayer = window.dataLayer || [];',
  '      function gtag(){dataLayer.push(arguments);}',
  "      gtag('js', new Date());",
  "      gtag('config', '" + GA_ID + "');",
  '    </script>'
].join('\r\n');

const base = 'C:\\Users\\agenew\\Desktop\\DaoEssence1.0';

const files = [
  'index.html','about.html','almanac.html','almanac-cards-preview.html',
  'bazi-form.html','bazi-orders.html','checkout.html','culture.html',
  'destiny.html','favorable-element.html','five-elements-test.html',
  'guide.html','learn-bazi.html','order-confirm.html','payment-success.html',
  'privacy.html','product-detail.html','redeem.html','shop.html',
  'soulmate-calculator.html','success.html','terms.html',
  'bazi-calculator\\bazi-result.html',
  'admin\\index.html','admin\\stats.html'
];

let count = 0;
for (const f of files) {
  const p = path.join(base, f);
  if (!fs.existsSync(p)) { console.log('NOT FOUND:', f); continue; }
  let c = fs.readFileSync(p, 'utf-8');
  if (c.includes(GA_ID)) { console.log('SKIP (exists):', f); continue; }
  c = c.replace('</head>', GA_BLOCK + '\r\n</head>');
  if (!c.includes(GA_ID)) { console.log('WARN (no match):', f); continue; }
  fs.writeFileSync(p, c, 'utf-8');
  count++;
  console.log('OK:', f);
}
console.log('\nTotal:', count, 'files updated');
