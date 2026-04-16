/**
 * DaoEssence BaZi Calculator
 * Powered by paipan.js (https://github.com/hkargc/paipan)
 * 
 * Standalone module - isolated from main site logic.
 * Dependencies: only paipan.min.js (already loaded)
 */
(function () {
    'use strict';

    // ==================== EARTHLY BRANCHES (地支) TIME SLOTS ====================
    const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const WX_NAMES = ['金','水','木','火','土'];
    const WX_COLORS = {
        '金': '#C9B37A', // gold
        '水': '#5B8FB9', // blue  
        '木': '#6B8E6B', // green
        '火': '#C25B56', // red
        '土': '#B8860B'  // brown/amber
    };
    const WX_ICONS = {
        '金': '⚔️', '水': '💧', '木': '🌿', '火': '🔥', '土': '⛰️'
    };
    const DEITY_FULL = ['正印','偏印','比肩','劫財','傷官','食神','正財','偏財','正官','偏官'];

    const SHI_CHEN = [
        { name: '子时 (23:00-01:00)', hour: 23 },
        { name: '丑时 (01:00-03:00)', hour: 1 },
        { name: '寅时 (03:00-05:00)', hour: 3 },
        { name: '卯时 (05:00-07:00)', hour: 5 },
        { name: '辰时 (07:00-09:00)', hour: 7 },
        { name: '巳时 (09:00-11:00)', hour: 9 },
        { name: '午时 (11:00-13:00)', hour: 11 },
        { name: '未时 (13:00-15:00)', hour: 13 },
        { name: '申时 (15:00-17:00)', hour: 15 },
        { name: '酉时 (17:00-19:00)', hour: 17 },
        { name: '戌时 (19:00-21:00)', hour: 19 },
        { name: '亥时 (21:00-23:00)', hour: 21 }
    ];

    // ==================== INIT ====================
    function init() {
        populateForm();
        document.getElementById('bazi-calculate-btn').addEventListener('click', calculate);
        document.getElementById('bazi-reset-btn').addEventListener('click', resetForm);
    }

    function populateForm() {
        // Year select (1940-2040)
        const yearSel = document.getElementById('bazi-year');
        for (let y = 2040; y >= 1940; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSel.appendChild(opt);
        }
        yearSel.value = 1990;

        // Month
        const monthSel = document.getElementById('bazi-month');
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            monthSel.appendChild(opt);
        }
        monthSel.value = 1;

        // Day
        const daySel = document.getElementById('bazi-day');
        for (let d = 1; d <= 31; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            daySel.appendChild(opt);
        }
        daySel.value = 1;

        // Shichen
        const scSel = document.getElementById('bazi-shichen');
        SHI_CHEN.forEach(function (sc) {
            const opt = document.createElement('option');
            opt.value = sc.hour;
            opt.textContent = sc.name;
            scSel.appendChild(opt);
        });

        // Gender
        const genderSel = document.getElementById('bazi-gender');
        const optM = document.createElement('option');
        optM.value = '1'; optM.textContent = 'Male';
        const optF = document.createElement('option');
        optF.value = '0'; optF.textContent = 'Female';
        genderSel.appendChild(optM);
        genderSel.appendChild(optF);
    }

    // ==================== CALCULATE ====================
    function calculate() {
        const yy = parseInt(document.getElementById('bazi-year').value);
        const mm = parseInt(document.getElementById('bazi-month').value);
        const dd = parseInt(document.getElementById('bazi-day').value);
        const hh = parseInt(document.getElementById('bazi-shichen').value);
        const xb = parseInt(document.getElementById('bazi-gender').value);

        // Validate
        if (isNaN(yy) || isNaN(mm) || isNaN(dd) || isNaN(hh)) {
            showError('Please fill in all fields.');
            return;
        }

        // paipan: xb=1(male), xb=0(female)
        var p = new paipan();
        p.pdy = true; // 精确大运
        var rt = p.fatemaps(xb, yy, mm, dd, hh, 0, 0);

        if (!rt) {
            showError('Calculation failed. Please check the date.');
            return;
        }

        renderResult(rt);
    }

    // ==================== RENDER ====================
    function renderResult(rt) {
        var container = document.getElementById('bazi-result');
        container.style.display = 'block';

        // Basic info
        var gender = rt['xb'];
        var zodiac = rt['sx'];
        var xz = rt['xz'];
        var eightChar = rt['ctg'][0] + rt['cdz'][0] + ' ' + 
                        rt['ctg'][1] + rt['cdz'][1] + ' ' +
                        rt['ctg'][2] + rt['cdz'][2] + ' ' +
                        rt['ctg'][3] + rt['cdz'][3];
        var dayMaster = rt['ctg'][2];
        var dayMasterIdx = STEMS.indexOf(dayMaster);
        // wx mapping: 甲乙=木2,丙丁=火3,戊己=土4,庚辛=金0,壬癸=水1
        var wxMap = [2, 2, 3, 3, 4, 4, 0, 0, 1, 1]; // index→wx_code
        var dmWxCode = wxMap[dayMasterIdx];
        var dmElement = WX_NAMES[dmWxCode];

        // Five elements count: nwx = [金, 水, 木, 火, 土]
        var nwx = rt['nwx'] || [0, 0, 0, 0, 0];
        var wxData = [];
        for (var i = 0; i < 5; i++) {
            wxData.push({ name: WX_NAMES[i], count: nwx[i], color: WX_COLORS[WX_NAMES[i]] });
        }

        // Build pillars HTML
        var pillarLabels = ['Year', 'Month', 'Day', 'Hour'];
        var pillarsHTML = '';
        for (var i = 0; i < 4; i++) {
            var gan = rt['ctg'][i];
            var zhi = rt['cdz'][i];
            var ganWxCode = wxMap[STEMS.indexOf(gan)];
            var zhiWxCode = [1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 4, 1][BRANCHES.indexOf(zhi)];
            var ganWx = WX_NAMES[ganWxCode];
            var zhiWx = WX_NAMES[zhiWxCode];

            // Get hidden stems (藏干)
            var hiddenStems = [];
            var cgIdx = BRANCHES.indexOf(zhi);
            // paipan zcg table: zhi → [stem_codes]
            var zcgTable = [[9,-1,-1],[5,9,7],[0,2,4],[1,-1,-1],[4,1,9],[2,4,6],[3,5,-1],[5,1,3],[6,8,4],[7,-1,-1],[4,7,3],[8,0,-1]];
            if (zcgTable[cgIdx]) {
                zcgTable[cgIdx].forEach(function(sc) {
                    if (sc >= 0) hiddenStems.push(STEMS[sc]);
                });
            }

            pillarsHTML += '<div class="bazi-pillar">' +
                '<div class="bazi-pillar-label">' + pillarLabels[i] + '</div>' +
                '<div class="bazi-pillar-gan" style="border-bottom-color:' + WX_COLORS[ganWx] + '">' +
                    '<span class="bazi-gan-char">' + gan + '</span>' +
                    '<span class="bazi-gan-wx" style="color:' + WX_COLORS[ganWx] + '">' + ganWx + '</span>' +
                '</div>' +
                '<div class="bazi-pillar-zhi" style="border-bottom-color:' + WX_COLORS[zhiWx] + '">' +
                    '<span class="bazi-zhi-char">' + zhi + '</span>' +
                    '<span class="bazi-zhi-wx" style="color:' + WX_COLORS[zhiWx] + '">' + zhiWx + '</span>' +
                '</div>' +
                '<div class="bazi-pillar-hidden">' +
                    hiddenStems.map(function(s) {
                        var swc = WX_NAMES[wxMap[STEMS.indexOf(s)]];
                        return '<span style="color:' + WX_COLORS[swc] + '">' + s + '</span>';
                    }).join(' ') +
                '</div>' +
            '</div>';
        }

        // Fortune info
        var qyyDesc = rt['qyy_desc'] || '';
        var dyHTML = '';
        if (rt['dy'] && rt['dy'].length > 0) {
            dyHTML = '<div class="bazi-dayun-section">';
            dyHTML += '<h3 class="bazi-section-title">Life Cycles (Da Yun)</h3>';
            dyHTML += '<p class="bazi-qyy">' + qyyDesc + '</p>';
            dyHTML += '<div class="bazi-dayun-grid">';
            for (var k = 0; k < Math.min(rt['dy'].length, 8); k++) {
                var dy = rt['dy'][k];
                var dyGanZhi = (dy['zfma'] || '') + (dy['zfmb'] || '');
                var dyNzsc = dy['nzsc'] || '';
                dyHTML += '<div class="bazi-dayun-item">' +
                    '<div class="bazi-dayun-ganzhi">' + dyGanZhi + '</div>' +
                    '<div class="bazi-dayun-age">' + dy['zqage'] + '-' + dy['zboz'] + ' years</div>' +
                    '<div class="bazi-dayun-years">' + dy['syear'] + '-' + dy['eyear'] + '</div>' +
                    (dyNzsc ? '<div class="bazi-dayun-status">' + dyNzsc + '</div>' : '') +
                '</div>';
            }
            dyHTML += '</div></div>';
        }

        // Assemble full result
        container.innerHTML = 
            '<div class="bazi-result-header">' +
                '<div class="bazi-result-basic">' +
                    '<span class="bazi-result-zodiac">' + zodiac + '</span>' +
                    '<span class="bazi-result-constellation">' + xz + '</span>' +
                    '<span class="bazi-result-gender">' + gender + '</span>' +
                '</div>' +
                '<div class="bazi-result-daymaster">' +
                    'Day Master: <strong style="color:' + WX_COLORS[dmElement] + '">' + dayMaster + ' ' + dmElement + '</strong>' +
                '</div>' +
                '<div class="bazi-result-eight">' + eightChar + '</div>' +
            '</div>' +

            '<!-- Four Pillars -->' +
            '<div class="bazi-pillars-grid">' + pillarsHTML + '</div>' +

            '<!-- Five Elements -->' +
            '<div class="bazi-wuxing-section">' +
                '<h3 class="bazi-section-title">Five Elements Profile</h3>' +
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
                '<p class="bazi-wx-note">Based on the 8 characters (4 stems + 4 branches). Missing elements may indicate areas needing attention.</p>' +
            '</div>' +

            dyHTML +

            '<div class="bazi-disclaimer">' +
                '<p>This free report provides basic BaZi chart analysis. For a comprehensive reading with life path guidance, career advice, and relationship insights, consult a professional BaZi practitioner.</p>' +
            '</div>';

        // Scroll to result
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(msg) {
        var container = document.getElementById('bazi-result');
        container.style.display = 'block';
        container.innerHTML = '<div class="bazi-error">' + msg + '</div>';
    }

    function resetForm() {
        document.getElementById('bazi-result').style.display = 'none';
        document.getElementById('bazi-result').innerHTML = '';
        document.getElementById('bazi-year').value = 1990;
        document.getElementById('bazi-month').value = 1;
        document.getElementById('bazi-day').value = 1;
        document.getElementById('bazi-gender').value = '1';
    }

    // ==================== BOOT ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
