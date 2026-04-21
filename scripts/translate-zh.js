/**
 * translate-zh.js
 * 翻譯 blog/posts/*.md 英文文章為繁體中文，輸出到 blog/posts-zh/
 * 
 * 使用 DashScope Qwen API，搭配 i18n/terminology.json 術語詞典
 * 
 * 用法: node scripts/translate-zh.js [--all | --file <slug>]
 *   --all       翻譯所有文章（默認）
 *   --file slug 只翻譯指定 slug 的文章
 * 
 * 環境變數: DASHSCOPE_API_KEY（必須）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT_DIR, 'blog', 'posts');
const POSTS_ZH_DIR = path.join(ROOT_DIR, 'blog', 'posts-zh');
const TERMINOLOGY_FILE = path.join(ROOT_DIR, 'i18n', 'terminology.json');

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_MODEL = 'qwen-plus'; // 性价比最优
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

if (!DASHSCOPE_API_KEY) {
  console.error('ERROR: DASHSCOPE_API_KEY environment variable is required');
  process.exit(1);
}

// Load terminology dictionary
function loadTerminology() {
  const raw = fs.readFileSync(TERMINOLOGY_FILE, 'utf-8');
  const json = JSON.parse(raw);
  const terms = {};
  for (const [category, mappings] of Object.entries(json.categories)) {
    Object.assign(terms, mappings);
  }
  return terms;
}

// Build system prompt with terminology
function buildSystemPrompt(terms) {
  const termList = Object.entries(terms)
    .map(([en, zh]) => `- "${en}" → "${zh}"`)
    .join('\n');

  return `你是一位專業的中國玄學翻譯專家，負責將 DaoEssence 網站的英文博客文章翻譯為繁體中文（港台風格）。

## 翻譯規則

1. **語言風格**：繁體中文，港台慣用語（如：資訊、網路、軟體、資料、部落格）
2. **術語一致性**：必須嚴格使用下面的術語詞典，不要自行翻譯已有映射的術語
3. **語氣**：保持原文的專業但親切的語氣，像是對一般讀者講解玄學概念
4. **格式**：輸出純 Markdown 正文（不含 frontmatter），保留原文的標題層級、列表、引用、粗體等格式
5. **不要翻譯**：品牌名 DaoEssence、工具名（如 Soulmate Finder、BaZi Calculator）、URL、HTML 標籤
6. **玄學術語保留**：對於沒有對應映射的玄學概念，保留拼音或英文，不要直譯
7. **不要加「翻譯自英文」或類似說明**，直接輸出翻譯後的正文

## 術語詞典

${termList}`;
}

// Translate content via DashScope API
async function translateContent(systemPrompt, markdownContent) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `請翻譯以下 Markdown 文章為繁體中文：\n\n${markdownContent}` }
  ];

  const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model: DASHSCOPE_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 8000
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DashScope API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const translated = data.choices?.[0]?.message?.content;
  if (!translated) {
    throw new Error('Empty translation response');
  }
  return translated;
}

// Translate title separately (shorter, more reliable)
async function translateTitle(systemPrompt, title) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `請將以下文章標題翻譯為繁體中文，只輸出翻譯結果，不要加引號或其他格式：\n\n${title}` }
  ];

  const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model: DASHSCOPE_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 200
    })
  });

  if (!res.ok) {
    throw new Error(`Title translation API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || title;
}

// Translate description for meta
async function translateDescription(systemPrompt, description) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `請將以下文章描述翻譯為繁體中文，保持在 155 字元以內，只輸出翻譯結果：\n\n${description}` }
  ];

  const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model: DASHSCOPE_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 300
    })
  });

  if (!res.ok) {
    throw new Error(`Description translation API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || description;
}

// Main translation function for a single article
async function translateArticle(post, systemPrompt, retryCount = 2) {
  const { data, content, filename, slug } = post;
  
  console.log(`\n  Translating: ${slug}`);
  
  // Translate title
  let translatedTitle;
  try {
    translatedTitle = await translateTitle(systemPrompt, data.title);
    console.log(`    Title: "${data.title}" → "${translatedTitle}"`);
  } catch (err) {
    console.warn(`    ⚠️ Title translation failed: ${err.message}, using original`);
    translatedTitle = data.title;
  }
  
  // Translate description
  let translatedDescription;
  if (data.description) {
    try {
      translatedDescription = await translateDescription(systemPrompt, data.description);
      console.log(`    Description translated`);
    } catch (err) {
      console.warn(`    ⚠️ Description translation failed: ${err.message}, using original`);
      translatedDescription = data.description;
    }
  }
  
  // Translate body (with retry)
  let translatedBody;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      translatedBody = await translateContent(systemPrompt, content);
      console.log(`    Body translated (${translatedBody.length} chars)`);
      break;
    } catch (err) {
      if (attempt < retryCount) {
        console.warn(`    ⚠️ Attempt ${attempt + 1} failed: ${err.message}, retrying...`);
        await new Promise(r => setTimeout(r, 2000)); // 2s delay before retry
      } else {
        console.error(`    ❌ All ${retryCount + 1} attempts failed for body: ${err.message}`);
        return null;
      }
    }
  }
  
  // Build translated frontmatter
  const zhData = { ...data };
  zhData.title = translatedTitle;
  if (translatedDescription) zhData.description = translatedDescription;
  zhData.lang = 'zh-Hant';
  // Keep original slug reference for cross-linking
  if (data.related_posts) zhData.related_posts = data.related_posts;
  
  // Build output Markdown
  const zhContent = matter.stringify(translatedBody, zhData);
  
  // Write to posts-zh/
  const outputPath = path.join(POSTS_ZH_DIR, filename);
  fs.writeFileSync(outputPath, zhContent, 'utf-8');
  console.log(`    ✅ Saved: blog/posts-zh/${filename}`);
  
  return { slug, translatedTitle, translatedDescription };
}

// Parse CLI args
const args = process.argv.slice(2);
const mode = args.includes('--all') ? 'all' : args.includes('--file') ? 'file' : 'all';
const targetFile = mode === 'file' ? args[args.indexOf('--file') + 1] : null;

async function main() {
  console.log('=== DaoEssence i18n: English → Traditional Chinese Translation ===');
  
  // Ensure output directory exists
  fs.mkdirSync(POSTS_ZH_DIR, { recursive: true });
  
  // Load terminology
  const terms = loadTerminology();
  console.log(`Loaded ${Object.keys(terms).length} terms from terminology.json`);
  
  // Build system prompt
  const systemPrompt = buildSystemPrompt(terms);
  
  // Read all source articles
  const allFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const sourcePosts = allFiles.map(filename => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);
    const slug = filename.replace(/\.md$/, '');
    return { filename, slug, data, content };
  });
  
  console.log(`Found ${sourcePosts.length} articles in blog/posts/`);
  
  // Filter articles to translate
  let targets = sourcePosts;
  if (mode === 'file' && targetFile) {
    targets = sourcePosts.filter(p => p.slug === targetFile || p.filename === targetFile);
    if (targets.length === 0) {
      console.error(`Article not found: ${targetFile}`);
      process.exit(1);
    }
    console.log(`Translating 1 article: ${targetFile}`);
  } else {
    // Skip already translated (check posts-zh/)
    const existingZh = new Set(
      fs.existsSync(POSTS_ZH_DIR) 
        ? fs.readdirSync(POSTS_ZH_DIR).filter(f => f.endsWith('.md'))
        : []
    );
    const untranslated = targets.filter(p => !existingZh.has(p.filename));
    if (untranslated.length < targets.length) {
      console.log(`Skipping ${targets.length - untranslated.length} already translated articles`);
      console.log(`  (Use --file <slug> to re-translate a specific article)`);
    }
    targets = untranslated;
    console.log(`Translating ${targets.length} new articles`);
  }
  
  if (targets.length === 0) {
    console.log('Nothing to translate. All articles are up to date.');
    return;
  }
  
  // Translate articles sequentially (to respect API rate limits)
  const results = [];
  for (const post of targets) {
    const result = await translateArticle(post, systemPrompt);
    if (result) results.push(result);
    // Delay between articles to avoid rate limiting
    if (targets.indexOf(post) < targets.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\n=== Translation Complete ===`);
  console.log(`  Translated: ${results.length} / ${targets.length}`);
  console.log(`  Output: blog/posts-zh/`);
  console.log(`  Next: run "npm run build" to generate /zh/ pages`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
