/**
 * Amazon link geo-localization fallback.
 * OneLink is the ideal solution; when unavailable, this script detects the
 * visitor's country and rewrites amazon.com product/search links to the
 * local Amazon storefront. It keeps the page transparent (links are rewritten
 * once the country is known, so hover/click show the local destination).
 *
 * IMPORTANT: Commissions only accrue when the destination country has a valid
 * local Associates tracking tag configured below. Without local tags, visitors
 * get a better local-Amazon UX but clicks still attribute to the fallback US tag,
 * which typically does not earn on non-US storefronts. OneLink solves this
 * automatically; this script is a transparent stopgap.
 */
(function () {
  'use strict';

  var DEFAULT_TAG = (window.AMAZON_ASSOCIATE_TAG || 'daoessence25-20');

  // Country code (ISO 3166-1 alpha-2) -> local Amazon domain
  var DOMAINS = {
    US: 'amazon.com',
    CA: 'amazon.ca',
    GB: 'amazon.co.uk',
    IE: 'amazon.co.uk',
    DE: 'amazon.de',
    AT: 'amazon.de',
    CH: 'amazon.de',
    BE: 'amazon.de',
    FR: 'amazon.fr',
    IT: 'amazon.it',
    ES: 'amazon.es',
    NL: 'amazon.nl',
    SE: 'amazon.se',
    PL: 'amazon.pl',
    JP: 'amazon.co.jp',
    AU: 'amazon.com.au',
    IN: 'amazon.in',
    BR: 'amazon.com.br',
    MX: 'amazon.com.mx',
    SG: 'amazon.sg',
    AE: 'amazon.ae',
    SA: 'amazon.sa'
  };

  // Local tracking tags. Leave empty to fall back to DEFAULT_TAG.
  // Example: GB: 'daoessence25-21'
  var LOCAL_TAGS = {
    US: DEFAULT_TAG,
    CA: '',
    GB: '',
    IE: '',
    DE: '',
    AT: '',
    CH: '',
    BE: '',
    FR: '',
    IT: '',
    ES: '',
    NL: '',
    SE: '',
    PL: '',
    JP: '',
    AU: '',
    IN: '',
    BR: '',
    MX: '',
    SG: '',
    AE: '',
    SA: ''
  };

  var CACHE_KEY = 'daoessence_geo_cc';

  function getCountry() {
    return new Promise(function (resolve) {
      var cached = null;
      try { cached = sessionStorage.getItem(CACHE_KEY); } catch (e) {}
      if (cached) { resolve(cached); return; }

      // Primary: ipapi.co (CORS-enabled, no key required for basic use)
      fetch('https://ipapi.co/json/', { mode: 'cors', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var cc = (d && d.country_code) || 'US';
          try { sessionStorage.setItem(CACHE_KEY, cc); } catch (e) {}
          resolve(cc);
        })
        .catch(function () {
          // Fallback: ipinfo.io (also CORS-enabled, no key for basic use)
          fetch('https://ipinfo.io/json', { mode: 'cors', cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              var cc = (d && d.country) || 'US';
              try { sessionStorage.setItem(CACHE_KEY, cc); } catch (e) {}
              resolve(cc);
            })
            .catch(function () { resolve('US'); });
        });
    });
  }

  function rewriteHref(href, country) {
    if (!country || country === 'US' || !DOMAINS[country]) return href;
    try {
      var url = new URL(href);
      if (!/^(www\.)?amazon\.com$/i.test(url.hostname)) return href;

      var domain = DOMAINS[country];
      var tag = LOCAL_TAGS[country] || DEFAULT_TAG;
      var asin = (url.pathname.match(/\/dp\/([A-Z0-9]{10})/i) || [])[1]
        || (url.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i) || [])[1];
      var search = url.searchParams.get('k') || url.searchParams.get('keywords');

      if (asin) {
        return 'https://' + domain + '/dp/' + asin + '?tag=' + encodeURIComponent(tag);
      }
      if (search) {
        return 'https://' + domain + '/s?k=' + encodeURIComponent(search) + '&tag=' + encodeURIComponent(tag);
      }
      // Preserve path/query as-is but swap domain and ensure tag
      url.hostname = domain;
      if (!url.searchParams.has('tag')) url.searchParams.set('tag', tag);
      return url.href;
    } catch (e) {
      return href;
    }
  }

  function localizeLinks(country) {
    if (!country || country === 'US' || !DOMAINS[country]) return;
    var links = document.querySelectorAll('a[href*="amazon.com"]');
    links.forEach(function (a) {
      if (a.getAttribute('data-amazon-geo-localized')) return;
      var original = a.getAttribute('href');
      if (!original) return;
      var rewritten = rewriteHref(original, country);
      if (rewritten !== original) {
        a.setAttribute('href', rewritten);
        a.setAttribute('data-amazon-geo-original', original);
        a.setAttribute('data-amazon-geo-localized', '1');
      }
    });
  }

  function observe(country) {
    localizeLinks(country);
    if (typeof MutationObserver === 'undefined') return;
    try {
      var observer = new MutationObserver(function () { localizeLinks(country); });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  function init() {
    getCountry().then(function (country) {
      if (document.body) {
        observe(country);
      } else {
        document.addEventListener('DOMContentLoaded', function () { observe(country); });
      }
    });
  }

  // Expose for debugging / manual re-run
  window.AmazonGeo = {
    localize: function (country) { observe(country || 'US'); },
    getCountry: getCountry
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
