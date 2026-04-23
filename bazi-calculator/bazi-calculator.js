/**
 * DaoEssence BaZi Calculator - Form Module
 * Powered by paipan.js (https://github.com/hkargc/paipan)
 * 
 * Standalone module - isolated from main site logic.
 * Only handles the form on the homepage; results render on bazi-result.html.
 */
(function () {
    'use strict';

    var SHI_CHEN = [
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
        var yearSel = document.getElementById('bazi-year');
        for (var y = 2040; y >= 1940; y--) {
            var opt = document.createElement('option');
            opt.value = y; opt.textContent = y;
            yearSel.appendChild(opt);
        }
        yearSel.value = 1990;

        var monthSel = document.getElementById('bazi-month');
        for (var m = 1; m <= 12; m++) {
            var opt = document.createElement('option');
            opt.value = m; opt.textContent = m;
            monthSel.appendChild(opt);
        }
        monthSel.value = 1;

        var daySel = document.getElementById('bazi-day');
        for (var d = 1; d <= 31; d++) {
            var opt = document.createElement('option');
            opt.value = d; opt.textContent = d;
            daySel.appendChild(opt);
        }
        daySel.value = 1;

        var scSel = document.getElementById('bazi-shichen');
        SHI_CHEN.forEach(function (sc) {
            var opt = document.createElement('option');
            opt.value = sc.hour; opt.textContent = sc.name;
            scSel.appendChild(opt);
        });

        var genderSel = document.getElementById('bazi-gender');
        var optM = document.createElement('option');
        optM.value = '0'; optM.textContent = 'Male';
        var optF = document.createElement('option');
        optF.value = '1'; optF.textContent = 'Female';
        genderSel.appendChild(optM);
        genderSel.appendChild(optF);
    }

    // ==================== CALCULATE ====================
    function calculate() {
        // Consent check
        var consentBox = document.getElementById('bazi-consent');
        if (consentBox && !consentBox.checked) {
            var container = document.getElementById('bazi-result');
            if (container) {
                container.style.display = 'block';
                container.innerHTML = '<div class="bazi-error">Please agree to the Privacy Policy before calculating.</div>';
            }
            return;
        }

        var yy = parseInt(document.getElementById('bazi-year').value);
        var mm = parseInt(document.getElementById('bazi-month').value);
        var dd = parseInt(document.getElementById('bazi-day').value);
        var hh = parseInt(document.getElementById('bazi-shichen').value);
        var xb = parseInt(document.getElementById('bazi-gender').value);

        if (isNaN(yy) || isNaN(mm) || isNaN(dd) || isNaN(hh)) {
            var container = document.getElementById('bazi-result');
            if (container) {
                container.style.display = 'block';
                container.innerHTML = '<div class="bazi-error">Please fill in all fields.</div>';
            }
            return;
        }

        // Track submission
        if (window.DaoTrack) {
            window.DaoTrack.pageView('bazi-calculator');
            window.DaoTrack.toolSubmit('bazi', {
                gender: xb === 0 ? 'M' : 'F',
                birthYear: yy
            });
        }

        // Redirect to result page with params in URL hash
        var params = JSON.stringify({ yy: yy, mm: mm, dd: dd, hh: hh, xb: xb });
        window.location.href = '/bazi-calculator/bazi-result.html#' + encodeURIComponent(params);
    }

    function resetForm() {
        document.getElementById('bazi-year').value = 1990;
        document.getElementById('bazi-month').value = 1;
        document.getElementById('bazi-day').value = 1;
        document.getElementById('bazi-gender').value = '1';
        var result = document.getElementById('bazi-result');
        if (result) {
            result.style.display = 'none';
            result.innerHTML = '';
        }
    }

    // ==================== BOOT ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
