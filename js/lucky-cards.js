/* Lucky Wallpaper sidebar cards — dynamic rotation every 3 days.
   Depends on window.LUCKY_WALLPAPERS (js/lucky-wallpapers.js). */
(function () {
  'use strict';

  function getLang() {
    if (window.DaoI18n && typeof window.DaoI18n.current === 'function') {
      return window.DaoI18n.current();
    }
    var p = window.location.pathname;
    return (p.indexOf('/zh/') === 0 || p === '/zh') ? 'zh' : 'en';
  }

  function langPrefix(lang) {
    return lang === 'zh' ? '/zh' : '';
  }

  // Theme pool: maps UI label -> wallpaper category (already present in wallpapers.json)
  var THEMES = [
    { cat: 'Wealth', labelEn: 'Wealth',     labelZh: '招财', link: '/wallpaper?cat=Wealth' },
    { cat: 'Love',   labelEn: 'Love',       labelZh: '桃花', link: '/wallpaper?cat=Love' },
    { cat: 'Energy', labelEn: 'Good Fortune', labelZh: '旺运', link: '/wallpaper?cat=Energy' }
  ];

  var DAY = 86400000;

  function render() {
    if (!window.LUCKY_WALLPAPERS) return;
    var lang = getLang();
    var cycleIdx = Math.floor(Date.now() / (3 * DAY)); // rotates every 3 days
    var n = THEMES.length;
    var picks = [THEMES[cycleIdx % n], THEMES[(cycleIdx + 1) % n]];

    picks.forEach(function (theme, i) {
      var el = document.querySelector('.lucky-card[data-pos="' + i + '"]');
      if (!el) return;
      var pool = window.LUCKY_WALLPAPERS[theme.cat] || [];
      if (!pool.length) { el.style.display = 'none'; return; }
      var wp = pool[cycleIdx % pool.length];
      var href = langPrefix(lang) + '/wallpaper/' + wp.slug;
      var moreHref = langPrefix(lang) + theme.link;
      var title = lang === 'zh' ? (wp.titleZh || wp.title) : wp.title;
      var tag = lang === 'zh' ? theme.labelZh : theme.labelEn;
      var more = lang === 'zh'
        ? ('更多' + theme.labelZh + '壁纸 →')
        : ('More ' + theme.labelEn + ' Wallpapers →');

      el.className = 'lucky-card theme-' + theme.cat.toLowerCase();
      el.innerHTML =
        '<a class="lc-cover" href="' + href + '" aria-label="' + title + '">' +
          '<img src="' + wp.thumb + '" alt="' + title + '" loading="lazy">' +
        '</a>' +
        '<div class="lc-body">' +
          '<span class="lc-tag">' + tag + '</span>' +
          '<a class="lc-title" href="' + href + '">' + title + '</a>' +
          '<a class="lc-more" href="' + moreHref + '">' + more + '</a>' +
        '</div>';
    });
  }

  function init() {
    render();
    // re-render on language switch
    document.addEventListener('daoessence:i18n-changed', render);
    window.addEventListener('storage', function (e) {
      if (e.key === 'daoessence_lang') render();
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
