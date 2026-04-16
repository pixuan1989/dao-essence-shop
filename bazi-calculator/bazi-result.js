/**
 * DaoEssence BaZi Result Page
 * Reads params from URL hash, renders full chart with interpretations.
 * Powered by paipan.js — all interpretations driven by engine data.
 */
(function () {
    'use strict';

    // ==================== CONSTANTS ====================
    var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var WX_NAMES = ['金','水','木','火','土'];
    var WX_COLORS = { '金': '#C9B37A', '水': '#5B8FB9', '木': '#6B8E6B', '火': '#C25B56', '土': '#B8860B' };
    var WX_ICONS = { '金': '⚔️', '水': '💧', '木': '🌿', '火': '🔥', '土': '⛰️' };
    var STEM_WX = [2, 2, 3, 3, 4, 4, 0, 0, 1, 1]; // stem index → wuxing code
    var BRANCH_WX = [1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 4, 1]; // branch index → wuxing code

    // Hidden stems table (from paipan zcg)
    var ZCG_TABLE = [
        [9,-1,-1],  // 子: 癸
        [5,9,7],    // 丑: 己癸辛
        [0,2,4],    // 寅: 甲丙戊
        [1,-1,-1],  // 卯: 乙
        [4,1,9],    // 辰: 戊乙癸
        [2,4,6],    // 巳: 丙戊庚
        [3,5,-1],   // 午: 丁己
        [5,1,3],    // 未: 己丁乙
        [6,8,4],    // 申: 庚壬戊
        [7,-1,-1],  // 酉: 辛
        [4,7,3],    // 戌: 戊辛丁
        [8,0,-1]    // 亥: 壬甲
    ];

    // ==================== TEN GODS ENGINE ====================
    // Ten Gods names in Chinese and English
    var TEN_GODS_NAMES = {
        '比肩': { cn: '比肩', en: 'Friend (Bi Jian)', short: 'Friend' },
        '劫财': { cn: '劫财', en: 'Rob Wealth (Jie Cai)', short: 'Rob Wealth' },
        '食神': { cn: '食神', en: 'Eating God (Shi Shen)', short: 'Eating God' },
        '伤官': { cn: '伤官', en: 'Hurting Officer (Shang Guan)', short: 'Hurting Officer' },
        '偏财': { cn: '偏财', en: 'Unconventional Wealth (Pian Cai)', short: 'Windfall' },
        '正财': { cn: '正财', en: 'Direct Wealth (Zheng Cai)', short: 'Income' },
        '七杀': { cn: '七杀', en: 'Seven Killings (Qi Sha)', short: 'Seven Killings' },
        '正官': { cn: '正官', en: 'Direct Officer (Zheng Guan)', short: 'Authority' },
        '偏印': { cn: '偏印', en: 'Indirect Resource (Pian Yin)', short: 'Odd Resource' },
        '正印': { cn: '正印', en: 'Direct Resource (Zheng Yin)', short: 'Resource' }
    };

    // Day Gan ShiShen lookup table (from paipan dgs)
    // dgs[dayStemIndex][otherStemIndex] → ten gods index (0-9)
    // Index mapping: 0=比肩,1=劫财,2=食神,3=伤官,4=偏财,5=正财,6=七杀,7=正官,8=偏印,9=正印
    var DGS_TABLE = [
        [2,3,1,0,9,8,7,6,5,4], // 甲
        [3,2,0,1,8,9,6,7,4,5], // 乙
        [5,4,2,3,1,0,9,8,7,6], // 丙
        [4,5,3,2,0,1,8,9,6,7], // 丁
        [7,6,5,4,2,3,1,0,9,8], // 戊
        [6,7,4,5,3,2,0,1,8,9], // 己
        [9,8,7,6,5,4,2,3,1,0], // 庚
        [8,9,6,7,4,5,3,2,0,1], // 辛
        [1,0,9,8,7,6,5,4,2,3], // 壬
        [0,1,8,9,6,7,4,5,3,2]  // 癸
    ];
    var TG_INDEX = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];

    /**
     * Calculate the Ten Gods (Shi Shen) for a stem relative to the day master.
     * @param {number} stemIdx - Index of the stem (0=甲...9=癸)
     * @param {number} dayMasterIdx - Index of the day master stem
     * @returns {object} { name: '正官', en: 'Direct Officer', ... }
     */
    function getStemShiShen(stemIdx, dayMasterIdx) {
        var tgIdx = DGS_TABLE[dayMasterIdx][stemIdx];
        var name = TG_INDEX[tgIdx];
        return Object.assign({ index: tgIdx }, TEN_GODS_NAMES[name]);
    }

    /**
     * Calculate the Ten Gods for hidden stems of a branch relative to the day master.
     * @param {number} branchIdx - Index of the branch (0=子...11=亥)
     * @param {number} dayMasterIdx - Index of the day master stem
     * @returns {array} [{stem:'癸', stemIdx:9, tg:{name:'正官',...}}, ...]
     */
    function getBranchShiShen(branchIdx, dayMasterIdx) {
        var cangGan = ZCG_TABLE[branchIdx];
        var result = [];
        for (var i = 0; i < cangGan.length; i++) {
            if (cangGan[i] >= 0) {
                result.push({
                    stem: STEMS[cangGan[i]],
                    stemIdx: cangGan[i],
                    primary: i === 0, // first is primary (本气)
                    tg: getStemShiShen(cangGan[i], dayMasterIdx)
                });
            }
        }
        return result;
    }

    // ==================== TEN GODS INTERPRETATIONS ====================
    var TG_INTERPRETATIONS = {
        '比肩': {
            dayun: 'Friend (Bi Jian) energy brings self-reliance and independence. During this period, you may encounter strong-willed peers or competitors. Collaborations can be powerful if egos are managed. Focus on partnerships where mutual respect exists, but be cautious of others who may challenge your position.',
            career: 'Good for partnerships, teamwork, and independent ventures. Competition is strong — stand firm in your expertise.',
            life: 'Social circle expands. Equal relationships are highlighted. Be mindful of financial sharing — clear boundaries prevent disputes.'
        },
        '劫财': {
            dayun: 'Rob Wealth (Jie Cai) energy brings competitive dynamics and financial fluctuations. You may experience unexpected expenses or income opportunities. Impulsive decisions should be avoided. This period favors bold moves in controlled environments — speculation should be approached with caution.',
            career: 'Competitive advantages emerge, but so do rivals. Good for sales, negotiations, and competitive fields. Guard your resources carefully.',
            life: 'Financial volatility is likely. Avoid lending money or making large impulse purchases. Channel competitive energy into productive achievements.'
        },
        '食神': {
            dayun: 'Eating God (Shi Shen) energy is one of the most auspicious — it brings creativity, enjoyment, and natural talent expression. This is a period where your skills shine, social connections bring joy, and opportunities arise organically. Good health, good appetite, and a generally positive outlook characterize this phase.',
            career: 'Excellent for creative work, teaching, consulting, and any field requiring expertise and expression. Recognition comes naturally.',
            life: 'A period of enjoyment and fulfillment. Pursue hobbies, travel, and creative projects. Relationships tend to be warm and harmonious.'
        },
        '伤官': {
            dayun: 'Hurting Officer (Shang Guan) energy brings strong rebellious and innovative forces. You may feel dissatisfied with authority and conventional paths. This energy, while challenging, is incredibly powerful for breakthroughs. Your unique perspective becomes your greatest asset. Be diplomatic in expressing dissent.',
            career: 'Excellent for innovation, entrepreneurship, entertainment, and tech. Avoid direct conflicts with authority figures — channel rebellion into creation.',
            life: 'Relationships may face turbulence due to outspokenness. Channel this energy into creative expression. Your sharp insights can be transformative if expressed wisely.'
        },
        '偏财': {
            dayun: 'Windfall (Pian Cai) energy brings opportunities for unexpected income, side ventures, and social generosity. You may attract financial opportunities through networking, investments, or unconventional channels. This period favors entrepreneurial thinking and calculated risks.',
            career: 'Great for investments, side businesses, and leveraging social connections. Financial luck is strong but not guaranteed — due diligence is still essential.',
            life: 'Social life is vibrant. Generosity increases, which attracts goodwill. Romantic encounters may arise. Enjoy but maintain financial discipline.'
        },
        '正财': {
            dayun: 'Income (Zheng Cai) energy brings stability in finances, career advancement through steady effort, and practical rewards for hard work. This is a period of accumulation — savings grow, salary increases, and material comfort improves. Focus on building long-term security rather than quick gains.',
            career: 'Excellent for career advancement, business stability, and financial planning. Hard work pays off. Favorable for real estate and long-term investments.',
            life: 'Relationships become more stable and committed. Financial discipline is strong. A good period for marriage, family planning, and building foundations.'
        },
        '七杀': {
            dayun: 'Seven Killings (Qi Sha) energy brings intense pressure, challenges, and transformation. This is a demanding period where obstacles test your resolve. However, for those with strong character, this energy drives extraordinary achievements. The key is to harness pressure as motivation rather than being overwhelmed by it.',
            career: 'High-pressure environments can yield breakthrough results. Good for leadership under fire, crisis management, and competitive fields. Health and stress management are critical.',
            life: 'A testing period. Authority figures may apply pressure. Health needs attention — especially stress-related issues. Channel intensity into physical activity and strategic action.'
        },
        '正官': {
            dayun: 'Authority (Zheng Guan) energy brings structure, discipline, and recognition from those in power. This is one of the most favorable periods for career advancement. Your reputation improves, and others respect your reliability and integrity. Legal and official matters tend to be resolved favorably.',
            career: 'Promotions, awards, and formal recognition are likely. Excellent for government, corporate, and management roles. Integrity is your greatest asset.',
            life: 'A period of order and stability. Relationships benefit from commitment and responsibility. Legal matters, contracts, and official procedures favor you.'
        },
        '偏印': {
            dayun: 'Odd Resource (Pian Yin) energy brings unconventional learning, spiritual exploration, and a tendency toward introspection. You may develop interest in niche subjects, alternative philosophies, or solitary pursuits. While this energy enhances depth of thought, it can also bring periods of loneliness or overthinking.',
            career: 'Good for research, specialized fields, technology, and unconventional paths. Innovation through deep study is favored. Avoid spreading yourself too thin across multiple interests.',
            life: 'A period of inner exploration. Meditation, spiritual practices, and deep study are beneficial. Be mindful of isolation — maintain social connections even when you prefer solitude.'
        },
        '正印': {
            dayun: 'Resource (Zheng Yin) energy is highly auspicious — it brings mentorship, education, protection, and nurturing support. This is a period where learning comes easily, teachers appear, and your knowledge base expands significantly. Good for academic pursuits, certification, and any form of personal development.',
            career: 'Excellent for education, training, mentorship roles, and government-related work. Your expertise is valued. Favorable for writing, publishing, and intellectual property.',
            life: 'A nurturing and protected period. Family support is strong, especially from maternal figures. Good for travel, moving, and making significant purchases like property.'
        }
    };

    // ==================== DAY MASTER PROFILES ====================
    var DM_PROFILES = {
        '甲': {
            element: '木', en: 'Yang Wood',
            desc: 'Like a mighty oak tree, you are upright, ambitious, and naturally authoritative. You have strong principles and tend to lead by example. Your growth-oriented mindset drives you to constantly improve and expand your influence.',
            traits: ['Leader', 'Visionary', 'Principled', 'Resilient', 'Direct']
        },
        '乙': {
            element: '木', en: 'Yin Wood',
            desc: 'Like a flexible willow, you adapt gracefully to circumstances while maintaining your inner strength. You are diplomatic, creative, and have a natural talent for building relationships. Your gentleness hides remarkable persistence.',
            traits: ['Adaptable', 'Diplomatic', 'Creative', 'Gentle', 'Persistent']
        },
        '丙': {
            element: '火', en: 'Yang Fire',
            desc: 'Like the radiant sun, you are warm, generous, and naturally draw people to you. Your enthusiasm is infectious, and you have a gift for illuminating complex situations. You thrive when you can express yourself freely and inspire others.',
            traits: ['Charismatic', 'Generous', 'Optimistic', 'Expressive', 'Warm']
        },
        '丁': {
            element: '火', en: 'Yin Fire',
            desc: 'Like a candle flame, you bring focused warmth and insight to everything you do. You are intuitive, refined, and have a talent for deep thinking. Your inner light guides you through challenges with quiet determination.',
            traits: ['Insightful', 'Refined', 'Intuitive', 'Thoughtful', 'Perceptive']
        },
        '戊': {
            element: '土', en: 'Yang Earth',
            desc: 'Like a mountain, you are steadfast, reliable, and provide stability for those around you. You have a natural ability to manage and protect. Your grounded nature makes you an excellent foundation for any endeavor.',
            traits: ['Reliable', 'Steadfast', 'Protective', 'Grounded', 'Generous']
        },
        '己': {
            element: '土', en: 'Yin Earth',
            desc: 'Like fertile farmland, you are nurturing, patient, and capable of growing anything you commit to. You have a natural talent for cultivation — whether that is projects, relationships, or ideas. Your humility and persistence yield remarkable results.',
            traits: ['Nurturing', 'Patient', 'Humble', 'Cultivating', 'Diligent']
        },
        '庚': {
            element: '金', en: 'Yang Metal',
            desc: 'Like forged steel, you are decisive, righteous, and unafraid to cut through obstacles. You have strong willpower and a sense of justice that drives you to act decisively. Under pressure, you become sharper and more effective.',
            traits: ['Decisive', 'Righteous', 'Determined', 'Bold', 'Unyielding']
        },
        '辛': {
            element: '金', en: 'Yin Metal',
            desc: 'Like precious jewelry, you have refined taste, attention to detail, and an eye for quality. You are elegant, intelligent, and possess a subtle strength that commands respect without demanding it.',
            traits: ['Elegant', 'Detail-oriented', 'Intelligent', 'Refined', 'Perfectionist']
        },
        '壬': {
            element: '水', en: 'Yang Water',
            desc: 'Like a great river, you are dynamic, resourceful, and constantly moving forward. You have a powerful intellect and the ability to navigate complex situations with ease. Your wisdom runs deep, and your vision extends far beyond the present.',
            traits: ['Dynamic', 'Resourceful', 'Intelligent', 'Visionary', 'Adaptable']
        },
        '癸': {
            element: '水', en: 'Yin Water',
            desc: 'Like morning dew, you have a gentle, penetrating intelligence that absorbs and transforms everything it touches. You are intuitive, sensitive, and capable of understanding complex emotions and situations with remarkable clarity.',
            traits: ['Intuitive', 'Sensitive', 'Perceptive', 'Transformative', 'Gentle']
        }
    };

    // ==================== FIVE ELEMENTS INTERPRETATION ====================
    var WX_BODY_MAP = { '金': 'Lungs & Large Intestine', '水': 'Kidneys & Bladder', '木': 'Liver & Gallbladder', '火': 'Heart & Small Intestine', '土': 'Spleen & Stomach' };
    var WX_ADVICE = {
        '金': 'Focus on clarity of thought, breathing exercises, and maintaining boundaries. Avoid over-commitment and learn to delegate.',
        '水': 'Prioritize rest, meditation, and intellectual pursuits. Trust your intuition and avoid overthinking.',
        '木': 'Nurture growth through continuous learning, stay physically active, and channel your ambition constructively.',
        '火': 'Express yourself creatively, maintain social connections, and balance passion with periods of calm reflection.',
        '土': 'Build stable routines, focus on nutrition and self-care, and practice gratitude and mindfulness.'
    };

    function getWxInterpretation(nwx) {
        var dominant = [];
        var weak = [];
        var maxCount = Math.max.apply(null, nwx);

        for (var i = 0; i < 5; i++) {
            if (nwx[i] === 0) weak.push(WX_NAMES[i]);
            else if (nwx[i] === maxCount) dominant.push(WX_NAMES[i]);
        }

        var html = '';
        if (dominant.length > 0) {
            html += '<p><strong>Dominant Elements (' + dominant.join(', ') + '):</strong> ';
            html += 'These elements shape your core personality and natural strengths. ';
            if (dominant.indexOf('金') >= 0) html += 'Your Metal nature gives you sharp judgment and decisiveness. ';
            if (dominant.indexOf('水') >= 0) html += 'Your Water nature brings wisdom and adaptability. ';
            if (dominant.indexOf('木') >= 0) html += 'Your Wood nature fuels growth and ambition. ';
            if (dominant.indexOf('火') >= 0) html += 'Your Fire nature provides warmth and enthusiasm. ';
            if (dominant.indexOf('土') >= 0) html += 'Your Earth nature offers stability and nurturing. ';
            html += '</p>';
        }
        if (weak.length > 0) {
            html += '<p><strong>Missing or Weak Elements (' + weak.join(', ') + '):</strong> ';
            html += 'These areas may need conscious cultivation. ';
            for (var j = 0; j < weak.length; j++) {
                var wx = weak[j];
                html += '<br>' + WX_ICONS[wx] + ' <strong>' + wx + ' (' + WX_BODY_MAP[wx] + '):</strong> ' + WX_ADVICE[wx];
            }
            html += '</p>';
        }
        if (weak.length === 0) {
            html += '<p><strong>Balanced Chart:</strong> All five elements are represented in your chart. This suggests a well-rounded personality with access to diverse energies.</p>';
        }
        return html;
    }

    // ==================== SHIER CHANGSHENG ====================
    function getNZSCClass(nzsc) {
        if (!nzsc) return 'neutral';
        if (nzsc.indexOf('大吉') >= 0 || nzsc.indexOf('吉') >= 0) return 'auspicious';
        if (nzsc.indexOf('凶') >= 0) return 'inauspicious';
        return 'neutral';
    }

    var NZSC_MEANINGS = {
        '长生': { en: 'Birth', desc: 'A period of vitality, learning, and growth. New opportunities emerge naturally.' },
        '沐浴': { en: 'Bath', desc: 'A phase of refinement and transformation. Social connections are meaningful.' },
        '冠帶': { en: 'Coronation', desc: 'Coming of age and recognition. Talents are noticed, confidence rises.' },
        '臨官': { en: 'Official', desc: 'Peak professional period — authority, success, and career advancement.' },
        '帝旺': { en: 'Prosperity', desc: 'Maximum power and influence. Beware of overconfidence.' },
        '衰': { en: 'Decline', desc: 'Natural slowing down. Focus on consolidation, not expansion.' },
        '病': { en: 'Sickness', desc: 'Period of vulnerability. Time for healing and reflection.' },
        '死': { en: 'Death', desc: 'Endings and closure. Old chapters close for transformation.' },
        '墓': { en: 'Tomb', desc: 'Storage and introspection. Good for research and planning.' },
        '絕': { en: 'Extinction', desc: 'Deepest valley before recovery. Resilience is tested.' },
        '胎': { en: 'Conception', desc: 'New cycle begins. Ideas and projects take shape.' },
        '養': { en: 'Nurture', desc: 'Steady development through consistent care and patience.' }
    };

    function getNZSCMeaning(nzsc) {
        if (!nzsc) return null;
        var stage = nzsc.replace(/\(.*\)/, '').trim();
        return NZSC_MEANINGS[stage] || null;
    }

    // ==================== DAYUN INTERPRETATION (DATA-DRIVEN) ====================
    function getDayunInterpretation(dy, dmIdx, rt) {
        var nzsc = dy['nzsc'] || '';
        var stageInfo = getNZSCMeaning(nzsc);

        // Calculate Ten Gods for Dayun stem and branch
        var dyGanIdx = STEMS.indexOf(dy['zfma']);
        var dyZhiIdx = BRANCHES.indexOf(dy['zfmb']);
        var stemTg = dyGanIdx >= 0 ? getStemShiShen(dyGanIdx, dmIdx) : null;
        var branchTgList = dyZhiIdx >= 0 ? getBranchShiShen(dyZhiIdx, dmIdx) : [];

        var ganWx = dyGanIdx >= 0 ? WX_NAMES[STEM_WX[dyGanIdx]] : '';
        var zhiWx = dyZhiIdx >= 0 ? WX_NAMES[BRANCH_WX[dyZhiIdx]] : '';
        var isAuspicious = nzsc.indexOf('大吉') >= 0 || nzsc.indexOf('吉') >= 0;
        var isInauspicious = nzsc.indexOf('凶') >= 0;

        var html = '';

        // Twelve Life Stage
        if (stageInfo) {
            html += '<div class="dy-life-stage">';
            html += '<strong>Life Stage: ' + stageInfo.en + ' (' + nzsc + ')</strong>';
            html += '<p>' + stageInfo.desc + '</p>';
            if (isAuspicious) {
                html += '<p class="dy-auspicious">&#10022; Auspicious — favorable conditions for growth.</p>';
            } else if (isInauspicious) {
                html += '<p class="dy-inauspicious">&#9888; Challenging — focus on caution and preparation.</p>';
            }
            html += '</div>';
        }

        // Ten Gods interpretation for Dayun stem
        if (stemTg) {
            var tgInterp = TG_INTERPRETATIONS[TG_INDEX[stemTg.index]];
            if (tgInterp) {
                html += '<div class="dy-tengod-section">';
                html += '<div class="dy-tengod-label">Dayun Stem <strong>' + dy['zfma'] + ' (' + ganWx + ')</strong> → ' + stemTg.cn + ' (' + stemTg.en + ')</div>';
                html += '<p>' + tgInterp.dayun + '</p>';
                html += '<div class="dy-tengod-details">';
                html += '<div class="dy-tengod-item"><strong>Career:</strong> ' + tgInterp.career + '</div>';
                html += '<div class="dy-tengod-item"><strong>Life:</strong> ' + tgInterp.life + '</div>';
                html += '</div>';
                html += '</div>';
            }
        }

        // Branch hidden stems with Ten Gods
        if (branchTgList.length > 0) {
            html += '<div class="dy-branch-section">';
            html += '<strong>Dayun Branch ' + dy['zfmb'] + ' (' + zhiWx + ') Hidden Stems:</strong>';
            html += '<div class="dy-canggan-list">';
            for (var i = 0; i < branchTgList.length; i++) {
                var cg = branchTgList[i];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var label = cg.primary ? ' (Primary)' : '';
                html += '<div class="dy-canggan-item">';
                html += '<span class="cg-stem" style="color:' + cgColor + '">' + cg.stem + ' ' + cgWx + '</span>';
                html += '<span class="cg-tg">' + cg.tg.cn + ' (' + cg.tg.en + ')' + label + '</span>';
                html += '</div>';
            }
            html += '</div></div>';
        }

        // Favorable vs unfavorable summary
        html += '<div class="dy-summary">';
        var favorable = [];
        var unfavorable = [];
        if (stemTg) {
            var tgName = TG_INDEX[stemTg.index];
            if (['食神','正财','正官','正印'].indexOf(tgName) >= 0) {
                favorable.push(tgName + ' Stem');
            }
            if (['七杀','伤官','劫财'].indexOf(tgName) >= 0) {
                unfavorable.push(tgName + ' Stem');
            }
        }
        if (isAuspicious) favorable.push(nzsc.replace(/\(.*\)/, ''));
        if (isInauspicious) unfavorable.push(nzsc.replace(/\(.*\)/, ''));

        if (favorable.length > 0) {
            html += '<p class="dy-fav">&#10022; <strong>Favorable:</strong> ' + favorable.join(', ') + '</p>';
        }
        if (unfavorable.length > 0) {
            html += '<p class="dy-unfav">&#9888; <strong>Challenging:</strong> ' + unfavorable.join(', ') + '</p>';
        }
        if (favorable.length === 0 && unfavorable.length === 0) {
            html += '<p>A mixed period with both opportunities and challenges. Balance and adaptability are key.</p>';
        }
        html += '</div>';

        return html;
    }

    // ==================== LIU NIAN INTERPRETATION ====================
    function getLiunianInterpretation(ly, dmIdx, dayunZfma, dayunZfmb) {
        var lyGanZhi = ly['lye'] || '';
        var lyGan = lyGanZhi.substring(0, 1);
        var lyZhi = lyGanZhi.substring(1, 2);
        var lyGanIdx = STEMS.indexOf(lyGan);
        var lyZhiIdx = BRANCHES.indexOf(lyZhi);
        var stemTg = lyGanIdx >= 0 ? getStemShiShen(lyGanIdx, dmIdx) : null;
        var branchTgList = lyZhiIdx >= 0 ? getBranchShiShen(lyZhiIdx, dmIdx) : [];

        var ganWx = lyGanIdx >= 0 ? WX_NAMES[STEM_WX[lyGanIdx]] : '';
        var zhiWx = lyZhiIdx >= 0 ? WX_NAMES[BRANCH_WX[lyZhiIdx]] : '';

        // Check interaction with dayun stem
        var dyGanIdx = STEMS.indexOf(dayunZfma);
        var interactionTg = null;
        if (dyGanIdx >= 0 && lyGanIdx >= 0) {
            interactionTg = getStemShiShen(lyGanIdx, dyGanIdx);
        }

        var html = '';

        // Ten Gods for Liu Nian stem
        if (stemTg) {
            var tgInterp = TG_INTERPRETATIONS[TG_INDEX[stemTg.index]];
            if (tgInterp) {
                html += '<div class="ly-tengod-section">';
                html += '<div class="ly-tengod-label">Flow Year Stem <strong>' + lyGan + ' (' + ganWx + ')</strong> → ' + stemTg.cn + ' (' + stemTg.en + ')</div>';
                html += '<p>' + tgInterp.dayun + '</p>';
                html += '<div class="ly-tengod-details">';
                html += '<div class="ly-tengod-item"><strong>Career</strong> ' + tgInterp.career + '</div>';
                html += '<div class="ly-tengod-item"><strong>Life</strong> ' + tgInterp.life + '</div>';
                html += '</div>';
                html += '</div>';
            }
        }

        // Dayun vs Liu Nian interaction
        if (interactionTg) {
            var interName = TG_INDEX[interactionTg.index];
            html += '<div class="ly-interaction">';
            html += '<strong>Interaction with Dayun (' + dayunZfma + '):</strong> ';
            html += 'The flow year stem <strong>' + lyGan + '</strong> is <strong>' + interactionTg.cn + '</strong> (' + interactionTg.en + ') relative to the dayun stem <strong>' + dayunZfma + '</strong>. ';
            if (['食神','正财','正官','正印'].indexOf(interName) >= 0) {
                html += 'This is a favorable alignment — the dayun and flow year energies reinforce each other positively.';
            } else if (['七杀','伤官','劫财'].indexOf(interName) >= 0) {
                html += 'This creates tension — the flow year challenges the dayun theme. Stay adaptable and avoid impulsive actions.';
            } else {
                html += 'A neutral to moderate influence. The year proceeds with a mix of stability and mild changes.';
            }
            html += '</div>';
        }

        // Branch hidden stems
        if (branchTgList.length > 0) {
            html += '<div class="ly-branch-section">';
            html += '<strong>Flow Year Branch ' + lyZhi + ' (' + zhiWx + ') Hidden Stems:</strong>';
            html += '<div class="ly-canggan-list">';
            for (var i = 0; i < branchTgList.length; i++) {
                var cg = branchTgList[i];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var label = cg.primary ? ' (Primary)' : '';
                html += '<div class="ly-canggan-item">';
                html += '<span class="cg-stem" style="color:' + cgColor + '">' + cg.stem + ' ' + cgWx + '</span>';
                html += '<span class="cg-tg">' + cg.tg.cn + ' (' + cg.tg.en + ')' + label + '</span>';
                html += '</div>';
            }
            html += '</div></div>';
        }

        return html;
    }

    // ==================== MAIN RENDER ====================
    function renderResult(rt) {
        document.getElementById('bazi-loading').style.display = 'none';
        var container = document.getElementById('bazi-result');
        container.style.display = 'block';

        var gender = rt['xb'];
        var zodiac = rt['sx'];
        var xz = rt['xz'];
        var dayMaster = rt['ctg'][2];
        var dmIdx = STEMS.indexOf(dayMaster);
        var dmWxCode = STEM_WX[dmIdx];
        var dmElement = WX_NAMES[dmWxCode];
        var dmProfile = DM_PROFILES[dayMaster] || { element: dmElement, en: dayMaster, desc: '', traits: [] };

        var eightChar = rt['ctg'][0] + rt['cdz'][0] + ' ' +
                        rt['ctg'][1] + rt['cdz'][1] + ' ' +
                        rt['ctg'][2] + rt['cdz'][2] + ' ' +
                        rt['ctg'][3] + rt['cdz'][3];

        // Five elements
        var nwx = rt['nwx'] || [0, 0, 0, 0, 0];
        var wxData = [];
        for (var i = 0; i < 5; i++) {
            wxData.push({ name: WX_NAMES[i], count: nwx[i], color: WX_COLORS[WX_NAMES[i]] });
        }

        // Build pillars with Ten Gods
        var pillarLabels = ['Year Pillar', 'Month Pillar', 'Day Pillar', 'Hour Pillar'];
        var pillarsHTML = '';
        for (var p = 0; p < 4; p++) {
            var gan = rt['ctg'][p];
            var zhi = rt['cdz'][p];
            var ganWxCode = STEM_WX[STEMS.indexOf(gan)];
            var zhiWxCode = BRANCH_WX[BRANCHES.indexOf(zhi)];
            var ganWx = WX_NAMES[ganWxCode];
            var zhiWx = WX_NAMES[zhiWxCode];

            // Stem Ten Gods
            var ganTg = (p !== 2) ? getStemShiShen(STEMS.indexOf(gan), dmIdx) : null; // day master itself

            // Branch hidden stems with Ten Gods
            var branchIdx = BRANCHES.indexOf(zhi);
            var cangGanList = getBranchShiShen(branchIdx, dmIdx);

            pillarsHTML += '<div class="bazi-pillar">';
            pillarsHTML += '<div class="bazi-pillar-label">' + pillarLabels[p] + '</div>';
            pillarsHTML += '<div class="bazi-pillar-gan" style="border-bottom-color:' + WX_COLORS[ganWx] + '">';
            pillarsHTML += '<span class="bazi-gan-char">' + gan + '</span>';
            pillarsHTML += '<span class="bazi-gan-wx" style="color:' + WX_COLORS[ganWx] + '">' + ganWx + '</span>';
            if (ganTg) {
                pillarsHTML += '<span class="bazi-gan-tg">' + ganTg.cn + '</span>';
            } else {
                pillarsHTML += '<span class="bazi-gan-tg dm-self">Day Master</span>';
            }
            pillarsHTML += '</div>';
            pillarsHTML += '<div class="bazi-pillar-zhi" style="border-bottom-color:' + WX_COLORS[zhiWx] + '">';
            pillarsHTML += '<span class="bazi-zhi-char">' + zhi + '</span>';
            pillarsHTML += '<span class="bazi-zhi-wx" style="color:' + WX_COLORS[zhiWx] + '">' + zhiWx + '</span>';
            pillarsHTML += '</div>';
            pillarsHTML += '<div class="bazi-pillar-hidden">';
            for (var ci = 0; ci < cangGanList.length; ci++) {
                var cg = cangGanList[ci];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var primaryClass = cg.primary ? ' cg-primary' : '';
                pillarsHTML += '<div class="bazi-canggan' + primaryClass + '">';
                pillarsHTML += '<span style="color:' + cgColor + '">' + cg.stem + '</span>';
                pillarsHTML += '<span class="cg-tg-label">' + cg.tg.cn + '</span>';
                pillarsHTML += '</div>';
            }
            pillarsHTML += '</div>';
            pillarsHTML += '</div>';
        }

        // Da Yun
        var qyyDesc = rt['qyy_desc'] || '';
        var currentYear = new Date().getFullYear();
        var currentDayunIdx = -1;
        // Pre-calculate current dayun index
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
            dyHTML = '<div class="bazi-dayun-section">';
            dyHTML += '<h3 class="bazi-section-title">Life Cycles (Da Yun)</h3>';
            dyHTML += '<p class="bazi-qyy">&#9203; ' + qyyDesc + '</p>';
            if (currentDayunIdx >= 0) {
                dyHTML += '<p class="bazi-current-dayun-hint">&#127919; You are currently in: <strong>' + rt['dy'][currentDayunIdx]['zfma'] + rt['dy'][currentDayunIdx]['zfmb'] + '</strong> (' + rt['dy'][currentDayunIdx]['syear'] + '–' + rt['dy'][currentDayunIdx]['eyear'] + ')</p>';
            }
            dyHTML += '<p style="text-align:center;font-size:0.78rem;color:var(--text-muted);margin-bottom:1rem;">Click on any Life Cycle to see Ten Gods analysis, flow years, and detailed interpretation.</p>';
            dyHTML += '<div class="bazi-dayun-grid">';
            for (var k = 0; k < Math.min(rt['dy'].length, 8); k++) {
                var dy = rt['dy'][k];
                var dyGanIdx2 = STEMS.indexOf(dy['zfma']);
                var dyStemTg = dyGanIdx2 >= 0 ? getStemShiShen(dyGanIdx2, dmIdx) : null;
                var dyGanZhi = (dy['zfma'] || '') + (dy['zfmb'] || '');
                var dyNzsc = dy['nzsc'] || '';
                var nzscClass = getNZSCClass(dyNzsc);
                var isCurrent = k === currentDayunIdx;

                dyHTML += '<div class="bazi-dayun-item' + (isCurrent ? ' current-dayun' : '') + '" data-dy-index="' + k + '">';
                if (isCurrent) {
                    dyHTML += '<div class="bazi-dayun-current-badge">Current</div>';
                }
                dyHTML += '<div class="bazi-dayun-ganzhi">' + dyGanZhi + '</div>';
                if (dyStemTg) {
                    dyHTML += '<div class="bazi-dayun-tg">' + dyStemTg.cn + '</div>';
                }
                dyHTML += '<div class="bazi-dayun-age">Age ' + dy['zqage'] + '-' + dy['zboz'] + '</div>';
                dyHTML += '<div class="bazi-dayun-years">' + dy['syear'] + '-' + dy['eyear'] + '</div>';
                if (dyNzsc) {
                    dyHTML += '<div class="bazi-dayun-status ' + nzscClass + '">' + dyNzsc + '</div>';
                }
                dyHTML += '</div>';
            }
            dyHTML += '</div>';

            // Detail panel
            dyHTML += '<div id="bazi-dayun-detail" class="bazi-dayun-detail">';
            dyHTML += '<div class="bazi-dayun-detail-header">';
            dyHTML += '<span class="bazi-dayun-detail-title" id="bazi-dayun-detail-title"></span>';
            dyHTML += '<button class="bazi-dayun-detail-close" id="bazi-dayun-detail-close">&times;</button>';
            dyHTML += '</div>';
            dyHTML += '<div id="bazi-dayun-interpretation" class="bazi-dayun-interpretation"></div>';
            dyHTML += '<div id="bazi-liunian-section"></div>';
            dyHTML += '</div>';

            dyHTML += '</div>';
        }

        // Assemble full page
        container.innerHTML =
            '<div class="bazi-result-header">' +
                '<div class="bazi-result-basic">' +
                    '<span>' + zodiac + ' (' + (xz || '') + ')</span>' +
                    '<span>' + gender + '</span>' +
                '</div>' +
                '<div class="bazi-result-daymaster">' +
                    'Day Master: <strong style="color:' + WX_COLORS[dmElement] + '">' + dayMaster + ' ' + dmElement + ' (' + dmProfile.en + ')</strong>' +
                '</div>' +
                '<div class="bazi-result-eight">' + eightChar + '</div>' +
            '</div>' +

            // Day Master Interpretation
            '<div class="bazi-dm-section">' +
                '<h3 class="bazi-section-title">Your Day Master Profile</h3>' +
                '<div class="bazi-dm-interpretation">' +
                    '<h4>' + WX_ICONS[dmElement] + ' ' + dayMaster + ' — ' + dmProfile.en + '</h4>' +
                    '<p>' + dmProfile.desc + '</p>' +
                    '<div class="bazi-dm-traits">' +
                        dmProfile.traits.map(function(t) { return '<span class="bazi-dm-trait">' + t + '</span>'; }).join('') +
                    '</div>' +
                '</div>' +
            '</div>' +

            // Four Pillars with Ten Gods
            '<h3 class="bazi-section-title">Four Pillars of Destiny (with Ten Gods)</h3>' +
            '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.8rem;">Ten Gods (Shi Shen) show the relationship between each stem and your Day Master, revealing your life patterns.</p>' +
            '<div class="bazi-pillars-grid">' + pillarsHTML + '</div>' +

            // Five Elements
            '<div class="bazi-wuxing-section">' +
                '<h3 class="bazi-section-title">Five Elements Distribution</h3>' +
                '<div class="bazi-wuxing-bars">' +
                    wxData.map(function(w) {
                        var pct = Math.round((w.count / 8) * 100);
                        return '<div class="bazi-wx-row">' +
                            '<span class="bazi-wx-icon">' + WX_ICONS[w.name] + '</span>' +
                            '<span class="bazi-wx-name" style="color:' + w.color + '">' + w.name + '</span>' +
                            '<div class="bazi-wx-bar-bg">' +
                                '<div class="bazi-wx-bar-fill" style="width:' + Math.max(pct, 8) + '%;background:' + w.color + '"></div>' +
                            '</div>' +
                            '<span class="bazi-wx-count">' + w.count + '</span>' +
                        '</div>';
                    }).join('') +
                '</div>' +
                '<div class="bazi-wx-interpretation">' +
                    '<h4>Analysis</h4>' +
                    getWxInterpretation(nwx) +
                '</div>' +
            '</div>' +

            // Da Yun
            dyHTML +

            // Disclaimer
            '<div class="bazi-disclaimer">' +
                '<p>This free BaZi chart is generated using traditional Chinese metaphysics calculations powered by paipan.js engine. Ten Gods (Shi Shen) interpretations are based on classical BaZi theory. For comprehensive life path guidance, career advice, relationship insights, and personalized recommendations, consult a professional BaZi practitioner.</p>' +
            '</div>';

        // Bind dayun click events
        if (rt['dy'] && rt['dy'].length > 0) {
            var items = container.querySelectorAll('.bazi-dayun-item');
            var detailPanel = document.getElementById('bazi-dayun-detail');
            var detailTitle = document.getElementById('bazi-dayun-detail-title');
            var detailInterp = document.getElementById('bazi-dayun-interpretation');
            var liunianSection = document.getElementById('bazi-liunian-section');
            var closeBtn = document.getElementById('bazi-dayun-detail-close');
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

                detailTitle.textContent = 'Dayun ' + (dy['zfma'] || '') + (dy['zfmb'] || '') + ' — Age ' + dy['zqage'] + ' to ' + dy['zboz'];
                detailInterp.innerHTML = getDayunInterpretation(dy, dmIdx, rt);

                // Liu Nian (Flow Years) with Ten Gods — clickable for interpretation
                if (dy['ly'] && dy['ly'].length > 0) {
                    var lyHTML = '<p class="bazi-liunian-title">Flow Years (Liu Nian)</p>';
                    lyHTML += '<div class="bazi-liunian-grid">';
                    dy['ly'].forEach(function(ly, lyIdx) {
                        var lyGanZhi = ly['lye'] || '';
                        var lyGan = lyGanZhi.substring(0, 1);
                        var lyZhi = lyGanZhi.substring(1, 2);
                        var lyGanIdx = STEMS.indexOf(lyGan);
                        var lyTg = lyGanIdx >= 0 ? getStemShiShen(lyGanIdx, dmIdx) : null;
                        var lyYear = ly['year'] || 0;
                        var isCurrentYear = (lyYear === currentYear);

                        lyHTML += '<div class="bazi-liunian-item' + (isCurrentYear ? ' current-year' : '') + '" data-ly-index="' + lyIdx + '" data-ly-year="' + lyYear + '">';
                        if (isCurrentYear) {
                            lyHTML += '<div class="ly-current-badge">Now</div>';
                        }
                        lyHTML += '<div class="ly-ganzhi">' + lyGanZhi + '</div>';
                        if (lyTg) {
                            lyHTML += '<div class="ly-tg">' + lyTg.cn + '</div>';
                        }
                        lyHTML += '<div class="ly-year">' + lyYear + '</div>';
                        lyHTML += '</div>';
                    });
                    lyHTML += '</div>';

                    // Flow year detail panel (expandable)
                    lyHTML += '<div id="bazi-liunian-detail" class="bazi-liunian-detail">';
                    lyHTML += '<div class="bazi-liunian-detail-header">';
                    lyHTML += '<span class="bazi-liunian-detail-title" id="bazi-liunian-detail-title"></span>';
                    lyHTML += '<button class="bazi-liunian-detail-close" id="bazi-liunian-detail-close">&times;</button>';
                    lyHTML += '</div>';
                    lyHTML += '<div id="bazi-liunian-interpretation" class="bazi-liunian-interpretation"></div>';
                    lyHTML += '</div>';

                    liunianSection.innerHTML = lyHTML;

                    // Bind liunian click events
                    var lyItems = liunianSection.querySelectorAll('.bazi-liunian-item');
                    var lyDetailPanel = document.getElementById('bazi-liunian-detail');
                    var lyDetailTitle = document.getElementById('bazi-liunian-detail-title');
                    var lyDetailInterp = document.getElementById('bazi-liunian-interpretation');
                    var lyCloseBtn = document.getElementById('bazi-liunian-detail-close');
                    var activeLyItem = null;

                    function openLiunian(lyItem) {
                        var lyIdx = parseInt(lyItem.getAttribute('data-ly-index'));
                        var lyData = dy['ly'][lyIdx];
                        var lyYear = lyItem.getAttribute('data-ly-year');

                        if (activeLyItem === lyItem) {
                            lyDetailPanel.classList.remove('show');
                            lyItem.classList.remove('ly-active');
                            activeLyItem = null;
                            return;
                        }

                        if (activeLyItem) activeLyItem.classList.remove('ly-active');
                        lyItem.classList.add('ly-active');
                        activeLyItem = lyItem;

                        lyDetailTitle.textContent = 'Flow Year ' + (lyData['lye'] || '') + ' — ' + lyYear;
                        lyDetailInterp.innerHTML = getLiunianInterpretation(lyData, dmIdx, dy['zfma'] || '', dy['zfmb'] || '');
                        lyDetailPanel.classList.add('show');
                        lyDetailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }

                    lyItems.forEach(function(lyItem) {
                        lyItem.addEventListener('click', function() {
                            openLiunian(this);
                        });
                    });

                    lyCloseBtn.addEventListener('click', function() {
                        lyDetailPanel.classList.remove('show');
                        if (activeLyItem) { activeLyItem.classList.remove('ly-active'); activeLyItem = null; }
                    });

                    // Auto-open current year flow year
                    var currentYearLyItem = liunianSection.querySelector('.bazi-liunian-item.current-year');
                    if (currentYearLyItem) {
                        setTimeout(function() { openLiunian(currentYearLyItem); }, 100);
                    }
                } else {
                    liunianSection.innerHTML = '';
                }

                detailPanel.classList.add('show');
                detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            items.forEach(function(item) {
                item.addEventListener('click', function() {
                    openDayun(this);
                });
            });

            closeBtn.addEventListener('click', function() {
                detailPanel.classList.remove('show');
                if (activeItem) { activeItem.classList.remove('active'); activeItem = null; }
            });

            // Auto-open current dayun
            if (currentDayunIdx >= 0) {
                var currentDayunItem = container.querySelector('.bazi-dayun-item[data-dy-index="' + currentDayunIdx + '"]');
                if (currentDayunItem) {
                    setTimeout(function() { openDayun(currentDayunItem); }, 50);
                }
            }
        }
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
            var yy = parseInt(params.yy);
            var mm = parseInt(params.mm);
            var dd = parseInt(params.dd);
            var hh = parseInt(params.hh);
            var xb = parseInt(params.xb);

            if (isNaN(yy) || isNaN(mm) || isNaN(dd) || isNaN(hh) || isNaN(xb)) {
                showError('Invalid calculation parameters. Please try again.');
                return;
            }

            var p = new paipan();
            p.pdy = true;
            var rt = p.fatemaps(xb, yy, mm, dd, hh, 0, 0);

            if (!rt) {
                showError('Calculation failed. Please check your birth date and try again.');
                return;
            }

            renderResult(rt);
        } catch (e) {
            showError('Failed to parse calculation data. Please go back and try again.');
            console.error('BaZi result error:', e);
        }
    }

    function showError(msg) {
        document.getElementById('bazi-loading').style.display = 'none';
        var errDiv = document.getElementById('bazi-error');
        errDiv.style.display = 'flex';
        errDiv.innerHTML = '<p>' + msg + '</p><a href="/#free-bazi">&larr; Try Again</a>';
    }

    // ==================== BOOT ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
