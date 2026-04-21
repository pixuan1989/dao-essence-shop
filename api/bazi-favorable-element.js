/**
 * ============================================
 * BaZi Favorable Element API (Vercel Function)
 * 排盘 + LLM 喜用神分析
 * ============================================
 */

import paipan from '../bazi-calculator/paipan.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';

// 天干映射
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 天干五行
const STEM_WX = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};

// 地支五行
const BRANCH_WX = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};

// 地支藏干
const BRANCH_HIDDEN = {
    '子': ['癸'], '丑': ['己','癸','辛'], '寅': ['甲','丙','戊'],
    '卯': ['乙'], '辰': ['戊','乙','癸'], '巳': ['丙','戊','庚'],
    '午': ['丁','己'], '未': ['己','丁','乙'], '申': ['庚','壬','戊'],
    '酉': ['辛'], '戌': ['戊','辛','丁'], '亥': ['壬','甲']
};

// 五行英文
const WX_EN = {'木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water'};

/**
 * 构建传给 LLM 的结构化数据
 */
function buildBaziData(rt, gender) {
    const dayStem = STEMS[rt.ctg[2] % 10];
    const dayWx = STEM_WX[dayStem];
    const genderText = gender === 1 ? 'Male' : 'Female';

    // 四柱
    const pillars = [];
    for (let i = 0; i < 4; i++) {
        const stem = STEMS[rt.ctg[i] % 10];
        const branch = BRANCHES[rt.cdz[i] % 12];
        pillars.push({ stem, branch, stemWx: STEM_WX[stem], branchWx: BRANCH_WX[branch], hidden: BRANCH_HIDDEN[branch].map(s => s + '(' + STEM_WX[s] + ')') });
    }

    // 五行统计
    const wxCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    for (let i = 0; i < 4; i++) {
        wxCount[STEM_WX[STEMS[rt.ctg[i] % 10]]]++;
        wxCount[BRANCH_WX[BRANCHES[rt.cdz[i] % 12]]]++;
    }
    // 藏干也算入
    for (let i = 0; i < 4; i++) {
        const branch = BRANCHES[rt.cdz[i] % 12];
        for (const hidden of BRANCH_HIDDEN[branch]) {
            wxCount[STEM_WX[hidden]]++;
        }
    }

    const wxEnCount = {};
    for (const [k, v] of Object.entries(wxCount)) {
        wxEnCount[WX_EN[k]] = v;
    }

    return {
        dayStem,
        dayWx,
        dayWxEn: WX_EN[dayWx],
        gender: genderText,
        pillars,
        wxCount,
        wxEnCount,
        nwx: rt.nwx || []
    };
}

/**
 * LLM Prompt - 判断喜用神 + 生成白话解读
 */
function buildPrompt(data) {
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
  "explanation": "A 2-3 sentence plain English explanation of WHY this element is favorable. Use everyday language, no jargon. Example: 'Your chart has too much Metal energy, making you prone to stress. Adding Water helps Metal flow smoothly and brings balance.'",
  "lifeAdvice": ["3 practical, actionable life tips based on the favorable element, each 15-25 words"],
  "luckyColors": ["3 colors that correspond to the favorable element in Five Elements theory"],
  "luckyDirections": ["2 directions that correspond to the favorable element"],
  "avoidElement": "The element to avoid",
  "avoidElementZh": "Chinese character of element to avoid"
}`;
}

/**
 * Call OpenAI API
 */
async function callLLM(prompt) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1000
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.choices[0].message.content.trim();
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
        const { birth_year, birth_month, birth_day, birth_hour, gender } = req.body;

        // Validate
        if (!birth_year || !birth_month || !birth_day || gender === undefined) {
            return res.status(400).json({ error: 'Missing required fields: birth_year, birth_month, birth_day, gender' });
        }

        const yy = parseInt(birth_year);
        const mm = parseInt(birth_month);
        const dd = parseInt(birth_day);
        const hh = parseInt(birth_hour);
        const xb = parseInt(gender); // 1=male, 2=female (paipan convention)

        // Basic range validation
        if (yy < 1900 || yy > 2100 || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
            return res.status(400).json({ error: 'Invalid date range' });
        }
        if (hh < -1 || hh > 23) {
            return res.status(400).json({ error: 'Invalid hour (-1 for unknown)' });
        }
        if (xb !== 1 && xb !== 2) {
            return res.status(400).json({ error: 'Gender must be 1 (male) or 2 (female)' });
        }

        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: 'LLM service not configured' });
        }

        // Step 1: Calculate BaZi chart using paipan.js
        let rt;
        try {
            const p = new paipan();
            p.pdy = true;
            rt = p.fatemaps(xb, yy, mm, dd, hh, 0, 0);
            if (!rt) {
                return res.status(500).json({ error: 'BaZi calculation failed' });
            }
        } catch (e) {
            console.error('Paipan error:', e);
            return res.status(500).json({ error: 'BaZi calculation error' });
        }

        // Step 2: Build structured data
        const baziData = buildBaziData(rt, xb);

        // Step 3: Call LLM for favorable element analysis
        const prompt = buildPrompt(baziData);
        const llmResponse = await callLLM(prompt);
        const analysis = parseLLMResponse(llmResponse);

        // Step 4: Return combined result
        return res.status(200).json({
            success: true,
            chart: {
                pillars: baziData.pillars.map((p, i) => ({
                    position: ['Year', 'Month', 'Day', 'Hour'][i],
                    stem: p.stem,
                    branch: p.branch,
                    stemElement: p.stemWx,
                    branchElement: p.branchWx,
                    hiddenStems: BRANCH_HIDDEN[p.branch]
                })),
                dayMaster: baziData.dayStem,
                dayMasterElement: baziData.dayWx,
                dayMasterElementEn: baziData.dayWxEn,
                wxCount: baziData.wxEnCount
            },
            analysis
        });
    } catch (e) {
        console.error('Favorable element error:', e);
        return res.status(500).json({ error: e.message || 'Internal server error' });
    }
}
