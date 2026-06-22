/**
 * 文章上线 SEO 回测 (Article SEO Pipeline)
 * 验证线上中英文页面是否都可访问
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'blog', 'posts');
const POSTS_ZH_DIR = path.join(PROJECT_ROOT, 'blog', 'posts-zh');
const BASE_URL = 'https://www.daoessentia.com';

function checkUrl(url, maxRedirects = 3) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 10000 }, (res) => {
      // 301/302/303/307/308 → follow redirect
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        const nextUrl = new URL(res.headers.location, url).href;
        checkUrl(nextUrl, maxRedirects - 1).then(resolve);
      } else {
        resolve(res.statusCode);
      }
    }).on('error', () => resolve(0));
  });
}

async function main() {
  console.log('\n [文章 SEO 回测] 启动...\n');

  // 1. 获取所有英文文章
  const enFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📋 英文文章：${enFiles.length} 篇`);

  // 2. 获取所有中文翻译
  const zhFiles = new Set(fs.readdirSync(POSTS_ZH_DIR).filter(f => f.endsWith('.md')));
  console.log(`📋 中文翻译：${zhFiles.size} 篇`);

  // 3. 检查缺失的中文翻译
  const missingZh = enFiles.filter(f => !zhFiles.has(f));
  
  if (missingZh.length > 0) {
    console.error(`\n❌ 发现 ${missingZh.length} 篇文章缺少中文翻译:`);
    for (const f of missingZh) {
      console.error(`   - ${f}`);
    }
    console.error('\n⚠️  这些文章的中文 HTML 不会生成，影响中文 SEO');
    process.exit(1);
  }

  console.log('\n✅ 所有文章都有中文翻译');

  // 4. 验证线上中英文页面是否都可访问
  console.log('\n🌐 检查线上页面...');
  let allPassed = true;
  const failedUrls = [];

  for (const f of enFiles) {
    const filePath = path.join(POSTS_DIR, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const slugMatch = content.match(/^slug:\s*["']?([^"'\n]+)["']?$/m);
    const slug = slugMatch ? slugMatch[1].trim() : f.replace('.md', '');
    
    const enUrl = `${BASE_URL}/blog/${slug}`;
    const zhUrl = `${BASE_URL}/zh/blog/${slug}`;

    const [enStatus, zhStatus] = await Promise.all([
      checkUrl(enUrl),
      checkUrl(zhUrl)
    ]);

    if (enStatus !== 200) {
      failedUrls.push({ slug, lang: 'EN', status: enStatus });
      allPassed = false;
    }
    if (zhStatus !== 200) {
      failedUrls.push({ slug, lang: 'ZH', status: zhStatus });
      allPassed = false;
    }
  }

  if (failedUrls.length > 0) {
    console.error(`\n❌ 发现 ${failedUrls.length} 个页面无法访问:`);
    for (const m of failedUrls) {
      console.error(`   - ${m.lang}: ${m.slug} (HTTP ${m.status})`);
    }
    process.exit(1);
  }

  console.log('✅ 所有文章的中英文页面都可访问 (HTTP 200)');

  // 5. 验证 sitemap 包含所有文章
  console.log('\n📄 检查 sitemap...');
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const sitemap = await new Promise((resolve) => {
    https.get(sitemapUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });

  let sitemapPassed = true;
  for (const f of enFiles) {
    const filePath = path.join(POSTS_DIR, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const slugMatch = content.match(/^slug:\s*["']?([^"'\n]+)["']?$/m);
    const slug = slugMatch ? slugMatch[1].trim() : f.replace('.md', '');
    
    if (!sitemap.includes(`blog/${slug}`)) {
      console.error(`   ❌ sitemap 缺失：${slug}`);
      sitemapPassed = false;
    }
  }

  if (sitemapPassed) {
    console.log('✅ sitemap.xml 包含所有文章 URL');
  } else {
    process.exit(1);
  }

  console.log('\n [文章 SEO 回测] 全部通过！');
}

main();
