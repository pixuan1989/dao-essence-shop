/**
 * DaoEssence i18n Language Switcher
 * Supports EN (default) / 繁體中文 (zh)
 * Designed for future extensibility to more languages.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'daoessence_lang';
  var SUPPORTED_LANGS = ['en', 'zh'];
  var DEFAULT_LANG = 'en';

  var currentLang = getSavedLang() || DEFAULT_LANG;
  var translations = null;
  var originalTexts = {}; // Cache original English text for each [data-i18n] element

  // ── Helpers ──

  function getSavedLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* noop */ }
  }

  /**
   * Detect browser language. Returns supported code or null.
   */
  function detectBrowserLang() {
    var nav = navigator.language || navigator.userLanguage || '';
    var code = nav.split('-')[0].toLowerCase();
    return SUPPORTED_LANGS.indexOf(code) !== -1 ? code : null;
  }

  /**
   * Determine initial language: URL path > URL param > saved > default
   */
  function getInitialLang() {
    // Check URL path for /zh/ prefix first
    if (window.location.pathname.indexOf('/zh/') === 0 || window.location.pathname === '/zh') {
      return 'zh';
    }
    var params = new URLSearchParams(window.location.search);
    var urlLang = params.get('lang');
    if (urlLang && SUPPORTED_LANGS.indexOf(urlLang) !== -1) return urlLang;
    var saved = getSavedLang();
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    return DEFAULT_LANG;
  }

  /**
   * Fetch translation file
   */
  function loadTranslations(lang) {
    var url = '/i18n/' + lang + '.json';
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.json();
    });
  }

  /**
   * Get nested value from translation object. Key = "section.key" or "section.sub.key"
   */
  function getNestedValue(obj, key) {
    return key.split('.').reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : null;
    }, obj);
  }

  /**
   * Cache original English text from [data-i18n] and [data-i18n-prefix] elements
   */
  function cacheOriginalTexts() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      if (!originalTexts[key]) {
        originalTexts[key] = el.innerHTML;
      }
    }
    // Also cache elements that use data-i18n-prefix/suffix
    var prefixed = document.querySelectorAll('[data-i18n-prefix]');
    for (var j = 0; j < prefixed.length; j++) {
      var pel = prefixed[j];
      var pkey = '__prefix_suffix__' + j;
      pel.setAttribute('data-i18n-cache-key', pkey);
      if (!originalTexts[pkey]) {
        originalTexts[pkey] = pel.innerHTML;
      }
    }
    // Cache original placeholders
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var pi = 0; pi < placeholders.length; pi++) {
      var plEl = placeholders[pi];
      var plKey = plEl.getAttribute('data-i18n-placeholder');
      if (!originalTexts['__placeholder__' + plKey]) {
        originalTexts['__placeholder__' + plKey] = plEl.getAttribute('placeholder');
      }
    }
  }

  /**
   * Apply translations to all [data-i18n] and [data-i18n-prefix] elements
   */
  function applyTranslations(t) {
    // Standard data-i18n
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      var value = getNestedValue(t, key);
      if (value) {
        el.innerHTML = value;
      }
    }
    // Handle placeholder attributes
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var pi = 0; pi < placeholders.length; pi++) {
      var pEl = placeholders[pi];
      var pKey = pEl.getAttribute('data-i18n-placeholder');
      var pVal = getNestedValue(t, pKey);
      if (pVal) {
        pEl.setAttribute('placeholder', pVal);
      }
    }
    // Handle data-i18n-prefix / data-i18n-suffix
    var prefixed = document.querySelectorAll('[data-i18n-prefix]');
    for (var j = 0; j < prefixed.length; j++) {
      var pel = prefixed[j];
      var prefixVal = getNestedValue(t, pel.getAttribute('data-i18n-prefix')) || '';
      var suffixVal = getNestedValue(t, pel.getAttribute('data-i18n-suffix')) || '';
      // Preserve child element nodes (like <span id="productCount">)
      // Clone child nodes before clearing, then re-insert with translated prefix/suffix
      var childNodes = [];
      for (var c = 0; c < pel.childNodes.length; c++) {
        childNodes.push(pel.childNodes[c].cloneNode(true));
      }
      pel.textContent = '';
      if (prefixVal) {
        pel.appendChild(document.createTextNode(prefixVal + ' '));
      }
      for (var k = 0; k < childNodes.length; k++) {
        pel.appendChild(childNodes[k]);
      }
      if (suffixVal) {
        pel.appendChild(document.createTextNode(' ' + suffixVal));
      }
    }
    // Handle blog card category and read-time labels
    var zhCats = document.querySelectorAll('[data-zh-cat]');
    for (var ci = 0; ci < zhCats.length; ci++) {
      if (!originalTexts['__zhcat__' + ci]) {
        originalTexts['__zhcat__' + ci] = zhCats[ci].textContent;
      }
      zhCats[ci].textContent = zhCats[ci].getAttribute('data-zh-cat');
    }
    var zhTexts = document.querySelectorAll('[data-zh-text]');
    for (var zti = 0; zti < zhTexts.length; zti++) {
      if (!originalTexts['__zhtext__' + zti]) {
        originalTexts['__zhtext__' + zti] = zhTexts[zti].textContent;
      }
      zhTexts[zti].textContent = zhTexts[zti].getAttribute('data-zh-text');
    }
    var zhTitles = document.querySelectorAll('[data-zh-title]');
    for (var hti = 0; hti < zhTitles.length; hti++) {
      var zhVal = zhTitles[hti].getAttribute('data-zh-title');
      if (zhVal) {
        if (!originalTexts['__zhtitle__' + hti]) originalTexts['__zhtitle__' + hti] = zhTitles[hti].textContent;
        zhTitles[hti].textContent = zhVal;
      }
    }
    var zhDescs = document.querySelectorAll('[data-zh-desc]');
    for (var ddi = 0; ddi < zhDescs.length; ddi++) {
      var zhDVal = zhDescs[ddi].getAttribute('data-zh-desc');
      if (zhDVal) {
        if (!originalTexts['__zhdesc__' + ddi]) originalTexts['__zhdesc__' + ddi] = zhDescs[ddi].textContent;
        zhDescs[ddi].textContent = zhDVal;
      }
    }
    // FAQ question translations (summary elements)
    var zhFaqQs = document.querySelectorAll('[data-zh-faq]');
    for (var fqi = 0; fqi < zhFaqQs.length; fqi++) {
      var fqVal = zhFaqQs[fqi].getAttribute('data-zh-faq');
      if (fqVal) {
        if (!originalTexts['__zhfaq__' + fqi]) originalTexts['__zhfaq__' + fqi] = zhFaqQs[fqi].textContent;
        zhFaqQs[fqi].textContent = fqVal;
      }
    }
    // FAQ answer translations (p elements inside details)
    var zhFaqAs = document.querySelectorAll('[data-zh-faq-a]');
    for (var fai = 0; fai < zhFaqAs.length; fai++) {
      var faVal = zhFaqAs[fai].getAttribute('data-zh-faq-a');
      if (faVal) {
        if (!originalTexts['__zhfqa__' + fai]) originalTexts['__zhfqa__' + fai] = zhFaqAs[fai].textContent;
        zhFaqAs[fai].textContent = faVal;
      }
    }
  }

  /**
   * Restore all [data-i18n] and [data-i18n-prefix] elements to their original English text
   */
  function restoreOriginalTexts() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      if (originalTexts[key]) {
        el.innerHTML = originalTexts[key];
      }
    }
    // Restore prefixed/suffixed elements
    var prefixed = document.querySelectorAll('[data-i18n-prefix]');
    for (var j = 0; j < prefixed.length; j++) {
      var pel = prefixed[j];
      var cacheKey = pel.getAttribute('data-i18n-cache-key');
      if (cacheKey && originalTexts[cacheKey]) {
        pel.innerHTML = originalTexts[cacheKey];
      }
    }
    // Restore placeholders
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var pi = 0; pi < placeholders.length; pi++) {
      var plEl = placeholders[pi];
      var plKey = '__placeholder__' + plEl.getAttribute('data-i18n-placeholder');
      if (originalTexts[plKey]) {
        plEl.setAttribute('placeholder', originalTexts[plKey]);
      }
    }
    // Restore blog card category and read-time labels
    var rCats = document.querySelectorAll('[data-zh-cat]');
    for (var rci = 0; rci < rCats.length; rci++) {
      var rck = '__zhcat__' + rci;
      if (originalTexts[rck]) { rCats[rci].textContent = originalTexts[rck]; }
    }
    var rTexts = document.querySelectorAll('[data-zh-text]');
    for (var rti = 0; rti < rTexts.length; rti++) {
      var rtk = '__zhtext__' + rti;
      if (originalTexts[rtk]) { rTexts[rti].textContent = originalTexts[rtk]; }
    }
    var rTitles = document.querySelectorAll('[data-zh-title]');
    for (var rhti = 0; rhti < rTitles.length; rhti++) {
      var rhk = '__zhtitle__' + rhti;
      if (originalTexts[rhk]) { rTitles[rhti].textContent = originalTexts[rhk]; }
    }
    var rDescs = document.querySelectorAll('[data-zh-desc]');
    for (var rdi = 0; rdi < rDescs.length; rdi++) {
      var rdk = '__zhdesc__' + rdi;
      if (originalTexts[rdk]) { rDescs[rdi].textContent = originalTexts[rdk]; }
    }
    var rFaqQs = document.querySelectorAll('[data-zh-faq]');
    for (var rfqi = 0; rfqi < rFaqQs.length; rfqi++) {
      var rfqk = '__zhfaq__' + rfqi;
      if (originalTexts[rfqk]) { rFaqQs[rfqi].textContent = originalTexts[rfqk]; }
    }
    var rFaqAs = document.querySelectorAll('[data-zh-faq-a]');
    for (var rfai = 0; rfai < rFaqAs.length; rfai++) {
      var rfak = '__zhfqa__' + rfai;
      if (originalTexts[rfak]) { rFaqAs[rfai].textContent = originalTexts[rfak]; }
    }
  }

  /**
   * Update page lang attribute
   */
  function updateHtmlLang(lang) {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  }

  /**
   * Update language switcher UI (flag + label)
   */
  function updateSwitcherUI(lang) {
    var label = document.getElementById('lang-label');
    if (!label) return;
    if (lang === 'zh') {
      label.textContent = '繁中';
    } else {
      label.textContent = 'EN';
    }
  }

  /**
   * Highlight active option in dropdown
   */
  function highlightActiveOption(lang) {
    var options = document.querySelectorAll('.lang-option');
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      if (opt.getAttribute('data-lang') === lang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    }
  }

  /**
   * Rewrite internal navigation links when switching language.
   * Adds/removes /zh prefix for blog and bilingual pages.
   */
  var BLOG_PATHS = ['/blog/', '/blog/bazi-astrology', '/blog/zodiac-horoscope', '/blog/feng-shui'];
  var ZODIAC_PATHS = ['/zodiac/daily'];

  function rewriteNavLinks(lang) {
    // Only rewrite blog links to /zh/blog/* when zh pages actually exist.
    // If /zh/ pages don't exist, keep all links at their original EN paths —
    // i18n-switcher uses JS DOM replacement on the same URL instead.
    if (lang === 'zh' && !hasZhPages()) return;

    var links = document.querySelectorAll('header a[href], footer a[href], .nav-dropdown-menu a[href], .articles-list a[href], .article-card[href]');

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

      var normalized = href.replace(/\/$/, '');
      var isBlog = false;

      for (var j = 0; j < BLOG_PATHS.length; j++) {
        var p = BLOG_PATHS[j].replace(/\/$/, '');
        if (normalized === p || normalized === p + '.html' || normalized.indexOf('/blog/') === 0) {
          isBlog = true;
          break;
        }
      }
      // Also rewrite /zodiac/ links
      if (!isBlog && normalized.indexOf('/zodiac/') === 0) {
        isBlog = true;
      }

      if (!isBlog) continue;

      if (lang === 'zh') {
        if (normalized.indexOf('/zh') !== 0) {
          link.setAttribute('href', '/zh' + normalized);
        }
      } else {
        if (normalized.indexOf('/zh') === 0) {
          link.setAttribute('href', normalized.substring(3));
        }
      }
    }
  }

  // ── Switch ──

  /**
   * Check if /zh/ blog pages actually exist on the server.
   * Uses a lightweight HEAD request with cache — runs at most once per session.
   */
  var _zhPagesExist = null; // null = not checked yet
  function hasZhPages() {
    if (_zhPagesExist !== null) return _zhPagesExist;
    // Optimistic: assume no /zh/ pages (default state when DASHSCOPE_API_KEY is not set)
    // The actual check is async, so for synchronous calls we default to false.
    // The async version is used in init() for auto-redirect decisions.
    return false;
  }
  function checkZhPagesAsync() {
    if (_zhPagesExist !== null) return Promise.resolve(_zhPagesExist);
    return fetch('/zh/blog/', { method: 'HEAD', cache: 'no-store' })
      .then(function(r) { _zhPagesExist = r.ok; return _zhPagesExist; })
      .catch(function() { _zhPagesExist = false; return false; });
  }

  function switchLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    saveLang(lang);

    // ── Blog redirect (only when /zh/ pages exist) ──
    var pathname = window.location.pathname;
    var onBlogPath = pathname.indexOf('/blog/') === 0 || pathname === '/blog/' || pathname === '/blog' || pathname === '/blog/index.html';
    var onZhBlogPath = pathname === '/zh/blog' || pathname.indexOf('/zh/blog/') === 0;

    if (onZhBlogPath && lang === 'en') {
      // Always redirect /zh/ paths back to EN (handles stale bookmarks/links)
      var zhMatch = pathname.match(/^\/zh\/blog\/(.+)$/);
      if (zhMatch) {
        window.location.href = '/blog/' + zhMatch[1];
        return;
      }
      if (pathname === '/zh/blog/' || pathname === '/zh/blog' || pathname === '/zh/blog/index.html') {
        window.location.href = '/blog/';
        return;
      }
      var zhCatMatch = pathname.match(/^\/zh\/blog\/(bazi-astrology|zodiac-horoscope|feng-shui)\/?$/);
      if (zhCatMatch) {
        window.location.href = '/blog/' + zhCatMatch[1] + '/';
        return;
      }
      if (pathname === '/zh/shop' || pathname === '/zh/shop/') {
        window.location.href = '/shop';
        return;
      }
      var zhPrefixMatch = pathname.match(/^\/zh\/(.+?)\/?$/);
      if (zhPrefixMatch) {
        window.location.href = '/' + zhPrefixMatch[1] + '/';
        return;
      }
    }

    // For blog EN→ZH: use async check — redirect only if /zh/ pages exist
    if (onBlogPath && lang === 'zh') {
      // Must use async check; sync hasZhPages() defaults to false
      checkZhPagesAsync().then(function(zhExists) {
        if (!zhExists) {
          // /zh/ pages don't exist — fall through to JS DOM replacement
          _applyLangSwitch(lang);
          return;
        }
        var enMatch = pathname.match(/^\/blog\/(.+?)(\/)?$/);
        if (enMatch) {
          window.location.href = '/zh/blog/' + enMatch[1];
          return;
        }
        if (pathname === '/blog/' || pathname === '/blog' || pathname === '/blog/index.html') {
          window.location.href = '/zh/blog/';
          return;
        }
        var enCatMatch = pathname.match(/^\/blog\/(bazi-astrology|zodiac-horoscope|feng-shui)\/?$/);
        if (enCatMatch) {
          window.location.href = '/zh/blog/' + enCatMatch[1] + '/';
          return;
        }
        _applyLangSwitch(lang);
      });
      return;
    }

    // ── Wallpaper page redirect (static bilingual HTML, switch via URL) ─
    var onWallpaperEn = pathname.indexOf('/wallpaper/') === 0 || pathname === '/wallpaper/' || pathname === '/wallpaper';
    var onWallpaperZh = pathname.indexOf('/zh/wallpaper/') === 0 || pathname === '/zh/wallpaper/' || pathname === '/zh/wallpaper';
    if (onWallpaperEn || onWallpaperZh) {
      var wpSlug = pathname.replace(/^\/zh\/wallpaper\//, '').replace(/^\/wallpaper\//, '').replace(/^\/wallpaper$/, '').replace(/^\/zh\/wallpaper$/, '').replace(/\/$/, '');
      if (lang === 'zh') {
        window.location.href = '/zh/wallpaper/' + (wpSlug ? wpSlug : '');
      } else {
        window.location.href = '/wallpaper/' + (wpSlug ? wpSlug : '');
      }
      return;
    }

    // ── JS DOM replacement (default for all pages) ──
    _applyLangSwitch(lang);
  }

  function _applyLangSwitch(lang) {
    if (lang === DEFAULT_LANG) {
      // Load English translations so that t('sc.result_summary') etc. resolve correctly
      loadTranslations(lang).then(function (t) {
        translations = t;
        restoreOriginalTexts();
        updateHtmlLang(lang);
        updateSwitcherUI(lang);
        highlightActiveOption(lang);
        rewriteNavLinks(lang);
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: lang } }));
      }).catch(function () {
        // Fallback: restore without translations (en.json missing or network error)
        translations = null;
        restoreOriginalTexts();
        updateHtmlLang(lang);
        updateSwitcherUI(lang);
        highlightActiveOption(lang);
        rewriteNavLinks(lang);
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: lang } }));
      });
    } else {
      loadTranslations(lang).then(function (t) {
        translations = t;
        applyTranslations(t);
        updateHtmlLang(lang);
        updateSwitcherUI(lang);
        highlightActiveOption(lang);
        rewriteNavLinks(lang);
        // Notify dynamic content to re-render
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: lang } }));
      }).catch(function (err) {
        console.warn('i18n: failed to load translations for', lang, err);
      });
    }
  }

  /**
   * Check if current URL is an English blog path that should redirect to /zh/blog/
   * when the user's saved language is zh. This handles the case where the user
   * switches to zh on one page, then navigates (back/forward/bookmark) to /blog/.
   */
  function shouldRedirectToZhBlog(pathname) {
    if (pathname.indexOf('/zh/') === 0) return false; // already on zh
    if (pathname === '/blog/' || pathname === '/blog' || pathname === '/blog/index.html') return true;
    if (pathname.match(/^\/blog\/(.+\.html)?$/)) return true;
    if (pathname.match(/^\/blog\/(bazi-astrology|zodiac-horoscope|feng-shui)\/?$/)) return true;
    return false;
  }

  // ── Init ──

  function applyInitialLang() {
    // Cache original English text ASAP before any translation is applied
    cacheOriginalTexts();

    // Bind dropdown events
    var trigger = document.getElementById('lang-trigger');
    var menu = document.getElementById('lang-menu');

    if (trigger && menu) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
      });

      var options = menu.querySelectorAll('.lang-option');
      for (var i = 0; i < options.length; i++) {
        options[i].addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var lang = this.getAttribute('data-lang');
          switchLanguage(lang);
          if (menu.classList.contains('show')) {
            menu.classList.remove('show');
          }
        });
      }
    }

    // Apply initial language
    if (currentLang !== DEFAULT_LANG) {
      loadTranslations(currentLang).then(function (t) {
        translations = t;
        applyTranslations(t);
        updateHtmlLang(currentLang);
        updateSwitcherUI(currentLang);
        highlightActiveOption(currentLang);
        rewriteNavLinks(currentLang);
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: currentLang } }));
      }).catch(function (err) {
        console.warn('i18n: init failed for', currentLang, err);
      });
    } else {
      // Load English translations so t() resolves keys correctly for dynamic content
      loadTranslations(currentLang).then(function (t) {
        translations = t;
        updateSwitcherUI(DEFAULT_LANG);
        highlightActiveOption(DEFAULT_LANG);
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: DEFAULT_LANG } }));
      }).catch(function () {
        // en.json missing or network error — proceed without translations
        updateSwitcherUI(DEFAULT_LANG);
        highlightActiveOption(DEFAULT_LANG);
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: DEFAULT_LANG } }));
      });
    }
  }

  function init() {
    // Determine initial language
    currentLang = getInitialLang();

    // ── Wallpaper pages: static bilingual HTML, skip ALL auto-redirect ──
    // These pages have separate EN/ZH files. Auto-redirect based on localStorage
    // would cause EN↔ZH loops. Only manual switch (URL redirect) should work.
    var wpPath = window.location.pathname;
    var onWallpaperPage = wpPath.indexOf('/wallpaper/') === 0 || wpPath.indexOf('/zh/wallpaper/') === 0 || wpPath === '/wallpaper/' || wpPath === '/wallpaper' || wpPath === '/zh/wallpaper/' || wpPath === '/zh/wallpaper';
    if (onWallpaperPage) {
      // Force currentLang from URL path, ignore stale localStorage
      currentLang = wpPath.indexOf('/zh/wallpaper') === 0 ? 'zh' : DEFAULT_LANG;
      // Still bind dropdown events and set UI state
      cacheOriginalTexts();
      var trigger = document.getElementById('lang-trigger');
      var menu = document.getElementById('lang-menu');
      if (trigger && menu) {
        trigger.addEventListener('click', function (e) { e.preventDefault(); });
        var options = menu.querySelectorAll('.lang-option');
        for (var i = 0; i < options.length; i++) {
          options[i].addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var lang = this.getAttribute('data-lang');
            switchLanguage(lang);
            if (menu.classList.contains('show')) { menu.classList.remove('show'); }
          });
        }
      }
      updateSwitcherUI(currentLang);
      highlightActiveOption(currentLang);
      document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: currentLang } }));
      return;
    }

    // ── Auto-redirect based on saved lang vs current URL ──
    var pathname = window.location.pathname;
    var onZhPath = pathname.indexOf('/zh/') === 0 || pathname === '/zh';

    // ZH → EN: if saved lang = en but on /zh/ URL → always redirect back
    if (currentLang === 'en' && onZhPath) {
      var enPath = pathname.replace(/^\/zh/, '') || '/';
      if (enPath === '/') {
        window.location.href = '/';
        return;
      }
      if (enPath.match(/^\/blog\/(bazi-astrology|zodiac-horoscope|feng-shui)\/$/)) {
        enPath = enPath.replace(/\/$/, '.html');
      }
      window.location.href = enPath;
      return;
    }

    // EN → ZH: only redirect if /zh/ pages actually exist
    // Use async check to avoid redirecting to 404
    if (currentLang === 'zh' && !onZhPath && shouldRedirectToZhBlog(pathname)) {
      checkZhPagesAsync().then(function(zhExists) {
        if (zhExists) {
          var zhPath = '/zh' + pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') + '/';
          if (pathname === '/blog' || pathname === '/blog/' || pathname === '/blog/index.html') {
            zhPath = '/zh/blog/';
          }
          window.location.href = zhPath;
          return;
        }
        // /zh/ pages don't exist — fall through to JS DOM replacement
        applyInitialLang();
      });
      return;
    }

    // Non-blog or non-zh-redirect case — apply initial language directly
    applyInitialLang();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for cross-page usage
  window.DaoI18n = {
    switchTo: switchLanguage,
    current: function () { return currentLang; },
    /**
     * Get translation for a key. Returns the translated string or the key itself.
     * Usage: window.DaoI18n.t('sc.result_badge')
     */
    t: function (key) {
      if (!translations) return key;
      var value = getNestedValue(translations, key);
      return value !== null ? value : key;
    }
  };
})();
