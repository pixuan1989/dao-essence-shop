/**
 * 文章上线 SEO 回测 (Article SEO Pipeline)
 * 在 build-blog.js 完成后运行，验证新文章的中英文 HTML 是否都存在
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'blog', 'posts');
const POSTS_ZH_DIR = path.join(PROJECT_ROOT, 'blog', 'posts-zh');
const DIST_BLOG_DIR = path.join(PROJECT_ROOT, 'dist', 'blog');
const DIST_ZH_BLOG_DIR = path.join(PROJECT_ROOT, 'dist', 'zh', 'blog');

function main() {
  console.log('\n🔍 [文章 SEO 回测] 启动...\n');

  // 1. 获取所有英文文章
  const enFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📋 英文文章: ${enFiles.length} 篇`);

  // 2. 获取所有中文翻译
  const zhFiles = new Set(fs.readdirSync(POSTS_ZH_DIR).filter(f => f.endsWith('.md')));
  console.log(`📋 中文翻译: ${zhFiles.size} 篇`);

  // 3. 检查缺失的中文翻译
  const missingZh = enFiles.filter(f => !zhFiles.has(f));
  
  if (missingZh.length > 0) {
    console.error(`\n❌ 发现 ${missingZh.length} 篇文章缺少中文翻译:`);
    for (const f of missingZh) {
      console.error(`   - ${f}`);
    }
    console.error('\n⚠️  这些文章的中文 HTML 不会生成，影响中文 SEO');
    console.error('   解决方案: 检查 DashScope API 是否正常，或手动创建中文版\n');
    process.exit(1);
  }

  console.log('\n✅ 所有文章都有中文翻译');

  // 4. 验证中英文 HTML 是否都存在
  let allPassed = true;
  const missingHtml = [];

  for (const f of enFiles) {
    const slug = f.replace('.md', '');
    const enHtml = path.join(DIST_BLOG_DIR, slug, 'index.html');
    const zhHtml = path.join(DIST_ZH_BLOG_DIR, slug, 'index.html');

    if (!fs.existsSync(enHtml)) {
      missingHtml.push({ slug, lang: 'EN' });
      allPassed = false;
    }
    if (!fs.existsSync(zhHtml)) {
      missingHtml.push({ slug, lang: 'ZH' });
      allPassed = false;
    }
  }

  if (missingHtml.length > 0) {
    console.error(`\n❌ 发现 ${missingHtml.length} 个 HTML 文件缺失:`);
    for (const m of missingHtml) {
      console.error(`   - ${m.lang}: ${m.slug}`);
    }
    console.error('\n⚠️  这可能是 build-blog.js 构建失败导致的\n');
    process.exit(1);
  }

  console.log('✅ 所有文章的中英文 HTML 都已生成');

  // 5. 验证 sitemap 包含所有文章
  const sitemap = fs.readFileSync(path.join(PROJECT_ROOT, 'dist', 'sitemap.xml'), 'utf8');
  let sitemapPassed = true;

  for (const f of enFiles) {
    const slug = f.replace('.md', '');
    if (!sitemap.includes(`blog/${slug}`)) {
      console.error(`   ❌ sitemap 缺失: ${slug}`);
      sitemapPassed = false;
    }
  }

  if (sitemapPassed) {
    console.log('✅ sitemap.xml 包含所有文章 URL');
  } else {
    console.error('\n⚠️  sitemap.xml 不完整\n');
    process.exit(1);
  }

  console.log('\n🎉 [文章 SEO 回测] 全部通过！');
}

main();
