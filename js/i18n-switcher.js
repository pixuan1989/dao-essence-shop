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
   * Determine initial language: URL param > saved > browser detect > default
   */
  function getInitialLang() {
    var params = new URLSearchParams(window.location.search);
    var urlLang = params.get('lang');
    if (urlLang && SUPPORTED_LANGS.indexOf(urlLang) !== -1) return urlLang;
    var saved = getSavedLang();
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    var detected = detectBrowserLang();
    if (detected) return detected;
    return DEFAULT_LANG;
  }

  /**
   * Fetch translation file
   */
  function loadTranslations(lang) {
    if (lang === 'en') return Promise.resolve(null);
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
   * Apply translations to all [data-i18n] elements
   */
  function applyTranslations(t) {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      var value = getNestedValue(t, key);
      if (value) {
        el.innerHTML = value;
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

    loadTranslations(lang).then(function (t) {
      translations = t;
      applyTranslations(t);
      updateHtmlLang(lang);
      updateSwitcherUI(lang);
      highlightActiveOption(lang);
    }).catch(function (err) {
      console.warn('i18n: failed to load translations for', lang, err);
    });
  }

  // ── Init ──

  function init() {
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
      }).catch(function (err) {
        console.warn('i18n: init failed for', currentLang, err);
      });
    } else {
      updateSwitcherUI(DEFAULT_LANG);
      highlightActiveOption(DEFAULT_LANG);
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
      if (currentLang === 'en' || !translations) return key;
      var value = getNestedValue(translations, key);
      return value !== null ? value : key;
    }
  };
})();
