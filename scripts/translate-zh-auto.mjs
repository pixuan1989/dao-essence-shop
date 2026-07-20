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

const DASHSCOPE_MODEL = 'qwen3.5-plus';
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const TRANSLATE_TIMEOUT_MS = 300000; // 5 minutes (was 180s, long articles with tables need more)

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

async function callDashScope(messages, maxTokens = 8000, timeoutMs = TRANSLATE_TIMEOUT_MS) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
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
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`DashScope API error ${res.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
  } finally {
    clearTimeout(timeoutId);
  }
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
    let retryCount = 0;
    const maxRetries = 3;
    while (retryCount < maxRetries) {
      try {
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000));
        translatedDescription = await callDashScope([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `翻譯文章描述為繁體中文，保持 155 字元以內：\n\n${data.description}` }
        ], 300, 600000); // 10 minutes timeout for description
        if (translatedDescription) {
          translatedDescription = translatedDescription.trim();
          break; // 翻译成功，跳出循环
        } else {
          console.warn(`    ⚠️ Description translation attempt ${retryCount + 1} returned empty`);
          retryCount++;
        }
      } catch (err) {
        console.warn(`    ️ Description translation attempt ${retryCount + 1} failed: ${err.message}`);
        retryCount++;
      }
    }
    if (!translatedDescription) {
      // 3 次都失败，保留英文原文作为兜底
      translatedDescription = data.description;
      console.warn(`    ⚠️ Description translation failed after ${maxRetries} attempts, keeping English original`);
    }
  }

  // Translate h1Title if present (always translate, even if same as title)
  let translatedH1Title;
  if (data.h1Title) {
    try {
      await new Promise(r => setTimeout(r, 1000));
      translatedH1Title = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `翻譯文章主標題（h1）為繁體中文，保持專業簡潔：\n\n${data.h1Title}` }
      ], 300);
      if (translatedH1Title) translatedH1Title = translatedH1Title.trim();
    } catch (err) {
      console.warn(`    ⚠️ h1Title translation failed: ${err.message}`);
      translatedH1Title = data.h1Title;
    }
  }

  // Translate seoDescription if present
  let translatedSeoDescription;
  if (data.seoDescription) {
    try {
      await new Promise(r => setTimeout(r, 1000));
      translatedSeoDescription = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `翻譯 SEO 描述為繁體中文，保持 155 字元以內，含關鍵字與行動號召：\n\n${data.seoDescription}` }
      ], 300);
      if (translatedSeoDescription) translatedSeoDescription = translatedSeoDescription.trim();
    } catch (err) {
      console.warn(`    ⚠️ seoDescription translation failed: ${err.message}`);
      translatedSeoDescription = data.seoDescription;
    }
  }

  // Translate imageAlt if present
  let translatedImageAlt;
  if (data.imageAlt) {
    try {
      await new Promise(r => setTimeout(r, 1000));
      translatedImageAlt = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `翻譯圖片替代文字為繁體中文，簡潔描述畫面：\n\n${data.imageAlt}` }
      ], 300);
      if (translatedImageAlt) translatedImageAlt = translatedImageAlt.trim();
    } catch (err) {
      console.warn(`    ⚠️ imageAlt translation failed: ${err.message}`);
      translatedImageAlt = data.imageAlt;
    }
  }

  // Translate body
  let translatedBody;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
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
  if (translatedH1Title) zhData.h1Title = translatedH1Title;
  if (translatedSeoDescription) zhData.seoDescription = translatedSeoDescription;
  if (translatedImageAlt) zhData.imageAlt = translatedImageAlt;
  zhData.lang = 'zh-Hant';
  // Ensure image field exists for build-blog.js compatibility
  zhData.image = zhData.image || zhData.featuredImage;

  // Translate FAQ if present
  if (data.faq && data.faq.length > 0 && data.faq_zh && data.faq_zh.length > 0) {
    // English article has faq_zh, copy it to zh article (both as faq_zh)
    zhData.faq = data.faq_zh; // zh page shows faq field directly
    zhData.faq_zh = data.faq_zh;
  } else if (data.faq && data.faq.length > 0) {
    // No faq_zh available — auto-translate FAQ
    try {
      const faqText = data.faq.map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`).join('\n\n');
      const translatedFaq = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `翻譯以下 FAQ 為繁體中文，保持 Q/A 格式對應：\n\n${faqText}` }
      ], 2000);

      if (translatedFaq) {
        // Parse translated FAQ back into structured format
        const faqLines = translatedFaq.split('\n').filter(l => l.trim());
        const zhFaq = [];
        let currentQ = null, currentA = null;
        for (const line of faqLines) {
          const qMatch = line.match(/^[QA]\d+\s*[:：]\s*(.*)/);
          if (qMatch) {
            if (currentQ && currentA) {
              zhFaq.push({ question: currentQ, answer: currentA });
            }
            if (line.match(/^Q/)) {
              currentQ = qMatch[1].trim();
              currentA = null;
            } else if (line.match(/^A/) && currentQ) {
              currentA = qMatch[1].trim();
            }
          } else if (currentQ && !currentA && line.trim()) {
            currentQ += ' ' + line.trim();
          } else if (currentA) {
            currentA += ' ' + line.trim();
          }
        }
        if (currentQ && currentA) {
          zhFaq.push({ question: currentQ, answer: currentA });
        }

        if (zhFaq.length === data.faq.length) {
          zhData.faq = zhFaq;
          zhData.faq_zh = zhFaq;
          console.log(`    FAQ: ${zhFaq.length} items translated`);
        } else {
          console.warn(`    ⚠️ FAQ translation count mismatch (expected ${data.faq.length}, got ${zhFaq.length}), keeping original`);
          zhData.faq = data.faq;
          zhData.faq_zh = data.faq_zh || [];
        }
      }
    } catch (err) {
      console.warn(`    ⚠️ FAQ translation failed: ${err.message}`);
      zhData.faq = data.faq;
      zhData.faq_zh = data.faq_zh || [];
    }
  }

  // Post-process: fix common untranslated terms and artifacts
  function postProcess(text) {
    if (!text) return text;
    return text
      .replace(/Wu Xing/g, '五行')
      .replace(/wu xing/gi, '五行')
      .replace(/practitioners/g, '從業者')
      .replace(/practitioner/g, '從業者');
  }
  zhData.title = postProcess(zhData.title);
  if (zhData.description) zhData.description = postProcess(zhData.description);
  if (zhData.h1Title) zhData.h1Title = postProcess(zhData.h1Title);
  if (zhData.seoDescription) zhData.seoDescription = postProcess(zhData.seoDescription);
  if (zhData.imageAlt) zhData.imageAlt = postProcess(zhData.imageAlt);
  const processedBody = postProcess(translatedBody);

  // Output
  const zhContent = matter.stringify(processedBody, zhData);
  return { zhContent, title: zhData.title, description: zhData.description };
}

