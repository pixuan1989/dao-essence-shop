/**
 * ============================================
 * BaZi Dayun + Liunian AI Analysis API
 * Vercel Serverless Function
 * ============================================
 * Receives chart data + specific dayun/liunian to analyze.
 * Returns AI-generated interpretation in EN or ZH.
 */

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_MODEL = 'qwen-turbo';

const STEM_WX = { '甲':'Wood','乙':'Wood','丙':'Fire','丁':'Fire','戊':'Earth','己':'Earth','庚':'Metal','辛':'Metal','壬':'Water','癸':'Water' };
const BRANCH_WX = { '子':'Water','丑':'Earth','寅':'Wood','卯':'Wood','辰':'Earth','巳':'Fire','午':'Fire','未':'Earth','申':'Metal','酉':'Metal','戌':'Earth','亥':'Water' };
const WX_EN_ZH = { 'Wood':'木','Fire':'火','Earth':'土','Metal':'金','Water':'水' };

const TEN_GODS_EN = {
    '比肩': { en: 'Friend (比肩)', desc: 'Self-reliance, independence, peers' },
    '劫财': { en: 'Rob Wealth (劫财)', desc: 'Financial volatility, competition' },
    '食神': { en: 'Eating God (食神)', desc: 'Talent, creativity, enjoyment' },
    '伤官': { en: 'Hurting Officer (伤官)', desc: 'Innovation, rebellion, brilliance' },
    '偏财': { en: 'Indirect Wealth (偏财)', desc: 'Unexpected income, social expansion' },
    '正财': { en: 'Direct Wealth (正财)', desc: 'Steady income, financial stability' },
    '七杀': { en: 'Seven Killings (七杀)', desc: 'Pressure, ambition, challenge' },
    '正官': { en: 'Direct Officer (正官)', desc: 'Career, reputation, authority' },
    '偏印': { en: 'Indirect Resource (偏印)', desc: 'Intuition, niche expertise' },
    '正印': { en: 'Direct Resource (正印)', desc: 'Education, mentors, support' }
};

const NZSC_EN = { '长生':'Birth','沐浴':'Bath','冠带':'Crown','临官':'Prosperity','帝旺':'Peak','衰':'Decline','病':'Illness','死':'Death','墓':'Grave','绝':'Extinction','胎':'Conception','养':'Nurture' };
const NZSC_ZH = { 'Birth':'長生','Bath':'沐浴','Crown':'冠帶','Prosperity':'臨官','Peak':'帝旺','Decline':'衰','Illness':'病','Death':'死','Grave':'墓','Extinction':'絕','Conception':'胎','Nurture':'養' };

// DGS lookup: [dm_stem_idx][other_stem_idx] -> ten god index
const DGS_TABLE = [
    [2,3,1,0,9,8,7,6,5,4],[3,2,0,1,8,9,6,7,4,5],
    [5,4,2,3,1,0,9,8,7,6],[4,5,3,2,0,1,8,9,6,7],
    [7,6,5,4,2,3,1,0,9,8],[6,7,4,5,3,2,0,1,8,9],
    [9,8,7,6,5,4,2,3,1,0],[8,9,6,7,4,5,3,2,0,1],
    [1,0,9,8,7,6,5,4,2,3],[0,1,8,9,6,7,4,5,3,2]
];
const TG_INDEX = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

function getTenGod(stemCn, dmCn) {
    var si = STEMS.indexOf(stemCn);
    var di = STEMS.indexOf(dmCn);
    if (si < 0 || di < 0) return null;
    return TG_INDEX[DGS_TABLE[di][si]];
}

function buildChartSummary(chart, lang) {
    var dm = chart.dayMaster;
    var dmWx = STEM_WX[dm] || '';
    var gender = chart.gender === 1 ? 'Male' : 'Female';
    var pillars = chart.pillars || [];
    var pText = pillars.map(function(p, i) {
        var labels = ['Year','Month','Day','Hour'];
        var sWx = STEM_WX[p.stem] || '';
        var bWx = BRANCH_WX[p.branch] || '';
        return labels[i] + ': ' + p.stem + p.branch + ' (' + sWx + '/' + bWx + ')';
    }).join('\n  ');

    var wxCount = chart.wxCount || {};
    var wxText = Object.entries(wxCount).map(function(e) { return e[0] + ': ' + e[1]; }).join(', ');

    return 'Day Master: ' + dm + ' (' + dmWx + ')\nGender: ' + gender + '\nPillars:\n  ' + pText + '\nFive Elements: ' + wxText;
}

