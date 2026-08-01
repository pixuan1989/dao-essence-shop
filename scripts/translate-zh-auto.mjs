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
import translate from 'google-translate-api';
import {translate as vitaletsTranslate} from '@vitalets/google-translate-api';

const DASHSCOPE_MODEL = 'qwen3.5-plus';
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const TRANSLATE_TIMEOUT_MS = 80000; // 5 minutes (was 180s, long articles with tables need more)

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

export function buildSystemPrompt(terms) {
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

// Strip a leaked instruction prefix from translated output (safety net against
// prompt echo / fallback returning the raw instruction-prefixed text).
function stripInstruction(text, instruction) {
  if (!text || !instruction) return text;
  const prefix = instruction.trim();
  if (text.startsWith(prefix)) return text.slice(prefix.length).trim();
  if (text.startsWith(instruction)) return text.slice(instruction.length).trim();
  return text;
}

// instruction is passed SEPARATELY from the content so the fallback path can
// return clean content without leaking the instruction string into the page.
async function translateField(systemPrompt, text, fieldName, instruction = '', timeoutMs = 8000) {
  if (!text) return null;

  const userContent = instruction ? `${instruction}\n\n${text}` : text;

  // Vercel build cannot reach DashScope (every call aborts), so skip straight to
  // Google Translate fallback to keep builds under the 45-minute limit. Google
  // fallback is proven working in the Vercel environment.
  if (process.env.DISABLE_DASHSCOPE) {
    try {
      const result = await vitaletsTranslate(userContent, { to: 'zh-TW' });
      return stripInstruction(result.text, instruction);
    } catch {
      return text;
    }
  }

  let translatedText;
  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount < maxRetries) {
    try {
      await new Promise(r => setTimeout(r, 800));
      translatedText = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ], 2000, timeoutMs);
      if (translatedText) {
        translatedText = stripInstruction(translatedText, instruction).trim();
        break;
      } else {
        console.warn(`    ️ ${fieldName} translation attempt ${retryCount + 1} returned empty`);
        retryCount++;
      }
    } catch (err) {
      console.warn(`    ⚠️ ${fieldName} translation attempt ${retryCount + 1} failed: ${err.message}`);
      retryCount++;
    }
  }

  if (!translatedText) {
    // 3 次都失败，用 Google Translate 兜底
    console.warn(`    ⚠️ ${fieldName} translation failed after ${maxRetries} attempts, trying Google Translate...`);
    try {
      const result = await vitaletsTranslate(userContent, { to: 'zh-TW' });
      translatedText = stripInstruction(result.text, instruction);
      console.log(`    ✅ ${fieldName} Google Translate fallback succeeded`);
    } catch (err) {
      console.warn(`    ⚠️ ${fieldName} Google Translate also failed: ${err.message}`);
      // 最后兜底：保留原文（不含指令前綴，避免指令洩漏到頁面）
      translatedText = text;
      console.warn(`    ⚠️ ${fieldName} keeping English original (instruction stripped)`);
    }
  }

  return translatedText;
}

// 结构化翻译 body（坑2 B方案根治）：标题只译文字保留 # 层级，代码块/表格原样不译，正文块逐段翻译
// 这样标题层级 100% 来自源文件，LLM 再也翻不丢 markdown 结构
async function translateBodyStructured(systemPrompt, content) {
  const lines = content.split('\n');
  let inFence = false;
  const blocks = [];
  let buf = null;
  const pushBuf = () => { if (buf) { blocks.push(buf); buf = null; } };
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      pushBuf();
      inFence = !inFence;
      blocks.push({ type: 'raw', text: line });
      continue;
    }
    if (inFence) { blocks.push({ type: 'raw', text: line }); continue; }
    const hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) { pushBuf(); blocks.push({ type: 'heading', level: hm[1], text: hm[2] }); continue; }
    if (line.trim().startsWith('|')) {
      if (buf && buf.type === 'raw') buf.text += '\n' + line;
      else { pushBuf(); buf = { type: 'raw', text: line }; }
      continue;
    }
    if (!line.trim()) { pushBuf(); blocks.push({ type: 'raw', text: '' }); continue; }
    if (!buf || buf.type !== 'translate') { pushBuf(); buf = { type: 'translate', text: line }; }
    else { buf.text += '\n' + line; }
  }
  pushBuf();
  const out = [];
  for (const b of blocks) {
    if (b.type === 'heading') {
      const t = await translateField(systemPrompt, b.text, 'Heading', '翻譯以下標題為繁體中文，只輸出翻譯結果（不要加 # 號）：', 8000);
      out.push(`${b.level} ${t || b.text}`);
    } else if (b.type === 'raw') {
      out.push(b.text);
    } else {
      const txt = b.text;
      if (!txt.trim()) { out.push(''); continue; }
      const bodyInstruction = '翻譯以下 Markdown 內容為繁體中文，保留列表/引用/格式與語氣：';
      const t = await translateField(systemPrompt, txt, 'Body', bodyInstruction, 8000);
      out.push(t || txt);
    }
  }
  return out.join('\n');
}

