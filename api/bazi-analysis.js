/**
 * ============================================
 * BaZi Dayun + Liunian AI Analysis API
 * Vercel Serverless Function
 * ============================================
 * Receives chart data + specific dayun/liunian to analyze.
 * Returns AI-generated interpretation in EN or ZH.
 */

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_MODEL = 'qwen-plus';

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
    [0,1,2,3,4,5,6,7,8,9],[1,0,3,2,5,4,7,6,9,8],
    [8,9,0,1,2,3,4,5,6,7],[9,8,1,0,3,2,5,4,7,6],
    [6,7,8,9,0,1,2,3,4,5],[7,6,9,8,1,0,3,2,5,4],
    [4,5,6,7,8,9,0,1,2,3],[5,4,7,6,9,8,1,0,3,2],
    [2,3,4,5,6,7,8,9,0,1],[3,2,5,4,7,6,9,8,1,0]
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
        // Auto-calculate Ten God for each pillar's heavenly stem vs Day Master
        var tg = p.tenGod || getTenGod(p.stem, dm);
        return labels[i] + ': ' + p.stem + p.branch + ' (' + sWx + '/' + bWx + ')' + (tg ? ' - Ten God: ' + tg : '');
    }).join('\n  ');

    var wxCount = chart.wxCount || {};
    // CRITICAL: Convert five elements to qualitative description only — never show raw numbers
    // This prevents the LLM from fabricating phrases like "五行4:4" or "水僅1"
    var wxOrder = ['Metal','Water','Wood','Fire','Earth'];
    var wxZhNames = { 'Metal':'金','Water':'水','Wood':'木','Fire':'火','Earth':'土' };
    var wxCounts = wxOrder.map(function(w) { return wxCount[w] || 0; });
    var maxWx = Math.max.apply(null, wxCounts);
    var minWx = Math.min.apply(null, wxCounts.filter(function(v) { return v > 0; }));
    var dominantWx = wxOrder.filter(function(w) { return wxCount[w] === maxWx && maxWx > 0; }).map(function(w) { return wxZhNames[w] || w; });
    var weakWx = wxOrder.filter(function(w) { return wxCount[w] === minWx && minWx > 0; }).map(function(w) { return wxZhNames[w] || w; });
    var missingWx = wxOrder.filter(function(w) { return wxCount[w] === 0; }).map(function(w) { return wxZhNames[w] || w; });
    var wxQualitative = 'Dominant: ' + (dominantWx.length > 0 ? dominantWx.join(', ') : 'None') +
        (weakWx.length > 0 ? ' | Weaker: ' + weakWx.join(', ') : '') +
        (missingWx.length > 0 ? ' | Missing: ' + missingWx.join(', ') : '');
    var wxText = wxQualitative;

    // Build complete Ten Gods distribution from topGods if provided
    // CRITICAL: Only list which ten gods are PRESENT, NEVER include counts/numbers
    // This prevents the LLM from fabricating narrative phrases like "傷官四現"
    var allTgText = '';
    if (chart.topGods && chart.topGods.length > 0) {
        // Extract just the names, sorted by count (descending), but WITHOUT showing the counts
        var presentGods = chart.topGods.map(function(g) { return g.cn; });
        allTgText = '\n\n## Ten Gods Present in This Chart (listed by prominence, NO COUNTS shown)\n' +
            presentGods.join(', ') +
            '\n\n⚠️ IMPORTANT: The above list shows ONLY which ten gods exist in this chart. ' +
            'It does NOT show how many times each appears. ' +
            'You must NEVER mention specific counts (e.g., "four X", "three Y") in your analysis.';
    }

    return 'Day Master: ' + dm + ' (' + dmWx + ')\nGender: ' + gender + '\nPillars:\n  ' + pText + '\nFive Elements: ' + wxText + allTgText;
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

    return 'You are a professional Chinese BaZi (Four Pillars of Destiny) counselor with 30 years of experience, writing for a Western audience unfamiliar with Chinese metaphysics. Analyze this Major Life Cycle (Da Yun / 大運) period.\n\n' +
        '## Birth Chart\n' + chartInfo + '\n\n' +
        '## Da Yun (Major Cycle) Data\n' +
        '- Da Yun Stem: ' + dyGan + ' (Ten God: ' + tgInfo + ')\n' +
        '- Da Yun Branch: ' + dyZhi + '\n' +
        '- Stem Element: ' + dyWx + ', Branch Element: ' + zhiWx + '\n' +
        '- Age Range: ' + dyAge + ' (' + dyYears + ')\n' +
        '- Twelve Life Stages: ' + nzsc + '\n\n' +
        '## CRITICAL WRITING RULES\n' +
        '1. Write in natural, conversational English — like a thoughtful lifestyle article, NOT academic or mystical\n' +
        '2. NEVER use Chinese pinyin terms (no "Qi", "Yin Yang", "Shen", etc.) — translate everything into plain English\n' +
        '3. Be specific and grounded — reference the actual chart data\n' +
        '4. Address the reader directly as "you"\n\n' +
        '## Analysis Requirements\n' +
        '1. Judge the overall fortune of this Da Yun period (Good / Neutral / Challenging)\n' +
        '2. Explain the Five Elements interaction between Da Yun stem and Day Master in plain language\n' +
        '3. Consider the Da Yun branch influence\n' +
        '4. Provide specific, practical readings for career, wealth, relationships, and health\n\n' +
        '## Output Format (STRICT JSON)\n' +
        'Return ONLY a valid JSON object, no other text:\n' +
        '{\n' +
        '  "verdict": "Good" or "Neutral" or "Challenging",\n' +
        '  "summary": "2-3 sentences summarizing this cycle\'s fortune. Be specific and grounded in the chart data. Write in natural English for a Western audience.",\n' +
        '  "career": "One sentence about career prospects, 15-30 words",\n' +
        '  "wealth": "One sentence about financial outlook, 15-30 words",\n' +
        '  "love": "One sentence about relationship prospects, 15-30 words",\n' +
        '  "health": "One sentence about health precautions, 15-30 words"\n' +
        '}';
}

