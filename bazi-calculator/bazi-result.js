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
    var WX_COLORS = { '金': '#9E8E6E', '水': '#5B8299', '木': '#5E825E', '火': '#B8665E', '土': '#9E8B5E' };
    var WX_SYMBOLS = { '金': 'Metal', '水': 'Water', '木': 'Wood', '火': 'Fire', '土': 'Earth' };
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

    // ==================== DAY MASTER PROFILES (ENGINE-DRIVEN) ====================
    var DM_NATURE = {
        '甲': { trait: 'Straightforward & ambitious', keyword: 'growth' },
        '乙': { trait: 'Flexible & persistent', keyword: 'adaptation' },
        '丙': { trait: 'Warm & charismatic', keyword: 'radiance' },
        '丁': { trait: 'Insightful & refined', keyword: 'focus' },
        '戊': { trait: 'Steadfast & reliable', keyword: 'stability' },
        '己': { trait: 'Nurturing & patient', keyword: 'cultivation' },
        '庚': { trait: 'Decisive & righteous', keyword: 'resolve' },
        '辛': { trait: 'Elegant & detail-oriented', keyword: 'precision' },
        '壬': { trait: 'Dynamic & resourceful', keyword: 'wisdom' },
        '癸': { trait: 'Intuitive & perceptive', keyword: 'depth' }
    };

    function buildDmProfile(rt) {
        var dm = rt['ctg'][2];
        var dmIdx = STEMS.indexOf(dm);
        var dmWx = WX_NAMES[STEM_WX[dmIdx]];
        var dmYy = rt['yytg'] ? rt['yytg'][2] : 0; // 0=yang, 1=yin
        var dmNature = DM_NATURE[dm];
        if (!dmNature) return '';

        // Collect Ten Gods from all four pillars (engine data: rt['bctg'], rt['bzcg'])
        var allTg = []; // { cn, en, count }
        for (var p = 0; p < 4; p++) {
            if (p !== 2) { // skip day pillar (day master itself)
                var stemTg = getStemShiShen(STEMS.indexOf(rt['ctg'][p]), dmIdx);
                var found = false;
                for (var t = 0; t < allTg.length; t++) {
                    if (allTg[t].cn === stemTg.cn) { allTg[t].count++; found = true; break; }
                }
                if (!found) allTg.push({ cn: stemTg.cn, en: stemTg.en, count: 1 });
            }
            // Hidden stems Ten Gods
            for (var j = 0; j < 3; j++) {
                var bzcgIdx = 3 * p + j;
                if (rt['bzcg'] && rt['bzcg'][bzcgIdx] && rt['bzcg'][bzcgIdx] !== '') {
                    var bzName = rt['bzcg'][bzcgIdx]; // engine short name: 印/卩/比/劫/伤/食/财/才/官/杀
                    var bzFullName = TEN_GODS_NAMES[TG_INDEX[['印','卩','比','劫','伤','食','财','才','官','杀'].indexOf(bzName)]];
                    if (bzFullName) {
                        var found2 = false;
                        for (var t2 = 0; t2 < allTg.length; t2++) {
                            if (allTg[t2].cn === bzFullName.cn) { allTg[t2].count++; found2 = true; break; }
                        }
                        if (!found2) allTg.push({ cn: bzFullName.cn, en: bzFullName.en, count: 1 });
                    }
                }
            }
        }

        // Sort by count descending
        allTg.sort(function(a, b) { return b.count - a.count; });

        var html = '<div class="dm-profile-row">';
        html += '<div class="dm-profile-col"><strong>Day Master:</strong> ' + dm + ' ' + dmWx + ' (' + (dmYy === 0 ? 'Yang' : 'Yin') + ')</div>';
        html += '<div class="dm-profile-col"><strong>Nature:</strong> ' + dmNature.trait + '</div>';
        html += '</div>';
        html += '<div class="dm-profile-row">';
        html += '<div class="dm-profile-col"><strong>Key Ten Gods:</strong> ';
        var topTg = allTg.slice(0, 4);
        html += topTg.map(function(t) { return t.cn + '(' + t.count + ')'; }).join(' · ');
        html += '</div>';
        html += '</div>';
        return html;
    }

    // ==================== FIVE ELEMENTS INTERPRETATION (ENGINE-DRIVEN) ====================
    // Compact lookup: element → body area (from classical theory)
    var WX_BODY = { '金': 'Lungs & Large Intestine', '水': 'Kidneys & Bladder', '木': 'Liver & Gallbladder', '火': 'Heart & Small Intestine', '土': 'Spleen & Stomach' };

    function getWxInterpretation(nwx) {
        var maxCount = Math.max.apply(null, nwx);
        var dominant = [];
        var weak = [];
        for (var i = 0; i < 5; i++) {
            if (nwx[i] === 0) weak.push(WX_NAMES[i]);
            else if (nwx[i] === maxCount) dominant.push(WX_NAMES[i]);
        }
        var html = '';
        if (dominant.length > 0) {
            html += '<p><strong>Strongest:</strong> ' + dominant.join(', ') + ' (' + maxCount + ')</p>';
        }
        if (weak.length > 0) {
            html += '<p><strong>Absent:</strong> ';
            html += weak.map(function(w) { return w + ' (' + WX_BODY[w] + ')'; }).join(', ');
            html += '</p>';
        }
        if (weak.length === 0) {
            html += '<p>All five elements are present.</p>';
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

    // (NZSC stage names from engine: this.czs array)
    var NZSC_EN = {
        '長生': 'Birth', '沐浴': 'Bath', '冠帶': 'Coronation', '臨官': 'Official',
        '帝旺': 'Prosperity', '衰': 'Decline', '病': 'Sickness', '死': 'Death',
        '墓': 'Tomb', '絕': 'Extinction', '胎': 'Conception', '養': 'Nurture'
    };

    // ==================== DAYUN DETAIL (ENGINE DATA ONLY) ====================
    function getDayunInterpretation(dy, dmIdx) {
        var nzsc = dy['nzsc'] || '';
        var dyGanIdx = STEMS.indexOf(dy['zfma']);
        var dyZhiIdx = BRANCHES.indexOf(dy['zfmb']);
        var stemTg = dyGanIdx >= 0 ? getStemShiShen(dyGanIdx, dmIdx) : null;
        var branchTgList = dyZhiIdx >= 0 ? getBranchShiShen(dyZhiIdx, dmIdx) : [];
        var ganWx = dyGanIdx >= 0 ? WX_NAMES[STEM_WX[dyGanIdx]] : '';
        var zhiWx = dyZhiIdx >= 0 ? WX_NAMES[BRANCH_WX[dyZhiIdx]] : '';

        var html = '<div class="dy-data-row">';

        // Left: Stem Ten Gods
        html += '<div class="dy-data-col">';
        if (stemTg) {
            html += '<div class="dy-data-item"><span class="dy-label">Stem ' + dy['zfma'] + ' (' + ganWx + ')</span>';
            html += '<span class="dy-value">' + stemTg.cn + ' (' + stemTg.en + ')</span></div>';
        }
        html += '</div>';

        // Right: Life Stage
        html += '<div class="dy-data-col">';
        if (nzsc) {
            html += '<div class="dy-data-item"><span class="dy-label">Life Stage</span>';
            html += '<span class="dy-value ' + getNZSCClass(nzsc) + '">' + nzsc + '</span></div>';
        }
        html += '</div>';

        html += '</div>';

        // Branch hidden stems
        if (branchTgList.length > 0) {
            html += '<div class="dy-canggan-row">';
            html += '<span class="dy-label">Branch ' + dy['zfmb'] + ' (' + zhiWx + ') Hidden Stems: </span>';
            for (var i = 0; i < branchTgList.length; i++) {
                var cg = branchTgList[i];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var sep = i > 0 ? ', ' : '';
                var label = cg.primary ? '*' : '';
                html += sep + '<span style="color:' + cgColor + '">' + cg.stem + cgWx + '</span> ' + cg.tg.cn + label;
            }
            html += '</div>';
        }

        return html;
    }

    // ==================== LIUNIAN DETAIL (ENGINE DATA ONLY) ====================
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

        // Dayun vs Liunian interaction
        var dyGanIdx = STEMS.indexOf(dayunZfma);
        var interactionTg = null;
        if (dyGanIdx >= 0 && lyGanIdx >= 0) {
            interactionTg = getStemShiShen(lyGanIdx, dyGanIdx);
        }

        var html = '<div class="ly-data-row">';

        // Left: Stem Ten Gods
        html += '<div class="ly-data-col">';
        if (stemTg) {
            html += '<div class="ly-data-item"><span class="ly-label">Stem ' + lyGan + ' (' + ganWx + ')</span>';
            html += '<span class="ly-value">' + stemTg.cn + ' (' + stemTg.en + ')</span></div>';
        }
        html += '</div>';

        // Right: Dayun interaction
        html += '<div class="ly-data-col">';
        if (interactionTg) {
            html += '<div class="ly-data-item"><span class="ly-label">vs Dayun ' + dayunZfma + '</span>';
            html += '<span class="ly-value">' + interactionTg.cn + ' (' + interactionTg.en + ')</span></div>';
        }
        html += '</div>';

        html += '</div>';

        // Branch hidden stems
        if (branchTgList.length > 0) {
            html += '<div class="ly-canggan-row">';
            html += '<span class="ly-label">Branch ' + lyZhi + ' (' + zhiWx + ') Hidden Stems: </span>';
            for (var i = 0; i < branchTgList.length; i++) {
                var cg = branchTgList[i];
                var cgWx = WX_NAMES[STEM_WX[cg.stemIdx]];
                var cgColor = WX_COLORS[cgWx];
                var sep = i > 0 ? ', ' : '';
                var label = cg.primary ? '*' : '';
                html += sep + '<span style="color:' + cgColor + '">' + cg.stem + cgWx + '</span> ' + cg.tg.cn + label;
            }
            html += '</div>';
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
            dyHTML += '<p class="bazi-qyy">' + qyyDesc + '</p>';
            if (currentDayunIdx >= 0) {
                dyHTML += '<p class="bazi-current-dayun-hint">You are currently in: <strong>' + rt['dy'][currentDayunIdx]['zfma'] + rt['dy'][currentDayunIdx]['zfmb'] + '</strong> (' + rt['dy'][currentDayunIdx]['syear'] + '-' + rt['dy'][currentDayunIdx]['eyear'] + ')</p>';
            }
            dyHTML += '<p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:1rem;">Click any Life Cycle to see Ten Gods and Flow Years.</p>';
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
                    '<span>Day Master: <strong style="color:' + WX_COLORS[dmElement] + '">' + dayMaster + ' ' + dmElement + '</strong></span>' +
                '</div>' +
                '<div class="bazi-result-eight">' + eightChar + '</div>' +
            '</div>' +

            // Da Yun section
            buildDmProfile(rt) +

            // Two-column: Four Pillars + Five Elements
            '<div class="bazi-main-row">' +
                // Left: Four Pillars with Ten Gods
                '<div class="bazi-main-col">' +
                    '<h3 class="bazi-section-title">Four Pillars (Ten Gods)</h3>' +
                    '<div class="bazi-pillars-grid">' + pillarsHTML + '</div>' +
                '</div>' +
                // Right: Five Elements
                '<div class="bazi-main-col">' +
                    '<h3 class="bazi-section-title">Five Elements</h3>' +
                    '<div class="bazi-wuxing-bars">' +
                        wxData.map(function(w) {
                            var pct = Math.round((w.count / 8) * 100);
                            return '<div class="bazi-wx-row">' +
                                '<span class="bazi-wx-label">' + WX_SYMBOLS[w.name] + '</span>' +
                                '<span class="bazi-wx-name" style="color:' + w.color + '">' + w.name + '</span>' +
                                '<div class="bazi-wx-bar-bg">' +
                                    '<div class="bazi-wx-bar-fill" style="width:' + Math.max(pct, 8) + '%;background:' + w.color + '"></div>' +
                                '</div>' +
                                '<span class="bazi-wx-count">' + w.count + '</span>' +
                            '</div>';
                        }).join('') +
                    '</div>' +
                    '<div class="bazi-wx-summary">' + getWxInterpretation(nwx) + '</div>' +
                '</div>' +
            '</div>' +

            // Da Yun
            dyHTML +

            // Paid CTA
            '<div class="bazi-cta-section">' +
                '<div class="bazi-cta-inner">' +
                    '<h3 class="bazi-cta-title">Unlock Your Full Life Blueprint</h3>' +
                    '<p class="bazi-cta-desc">This free chart reveals your core personality and elemental balance. For deeper insights into your unique path, a professional reading can illuminate:</p>' +
                    '<div class="bazi-cta-grid">' +
                        '<div class="bazi-cta-item">Career direction &amp; breakthrough timing</div>' +
                        '<div class="bazi-cta-item">Relationship compatibility &amp; timing</div>' +
                        '<div class="bazi-cta-item">Wealth accumulation &amp; financial cycles</div>' +
                        '<div class="bazi-cta-item">Health vulnerabilities &amp; preventive care</div>' +
                        '<div class="bazi-cta-item">Children prospects &amp; family harmony</div>' +
                        '<div class="bazi-cta-item">Life decisions &amp; optimal timing</div>' +
                    '</div>' +
                    '<a href="https://www.creem.io/checkout/prod_28PqAKMEom5WGRH1w9O35n/ch_1ueb7qKPFnQOzLK8lNPfIN" class="bazi-cta-btn" target="_blank" rel="noopener">' +
                        'Get Your Personalized Reading' +
                    '</a>' +
                    '<p class="bazi-cta-note">Based on your exact birth chart · Delivered by certified practitioner</p>' +
                '</div>' +
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
                detailInterp.innerHTML = getDayunInterpretation(dy, dmIdx);

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
