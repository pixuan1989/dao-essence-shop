/**
 * DaoEssence BaZi Result Page
 * Reads params from URL hash, renders full chart with interpretations.
 * Powered by paipan.js — all interpretations derived from engine data.
 */
(function () {
    'use strict';

    // ==================== i18n HELPER ====================
    // Fallback EN strings for sidebar keys (no data-i18n, need manual fallback)
    var EN_STRINGS = {
        // Day Master Profile
        'bazi_result.day_master_label': 'Day Master',
        'bazi_result.day_master_self': 'Day Master',
        'bazi_result.yang': 'Yang',
        'bazi_result.yin': 'Yin',
        // Header
        'bazi_result.gender_male': 'Male',
        'bazi_result.gender_female': 'Female',
        'bazi_result.zodiac_label': 'Zodiac:',
        // Pillars
        'bazi_result.pillar_year': 'Year Pillar',
        'bazi_result.pillar_month': 'Month Pillar',
        'bazi_result.pillar_day': 'Day Pillar',
        'bazi_result.pillar_hour': 'Hour Pillar',
        // Sections
        'bazi_result.section_four_pillars': 'Four Pillars',
        'bazi_result.section_five_elements': 'Five Elements',
        'bazi_result.section_health': 'Health & Wellness Insights',
        'bazi_result.section_health_desc': 'Based on your Five Elements balance and birth season',
        'bazi_result.section_dayun': 'Major Life Cycles',
        // Health
        'bazi_result.health_missing': '⚠️ Missing Elements — Vulnerable Organs',
        'bazi_result.health_excessive': '📊 Excessive Elements — Imbalance Risk',
        'bazi_result.health_balanced': '✅ Your Five Elements are well-balanced — no significant deficiencies or excesses.',
        // Five Elements
        'bazi_result.wx_strongest': 'Strongest',
        'bazi_result.wx_excessive': 'Excessive (≥4)',
        'bazi_result.wx_absent': 'Missing',
        'bazi_result.wx_tip': 'Tip:',
        // Da Yun
        'bazi_result.dayun_currently_in': 'Currently in:',
        'bazi_result.dayun_period': 'period',
        'bazi_result.dayun_age': 'Ages',
        'bazi_result.dayun_overview': '📊 10-Year Cycle Overview',
        'bazi_result.dayun_favorable': '✅ Favorable:',
        'bazi_result.dayun_caution': '⚠️ Caution:',
        'bazi_result.dayun_element_influence': 'Element influence:',
        'bazi_result.dayun_what_means': 'What this means for you',
        'bazi_result.dayun_career': '💼 Career direction:',
        'bazi_result.dayun_life_theme': '🌙 Life theme:',
        'bazi_result.dayun_practical_advice': '💡 Practical advice:',
        // Liunian
        'bazi_result.liunian_yearly': 'Yearly Breakdown',
        'bazi_result.liunian_year_overview': '📌 Year Overview',
        'bazi_result.liunian_career': '💼 Career:',
        'bazi_result.liunian_life': '🌙 Life:',
        'bazi_result.liunian_focus': '💡 Focus:',
        'bazi_result.liunian_vs_cycle': '🔄 vs. current cycle:',
        // Sidebar
        'bazi_result.sidebar_title': 'Recommended Reading',
        'bazi_result.sidebar_loading': 'Loading articles...',
        'bazi_result.sidebar_element_badge': '✦ 5-Element Personality Quiz',
        'bazi_result.sidebar_element_title': 'Which Element Is Your Personality?',
        'bazi_result.sidebar_element_desc': 'Your BaZi chart + 5 quick questions reveal your dominant element and the unique strengths that come with it.',
        'bazi_result.sidebar_element_cta': 'Take the 2-Min Quiz →',
        'bazi_result.sidebar_load_error': 'Failed to load articles.',
        'bazi_result.sidebar_min_read': ' min read',
        // CTA
        'bazi_result.cta_badge': '✦ Premium Reading',
        'bazi_result.cta_title': 'Unlock Your Complete Life Blueprint',
        'bazi_result.cta_subtitle': 'This free chart reveals your core personality and element balance. A personal reading decodes every dimension of your destiny.',
        'bazi_result.cta_feat1': 'Career direction & timing',
        'bazi_result.cta_feat2': 'Love & relationship compatibility',
        'bazi_result.cta_feat3': 'Wealth peaks & valleys',
        'bazi_result.cta_feat4': 'Health blind spots',
        'bazi_result.cta_feat5': 'Family & children insights',
        'bazi_result.cta_feat6': 'Major life decision guidance',
        'bazi_result.cta_btn': 'Get Your Full Personalized Reading',
        'bazi_result.cta_btn_loading': 'Creating checkout...',
        'bazi_result.cta_btn_error_checkout': 'Unable to create checkout. Please try again.',
        'bazi_result.cta_btn_error_network': 'Network error. Please try again.',
        'bazi_result.cta_trust1': 'Based on your exact birth chart',
        'bazi_result.cta_trust2': 'Certified BaZi practitioner',
        'bazi_result.cta_trust3': 'Delivered within 24 hours',
        // Errors
        'bazi_result.error_no_data': 'No calculation data found. Please go back and try again.',
        'bazi_result.error_invalid': 'Invalid parameters.',
        'bazi_result.error_calc_failed': 'Calculation failed.',
        'bazi_result.error_parse_failed': 'Data parsing failed.',
        'bazi_result.error_try_again': '← Try Again',
        // Page
        'bazi_result.page_title': 'BaZi Chart Result | DaoEssence',
        'bazi_result.page_description': 'View your free BaZi chart analysis, including Four Pillars, Five Elements, Ten Gods, Major Life Cycles, and more.',
        // DM Nature (10 stems)
        'bazi_result.dm_nature.jia_trait': 'Straightforward, ambitious, growth-oriented',
        'bazi_result.dm_nature.jia_wx': 'Yang Wood — like a tall oak',
        'bazi_result.dm_nature.yi_trait': 'Flexible, persistent, relationship-focused',
        'bazi_result.dm_nature.yi_wx': 'Yin Wood — like a willow',
        'bazi_result.dm_nature.bing_trait': 'Warm, charismatic, naturally generous',
        'bazi_result.dm_nature.bing_wx': 'Yang Fire — like the sun',
        'bazi_result.dm_nature.ding_trait': 'Insightful, refined, quietly determined',
        'bazi_result.dm_nature.ding_wx': 'Yin Fire — like a candle',
        'bazi_result.dm_nature.wu_trait': 'Steadfast, reliable, protective',
        'bazi_result.dm_nature.wu_wx': 'Yang Earth — like a mountain',
        'bazi_result.dm_nature.ji_trait': 'Nurturing, patient, quietly diligent',
        'bazi_result.dm_nature.ji_wx': 'Yin Earth — like fertile soil',
        'bazi_result.dm_nature.geng_trait': 'Decisive, righteous, bold under pressure',
        'bazi_result.dm_nature.geng_wx': 'Yang Metal — like forged steel',
        'bazi_result.dm_nature.xin_trait': 'Elegant, detail-oriented, perfectionist',
        'bazi_result.dm_nature.xin_wx': 'Yin Metal — like fine jewelry',
        'bazi_result.dm_nature.ren_trait': 'Dynamic, resourceful, far-sighted',
        'bazi_result.dm_nature.ren_wx': 'Yang Water — like a great river',
        'bazi_result.dm_nature.gui_trait': 'Intuitive, perceptive, deep-thinking',
        'bazi_result.dm_nature.gui_wx': 'Yin Water — like morning dew',
        // Organ tips
        'bazi_result.organ_tips.metal': 'Metal governs lungs & large intestine. Weak Metal may cause respiratory issues, constipation, dry skin. Protect against cold in autumn/winter, eat white foods like pear, lily bulb.',
        'bazi_result.organ_tips.water': 'Water governs kidneys & bladder. Weak Water may cause fatigue, lower back pain, tinnitus. Rest well in winter, sleep early, eat black foods like black beans, sesame.',
        'bazi_result.organ_tips.wood': 'Wood governs liver & gallbladder. Weak Wood may cause emotional stagnation, headaches, dry eyes. Keep a positive mood in spring, avoid staying up late.',
        'bazi_result.organ_tips.fire': 'Fire governs heart & small intestine. Weak Fire may cause insomnia, palpitations, poor circulation. Rest at midday in summer, eat red foods like dates, goji berries.',
        'bazi_result.organ_tips.earth': 'Earth governs spleen & stomach. Weak Earth may cause poor digestion, bloating, fatigue. Eat regularly, chew thoroughly, avoid cold/raw foods.',
        // Organ excess
        'bazi_result.organ_excess.metal': 'Excessive Metal suppresses Wood — may cause liver stagnation, stiff muscles. Exercise regularly, avoid being too rigid.',
        'bazi_result.organ_excess.water': 'Excessive Water suppresses Fire — may cause poor circulation, cold extremities, urinary issues. Get more sunlight, stay active.',
        'bazi_result.organ_excess.wood': 'Excessive Wood suppresses Earth — may cause digestive issues, headaches, dizziness. Stay calm, avoid emotional extremes.',
        'bazi_result.organ_excess.fire': 'Excessive Fire suppresses Metal — may cause cough, mouth ulcers, restlessness. Cool the body, avoid spicy foods.',
        'bazi_result.organ_excess.earth': 'Excessive Earth suppresses Water — may cause kidney weakness, sluggish metabolism, weight gain. Control diet, exercise more.',
        // Ten Gods keywords
        'bazi_result.ten_gods.friend_career': 'Independent work, partnerships, peers',
        'bazi_result.ten_gods.friend_life': 'Self-reliance, competition, willpower',
        'bazi_result.ten_gods.rob_wealth_career': 'Competitive fields, sales, risk-taking',
        'bazi_result.ten_gods.rob_wealth_life': 'Bold action, financial volatility, social',
        'bazi_result.ten_gods.eating_god_career': 'Creative arts, teaching, food industry',
        'bazi_result.ten_gods.eating_god_life': 'Enjoyment, talent, expression, comfort',
        'bazi_result.ten_gods.hurting_officer_career': 'Innovation, technology, entertainment',
        'bazi_result.ten_gods.hurting_officer_life': 'Rebellion, brilliance, sharp tongue',
        'bazi_result.ten_gods.indirect_wealth_career': 'Investment, business, speculative gains',
        'bazi_result.ten_gods.indirect_wealth_life': 'Generosity, social connections, luck',
        'bazi_result.ten_gods.direct_wealth_career': 'Stable employment, finance, administration',
        'bazi_result.ten_gods.direct_wealth_life': 'Prudence, diligence, steady rewards',
        'bazi_result.ten_gods.seven_killings_career': 'Military, law, crisis management, surgery',
        'bazi_result.ten_gods.seven_killings_life': 'Pressure, authority, transformation',
        'bazi_result.ten_gods.direct_officer_career': 'Government, management, corporate hierarchy',
        'bazi_result.ten_gods.direct_officer_life': 'Discipline, responsibility, reputation',
        'bazi_result.ten_gods.indirect_resource_career': 'Research, metaphysics, niche expertise',
        'bazi_result.ten_gods.indirect_resource_life': 'Solitude, unconventional thinking, intuition',
        'bazi_result.ten_gods.direct_resource_career': 'Education, scholarship, mentoring, culture',
        'bazi_result.ten_gods.direct_resource_life': 'Learning, nurturing, inner wisdom, patience'
    };
    function t(key) {
        if (window.DaoI18n && window.DaoI18n.t) {
            var val = window.DaoI18n.t(key);
            return (val !== key) ? val : (EN_STRINGS[key] || key);
        }
        return EN_STRINGS[key] || key;
    }
    var isZh = function() { return window.DaoI18n && window.DaoI18n.current() === 'zh'; };

    // ==================== CONSTANTS ====================
    var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var STEMS_EN = ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'];
    var BRANCHES_EN = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];
    var WX_NAMES = ['金','水','木','火','土'];
    var WX_COLORS = { '金': '#9E8E6E', '水': '#5B8299', '木': '#5E825E', '火': '#B8665E', '土': '#9E8B5E' };
    var WX_EN = { '金': 'Metal', '水': 'Water', '木': 'Wood', '火': 'Fire', '土': 'Earth' };
    var ZODIAC_EN = { '鼠':'Rat','牛':'Ox','虎':'Tiger','兔':'Rabbit','龙':'Dragon','蛇':'Snake','马':'Horse','羊':'Goat','猴':'Monkey','鸡':'Rooster','狗':'Dog','猪':'Pig' };
    var STEM_WX = [2, 2, 3, 3, 4, 4, 0, 0, 1, 1];
    var BRANCH_WX = [1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 4, 1];

    var ZCG_TABLE = [
        [9,-1,-1],[5,9,7],[0,2,4],[1,-1,-1],[4,1,9],[2,4,6],
        [3,5,-1],[5,1,3],[6,8,4],[7,-1,-1],[4,7,3],[8,0,-1]
    ];

    // ==================== TEN GODS ENGINE ====================
    var TG_NAMES = {
        '比肩': { cn: '比肩', en: 'Friend', simple: 'Peers & Competition', desc: 'Represents your friends, colleagues, and competition in the same field.', simpleZh: '同儕與競爭', descZh: '代表你的朋友、同事和同領域的競爭對手。' },
        '劫财': { cn: '劫财', en: 'Rob Wealth', simple: 'Financial Leaks', desc: 'Unnecessary spending, money taken by others, or resource competition.', simpleZh: '財務流失', descZh: '不必要的開支、被他人奪取的資源，或資源競爭。' },
        '食神': { cn: '食神', en: 'Eating God', simple: 'Talent & Enjoyment', desc: 'Represents natural talent, creativity, enjoyment of life, and artistic expression.', simpleZh: '才華與享受', descZh: '代表天賦才華、創造力、生活情趣和藝術表現。' },
        '伤官': { cn: '伤官', en: 'Hurting Officer', simple: 'Brilliance & Rebellion', desc: 'Represents sharp intelligence, innovation, and the drive to challenge conventions.', simpleZh: '才華與叛逆', descZh: '代表敏銳的智慧、創新精神，以及挑戰常規的動力。' },
        '偏财': { cn: '偏财', en: 'Indirect Wealth', simple: 'Unexpected Income', desc: 'Represents investment, side hustles, and creative gains — not salary income.', simpleZh: '意外收入', descZh: '代表投資、副業和創意收益——非薪資收入。' },
        '正财': { cn: '正财', en: 'Direct Wealth', simple: 'Steady Income', desc: 'Represents your salary, main income, and stable finances.', simpleZh: '穩定收入', descZh: '代表你的薪資、主要收入和穩定的財務狀況。' },
        '七杀': { cn: '七杀', en: 'Seven Killings', simple: 'Challenge & Drive', desc: 'Represents pressure, ambition, and boldness — can empower or create conflict.', simpleZh: '壓力與動力', descZh: '代表壓力、野心和果斷——可以賦予力量，也可能引發衝突。' },
        '正官': { cn: '正官', en: 'Direct Officer', simple: 'Career & Reputation', desc: 'Represents your work, social status, responsibility, and rules.', simpleZh: '事業與聲望', descZh: '代表你的工作、社會地位、責任和規則。' },
        '偏印': { cn: '偏印', en: 'Indirect Resource', simple: 'Intuition & Insight', desc: 'Represents inspiration, metaphysical talent, and unorthodox learning.', simpleZh: '直覺與洞察', descZh: '代表靈感、玄學天賦和非傳統學習。' },
        '正印': { cn: '正印', en: 'Direct Resource', simple: 'Knowledge & Support', desc: 'Represents education, mentors, and the protection of elders and benefactors.', simpleZh: '知識與支持', descZh: '代表教育、導師，以及長輩和貴人的庇護。' }
    };
    // Career/life keywords per ten god (compact lookup)
    var TG_KEYWORDS = {
        '比肩':   { career: 'Independent work, partnerships, peers', life: 'Self-reliance, competition, willpower', careerZh: 'bazi_result.ten_gods.friend_career', lifeZh: 'bazi_result.ten_gods.friend_life' },
        '劫财':   { career: 'Competitive fields, sales, risk-taking', life: 'Bold action, financial volatility, social', careerZh: 'bazi_result.ten_gods.rob_wealth_career', lifeZh: 'bazi_result.ten_gods.rob_wealth_life' },
        '食神':   { career: 'Creative arts, teaching, food industry', life: 'Enjoyment, talent, expression, comfort', careerZh: 'bazi_result.ten_gods.eating_god_career', lifeZh: 'bazi_result.ten_gods.eating_god_life' },
        '伤官':   { career: 'Innovation, technology, entertainment', life: 'Rebellion, brilliance, sharp tongue', careerZh: 'bazi_result.ten_gods.hurting_officer_career', lifeZh: 'bazi_result.ten_gods.hurting_officer_life' },
        '偏财':   { career: 'Investment, business, speculative gains', life: 'Generosity, social connections, luck', careerZh: 'bazi_result.ten_gods.indirect_wealth_career', lifeZh: 'bazi_result.ten_gods.indirect_wealth_life' },
        '正财':   { career: 'Stable employment, finance, administration', life: 'Prudence, diligence, steady rewards', careerZh: 'bazi_result.ten_gods.direct_wealth_career', lifeZh: 'bazi_result.ten_gods.direct_wealth_life' },
        '七杀':   { career: 'Military, law, crisis management, surgery', life: 'Pressure, authority, transformation', careerZh: 'bazi_result.ten_gods.seven_killings_career', lifeZh: 'bazi_result.ten_gods.seven_killings_life' },
        '正官':   { career: 'Government, management, corporate hierarchy', life: 'Discipline, responsibility, reputation', careerZh: 'bazi_result.ten_gods.direct_officer_career', lifeZh: 'bazi_result.ten_gods.direct_officer_life' },
        '偏印':   { career: 'Research, occult studies, niche expertise', life: 'Solitude, unconventional thinking, intuition', careerZh: 'bazi_result.ten_gods.indirect_resource_career', lifeZh: 'bazi_result.ten_gods.indirect_resource_life' },
        '正印':   { career: 'Education, scholarship, mentoring, culture', life: 'Learning, nurturing, inner wisdom, patience', careerZh: 'bazi_result.ten_gods.direct_resource_career', lifeZh: 'bazi_result.ten_gods.direct_resource_life' }
    };

    var DGS_TABLE = [
        [0,1,2,3,4,5,6,7,8,9],[1,0,3,2,5,4,7,6,9,8],
        [8,9,0,1,2,3,4,5,6,7],[9,8,1,0,3,2,5,4,7,6],
        [6,7,8,9,0,1,2,3,4,5],[7,6,9,8,1,0,3,2,5,4],
        [4,5,6,7,8,9,0,1,2,3],[5,4,7,6,9,8,1,0,3,2],
        [2,3,4,5,6,7,8,9,0,1],[3,2,5,4,7,6,9,8,1,0]
    ];
    var TG_INDEX = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];

    function getStemShiShen(stemIdx, dmIdx) {
        var tgIdx = DGS_TABLE[dmIdx][stemIdx];
        return Object.assign({ index: tgIdx }, TG_NAMES[TG_INDEX[tgIdx]]);
    }

    // Format ten god display: show cn only
    function tgLabel(tg) {
        if (!tg) return '';
        return tg.cn;
    }

    // Get localized ten god keywords
    function tgKw(tgCn) {
        var kw = TG_KEYWORDS[tgCn];
        if (!kw) return { career: '', life: '' };
        return { career: isZh() ? t(kw.careerZh) : kw.career, life: isZh() ? t(kw.lifeZh) : kw.life };
    }

    // Build tooltip text for a ten god
    function tgTip(tg) {
        if (!tg) return '';
        var parts = [];
        if (isZh()) {
            if (tg.simpleZh) parts.push(tg.simpleZh);
            if (tg.descZh) parts.push(tg.descZh);
        } else {
            if (tg.en) parts.push(tg.en);
            if (tg.simple) parts.push(tg.simple);
            if (tg.desc) parts.push(tg.desc);
        }
        return parts.join('\n');
    }

    // Mobile: tap to toggle tooltip on dayun/ly cards and pillar labels, tap elsewhere to dismiss
    document.addEventListener('DOMContentLoaded', function() {
        if (!('ontouchstart' in window)) return;
        var active = null;
        document.addEventListener('click', function(e) {
            var target = e.target.closest('[data-tip]');
            if (active && active !== target) active.classList.remove('tg-active');
            if (target) {
                e.preventDefault();
                target.classList.toggle('tg-active');
                active = target.classList.contains('tg-active') ? target : null;
            } else {
                active = null;
            }
        });
    });

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
        '甲': { trait: 'Straightforward, ambitious, growth-oriented', wx: 'Yang Wood — like a tall oak', traitZh: 'bazi_result.dm_nature.jia_trait', wxZh: 'bazi_result.dm_nature.jia_wx' },
        '乙': { trait: 'Flexible, persistent, relationship-focused', wx: 'Yin Wood — like a willow', traitZh: 'bazi_result.dm_nature.yi_trait', wxZh: 'bazi_result.dm_nature.yi_wx' },
        '丙': { trait: 'Warm, charismatic, naturally generous', wx: 'Yang Fire — like the sun', traitZh: 'bazi_result.dm_nature.bing_trait', wxZh: 'bazi_result.dm_nature.bing_wx' },
        '丁': { trait: 'Insightful, refined, quietly determined', wx: 'Yin Fire — like a candle', traitZh: 'bazi_result.dm_nature.ding_trait', wxZh: 'bazi_result.dm_nature.ding_wx' },
        '戊': { trait: 'Steadfast, reliable, protective', wx: 'Yang Earth — like a mountain', traitZh: 'bazi_result.dm_nature.wu_trait', wxZh: 'bazi_result.dm_nature.wu_wx' },
        '己': { trait: 'Nurturing, patient, quietly diligent', wx: 'Yin Earth — like fertile soil', traitZh: 'bazi_result.dm_nature.ji_trait', wxZh: 'bazi_result.dm_nature.ji_wx' },
        '庚': { trait: 'Decisive, righteous, bold under pressure', wx: 'Yang Metal — like forged steel', traitZh: 'bazi_result.dm_nature.geng_trait', wxZh: 'bazi_result.dm_nature.geng_wx' },
        '辛': { trait: 'Elegant, detail-oriented, perfectionist', wx: 'Yin Metal — like fine jewelry', traitZh: 'bazi_result.dm_nature.xin_trait', wxZh: 'bazi_result.dm_nature.xin_wx' },
        '壬': { trait: 'Dynamic, resourceful, far-sighted', wx: 'Yang Water — like a great river', traitZh: 'bazi_result.dm_nature.ren_trait', wxZh: 'bazi_result.dm_nature.ren_wx' },
        '癸': { trait: 'Intuitive, perceptive, deep-thinking', wx: 'Yin Water — like morning dew', traitZh: 'bazi_result.dm_nature.gui_trait', wxZh: 'bazi_result.dm_nature.gui_wx' }
    };

    // ==================== FIVE ELEMENTS BODY MAP ====================
    // Chinese organ body map for zh mode
    var WX_BODY_ZH = { '金': '肺與大腸', '水': '腎與膀胱', '木': '肝與膽囊', '火': '心與小腸', '土': '脾與胃' };

    function wxBody(w) {
        return isZh() ? (WX_BODY_ZH[w] || w) : ({ '金':'Lungs & Large Intestine','水':'Kidneys & Bladder','木':'Liver & Gallbladder','火':'Heart & Small Intestine','土':'Spleen & Stomach' })[w];
    }
    var WX_BODY_EN = { '金': 'Lungs & Large Intestine', '水': 'Kidneys & Bladder', '木': 'Liver & Gallbladder', '火': 'Heart & Small Intestine', '土': 'Spleen & Stomach' };
    var WX_ORGAN_TIPS = {
        '金': 'Metal governs lungs & large intestine. Weak Metal may cause respiratory issues, constipation, dry skin. Protect against cold in autumn/winter, eat white foods like pear, lily bulb.',
        '水': 'Water governs kidneys & bladder. Weak Water may cause fatigue, lower back pain, tinnitus. Rest well in winter, sleep early, eat black foods like black beans, sesame.',
        '木': 'Wood governs liver & gallbladder. Weak Wood may cause emotional stagnation, headaches, dry eyes. Keep a positive mood in spring, avoid staying up late.',
        '火': 'Fire governs heart & small intestine. Weak Fire may cause insomnia, palpitations, poor circulation. Rest at midday in summer, eat red foods like dates, goji berries.',
        '土': 'Earth governs spleen & stomach. Weak Earth may cause poor digestion, bloating, fatigue. Eat regularly, chew thoroughly, avoid cold/raw foods.'
    };
    var WX_ORGAN_TIPS_ZH = {
        '金': 'bazi_result.organ_tips.metal',
        '水': 'bazi_result.organ_tips.water',
        '木': 'bazi_result.organ_tips.wood',
        '火': 'bazi_result.organ_tips.fire',
        '土': 'bazi_result.organ_tips.earth'
    };
    var WX_ORGAN_EXCESS = {
        '金': 'Excessive Metal suppresses Wood — may cause liver stagnation, stiff muscles. Exercise regularly, avoid being too rigid.',
        '水': 'Excessive Water suppresses Fire — may cause poor circulation, cold extremities, urinary issues. Get more sunlight, stay active.',
        '木': 'Excessive Wood suppresses Earth — may cause digestive issues, headaches, dizziness. Stay calm, avoid emotional extremes.',
        '火': 'Excessive Fire suppresses Metal — may cause cough, mouth ulcers, restlessness. Cool the body, avoid spicy foods.',
        '土': 'Excessive Earth suppresses Water — may cause kidney weakness, sluggish metabolism, weight gain. Control diet, exercise more.'
    };
    var WX_ORGAN_EXCESS_ZH = {
        '金': 'bazi_result.organ_excess.metal',
        '水': 'bazi_result.organ_excess.water',
        '木': 'bazi_result.organ_excess.wood',
        '火': 'bazi_result.organ_excess.fire',
        '土': 'bazi_result.organ_excess.earth'
    };
    // Tiao Hou (seasonal regulation) - month branch mapping, translatable
    var TIAOHOU = {
        '寅': { seasonKey: 'bazi_result.tiaohou.yin_season', tipKey: 'bazi_result.tiaohou.yin_tip' },
        '卯': { seasonKey: 'bazi_result.tiaohou.mao_season', tipKey: 'bazi_result.tiaohou.mao_tip' },
        '辰': { seasonKey: 'bazi_result.tiaohou.chen_season', tipKey: 'bazi_result.tiaohou.chen_tip' },
        '巳': { seasonKey: 'bazi_result.tiaohou.si_season', tipKey: 'bazi_result.tiaohou.si_tip' },
        '午': { seasonKey: 'bazi_result.tiaohou.wu_season', tipKey: 'bazi_result.tiaohou.wu_tip' },
        '未': { seasonKey: 'bazi_result.tiaohou.wei_season', tipKey: 'bazi_result.tiaohou.wei_tip' },
        '申': { seasonKey: 'bazi_result.tiaohou.shen_season', tipKey: 'bazi_result.tiaohou.shen_tip' },
        '酉': { seasonKey: 'bazi_result.tiaohou.you_season', tipKey: 'bazi_result.tiaohou.you_tip' },
        '戌': { seasonKey: 'bazi_result.tiaohou.xu_season', tipKey: 'bazi_result.tiaohou.xu_tip' },
        '亥': { seasonKey: 'bazi_result.tiaohou.hai_season', tipKey: 'bazi_result.tiaohou.hai_tip' },
        '子': { seasonKey: 'bazi_result.tiaohou.zi_season', tipKey: 'bazi_result.tiaohou.zi_tip' },
        '丑': { seasonKey: 'bazi_result.tiaohou.chou_season', tipKey: 'bazi_result.tiaohou.chou_tip' }
    };

    // ==================== AI ANALYSIS API ====================
    var analysisCache = {};
    var progressTimers = {};

    function startFakeProgress(containerId) {
        var bar = document.querySelector('#' + containerId + ' .ai-progress-bar');
        var pctEl = document.querySelector('#' + containerId + ' .ai-loading-pct');
        if (!bar) return null;
        var pct = 0;
        var target = 90;
        var step = 3;
        var timer = setInterval(function() {
            pct += step;
            if (pct >= target) { pct = target; step = 0; }
            bar.style.width = pct + '%';
            if (pctEl) pctEl.textContent = pct + '%';
            if (pct >= target) clearInterval(timer);
        }, 100);
        return timer;
    }

    function finishProgress(containerId) {
        if (progressTimers[containerId]) { clearInterval(progressTimers[containerId]); }
        var bar = document.querySelector('#' + containerId + ' .ai-progress-bar');
        var pctEl = document.querySelector('#' + containerId + ' .ai-loading-pct');
        if (bar) bar.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
    }

    function buildChartPayload(rt) {
        return {
            dayMaster: rt['ctg'][2],
            gender: rt['xb'] === '\u7537' ? 0 : 1,
            pillars: [
                { stem: rt['ctg'][0], branch: rt['cdz'][0] },
                { stem: rt['ctg'][1], branch: rt['cdz'][1] },
                { stem: rt['ctg'][2], branch: rt['cdz'][2] },
                { stem: rt['ctg'][3], branch: rt['cdz'][3] }
            ],
            wxCount: (function() {
                var nwx = rt['nwx'] || [0,0,0,0,0];
                return { 'Metal': nwx[0], 'Water': nwx[1], 'Wood': nwx[2], 'Fire': nwx[3], 'Earth': nwx[4] };
            })()
        };
    }

    function fetchAnalysis(type, chart, dayun, liunian, topGods) {
        var cacheKey = type + '_' + (dayun ? dayun.gan : '') + (dayun ? dayun.zhi : '') + (liunian ? liunian.year : '');
        if (analysisCache[cacheKey]) {
            return Promise.resolve(analysisCache[cacheKey]);
        }
        var payload = { type: type, chart: chart, lang: isZh() ? 'zh' : 'en' };
        if (type === 'dayun') payload.dayun = dayun;
        if (type === 'liunian') { payload.dayun = dayun; payload.liunian = liunian; }
        if (type === 'shishen') payload.topGods = topGods;

        return fetch('/api/bazi-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.success && d.result) {
                analysisCache[cacheKey] = d.result;
                return d.result;
            }
            throw new Error(d.error || 'Analysis failed');
        });
    }

    // ==================== BUILD DAYUN DETAIL (AI-powered) ====================
    function buildDayunDetail(dy, dmIdx, chartPayload) {
        var dyGan = dy['zfma'] || '';
        var dyZhi = dy['zfmb'] || '';
        var dyGanIdx = STEMS.indexOf(dyGan);
        var stemTg = dyGanIdx >= 0 ? getStemShiShen(dyGanIdx, dmIdx) : null;
        var nzsc = dy['nzsc'] || '';

        var loadingHTML = '<div class="detail-card" style="margin-bottom:0.5rem">';
        loadingHTML += '<div class="detail-card-header">' + t('bazi_result.dayun_overview') + '</div>';
        loadingHTML += '<div class="detail-card-body" id="dayun-loading"><div class="ai-loading"><div class="ai-loading-text">' + (isZh() ? '正在解讀您的命盤...' : 'Analyzing your chart...') + '</div><div class="ai-progress"><div class="ai-progress-bar"></div></div><div class="ai-loading-pct">0%</div><div class="ai-loading-hint">' + (isZh() ? '正在生成個性化解讀，通常需要 10-20 秒' : 'Generating your personalized reading, usually 10-20 seconds') + '</div></div></div></div>';

        var dayunData = {
            gan: dyGan, zhi: dyZhi,
            age: dy['zqage'] + '\u2013' + dy['zboz'],
            years: dy['syear'] + '\u2013' + dy['eyear'],
            nzsc: nzsc
        };

        setTimeout(function() { progressTimers['dayun-loading'] = startFakeProgress('dayun-loading'); }, 50);

        fetchAnalysis('dayun', chartPayload, dayunData)
            .then(function(result) {
                finishProgress('dayun-loading');
                var el = document.getElementById('dayun-detail-body');
                if (!el) return;
                if (!result) return;
                try {
                    var verdict = result.verdict || '';
                    var verdictColor = 'var(--accent)';
                    if (verdict === 'Good' || verdict === '\u5409') verdictColor = 'var(--good)';
                    else if (verdict === 'Challenging' || verdict === '\u51f6') verdictColor = 'var(--bad)';

                    var html = '<div class="detail-card" style="margin-bottom:0.5rem">';
                    html += '<div class="detail-card-header">' + t('bazi_result.dayun_overview') + '</div>';
                    html += '<div class="detail-card-body">';
                    html += '<div class="ai-verdict" style="color:' + verdictColor + ';font-weight:600;margin-bottom:0.5rem">' + verdict + '</div>';
                    if (result.summary) html += '<div class="detail-row" style="line-height:1.7;color:var(--ink)">' + result.summary + '</div>';
                    html += '</div></div>';

                    if (result.career || result.wealth || result.love || result.health) {
                        html += '<div class="detail-card" style="margin-bottom:0.5rem">';
                        html += '<div class="detail-card-body" style="line-height:1.65">';
                        if (result.career) html += '<div class="detail-row" style="margin-bottom:0.4rem"><span class="detail-key">' + (isZh() ? '\u4e8b\u696d' : 'Career') + '</span>' + result.career + '</div>';
                        if (result.wealth) html += '<div class="detail-row" style="margin-bottom:0.4rem"><span class="detail-key">' + (isZh() ? '\u8ca1\u904b' : 'Wealth') + '</span>' + result.wealth + '</div>';
                        if (result.love) html += '<div class="detail-row" style="margin-bottom:0.4rem"><span class="detail-key">' + (isZh() ? '\u611f\u60c5' : 'Love') + '</span>' + result.love + '</div>';
                        if (result.health) html += '<div class="detail-row"><span class="detail-key">' + (isZh() ? '\u5065\u5eb7' : 'Health') + '</span>' + result.health + '</div>';
                        html += '</div></div>';
                    }
                    el.innerHTML = html;
                } catch (renderErr) {
                    console.warn('BaZi render error:', renderErr);
                }
            })
            .catch(function(err) {
                var el = document.getElementById('dayun-detail-body');
                if (el) {
                    el.innerHTML = '<div class="detail-card"><div class="detail-card-body" style="color:var(--ink-2);text-align:center;padding:1rem">' +
                        (isZh() ? '\u5206\u6790\u6682\u6642\u4e0d\u53ef\u7528\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002' : 'Analysis temporarily unavailable. Please try again later.') + '</div></div>';
                }
                console.warn('BaZi analysis error:', err);
            });

        return loadingHTML;
    }

    // ==================== BUILD LIUNIAN DETAIL (AI-powered) ====================
    function buildLiunianDetail(ly, dmIdx, dyGan, dyZhi, chartPayload) {
        var lyGanZhi = ly['lye'] || '';
        var lyGan = lyGanZhi.substring(0, 1);
        var lyZhi = lyGanZhi.substring(1, 2);

        var loadingHTML = '<div class="detail-card" style="margin-bottom:0.5rem">';
        loadingHTML += '<div class="detail-card-header">' + t('bazi_result.liunian_year_overview') + '</div>';
        loadingHTML += '<div class="detail-card-body" id="liunian-loading"><div class="ai-loading"><div class="ai-loading-text">' + (isZh() ? '正在解讀您的命盤...' : 'Analyzing your chart...') + '</div><div class="ai-progress"><div class="ai-progress-bar"></div></div><div class="ai-loading-pct">0%</div><div class="ai-loading-hint">' + (isZh() ? '正在生成個性化解讀，通常需要 10-20 秒' : 'Generating your personalized reading, usually 10-20 seconds') + '</div></div></div></div>';

        var dayunData = { gan: dyGan, zhi: dyZhi };
        var liunianData = { gan: lyGan, zhi: lyZhi, year: ly['year'] || 0 };

        setTimeout(function() { progressTimers['liunian-loading'] = startFakeProgress('liunian-loading'); }, 50);

        fetchAnalysis('liunian', chartPayload, dayunData, liunianData)
            .then(function(result) {
                finishProgress('liunian-loading');
                var el = document.getElementById('liunian-detail-body');
                if (!el || !result) return;
                try {
                    var verdict = result.verdict || '';
                    var verdictColor = 'var(--accent)';
                    if (verdict === 'Good' || verdict === '\u5409') verdictColor = 'var(--good)';
                    else if (verdict === 'Challenging' || verdict === '\u51f6') verdictColor = 'var(--bad)';

                    var html = '<div class="detail-card" style="margin-bottom:0.5rem">';
                    html += '<div class="detail-card-header">' + t('bazi_result.liunian_year_overview') + '</div>';
                    html += '<div class="detail-card-body">';
                    html += '<div class="ai-verdict" style="color:' + verdictColor + ';font-weight:600;margin-bottom:0.5rem">' + verdict + '</div>';
                    if (result.summary) html += '<div class="detail-row" style="line-height:1.7;color:var(--ink)">' + result.summary + '</div>';
                    if (result.advice) html += '<div class="detail-row" style="margin-top:0.5rem;color:var(--ink)"><span class="detail-key">' + (isZh() ? '\u5efa\u8b70' : 'Advice') + '</span>' + result.advice + '</div>';
                    html += '</div></div>';
                    el.innerHTML = html;
                } catch (renderErr) {
                    console.warn('BaZi render error:', renderErr);
                }
            })
            .catch(function(err) {
                var el = document.getElementById('liunian-detail-body');
                if (el) {
                    el.innerHTML = '<div class="detail-card"><div class="detail-card-body" style="color:var(--ink-2);text-align:center;padding:1rem">' +
                        (isZh() ? '\u5206\u6790\u6682\u6642\u4e0d\u53ef\u7528\u3002' : 'Analysis temporarily unavailable.') + '</div></div>';
                }
            });

        return loadingHTML;
    }

    // ==================== BUILD HEALTH INTERPRETATION ====================
    function buildHealthSection(nwx, dmIdx, rt) {
        var dm = rt['ctg'][2];
        var monthBranch = rt['cdz'][1];
        var maxCount = Math.max.apply(null, nwx);
        var absent = [], excessive = [], strong = [];
        for (var i = 0; i < 5; i++) {
            if (nwx[i] === 0) absent.push(WX_NAMES[i]);
            else if (nwx[i] >= 4) excessive.push(WX_NAMES[i]);
            else if (nwx[i] === maxCount) strong.push(WX_NAMES[i]);
        }

        var html = '<section class="section" id="section-health">';
        html += '<h2 class="section-title">' + t('bazi_result.section_health') + '</h2>';
        html += '<p class="section-desc">' + t('bazi_result.section_health_desc') + '</p>';

        var hasIssues = (absent.length > 0 || excessive.length > 0);
        if (hasIssues) {
            html += '<div class="detail-grid">';

            // Absent elements - health vulnerabilities
            if (absent.length > 0) {
                html += '<div class="detail-card">';
                html += '<div class="detail-card-header" style="color:var(--bad)">' + t('bazi_result.health_missing') + '</div>';
                html += '<div class="detail-card-body">';
                for (var a = 0; a < absent.length; a++) {
                    var w = absent[a];
                    var tipText = isZh() ? t(WX_ORGAN_TIPS_ZH[w]) : WX_ORGAN_TIPS[w];
                    html += '<div class="detail-row" style="margin-bottom:0.4rem">';
                    html += '<div><strong style="color:' + WX_COLORS[w] + '">' + (isZh() ? w : WX_EN[w]) + '</strong> → ' + wxBody(w) + '</div>';
                    html += '<div style="color:var(--ink-2);font-size:0.85rem;line-height:1.6">' + tipText + '</div>';
                    html += '</div>';
                }
                html += '</div></div>';
            }

            // Excessive elements - overactive organs
            if (excessive.length > 0) {
                html += '<div class="detail-card">';
                html += '<div class="detail-card-header" style="color:var(--accent)">' + t('bazi_result.health_excessive') + '</div>';
                html += '<div class="detail-card-body">';
                for (var e = 0; e < excessive.length; e++) {
                    var w = excessive[e];
                    var excessText = isZh() ? t(WX_ORGAN_EXCESS_ZH[w]) : WX_ORGAN_EXCESS[w];
                    var clash = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
                    var target = clash[w];
                    html += '<div class="detail-row" style="margin-bottom:0.4rem">';
                    html += '<div><strong style="color:' + WX_COLORS[w] + '">' + (isZh() ? w : WX_EN[w]) + (isZh() ? ' 過盛 → 克制 ' : ' excessive → controls ') + '<strong style="color:' + WX_COLORS[target] + '">' + (isZh() ? target : WX_EN[target]) + '</strong> (' + wxBody(target) + ')</div>';
                    html += '<div style="color:var(--ink-2);font-size:0.85rem;line-height:1.6">' + excessText + '</div>';
                    html += '</div>';
                }
                html += '</div></div>';
            }

            html += '</div>';
        } else {
            html += '<div class="detail-card">';
            html += '<div class="detail-card-body" style="text-align:center;color:var(--good);padding:0.6rem">';
            html += t('bazi_result.health_balanced');
            html += '</div></div>';
        }

        html += '</section>';
        return html;
    }

    // ==================== SHIER CHANGSHENG ====================
    var NZSC_EN = { '长生':'Birth', '沐浴':'Bath', '冠带':'Crown', '临官':'Prosperity', '帝旺':'Peak', '衰':'Decline', '病':'Illness', '死':'Death', '墓':'Grave', '绝':'Extinction', '胎':'Conception', '养':'Nurture', '大吉':'Great Fortune', '吉':'Auspicious', '凶':'Inauspicious' };

    function getNZSCClass(nzsc) {
        if (!nzsc) return 'neutral';
        if (nzsc.indexOf('大吉') >= 0 || nzsc.indexOf('吉') >= 0) return 'auspicious';
        if (nzsc.indexOf('凶') >= 0) return 'inauspicious';
        return 'neutral';
    }

    function translateNZSC(nzsc) {
        var result = nzsc;
        for (var cn in NZSC_EN) {
            if (nzsc.indexOf(cn) >= 0) result = result.replace(cn, NZSC_EN[cn]);
        }
        return result;
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
                    var bzIdx2 = ['印','卩','比','劫','伤','食','财','才','官','杀'].indexOf(bzName);
                    if (bzIdx2 >= 0) {
                        var bzFull = TG_INDEX[bzIdx2];
                        if (bzFull) tgCount[bzFull] = (tgCount[bzFull] || 0) + 1;
                    }
                }
            }
        }
        var sorted = Object.keys(tgCount).sort(function(a, b) { return tgCount[b] - tgCount[a]; });
        var top3 = sorted.slice(0, 3);

        // Build AI interpretation
        var topGodsData = top3.map(function(cn) { return { cn: cn, count: tgCount[cn] }; });
        var cardId = 'shishen-ai-' + Date.now();

        var html = '<div class="info-card">';
        html += '<div id="' + cardId + '" class="info-item">';
        html += '<div class="ai-loading"><div class="ai-loading-text">' + (isZh() ? '正在解讀您的命盤...' : 'Analyzing your chart...') + '</div><div class="ai-progress"><div class="ai-progress-bar"></div></div><div class="ai-loading-pct">0%</div><div class="ai-loading-hint">' + (isZh() ? '正在生成個性化解讀，通常需要 10-20 秒' : 'Generating your personalized reading, usually 10-20 seconds') + '</div></div>';
        html += '</div>';
        html += '</div>';

        // Fetch AI shishen analysis
        try {
            var chartPayload = { dayMaster: (rt['ctg'] || [])[2] || '', gender: rt['xb'], wxCount: rt['nwx'], pillars: [] };
            var ctg = rt['ctg'] || [];
            var cdz = rt['cdz'] || [];
            for (var p = 0; p < 4; p++) {
                chartPayload.pillars.push({ stem: ctg[p] || '', branch: cdz[p] || '' });
            }
            setTimeout(function() { progressTimers[cardId] = startFakeProgress(cardId); }, 50);
            fetchAnalysis('shishen', chartPayload, null, null, topGodsData)
                .then(function(result) {
                    finishProgress(cardId);
                    var card = document.getElementById(cardId);
                    if (!card || !result) return;
                    try {
                        var items = [];
                        var labels = isZh()
                            ? { personality: '核心性格', career: '事業方向', love: '感情特點', wealth: '財運模式', health: '健康提醒', summary: '命盤總結' }
                            : { personality: 'Core Personality', career: 'Career Direction', love: 'Relationships', wealth: 'Wealth Pattern', health: 'Health Watch', summary: 'Key Advice' };
                        var fields = ['personality', 'career', 'love', 'wealth', 'health', 'summary'];
                        for (var i = 0; i < fields.length; i++) {
                            var f = fields[i];
                            if (result[f]) {
                                items.push('<span class="info-label">' + labels[f] + '</span><span class="info-value" style="color:var(--ink-2);font-size:0.88rem">' + result[f] + '</span>');
                            }
                        }
                        card.innerHTML = items.join('');
                    } catch (renderErr) {
                        console.warn('Shishen render error:', renderErr);
                    }
                })
                .catch(function(err) {
                    var card = document.getElementById(cardId);
                    if (card) card.innerHTML = '';
                });
        } catch (aiErr) {
            console.warn('Shishen AI skipped:', aiErr);
        }

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
            html += '<div class="wx-summary-item wx-dominant"><span class="wx-summary-label">' + t('bazi_result.wx_strongest') + '</span> ' + dominant.map(function(w) { return '<span style="color:' + WX_COLORS[w] + '">' + (isZh() ? w : WX_EN[w]) + '</span>'; }).join(' ') + ' (' + maxCount + ')</div>';
        }
        if (excess.length > 0) {
            html += '<div class="wx-summary-item wx-excess"><span class="wx-summary-label" style="color:var(--bad)">' + t('bazi_result.wx_excessive') + '</span> ';
            html += excess.map(function(w) {
                var excessText = isZh() ? t(WX_ORGAN_EXCESS_ZH[w]) : WX_ORGAN_EXCESS[w];
                return '<span style="color:' + WX_COLORS[w] + '">' + (isZh() ? w : WX_EN[w]) + '</span> — ' + excessText;
            }).join('<br>');
            html += '</div>';
        }
        if (weak.length > 0) {
            html += '<div class="wx-summary-item wx-weak"><span class="wx-summary-label">' + t('bazi_result.wx_absent') + '</span> ';
            html += weak.map(function(w) {
                var tipText = isZh() ? t(WX_ORGAN_TIPS_ZH[w]) : WX_ORGAN_TIPS[w];
                return '<span style="color:' + WX_COLORS[w] + '">' + (isZh() ? w : WX_EN[w]) + '</span> — <em>' + wxBody(w) + '</em><br><span class="detail-key">' + t('bazi_result.wx_tip') + '</span>' + tipText;
            }).join('<br><br>');
            html += '</div>';
        }
        if (weak.length === 0 && excess.length === 0) {
            // No summary needed when balanced
        }
        html += '</div>';
        return html;
    }

    // ==================== RENDER SIDEBAR RECOMMENDATIONS ====================
    function renderSidebarRecommendations(sidebar) {
        var html = '<h3 class="sidebar-title">' + t('bazi_result.sidebar_title') + '</h3>';
        html += '<div id="sidebar-cards"><p style="font-size:0.88rem;color:var(--ink-3);text-align:center;padding:2rem 0">' + t('bazi_result.sidebar_loading') + '</p></div>';
        html += '<a href="/five-elements-test" class="sidebar-card sidebar-element-cta" style="text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.06),rgba(212,175,55,0.12));border:1px solid rgba(212,175,55,0.35);margin-top:1.2rem;padding:1.2rem 1rem;">';
        html += '<div style="font-size:0.82rem;font-weight:600;color:#D4AF37;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.6rem;">' + t('bazi_result.sidebar_element_badge') + '</div>';
        html += '<h3 style="margin:0 0 0.5rem;color:var(--text-primary);font-size:0.95rem;line-height:1.4;">' + t('bazi_result.sidebar_element_title') + '</h3>';
        html += '<p style="margin:0 0 0.8rem;color:var(--ink-2);font-size:0.88rem;line-height:1.6;">' + t('bazi_result.sidebar_element_desc') + '</p>';
        html += '<div style="font-size:0.82rem;color:#D4AF37;font-weight:600;letter-spacing:0.02em;">' + t('bazi_result.sidebar_element_cta') + '</div>';
        html += '</a>';
        sidebar.innerHTML = html;

        fetch('bazi-recommendations.json')
            .then(function(res) { return res.json(); })
            .then(function(articles) {
                // Only take 3 articles
                var list = articles.slice(0, 3);
                var zh = isZh();
                var cardsHtml = '';
                for (var i = 0; i < list.length; i++) {
                    var a = list[i];
                    var blogPrefix = zh ? '/zh/blog/' : '/blog/';
                    var showTitle = zh ? (a.titleZh || a.title) : a.title;
                    var showCat = zh ? (a.categoryZh || a.category) : a.category;
                    cardsHtml += '<a href="' + blogPrefix + a.slug + '" class="sidebar-card">';
                    cardsHtml += '<div class="sidebar-card-cat">' + (showCat || '') + '</div>';
                    cardsHtml += '<h3>' + (showTitle || '') + '</h3>';
                    if (a.readTime) cardsHtml += '<div class="sidebar-card-meta">' + a.readTime + t('bazi_result.sidebar_min_read') + '</div>';
                    cardsHtml += '</a>';
                }
                var container = document.getElementById('sidebar-cards');
                if (container) container.innerHTML = cardsHtml;
            })
            .catch(function() {
                var container = document.getElementById('sidebar-cards');
                if (container) container.innerHTML = '<p style="font-size:0.88rem;color:var(--ink-3);text-align:center;padding:1rem 0">' + t('bazi_result.sidebar_load_error') + '</p>';
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

        var gender = rt['xb'] === '男' ? t('bazi_result.gender_male') : t('bazi_result.gender_female');
        var zodiac = isZh() ? rt['sx'] : (ZODIAC_EN[rt['sx']] || rt['sx']);
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
        var pillarLabels = [t('bazi_result.pillar_year'), t('bazi_result.pillar_month'), t('bazi_result.pillar_day'), t('bazi_result.pillar_hour')];
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

            var ganYin = STEM_WX[STEMS.indexOf(gan)] % 2 === 0 ? t('bazi_result.yang') : t('bazi_result.yin');
            var zhiWxOnly = isZh() ? zhiWx : WX_EN[zhiWx];
            // 地支十神：取藏干主气（primary）
            var zhiTg = cangGanList.length > 0 ? cangGanList[0].tg : null;
            pillarsHTML += '<div class="pillar">';
            pillarsHTML += '<div class="pillar-label">' + pillarLabels[p] + '</div>';
            pillarsHTML += '<div class="pillar-stem">';
            pillarsHTML += '<span class="pillar-char">' + gan + '</span>';
            pillarsHTML += '<span class="pillar-wx" style="color:' + WX_COLORS[ganWx] + '">' + (isZh() ? ganWx : WX_EN[ganWx]) + '</span>';
            if (ganTg) {
                pillarsHTML += '<span class="pillar-tg">' + tgLabel(ganTg) + '</span>';
            } else {
                pillarsHTML += '<span class="pillar-tg pillar-tg-self">' + t('bazi_result.day_master_self') + '</span>';
            }
            pillarsHTML += '</div>';
            pillarsHTML += '<div class="pillar-branch">';
            pillarsHTML += '<span class="pillar-char">' + zhi + '</span>';
            pillarsHTML += '<span class="pillar-wx" style="color:' + WX_COLORS[zhiWx] + '">' + zhiWxOnly + '</span>';
            if (zhiTg) {
                pillarsHTML += '<span class="pillar-tg">' + tgLabel(zhiTg) + '</span>';
            }
            pillarsHTML += '</div>';
            pillarsHTML += '</div>';
        }

        // Build chart payload for AI analysis
        var chartPayload = buildChartPayload(rt);

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
            dyHTML += '<h2 class="section-title">' + t('bazi_result.section_dayun') + '</h2>';
            if (currentDayunIdx >= 0) {
                var cdy = rt['dy'][currentDayunIdx];
                var cdyTg = getStemShiShen(STEMS.indexOf(cdy['zfma']), dmIdx);
                dyHTML += '<p class="current-hint">' + t('bazi_result.dayun_currently_in') + ' <strong>' + (cdyTg ? tgLabel(cdyTg) : '') + '</strong> ' + t('bazi_result.dayun_period') + ' · ' + t('bazi_result.dayun_age') + ' ' + cdy['zqage'] + '–' + cdy['zboz'] + ' · ' + cdy['syear'] + '–' + cdy['eyear'] + '</p>';
            }
            dyHTML += '<div class="dayun-grid">';
            for (var k = 0; k < Math.min(rt['dy'].length, 8); k++) {
                var dy = rt['dy'][k];
                var dyGanIdx2 = STEMS.indexOf(dy['zfma']);
                var dyStemTg = dyGanIdx2 >= 0 ? getStemShiShen(dyGanIdx2, dmIdx) : null;
                var dyGanWx = dyGanIdx2 >= 0 ? (isZh() ? WX_NAMES[STEM_WX[dyGanIdx2]] : WX_EN[WX_NAMES[STEM_WX[dyGanIdx2]]]) : '';
                // 大运地支十神
                var dyBranchIdx = BRANCHES.indexOf(dy['zfmb']);
                var dyBranchCg = dyBranchIdx >= 0 ? getBranchShiShen(dyBranchIdx, dmIdx) : [];
                var dyBranchTg = dyBranchCg.length > 0 ? dyBranchCg[0].tg : null;
                var isCurrent = k === currentDayunIdx;

                dyHTML += '<div class="dayun-card' + (isCurrent ? ' dayun-current' : '') + '" data-dy-index="' + k + '"' + (dyStemTg ? ' data-tip="' + tgTip(dyStemTg).replace(/"/g, '&quot;').replace(/\n/g, ' | ') + '"' : '') + '>';
                if (isCurrent) dyHTML += '<span class="badge-current">' + (isZh() ? '當前' : 'NOW') + '</span>';
                dyHTML += '<div class="dayun-ganzhi">' + (dy['zfma'] || '') + (dy['zfmb'] || '') + '</div>';
                if (dyStemTg) dyHTML += '<div class="dayun-tg dayun-tg-stem">' + tgLabel(dyStemTg) + '</div>';
                if (dyBranchTg) dyHTML += '<div class="dayun-tg dayun-tg-branch">' + tgLabel(dyBranchTg) + '</div>';
                dyHTML += '<div class="dayun-age">' + dy['zqage'] + '–' + dy['zboz'] + '</div>';
                dyHTML += '<div class="dayun-years">' + dy['syear'] + '–' + dy['eyear'] + '</div>';
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
                    '<span class="tag">' + t('bazi_result.zodiac_label') + ' ' + zodiac + '</span>' +
                    '<span class="tag">' + gender + '</span>' +
                '</div>' +
                '<div class="header-dm-banner" style="background:var(--accent-bg);border:1px solid var(--accent-soft);border-radius:var(--radius);padding:0.5rem 1rem;margin-top:0.6rem;display:inline-block">' +
                    '<span style="font-size:0.82rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em">' + t('bazi_result.day_master_label') + '</span><br>' +
                    '<span style="font-family:var(--serif);font-size:1.15rem;color:var(--ink);font-weight:600">' + (dmElement ? (isZh() ? dmElement : WX_EN[dmElement]) : '') + '</span>' +
                    '<span style="font-size:0.88rem;color:var(--ink-2);margin-left:0.5rem">— ' + (DM_NATURE[dayMaster] ? (isZh() ? t(DM_NATURE[dayMaster].wxZh) : DM_NATURE[dayMaster].wx) : '') + '</span>' +
                '</div>' +
            '</header>' +

            // Day Master Profile
            buildDmProfile(rt) +

            // Two-column: Pillars + Elements
            '<div class="main-grid">' +
                '<section class="section">' +
                    '<h2 class="section-title">' + t('bazi_result.section_four_pillars') + '</h2>' +
                    '<div class="pillars-grid">' + pillarsHTML + '</div>' +
                '</section>' +
                '<section class="section">' +
                    '<h2 class="section-title">' + t('bazi_result.section_five_elements') + '</h2>' +
                    '<div class="wx-bars">' +
                        wxData.map(function(w) {
                            var pct = Math.round((w.count / 8) * 100);
                            return '<div class="wx-row">' +
                                '<span class="wx-label" style="color:' + w.color + '">' + (isZh() ? w.name : w.en) + '</span>' +
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

            // CTA — Premium conversion
            '<section class="cta-box"><div class="cta-box-inner">' +
                '<div class="cta-badge">' + t('bazi_result.cta_badge') + '</div>' +
                '<h3 class="cta-title">' + t('bazi_result.cta_title') + '</h3>' +
                '<p class="cta-subtitle">' + t('bazi_result.cta_subtitle') + '</p>' +
                '<div class="cta-list">' +
                    '<span>' + t('bazi_result.cta_feat1') + '</span><span>' + t('bazi_result.cta_feat2') + '</span>' +
                    '<span>' + t('bazi_result.cta_feat3') + '</span><span>' + t('bazi_result.cta_feat4') + '</span>' +
                    '<span>' + t('bazi_result.cta_feat5') + '</span><span>' + t('bazi_result.cta_feat6') + '</span>' +
                '</div>' +
                '<a href="#" class="cta-btn" onclick="event.preventDefault();var b=this;b.textContent=\'' + t('bazi_result.cta_btn_loading') + '\';fetch(\'/api/create-checkout\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({items:[{id:\'prod_28PqAKMEom5WGRH1w9O35n\',name:\'BaZi Life Guidance\',price:0,quantity:1}]})}).then(function(r){return r.json()}).then(function(d){if(d.checkoutUrl)window.open(d.checkoutUrl,\'_blank\');else{b.textContent=\'' + t('bazi_result.cta_btn') + '\';alert(\'' + t('bazi_result.cta_btn_error_checkout') + '\')}}).catch(function(){b.textContent=\'' + t('bazi_result.cta_btn') + '\';alert(\'' + t('bazi_result.cta_btn_error_network') + '\')})">' + t('bazi_result.cta_btn') + '</a>' +
                '<div class="cta-trust">' +
                    '<span><span class="trust-dot"></span>' + t('bazi_result.cta_trust1') + '</span>' +
                    '<span><span class="trust-dot"></span>' + t('bazi_result.cta_trust2') + '</span>' +
                    '<span><span class="trust-dot"></span>' + t('bazi_result.cta_trust3') + '</span>' +
                '</div>' +
            '</div></section>';

        // Render share bar
        var shareContainer = document.getElementById('bazi-share-container');
        if (shareContainer && window.ToolShare) {
            shareContainer.style.display = 'block';
            var shareText = isZh()
                ? '我的八字排盤 — ' + (DM_NATURE[dayMaster] ? DM_NATURE[dayMaster].wxZh : dmElement) + '日主 | DaoEssence'
                : 'My BaZi Chart — ' + dmElement + ' Day Master | DaoEssence';
            window.ToolShare.render(shareContainer, { text: shareText });
        }

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

                detailTitle.textContent = t('bazi_result.dayun_age') + ' ' + dy['zqage'] + '–' + dy['zboz'] + '  ·  ' + dy['syear'] + '–' + dy['eyear'];
                detailBody.innerHTML = buildDayunDetail(dy, dmIdx, chartPayload);

                // Flow Years
                if (dy['ly'] && dy['ly'].length > 0) {
                    var lyHTML = '<h4 class="liunian-title">' + t('bazi_result.liunian_yearly') + '</h4>';
                    lyHTML += '<div class="liunian-grid">';
                    dy['ly'].forEach(function(ly, lyIdx) {
                        var lyGanZhi = ly['lye'] || '';
                        var lyGan = lyGanZhi.substring(0, 1);
                        var lyZhi = lyGanZhi.substring(1, 2);
                        var lyGanIdx = STEMS.indexOf(lyGan);
                        var lyTg = lyGanIdx >= 0 ? getStemShiShen(lyGanIdx, dmIdx) : null;
                        // 流年地支十神
                        var lyBranchIdx = BRANCHES.indexOf(lyZhi);
                        var lyBranchCg = lyBranchIdx >= 0 ? getBranchShiShen(lyBranchIdx, dmIdx) : [];
                        var lyBranchTg = lyBranchCg.length > 0 ? lyBranchCg[0].tg : null;
                        var lyYear = ly['year'] || 0;
                        var isCurrentYear = (lyYear === currentYear);

                        lyHTML += '<div class="ly-card' + (isCurrentYear ? ' ly-current' : '') + '" data-ly-index="' + lyIdx + '" data-ly-year="' + lyYear + '"' + (lyTg ? ' data-tip="' + tgTip(lyTg).replace(/"/g, '&quot;').replace(/\n/g, ' | ') + '"' : '') + '>';
                        if (isCurrentYear) lyHTML += '<span class="badge-now">' + (isZh() ? '當前' : 'NOW') + '</span>';
                        lyHTML += '<div class="ly-ganzhi">' + lyGanZhi + '</div>';
                        if (lyTg) lyHTML += '<div class="ly-tg ly-tg-stem">' + tgLabel(lyTg) + '</div>';
                        if (lyBranchTg) lyHTML += '<div class="ly-tg ly-tg-branch">' + tgLabel(lyBranchTg) + '</div>';
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

                        lyTitle.textContent = (isZh() ? '流年 ' : 'Year ') + lyYear;
                        lyBody.innerHTML = buildLiunianDetail(lyData, dmIdx, dy['zfma'] || '', dy['zfmb'] || '', chartPayload);
                        lyDetail.classList.add('show');
                        lyDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                    lyItems.forEach(function(lyItem) {
                        lyItem.addEventListener('click', function() { openLy(this); });
                    });
                    if (lyClose) {
                        lyClose.addEventListener('click', function() {
                            lyDetail.classList.remove('show');
                            if (activeLy) { activeLy.classList.remove('ly-active'); activeLy = null; }
                        });
                    } // end if (lyClose)

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
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    detailPanel.classList.remove('show');
                    if (activeItem) { activeItem.classList.remove('active'); activeItem = null; }
                });
            }

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
        // Set localized page title
        if (isZh()) {
            document.title = t('bazi_result.page_title');
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', t('bazi_result.page_description'));
        }

        var hash = window.location.hash;
        if (!hash || hash.length < 2) {
            showError(t('bazi_result.error_no_data'));
            return;
        }
        try {
            var params = JSON.parse(decodeURIComponent(hash.substring(1)));
            var yy = parseInt(params.yy), mm = parseInt(params.mm),
                dd = parseInt(params.dd), hh = parseInt(params.hh), xb = parseInt(params.xb);

            if (isNaN(yy) || isNaN(mm) || isNaN(dd) || isNaN(hh) || isNaN(xb)) {
                showError(t('bazi_result.error_invalid')); return;
            }

            var p = new paipan();
            p.pdy = true;
            var rt = p.fatemaps(xb, yy, mm, dd, hh, 0, 0);

            if (!rt) { showError(t('bazi_result.error_calc_failed')); return; }
            renderResult(rt);

            // Track result display
            if (window.DaoTrack) {
                window.DaoTrack.toolResult('bazi');
            }
        } catch (e) {
            showError(t('bazi_result.error_parse_failed'));
            console.error('BaZi error:', e);
        }
    }

    function showError(msg) {
        document.getElementById('bazi-loading').style.display = 'none';
        var err = document.getElementById('bazi-error');
        err.style.display = 'flex';
        err.innerHTML = '<p>' + msg + '</p><a href="/#free-bazi">' + t('bazi_result.error_try_again') + '</a>';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-render page when language is switched (reload to re-apply translations)
    document.addEventListener('daoessence:i18n-changed', function() {
        // Re-trigger init to rebuild all dynamic content with new language
        try { init(); } catch(e) { console.warn('BaZi re-init error:', e); }
    });
})();