function buildDayunPrompt(chart, dayunData, lang) {
    var isZh = lang && lang.startsWith('zh');
    var chartInfo = buildChartSummary(chart, lang);

    var dm = chart.dayMaster;
    var dyGan = dayunData.gan || '';
    var dyZhi = dayunData.zhi || '';
    var dyAge = dayunData.age || '';
    var dyYears = dayunData.years || '';
    var nzsc = dayunData.nzsc || '';
    var tg = getTenGod(dyGan, dm);
    var tgInfo = tg ? (TEN_GODS_EN[tg] || {}).en : dyGan;
    var dyWx = STEM_WX[dyGan] || '';
    var zhiWx = BRANCH_WX[dyZhi] || '';

    if (isZh) {
        return '你是一位擁有30年經驗的專業八字命理師。請分析以下大運階段。\n\n' +
            '## 命盤資料\n' + chartInfo + '\n\n' +
            '## 大運資料\n' +
            '- 大運天干：' + dyGan + '（' + (tg || '') + '）\n' +
            '- 大運地支：' + dyZhi + '\n' +
            '- 大運天干五行：' + (WX_EN_ZH[dyWx] || dyWx) + '，地支五行：' + (WX_EN_ZH[zhiWx] || zhiWx) + '\n' +
            '- 年齡範圍：' + dyAge + '（' + dyYears + '）\n' +
            '- 十二長生：' + nzsc + '\n\n' +
            '## 分析要求\n' +
            '1. 綜合判斷此大運的吉凶（好/中/差），給出簡明理由\n' +
            '2. 分析大運天干與日主的五行生剋關係\n' +
            '3. 結合大運地支的影響\n' +
            '4. 給出具體的運勢解讀（事業、財運、感情、健康各一句）\n\n' +
            '## 輸出格式（嚴格 JSON）\n' +
            '僅返回有效 JSON，不要任何其他文字：\n' +
            '{\n' +
            '  "verdict": "吉" 或 "中" 或 "凶",\n' +
            '  "summary": "2-3句話的運勢總結，用繁體中文，有理有據",\n' +
            '  "career": "事業運勢一句話，15-30字，用繁體中文",\n' +
            '  "wealth": "財運一句話，15-30字，用繁體中文",\n' +
            '  "love": "感情運勢一句話，15-30字，用繁體中文",\n' +
            '  "health": "健康提醒一句話，15-30字，用繁體中文"\n' +
            '}';
    }

    return 'You are a professional Chinese BaZi (Four Pillars of Destiny) master with 30 years of experience. Analyze this Major Life Cycle (Da Yun / 大運) period.\n\n' +
        '## Birth Chart\n' + chartInfo + '\n\n' +
        '## Da Yun (Major Cycle) Data\n' +
        '- Da Yun Stem: ' + dyGan + ' (Ten God: ' + tgInfo + ')\n' +
        '- Da Yun Branch: ' + dyZhi + '\n' +
        '- Stem Element: ' + dyWx + ', Branch Element: ' + zhiWx + '\n' +
        '- Age Range: ' + dyAge + ' (' + dyYears + ')\n' +
        '- Twelve Life Stages: ' + nzsc + '\n\n' +
        '## Analysis Requirements\n' +
        '1. Judge the overall fortune of this Da Yun period (Good / Neutral / Challenging)\n' +
        '2. Analyze the Five Elements interaction between Da Yun stem and Day Master\n' +
        '3. Consider the Da Yun branch influence\n' +
        '4. Provide specific readings for career, wealth, relationships, and health\n\n' +
        '## Output Format (STRICT JSON)\n' +
        'Return ONLY a valid JSON object, no other text:\n' +
        '{\n' +
        '  "verdict": "Good" or "Neutral" or "Challenging",\n' +
        '  "summary": "2-3 sentences summarizing this cycle\'s fortune. Be specific and grounded in the chart data. Write in plain English for a Western audience.",\n' +
        '  "career": "One sentence about career prospects, 15-30 words",\n' +
        '  "wealth": "One sentence about financial outlook, 15-30 words",\n' +
        '  "love": "One sentence about relationship prospects, 15-30 words",\n' +
        '  "health": "One sentence about health precautions, 15-30 words"\n' +
        '}';
}

