/**
 * translate-zh-auto.mjs
 * Auto-translation module for build-blog.js
 * Called during Vercel build to translate new/updated articles to Traditional Chinese.
 * 
 * Exports: autoTranslateIfNeeded(englishArticles, postsZhDir) → zhArticles[]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DASHSCOPE_MODEL = 'qwen-plus';
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// Load terminology dictionary
function loadTerminology(rootDir) {
  const termFile = path.join(rootDir, 'i18n', 'terminology.json');
  if (!fs.existsSync(termFile)) {
    console.warn('  terminology.json not found, proceeding without custom terms');
    return {};
  }
  const raw = fs.readFileSync(termFile, 'utf-8');
  const json = JSON.parse(raw);
  const terms = {};
  for (const [category, mappings] of Object.entries(json.categories)) {
    Object.assign(terms, mappings);
  }
  return terms;
}

function buildSystemPrompt(terms) {
  const termList = Object.entries(terms)
    .map(([en, zh]) => `- "${en}" → "${zh}"`)
    .join('\n');

  return `你是一位專業的中國玄學翻譯專家，負責將 DaoEssence 網站的英文博客文章翻譯為繁體中文（港台風格）。

## 翻譯規則
1. **語言風格**：繁體中文，港台慣用語（如：資訊、網路、軟體、資料、部落格）
2. **術語一致性**：必須嚴格使用下面的術語詞典
3. **語氣**：專業但親切
4. **格式**：輸出純 Markdown 正文（不含 frontmatter），保留標題層級、列表、引用等格式
5. **不要翻譯**：品牌名 DaoEssence、工具名、URL、HTML 標籤
6. **不要加「翻譯自英文」等說明**

## 術語詞典
${termList}`;
}

async function callDashScope(messages, maxTokens = 8000) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const res = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DASHSCOPE_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: maxTokens
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DashScope API error ${res.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

async function translateArticle(systemPrompt, data, content, filename, retryCount = 2) {
  // Translate title
  let translatedTitle;
  try {
    translatedTitle = await callDashScope([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `翻譯文章標題為繁體中文，只輸出翻譯結果：\n\n${data.title}` }
    ], 200);
    if (translatedTitle) translatedTitle = translatedTitle.trim();
  } catch (err) {
    console.warn(`    ⚠️ Title translation failed: ${err.message}`);
    translatedTitle = data.title;
  }

  // Translate description
  let translatedDescription;
  if (data.description) {
    try {
      translatedDescription = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `翻譯文章描述為繁體中文，保持 155 字元以內：\n\n${data.description}` }
      ], 300);
      if (translatedDescription) translatedDescription = translatedDescription.trim();
    } catch (err) {
      console.warn(`    ⚠️ Description translation failed: ${err.message}`);
      translatedDescription = data.description;
    }
  }

  // Translate body
  let translatedBody;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      translatedBody = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `翻譯以下 Markdown 文章為繁體中文：\n\n${content}` }
      ]);
      if (!translatedBody) throw new Error('Empty response');
      console.log(`    Body: ${translatedBody.length} chars`);
      break;
    } catch (err) {
      if (attempt < retryCount) {
        console.warn(`    ⚠️ Attempt ${attempt + 1} failed, retrying...`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error(`    ❌ All attempts failed: ${err.message}`);
        return null;
      }
    }
  }

  // Build zh frontmatter
  const zhData = { ...data };
  zhData.title = translatedTitle || data.title;
  if (translatedDescription) zhData.description = translatedDescription;
  zhData.lang = 'zh-Hant';

  // Output
  const zhContent = matter.stringify(translatedBody, zhData);
  return { zhContent, title: zhData.title, description: zhData.description };
}

export async function autoTranslateIfNeeded(englishArticles, postsZhDir) {
  const rootDir = postsZhDir.replace(/[\\/]blog[\\/]posts-zh$/, '');
  const terms = loadTerminology(rootDir);
  console.log(`  Loaded ${Object.keys(terms).length} translation terms`);

  fs.mkdirSync(postsZhDir, { recursive: true });

  // Check which articles need translation
  const existingZh = new Set();
  if (fs.existsSync(postsZhDir)) {
    for (const f of fs.readdirSync(postsZhDir)) {
      if (f.endsWith('.md')) existingZh.add(f);
    }
  }

  const toTranslate = englishArticles.filter(p => !existingZh.has(p.filename));
  if (toTranslate.length === 0) {
    // Read existing zh articles
    const zhArticles = [];
    for (const f of existingZh) {
      const raw = fs.readFileSync(path.join(postsZhDir, f), 'utf-8');
      const { data, content } = matter(raw);
      if (!content.trim() && data.body) content = data.body;
      zhArticles.push({
        filename: f,
        slug: f.replace(/\.md$/, ''),
        data,
        content,
        category: data.category || 'bazi-astrology'
      });
    }
    console.log(`  All ${zhArticles.length} articles already translated`);
    return zhArticles;
  }

  console.log(`  Translating ${toTranslate.length} new articles...`);

  const systemPrompt = buildSystemPrompt(terms);
  const zhArticles = [];

  for (const post of toTranslate) {
    console.log(`  Translating: ${post.slug}`);
    const result = await translateArticle(systemPrompt, post.data, post.content, post.filename);
    if (result) {
      const outputPath = path.join(postsZhDir, post.filename);
      fs.writeFileSync(outputPath, result.zhContent, 'utf-8');
      console.log(`    ✅ Saved: posts-zh/${post.filename}`);
      zhArticles.push({
        filename: post.filename,
        slug: post.slug,
        data: { ...post.data, title: result.title, description: result.description, lang: 'zh-Hant' },
        content: matter(result.zhContent).content,
        category: post.category
      });
    }
    // Rate limit delay
    if (toTranslate.indexOf(post) < toTranslate.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Also load existing zh articles
  for (const f of existingZh) {
    if (!toTranslate.find(p => p.filename === f)) {
      const raw = fs.readFileSync(path.join(postsZhDir, f), 'utf-8');
      const { data, content } = matter(raw);
      if (!content.trim() && data.body) content = data.body;
      zhArticles.push({
        filename: f,
        slug: f.replace(/\.md$/, ''),
        data,
        content,
        category: data.category || 'bazi-astrology'
      });
    }
  }

  return zhArticles;
}
