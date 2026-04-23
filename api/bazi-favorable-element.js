/**
 * ============================================
 * BaZi Favorable Element API (Vercel Function)
 * 接收前端排盘数据 + LLM 喜用神分析
 * (paipan.js 排盘在前端完成，API 只做 LLM 分析)
 * ============================================
 */

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_MODEL = 'qwen-turbo';

// 天干五行
const STEM_WX = {'甲':'Wood','乙':'Wood','丙':'Fire','丁':'Fire','戊':'Earth','己':'Earth','庚':'Metal','辛':'Metal','壬':'Water','癸':'Water'};

// 地支五行
const BRANCH_WX = {'子':'Water','丑':'Earth','寅':'Wood','卯':'Wood','辰':'Earth','巳':'Fire','午':'Fire','未':'Earth','申':'Metal','酉':'Metal','戌':'Earth','亥':'Water'};

// 地支藏干
const BRANCH_HIDDEN = {
    '子': ['癸'], '丑': ['己','癸','辛'], '寅': ['甲','丙','戊'],
    '卯': ['乙'], '辰': ['戊','乙','癸'], '巳': ['丙','戊','庚'],
    '午': ['丁','己'], '未': ['己','丁','乙'], '申': ['庚','壬','戊'],
    '酉': ['辛'], '戌': ['戊','辛','丁'], '亥': ['壬','甲']
};

// 中文五行 → 英文
const WX_ZH_EN = {'木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water'};

/**
 * 从前端传来的排盘数据构建 LLM prompt 所需的结构
 * 前端传入: { pillars, dayMaster, gender, wxCount }
 */
function buildBaziData(chartData) {
    const dayWx = STEM_WX[chartData.dayMaster] || 'Unknown';
    const genderText = chartData.gender === 1 ? 'Male' : 'Female';

    // 重新计算英文五行的隐藏干信息
    const pillars = chartData.pillars.map(p => {
        const hiddenWxInfo = (BRANCH_HIDDEN[p.branch] || []).map(s => s + '(' + (STEM_WX[s] || '') + ')');
        return {
            stem: p.stem,
            branch: p.branch,
            stemWx: STEM_WX[p.stem] || '',
            branchWx: BRANCH_WX[p.branch] || '',
            hidden: hiddenWxInfo
        };
    });

    // 合并英文五元素计数（前端传的是英文 key）
    const wxEnCount = chartData.wxCount || { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };

    return {
        dayStem: chartData.dayMaster,
        dayWx: dayWx,
        dayWxEn: dayWx,
        gender: genderText,
        pillars,
        wxEnCount
    };
}

/**
 * LLM Prompt - 判断喜用神 + 生成白话解读
 */
