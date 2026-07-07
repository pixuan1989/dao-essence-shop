/**
 * generate-bazi-report.cjs
 * 
 * 八字AI报告生成脚本
 * 讀取排盤數據 → 調 qwen3.7-max 分段生成 → 填入HTML模板 → 渲染PDF → 可選發郵件
 * 
 * 用法（本地測試）：node api/generate-bazi-report.cjs --sample
 * 用法（生產用於 webhook）：require('./generate-bazi-report.cjs')
 * 
 * 專業術語 : 大白話 = 3 : 7
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ─── 加載排盤引擎（服務端運行） ───
const paipanPath = path.join(__dirname, '..', 'bazi-calculator', 'paipan.js');
const paipanCode = fs.readFileSync(paipanPath, 'utf8')
  .replace('"use strict";', '')
  .replace('window.p = new paipan();', '');
vm.runInThisContext(paipanCode, { filename: 'paipan.js' });

// ─── 載入命理大師知識庫 ───
// 核心知識庫（AI歸納後的精華，按章節）
const coreKnowledgePath = path.join(__dirname, '..', 'prompts', 'bazi-core-knowledge.json');
const coreKnowledge = fs.existsSync(coreKnowledgePath)
  ? JSON.parse(fs.readFileSync(coreKnowledgePath, 'utf8'))
  : null;

// 原始知識庫（備用，如果核心庫缺失某章節則從此提取）
const masterKnowledge = fs.existsSync(path.join(__dirname, '..', 'prompts', 'bazi-master-knowledge.txt'))
  ? fs.readFileSync(path.join(__dirname, '..', 'prompts', 'bazi-master-knowledge.txt'), 'utf8')
  : '';

// 按節提取相關知識（避免全量注入 AI 產生噪聲）
function getSectionKnowledge(section) {
  // 关键词匹配提取（不依赖章节标题）
  const chapterKeywords = {
    '盲派特点': ['功神','宾主','体用','做功','盲派','宾主体用'],
    '天干理论': ['甲：','乙：','丙：','丁：','戊：','己：','庚：','辛：','壬：','癸：','天干','十神'],
    '干支理论': ['干支虚实','天干生克','干支互通','辰戌丑未','巳：变化','木分死活','地支','藏干'],
    '宫位类象': ['年柱','月柱','日柱','时柱','六亲','宫位','父母宫','夫妻宫','子女宫'],
    '正局反局': ['正局','反局','做功方向','局'],
    '断语集': ['父母','婚姻','事业','财运','妻','夫','财','官','杀','印','比劫','伤官','食神'],
    '断句集': ['断句','断语','批命技巧','口诀'],
    '身强弱': ['身强','身弱','大运','比劫运','印运','财运','官杀运','得令','得地','得势']
  };
  
  // Map sections to needed KB chapters (aligned with 天机阁 flow)
  const sectionMap = {
    overview: ['盲派总论','天干理论','地支理论','四柱宫位'],
    personality: ['盲派总论','天干理论','批命技巧'],
    geju: ['盲派总论','身强弱','地支理论','批命技巧'],
    shishen: ['天干理论','地支理论','十神总论','批命技巧'],
    dayun: ['盲派总论','正局反局','身强弱','地支理论','批命技巧'],
    liunian: ['地支理论','批命技巧','断语集'],
    lifa: ['盲派总论','断语集','批命技巧'],
    fortune: ['身强弱','盲派总论','批命技巧'],
    mangpai: ['盲派总论','正局反局','地支理论'],
    closing: ['盲派总论','批命技巧'],
  };
  
  const needed = sectionMap[section] || [];
  if (needed.length === 0) return '';

  // ── 优先从核心知识库读取（AI归纳后的精华）──
  if (coreKnowledge) {
    const parts = [];
    for (const chapter of needed) {
      const content = coreKnowledge[chapter];
      if (content && typeof content === 'string' && !content.startsWith('[')) {
        parts.push('【' + chapter + '】\n' + content);
      }
    }
    if (parts.length > 0) {
      const result = parts.join('\n\n');
      const limit = TEST_MODE ? 8000 : 32000;
      return '\n\n【此節相關的盲派命理知識（必讀）】\n' + result.slice(0, limit);
    }
  }

  // ── 备用：关键词匹配提取（核心库缺失时使用）──
  const lines = masterKnowledge.split('\n');
  const matchedLines = new Set();

  const allKeywords = new Set();
  for (const chapter of needed) {
    if (chapterKeywords[chapter]) {
      for (const kw of chapterKeywords[chapter]) {
        allKeywords.add(kw);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const kw of allKeywords) {
      if (line.includes(kw)) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        for (let j = start; j < end; j++) {
          matchedLines.add(lines[j]);
        }
        break;
      }
    }
  }

  if (matchedLines.size === 0) return '';

  const result = Array.from(matchedLines).join('\n');
  const limit = TEST_MODE ? 8000 : 32000;
  return '\n\n【此節相關的盲派命理知識（必讀）】\n' + result.slice(0, limit);
}

// ─── DashScope API 調用 ───
const DASHSCOPE_API = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
// 測試模式：用便宜模型 + 少章節 + 少知識注入，省錢
// 正式生成設為 false，用 qwen3.7-max + 全量知識
const TEST_MODE = process.argv.includes('--test');
const DASHSCOPE_MODEL = TEST_MODE ? 'qwen-max' : 'qwen3.7-max';

function getApiKey() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const m = env.match(/DASHSCOPE_API_KEY['"]?\s*=\s*['"]?([^\s'"]+)/);
    if (m) return m[1];
  }
  return process.env.DASHSCOPE_API_KEY || process.env.DASH_SCOPE_API_KEY;
}

async function callQwen(systemPrompt, userContent, options = {}) {
  const { temperature = 0.6, max_tokens = 4096, retries = 2, timeout = 300000, enable_thinking = true } = options;
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY not found');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const body = {
        model: DASHSCOPE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature,
        max_tokens
      };
      if (enable_thinking) {
        body.enable_thinking = true;
        body.thinking_budget = 8000;
      }
      const res = await Promise.race([
        fetch(DASHSCOPE_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), timeout)
        )
      ]);
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
      throw new Error(JSON.stringify(data));
    } catch (err) {
      if (attempt < retries) {
        console.log(`  API call failed, retry ${attempt + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  }
}

// ─── System Prompt 模板（只含核心規則，不含全量知識庫） ───
function buildSystemPrompt(section, sectionKnowledge = '') {
  const coreRules = '【知識庫約束（最高優先級）】你必須嚴格按照用戶消息中「此節相關的盲派命理知識（必讀）」內容進行分析和判斷。禁止發明任何命理理論或判斷規則。你的所有命理判斷必須能在知識庫中找到依據。如知識庫未覆蓋某情況，你必須明確說明「此判斷非來自知識庫，僅供參考」。\n\n【全局約束】分析必須全面覆蓋所有要求方面，禁止因任何原因省略內容。如某方面內容較長，允許超出字數限制，不可精簡帶過。\n\n你是一位頂尖的資深盲派命理師，從業30年，精通段建業、李清娟盲派體系、子平術、調候、通關、病藥學說、滴天髓。你的風格專業、直接、接地氣。用「你」稱呼命主。語氣像一位誠懇的分析師在給客戶做解析——該說好說好，該說壞說壞，不繞彎子。你精通盲派命理，以「做功」為核心論命，同時輔助判斷身強身弱。\n\n【盲派核心規則：身強弱判斷】\n1. 月令佔50%：得令為強，失令為弱\n2. 印比幫身佔30%：辰丑濕土不幫身反助水，只有戌未燥土可幫身\n3. 剋泄耗佔30%：看官殺財星食傷是否旺\n\n【身弱大運吉凶規則】\n- 行比劫運：比劫幫身將財才轉正化為財富 → 吉\n- 行印運：印星生身 → 吉\n- 行財運：財旺耗身 → 凶\n- 行官殺運：官殺克身 → 凶\n\n【辰丑濕土鐵律】辰丑為濕土內藏水，不助土反助水，生金晦火不克水。戌未為燥土才能助土。\n\n【注意】下面的「段建業命理知識庫」中的相關知識已在本節的用戶消息中提供，請以用戶消息中的盲派知識為準進行分析。';
  const antiFabrication = '【重要】只能根據八字原理做分析，絕對不能編造具體的個人生活經歷。可以用場景化描述，但不能說「你曾經...」「你之前...」這類虛構故事。';
  const noEmoji = '【格式】禁止使用任何Emoji符号、Unicode图标。只能用中文标点符号。';
  const formatRules = '【排版格式】禁止使用 #、##、###、#### 等markdown標題符號。章節分隔用【一、】【二、】或自然段落，不要用任何符號標記標題。輸出純文字內容，HTML格式會由模板自動處理。';
  
  const prompts = {
    // ── 命盤總覽（盲派：做功/象/賓主體用） ──
    overview: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '你正在寫「命盤總覽」。\n\n' +
      '用盲派思路分析：\n' +
      '1. 先看做功——此命局做了什麼功？做功效率高不高？\n' +
      '2. 再分賓主——哪些是命主自己的（主），哪些是環境的（賓）？\n' +
      '3. 再分體用——印比食為體（自己的能量），財官殺為用（想要的目標）？\n' +
      '4. 看象——刑沖合害表達了什麼象？\n' +
      '5. 看五行分布和格局特點。\n\n' +
      '開頭用【命局總評：吉／凶／中平】給出明確判斷。\n' +
      '控制在400字以內。',

    // ── 性格（仿天機閣口吻：直接分析，無標籤） ──
    personality: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '【絕對禁止重複】本章只講性格特質，禁止講事業建議、財運建議、感情建議，那些是後面章節的事。\n\n' +
      '寫「日主性格深度解讀」。\n\n' +
      '直接從日主特質切入，語氣像分析一個人的性格優缺點。\n' +
      '先說這個日主的天生優勢是什麼。\n' +
      '然後指出性格上的潛在問題。\n' +
      '最後給人生課題。\n\n' +
      '不要用【天生優勢】【需要注意】這類標籤。全部用自然段落。\n' +
      '控制在500字以內。',

    // ── 格局与五行分析（天机阁第3章） ──
    geju: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '【絕對禁止越界】本章只講格局判定、五行分布、身強弱，禁止講事業建議、財運建議、感情建議，那些是後面章節的事。\n' +
      '【絕對禁止重複】不要重複日主性格描述（那是上一章講過的），直接切入格局分析。\n\n' +
      '寫「格局與五行分析」。分三部分，每部分直接切入：\n\n' +
      '【一、格局判定】\n' +
      '判定格局（如食神格、正官格、七殺格等），用大白話解釋此格局的人生模式。\n' +
      '術語第一次出現時加大白話解釋。\n\n' +
      '【二、五行分布】\n' +
      '列出五行旺衰，用大白話說這種配置的性格和運勢特點。\n' +
      '五行失衡處如何補救。\n\n' +
      '【三、身強弱判定】\n' +
      '按盲派規則判定身強/身弱/中和，用大白話說對命主的意義。\n' +
      '身強弱如何影響大運吉凶。\n\n' +
      '控制在1000字以內。',

    // ── 十神（仿天機閣：只寫命盤中最顯著的幾個，每個深入分析） ──
    shishen: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '寫「十神逐一解讀」。\n\n' +
      '從此命盤中選出最顯著的3-5個十神來深入分析（不要10個全寫，只寫對命主影響最大的）。\n\n' +
      '寫之前先判斷：這個十神在此命盤中旺還是弱，影響力大不大。\n' +
      '只選最關鍵的幾個來寫。\n\n' +
      '每個十神的分析結構：\n' +
      '第一段：定義／象徵（這個十神代表什麼——兄弟姐妹、朋友、競爭等）。\n' +
      '第二段：性格影響（說明此十神旺或弱時對性格的具體影響——正面和負面都要說）。\n' +
      '第三段：不同宮位影響（在年柱/月柱/日支/時柱出現時的不同側重，用列表或分段）。\n\n' +
      '每個十神寫300-400字。語言像分析一個人的不同側面，自然流暢。\n' +
      '控制在1000字以內。',
    // 十神下已合併到十神上，不再分段
    shishenBottom: '',

    // ── 大运（盲派：做功/宾主体用） ──
    // ── 大运（盲派：做功/宾主体用） ──
    dayun: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '【绝对禁止越界】本章只讲大运干支分析和吉凶判定，禁止展开事业/财运/感情/健康的具体建议。\n' +
      '【绝对禁止重复】不要重复日主性格、格局特征，直接切入大运分析。\n\n' +
      '【绝对禁止分点】不要分【事业方面】【财运方面】【感情方面】【健康方面】等小标题或分段——那样像解读了两遍。所有分析必须融入连贯段落中一气呵成。\n\n' +
      '写「大运走势」。这是最重要的章节。\n\n' +
      '用盲派思路分析大运，但**必须先判断身强弱再分析大运吉凶**。\n\n' +
      '身强弱判断规则（通用原则，非本命结论，须按实际排盘自行判定）：\n' +
      '1. 辰、丑为湿土（内藏水）：当本命日主为土时，湿土不帮身反助水；但湿土能生金——辰丑生金适用于所有八字，分析五行流通时须计入生金之力。\n' +
      '2. 未、戌为燥土：脆金、不生物，分析时须与湿土严格区分。\n' +
      '3. 请严格依据本命实际四柱、月令、藏干、五行分布，自行判定身强身弱，禁止套用任何预设结论或假设具体日主（如「己土」「壬水」）。\n\n' +
      '身弱大运吉凶铁律：\n' +
      '- 行比劫运 → **吉**\n' +
      '- 行印运 → 吉\n' +
      '- 行财运 → 凶\n' +
      '- 行食伤运 → 泄身或综合评判\n\n' +
      '分析从排盘引擎给出的所有大运。每个大运用连贯段落写，天干地支融合在一起说：\n\n' +
      '【XX运 XX-XX岁】吉／凶\n' +
      '第一段：一句有冲击力的话定性，然后连贯分析——天干是什么十神、地支藏干有哪些、干支组合对原局做功的影响。\n' +
      '第二段：综合判断吉凶理由（融入段落），以及这步大运最需要注意的1-2件事。\n\n' +
      '语言连贯，一气呵成，不要分【天干分析】【地支分析】两点——那样像解读了两遍。\n\n' +
      '【格式示例（好的写法）】\n' +
      '【戊辰运 68-77岁】吉\n' +
      '天干戊土劫财帮身，朋友同辈助力多；地支辰为湿土不帮身反助水，但天干戊土主导。此运事业上合作机会多但需防朋友夺财，财运上收入增加但支出也大，感情上伴侣关系稳定但需防外人介入，健康上注意肾脏泌尿系统。整体吉，但需谨记「君子爱财取之有道」。\n\n' +
      '【格式示例（坏的写法——禁止这样写）】\n' +
      '【戊辰运 68-77岁】吉\n' +
      '天干戊土劫财帮身...\n' +
      '事业方面：...\n' +
      '财运方面：...\n' +
      '感情方面：...\n' +
      '健康方面：...\n\n' +
      '控制在1200字以内。',
    // ── 流年（近5年，天机阁流程） ──
    liunian: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '寫「近五年流年運勢」。只分析從今年開始的連續5年，每年獨立分開寫。\n\n' +
      '每年格式：\n' +
      '年份 · 天干五行\n' +
      '【概述】流年干支與原局的合/沖/刑/害，全年氛圍。\n' +
      '【事業財運】具體的機會與風險。\n' +
      '【感情生活】感情上的機遇與注意事項。\n' +
      '【總結】一句提醒。\n\n' +
      '術語第一次出現時加大白話解釋。\n' +
      '控制在1000字以內。',

    // ── 事业·财运·感情（合并天机阁第7章） ──
    lifa: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji +
      '【本报告唯一展开事业/财运/感情的章节】前面的章节（性格、格局、大运）都只讲本质，不展开具体建议。本章是唯一展开这些内容的地方，必须详细。\n' +
      '【绝对禁止重复】不要重复日主性格描述、格局特征，直接给出具体的事业/财运/感情建议。\n\n' +
      '写「事业·财运·感情」。分三个子节：\n\n' +
      '【事業方面】\n' +
      '適合什麼類型的事業（具體行業），發展黃金期在哪個年齡段，最大優勢和最大坑。給2條具體建議。\n\n' +
      '【財運方面】\n' +
      '財富模式（正財型還是偏財型），財運爆發期在哪步大運，理財最大風險。給2條具體建議。\n\n' +
      '【感情方面】\n' +
      '對感情的態度和優勢，配偶大概是什麼類型，感情上最容易出的問題。給2條具體建議。\n\n' +
      '術語第一次出現時加大白話解釋。禁止堆砌術語。\n' +
      '控制在1500字以內。',

    // ── 開運指南（仿天機閣：含飲食運動建議） ──
    fortune: coreRules + ' ' + formatRules + ' ' + antiFabrication + noEmoji + 
      '寫「開運指南」。\n\n' +
      '先1句說明此命五行喜忌。\n\n' +
      '然後逐項列出：\n' +
      '· 最佳方位（給出具體方向）\n' +
      '· 幸運顏色（給出具體色系）\n' +
      '· 行業選擇（給出具體行業建議）\n' +
      '· 貴人屬相（給出具體生肖）\n' +
      '· 開運月份（給出具體農曆月份）\n' +
      '· 日常生活建議（飲食、運動方面的建議）\n\n' +
      '最後1句寄語。語言簡潔實用。\n' +
      '控制在450字以內。',

    // ── 盲派做功（保留為差異化） ──
    mangpai: 
      '你是一位精通盲派八字（段建業體系）的命理師。只談做功不談旺衰。\n\n' +
      '先判斷賓主：主=日柱+時柱，賓=年柱+月柱。然後找體用：體=比劫/印/食，用=財/官/殺/傷。\n\n' +
      '按以下格式：\n\n' +
      '【做功鏈條】描述干支作用關係。\n' +
      '→ 這代表你的人生模式是...\n\n' +
      '【做功類型】制用/化用/生用/合用/墓用。\n' +
      '→ 這代表你做事的風格是...\n\n' +
      '【做功效率】高/中/低+百分比，參考合制效率表和刑沖穿制效率表。\n' +
      '→ 這代表你的能量轉化率...\n\n' +
      '【功神與廢神】功神是哪個干支，廢神是哪個。\n' +
      '→ 你的核心優勢來自...需要警惕的是...\n\n' +
      '【發動時間】什麼大運或流年激活做功。\n' +
      '→ 給你的建議...\n\n' +
      '控制在700字以內。禁止Emoji。',

    // ── 結語（使用簡化提示，不含知識庫，減少API負擔） ──
    closing: '你是一位資深命理師，正在寫一份八字報告的結語。語氣平靜有力，像臨別贈言。控制在100字以內。禁止Emoji。' + antiFabrication + noEmoji + 
      '寫「結語」。2-3句話，平靜有力，像臨別贈言。不需要吉凶判斷。控制在100字以內。'
  };
  // 将本节相关知识库加到 System Prompt 最前面（最高优先级）
  const basePrompt = prompts[section] || coreRules;
  const fullPrompt = sectionKnowledge 
    ? '【盲派命理知识库（本节相关，必须严格遵守，禁止发明理论）】\n' + sectionKnowledge + '\n\n' + basePrompt
    : basePrompt;
  return fullPrompt;
}

// ─── 構建用戶Prompt（含八字數據 + 盲派預分析 + 該節相關知識） ───
function buildUserPrompt(section, baziData, blindSchoolAnalysis = '') {
  const {
    name = '用戶', gender = '男',
    yearGan = '庚', yearZhi = '午',
    monthGan = '甲', monthZhi = '申',
    dayGan = '甲', dayZhi = '子',
    hourGan = '壬', hourZhi = '申',
    birthDate = '1990年8月15日',
    birthHour = '申時 (15:00-17:00)',
    wuxing = '金0 水0 木0 火0 土0',
    dayun = '', currentDayun = '',
    shenSha = '', qiyun = '',
    liunian = '',
    cangGanYear = '', cangGanMonth = '', cangGanDay = '', cangGanHour = ''
  } = baziData;

  const baziIntro = `命主資訊：
姓名：${name}
性別：${gender}
出生：${birthDate} ${birthHour}
八字：${yearGan}${yearZhi}  ${monthGan}${monthZhi}  ${dayGan}${dayZhi}  ${hourGan}${hourZhi}
日主：${dayGan}
五行分布：${wuxing || '待推算'}
藏干：年柱${baziData.cangGanYear||''} 月柱${baziData.cangGanMonth||''} 日柱${baziData.cangGanDay||''} 時柱${baziData.cangGanHour||''}
藏干十神（排盤引擎計算）：年柱${baziData.shishenYear||'無'} 月柱${baziData.shishenMonth||'無'} 日柱${baziData.shishenDay||'無'} 時柱${baziData.shishenHour||'無'}
當前大運：${currentDayun}
起運：${qiyun || '待推算'}
${shenSha ? '神煞：'+shenSha : ''}
${dayun ? '\n大運列表（排盤引擎計算，請以此為準）：\n'+dayun : ''}
${liunian ? '\n近五年流年（排盤引擎計算，干支已起好，請直接沿用，禁止自行推算）：\n'+liunian : ''}

五行生克規則（通用，適用於所有八字）：辰、丑為濕土，能生金（濕土生金），且當日主為土時不幫身反助水；未、戌為燥土，脆金不生物。分析五行流通與日主強弱時須嚴格區分濕土與燥土。

${blindSchoolAnalysis}`;

  const sectionRequests = {
    overview: `${baziIntro}\n\n請寫「命盤總覽」。用盲派思路：看做功、看象、看刑沖合害。分析賓主（日時為主，年月為賓）、體用（印比食為體，財官殺為用）、做功方式與效率。也說說五行分布和格局特點。\n\n【身強弱判定】：請嚴格根據上方提供的四柱、五行分布、藏干、日主，自行判定身強/身弱/中和，並簡述判斷依據（得令、得地、得勢）。禁止套用任何預設結論或假設某個具體日主。開頭用【命局總評：吉/凶/中平】。`,
    personality: `${baziIntro}\n\n請寫「性格深度解讀」。直接分析日主特質，先說天生優勢，再說需要注意的方面，最後給人生課題。用自然段落，不要用標籤分割。語言像天機閣——「你天生...」「然而...」「記住...」。`,
    fourPillars: `${baziIntro}\n\n請寫「格局與五行分析」。分析格局成敗、納音含義、五行流通。用盲派思維看做功。`,
    shishen: `${baziIntro}\n\n請寫「十神解讀」。從此命盤中選出最顯著的3-5個十神深入分析。每個十神：定義象徵→性格影響→宮位側重。不要10個全寫，只寫對命主影響最大的。`,
    dayun: `${baziIntro}

請寫「大運走勢」。

重要提示：分析每一步大運吉凶前，請先依據上方排盤數據（四柱、五行、藏干、日主）判定本命身強/身弱/中和。身強與身弱的大運喜忌相反——身弱喜印比（幫身）、忌財官殺（耗克）；身強則反之。請嚴格根據本命實際的身強弱來分析每一步大運，禁止套用任何預設的「身弱/身強」結論，也禁止假設某個具體日主（如「己土」「壬水」等）。

用盲派思路分析大運：看每步大運的干支對原局做功的影響——是加強了做功還是破壞了做功？刑沖合害引動了什麼？用賓主體用來判斷每步大運的吉凶。

分析從排盤引擎給出的所有大運（步數以列表中為準）。每個大運的格式：
【XX運 XX-XX歲】

**天干分析**（必須分析天干十神對事業/財運/感情/健康的具體影響）：
  事業方面：直接說天干十神對事業的具體影響（如「戊土比劫幫身，事業上有貴人相助」）。
  財運方面：直接說天干十神對財運的具體影響。
  感情方面：直接說天干十神對感情的具體影響。
  健康方面：直接說天干十神對健康的具體影響。

**地支分析**（必須分析地支藏干+地支與命局的關系）：
  地支藏干：說明此地支藏了哪些天干（如「辰藏戊乙癸」），這些藏干對命主的影響。
  地支與命局的關系：是否有合/沖/刑/害？如有，說明具體影響（如「辰酉合，引動子女宮」）。
  地支對事業/財運/感情/健康的具體影響：直接說，不要籠統。

**天干+地支綜合判斷**：
  天干和地支的綜合影響是什麼？是加強還是減弱？給出具體的吉凶判斷和理由。

當前大運加倍篇幅，分事業/財運/感情/健康四方面詳寫。
語言直接有力，凶運要說清楚凶在哪方面。`,
    liunian: baziIntro + '\n\n請寫「近五年流年運勢」。上方「近五年流年」已列出干支（排盤引擎計算），請直接沿用這5個干支，每年按：干支與原局關系+事業+財運+感情+注意事項分析，禁止自行推算或修改流年干支。',
    geju: baziIntro + '\n\n請寫「格局與五行分析」。分三部分：格局判定（術語加大白話解釋）、五行分布、身強弱判定。禁止堆砌術語。',
    lifa: baziIntro + '\n\n請寫「事業·財運·感情」。分三子節：事業方面（適合行業+發展階段+建議）、財運方面（財富模式+爆發期+建議）、感情方面（感情態度+配偶類型+建議）。術語加大白話解釋。',
    fortune: baziIntro + '\n\n請寫「開運指南」。先說五行喜忌，然後列出方位/顏色/行業/貴人生肖/開運月份/日常建議。',
    mangpai: baziIntro + '\n\n請用盲派八字（段建業體系）分析此命的「做功」。分析做功鏈條/類型/效率/功神廢神/發動時間。每個環節說「這代表你...」。',
    closing: baziIntro + '\n\n請寫結語。2-3句平靜有力。不用吉凶判斷。'
  };
  return sectionRequests[section] || baziIntro;
}

// ─── 生成報告（核心函數） ───
async function generateReport(baziData) {
  console.log('\n===== BaZi AI Report Generation =====\n');
  console.log(`Subject: ${baziData.name || 'Zhang Mingde'}`);
  console.log(`BaZi: ${baziData.yearGan}${baziData.yearZhi} ${baziData.monthGan}${baziData.monthZhi} ${baziData.dayGan}${baziData.dayZhi} ${baziData.hourGan}${baziData.hourZhi}\n`);

  // 盲派知識預分析：把知識庫的理論應用到此具體八字
  const blindSchoolAnalysis = analyzeBaziByBlindSchool(baziData);
  console.log('  [盲派預分析完成]\n' + blindSchoolAnalysis.split('\n').slice(0,8).join('\n') + '\n  ...\n');

  // 章節順序對齊天机阁，測試模式跑5章
  const sections = TEST_MODE
    ? ['overview', 'personality', 'geju', 'shishen', 'dayun', 'liunian', 'lifa', 'fortune', 'mangpai', 'closing']
    : ['overview', 'personality', 'geju', 'shishen',
       'dayun', 'liunian', 'lifa', 'fortune', 'mangpai', 'closing'];

  const contents = {};
  for (const section of sections) {
    console.log(`  - 生成中 ${section}...`);
    try {
      // 按節注入相關知識（避免全量95KB塞給AI）
      const sectionKnowledge = getSectionKnowledge(section);
      const options = (() => {
        // 各章节 token 上限：内容越复杂给越多
        const tokenMap = {
          closing:  { temperature: 0.5,  max_tokens: 512,  enable_thinking: false, timeout: 60000 },
          overview: { temperature: 0.75, max_tokens: 4096 },
          personality: { temperature: 0.75, max_tokens: 4096 },
          geju: { temperature: 0.75, max_tokens: 4096 },
          shishen: { temperature: 0.75, max_tokens: 6144 },
          dayun:  { temperature: 0.3, max_tokens: 8192 },
          liunian: { temperature: 0.75, max_tokens: 6144 },
          lifa: { temperature: 0.75, max_tokens: 8192 },
          fortune: { temperature: 0.75, max_tokens: 4096 },
          mangpai: { temperature: 0.75, max_tokens: 6144 },
        };
        return tokenMap[section] || { temperature: 0.75, max_tokens: 8192 };
      })();
      const content = await callQwen(
        buildSystemPrompt(section, sectionKnowledge),
      buildUserPrompt(section, baziData, blindSchoolAnalysis),
        options
      );
      contents[section] = content;
      console.log(`  OK ${section} (${content.length}字)`);
    } catch (err) {
      console.error(`  FAIL ${section}:`, err.message.substring(0, 100));
      contents[section] = `<p class="body-text">此章節生成失敗。</p>`;
    }
    // API限流間隔
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n===== AI內容生成完成 =====\n');
  return contents;
}

// ─── 盲派知識預分析：針對具體八字提取適用知識（增強版） ───
function analyzeBaziByBlindSchool(baziData) {
  const {
    yearGan, yearZhi, monthGan, monthZhi,
    dayGan, dayZhi, hourGan, hourZhi,
    cangGanYear, cangGanMonth, cangGanDay, cangGanHour,
    dayun = '', currentDayun = ''
  } = baziData;

  // 天干五行
  const ganWuXing = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  // 地支五行
  const zhiWuXing = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  // 濕土/燥土
  const wetEarth = ['辰','丑'];
  const dryEarth = ['戌','未'];
  // 干支虛實
  const realBranches = {jia:['寅','辰','子'],yi:['亥','卯','未'],bing:['午','寅','戌'],ding:['巳','卯','未'],wu:['午','戌','辰'],ji:['巳','未','丑'],geng:['申','辰'],xin:['酉','丑'],ren:['子','申','辰'],gui:['亥','酉','丑']};
  const isReal = (g,z) => {const k={甲:'jia',乙:'yi',丙:'bing',丁:'ding',戊:'wu',己:'ji',庚:'geng',辛:'xin',壬:'ren',癸:'gui'}[g];return k&&realBranches[k]&&realBranches[k].includes(z);};
  // 月令得令
  const deLing = {'甲':{'寅':'長生(得令)','卯':'帝旺(得令)','亥':'旺地(半得令)'},'乙':{'寅':'旺地(半得令)','卯':'祿地(得令)'},'丙':{'寅':'長生(得令)','巳':'帝旺(得令)','午':'旺地(半得令)'},'丁':{'巳':'祿地(得令)','午':'帝旺(得令)'},'戊':{'寅':'長生(得令)','巳':'祿地(得令)'},'己':{'巳':'旺地(半得令)','午':'帝旺(得令)'},'庚':{'申':'帝旺(得令)','酉':'祿地(得令)'},'辛':{'申':'旺地(半得令)','酉':'帝旺(得令)'},'壬':{'申':'長生(得令)','子':'帝旺(得令)','亥':'旺地(半得令)'},'癸':{'子':'祿地(得令)','亥':'帝旺(得令)'}};

  // ═══ 第一部分：身強弱判斷（量化） ═══
  const dayWx = ganWuXing[dayGan] || '土';
  const yinGans = {木:['壬','癸'],火:['甲','乙'],土:['丙','丁'],金:['戊','己'],水:['庚','辛']}[dayWx] || [];
  const biGans = {木:['甲','乙'],火:['丙','丁'],土:['戊','己'],金:['庚','辛'],水:['壬','癸']}[dayWx] || [];
  const caiGans = {木:['戊','己'],火:['庚','辛'],土:['壬','癸'],金:['甲','乙'],水:['丙','丁']}[dayWx] || [];
  const guanGans = {木:['庚','辛'],火:['壬','癸'],土:['甲','乙'],金:['丙','丁'],水:['戊','己']}[dayWx] || [];
  const ssGans = {木:['丙','丁'],火:['戊','己'],土:['庚','辛'],金:['壬','癸'],水:['甲','乙']}[dayWx] || [];

  let score = 0;
  let strengthDetails = [];

  // 月令50%
  const monthStatus = (deLing[dayGan] && deLing[dayGan][monthZhi]) || '失令';
  if (monthStatus.includes('得令')) score += 50;
  else if (monthStatus.includes('半得令')) score += 25;
  strengthDetails.push('【月令50%】日主' + dayGan + '生' + monthZhi + '月(' + zhiWuXing[monthZhi] + ') -> ' + monthStatus + ' (得分:' + (monthStatus.includes('得令')?50:monthStatus.includes('半得令')?25:0) + '/50)');

  // 印比幫身30%
  const otherGans = [yearGan, monthGan, hourGan];
  let supportCount = 0;
  let supportDetails = [];
  for (const g of otherGans) { if (yinGans.includes(g)) { supportCount += 1; supportDetails.push(g + '(印)'); } }
  for (const g of otherGans) { if (biGans.includes(g)) { supportCount += 1; supportDetails.push(g + '(比劫)'); } }
  const allZhis = [yearZhi, monthZhi, dayZhi, hourZhi];
  for (const z of allZhis) {
    if (wetEarth.includes(z)) supportDetails.push(z + '(濕土不幫身反助水)');
    if (dryEarth.includes(z)) { supportCount += 0.5; supportDetails.push(z + '(燥土幫身)'); }
  }
  const supportScore = Math.min(30, Math.round(supportCount * 6));
  score += supportScore;
  strengthDetails.push('【印比幫身30%】幫身: ' + (supportDetails.length ? supportDetails.join(', ') : '無') + ' (得分:' + supportScore + '/30)');

  // 剋泄耗20%
  let drainScore = 0;
  let drainDetails = [];
  for (const g of otherGans) { if (guanGans.includes(g)) { drainScore += 2; drainDetails.push(g + '(官殺克)'); } }
  for (const g of otherGans) { if (caiGans.includes(g)) { drainScore += 2; drainDetails.push(g + '(財耗)'); } }
  for (const g of otherGans) { if (ssGans.includes(g)) { drainScore += 1.5; drainDetails.push(g + '(食傷泄)'); } }
  const drainFinal = Math.min(20, Math.round(drainScore));
  score -= drainFinal;
  strengthDetails.push('【剋泄耗20%】消耗: ' + (drainDetails.length ? drainDetails.join(', ') : '無') + ' (扣分:' + drainFinal + '/20)');

  const finalScore = Math.max(0, Math.min(100, score));
  const verdict = finalScore >= 60 ? '身強' : (finalScore >= 40 ? '身偏強/偏弱(臨界)' : '身弱');
  const isWeak = verdict.includes('弱');
  const xiji = isWeak ? '喜印比(同類),忌財官(異類)' : (finalScore >= 60 ? '喜財官(異類),忌印比(同類)' : '臨界狀態,需看大運引動');

  // ═══ 第二部分：賓主體用 ═══
  const binZhuLines = [
    '賓位(外部環境): 年柱' + yearGan + yearZhi + ' + 月柱' + monthGan + monthZhi,
    '主位(自己掌控): 日柱' + dayGan + dayZhi + ' + 時柱' + hourGan + hourZhi,
    '-> 年月爲賓: 祖上/父母/早年環境/社會背景',
    '-> 日時爲主: 自己/配偶/子女/晚年/內心世界'
  ];

  const tiList = [], yongList = [];
  const allGans4 = [yearGan, monthGan, dayGan, hourGan];
  for (const g of allGans4) {
    if (biGans.includes(g)) tiList.push(g + '(比劫)');
    else if (yinGans.includes(g)) tiList.push(g + '(印)');
    else if (ssGans.includes(g)) tiList.push(g + '(食傷-可作體)');
    else if (caiGans.includes(g)) yongList.push(g + '(財)');
    else if (guanGans.includes(g)) yongList.push(g + '(官殺)');
  }
  const tiYongLines = [
    '體(自己能量源): ' + (tiList.length ? tiList.join(', ') : '不明顯') + ' -> 能力/資源/依靠',
    '用(追求目標): ' + (yongList.length ? yongList.join(', ') : '不明顯') + ' -> 財富/地位/名聲',
    '-> 做功方式: 體去制/化/生/合/墓「用」, 就是你人生在做的事情'
  ];

  // ═══ 第三部分：做功鏈條 ═══
  const gongChains = [];
  if (dayZhi === '巳' && monthZhi === '申') gongChains.push('【合用】主位巳申合: 日支巳火印星 合 月支申金傷官 -> 印合傷官,用思想/技術制求財慾望');
  if (yearZhi === '巳' && monthZhi === '申') gongChains.push('【合用】賓位巳申合: 年支巳火 合 月支申金 -> 早年環境就有此結構');
  if ((hourGan === '戊' || hourGan === '己') && (monthGan === '壬' || monthGan === '癸')) gongChains.push('【制用】時干' + hourGan + '劫財 制 月干' + monthGan + '正財 -> 劫財奪財,靠競爭獲財');
  if ([dayZhi, hourZhi].includes('辰')) gongChains.push('【墓用】辰爲水庫 -> 收納財星之氣入庫,但辰濕土不幫身');
  if (dayZhi === '子' && yearZhi === '午') gongChains.push('【沖用】日支子水 沖 年支午火 -> 水火激戰,動盪中發展');

  // ═══ 第四部分：大運吉凶逐個判斷 ═══
  const dyLines = (dayun || '').split('\n').filter(l => l.trim());
  const dyList = [];
  for (const line of dyLines) {
    const m = line.match(/\[(\d+)\]\s*(\S)(\S)\s*\((\d+)-(\d+)./);
    if (m) dyList.push({idx:m[1], gan:m[2], zhi:m[3], start:m[4], end:m[5]});
  }

  // 十神判斷（算法計算，不用硬編碼表）
  const getShiShen = (dayG, otherG) => {
    const ganWx = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
    const ganYin = {甲:true,乙:false,丙:true,丁:false,戊:true,己:false,庚:true,辛:false,壬:true,癸:false};
    const dayWx = ganWx[dayG];
    const otherWx = ganWx[otherG];
    const sameYin = ganYin[dayG] === ganYin[otherG];
    if (dayWx === otherWx) return sameYin ? '比肩' : '劫財';
    // 生我者為印
    const shengMe = {木:'水',火:'木',土:'火',金:'土',水:'金'};
    if (shengMe[dayWx] === otherWx) return sameYin ? '偏印' : '正印';
    // 我生者為食傷
    const woSheng = {木:'火',火:'土',土:'金',金:'水',水:'木'};
    if (woSheng[dayWx] === otherWx) return sameYin ? '食神' : '傷官';
    // 克我者為官殺
    const keMe = {木:'金',火:'水',土:'木',金:'火',水:'土'};
    if (keMe[dayWx] === otherWx) return sameYin ? '七殺' : '正官';
    // 我克者為財
    const woKe = {木:'土',火:'金',土:'水',金:'木',水:'火'};
    if (woKe[dayWx] === otherWx) return sameYin ? '偏財' : '正財';
    return '?';
  };;

  const dayunResults = ['【大運吉凶逐個判斷】(基於身強弱: ' + verdict + ', 總分' + finalScore + '/100)', ''];
  if (dyList.length === 0) {
    dayunResults.push('(大運列表未能解析)');
  } else {
    for (const dy of dyList) {
      const ss = getShiShen(dayGan, dy.gan);
      const isBJ = ss === '比肩' || ss === '劫財';
      const isYin = ss === '偏印' || ss === '正印';
      const isCai = ss === '偏財' || ss === '正財';
      const isGuan = ss === '正官' || ss === '七殺';
      const isShiShang = ss === '食神' || ss === '傷官';
      let fortune = '', reason = '';
      if (isWeak) {
        if (isBJ) { fortune = '吉'; reason = dy.gan + '爲' + ss + ',幫身擔財'; }
        else if (isYin) { fortune = '吉'; reason = dy.gan + '爲' + ss + ',生身扶身'; }
        else if (isShiShang) { fortune = '凶'; reason = dy.gan + '爲' + ss + ',身弱忌食傷泄身'; }
        else if (isCai) { fortune = '凶'; reason = dy.gan + '爲' + ss + ',身弱不擔財'; }
        else if (isGuan) { fortune = '凶'; reason = dy.gan + '爲' + ss + ',身弱怕官殺克'; }
        else { fortune = '平'; reason = dy.gan + '爲' + ss + ',綜合評估'; }
        if (wetEarth.includes(dy.zhi)) reason += '; 地支' + dy.zhi + '濕土不幫身,天干主導仍爲' + fortune;
        if (dryEarth.includes(dy.zhi) && (isBJ || isYin)) reason += '; 地支' + dy.zhi + '燥土加成,' + fortune + '運更穩';
        // 地支藏干分析
        const zhiCang = {子:'癸',丑:'己辛癸',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
        const zhiShishen = {子:'比肩',丑:'偏印正印劫财',寅:'偏财七杀偏印',卯:'正财',辰:'劫财偏印正印',巳:'正印偏财七杀',午:'偏印比肩',未:'比肩偏印正财',申:'食神正官偏印',酉:'伤官',戌:'偏印食神偏印',亥:'正官偏财'};
        if (zhiCang[dy.zhi]) reason += '; 地支' + dy.zhi + '藏:' + zhiCang[dy.zhi] + '(' + zhiShishen[dy.zhi] + ')';
        // 地支与命局关系（合冲）
        const he = {子:['丑'],丑:['子'],寅:['亥','午'],亥:['寅','未'],卯:['戌'],戌:['卯'],辰:['酉'],酉:['辰'],巳:['申'],申:['巳'],午:['未'],未:['午']};
        const chong = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
        if (he[dy.zhi]) { const h = he[dy.zhi].find(z => [yearZhi,monthZhi,dayZhi,hourZhi].includes(z)); if (h) reason += '; 与' + h + '合'; }
        if (chong[dy.zhi]) { const c = chong[dy.zhi]; if ([yearZhi,monthZhi,dayZhi,hourZhi].includes(c)) reason += '; 与' + c + '冲(动)'; }
      } else {
        if (isBJ) { fortune = '凶(或平)'; reason = dy.gan + '爲' + ss + ',身強忌比劫爭奪'; }
        else if (isYin) { fortune = '凶(或平)'; reason = dy.gan + '爲' + ss + ',身強忌印再生'; }
        else if (isShiShang) { fortune = '吉'; reason = dy.gan + '爲' + ss + ',身強喜食傷泄秀'; }
        else if (isCai) { fortune = '吉'; reason = dy.gan + '爲' + ss + ',身強能擔財'; }
        else if (isGuan) { fortune = '吉'; reason = dy.gan + '爲' + ss + ',身強能任官殺'; }
        else { fortune = '平'; reason = dy.gan + '爲' + ss + ',綜合評估'; }
      }
      dayunResults.push('  ' + dy.gan + dy.zhi + '運(' + dy.start + '-' + dy.end + '歲): [' + fortune + '] ' + reason);
    }
  }

  // ═══ 第五部分：適用斷語 ═══
  const duanyu = [];
  if ((hourGan==='戊'||hourGan==='己'||yearGan==='戊'||yearGan==='己') && (monthGan==='壬'||monthGan==='癸'))
    duanyu.push('「比劫奪了財,當心妻有災」——天干比劫制財,感情/財運易有競爭');
  if ((dayZhi==='巳'||yearZhi==='巳') && monthZhi==='申') {
    // 巳申合：只有命盘透出官杀（甲乙木对己土日主）才能谈「制杀」
    const hasGuanSha = [yearGan,monthGan,hourGan].some(g => g==='甲'||g==='乙');
    if (hasGuanSha) {
      duanyu.push('「食神制殺,有一定職務」——巳申合接近食傷制殺邏輯（僅在命盘透官杀時適用）');
    }
    duanyu.push('「巳申合,制的效果好」——印合傷官/財星,靠腦力技術取財');
  }
  if (monthZhi==='申') {
    duanyu.push('「傷官主文章」——傷官在月令,主技術/才華/創業');
    duanyu.push('「內食傷,做企業的」——月令傷官,適合靠技術創業');
  }
  if (hourGan==='戊'||hourGan==='己') {
    duanyu.push('「劫財做功,最適合風險取財」——靠團隊競爭獲利');
    duanyu.push('「體力取財,做功之神是比肩/劫財/祿神」——此命劫財做功');
  }
  if ([dayZhi,hourZhi,yearZhi,monthZhi].some(z=>wetEarth.includes(z))) {
    duanyu.push('「辰丑爲濕土不幫身」——內藏水,助水不助土,削弱日主土根');
    duanyu.push('「辰丑濕土生金」——濕土能生金,適用於所有八字,滋養日主金氣');
    duanyu.push('「辰——不克水,晦火力大」——辰晦巳火,削弱印星');
  }
  if (isWeak) {
    duanyu.push('「身弱行比劫運將財才轉正,化爲財富」——行比劫/印運爲吉');
    duanyu.push('「身弱財虛透,不算窮人,但也不會很富」——財透但身弱擔財有限');
    duanyu.push('「一合財就要看身強身弱」——做功效率取決於能否擔得住');
    duanyu.push('「身弱喜印比,忌財官」——喜火土,忌金水');
  } else if (finalScore >= 60) {
    duanyu.push('「身強喜財官,忌印比」——喜金水,忌火土');
    duanyu.push('「身強能擔財官,富貴可期」——行財官運就能發揮');
  }

  // ═══ 構建輸出 ═══
  return [
    '【盲派預分析：針對此八字的深度解析（增強版）】',
    '',
    '═══ 一、身強弱判斷（量化計算） ═══',
    ...strengthDetails,
    '',
    '【最終判定】' + verdict + '（綜合得分 ' + finalScore + '/100）',
    '【五行喜忌】' + xiji,
    '',
    '═══ 二、賓主與體用分析 ═══',
    ...binZhuLines,
    '',
    ...tiYongLines,
    '',
    '═══ 三、核心做功鏈條 ═══',
    ...(gongChains.length > 0 ? gongChains : ['此命無明顯做功']),
    '',
    '═══ 四、大運吉凶逐個判斷 ═══',
    ...dayunResults,
    '',
    '═══ 五、適用盲派斷語（必讀！） ═══',
    ...duanyu,
    '',
    '═══ 六、綜合總結 ═══',
    '日主' + dayGan + '(' + dayWx + ')生' + monthZhi + '月(' + zhiWuXing[monthZhi] + '),綜合得分' + finalScore + '分,判定爲 **' + verdict + '**。',
    isWeak
      ? '核心策略: 身弱需借勢——行印比運時是人生黃金期,宜積極進取;行財官運時宜守不宜攻。'
      : '核心策略: 身強可獨當一面——行財官運時是黃金期,宜大展拳腳;行印比運時警惕懶散保守。',
    ''
  ].join('\n');
}

// ─── 將純文字轉為HTML（識別markdown標題，轉為美觀標題樣式） ───
function textToHtml(text) {
  if (!text) return '';
  // 清洗Emoji符號
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2500}-\u{257F}\u{2580}-\u{259F}\u{25A0}-\u{25FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}✅❌⚠️🌟🔮📌🔍🔹✔✗✓✘🎯💡]/gu, '');
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return `<p class="body-text">${text}</p>`;
  return lines.map(line => {
    const trimmed = line.trim();
    // 如果已經包含HTML標籤，直接返回
    if (/^</.test(trimmed)) return trimmed;

    // ── 識別markdown標題，轉為美觀標題樣式 ──
    // ### 標題 → 大標題（紅底金邊裝飾線）
    let m = trimmed.match(/^###+\s*(.+)$/);
    if (m) {
      return `<h3 class="report-h3">${m[1]}</h3>`;
    }
    // #### 標題 → 中等標題（左側紅線裝飾）
    m = trimmed.match(/^####+\s*(.+)$/);
    if (m) {
      return `<h4 class="report-h4">${m[1]}</h4>`;
    }
    // ⑴ ⑵ 或 一、二、 開頭 → 小標題（金點裝飾）
    m = trimmed.match(/^[⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽\u2460-\u2469\u2474-\u247D㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑一二三四五六七八九十]+[、:.）)]\s*(.+)$/);
    if (m) {
      return `<h4 class="report-h4">${trimmed}</h4>`;
    }

    // 如果是表格或列表等特殊格式，用div包裹
    if (/^[│┌┐└┘├┤┬┴┼═║]/.test(trimmed)) return `<div class="table-text">${trimmed}</div>`;
    // 加粗 **text** 和【標題】
    const formatted = trimmed
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/【(.+?)】/g, '<strong>【$1】</strong>');
    return `<p class="body-text">${formatted}</p>`;
  }).join('\n');
}

// ─── 填入HTML模板 ───
function fillTemplate(contents, baziData) {
  let html = fs.readFileSync(path.join(__dirname, '..', 'templates', 'bazi-report.html'), 'utf8');

  // 替換封面數據
  const data = {
    name: baziData.name || '用戶',
    gender: baziData.gender || '男',
    birthDate: baziData.birthDate || '1990年8月15日',
    birthHour: baziData.birthHour || '申時 (15:00-17:00)',
    yearGan: baziData.yearGan || '庚', yearZhi: baziData.yearZhi || '午',
    monthGan: baziData.monthGan || '甲', monthZhi: baziData.monthZhi || '申',
    dayGan: baziData.dayGan || '甲', dayZhi: baziData.dayZhi || '子',
    hourGan: baziData.hourGan || '壬', hourZhi: baziData.hourZhi || '申',
    // 藏干（天干）
    cangGanY: baziData.cangGanYear || '',
    cangGanM: baziData.cangGanMonth || '',
    cangGanD: baziData.cangGanDay || '',
    cangGanH: baziData.cangGanHour || '',
    // 藏干十神（排盘引擎直接提供，简写转全称）
    shishenY: baziData.shishenYear || '',
    shishenM: baziData.shishenMonth || '',
    shishenD: baziData.shishenDay || '',
    shishenH: baziData.shishenHour || '',
    date: (() => { const d = new Date(); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; })()
  };
  // 封面出生日期动态填充（修复：真实订单泄漏示例日期 張明德）
  const safeHourText = (data.birthHour || '').replace(/undefined/g, '').trim() || '子時';
  data.coverBirthCn = '西元' + (data.birthDate || '') + ' ' + safeHourText.split(' ')[0];
  data.coverBirthEn = (data.birthDate || '') + ' ' + safeHourText;
  data.date = (() => { const d = new Date(); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; })();

  // 基本替換（注意：先替換八字表，再替換內容，避免相互干擾）
  html = html
    .replace(/\{\{COVER_BIRTH_CN\}\}/g, data.coverBirthCn || '')
    .replace(/\{\{COVER_BIRTH_EN\}\}/g, data.coverBirthEn || '')
    // 封面四柱表格（之前写死为張明德盘，现改为动态注入）
    .replace(/\{\{COVER_YG\}\}/g, data.yearGan || '')
    .replace(/\{\{COVER_MG\}\}/g, data.monthGan || '')
    .replace(/\{\{COVER_DG\}\}/g, data.dayGan || '')
    .replace(/\{\{COVER_HG\}\}/g, data.hourGan || '')
    .replace(/\{\{COVER_YZ\}\}/g, data.yearZhi || '')
    .replace(/\{\{COVER_MZ\}\}/g, data.monthZhi || '')
    .replace(/\{\{COVER_DZ\}\}/g, data.dayZhi || '')
    .replace(/\{\{COVER_HZ\}\}/g, data.hourZhi || '')
    .replace(/\{\{COVER_CY\}\}/g, data.cangGanY || '')
    .replace(/\{\{COVER_CM\}\}/g, data.cangGanM || '')
    .replace(/\{\{COVER_CD\}\}/g, data.cangGanD || '')
    .replace(/\{\{COVER_CH\}\}/g, data.cangGanH || '');

  // 封面姓名（先生/女士）— 占位符动态注入（严禁写死）
  html = html.replace(/\{\{COVER_NAME_TITLE\}\}/g, `${data.name} ${data.gender === '男' ? '先生' : '女士'}`);

  // 封面四柱文字 — 占位符动态注入
  html = html.replace(/\{\{COVER_SIZHU\}\}/g, `${data.yearGan}${data.yearZhi}年 ${data.monthGan}${data.monthZhi}月 ${data.dayGan}${data.dayZhi}日 ${data.hourGan}${data.hourZhi}時`);

  // 页脚姓名 — 占位符动态注入
  html = html.replace(/\{\{COVER_NAME\}\}/g, data.name);

  // 替換命盤總覽頁的八字表格（{{OG_*}} 佔位符）
  html = html
    .replace(/\{\{OG_YEAR_GAN\}\}/g, data.yearGan)
    .replace(/\{\{OG_MONTH_GAN\}\}/g, data.monthGan)
    .replace(/\{\{OG_DAY_GAN\}\}/g, data.dayGan)
    .replace(/\{\{OG_HOUR_GAN\}\}/g, data.hourGan)
    .replace(/\{\{OG_YEAR_ZHI\}\}/g, data.yearZhi)
    .replace(/\{\{OG_MONTH_ZHI\}\}/g, data.monthZhi)
    .replace(/\{\{OG_DAY_ZHI\}\}/g, data.dayZhi)
    .replace(/\{\{OG_HOUR_ZHI\}\}/g, data.hourZhi)
    .replace(/\{\{OG_CANG_Y\}\}/g, data.cangGanY)
    .replace(/\{\{OG_CANG_M\}\}/g, data.cangGanM)
    .replace(/\{\{OG_CANG_D\}\}/g, data.cangGanD)
    .replace(/\{\{OG_CANG_H\}\}/g, data.cangGanH)
    .replace(/\{\{OG_SHISZHEN_Y\}\}/g, data.shishenY)
    .replace(/\{\{OG_SHISZHEN_M\}\}/g, data.shishenM)
    .replace(/\{\{OG_SHISZHEN_D\}\}/g, data.shishenD)
    .replace(/\{\{OG_SHISZHEN_H\}\}/g, data.shishenH);

  // ─── 注入AI內容到各章節（只注入12個核心章節） ───
  const sectionMap = {
    'ai-content-overview': 'overview',
    'ai-content-personality': 'personality',
    'ai-content-geju': 'geju',
    'ai-content-shishen': 'shishen',
    'ai-content-dayun': 'dayun',
    'ai-content-liunian': 'liunian',
    'ai-content-lifa': 'lifa',
    'ai-content-fortune': 'fortune',
    'ai-content-mangpai': 'mangpai',
    'ai-content-closing': 'closing'
  };

  for (const [id, sectionKey] of Object.entries(sectionMap)) {
    const aiText = contents[sectionKey];
    if (aiText) {
      // dayun 后处理：合并分点为连贯段落
      const dayunText = sectionKey === 'dayun' ? aiText.replace(/^天干分析：$/gm, '').replace(/^地支分析：$/gm, '').replace(/\n(事业方面|财运方面|感情方面|健康方面|应对建议)：/g, '。$1：') : aiText;
      const htmlContent = textToHtml(dayunText);
      // 替換 <div id="ai-content-xxx"></div>
      const regex = new RegExp(`<div id="${id}">\\s*<\\/div>`, 'g');
      html = html.replace(regex, `<div id="${id}">${htmlContent}</div>`);
    }
  }

  return html;
}

// ─── 渲染PDF ───
async function renderPDF(html, outputPath) {
  const puppeteer = require('puppeteer');
  console.log('  - HTML渲染中...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  try {
    const page = await browser.newPage();
    // 用 load 而非 networkidle0：避免因 Google Fonts CDN 超时导致渲染卡死
    // 系统已安装 fonts-noto-cjk，本地字体立即可用，无需等外部字体加载完成
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      displayHeaderFooter: false
    });
    
    console.log(`  OK PDF: ${outputPath}`);
    return outputPath;
  } finally {
    await browser.close();
  }
}

// ─── 主函數（支援直接執行） ───
async function main() {
  const args = process.argv.slice(2);
  
  // 使用範例數據（測試八字：1989-09-06 辰時，己巳 壬申 己巳 戊辰）
  const sampleData = {
    name: '用戶',
    gender: '男',
    birthDate: '1989年9月6日',
    birthHour: '辰時 (7:00-8:00)',
    yearGan: '己', yearZhi: '巳',
    monthGan: '壬', monthZhi: '申',
    dayGan: '己', dayZhi: '巳',
    hourGan: '戊', hourZhi: '辰',
    cangGanYear: '丙戊庚', cangGanMonth: '庚壬戊',
    cangGanDay: '丙戊庚', cangGanHour: '戊乙癸',
    // 藏干十神（排盘引擎計算）
    shishenYear: '偏印比肩食神', shishenMonth: '食神正财偏印',
    shishenDay: '偏印比肩食神', shishenHour: '比肩正官正财',
    wuxing: '金1 水1 木0 火2 土4（註：辰為濕土不助土反助水，實際幫身度低）',
    dayun: '  [1] 辛未 (11-20歲) 冠帶(吉)\n  [2] 庚午 (21-30歲) 臨官(大吉)\n  [3] 己巳 (31-40歲) 帝旺(大吉)\n  [4] 戊辰 (41-50歲) 衰(弱)\n  [5] 丁卯 (51-60歲) 病(弱)\n  [6] 丙寅 (61-70歲) 死(凶)\n  [7] 乙丑 (71-80歲) 墓(吉)\n  [8] 甲子 (81-90歲) 絕(凶)\n  [9] 癸亥 (91-100歲) 胎(平)',
    currentDayun: '己巳 (31-40歲)',
    shenSha: '天乙貴人、桃花',
    qiyun: '出生後9年9個月19天起運'
  };

  console.log('八字AI報告生成器 v1');
  console.log('模型：' + DASHSCOPE_MODEL + (TEST_MODE ? ' (测试模式，省钱)' : ' (Deep Thinking)') + '\n');

  // 生成AI內容
  const contents = await generateReport(sampleData);
  
  // 填入模板
  console.log('  - 填入HTML模板...');
  const html = fillTemplate(contents, sampleData);
  const htmlPath = path.join(__dirname, '..', 'output-report.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`  OK HTML: ${htmlPath}`);

  // 渲染PDF
  const pdfPath = path.join(__dirname, '..', 'output-report.pdf');
  await renderPDF(html, pdfPath);

  console.log('\n===== 完成 =====');
  console.log(`HTML: ${htmlPath}`);
  console.log(`PDF:  ${pdfPath}`);
}

// ─── 时辰索引(0-11) → 标准时间范围（子时跨日界 23:00-01:00） ───
function shichenRange(idx) {
  const i = ((idx % 12) + 12) % 12;
  if (i === 0) return '23:00-01:00';      // 子时 23:00-01:00
  const start = 2 * i - 1;
  const end = (2 * i + 1) % 24;
  const p = n => String(n).padStart(2, '0');
  return `${p(start)}:00-${p(end)}:00`;
}

// ─── 從生年月日時排盤（服務端調用 paipan.js） ───
function runPaipan(yy, mm, dd, hh, gender) {
  // 防御：hh 可能为空串/undefined/null/NaN，统一默认子时(0)
  const safeHh = (hh !== undefined && hh !== null && hh !== '' && !isNaN(parseInt(hh))) ? parseInt(hh) : 0;
  const xb = gender === '女' || gender === 'female' ? 1 : 0;
  const p = new paipan();
  const rt = p.fatemaps(xb, parseInt(yy), parseInt(mm), parseInt(dd), safeHh, 0, 0);
  if (!rt) throw new Error(`排盤失敗: ${yy}-${mm}-${dd}`);
  const HOUR_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  // 表单传入的是“时辰索引”(0-11)，直接取模即可。
  // 旧公式 Math.floor((h+1)/2) 是“小时→时辰”算法，对索引输入会算错（寅时=2 误判为丑时、申时=8 误判为辰时）。已修正。
  const hIdx = ((safeHh % 12) + 12) % 12;
  const WX_CN = ['金', '水', '木', '火', '土'];
  
  // 十神简写转全称
  // 注意：paipan 的 sss 缩写表为 ['印','卩','比','劫','伤','食','财','才','官','杀']
  // 索引6='财'=正财，索引7='才'=偏财。下方映射必须与之一致，曾误将 才/财 写反导致正偏财颠倒。
  const shishenFull = { '比':'比肩','劫':'劫财','食':'食神','伤':'伤官','才':'偏财','财':'正财','印':'正印','卩':'偏印','官':'正官','杀':'七杀' };
  function expandShishen(abbr) {
    if (!abbr) return '';
    return abbr.split('').map(c => shishenFull[c] || c).join('');
  }
  
  // 提取大運列表
  // 大运只排到 80 岁（截断超出 80 岁的运程）
  const dayunListFull = [];
  for (let k = 0; k < 9; k++) {
    const dy = rt.dy[k];
    if (!dy) break;
    dayunListFull.push({
      stem: dy.zfma,
      branch: dy.zfmb,
      startAge: dy.zqage,
      endAge: dy.zboz,
      nzs: dy.nzsc,
      // 流年（排盘引擎已计算，供AI直接使用，禁止AI自行推算）
      liunian: dy.ly ? dy.ly.map(l => ({ year: l.year, ganzhi: l.lye })) : []
    });
  }
  const dayunList = dayunListFull.filter(d => d.startAge <= 80);

  return {
    yearGan: rt.ctg[0], yearZhi: rt.cdz[0],
    monthGan: rt.ctg[1], monthZhi: rt.cdz[1],
    dayGan: rt.ctg[2], dayZhi: rt.cdz[2],
    hourGan: rt.ctg[3], hourZhi: rt.cdz[3],
    cangGanYear: rt.bctg.slice(0,3).filter(Boolean).join(''),
    cangGanMonth: rt.bctg.slice(3,6).filter(Boolean).join(''),
    cangGanDay: rt.bctg.slice(6,9).filter(Boolean).join(''),
    cangGanHour: rt.bctg.slice(9,12).filter(Boolean).join(''),
    // 藏干十神（bzcg）：年柱3个 + 月柱3个 + 日柱3个 + 时柱3个，简写转全称
    shishenYear: expandShishen(rt.bzcg.slice(0,3).join('')),
    shishenMonth: expandShishen(rt.bzcg.slice(3,6).join('')),
    shishenDay: expandShishen(rt.bzcg.slice(6,9).join('')),
    shishenHour: expandShishen(rt.bzcg.slice(9,12).join('')),
    hourName: HOUR_NAMES[hIdx],
    wuxingCount: rt.nwx,
    wuxingLabels: rt.nwx.map((n, i) => `${WX_CN[i]}${n}`).join('、'),
    dayunList,
    qiyun: rt.qyy_desc || '',
    shenSha: '天乙貴人',  // paipan 引擎有神煞數據後可擴展
    riZhuWangShuai: '',   // paipan 引擎有日主強弱後可擴展
  };
}

// ─── Webhook 調用入口（從訂單數據生成報告） ───
async function generateBaziReport(orderData) {
  const paipanResult = runPaipan(
    orderData.birthYear, orderData.birthMonth,
    orderData.birthDay, orderData.birthHour,
    orderData.gender
  );

  const shichenIdx = (((parseInt(orderData.birthHour, 10) % 12) + 12) % 12) || 0; // 时辰索引 0-11
  
  // 找出當前大運
  const currentAge = new Date().getFullYear() - parseInt(orderData.birthYear);
  let currentDayun = '';
  for (const dy of paipanResult.dayunList) {
    if (currentAge >= dy.startAge && currentAge <= dy.endAge) {
      currentDayun = `${dy.stem}${dy.branch} (${dy.startAge}-${dy.endAge}歲)`;
      break;
    }
  }
  if (!currentDayun && paipanResult.dayunList.length > 0) {
    currentDayun = `${paipanResult.dayunList[0].stem}${paipanResult.dayunList[0].branch} (${paipanResult.dayunList[0].startAge}-${paipanResult.dayunList[0].endAge}歲)`;
  }

  // 構建大運文字描述，供 AI 使用
  const dayunText = paipanResult.dayunList.map((dy, i) =>
    `  [${i+1}] ${dy.stem}${dy.branch} (${dy.startAge}-${dy.endAge}歲) ${dy.nzs}`
  ).join('\n');

  // 構建近五年流年文字（從排盤引擎取干支，禁止 AI 自行推算）
  const thisYear = new Date().getFullYear();
  const liunianMap = new Map();
  for (const dy of paipanResult.dayunList) {
    for (const ly of (dy.liunian || [])) {
      if (ly.year >= thisYear && !liunianMap.has(ly.year)) {
        liunianMap.set(ly.year, ly.ganzhi);
      }
    }
  }
  const liunianText = Array.from(liunianMap.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(0, 5)
    .map(([yr, gz]) => `  ${yr}年 ${gz}`)
    .join('\n');

  const baziData = {
    name: orderData.name || '用戶',
    gender: orderData.gender === 'female' || orderData.gender === '女' ? '女' : '男',
    birthDate: `${orderData.birthYear}年${orderData.birthMonth}月${orderData.birthDay}日`,
    birthHour: `${paipanResult.hourName || '子'}時 (${shichenRange(shichenIdx)})`,
    yearGan: paipanResult.yearGan, yearZhi: paipanResult.yearZhi,
    monthGan: paipanResult.monthGan, monthZhi: paipanResult.monthZhi,
    dayGan: paipanResult.dayGan, dayZhi: paipanResult.dayZhi,
    hourGan: paipanResult.hourGan, hourZhi: paipanResult.hourZhi,
    cangGanYear: paipanResult.cangGanYear,
    cangGanMonth: paipanResult.cangGanMonth,
    cangGanDay: paipanResult.cangGanDay,
    cangGanHour: paipanResult.cangGanHour,
    // 藏干十神（排盘引擎直接提供，无需算法计算）
    shishenYear: paipanResult.shishenYear,
    shishenMonth: paipanResult.shishenMonth,
    shishenDay: paipanResult.shishenDay,
    shishenHour: paipanResult.shishenHour,
    // 新增：完整排盤數據供 AI 分析
    wuxing: paipanResult.wuxingLabels,
    dayun: dayunText,
    liunian: liunianText,
    currentDayun,
    shenSha: paipanResult.shenSha,
    qiyun: paipanResult.qiyun
  };

  console.log(`[BaZi Report] 開始為 ${baziData.name} 生成報告 (${baziData.yearGan}${baziData.yearZhi} ${baziData.monthGan}${baziData.monthZhi} ${baziData.dayGan}${baziData.dayZhi} ${baziData.hourGan}${baziData.hourZhi})`);

  // 生成AI內容
  const contents = await generateReport(baziData);

  // 填入模板
  const html = fillTemplate(contents, baziData);
  const outId = orderData.checkoutId || `report_${Date.now()}`;
  const htmlPath = path.join(__dirname, '..', 'reports', `${outId}.html`);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);
  console.log(`  OK HTML: ${htmlPath}`);

  // 渲染PDF（puppeteer 不可用时降级为仅 HTML，邮件将附 HTML 版）
  const pdfPath = htmlPath.replace('.html', '.pdf');
  try {
    await renderPDF(html, pdfPath);
    console.log(`[BaZi Report] ✅ 報告生成完成: ${pdfPath}`);
  } catch (pdfErr) {
    console.error(`[BaZi Report] ⚠️ PDF 渲染失败（将退回 HTML 附件）: ${pdfErr.message}`);
  }

  return { htmlPath, pdfPath: fs.existsSync(pdfPath) ? pdfPath : null, baziData };
}

module.exports = { generateBaziReport, runPaipan, fillTemplate, shichenRange };

// 直接執行（node api/generate-bazi-report.cjs --sample）
if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ 生成失敗:', err.message);
    if (err.stack) console.error(err.stack.substring(0, 500));
    process.exit(1);
  });
}