export async function autoTranslateIfNeeded(englishArticles, postsZhDir) {
  const rootDir = postsZhDir.replace(/[\\/]blog[\\/]posts-zh$/, '');
  const ROOT_DIR = rootDir; // 兼容可能的旧代码引用
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
      data.image = data.image || data.featuredImage;
      if (!content.trim() && data.body) content = data.body;
      // Normalize ".zh" suffix to "-zh" to match generateSlug() in build-blog.js
      const rawSlug = f.replace(/\.md$/, '');
      const slug = rawSlug.replace(/\.zh$/, '-zh');
      zhArticles.push({
        filename: f,
        slug,
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
      // Read back from saved file to get correct frontmatter (including translated FAQ)
      const savedRaw = matter(result.zhContent);
      savedRaw.data.image = savedRaw.data.image || savedRaw.data.featuredImage;
      zhArticles.push({
        filename: post.filename,
        slug: post.slug,
        data: savedRaw.data,
        content: savedRaw.content,
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
      // Normalize ".zh" suffix to "-zh" to match generateSlug() in build-blog.js
      const rawSlug = f.replace(/\.md$/, '');
      const slug = rawSlug.replace(/\.zh$/, '-zh');
      zhArticles.push({
        filename: f,
        slug,
        data,
        content,
        category: data.category || 'bazi-astrology'
      });
    }
  }

  return zhArticles;
}
