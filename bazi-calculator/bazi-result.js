/**
 * DaoEssence BaZi Result Page
 * Reads params from URL hash, renders full chart with interpretations.
 * Powered by paipan.js — all interpretations derived from engine data.
 */
(function () {
    'use strict';

    // ==================== CONSTANTS ====================
    var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var WX_NAMES = ['金','水','木','火','土'];
    var WX_COLORS = { '金': '#9E8E6E', '水': '#5B8299', '木': '#5E825E', '火': '#B8665E', '土': '#9E8B5E' };
    var WX_EN = { '金': 'Metal', '水': 'Water', '木': 'Wood', '火': 'Fire', '土': 'Earth' };
    var STEM_WX = [2, 2, 3, 3, 4, 4, 0, 0, 1, 1];
    var BRANCH_WX = [1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 4, 1];

    var ZCG_TABLE = [
        [9,-1,-1],[5,9,7],[0,2,4],[1,-1,-1],[4,1,9],[2,4,6],
        [3,5,-1],[5,1,3],[6,8,4],[7,-1,-1],[4,7,3],[8,0,-1]
    ];

    // ==================== TEN GODS ENGINE ====================
    var TG_NAMES = {
        '比肩': { cn: '比肩', en: 'Friend' },
        '劫财': { cn: '劫财', en: 'Rob Wealth' },
        '食神': { cn: '食神', en: 'Eating God' },
        '伤官': { cn: '伤官', en: 'Hurting Officer' },
        '偏财': { cn: '偏财', en: 'Unconv. Wealth' },
        '正财': { cn: '正财', en: 'Direct Wealth' },
        '七杀': { cn: '七杀', en: 'Seven Killings' },
        '正官': { cn: '正官', en: 'Direct Officer' },
        '偏印': { cn: '偏印', en: 'Indirect Resource' },
        '正印': { cn: '正印', en: 'Direct Resource' }
    };
    // Career/life keywords per ten god (compact lookup)
    var TG_KEYWORDS = {
        '比肩':   { career: 'Independent work, partnerships, peers', life: 'Self-reliance, competition, willpower' },
        '劫财':   { career: 'Competitive fields, sales, risk-taking', life: 'Bold action, financial volatility, social' },
        '食神':   { career: 'Creative arts, teaching, food industry', life: 'Enjoyment, talent, expression, comfort' },
        '伤官':   { career: 'Innovation, technology, entertainment', life: 'Rebellion, brilliance, sharp tongue' },
        '偏财':   { career: 'Investment, business, speculative gains', life: 'Generosity, social connections, luck' },
        '正财':   { career: 'Stable employment, finance, administration', life: 'Prudence, diligence, steady rewards' },
        '七杀':   { career: 'Military, law, crisis management, surgery', life: 'Pressure, authority, transformation' },
        '正官':   { career: 'Government, management, corporate hierarchy', life: 'Discipline, responsibility, reputation' },
        '偏印':   { career: 'Research, occult studies, niche expertise', life: 'Solitude, unconventional thinking, intuition' },
        '正印':   { career: 'Education, scholarship, mentoring, culture', life: 'Learning, nurturing, inner wisdom, patience' }
    };

    var DGS_TABLE = [
        [2,3,1,0,9,8,7,6,5,4],[3,2,0,1,8,9,6,7,4,5],
        [5,4,2,3,1,0,9,8,7,6],[4,5,3,2,0,1,8,9,6,7],
        [7,6,5,4,2,3,1,0,9,8],[6,7,4,5,3,2,0,1,8,9],
        [9,8,7,6,5,4,2,3,1,0],[8,9,6,7,4,5,3,2,0,1],
        [1,0,9,8,7,6,5,4,2,3],[0,1,8,9,6,7,4,5,3,2]
    ];
    var TG_INDEX = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];

    function getStemShiShen(stemIdx, dmIdx) {
        var tgIdx = DGS_TABLE[dmIdx][stemIdx];
        return Object.assign({ index: tgIdx }, TG_NAMES[TG_INDEX[tgIdx]]);
    }

    function getBranchShiShen(branchIdx, dmIdx) {
        var cg = ZCG_TABLE[branchIdx];
        var result = [];
        for (var i = 0; i < cg.length; i++) {
            if (cg[i] >= 0) {
                result.push({ stem: STEMS[cg[i]], stemIdx: cg[i], primary: i === 0, tg: getStemShiShen(cg[i], dmIdx) });
            }
        }
        return result;
    }

    // ==================== DM NATURE (compact lookup) ====================
    var DM_NATURE = {
        '甲': { trait: 'Straightforward, ambitious, growth-oriented', wx: 'Yang Wood — like a tall oak' },
        '乙': { trait: 'Flexible, persistent, relationship-focused', wx: 'Yin Wood — like a willow' },
        '丙': { trait: 'Warm, charismatic, naturally generous', wx: 'Yang Fire — like the sun' },
        '丁': { trait: 'Insightful, refined, quietly determined', wx: 'Yin Fire — like a candle' },
        '戊': { trait: 'Steadfast, reliable, protective', wx: 'Yang Earth — like a mountain' },
        '己': { trait: 'Nurturing, patient, quietly diligent', wx: 'Yin Earth — like fertile soil' },
        '庚': { trait: 'Decisive, righteous, bold under pressure', wx: 'Yang Metal — like forged steel' },
        '辛': { trait: 'Elegant, detail-oriented, perfectionist', wx: 'Yin Metal — like fine jewelry' },
        '壬': { trait: 'Dynamic, resourceful, far-sighted', wx: 'Yang Water — like a great river' },
        '癸': { trait: 'Intuitive, perceptive, deep-thinking', wx: 'Yin Water — like morning dew' }
    };

    // ==================== FIVE ELEMENTS BODY MAP ====================
    var WX_BODY = { '金': 'Lungs & Large Intestine', '水': 'Kidneys & Bladder', '木': 'Liver & Gallbladder', '火': 'Heart & Small Intestine', '土': 'Spleen & Stomach' };
    var WX_BODY_EN = { '金': 'Lungs & Large Intestine', '水': 'Kidneys & Bladder', '木': 'Liver & Gallbladder', '火': 'Heart & Small Intestine', '土': 'Spleen & Stomach' };
    var WX_ORGAN_TIPS = {
        '金': 'Metal governs lungs & large intestine. Weak Metal may cause respiratory issues, constipation, dry skin. Protect against cold in autumn/winter, eat white foods like pear, lily bulb.',
        '水': 'Water governs kidneys & bladder. Weak Water may cause fatigue, lower back pain, tinnitus. Rest well in winter, sleep early, eat black foods like black beans, sesame.',
        '木': 'Wood governs liver & gallbladder. Weak Wood may cause emotional stagnation, headaches, dry eyes. Keep a positive mood in spring, avoid staying up late.',
        '火': 'Fire governs heart & small intestine. Weak Fire may cause insomnia, palpitations, poor circulation. Rest at midday in summer, eat red foods like dates, goji berries.',
        '土': 'Earth governs spleen & stomach. Weak Earth may cause poor digestion, bloating, fatigue. Eat regularly, chew thoroughly, avoid cold/raw foods.'
    };
    var WX_ORGAN_EXCESS = {
        '金': 'Excessive Metal suppresses Wood — may cause liver stagnation, stiff muscles. Exercise regularly, avoid being too rigid.',
        '水': 'Excessive Water suppresses Fire — may cause poor circulation, cold extremities, urinary issues. Get more sunlight, stay active.',
        '木': 'Excessive Wood suppresses Earth — may cause digestive issues, headaches, dizziness. Stay calm, avoid emotional extremes.',
        '火': 'Excessive Fire suppresses Metal — may cause cough, mouth ulcers, restlessness. Cool the body, avoid spicy foods.',
        '土': 'Excessive Earth suppresses Water — may cause kidney weakness, sluggish metabolism, weight gain. Control diet, exercise more.'
    };
    // Tiao Hou (seasonal regulation) - month branch mapping
    var TIAOHOU = {
        '寅': { season: 'Early Spring', tip: 'Wood rises in early spring — focus on liver health, gentle exercise, emotional balance.' },
        '卯': { season: 'Mid Spring', tip: 'Yang energy peaks in mid spring — wake early, stretch, avoid overwork.' },
        '辰': { season: 'Late Spring', tip: 'Earth awakens in late spring — improve digestion, reduce sour, increase sweet foods.' },
        '巳': { season: 'Early Summer', tip: 'Fire begins in early summer — eat light, nourish the heart, stay calm.' },
        '午': { season: 'Mid Summer', tip: 'Fire peaks in mid summer — rest at midday, avoid heat, eat bitter foods for heart health.' },
        '未': { season: 'Late Summer', tip: 'Dampness heavy in late summer — strengthen spleen, avoid cold/raw foods.' },
        '申': { season: 'Early Autumn', tip: 'Metal rises in early autumn — moisten lungs, sleep early, wake early.' },
        '酉': { season: 'Mid Autumn', tip: 'Dryness peaks in mid autumn — lungs are vulnerable, eat pears and lily bulb.' },
        '戌': { season: 'Late Autumn', tip: 'Metal recedes, fire hides — stay warm, prevent dryness, conserve energy for winter.' },
        '亥': { season: 'Early Winter', tip: 'Water begins in early winter — kidney time, sleep early and rise late, stay warm.' },
        '子': { season: 'Mid Winter', tip: 'Water peaks in mid winter — coldest time, protect kidneys, avoid cold exposure.' },
        '丑': { season: 'Late Winter', tip: 'Cold and damp in late winter — spleen weakest, warm and nourish digestion.' }
    };

    // ==================== DAYUN COMPREHENSIVE INTERPRETATION DATA ====================
    var DAYUN_INTERPRETATION = {
        '比肩': { overall: 'Independence grows strong — a time to pioneer new paths. Competition may arise in relationships; balance cooperation with self-reliance.', favorable: 'Solo ventures, independent projects, skill building', caution: 'Partnerships, stubbornness, spreading resources thin' },
        '劫财': { overall: 'Intense competition and financial volatility. Socially active but prone to disputes. Control impulsive spending.', favorable: 'Bold breakthroughs, showcasing abilities, short-term gains', caution: 'Gambling, borrowing, joint ventures' },
        '食神': { overall: 'Creativity flourishes, mood lifts, quality of life improves. Talents gain recognition. Great time for learning new skills.', favorable: 'Creative work, teaching, enjoying life', caution: 'Overindulgence, laziness, complacency' },
        '伤官': { overall: 'Sharp thinking drives innovation and change — but also invites conflicts. Good for technical breakthroughs, bad for challenging authority.', favorable: 'Tech innovation, freelancing, self-expression', caution: 'Clashes with superiors, careless speech, contract disputes' },
        '偏财': { overall: 'Unexpected windfalls and expanding social circles. Generosity builds networks, but rational financial management is key.', favorable: 'Investments, networking, business deals', caution: 'Overspending, trusting strangers, reckless speculation' },
        '正财': { overall: 'Stable income growth — hard work pays off. A favorable period for saving and accumulating assets.', favorable: 'Steady employment, savings, systematic progress', caution: 'Impatience, risky investments, missed opportunities' },
        '七杀': { overall: 'Pressure and opportunity coexist — challenges contain hidden breakthroughs. Good for tackling tough problems, but guard your health.', favorable: 'Breaking bottlenecks, leadership roles, overcoming adversity', caution: 'Burnout, confrontations, impulsive decisions' },
        '正官': { overall: 'Career advances, reputation grows. Ideal for management roles or institutional paths. Mentors appear — follow the rules.', favorable: 'Promotions, exams, compliant business', caution: 'Excessive conservatism, fear of change' },
        '偏印': { overall: 'Intuition sharpens — excellent for deep research, but overthinking may lead to isolation.', favorable: 'Academic research, philosophy, specialized expertise', caution: 'Indecisiveness, self-isolation, over-analysis' },
        '正印': { overall: 'Benefactors abound, studies prosper, family harmony. Ideal for certifications — elders or superiors offer strong support.', favorable: 'Exams, property matters, mentorship', caution: 'Over-dependence, lack of initiative, complacency' }
    };

    // ==================== LIUNIAN KEY PHRASES ====================
    var LIUNIAN_PHRASES = {
        '比肩': 'Year of Self — Independence & Growth',
        '劫财': 'Year of Competition — Financial Volatility',
        '食神': 'Year of Talent — Joy & Creativity',
        '伤官': 'Year of Change — Bold Thinking',
        '偏财': 'Year of Windfall — Social Expansion',
        '正财': 'Year of Wealth — Steady Accumulation',
        '七杀': 'Year of Pressure — Challenge & Opportunity',
        '正官': 'Year of Career — Mentor Support',
        '偏印': 'Year of Intuition — Inner Exploration',
        '正印': 'Year of Learning — Benefactor Guidance'
    };

    // Wuxing generation/clash analysis helper
    function wxRelation(wx1, wx2) {
        var gen = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
        var clash = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
        var same = (wx1 === wx2);
        if (same) return { type: 'same', desc: wx1 + ' + ' + wx2 + ' — Same element, power amplified' };
        if (gen[wx1] === wx2) return { type: 'generate', desc: wx1 + ' generates ' + wx2 + ' — your energy flows outward' };
        if (clash[wx1] === wx2) return { type: 'clash', desc: wx1 + ' controls ' + wx2 + ' — suppressing force' };
        if (gen[wx2] === wx1) return { type: 'generated', desc: wx2 + ' generates ' + wx1 + ' — receiving support' };
        if (clash[wx2] === wx1) return { type: 'clashed', desc: wx2 + ' controls ' + wx1 + ' — being constrained' };
        return { type: 'neutral', desc: wx1 + ' & ' + wx2 + ' — no direct interaction' };
    }

    // ==================== BUILD HEALTH INTERPRETATION ====================
    function buildHealthSection(nwx, dmIdx, rt) {
        var dm = rt['ctg'][2];
        var dmWx = WX_NAMES[STEM_WX[dmIdx]];
        var monthBranch = rt['cdz'][1];
        var maxCount = Math.max.apply(null, nwx);
        var absent = [], excessive = [], strong = [];
        for (var i = 0; i < 5; i++) {
            if (nwx[i] === 0) absent.push(WX_NAMES[i]);
            else if (nwx[i] >= 4) excessive.push(WX_NAMES[i]);
            else if (nwx[i] === maxCount) strong.push(WX_NAMES[i]);
        }

        var html = '<section class="section" id="section-health">';
        html += '<h2 class="section-title">Health & Wellness Insights</h2>';
        html += '<p class="section-desc">Based on your Five Elements balance, Day Master, and birth season</p>';

        // Day Master element health tendency
        html += '<div class="info-card" style="margin-bottom:0.8rem">';
        html += '<div class="info-item"><span class="info-label">Constitution</span><span class="info-value">Day Master <strong style="color:' + WX_COLORS[dmWx] + '">' + dm + ' ' + dmWx + '</strong> — ' + WX_BODY[dmWx] + ' system forms the foundation of your constitution.</span></div>';
        html += '</div>';

        var hasIssues = (absent.length > 0 || excessive.length > 0);
        if (hasIssues) {
            html += '<div class="detail-grid">';

            // Absent elements - health vulnerabilities
            if (absent.length > 0) {
                html += '<div class="detail-card">';
                html += '<div class="detail-card-header" style="color:var(--bad)">⚠️ Missing Elements — Vulnerable Organs</div>';
                html += '<div class="detail-card-body">';
                for (var a = 0; a < absent.length; a++) {
                    var w = absent[a];
                    html += '<div class="detail-row" style="margin-bottom:0.4rem">';
                    html += '<div><strong style="color:' + WX_COLORS[w] + '">' + w + ' ' + WX_EN[w] + '</strong> → ' + WX_BODY[w] + '</div>';
                    html += '<div style="color:var(--ink-2);font-size:0.7rem;line-height:1.5">' + WX_ORGAN_TIPS[w] + '</div>';
                    html += '</div>';
                }
                html += '</div></div>';
            }

            // Excessive elements - overactive organs
            if (excessive.length > 0) {
                html += '<div class="detail-card">';
                html += '<div class="detail-card-header" style="color:var(--accent)">📊 Excessive Elements — Imbalance Risk</div>';
                html += '<div class="detail-card-body">';
                for (var e = 0; e < excessive.length; e++) {
                    var w = excessive[e];
                    // Find what this element clashes
                    var clash = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
                    var target = clash[w];
                    html += '<div class="detail-row" style="margin-bottom:0.4rem">';
                    html += '<div><strong style="color:' + WX_COLORS[w] + '">' + w + '</strong> excessive → controls <strong style="color:' + WX_COLORS[target] + '">' + target + '</strong> (' + WX_BODY[target] + ')</div>';
                    html += '<div style="color:var(--ink-2);font-size:0.7rem;line-height:1.5">' + WX_ORGAN_EXCESS[w] + '</div>';
                    html += '</div>';
                }
                html += '</div></div>';
            }

            html += '</div>';
        } else {
            html += '<div class="detail-card">';
            html += '<div class="detail-card-body" style="text-align:center;color:var(--good);padding:0.6rem">';
            html += '✅ Five Elements are well balanced — no significant deficiencies or excesses. A stable constitution overall.';
            html += '</div></div>';
        }

        // Seasonal Tiao Hou advice
        var tiaohou = TIAOHOU[monthBranch];
        if (tiaohou) {
            html += '<div class="detail-card" style="margin-top:0.5rem">';
            html += '<div class="detail-card-header">🌙 Seasonal Regulation — Month Branch <strong>' + monthBranch + '</strong> (' + tiaohou.season + ')</div>';
            html += '<div class="detail-card-body">';
            html += '<div class="detail-row" style="line-height:1.5;color:var(--ink)">' + tiaohou.tip + '</div>';
            html += '</div></div>';
        }

        html += '</section>';
        return html;
    }

    // ==================== SHIER CHANGSHENG ====================
    function getNZSCClass(nzsc) {
        if (!nzsc) return 'neutral';
        if (nzsc.indexOf('大吉') >= 0 || nzsc.indexOf('吉') >= 0) return 'auspicious';
        if (nzsc.indexOf('凶') >= 0) return 'inauspicious';
        return 'neutral';
    }

    // ==================== BUILD DM PROFILE ====================
    function buildDmProfile(rt) {
        var dm = rt['ctg'][2];
        var dmIdx = STEMS.indexOf(dm);
        var dmWx = WX_NAMES[STEM_WX[dmIdx]];
        var dmYy = rt['yytg'] ? rt['yytg'][2] : 0;
        var nat = DM_NATURE[dm];
        if (!nat) return '';

        // Collect Ten Gods from all four pillars
        var tgCount = {};
        for (var p = 0; p < 4; p++) {
            if (p !== 2) {
                var stg = getStemShiShen(STEMS.indexOf(rt['ctg'][p]), dmIdx);
                tgCount[stg.cn] = (tgCount[stg.cn] || 0) + 1;
            }
            for (var j = 0; j < 3; j++) {
                var bzIdx = 3 * p + j;
                if (rt['bzcg'] && rt['bzcg'][bzIdx] && rt['bzcg'][bzIdx] !== '') {
                    var bzName = rt['bzcg'][bzIdx];
                    var bzFull = TG_INDEX[['印','卩','比','劫','伤','食','财','才','官','杀'].indexOf(bzName)];
                    if (bzFull) tgCount[bzFull] = (tgCount[bzFull] || 0) + 1;
                }
            }
        }
        var sorted = Object.keys(tgCount).sort(function(a, b) { return tgCount[b] - tgCount[a]; });

        var html = '<div class="info-card">';
        html += '<div class="info-card-grid">';
        html += '<div class="info-item"><span class="info-label">Day Master</span><span class="info-value">' + dm + ' ' + dmWx + ' (' + (dmYy === 0 ? 'Yang' : 'Yin') + ') — ' + nat.wx + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Core Nature</span><span class="info-value">' + nat.trait + '</span></div>';
        html += '</div>';
        html += '<div class="info-item"><span class="info-label">Dominant Ten Gods (by count in chart)</span><span class="info-value">';
        html += sorted.slice(0, 5).map(function(cn) {
            var kw = TG_KEYWORDS[cn];
            return '<strong>' + cn + '</strong> (' + tgCount[cn] + 'x) ' + kw.career;
        }).join('<br>');
        html += '</span></div>';
        html += '</div>';
        return html;
    }

    // ==================== BUILD WX INTERPRETATION ====================
    function buildWxInterpretation(nwx) {
        var maxCount = Math.max.apply(null, nwx);
        var dominant = [], weak = [], excess = [];
        for (var i = 0; i < 5; i++) {
            if (nwx[i] === 0) weak.push(WX_NAMES[i]);
            else if (nwx[i] === maxCount && maxCount >= 4) excess.push(WX_NAMES[i]);
            else if (nwx[i] === maxCount) dominant.push(WX_NAMES[i]);
        }
        var html = '<div class="wx-summary">';
        if (dominant.length > 0 && excess.length === 0) {
            html += '<div class="wx-summary-item wx-dominant"><span class="wx-summary-label">Strongest</span> ' + dominant.map(function(w) { return '<span style="color:' + WX_COLORS[w] + '">' + w + ' ' + WX_EN[w] + '</span>'; }).join(' ') + ' (' + maxCount + ')</div>';
        }
        if (excess.length > 0) {
            html += '<div class="wx-summary-item wx-excess"><span class="wx-summary-label" style="color:var(--bad)">Excessive (≥4)</span> ';
            html += excess.map(function(w) {
                return '<span style="color:' + WX_COLORS[w] + '">' + w + '</span> — ' + WX_ORGAN_EXCESS[w];
            }).join('<br>');
            html += '</div>';
        }
        if (weak.length > 0) {
            html += '<div class="wx-summary-item wx-weak"><span class="wx-summary-label">Absent</span> ';
            html += weak.map(function(w) {
                return '<span style="color:' + WX_COLORS[w] + '">' + w + ' ' + WX_EN[w] + '</span> — <em>' + WX_BODY[w] + '</em><br><span class="detail-key">Tip: </span>' + WX_ORGAN_TIPS[w];
            }).join('<br><br>');
            html += '</div>';
        }
        if (weak.length === 0) {
            html += '<div class="wx-summary-item">All Five Elements present — a well-balanced chart with relative stability.</div>';
        }
        html += '</div>';
        return html;
    }

    // ==================== BUILD DAYUN INTERPRETATION (Enhanced) ====================
    function buildDayunDetail(dy, dmIdx) {
        var nzsc = dy['nzsc'] || '';
        var dyGanIdx = STEMS.indexOf(dy['zfma']);
        var dyZhiIdx = BRANCHES.indexOf(dy['zfmb']);
        var stemTg = dyGanIdx >= 0 ? getStemShiShen(dyGanIdx, dmIdx) : null;
        var branchTgList = dyZhiIdx >= 0 ? getBranchShiShen(dyZhiIdx, dmIdx) : [];
        var ganWx = dyGanIdx >= 0 ? WX_NAMES[STEM_WX[dyGanIdx]] : '';
        var zhiWx = dyZhiIdx >= 0 ? WX_NAMES[BRANCH_WX[dyZhiIdx]] : '';
        var dmWx = WX_NAMES[STEM_WX[dmIdx]];

        var html = '';

        // ---- Comprehensive Fortune Summary ----
        html += '<div class="detail-card" style="margin-bottom:0.5rem">';
        html += '<div class="detail-card-header">📊 10-Year Fortune Overview</div>';
        html += '<div class="detail-card-body">';
        if (stemTg) {
            var interp = DAYUN_INTERPRETATION[stemTg.cn] || {};
            html += '<div class="detail-row" style="margin-bottom:0.4rem;line-height:1.6;color:var(--ink)">' + interp.overall + '</div>';
            if (interp.favorable) html += '<div class="detail-row"><span class="detail-key">✅ Favorable: </span>' + interp.favorable + '</div>';
            if (interp.caution) html += '<div class="detail-row"><span class="detail-key">⚠️ Caution: </span>' + interp.caution + '</div>';
        }
        // Wuxing interaction between dayun gan & day master
        if (stemTg) {
            var wxRel = wxRelation(ganWx, dmWx);
            var relColor = (wxRel.type === 'generate' || wxRel.type === 'generated' || wxRel.type === 'same') ? 'var(--good)' : (wxRel.type === 'clash' || wxRel.type === 'clashed') ? 'var(--bad)' : 'var(--accent)';
            html += '<div class="detail-row" style="margin-top:0.3rem"><span class="detail-key">Element vs Day Master: </span><span style="color:' + relColor + '">' + wxRel.desc + '</span></div>';
        }
        html += '</div></div>';

        html += '<div class="detail-grid">';

        // Stem Ten Gods card
        if (stemTg) {
            var kw = TG_KEYWORDS[stemTg.cn] || {};
            html += '<div class="detail-card">';
            html += '<div class="detail-card-header">Stem: <strong>' + dy['zfma'] + ' ' + ganWx + '</strong> → ' + stemTg.cn + ' (' + stemTg.en + ')</div>';
            html += '<div class="detail-card-body">';
            if (kw.career) html += '<div class="detail-row"><span class="detail-key">Career: </span>' + kw.career + '</div>';
            if (kw.life) html += '<div class="detail-row"><span class="detail-key">Life: </span>' + kw.life + '</div>';
            html += '</div></div>';
        }

        // Life Stage card
        if (nzsc) {
            var nzscClass = getNZSCClass(nzsc);
            var nzscSummary = '';
            if (nzsc.indexOf('长生') >= 0 || nzsc.indexOf('冠带') >= 0 || nzsc.indexOf('临官') >= 0 || nzsc.indexOf('帝旺') >= 0 || nzsc.indexOf('胎') >= 0 || nzsc.indexOf('养') >= 0) {
                nzscSummary = 'Fortune is rising — high energy, favorable for career growth and expanding connections.';
            } else if (nzsc.indexOf('衰') >= 0 || nzsc.indexOf('沐浴') >= 0) {
                nzscSummary = 'Fortune is stable with minor fluctuations. Conserve energy, avoid risky moves.';
            } else if (nzsc.indexOf('墓') >= 0) {
                nzscSummary = 'A time to be conservative and steady — wait for the right opportunity.';
            } else {
                nzscSummary = 'Fortune is weak — focus on health and avoid major decisions or risks.';
            }
            html += '<div class="detail-card">';
            html += '<div class="detail-card-header">Life Stage (NZSC)</div>';
            html += '<div class="detail-card-body">';
            html += '<span class="nzsc-badge ' + nzscClass + '">' + nzsc + '</span>';
            html += '<div class="detail-row" style="margin-top:0.3rem;color:var(--ink-2)">' + nzscSummary + '</div>';
            html += '</div></div>';
        }

        html += '</div>';

        // Branch hidden stems
        if (branchTgList.length > 0) {
            html += '<div class="detail-card" style="margin-top:0.5rem">';
            html += '<div class="detail-card-header">Branch: <strong>' + dy['zfmb'] + ' ' + zhiWx + '</strong> Hidden Stems</div>';
            html += '<div class="canggan-list">';
            for (var i = 0; i < branchTgList.length; i++) {
                var cg = branchTgList[i];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var cgKw = TG_KEYWORDS[cg.tg.cn] || {};
                var primaryTag = cg.primary ? ' <span class="cg-primary-tag">Primary</span>' : (i === 1 ? ' <span class="cg-primary-tag">Secondary</span>' : ' <span class="cg-primary-tag">Tertiary</span>');
                html += '<div class="canggan-entry">';
                html += '<span class="canggan-stem" style="color:' + cgColor + '">' + cg.stem + cgWx + '</span>';
                html += '<span class="canggan-tg">' + cg.tg.cn + primaryTag + '</span>';
                if (cgKw.life) html += '<span class="canggan-desc">' + cgKw.life + '</span>';
                html += '</div>';
            }
            html += '</div></div>';
        }

        return html;
    }

    // ==================== BUILD LIUNIAN INTERPRETATION (Enhanced) ====================
    function buildLiunianDetail(ly, dmIdx, dyGan, dyZhi) {
        var lyGanZhi = ly['lye'] || '';
        var lyGan = lyGanZhi.substring(0, 1);
        var lyZhi = lyGanZhi.substring(1, 2);
        var lyGanIdx = STEMS.indexOf(lyGan);
        var lyZhiIdx = BRANCHES.indexOf(lyZhi);
        var stemTg = lyGanIdx >= 0 ? getStemShiShen(lyGanIdx, dmIdx) : null;
        var branchTgList = lyZhiIdx >= 0 ? getBranchShiShen(lyZhiIdx, dmIdx) : [];
        var ganWx = lyGanIdx >= 0 ? WX_NAMES[STEM_WX[lyGanIdx]] : '';
        var zhiWx = lyZhiIdx >= 0 ? WX_NAMES[BRANCH_WX[lyZhiIdx]] : '';
        var dmWx = WX_NAMES[STEM_WX[dmIdx]];

        // Dayun vs Liunian interaction
        var dyGanIdx = STEMS.indexOf(dyGan);
        var interactionTg = null;
        if (dyGanIdx >= 0 && lyGanIdx >= 0) {
            interactionTg = getStemShiShen(lyGanIdx, dyGanIdx);
        }

        var html = '';

        // ---- Comprehensive Year Summary ----
        html += '<div class="detail-card" style="margin-bottom:0.5rem">';
        html += '<div class="detail-card-header">📌 Year Overview</div>';
        html += '<div class="detail-card-body">';
        // Key phrase
        if (stemTg) {
            var phrase = LIUNIAN_PHRASES[stemTg.cn] || '';
            html += '<div class="detail-row" style="margin-bottom:0.3rem"><strong style="color:var(--accent)">' + phrase + '</strong></div>';
            var interp = DAYUN_INTERPRETATION[stemTg.cn] || {};
            html += '<div class="detail-row" style="margin-bottom:0.3rem;line-height:1.5;color:var(--ink)">' + interp.overall + '</div>';
        }
        // Dayun vs year interaction
        if (interactionTg) {
            var dyWx = WX_NAMES[STEM_WX[dyGanIdx]];
            var wxRel = wxRelation(ganWx, dyWx);
            var relColor = (wxRel.type === 'generate' || wxRel.type === 'generated' || wxRel.type === 'same') ? 'var(--good)' : (wxRel.type === 'clash' || wxRel.type === 'clashed') ? 'var(--bad)' : 'var(--accent)';
            html += '<div class="detail-row"><span class="detail-key">Year vs Dayun: </span>' + lyGan + '(' + ganWx + ') vs Dayun ' + dyGan + '(' + dyWx + ') = <span style="color:' + relColor + '">' + interactionTg.cn + ' — ' + wxRel.desc + '</span></div>';
        }
        // Year vs day master
        if (stemTg) {
            var dmRel = wxRelation(ganWx, dmWx);
            var dmRelColor = (dmRel.type === 'generate' || dmRel.type === 'generated' || dmRel.type === 'same') ? 'var(--good)' : (dmRel.type === 'clash' || dmRel.type === 'clashed') ? 'var(--bad)' : 'var(--accent)';
            html += '<div class="detail-row"><span class="detail-key">Year vs Day Master: </span><span style="color:' + dmRelColor + '">' + dmRel.desc + '</span></div>';
        }
        html += '</div></div>';

        html += '<div class="detail-grid">';

        // Stem Ten Gods card
        if (stemTg) {
            var kw = TG_KEYWORDS[stemTg.cn] || {};
            html += '<div class="detail-card">';
            html += '<div class="detail-card-header">Year Stem: <strong>' + lyGan + ' ' + ganWx + '</strong> → ' + stemTg.cn + '</div>';
            html += '<div class="detail-card-body">';
            if (kw.career) html += '<div class="detail-row"><span class="detail-key">Career: </span>' + kw.career + '</div>';
            if (kw.life) html += '<div class="detail-row"><span class="detail-key">Life: </span>' + kw.life + '</div>';
            html += '</div></div>';
        }

        // Dayun interaction card
        if (interactionTg) {
            var intKw = TG_KEYWORDS[interactionTg.cn] || {};
            html += '<div class="detail-card">';
            html += '<div class="detail-card-header">Year vs Dayun</div>';
            html += '<div class="detail-card-body">';
            html += '<div class="detail-row"><span class="detail-key">Relation: </span>' + interactionTg.cn + ' (' + interactionTg.en + ')</div>';
            if (intKw.life) html += '<div class="detail-row"><span class="detail-key">Impact: </span>' + intKw.life + '</div>';
            html += '</div></div>';
        }

        html += '</div>';

        // Branch hidden stems
        if (branchTgList.length > 0) {
            html += '<div class="detail-card" style="margin-top:0.5rem">';
            html += '<div class="detail-card-header">Year Branch: <strong>' + lyZhi + ' ' + zhiWx + '</strong> Hidden Stems</div>';
            html += '<div class="canggan-list">';
            for (var i = 0; i < branchTgList.length; i++) {
                var cg = branchTgList[i];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var cgKw = TG_KEYWORDS[cg.tg.cn] || {};
                var primaryTag = cg.primary ? ' <span class="cg-primary-tag">Primary</span>' : (i === 1 ? ' <span class="cg-primary-tag">Secondary</span>' : ' <span class="cg-primary-tag">Tertiary</span>');
                html += '<div class="canggan-entry">';
                html += '<span class="canggan-stem" style="color:' + cgColor + '">' + cg.stem + cgWx + '</span>';
                html += '<span class="canggan-tg">' + cg.tg.cn + primaryTag + '</span>';
                if (cgKw.life) html += '<span class="canggan-desc">' + cgKw.life + '</span>';
                html += '</div>';
            }
            html += '</div></div>';
        }

        return html;
    }

    // ==================== RENDER SIDEBAR RECOMMENDATIONS ====================
    function renderSidebarRecommendations(sidebar) {
        var html = '<h3 class="sidebar-title">Recommended Reading</h3>';
        html += '<div id="sidebar-cards"><p style="font-size:0.78rem;color:var(--ink-3);text-align:center;padding:2rem 0">Loading articles...</p></div>';
        sidebar.innerHTML = html;

        fetch('bazi-recommendations.json')
            .then(function(res) { return res.json(); })
            .then(function(articles) {
                // Only take 3 articles
                var list = articles.slice(0, 3);
                var cardsHtml = '';
                for (var i = 0; i < list.length; i++) {
                    var a = list[i];
                    cardsHtml += '<a href="/blog/' + a.slug + '" class="sidebar-card">';
                    cardsHtml += '<div class="sidebar-card-cat">' + (a.category || '') + '</div>';
                    cardsHtml += '<h3>' + (a.title || '') + '</h3>';
                    if (a.readTime) cardsHtml += '<div class="sidebar-card-meta">' + a.readTime + ' min read</div>';
                    cardsHtml += '</a>';
                }
                var container = document.getElementById('sidebar-cards');
                if (container) container.innerHTML = cardsHtml;
            })
            .catch(function() {
                var container = document.getElementById('sidebar-cards');
                if (container) container.innerHTML = '<p style="font-size:0.78rem;color:var(--ink-3);text-align:center;padding:1rem 0">Unable to load articles.</p>';
            });
    }

    // ==================== SAVE AS HTML ====================
    function saveAsHTML() {
        var el = document.documentElement.cloneNode(true);
        // Remove the Save button from saved copy
        var saveBtn = el.querySelector('.bazi-nav-save');
        if (saveBtn && saveBtn.parentNode) saveBtn.parentNode.removeChild(saveBtn);
        // Remove main site CSS link (offline save won't work)
        var mainCSS = el.querySelector('link[href="/styles.min.css"]');
        if (mainCSS) mainCSS.parentNode.removeChild(mainCSS);
        // Remove sidebar fetch (avoid broken network call)
        var scriptTags = el.querySelectorAll('script');
        for (var s = 0; s < scriptTags.length; s++) {
            scriptTags[s].remove();
        }
        var html = '<!DOCTYPE html>\n' + el.outerHTML;
        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        // Generate filename with date
        var now = new Date();
        var dateStr = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
        a.download = 'BaZi-Reading-' + dateStr + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    // Expose globally
    window.saveAsHTML = saveAsHTML;

    // ==================== MAIN RENDER ====================
    function renderResult(rt) {
        document.getElementById('bazi-loading').style.display = 'none';
        var pageContainer = document.getElementById('bazi-result');
        pageContainer.style.display = 'grid';
        var container = document.getElementById('bazi-main');
        var sidebar = document.getElementById('bazi-sidebar');

        var gender = rt['xb'];
        var zodiac = rt['sx'];
        var xz = rt['xz'];
        var dayMaster = rt['ctg'][2];
        var dmIdx = STEMS.indexOf(dayMaster);
        var dmWxCode = STEM_WX[dmIdx];
        var dmElement = WX_NAMES[dmWxCode];

        var eightChar = rt['ctg'][0] + rt['cdz'][0] + '  ' +
                        rt['ctg'][1] + rt['cdz'][1] + '  ' +
                        rt['ctg'][2] + rt['cdz'][2] + '  ' +
                        rt['ctg'][3] + rt['cdz'][3];

        // Five elements
        var nwx = rt['nwx'] || [0, 0, 0, 0, 0];
        var wxData = [];
        for (var i = 0; i < 5; i++) {
            wxData.push({ name: WX_NAMES[i], en: WX_EN[WX_NAMES[i]], count: nwx[i], color: WX_COLORS[WX_NAMES[i]] });
        }

        // Build pillars
        var pillarLabels = ['Year Pillar', 'Month Pillar', 'Day Pillar', 'Hour Pillar'];
        var pillarsHTML = '';
        for (var p = 0; p < 4; p++) {
            var gan = rt['ctg'][p];
            var zhi = rt['cdz'][p];
            var ganWxCode = STEM_WX[STEMS.indexOf(gan)];
            var zhiWxCode = BRANCH_WX[BRANCHES.indexOf(zhi)];
            var ganWx = WX_NAMES[ganWxCode];
            var zhiWx = WX_NAMES[zhiWxCode];
            var ganTg = (p !== 2) ? getStemShiShen(STEMS.indexOf(gan), dmIdx) : null;
            var branchIdx = BRANCHES.indexOf(zhi);
            var cangGanList = getBranchShiShen(branchIdx, dmIdx);

            pillarsHTML += '<div class="pillar">';
            pillarsHTML += '<div class="pillar-label">' + pillarLabels[p] + '</div>';
            pillarsHTML += '<div class="pillar-stem">';
            pillarsHTML += '<span class="pillar-char">' + gan + '</span>';
            pillarsHTML += '<span class="pillar-wx" style="color:' + WX_COLORS[ganWx] + '">' + WX_EN[ganWx] + '</span>';
            if (ganTg) {
                pillarsHTML += '<span class="pillar-tg">' + ganTg.cn + '</span>';
            } else {
                pillarsHTML += '<span class="pillar-tg pillar-tg-self">Self</span>';
            }
            pillarsHTML += '</div>';
            pillarsHTML += '<div class="pillar-branch">';
            pillarsHTML += '<span class="pillar-char">' + zhi + '</span>';
            pillarsHTML += '<span class="pillar-wx" style="color:' + WX_COLORS[zhiWx] + '">' + WX_EN[zhiWx] + '</span>';
            pillarsHTML += '</div>';
            if (cangGanList.length > 0) {
                pillarsHTML += '<div class="pillar-hidden">';
                for (var ci = 0; ci < cangGanList.length; ci++) {
                    var cg = cangGanList[ci];
                    var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                    var cgColor = WX_COLORS[cgWx];
                    var pCls = cg.primary ? ' cg-main' : '';
                    pillarsHTML += '<span class="pillar-cg' + pCls + '"><span style="color:' + cgColor + '">' + cg.stem + '</span> ' + cg.tg.cn + '</span>';
                }
                pillarsHTML += '</div>';
            }
            pillarsHTML += '</div>';
        }

        // Da Yun
        var qyyDesc = rt['qyy_desc'] || '';
        var currentYear = new Date().getFullYear();
        var currentDayunIdx = -1;
        if (rt['dy'] && rt['dy'].length > 0) {
            for (var ck = 0; ck < rt['dy'].length; ck++) {
                if (currentYear >= rt['dy'][ck]['syear'] && currentYear <= rt['dy'][ck]['eyear']) {
                    currentDayunIdx = ck;
                    break;
                }
            }
        }

        var dyHTML = '';
        if (rt['dy'] && rt['dy'].length > 0) {
            dyHTML = '<section class="section" id="section-dayun">';
            dyHTML += '<h2 class="section-title">Life Cycles (Da Yun)</h2>';
            if (qyyDesc) dyHTML += '<p class="section-desc">' + qyyDesc + '</p>';
            if (currentDayunIdx >= 0) {
                var cdy = rt['dy'][currentDayunIdx];
                dyHTML += '<p class="current-hint">Currently in: <strong>' + cdy['zfma'] + cdy['zfmb'] + '</strong> (' + cdy['syear'] + '–' + cdy['eyear'] + ', age ' + cdy['zqage'] + '–' + cdy['zboz'] + ')</p>';
            }
            dyHTML += '<div class="dayun-grid">';
            for (var k = 0; k < Math.min(rt['dy'].length, 8); k++) {
                var dy = rt['dy'][k];
                var dyGanIdx2 = STEMS.indexOf(dy['zfma']);
                var dyStemTg = dyGanIdx2 >= 0 ? getStemShiShen(dyGanIdx2, dmIdx) : null;
                var dyGanZhi = (dy['zfma'] || '') + (dy['zfmb'] || '');
                var dyNzsc = dy['nzsc'] || '';
                var nzscClass = getNZSCClass(dyNzsc);
                var isCurrent = k === currentDayunIdx;

                dyHTML += '<div class="dayun-card' + (isCurrent ? ' dayun-current' : '') + '" data-dy-index="' + k + '">';
                if (isCurrent) dyHTML += '<span class="badge-current">NOW</span>';
                dyHTML += '<div class="dayun-ganzhi">' + dyGanZhi + '</div>';
                if (dyStemTg) dyHTML += '<div class="dayun-tg">' + dyStemTg.cn + '</div>';
                dyHTML += '<div class="dayun-age">' + dy['zqage'] + '–' + dy['zboz'] + '</div>';
                dyHTML += '<div class="dayun-years">' + dy['syear'] + '–' + dy['eyear'] + '</div>';
                if (dyNzsc) dyHTML += '<div class="nzsc-dot ' + nzscClass + '">' + dyNzsc + '</div>';
                dyHTML += '</div>';
            }
            dyHTML += '</div>'; // .dayun-grid

            // Detail panel placeholder
            dyHTML += '<div id="dayun-detail" class="detail-panel">';
            dyHTML += '<div class="detail-panel-head">';
            dyHTML += '<h3 id="dayun-detail-title"></h3>';
            dyHTML += '<button id="dayun-detail-close" class="btn-close">&times;</button>';
            dyHTML += '</div>';
            dyHTML += '<div id="dayun-detail-body"></div>';
            dyHTML += '<div id="liunian-container"></div>';
            dyHTML += '</div>'; // .detail-panel

            dyHTML += '</section>';
        }

        // Assemble full page
        container.innerHTML =
            // Header
            '<header class="result-header">' +
                '<div class="header-tags">' +
                    '<span class="tag">' + zodiac + (xz ? ' / ' + xz : '') + '</span>' +
                    '<span class="tag">' + gender + '</span>' +
                    '<span class="tag tag-dm">Day Master: <strong style="color:' + WX_COLORS[dmElement] + '">' + dayMaster + ' ' + WX_EN[dmElement] + '</strong></span>' +
                '</div>' +
                '<div class="eight-char">' + eightChar + '</div>' +
            '</header>' +

            // Day Master Profile
            buildDmProfile(rt) +

            // Two-column: Pillars + Elements
            '<div class="main-grid">' +
                '<section class="section">' +
                    '<h2 class="section-title">Four Pillars</h2>' +
                    '<div class="pillars-grid">' + pillarsHTML + '</div>' +
                '</section>' +
                '<section class="section">' +
                    '<h2 class="section-title">Five Elements</h2>' +
                    '<div class="wx-bars">' +
                        wxData.map(function(w) {
                            var pct = Math.round((w.count / 8) * 100);
                            return '<div class="wx-row">' +
                                '<span class="wx-label" style="color:' + w.color + '">' + w.en + '</span>' +
                                '<div class="wx-bar-track"><div class="wx-bar-fill" style="width:' + Math.max(pct, 8) + '%;background:' + w.color + '"></div></div>' +
                                '<span class="wx-count">' + w.count + '</span>' +
                            '</div>';
                        }).join('') +
                    '</div>' +
                    buildWxInterpretation(nwx) +
                '</section>' +
            '</div>' +

            // Da Yun
            dyHTML +

            // Health
            buildHealthSection(nwx, dmIdx, rt) +

            // CTA
            '<section class="cta-box">' +
                '<h3 class="cta-title">Unlock Your Full Life Blueprint</h3>' +
                '<p class="cta-desc">This free chart reveals your core personality and elemental balance. For deeper insights, a professional reading covers:</p>' +
                '<div class="cta-list">' +
                    '<span>Career direction</span><span>Relationship compatibility</span>' +
                    '<span>Wealth cycles</span><span>Health vulnerabilities</span>' +
                    '<span>Children &amp; family</span><span>Life decisions</span>' +
                '</div>' +
                '<a href="https://www.creem.io/checkout/prod_28PqAKMEom5WGRH1w9O35n/ch_1ueb7qKPFnQOzLK8lNPfIN" class="cta-btn" target="_blank" rel="noopener">Get Personalized Reading</a>' +
                '<p class="cta-note">Based on your exact birth chart · Certified practitioner</p>' +
            '</section>';

        // Bind dayun events
        if (rt['dy'] && rt['dy'].length > 0) {
            var items = container.querySelectorAll('.dayun-card');
            var detailPanel = document.getElementById('dayun-detail');
            var detailTitle = document.getElementById('dayun-detail-title');
            var detailBody = document.getElementById('dayun-detail-body');
            var liunianContainer = document.getElementById('liunian-container');
            var closeBtn = document.getElementById('dayun-detail-close');
            var activeItem = null;

            function openDayun(item) {
                var idx = parseInt(item.getAttribute('data-dy-index'));
                var dy = rt['dy'][idx];

                if (activeItem === item) {
                    detailPanel.classList.remove('show');
                    item.classList.remove('active');
                    activeItem = null;
                    return;
                }

                if (activeItem) activeItem.classList.remove('active');
                item.classList.add('active');
                activeItem = item;

                detailTitle.textContent = dy['zfma'] + dy['zfmb'] + '  ·  Age ' + dy['zqage'] + '–' + dy['zboz'] + '  ·  ' + dy['syear'] + '–' + dy['eyear'];
                detailBody.innerHTML = buildDayunDetail(dy, dmIdx);

                // Flow Years
                if (dy['ly'] && dy['ly'].length > 0) {
                    var lyHTML = '<h4 class="liunian-title">Flow Years (Liu Nian)</h4>';
                    lyHTML += '<div class="liunian-grid">';
                    dy['ly'].forEach(function(ly, lyIdx) {
                        var lyGanZhi = ly['lye'] || '';
                        var lyGan = lyGanZhi.substring(0, 1);
                        var lyGanIdx = STEMS.indexOf(lyGan);
                        var lyTg = lyGanIdx >= 0 ? getStemShiShen(lyGanIdx, dmIdx) : null;
                        var lyYear = ly['year'] || 0;
                        var isCurrentYear = (lyYear === currentYear);

                        lyHTML += '<div class="ly-card' + (isCurrentYear ? ' ly-current' : '') + '" data-ly-index="' + lyIdx + '" data-ly-year="' + lyYear + '">';
                        if (isCurrentYear) lyHTML += '<span class="badge-now">NOW</span>';
                        lyHTML += '<div class="ly-ganzhi">' + lyGanZhi + '</div>';
                        if (lyTg) lyHTML += '<div class="ly-tg">' + lyTg.cn + '</div>';
                        lyHTML += '<div class="ly-year">' + lyYear + '</div>';
                        lyHTML += '</div>';
                    });
                    lyHTML += '</div>';

                    lyHTML += '<div id="liunian-detail" class="detail-panel detail-panel-sm">';
                    lyHTML += '<div class="detail-panel-head">';
                    lyHTML += '<h4 id="liunian-detail-title"></h4>';
                    lyHTML += '<button id="liunian-detail-close" class="btn-close btn-close-sm">&times;</button>';
                    lyHTML += '</div>';
                    lyHTML += '<div id="liunian-detail-body"></div>';
                    lyHTML += '</div>';

                    liunianContainer.innerHTML = lyHTML;

                    // Bind liunian
                    var lyItems = liunianContainer.querySelectorAll('.ly-card');
                    var lyDetail = document.getElementById('liunian-detail');
                    var lyTitle = document.getElementById('liunian-detail-title');
                    var lyBody = document.getElementById('liunian-detail-body');
                    var lyClose = document.getElementById('liunian-detail-close');
                    var activeLy = null;

                    function openLy(lyItem) {
                        var lyIdx = parseInt(lyItem.getAttribute('data-ly-index'));
                        var lyData = dy['ly'][lyIdx];
                        var lyYear = lyItem.getAttribute('data-ly-year');

                        if (activeLy === lyItem) {
                            lyDetail.classList.remove('show');
                            lyItem.classList.remove('ly-active');
                            activeLy = null;
                            return;
                        }
                        if (activeLy) activeLy.classList.remove('ly-active');
                        lyItem.classList.add('ly-active');
                        activeLy = lyItem;

                        lyTitle.textContent = (lyData['lye'] || '') + '  ·  ' + lyYear;
                        lyBody.innerHTML = buildLiunianDetail(lyData, dmIdx, dy['zfma'] || '', dy['zfmb'] || '');
                        lyDetail.classList.add('show');
                        lyDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                    lyItems.forEach(function(lyItem) {
                        lyItem.addEventListener('click', function() { openLy(this); });
                    });
                    lyClose.addEventListener('click', function() {
                        lyDetail.classList.remove('show');
                        if (activeLy) { activeLy.classList.remove('ly-active'); activeLy = null; }
                    });

                    // Auto-open current year
                    var currentLyItem = liunianContainer.querySelector('.ly-card.ly-current');
                    if (currentLyItem) {
                        setTimeout(function() { openLy(currentLyItem); }, 120);
                    }
                } else {
                    liunianContainer.innerHTML = '';
                }

                detailPanel.classList.add('show');
                detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            items.forEach(function(item) {
                item.addEventListener('click', function() { openDayun(this); });
            });
            closeBtn.addEventListener('click', function() {
                detailPanel.classList.remove('show');
                if (activeItem) { activeItem.classList.remove('active'); activeItem = null; }
            });

            // Auto-open current dayun
            if (currentDayunIdx >= 0) {
                var currentDyItem = container.querySelector('.dayun-card[data-dy-index="' + currentDayunIdx + '"]');
                if (currentDyItem) {
                    setTimeout(function() { openDayun(currentDyItem); }, 60);
                }
            }
        }

        // Render sidebar recommendations
        renderSidebarRecommendations(sidebar);
    }

    // ==================== INIT ====================
    function init() {
        var hash = window.location.hash;
        if (!hash || hash.length < 2) {
            showError('No calculation data found. Please go back and try again.');
            return;
        }
        try {
            var params = JSON.parse(decodeURIComponent(hash.substring(1)));
            var yy = parseInt(params.yy), mm = parseInt(params.mm),
                dd = parseInt(params.dd), hh = parseInt(params.hh), xb = parseInt(params.xb);

            if (isNaN(yy) || isNaN(mm) || isNaN(dd) || isNaN(hh) || isNaN(xb)) {
                showError('Invalid parameters.'); return;
            }

            var p = new paipan();
            p.pdy = true;
            var rt = p.fatemaps(xb, yy, mm, dd, hh, 0, 0);

            if (!rt) { showError('Calculation failed.'); return; }
            renderResult(rt);
        } catch (e) {
            showError('Failed to parse data.');
            console.error('BaZi error:', e);
        }
    }

    function showError(msg) {
        document.getElementById('bazi-loading').style.display = 'none';
        var err = document.getElementById('bazi-error');
        err.style.display = 'flex';
        err.innerHTML = '<p>' + msg + '</p><a href="/#free-bazi">&larr; Try Again</a>';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
