/**
 * 段建业盲派知识库预处理脚本
 * 功能：将 70 万字的原始讲课记录，按章节用 AI 归纳为核心知识库
 * 输出：bazi-core-knowledge.json
 *
 * 用法：node prompts/process-knowledge.js
 * 需要：.env.local 中配置 DASHSCOPE_API_KEY
 */

const fs = require('fs');
const path = require('path');

// 手动读取 .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    let val = trimmed.slice(idx + 1);
    // 去掉引号
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const DASHSCOPE_API = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const DASHSCOPE_MODEL = 'qwen-max';  // 归纳用便宜模型
const API_KEY = env.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY;

if (!API_KEY) {
  console.error('❌ 缺少 DASHSCOPE_API_KEY，请在 .env.local 中配置');
  process.exit(1);
}

// 读取原始知识库
const rawKnowledgePath = path.join(__dirname, 'bazi-master-knowledge.txt');
const rawText = fs.readFileSync(rawKnowledgePath, 'utf8');

// 9 个知识章节（对应 getSectionKnowledge 中的 chapterKeywords）
const chapters = {
  '盲派特点': {
    keywords: ['功神','宾主','体用','做功','盲派','宾主体用','放弃用神','放弃旺衰'],
    desc: '盲派核心思想：宾主体用、功神废神、做功、弃旺衰弃用神'
  },
  '天干理论': {
    keywords: ['甲：','乙：','丙：','丁：','戊：','己：','庚：','辛：','壬：','癸：','天干理论','十天干'],
    desc: '十天干特性、喜忌、实战案例'
  },
  '干支理论': {
    keywords: ['干支虚实','天干生克','干支互通','辰戌丑未','巳：变化','木分死活','地支六合','三合','冲','穿','刑','破','墓'],
    desc: '地支六合/三合/冲/穿/刑/破/墓，干支互通，辰戌丑未特性'
  },
  '宫位类象': {
    keywords: ['年柱','月柱','日柱','时柱','六亲类象','时间类象','空间类象','身体类象','物品类象','宫位诸象'],
    desc: '四柱宫位类象：六亲/时间/空间/身体/物品'
  },
  '正局反局': {
    keywords: ['正局','反局','做功方向','制用','化用','生用','合用','墓用','复合结构'],
    desc: '正局反局判断、做功结构分类（制用/化用/生用/合用/墓用）'
  },
  '断语集': {
    keywords: ['父母','婚姻','事业','财运','妻','夫','子女','牢狱','死亡'],
    desc: '盲派断语：父母/婚姻/事业/财运/子女等速断规则'
  },
  '断句集': {
    keywords: ['断句','批命技巧','口诀','看八字','分富贵贫贱','应期'],
    desc: '批命实战技巧、应期判断、富贵贫贱分级'
  },
  '身强弱': {
    keywords: ['身强','身弱','得令','得地','得势','月令','印比'],
    desc: '身强/身弱判断规则（辅助，盲派不主要看旺衰）'
  },
  '盲派问答': {
    keywords: ['问：','答：','如何看','举例','实例'],
    desc: '段建业命理问答九篇：实战疑难解答'
  }
};

// 从原始文本中提取某章节相关内容（关键词匹配 + 上下文）
function extractChapterContent(chapterName, keywords) {
  const lines = rawText.split('\n');
  const matchedLines = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const kw of keywords) {
      if (line.includes(kw)) {
        const start = Math.max(0, i - 3);
        const end = Math.min(lines.length, i + 4);
        for (let j = start; j < end; j++) {
          matchedLines.add(lines[j]);
        }
        break;
      }
    }
  }

  return Array.from(matchedLines).join('\n');
}

// 把长文本拆成块（有重叠，避免切断重要信息）
function splitIntoChunks(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChars;
    if (end < text.length) {
      // 尽量在段落边界切割
      const lastBreak = text.lastIndexOf('\n\n', end);
      if (lastBreak > start + maxChars * 0.5) {
        end = lastBreak;
      }
    }
    chunks.push(text.slice(start, end));
    start = end - Math.floor(maxChars * 0.1); // 10% 重叠
    if (start >= text.length) break;
  }
  return chunks;
}