async function translateArticle(systemPrompt, data, content, filename, retryCount = 2) {
  // Translate title
  const translatedTitle = await translateField(
    systemPrompt,
    data.title,
    'Title',
    '翻譯文章標題為繁體中文，只輸出翻譯結果：',
    8000
  ) || data.title;

  // Translate description
  const translatedDescription = await translateField(
    systemPrompt,
    data.description,
    'Description',
    '翻譯文章描述為繁體中文，保持 155 字元以內：',
    8000
  ) || data.description;

  // Translate h1Title if present (always translate, even if same as title)
  const translatedH1Title = await translateField(
    systemPrompt,
    data.h1Title,
    'h1Title',
    '翻譯文章主標題（h1）為繁體中文，保持專業簡潔：',
    8000
  ) || data.h1Title;

  // Translate seoDescription if present
  const translatedSeoDescription = await translateField(
    systemPrompt,
    data.seoDescription,
    'seoDescription',
    '翻譯 SEO 描述為繁體中文，保持 155 字元以內，含關鍵字與行動號召：',
    8000
  ) || data.seoDescription;

  // Translate imageAlt if present
  const translatedImageAlt = await translateField(
    systemPrompt,
    data.imageAlt,
    'imageAlt',
    '翻譯圖片替代文字為繁體中文，簡潔描述畫面：',
    8000
  ) || data.imageAlt;

  // Translate body（结构化：保留标题层级/代码块/表格，逐块翻译正文）
  let translatedBody;
  try {
    translatedBody = await translateBodyStructured(systemPrompt, content);
  } catch (err) {
    console.error(`    ❌ Body structured translation failed: ${err.message}`);
    return null;
  }
  if (!translatedBody) {
    console.error(`    ❌ Body translation returned empty`);
    return null;
  }
  console.log(`    Body: ${translatedBody.length} chars`);

  // Build zh frontmatter
  const zhData = { ...data };
  zhData.title = translatedTitle || data.title;
  if (translatedDescription) zhData.description = translatedDescription;
  if (translatedH1Title) zhData.h1Title = translatedH1Title;
  if (translatedSeoDescription) zhData.seoDescription = translatedSeoDescription;
  if (translatedImageAlt) zhData.imageAlt = translatedImageAlt;
  zhData.lang = 'zh-Hant';
  // Ensure image field exists for build-blog.js compatibility
  zhData.image = data.image || data.featuredImage || zhData.featuredImage;
  if (!zhData.image && zhData.featuredImage) {
    zhData.image = zhData.featuredImage;
  }

  // Translate FAQ if present
  if (data.faq && data.faq.length > 0 && data.faq_zh && data.faq_zh.length > 0) {
    // English article has faq_zh, copy it to zh article (both as faq_zh)
    zhData.faq = data.faq_zh; // zh page shows faq field directly
    zhData.faq_zh = data.faq_zh;
  } else if (data.faq && data.faq.length > 0) {
    // No faq_zh available — auto-translate FAQ
    try {
      const faqText = data.faq.map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`).join('\n\n');
      const faqInstruction = '翻譯以下 FAQ 為繁體中文，保持 Q/A 格式對應：';
      const translatedFaq = await callDashScope([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${faqInstruction}\n\n${faqText}` }
      ], 2000);
      if (translatedFaq) translatedFaq = stripInstruction(translatedFaq, faqInstruction);

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
    // Check if translation file exists (partial translation)
    const outputPath = path.join(postsZhDir, post.filename);
    if (fs.existsSync(outputPath)) {
      // File exists, check if title is translated
      const raw = fs.readFileSync(outputPath, 'utf-8');
      const { data: existingData, content: existingContent } = matter(raw);
      // Check if title is still English (not translated)
      if (existingData.title === post.data.title) {
        console.log(`    ⚠️ Title not translated, translating only title...`);
        const translatedTitle = await translateField(
          systemPrompt,
          post.data.title,
          'Title',
          '翻譯文章標題為繁體中文，只輸出翻譯結果：',
          8000
        );
        if (translatedTitle) {
          existingData.title = translatedTitle;
          const newContent = matter.stringify(existingContent, existingData);
          fs.writeFileSync(outputPath, newContent, 'utf-8');
          console.log(`    ✅ Title updated`);
        }
      } else {
        console.log(`    ✅ Already translated`);
      }
      existingData.image = existingData.image || existingData.featuredImage;
      zhArticles.push({
        filename: post.filename,
        slug: post.slug,
        data: existingData,
        content: existingContent,
        category: existingData.category || 'bazi-astrology'
      });
      continue;
    }
    const result = await translateArticle(systemPrompt, post.data, post.content, post.filename);
    if (result) {
      const outputPath = path.join(postsZhDir, post.filename);
      fs.writeFileSync(outputPath, result.zhContent, 'utf-8');
      console.log(`    ✅ Saved: posts-zh/${post.filename}`);
      // Auto-commit to git
      try {
        const { execSync } = await import('child_process');
        execSync(`git add "${outputPath}"`, { stdio: 'pipe' });
        execSync(`git commit -m "feat: add zh translation for ${post.slug}"`, { stdio: 'pipe' });
        console.log(`    ✅ Committed to git`);
      } catch (err) {
        console.warn(`    ️ Git commit failed: ${err.message}`);
      }
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
