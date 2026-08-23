// Amazon Affiliate Product Recommendations
// Universal script for all tool/landing pages (blog articles use build-blog.js).
// Pulls from the shared 38-item library (data/amazon-products.json) so recommendations
// stay consistent with /shop and blog, and randomly rotates the displayed picks.

(function () {
    const TAG = 'daoessence25-20';

    // 侧栏显示几个；主区域显示几个
    const SIDEBAR_DISPLAY_COUNT = 2;
    const MAIN_DISPLAY_COUNT = 4;
    // 轮播间隔（毫秒）。设 0 可关闭自动切换。
    const ROTATE_INTERVAL = 7000;

    // 库缓存（跨容器/页面共享，避免重复请求）
    let LIBRARY = null;
    let LIBRARY_PROMISE = null;

    function loadLibrary() {
        if (LIBRARY) return Promise.resolve(LIBRARY);
        if (LIBRARY_PROMISE) return LIBRARY_PROMISE;
        LIBRARY_PROMISE = fetch('/data/amazon-products.json')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                LIBRARY = Array.isArray(d) ? d : (d.products || []);
                return LIBRARY;
            })
            .catch(function (e) {
                console.error('[amazon-rec] library load failed:', e);
                LIBRARY = [];
                return LIBRARY;
            });
        return LIBRARY_PROMISE;
    }

    function buildUrl(p) {
        const tail = '&linkCode=as2&creative=9325&camp=1789';
        if (p.asin) return 'https://www.amazon.com/dp/' + p.asin + '?tag=' + TAG + tail;
        const q = encodeURIComponent(p.keywords || p.name || '');
        return 'https://www.amazon.com/s?k=' + q + '&tag=' + TAG + tail;
    }

    // Fisher–Yates 洗牌，返回新数组
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function pick(count) {
        if (!LIBRARY || LIBRARY.length === 0) return [];
        return shuffle(LIBRARY).slice(0, Math.min(count, LIBRARY.length));
    }

    function ratingNumber(p) {
        const m = String(p.rating || '').match(/[\d.]+/);
        return m ? m[0] : '';
    }

    // 每个容器的轮播计时器，便于语言切换/重复调用时清理
    const timers = {};

    const CSS = `
        .amazon-rec { margin: 2rem 0; padding: 1.5rem; background: linear-gradient(145deg, #2d2420, #1a1512); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; transition: opacity 0.45s ease; }
        .amazon-rec-title { font-family: var(--serif); font-size: 1rem; color: #d4af37; text-align: center; margin-bottom: 1rem; letter-spacing: 0.12em; text-transform: uppercase; }
        .amazon-rec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .amazon-rec-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; text-align: center; transition: transform 0.3s; }
        .amazon-rec-card:hover { transform: translateY(-4px); }
        .amazon-rec-card img { width: 100%; height: 150px; object-fit: contain; background: #fff; border-radius: 6px; padding: 0.5rem; margin-bottom: 0.75rem; }
        .amazon-rec-card h4 { font-size: 0.9rem; color: #f5e6d3; margin: 0 0 0.5rem; line-height: 1.3; }
        .amazon-rec-rating { display: flex; align-items: center; justify-content: center; gap: 0.3rem; margin-bottom: 0.5rem; }
        .amazon-rec-rating .stars { color: #d4af37; font-size: 0.8rem; }
        .amazon-rec-rating .count { font-size: 0.7rem; color: #999; }
        .amazon-rec-price { font-size: 1.1rem; font-weight: 700; color: #d4af37; margin-bottom: 0.75rem; }
        .amazon-rec-btn { display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1512; font-weight: 700; font-size: 0.8rem; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; transition: all 0.3s; }
        .amazon-rec-btn:hover { background: linear-gradient(135deg, #e5c048, #d4af37); transform: translateY(-2px); }
        /* Sidebar: vertical layout */
        .bazi-sidebar .amazon-rec-grid { grid-template-columns: 1fr !important; gap: 0.75rem; }
        .bazi-sidebar .amazon-rec-card { padding: 0.75rem; }
        .bazi-sidebar .amazon-rec-card img { height: 120px; }
        /* Soulmate page */
        #amazonRecContainer .amazon-rec-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 1rem; }
        #amazonRecContainer .amazon-rec-card { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.03) !important; }
        #amazonRecContainer .amazon-rec-card img { background: transparent !important; }
        @media (max-width: 768px) { .amazon-rec-grid { grid-template-columns: repeat(2, 1fr) !important; } }
    `;

    function injectCSS() {
        if (document.getElementById('amazon-rec-css')) return;
        const style = document.createElement('style');
        style.id = 'amazon-rec-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function renderAmazonRec(containerId, forceCount) {
        const recEl = document.getElementById(containerId);
        if (!recEl) return;
        injectCSS();

        const isZh = (window.DaoI18n && typeof window.DaoI18n.current === 'function' && window.DaoI18n.current() === 'zh');
        const isSidebar = recEl.closest('.bazi-sidebar') !== null;
        const displayCount = forceCount || (isSidebar ? SIDEBAR_DISPLAY_COUNT : MAIN_DISPLAY_COUNT);
        const title = isZh ? '開運好物推薦' : 'Recommended for You';
        const btnText = isZh ? '点击查看' : 'View on Amazon';

        loadLibrary().then(function () {
            function paint() {
                const products = pick(displayCount);
                if (products.length === 0) { recEl.innerHTML = ''; return; }
                let html = '<div class="amazon-rec-title">' + title + '</div><div class="amazon-rec-grid">';
                products.forEach(function (p) {
                    const name = (isZh && p.nameZh) ? p.nameZh : p.name;
                    const url = buildUrl(p);
                    const rt = ratingNumber(p);
                    const ratingHtml = rt
                        ? '<div class="amazon-rec-rating"><span class="stars">★★★★★</span><span class="count">' + rt + ' · ' + (p.reviews || '') + '</span></div>'
                        : '';
                    html += '<div class="amazon-rec-card">'
                        + '<img src="' + (p.image || '') + '" alt="' + (name || '') + '" loading="lazy">'
                        + '<h4>' + (name || '') + '</h4>'
                        + ratingHtml
                        + '<div class="amazon-rec-price">' + (p.price || '') + '</div>'
                        + '<a href="' + url + '" target="_blank" rel="nofollow sponsored noopener" class="amazon-rec-btn">' + btnText + '</a>'
                        + '</div>';
                });
                html += '</div>';
                recEl.style.opacity = '0';
                recEl.innerHTML = html;
                requestAnimationFrame(function () { recEl.style.opacity = '1'; });
            }

            paint();

            // 定时随机切换（hover 时暂停）
            if (timers[containerId]) { clearInterval(timers[containerId]); timers[containerId] = null; }
            if (ROTATE_INTERVAL > 0 && LIBRARY.length > displayCount) {
                timers[containerId] = setInterval(function () {
                    if (recEl.matches(':hover')) return;
                    paint();
                }, ROTATE_INTERVAL);
            }
        });
    }

    // Auto-render when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { renderAmazonRec('amazonRec'); });
    } else {
        renderAmazonRec('amazonRec');
    }

    // Export for manual re-render (e.g., after language switch)
    window.renderAmazonRec = renderAmazonRec;
})();
