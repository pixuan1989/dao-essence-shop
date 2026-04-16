/**
 * DaoEssence BaZi Result Page
 * Reads params from URL hash, renders full chart with interpretations.
 * Powered by paipan.js
 */
(function () {
    'use strict';

    // ==================== CONSTANTS ====================
    var BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    var STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var WX_NAMES = ['金','水','木','火','土'];
    var WX_COLORS = { '金': '#C9B37A', '水': '#5B8FB9', '木': '#6B8E6B', '火': '#C25B56', '土': '#B8860B' };
    var WX_ICONS = { '金': '⚔️', '水': '💧', '木': '🌿', '火': '🔥', '土': '⛰️' };
    // stem index -> wuxing code (金=0, 水=1, 木=2, 火=3, 土=4)
    var STEM_WX = [2, 2, 3, 3, 4, 4, 0, 0, 1, 1];
    // branch index -> wuxing code
    var BRANCH_WX = [1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 4, 1];

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
        var total = nwx.reduce(function(a, b) { return a + b; }, 0);
        var dominant = [];
        var weak = [];
        var maxCount = Math.max.apply(null, nwx);

        for (var i = 0; i < 5; i++) {
            if (nwx[i] === 0) {
                weak.push(WX_NAMES[i]);
            } else if (nwx[i] === maxCount) {
                dominant.push(WX_NAMES[i]);
            }
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
            html += '<p><strong>Balanced Chart:</strong> All five elements are represented in your chart. This suggests a well-rounded personality with access to diverse energies. Your challenge lies in maintaining this balance rather than compensating for gaps.</p>';
        }

        return html;
    }

    // ==================== SHIER CHANGSHENG INTERPRETATION ====================
    function getNZSCClass(nzsc) {
        if (!nzsc) return 'neutral';
        if (nzsc.indexOf('大吉') >= 0 || nzsc.indexOf('吉') >= 0) return 'auspicious';
        if (nzsc.indexOf('凶') >= 0) return 'inauspicious';
        return 'neutral';
    }

    var DAYUN_INTERPRETATIONS = {
        '长生': 'represents birth and new beginnings — a period of vitality, learning, and growth. New opportunities emerge, and your energy is naturally upward.',
        '沐浴': 'is a phase of cleansing and refinement. You may experience personal transformation, heightened sensitivity, and creative breakthroughs. Social connections can be particularly meaningful.',
        '冠带': 'marks coming of age and recognition. Your talents are noticed, confidence rises, and you step into a more prominent role. Dress well and present your best self.',
        '临官': 'is your peak professional period — authority, success, and career advancement are strongly favored. Your efforts receive recognition, and financial stability increases.',
        '帝旺': 'represents maximum power and influence. You are at the height of your capabilities, but beware of overconfidence. Channel this energy wisely rather than letting it consume you.',
        '衰': 'signals a natural slowing down. Focus on consolidation rather than expansion. Your experience and wisdom become more valuable than raw ambition.',
        '病': 'suggests a period of vulnerability — health, emotions, or projects may need extra attention. This is a time for healing and reflection, not pushing forward aggressively.',
        '死': 'indicates endings and closure. Old chapters close to make way for new ones. While challenging, this phase is essential for transformation and rebirth.',
        '墓': 'is a period of storage and introspection. Focus on saving resources, consolidating gains, and deepening your knowledge. Good for research, planning, and behind-the-scenes work.',
        '绝': 'represents the deepest valley before the next rise. Though difficult, this phase tests your resilience and clears away what no longer serves you. Hold on — recovery follows.',
        '胎': 'marks the conception of a new cycle. New ideas, relationships, or projects begin to take shape. Nurture these seeds carefully; they hold future potential.',
        '养': 'is a nurturing phase of steady development. Like tending a garden, consistent care brings gradual progress. Patience and routine are your greatest allies.'
    };

    function getDayunInterpretation(dy, dmWxCode) {
        var nzsc = dy['nzsc'] || '';
        // Extract the stage name (before parentheses)
        var stage = nzsc.replace(/\(.*\)/, '').trim();
        var isAuspicious = nzsc.indexOf('大吉') >= 0 || nzsc.indexOf('吉') >= 0;
        var isInauspicious = nzsc.indexOf('凶') >= 0;

        var ganIdx = STEMS.indexOf(dy['zfma']);
        var zhiIdx = BRANCHES.indexOf(dy['zfmb']);
        var ganWx = ganIdx >= 0 ? WX_NAMES[STEM_WX[ganIdx]] : '';
        var zhiWx = zhiIdx >= 0 ? WX_NAMES[BRANCH_WX[zhiIdx]] : '';

        // Determine relationship to day master
        var ganRel = '';
        var zhiRel = '';
        if (ganIdx >= 0) {
            ganRel = getWxRelation(STEM_WX[ganIdx], dmWxCode, STEMS[ganIdx]);
        }

        var html = '<p>';
        html += '<strong>' + nzsc + '</strong> ' + (DAYUN_INTERPRETATIONS[stage] || 'is a transitional phase in your life journey.');
        html += '</p>';

        if (ganRel) {
            html += '<p>The Dayun Stem <strong>' + dy['zfma'] + ' (' + ganWx + ')</strong> brings ' + ganRel + ' energy. ';
        }
        if (zhiWx) {
            html += 'The Branch <strong>' + dy['zfmb'] + ' (' + zhiWx + ')</strong> influences your environment and relationships. ';
        }
        html += '</p>';

        // Auspicious/inauspicious note
        if (isAuspicious) {
            html += '<p style="color: #6B8E6B;">✦ This is an <strong>auspicious period</strong>. Make the most of favorable conditions for career, relationships, and personal growth.</p>';
        } else if (isInauspicious) {
            html += '<p style="color: #C25B56;">⚠ This is a <strong>challenging period</strong>. Focus on caution, preparation, and avoiding major risks. Use this time for internal growth.</p>';
        }

        return html;
    }

    function getWxRelation(wxCode, dmWxCode, stemChar) {
        // Generate relationship description based on wuxing
        var relations = [
            'same element (比肩) — independent, self-reliant',
            'produces you (印星) — supportive, educational',
            'you produce (食伤) — creative, expressive',
            'you control (财星) — material, practical',
            'controls you (官杀) — challenging, disciplinary'
        ];
        if (wxCode === dmWxCode) return relations[0]; // same element
        var wxCycle = [0, 1, 2, 3, 4]; // 金水木火土
        var dmPos = wxCycle.indexOf(dmWxCode);
        var wxPos = wxCycle.indexOf(wxCode);
        // 生: (dmPos + 1) % 5 produces dmPos
        if ((dmPos + 1) % 5 === wxPos) return 'produces you (印星) — supportive, educational';
        // 被生: dmPos produces (dmPos + 4) % 5
        if ((dmPos + 4) % 5 === wxPos) return 'you produce (食伤) — creative, expressive';
        // 克: dmPos controls (dmPos + 2) % 5
        if ((dmPos + 2) % 5 === wxPos) return 'you control (财星) — material, practical';
        // 被克: (dmPos + 3) % 5 controls dmPos
        if ((dmPos + 3) % 5 === wxPos) return 'controls you (官杀) — challenging, disciplinary';
        return '';
    }

    // ==================== MAIN RENDER ====================
    function renderResult(rt) {
        document.getElementById('bazi-loading').style.display = 'none';
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
        var dmWxCode = STEM_WX[STEMS.indexOf(dayMaster)];
        var dmElement = WX_NAMES[dmWxCode];
        var dmProfile = DM_PROFILES[dayMaster] || { element: dmElement, en: dayMaster, desc: '', traits: [] };

        // Five elements
        var nwx = rt['nwx'] || [0, 0, 0, 0, 0];
        var wxData = [];
        for (var i = 0; i < 5; i++) {
            wxData.push({ name: WX_NAMES[i], count: nwx[i], color: WX_COLORS[WX_NAMES[i]] });
        }

        // Hidden stems table
        var zcgTable = [[9,-1,-1],[5,9,7],[0,2,4],[1,-1,-1],[4,1,9],[2,4,6],[3,5,-1],[5,1,3],[6,8,4],[7,-1,-1],[4,7,3],[8,0,-1]];

        // Build pillars HTML
        var pillarLabels = ['Year Pillar', 'Month Pillar', 'Day Pillar', 'Hour Pillar'];
        var pillarsHTML = '';
        for (var p = 0; p < 4; p++) {
            var gan = rt['ctg'][p];
            var zhi = rt['cdz'][p];
            var ganWxCode = STEM_WX[STEMS.indexOf(gan)];
            var zhiWxCode = BRANCH_WX[BRANCHES.indexOf(zhi)];
            var ganWx = WX_NAMES[ganWxCode];
            var zhiWx = WX_NAMES[zhiWxCode];

            var hiddenStems = [];
            var cgIdx = BRANCHES.indexOf(zhi);
            if (zcgTable[cgIdx]) {
                zcgTable[cgIdx].forEach(function(sc) {
                    if (sc >= 0) hiddenStems.push(STEMS[sc]);
                });
            }

            pillarsHTML += '<div class="bazi-pillar">' +
                '<div class="bazi-pillar-label">' + pillarLabels[p] + '</div>' +
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
                        var swc = WX_NAMES[STEM_WX[STEMS.indexOf(s)]];
                        return '<span style="color:' + WX_COLORS[swc] + '">' + s + '</span>';
                    }).join(' ') +
                '</div>' +
            '</div>';
        }

        // Da Yun (大运)
        var qyyDesc = rt['qyy_desc'] || '';
        var dyHTML = '';
        if (rt['dy'] && rt['dy'].length > 0) {
            dyHTML = '<div class="bazi-dayun-section">';
            dyHTML += '<h3 class="bazi-section-title">Life Cycles (Da Yun)</h3>';
            dyHTML += '<p class="bazi-qyy">⏳ ' + qyyDesc + '</p>';
            dyHTML += '<p style="text-align:center;font-size:0.78rem;color:var(--text-muted);margin-bottom:1rem;">Click on any Life Cycle to see detailed interpretation and flow years.</p>';
            dyHTML += '<div class="bazi-dayun-grid">';
            for (var k = 0; k < Math.min(rt['dy'].length, 8); k++) {
                var dy = rt['dy'][k];
                var dyGanZhi = (dy['zfma'] || '') + (dy['zfmb'] || '');
                var dyNzsc = dy['nzsc'] || '';
                var nzscClass = getNZSCClass(dyNzsc);

                dyHTML += '<div class="bazi-dayun-item" data-dy-index="' + k + '">' +
                    '<div class="bazi-dayun-ganzhi">' + dyGanZhi + '</div>' +
                    '<div class="bazi-dayun-age">Age ' + dy['zqage'] + '-' + dy['zboz'] + '</div>' +
                    '<div class="bazi-dayun-years">' + dy['syear'] + '-' + dy['eyear'] + '</div>' +
                    (dyNzsc ? '<div class="bazi-dayun-status ' + nzscClass + '">' + dyNzsc + '</div>' : '') +
                '</div>';
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

            // Four Pillars
            '<h3 class="bazi-section-title">Four Pillars of Destiny</h3>' +
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
                '<p>This free BaZi chart is generated using traditional Chinese metaphysics calculations. It provides a foundational analysis of your birth chart. For comprehensive life path guidance, career advice, relationship insights, and personalized recommendations, consult a professional BaZi practitioner.</p>' +
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

            items.forEach(function(item) {
                item.addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-dy-index'));
                    var dy = rt['dy'][idx];

                    // Toggle active
                    if (activeItem === this) {
                        detailPanel.classList.remove('show');
                        this.classList.remove('active');
                        activeItem = null;
                        return;
                    }

                    if (activeItem) activeItem.classList.remove('active');
                    this.classList.add('active');
                    activeItem = this;

                    // Update detail
                    detailTitle.textContent = 'Dayun ' + (dy['zfma'] || '') + (dy['zfmb'] || '') + ' — Age ' + dy['zqage'] + ' to ' + dy['zboz'];
                    detailInterp.innerHTML = getDayunInterpretation(dy, dmWxCode);

                    // Liu Nian (Flow Years)
                    if (dy['ly'] && dy['ly'].length > 0) {
                        var lyHTML = '<p class="bazi-liunian-title">Flow Years (Liu Nian)</p>';
                        lyHTML += '<div class="bazi-liunian-grid">';
                        dy['ly'].forEach(function(ly) {
                            lyHTML += '<div class="bazi-liunian-item">' +
                                '<div class="ly-ganzhi">' + (ly['lye'] || '') + '</div>' +
                                '<div class="ly-year">' + (ly['year'] || ly['age'] || '') + '</div>' +
                            '</div>';
                        });
                        lyHTML += '</div>';
                        liunianSection.innerHTML = lyHTML;
                    } else {
                        liunianSection.innerHTML = '';
                    }

                    detailPanel.classList.add('show');
                    detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            });

            closeBtn.addEventListener('click', function() {
                detailPanel.classList.remove('show');
                if (activeItem) { activeItem.classList.remove('active'); activeItem = null; }
            });
        }
    }

    // ==================== INIT ====================
    function init() {
        // Read params from URL hash
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
        errDiv.innerHTML = '<p>' + msg + '</p><a href="/#free-bazi">← Try Again</a>';
    }

    // ==================== BOOT ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