function buildLiunianPrompt(chart, dayunData, liunianData, lang) {
    var isZh = lang && lang.startsWith('zh');
    var chartInfo = buildChartSummary(chart, lang);

    var dm = chart.dayMaster;
    var dyGan = dayunData.gan || '';
    var dyZhi = dayunData.zhi || '';
    var lyGan = liunianData.gan || '';
    var lyZhi = liunianData.zhi || '';
    var lyYear = liunianData.year || '';
    var lyTg = getTenGod(lyGan, dm);
    var lyTgInfo = lyTg ? (TEN_GODS_EN[lyTg] || {}).en : lyGan;
    var dyLyTg = getTenGod(lyGan, dyGan);
    var lyWx = STEM_WX[lyGan] || '';
    var lyZhiWx = BRANCH_WX[lyZhi] || '';
    var dyWx = STEM_WX[dyGan] || '';

    if (isZh) {
        return '你是一位擁有30年經驗的專業八字命理師。請分析以下流年。\n\n' +
            '## 命盤資料\n' + chartInfo + '\n\n' +
            '## 大運背景\n' +
            '- 大運：' + dyGan + dyZhi + '（五行：' + (WX_EN_ZH[dyWx] || dyWx) + '）\n\n' +
            '## 流年資料\n' +
            '- 流年：' + lyYear + '年 ' + lyGan + lyZhi + '\n' +
            '- 流年天干十神：' + (lyTg || '') + '\n' +
            '- 流年五行：天干' + (WX_EN_ZH[lyWx] || lyWx) + '，地支' + (WX_EN_ZH[lyZhiWx] || lyZhiWx) + '\n' +
            '- 流年天干對大運天干的十神：' + (dyLyTg || '') + '\n\n' +
            '## 分析要求\n' +
            '1. 判斷此流年吉凶\n' +
            '2. 分析流年天干與日主、大運的關係\n' +
            '3. 給出具體的一年運勢解讀\n\n' +
            '## 輸出格式（嚴格 JSON）\n' +
            '僅返回有效 JSON，不要任何其他文字：\n' +
            '{\n' +
            '  "verdict": "吉" 或 "中" 或 "凶",\n' +
            '  "summary": "2-3句話的年度運勢總結，用繁體中文",\n' +
            '  "advice": "一句具體的年度建議，20-40字，用繁體中文"\n' +
            '}';
    }

    return 'You are a professional Chinese BaZi master with 30 years of experience. Analyze this Flow Year (Liu Nian / 流年).\n\n' +
        '## Birth Chart\n' + chartInfo + '\n\n' +
        '## Da Yun (Major Cycle) Context\n' +
        '- Da Yun: ' + dyGan + dyZhi + ' (Element: ' + dyWx + ')\n\n' +
        '## Flow Year Data\n' +
        '- Year: ' + lyYear + ' (' + lyGan + lyZhi + ')\n' +
        '- Ten God vs Day Master: ' + lyTgInfo + '\n' +
        '- Year Element: Stem ' + lyWx + ', Branch ' + lyZhiWx + '\n' +
        '- Ten God vs Da Yun Stem: ' + (dyLyTg || 'N/A') + '\n\n' +
        '## Analysis Requirements\n' +
        '1. Judge the year\'s fortune (Good / Neutral / Challenging)\n' +
        '2. Analyze the interaction between flow year and both the Day Master and Da Yun\n' +
        '3. Provide a concise annual outlook\n\n' +
        '## Output Format (STRICT JSON)\n' +
        'Return ONLY a valid JSON object, no other text:\n' +
        '{\n' +
        '  "verdict": "Good" or "Neutral" or "Challenging",\n' +
        '  "summary": "2-3 sentences summarizing this year\'s fortune. Be grounded in chart data. Write for a Western audience.",\n' +
        '  "advice": "One specific actionable piece of advice for this year, 20-40 words"\n' +
        '}';
}

async function callLLM(prompt, retries) {
    retries = retries || 2;
    for (var attempt = 0; attempt <= retries; attempt++) {
        try {
            var controller = new AbortController();
            var timeout = setTimeout(function() { controller.abort(); }, 30000);

            var res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + DASHSCOPE_API_KEY
                },
                body: JSON.stringify({
                    model: DASHSCOPE_MODEL,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0,
                    max_tokens: 800
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!res.ok) {
                var errText = await res.text();
                if (res.status === 429 && attempt < retries) {
                    await new Promise(function(r) { setTimeout(r, 2000); });
                    continue;
                }
                throw new Error('API error: HTTP ' + res.status);
            }

            var data = await res.json();
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Empty LLM response');
            }
            return data.choices[0].message.content.trim();
        } catch (err) {
            if (err.name === 'AbortError' && attempt < retries) {
                await new Promise(function(r) { setTimeout(r, 1000); });
                continue;
            }
            throw err;
        }
    }
    throw new Error('LLM call failed after retries');
}

function parseJSON(text) {
    try { return JSON.parse(text); } catch (e) {}
    var m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) { try { return JSON.parse(m[1].trim()); } catch (e) {} }
    var m2 = text.match(/\{[\s\S]*\}/);
    if (m2) { try { return JSON.parse(m2[0]); } catch (e) {} }
    throw new Error('Failed to parse LLM JSON response');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        var body = req.body;
        var type = body.type; // 'dayun' or 'liunian'
        var chart = body.chart;
        var lang = body.lang || 'en';

        if (!type || !chart || !chart.dayMaster) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!DASHSCOPE_API_KEY) {
            return res.status(500).json({ error: 'Analysis service not configured' });
        }

        var prompt;
        if (type === 'dayun') {
            prompt = buildDayunPrompt(chart, body.dayun || {}, lang);
        } else if (type === 'liunian') {
            prompt = buildLiunianPrompt(chart, body.dayun || {}, body.liunian || {}, lang);
        } else {
            return res.status(400).json({ error: 'Invalid type. Use "dayun" or "liunian".' });
        }

        var llmText = await callLLM(prompt);
        var result = parseJSON(llmText);

        return res.status(200).json({ success: true, result: result });
    } catch (e) {
        console.error('bazi-analysis error:', e.message || e);
        return res.status(500).json({ error: e.message || 'Analysis failed' });
    }
}