function buildPrompt(data) {
    const lang = data.lang || 'en';
    const isZh = lang.startsWith('zh');

    if (isZh) {
        return `你是一位擁有30年經驗的專業八字命理師。請分析以下命盤並判斷喜用神。

## 命盤資料
- 日主：${data.dayStem}（${data.dayWx}，${data.dayWxEn}）
- 性別：${data.gender === 1 ? '男' : '女'}
- 四柱：
  ${data.pillars.map((p, i) => ['年柱','月柱','日柱','時柱'][i] + '：' + p.stem + p.branch + ' | 天干五行：' + p.stemWx + '，地支五行：' + p.branchWx + ' | 藏干：' + p.hidden.join('、')).join('\n  ')}
- 五行計數（天干+地支+藏干）：${JSON.stringify(data.wxEnCount)}

## 分析規則
1. 判斷日主強弱：檢查得令、得地、得勢
2. 檢查調候：冬生需火暖，夏生需水潤
3. 身強：喜克、泄、耗之五行
4. 身弱：喜生、扶之五行
5. 若強弱調整與調候衝突，極端季節優先考慮調候

## 輸出格式（嚴格 JSON）
僅返回有效的 JSON 物件，不要有任何其他文字：
{
  "dayMaster": "${data.dayStem}（${data.dayWx}）",
  "strength": "Strong 或 Weak",
  "favorableElement": "Wood 或 Fire 或 Earth 或 Metal 或 Water",
  "favorableElementZh": "木 或 火 或 土 或 金 或 水",
  "explanation": "用2-3句流暢的繁體中文解釋為什麼這個元素是你的喜用神。用日常語言，不要太專業的術語。",
  "lifeAdvice": ["3條基於喜用神的實用生活建議，每條15-25字，用繁體中文"],
  "luckyColors": ["3種對應喜用神的幸運色彩，用繁體中文"],
  "luckyDirections": ["2個對應喜用神的有利方位，用繁體中文"],
  "bestCareers": ["4個適合喜用神的職業領域，具體實用，用繁體中文"],
  "luckyAccessories": ["4種與喜用神相關的幸運配飾，包含水晶/手鍊建議，用繁體中文"],
  "desktopThemes": ["3個融合喜用神色彩與能量的桌面主題或居家裝飾建議，用繁體中文"],
  "avoidElement": "The element to avoid",
  "avoidElementZh": "應避免的五行中文名"
}`;
    }

    return `You are a professional Chinese BaZi (Four Pillars of Destiny) master with 30 years of experience. Analyze the following birth chart and determine the Favorable Element (喜用神).

## Birth Chart Data
- Day Master (日主): ${data.dayStem} (${data.dayWx}, ${data.dayWxEn})
- Gender: ${data.gender}
- Four Pillars (四柱):
  ${data.pillars.map((p, i) => ['Year','Month','Day','Hour'][i] + ': ' + p.stem + p.branch + ' | Stem Wx: ' + p.stemWx + ', Branch Wx: ' + p.branchWx + ' | Hidden Stems: ' + p.hidden.join(', ')).join('\n  ')}
- Five Elements Count (天干+地支+藏干): ${JSON.stringify(data.wxEnCount)}

## Analysis Rules
1. Determine Day Master strength: Check 得令 (month branch support), 得地 (hidden stems with root), 得势 (other stems support)
2. Check seasonal adjustment (调候): Winter birth needs Fire, Summer birth needs Water
3. For strong Day Master: Favorable elements are those that weaken it (克/泄/耗 - Control/Drain/Consume)
4. For weak Day Master: Favorable elements are those that strengthen it (生/帮 - Generate/Help)
5. If there's a conflict between strength adjustment and seasonal adjustment, prioritize seasonal adjustment for extreme seasons

## Output Format (STRICT JSON)
Return ONLY a valid JSON object with exactly these fields, no other text:
{
  "dayMaster": "${data.dayStem} (${data.dayWxEn})",
  "strength": "Strong or Weak",
  "favorableElement": "Wood or Fire or Earth or Metal or Water",
  "favorableElementZh": "木 or 火 or 土 or 金 or 水",
  "explanation": "A 2-3 sentence plain English explanation of WHY this element is favorable. Use everyday language, no jargon.",
  "lifeAdvice": ["3 practical, actionable life tips based on the favorable element, each 15-25 words"],
  "luckyColors": ["3 colors that correspond to the favorable element in Five Elements theory"],
  "luckyDirections": ["2 directions that correspond to the favorable element"],
  "bestCareers": ["4 career fields or job types that align with the favorable element. Be specific and practical, e.g. 'Education & Training' not 'Wood jobs'. Use everyday English."],
  "luckyAccessories": ["4 wearable/decorative items related to the favorable element. Include crystal/bracelet recommendations, e.g. 'Green Aventurine bracelet for Wood energy', 'Red Agate pendant for Fire energy'. Be specific with materials."],
  "desktopThemes": ["3 desktop wallpaper or home decor style suggestions that incorporate the favorable element's colors and energy, e.g. 'Forest green nature wallpaper with morning light' for Wood"],
  "avoidElement": "The element to avoid",
  "avoidElementZh": "Chinese character of element to avoid"
}`;
}

/**
 * Call Qwen API (DashScope, OpenAI-compatible) with retry
 */
async function callLLM(prompt, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);

            const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
                },
                body: JSON.stringify({
                    model: DASHSCOPE_MODEL,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 1000
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!res.ok) {
                const errText = await res.text();
                if (res.status === 429 && attempt < retries) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                if (res.status === 429) {
                    throw new Error('Analysis service is busy. Please try again in 30 seconds.');
                }
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Analysis service is not configured. Please contact support.');
                }
                throw new Error(`Analysis service error (HTTP ${res.status}). Please try again later.`);
            }

            const data = await res.json();
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('LLM returned empty response. Please try again.');
            }
            return data.choices[0].message.content.trim();
        } catch (err) {
            if (err.name === 'AbortError' && attempt < retries) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
            if (err.name === 'AbortError') {
                throw new Error('Analysis timed out. Please try again.');
            }
            throw err;
        }
    }
    throw new Error('Analysis failed after multiple attempts. Please try again later.');
}

/**
 * Parse LLM response, extract JSON
 */
function parseLLMResponse(response) {
    // Try direct parse
    try {
        return JSON.parse(response);
    } catch (e) {
        // Try extracting JSON from markdown code block
        const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
            try {
                return JSON.parse(match[1].trim());
            } catch (e2) {}
        }
        // Try finding JSON object
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e3) {}
        }
        throw new Error('Failed to parse LLM response as JSON');
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { chart } = req.body;

        // Validate chart data from frontend paipan.js
        if (!chart || !chart.pillars || !chart.dayMaster || chart.gender === undefined) {
            return res.status(400).json({ error: 'Missing chart data. Please calculate BaZi first.' });
        }

        if (!DASHSCOPE_API_KEY) {
            return res.status(500).json({ success: false, error: 'LLM service not configured. Please contact support.' });
        }

        // Step 1: Build structured data from frontend chart
        const lang = req.body.lang || 'en';
        const baziData = buildBaziData(chart);
        baziData.lang = lang;

        // Step 2: Call LLM for favorable element analysis
        const prompt = buildPrompt(baziData);
        const llmResponse = await callLLM(prompt);
        const analysis = parseLLMResponse(llmResponse);

        // Step 3: Return combined result
        return res.status(200).json({
            success: true,
            chart,
            analysis
        });
    } catch (e) {
        console.error('Favorable element error:', e.message || e);
        return res.status(500).json({ 
            success: false,
            error: e.message || 'Internal server error' 
        });
    }
}
