/**
 * 单独重跑某一章节的归纳
 * 用法：node prompts/reprocess-chapter.cjs "干支理论"
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const DASHSCOPE_API = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const DASHSCOPE_MODEL = 'qwen-max';
const API_KEY = env.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY;

if (!API_KEY) { console.error('❌ 缺少 DASHSCOPE_API_KEY'); process.exit(1); }

const rawText = fs.readFileSync(path.join(__dirname, 'bazi-master-knowledge.txt'), 'utf8');
const targetChapter = process.argv[2];

const chapters = {
  '盲派特点': { keywords: ['功神','宾主','体用','做功','盲派','宾主体用','放弃用神','放弃旺衰'], desc: '盲派核心思想' },
  '天干理论': { keywords: ['甲：','乙：','丙：','丁：','戊：','己：','庚：','辛：','壬：','癸：','天干理论','十天干'], desc: '十天干特性' },
  '干支理论': { keywords: ['干支虚实','天干生克','干支互通','辰戌丑未','巳：变化','木分死活','地支六合','三合','冲','穿','刑','破','墓'], desc: '地支关系+干支互通' },
  '宫位类象': { keywords: ['年柱','月柱','日柱','时柱','六亲类象','时间类象','空间类象','身体类象','物品类象','宫位诸象'], desc: '四柱宫位类象' },
  '正局反局': { keywords: ['正局','反局','做功方向','制用','化用','生用','合用','墓用','复合结构'], desc: '正局反局+做功结构' },
  '断语集': { keywords: ['父母','婚姻','事业','财运','妻','夫','子女','牢狱','死亡'], desc: '盲派断语' },
  '断句集': { keywords: ['断句','批命技巧','口诀','看八字','分富贵贫贱','应期'], desc: '批命实战技巧' },
  '身强弱': { keywords: ['身强','身弱','得令','得地','得势','月令','印比'], desc: '身强/身弱判断' },
  '盲派问答': { keywords: ['问：','答：','如何看','举例','实例'], desc: '段建业命理问答' }
};

if (!targetChapter || !chapters[targetChapter]) {
  console.error('用法: node reprocess-chapter.cjs "章节名"');
  console.error('可选章节:', Object.keys(chapters).join(', '));
  process.exit(1);
}

function splitIntoChunks(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChars;
    if (end < text.length) {
      const lastBreak = text.lastIndexOf('\n\n', end);
      if (lastBreak > start + maxChars * 0.5) end = lastBreak;
    }
    chunks.push(text.slice(start, end));
    start = end - Math.floor(maxChars * 0.1);
    if (start >= text.length) break;
  }
  return chunks;
}

function extractChapterContent(keywords) {
  const lines = rawText.split('\n');
  const matchedLines = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const kw of keywords) {
      if (line.includes(kw)) {
        const s = Math.max(0, i - 3), e = Math.min(lines.length, i + 4);
        for (let j = s; j < e; j++) matchedLines.add(lines[j]);
        break;
      }
    }
  }
  return Array.from(matchedLines).join('\n');
}

async function condenseChunk(prompt) {
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
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API 失败 (${resp.status}): ${err}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content.trim();
}

async function main() {
  const config = chapters[targetChapter];
  console.log(`🔄 重跑章节：「${targetChapter}」`);

  const rawContent = extractChapterContent(config.keywords);
  console.log(`   提取内容：${rawContent.length} 字符`);

  const MAX_INPUT = 25000;
  const chunks = splitIntoChunks(rawContent, MAX_INPUT);
  console.log(`   分 ${chunks.length} 块处理`);

  const condensedParts = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`   🤖 处理第 ${i + 1}/${chunks.length} 块...`);
    const prompt = `你是段建业盲派命理专家。以下是关于"${config.desc}"的原始讲课记录（第 ${i + 1}/${chunks.length} 部分）。

请仔细阅读并吸收核心方法论和关键判断规则，用精练专业语言整理成知识条目。
要求：1) 保留关键方法论和规则 2) 去掉重复和口语化 3) 输出2000-4000字 4) 纯文本无markdown代码块

原始内容：
---
${chunks[i]}
---`;
    const result = await condenseChunk(prompt);
    condensedParts.push(result);
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 2000));
  }

  // 拼接各块（不合并，避免超时）
  const result = condensedParts.join('\n\n---\n\n');
  console.log(`   ✅ 完成：${result.length} 字符`);

  // 更新 JSON 文件
  const jsonPath = path.join(__dirname, 'bazi-core-knowledge.json');
  const coreKnowledge = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  coreKnowledge[targetChapter] = result;
  fs.writeFileSync(jsonPath, JSON.stringify(coreKnowledge, null, 2), 'utf8');
  console.log(`   💾 已更新 ${jsonPath}`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