// 调用 DashScope API 归纳内容（支持分块）
async function condenseWithAI(chapterName, chapterDesc, rawContent) {
  if (!rawContent || rawContent.trim().length < 100) {
    console.log(`  ⚠️  ${chapterName} 原始内容过少，跳过`);
    return '';
  }

  // qwen-max 输入限制约 30000 tokens ≈ 30000 中文字
  const MAX_INPUT = 25000;
  const chunks = splitIntoChunks(rawContent, MAX_INPUT);

  if (chunks.length > 1) {
    console.log(`   内容过大，分 ${chunks.length} 块处理（每块 ~${MAX_INPUT} 字符）`);
  }

  const condensedParts = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`   🤖 处理第 ${i + 1}/${chunks.length} 块...`);

    const prompt = `你是段建业盲派命理专家。以下是关于"${chapterDesc}"的原始讲课记录（第 ${i + 1}/${chunks.length} 部分，可能有截断）。

请仔细阅读并吸收其中的核心方法论、关键判断规则和重要案例，然后用精练的专业语言整理成知识条目。

要求：
1. 保留所有关键方法论和判断规则
2. 去掉重复内容、口语化表达
3. 保留重要案例但精简描述
4. 用专业、精练的语言输出，结构清晰
5. 输出字数控制在 2000-4000 字（中文）
6. 不要添加原文没有的规则或案例
7. 输出格式为纯文本，不要 markdown 代码块

原始内容（第 ${i + 1} 部分）：
---
${chunk}
---`;

    const payload = {
      model: DASHSCOPE_MODEL,
      messages: [
        { role: 'system', content: '你是段建业盲派命理专家，擅长将口语化讲课记录整理为精练的专业知识条目。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 6000
    };

    const resp = await fetch(DASHSCOPE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`API 调用失败 (${resp.status}): ${err}`);
    }

    const data = await resp.json();
    condensedParts.push(data.choices[0].message.content.trim());

    // 避免速率限制
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // 如果有多块，合并后再做一次最终归纳
  if (condensedParts.length > 1) {
    console.log(`   🤖 合并 ${condensedParts.length} 块结果，做最终归纳...`);
    const merged = condensedParts.join('\n\n==========\n\n');
    const finalPrompt = `以下是"${chapterDesc}"知识库的多个部分（由不同文本块归纳而来），可能包含重复内容。

请将其合并为一份完整、精练、无重复的核心知识库条目。

要求：
1. 合并重复的规则和案例
2. 保留所有独特的方法论和判断规则
3. 结构清晰，语言精练
4. 输出字数控制在 4000-7000 字（中文）
5. 输出格式为纯文本

待合并内容：
---
${merged}
---`;

    const payload = {
      model: DASHSCOPE_MODEL,
      messages: [
        { role: 'system', content: '你是段建业盲派命理专家，擅长合并和整理专业知识条目。' },
        { role: 'user', content: finalPrompt }
      ],
      temperature: 0.1,
      max_tokens: 8000
    };

    const resp = await fetch(DASHSCOPE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.log(`   ⚠️  合并归纳失败，${resp.status}，改用拼接方式保留各块精华`);
      // 合并失败，直接拼接各块精华（可能含少量重复，但比丢内容好）
      return condensedParts.join('\n\n---\n\n');
    }

    const data = await resp.json();
    return data.choices[0].message.content.trim();
  }

  return condensedParts[0];
}


// 主函数
async function main() {
  console.log('🔄 开始预处理段建业盲派知识库...');
  console.log(`📄 原始文件：${rawText.length} 字符\n`);

  const coreKnowledge = {};

  for (const [chapterName, config] of Object.entries(chapters)) {
    console.log(`📖 处理章节：「${chapterName}」`);
    console.log(`   关键词：${config.keywords.slice(0, 5).join('、')}...`);

    // 提取原始内容
    const rawContent = extractChapterContent(chapterName, config.keywords);
    console.log(`   提取原始内容：${rawContent.length} 字符`);

    if (rawContent.length < 100) {
      console.log(`   ⚠️  内容过少，跳过\n`);
      coreKnowledge[chapterName] = '';
      continue;
    }

    // AI 归纳
    console.log(`   🤖 调用 ${DASHSCOPE_MODEL} 归纳...`);
    try {
      const condensed = await condenseWithAI(chapterName, config.desc, rawContent);
      coreKnowledge[chapterName] = condensed;
      console.log(`   ✅ 归纳完成：${condensed.length} 字符\n`);
    } catch (err) {
      console.error(`   ❌ 归纳失败：${err.message}\n`);
      coreKnowledge[chapterName] = `[归纳失败：${err.message}]`;
    }

    // 避免速率限制
    await new Promise(r => setTimeout(r, 1000));
  }

  // 保存结果
  const outputPath = path.join(__dirname, 'bazi-core-knowledge.json');
  fs.writeFileSync(outputPath, JSON.stringify(coreKnowledge, null, 2), 'utf8');

  console.log('🎉 预处理完成！');
  console.log(`📦 输出文件：${outputPath}`);

  const totalCondensed = Object.values(coreKnowledge).reduce((sum, v) => sum + (v ? v.length : 0), 0);
  console.log(`📊 核心知识库总大小：${totalCondensed} 字符（${(totalCondensed / 10000).toFixed(1)} 万字）`);
}

main().catch(err => {
  console.error('❌ 脚本执行失败：', err);
  process.exit(1);
});
