
        document.addEventListener('contextmenu', event => event.preventDefault());

        // ── Nav: Category dropdown ──
        const wpnCatBtn = document.querySelector('.wpn-dropdown-btn');
        const wpnCatMenu = document.getElementById('wpn-cat-menu');
        if (wpnCatBtn && wpnCatMenu) {
            wpnCatBtn.addEventListener('click', function(e) {
                e.preventDefault();
                wpnCatMenu.classList.toggle('open');
            });
            // Event delegation for dynamically generated category links
            wpnCatMenu.addEventListener('click', function(e) {
                const a = e.target.closest('a');
                if (!a) return;
                e.preventDefault();
                const cat = a.getAttribute('data-cat') || 'All';
                wpnCatMenu.classList.remove('open');
                wpnCatMenu.querySelectorAll('a').forEach(function(x) { x.classList.remove('active'); });
                a.classList.add('active');
                // Sync with filter pills
                const pills = document.querySelectorAll('.tb-pill');
                pills.forEach(function(p) {
                    if (p.getAttribute('data-cat') === cat) p.click();
                });
            });
            document.addEventListener('click', function(e) {
                if (!wpnCatBtn.contains(e.target) && !wpnCatMenu.contains(e.target)) {
                    wpnCatMenu.classList.remove('open');
                }
            });
        }

        // ── Lang switcher ──
        const langTrigger = document.getElementById('lang-trigger');
        const langMenu = document.getElementById('lang-menu');
        if (langTrigger && langMenu) {
            langTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                langMenu.classList.toggle('open');
            });
            langMenu.querySelectorAll('.lang-option').forEach(function(opt) {
                opt.addEventListener('click', function(e) {
                    e.preventDefault();
                    var lang = this.getAttribute('data-lang');
                    try { localStorage.setItem('daoessence_lang', lang); } catch(ex) {}
                    var url = new URL(window.location.href);
                    url.searchParams.set('lang', lang);
                    window.location.href = url.href;
                });
            });
            document.addEventListener('click', function(e) {
                if (!langTrigger.contains(e.target) && !langMenu.contains(e.target)) {
                    langMenu.classList.remove('open');
                }
            });
        }

        // ── Search (existing logic) ──
        // Helper: get translated text via global i18n system
        function t(key) {
            if (window.DaoI18n) return window.DaoI18n.t(key);
            return key;
        }

        // State
        let allWallpapers = [];
        let activeCategory = 'All';
        let activeSort = 'popular';
        let searchQuery = '';
        let dynamicCats = [];

        // Category display name maps — per-language, prevents EN/ZH mixing
        const CAT_DISPLAY = {
            'Energy': 'Energy', 'Feng Shui': 'Feng Shui', 'Nature': 'Nature', 'Talisman': 'Talisman',
            '八字': 'BaZi', '占星': 'Astrology', '生肖': 'Zodiac', '神仙': 'Deities'
        };
        const CAT_ZH = {
            'Energy': '能量', 'Feng Shui': '风水', 'Nature': '自然', 'Talisman': '符箓',
            '八字': '八字', '占星': '占星', '生肖': '生肖', '神仙': '神仙'
        };

        // Category info map (descriptions for Explore cards) — keyed by actual data category names
        const CAT_INFO = {
            '风水': { tags: 'Feng Shui · Five Elements · Autumn Gold · Jade Green · Water Flow' },
            '能量': { tags: 'Cosmic Energy · Merkaba · Light Body · Spiritual Ascension' },
            '神仙': { tags: 'Deities · Immortals · Divine Beings · Celestial Guardians' },
            '生肖': { tags: 'Chinese Zodiac · Animal Signs · Yearly Fortune · Compatibility' },
            '占星': { tags: 'Astrology · Horoscope · Planetary · Star Signs' },
            '符籙': { tags: 'Talismans · Spiritual Symbols · Protective Seals · Sacred Scripts' },
            '八字': { tags: 'BaZi · Four Pillars · Destiny Analysis · Life Path' }
        };
        const CAT_INFO_ZH = {
            '风水': { tags: '風水 · 五行 · 秋金 · 翠玉 · 流水' },
            '能量': { tags: '宇宙能量 · 梅爾卡巴 · 光體 · 靈性提升' },
            '神仙': { tags: '神仙 · 仙界 · 神明 · 天界守護' },
            '生肖': { tags: '十二生肖 · 屬相 · 流年運勢 · 生肖配對' },
            '占星': { tags: '占星術 · 星座 · 行星 · 星盤' },
            '符籙': { tags: '符籙 · 靈符 · 護身符 · 道教法器' },
            '八字': { tags: '八字 · 四柱 · 命理分析 · 人生軌跡' }
        };

        // English category name → Chinese (for search matching)
        const CAT_EN_TO_ZH = {
            'bazi': '八字', 'astrology': '占星', 'zodiac': '生肖',
            'deities': '神仙', 'talismans': '符籙', 'energy': '能量',
            'feng shui': '风水', 'fengshui': '风水', 'feng-shui': '风水'
        };

        // Get current language
        function getLang() {
            if (window.DaoI18n) return window.DaoI18n.current();
            const params = new URLSearchParams(window.location.search);
            return params.get('lang') || localStorage.getItem('daoessence_lang') || 'en';
        }

        // Get display category name — per-language, no EN/ZH mixing
        function translateCat(cat) {
            if (cat === 'All') {
                const allTranslated = t('wallpaper.all');
                return allTranslated !== 'wallpaper.all' ? allTranslated : 'All';
            }
            const lang = getLang();
            if (lang === 'zh') {
                return CAT_ZH[cat] || cat;
            }
            return CAT_DISPLAY[cat] || cat;
        }

        // Extract unique categories from wallpaper data
        function extractCategories() {
            const cats = new Set(['All']);
            allWallpapers.forEach(w => {
                if (w.category) cats.add(w.category);
            });
            dynamicCats = [...cats].sort();
            return dynamicCats;
        }

        // Build nav dropdown categories (dynamic, synced with data)
        function buildNavDropdown() {
            const menu = document.getElementById('wpn-cat-menu');
            if (!menu) return;
            menu.innerHTML = '';
            dynamicCats.forEach(cat => {
                const a = document.createElement('a');
                a.href = '#' + encodeURIComponent(cat);
                a.dataset.cat = cat;
                a.textContent = cat === 'All' ? translateCat('All') : translateCat(cat);
                if (cat === activeCategory) a.classList.add('active');
                menu.appendChild(a);
            });
        }

        // Build category toolbar pills (dynamic)
        function buildCategoryPills() {
            const row = document.getElementById('cat-row');
            // Keep the label, remove old pills
            const label = row.querySelector('.tb-label');
            row.innerHTML = '';
            if (label) row.appendChild(label);

            dynamicCats.forEach(cat => {
                const pill = document.createElement('button');
                pill.className = 'tb-pill' + (cat === activeCategory ? ' active' : '');
                pill.textContent = cat === 'All' ? translateCat('All') : translateCat(cat);
                pill.dataset.cat = cat;
                pill.onclick = () => {
                    activeCategory = cat;
                    document.querySelectorAll('.tb-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    renderGrid();
                };
                row.appendChild(pill);
            });
        }

        // Build explore categories section
        function buildExploreCategories() {
            const section = document.querySelector('.explore-section');
            const grid = document.getElementById('cat-grid');
            const availableCats = dynamicCats.filter(c => c !== 'All' && CAT_INFO[c]);
            // Hide if 0 or 1 category (looks empty to users)
            if (availableCats.length <= 1) {
                section.style.display = 'none';
                return;
            }
            section.style.display = '';
            grid.innerHTML = '';
            const lang = getLang();
            const infoMap = lang === 'zh' ? CAT_INFO_ZH : CAT_INFO;

            availableCats.forEach(name => {
                const info = infoMap[name] || CAT_INFO[name];
                const card = document.createElement('div');
                card.className = 'cat-card';
                card.onclick = () => {
                    activeCategory = name;
                    document.querySelectorAll('.tb-pill').forEach(p => p.classList.remove('active'));
                    document.querySelector(`.tb-pill[data-cat="${name}"]`)?.classList.add('active');
                    renderGrid();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
                card.innerHTML = `<div class="cat-card-name">${translateCat(name)}</div><div class="cat-card-tags">${info.tags}</div>`;
                grid.appendChild(card);
            });
        }

        // Sort tabs
        document.querySelectorAll('.sort-tab').forEach(tab => {
            tab.onclick = () => {
                activeSort = tab.dataset.sort;
                document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderGrid();
            };
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = searchInput.value.trim().toLowerCase();
                renderGrid();
            }, 200);
        });

        // Get filtered + sorted wallpapers
        // Fuse.js fuzzy search (initialized once after data load)
        let fuseInstance = null;
        function initFuse() {
            if (fuseInstance || !allWallpapers.length) return;
            fuseInstance = new Fuse(allWallpapers, {
                keys: [
                    { name: 'title', weight: 0.5 },
                    { name: 'titleZh', weight: 0.5 },
                    { name: 'category', weight: 0.2 },
                    { name: 'categoryZh', weight: 0.2 },
                    { name: 'keywords', weight: 0.15 },
                    { name: 'keywordsZh', weight: 0.15 }
                ],
                includeScore: true,
                threshold: 0.4,   // 0.0 = exact, 1.0 = match anything
                ignoreLocation: true,
                minMatchCharLength: 1
            });
        }

        function getFiltered() {
            let list = [...allWallpapers];
            // Category filter
            if (activeCategory !== 'All') {
                list = list.filter(w => w.category === activeCategory);
            }
            // Search filter (Fuse.js fuzzy search)
            if (searchQuery) {
                initFuse();
                if (fuseInstance) {
                    const results = fuseInstance.search(searchQuery);
                    const ids = new Set(results.map(r => r.item.id));
                    list = list.filter(w => ids.has(w.id));
                }
            }
            // Sort
            if (activeSort === 'popular') {
                list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            } else if (activeSort === 'newest') {
                list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            }
            return list;
        }

        // Render grid
        function renderGrid() {
            const grid = document.getElementById('wallpaper-grid');
            const filtered = getFiltered();
            const resultText = filtered.length + ' ' + t('wallpaper.result_count');
            document.getElementById('result-count').textContent = resultText;

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        <p>${t('wallpaper.empty_state')}</p>
                    </div>`;
                return;
            }

            grid.innerHTML = '';
            filtered.forEach(wp => {
                const card = document.createElement('div');
                card.className = 'wallpaper-card';
                card.onclick = () => { const lang = getLang(); const slug = wp.slug || wp.id; window.location.href = (lang === 'zh' ? '/zh' : '') + '/wallpaper/' + slug; };
                const lang = (new URLSearchParams(window.location.search)).get('lang') || localStorage.getItem('daoessence_lang') || 'en';
                const cardTitle = lang === 'zh' ? (wp.titleZh || wp.title) : wp.title;
                card.innerHTML = `<img src="${wp.thumb}" alt="${cardTitle}" loading="lazy">`;
                grid.appendChild(card);
            });
        }

        // Listen for language changes from global i18n-switcher
        document.addEventListener('daoessence:i18n-changed', () => {
            buildNavDropdown();
            buildCategoryPills();
            buildExploreCategories();
            renderGrid();
            const heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                const lang = getLang();
                heroTitle.textContent = lang === 'zh' ? '旺運壁紙' : 'Lucky Wallpapers';
            }
        });

        // Init
        async function init() {
            try {
                const res = await fetch('wallpapers.json?t=' + new Date().getTime());
                allWallpapers = await res.json();
            } catch (e) {
                console.error('Failed to load wallpapers:', e);
            }
            extractCategories();
            // Read ?cat= from URL (set by detail page category links)
            const urlParams = new URLSearchParams(window.location.search);
            const catParam = urlParams.get('cat');
            if (catParam && dynamicCats.includes(catParam)) {
                activeCategory = catParam;
            }
            buildNavDropdown();
            buildCategoryPills();
            buildExploreCategories();
            renderGrid();
            // Set hero title based on current language
            const heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                const lang = getLang();
                heroTitle.textContent = lang === 'zh' ? '旺運壁紙' : 'Lucky Wallpapers';
            }
        }

        document.addEventListener('DOMContentLoaded', init);
    