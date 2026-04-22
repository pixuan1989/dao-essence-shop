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
   * Determine initial language: URL param > saved > default (no auto browser detection)
   */
  function getInitialLang() {
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
    var flag = document.getElementById('lang-flag');
    var label = document.getElementById('lang-label');
    if (!flag || !label) return;
    if (lang === 'zh') {
      flag.textContent = '🇹🇼';
      label.textContent = '繁中';
    } else {
      flag.textContent = '🇺🇸';
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

  // ── Switch ──

  function switchLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    saveLang(lang);

    // ── Blog redirect ──
    // Blog articles/pages are built as separate EN / zh-Hant HTML files at build time.
    // Runtime DOM replacement cannot translate article body — redirect to the
    // correct language version instead.
    var pathname = window.location.pathname;
    if (lang === 'zh') {
      // EN → ZH: /blog/slug → /zh/blog/slug
      var enMatch = pathname.match(/^\/blog\/(.+)$/);
      if (enMatch) {
        window.location.href = '/zh/blog/' + enMatch[1];
        return;
      }
      // EN → ZH: /blog/ → /zh/blog/
      if (pathname === '/blog/' || pathname === '/blog' || pathname === '/blog/index.html') {
        window.location.href = '/zh/blog/';
        return;
      }
      // EN → ZH: /blog/category → /zh/blog/category
      var enCatMatch = pathname.match(/^\/blog\/(bazi-astrology|zodiac-horoscope|feng-shui|daily-horoscope|lucky-tips)(\.html)?$/);
      if (enCatMatch) {
        window.location.href = '/zh/blog/' + enCatMatch[1] + '/';
        return;
      }
    } else {
      // ZH → EN: /zh/blog/slug → /blog/slug
      var zhMatch = pathname.match(/^\/zh\/blog\/(.+)$/);
      if (zhMatch) {
        window.location.href = '/blog/' + zhMatch[1];
        return;
      }
      // ZH → EN: /zh/blog/ → /blog/
      if (pathname === '/zh/blog/' || pathname === '/zh/blog' || pathname === '/zh/blog/index.html') {
        window.location.href = '/blog/';
        return;
      }
      // ZH → EN: /zh/blog/category → /blog/category
      var zhCatMatch = pathname.match(/^\/zh\/blog\/(bazi-astrology|zodiac-horoscope|feng-shui|daily-horoscope|lucky-tips)(\.html)?$/);
      if (zhCatMatch) {
        window.location.href = '/blog/' + zhCatMatch[1] + '.html';
        return;
      }
      // ZH → EN: /zh/shop → /shop
      if (pathname === '/zh/shop' || pathname === '/zh/shop/') {
        window.location.href = '/shop';
        return;
      }
      // ZH → EN: /zh/other → /other (general zh prefix redirect)
      var zhPrefixMatch = pathname.match(/^\/zh\/(.+)$/);
      if (zhPrefixMatch) {
        window.location.href = '/' + zhPrefixMatch[1];
        return;
      }
    }

    if (lang === DEFAULT_LANG) {
      // Restore original English text — no network request needed
      restoreOriginalTexts();
      translations = null;
      updateHtmlLang(lang);
      updateSwitcherUI(lang);
      highlightActiveOption(lang);
      // Notify dynamic content to re-render
      document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: lang } }));
    } else {
      loadTranslations(lang).then(function (t) {
        translations = t;
        applyTranslations(t);
        updateHtmlLang(lang);
        updateSwitcherUI(lang);
        highlightActiveOption(lang);
        // Notify dynamic content to re-render
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: lang } }));
      }).catch(function (err) {
        console.warn('i18n: failed to load translations for', lang, err);
      });
    }
  }

  // ── Init ──

  function init() {
    // Cache original English text ASAP before any translation is applied
    cacheOriginalTexts();

    // Determine initial language
    currentLang = getInitialLang();

    // Bind dropdown events
    var trigger = document.getElementById('lang-trigger');
    var menu = document.getElementById('lang-menu');

    if (trigger && menu) {
      // Prevent navigation
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
      });

      // Language option clicks
      var options = menu.querySelectorAll('.lang-option');
      for (var i = 0; i < options.length; i++) {
        options[i].addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var lang = this.getAttribute('data-lang');
          switchLanguage(lang);
          // Close dropdown
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
        document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: currentLang } }));
      }).catch(function (err) {
        console.warn('i18n: init failed for', currentLang, err);
      });
    } else {
      // currentLang === DEFAULT_LANG === 'en': no redirect needed, just init UI
      updateSwitcherUI(DEFAULT_LANG);
      highlightActiveOption(DEFAULT_LANG);
      document.dispatchEvent(new CustomEvent('daoessence:i18n-changed', { detail: { lang: DEFAULT_LANG } }));
    }
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
