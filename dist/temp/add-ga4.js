// Script: add-ga4.js
// Adds GA4 tracking code to all HTML files and build-blog.js templates
const fs = require('fs');
const path = require('path');

const GA_ID = 'G-FX0T6YB6DE';
const GA_SCRIPT = `    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    </script>`;

const BASE_DIR = 'C:\\Users\\agenew\\Desktop\\DaoEssence1.0';

// HTML files to process (exclude debug, email templates, admin)
const htmlFiles = [
  'index.html', 'about.html', 'almanac.html', 'almanac-cards-preview.html',
  'bazi-form.html', 'bazi-orders.html', 'checkout.html', 'culture.html',
  'destiny.html', 'favorable-element.html', 'five-elements-test.html',
  'guide.html', 'learn-bazi.html', 'order-confirm.html', 'payment-success.html',
  'privacy.html', 'product-detail.html', 'redeem.html', 'shop.html',
  'soulmate-calculator.html', 'success.html', 'terms.html',
  'bazi-calculator/bazi-result.html',
  'admin/index.html', 'admin/stats.html'
];

// Process HTML files
let htmlCount = 0;
for (const file of htmlFiles) {
  const filePath = path.join(BASE_DIR, file);
  if (!fs.existsSync(filePath)) { console.log(`SKIP (not found): ${file}`); continue; }
  const content = fs.readFileSync(filePath, 'utf-8');
  // Check if GA already exists
  if (content.includes(GA_ID)) { console.log(`SKIP (already has GA4): ${file}`); continue; }
  // Insert before </head>
  const newContent = content.replace('</head>', GA_SCRIPT + '\n</head>');
  if (newContent === content) { console.log(`WARN (no </head> found): ${file}`); continue; }
  fs.writeFileSync(filePath, newContent, 'utf-8');
  htmlCount++;
  console.log(`OK: ${file}`);
}

// Process build-blog.js - 3 template locations
const blogJs = path.join(BASE_DIR, 'build-blog.js');
const blogContent = fs.readFileSync(blogJs, 'utf-8');
if (blogContent.includes(GA_ID)) {
  console.log('SKIP: build-blog.js already has GA4');
} else {
  // Add GA4 to build-blog.js as a constant
  const GA_CONST = `const GA_TRACKING_ID = '${GA_ID}';\nconst GA_HEAD_SCRIPT = \`    <!-- Google Analytics -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=\${GA_TRACKING_ID}"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', '\${GA_TRACKING_ID}');\n    </script>\`;\n`;
  // Insert after the CATEGORY_LABELS_ZH block (around line 50) - before the NAV_HTML
  let updated = blogContent;
  // Find the NAV_HTML definition line and insert GA constants before it
  if (updated.includes('const NAV_HTML')) {
    updated = updated.replace("const NAV_HTML", GA_CONST + "const NAV_HTML");
  } else {
    // Fallback: insert after the first const definition block
    updated = updated.replace("(function() {", GA_CONST + "(function() {");
  }

  // Now replace </head> in each template to include GA script
  // The templates use template literals with </head>
  updated = updated.replace(/(<style>\$\{ARTICLE_STYLES\}<\/style>)\n(\s*<\/head>)/g,
    `$1\n\${GA_HEAD_SCRIPT}\n$2`);

  updated = updated.replace(/(<\/style>\n)\s*(<\/head>\n<body>\n\$\{NAV_HTML\}\n\n    <div class="blog-layout">)/g,
    `$1    \${GA_HEAD_SCRIPT}\n$2`);

  updated = updated.replace(/(@media \(max-width: 640px\) \{[^}]*\}\n    <\/style>)\n(<\/head>\n<body>\n\$\{NAV_HTML\}\n\n    <main class="blog-home">)/g,
    `$1    \${GA_HEAD_SCRIPT}\n$2`);

  fs.writeFileSync(blogJs, updated, 'utf-8');
  console.log('OK: build-blog.js (3 templates + GA constants)');
}

console.log(`\nDone! ${htmlCount} HTML files updated.`);