function buildShishenPrompt(chart, topGods, lang) {
    var isZh = lang && lang.startsWith('zh');
    // Pass complete ten gods distribution to buildChartSummary so LLM has accurate reference data
    var chartWithTg = Object.assign({}, chart, { topGods: topGods });
    var chartInfo = buildChartSummary(chartWithTg, lang);
    var dm = chart.dayMaster;
    var dmWx = STEM_WX[dm] || '';
    // CRITICAL: Use qualitative five elements description — never show raw numbers to LLM
    var wxCount = chart.wxCount || {};
    var wxOrder = ['Metal','Water','Wood','Fire','Earth'];
    var wxZhNames = { 'Metal':'金','Water':'水','Wood':'木','Fire':'火','Earth':'土' };
    var wxCounts = wxOrder.map(function(w) { return wxCount[w] || 0; });
    var maxWx = Math.max.apply(null, wxCounts);
    var minWx = Math.min.apply(null, wxCounts.filter(function(v) { return v > 0; }));
    var dominantWx = wxOrder.filter(function(w) { return wxCount[w] === maxWx && maxWx > 0; }).map(function(w) { return wxZhNames[w] || w; });
    var weakWx = wxOrder.filter(function(w) { return wxCount[w] === minWx && minWx > 0; }).map(function(w) { return wxZhNames[w] || w; });
    var missingWx = wxOrder.filter(function(w) { return wxCount[w] === 0; }).map(function(w) { return wxZhNames[w] || w; });
    var wxText = 'Dominant: ' + (dominantWx.length > 0 ? dominantWx.join(', ') : 'None') +
        (weakWx.length > 0 ? ' | Weaker: ' + weakWx.join(', ') : '') +
        (missingWx.length > 0 ? ' | Missing: ' + missingWx.join(', ') : '');
    var godList = topGods.map(function(g) {
        var info = TEN_GODS_EN[g.cn] || {};
        // CRITICAL: Do NOT include count numbers — only list which ten gods are present
        return g.cn + (isZh ? '' : ' (' + info.en + ')');
    }).join('、');

    if (isZh) {
        return '你是一位擁有30年經驗的專業八字命理師。請根據命盤的十神分佈，綜合分析此人的核心性格與人生走向。\n\n' +
            '## 命盤資料\n' + chartInfo + '\n' +
            '五行分佈：' + wxText + '\n\n' +
            '## 此命盤中出現的十神（按重要性排列）\n' + godList + '\n\n' +
            '## ⚠️ 絕對禁止事項\n' +
            '- 禁止在分析中提及任何十神的「出現次數」或「數量」（例如：不能說「傷官四現」「比肩三重」「偏財3個」等）\n' +
            '- 禁止自行推算或捏造任何數字——你看到的十神列表只告訴你「有哪些十神」，不告訴你「有幾個」\n' +
            '- 禁止在財運分析中捏造正財/偏財的數量對比（例如：不能說「偏財多於正財」除非命盤明確顯示）\n' +
            '- 禁止在健康分析中捏造五行具體數字（例如：不能說「五行4:4」）\n' +
            '- 你只能用定性描述（如「旺」「弱」「有」「無」「主導」「缺乏」），絕不能用定量描述\n\n' +
            '## 分析要求\n' +
            '1. 從出現的十神綜合分析此人的核心性格特質（不逐個羅列，要融會貫通）\n' +
            '2. 根據十神組合，分析事業方向與適合的職業類型\n' +
            '3. 分析感情婚姻的特點與潛在問題\n' +
            '4. 分析財運模式（正財偏財）— 只描述性質，不捏造數量\n' +
            '5. 健康上需要特別注意的方向\n' +
            '6. 用2-3句話總結這個命盤的關鍵建議\n\n' +
            '## 輸出格式（嚴格 JSON）\n' +
            '僅返回有效 JSON，不要任何其他文字：\n' +
            '{\n' +
            '  "personality": "2-3句話描述核心性格，用繁體中文，30-60字",\n' +
            '  "career": "事業方向建議，用繁體中文，20-40字",\n' +
            '  "love": "感情婚姻特點，用繁體中文，20-40字",\n' +
            '  "wealth": "財運模式分析，用繁體中文，20-40字",\n' +
            '  "health": "健康提醒，用繁體中文，15-30字",\n' +
            '  "summary": "2-3句話的總結建議，用繁體中文，30-50字"\n' +
            '}';
    }

    return 'You are a professional Chinese BaZi (Four Pillars of Destiny) counselor with 30 years of experience, writing for a Western audience unfamiliar with Chinese metaphysics. Analyze this person\'s core personality and life path based on their Ten Gods (十神) distribution.\n\n' +
        '## Birth Chart\n' + chartInfo + '\n' +
        'Five Elements: ' + wxText + '\n\n' +
        '## Ten Gods Present in This Chart (by prominence)\n' + godList + '\n\n' +
        '## ️ ABSOLUTELY FORBIDDEN\n' +
        '- NEVER mention specific counts or quantities of any Ten God (e.g., do NOT say "four Hurting Officers", "three Friends", "more Indirect Wealth than Direct Wealth")\n' +
        '- The list above tells you WHICH ten gods exist, NOT how many — you must never fabricate numbers\n' +
        '- Never fabricate Five Elements counts either (e.g., do NOT say "Fire and Earth 4:4")\n' +
        '- Use ONLY qualitative descriptions ("strong", "weak", "present", "absent", "dominant", "lacking") — NEVER quantitative ones\n\n' +
        '## CRITICAL WRITING RULES\n' +
        '1. Write in natural, conversational English — like a thoughtful lifestyle article, NOT academic or mystical\n' +
        '2. NEVER use Chinese pinyin terms (no "Qi", "Yin Yang", "Shen", etc.) — translate everything into plain English\n' +
        '3. Use everyday language: say "inner drive" instead of "internal resource", "social influence" instead of "indirect wealth"\n' +
        '4. Be specific and grounded — reference the actual chart data, not vague platitudes\n' +
        '5. Address the reader directly as "you" — make it feel personal, not clinical\n\n' +
        '## Analysis Requirements\n' +
        '1. Synthesize the present Ten Gods into a coherent personality profile (don\'t list them one by one)\n' +
        '2. Suggest career directions and suitable work environments\n' +
        '3. Describe relationship patterns and what to watch for\n' +
        '4. Describe their natural approach to money and financial decisions\n' +
        '5. Highlight health areas worth paying attention to\n' +
        '6. End with 2-3 sentences of practical, actionable life advice\n\n' +
        '## Output Format (STRICT JSON)\n' +
        'Return ONLY a valid JSON object, no other text:\n' +
        '{\n' +
        '  "personality": "2-3 sentences about core personality, 30-60 words",\n' +
        '  "career": "Career direction advice, 20-40 words",\n' +
        '  "love": "Relationship patterns, 20-40 words",\n' +
        '  "wealth": "Wealth pattern analysis, 20-40 words",\n' +
        '  "health": "Health precautions, 15-30 words",\n' +
        '  "summary": "2-3 sentences of key advice, 30-50 words"\n' +
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

    return 'You are a professional Chinese BaZi master with 30 years of experience, writing for a Western audience unfamiliar with Chinese metaphysics. Analyze this Flow Year (Liu Nian / 流年).\n\n' +
        '## Birth Chart\n' + chartInfo + '\n\n' +
        '## Da Yun (Major Cycle) Context\n' +
        '- Da Yun: ' + dyGan + dyZhi + ' (Element: ' + dyWx + ')\n\n' +
        '## Flow Year Data\n' +
        '- Year: ' + lyYear + ' (' + lyGan + lyZhi + ')\n' +
        '- Ten God vs Day Master: ' + lyTgInfo + '\n' +
        '- Year Element: Stem ' + lyWx + ', Branch ' + lyZhiWx + '\n' +
        '- Ten God vs Da Yun Stem: ' + (dyLyTg || 'N/A') + '\n\n' +
        '## CRITICAL WRITING RULES\n' +
        '1. Write in natural, conversational English — like a thoughtful lifestyle article, NOT academic or mystical\n' +
        '2. NEVER use Chinese pinyin terms — translate everything into plain English\n' +
        '3. Be specific and grounded in the chart data\n' +
        '4. Address the reader directly as "you"\n\n' +
        '## Analysis Requirements\n' +
        '1. Judge the year\'s fortune (Good / Neutral / Challenging)\n' +
        '2. Explain the interaction between flow year and both the Day Master and Da Yun in plain language\n' +
        '3. Provide a concise, practical annual outlook with actionable advice\n\n' +
        '## Output Format (STRICT JSON)\n' +
        'Return ONLY a valid JSON object, no other text:\n' +
        '{\n' +
        '  "verdict": "Good" or "Neutral" or "Challenging",\n' +
        '  "summary": "2-3 sentences summarizing this year\'s fortune. Be grounded in chart data. Write in natural English for a Western audience.",\n' +
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
        } else if (type === 'shishen') {
            prompt = buildShishenPrompt(chart, body.topGods || [], lang);
        } else {
            return res.status(400).json({ error: 'Invalid type. Use "dayun", "liunian", or "shishen".' });
        }

        var llmText = await callLLM(prompt);
        var result = parseJSON(llmText);

        return res.status(200).json({ success: true, result: result });
    } catch (e) {
        console.error('bazi-analysis error:', e.message || e);
        return res.status(500).json({ error: e.message || 'Analysis failed' });
    }
}
