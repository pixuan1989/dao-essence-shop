/*
 * 三合生肖吊坠 Amazon 推荐 —— 运行时动态挂载
 * 不写入任何静态 HTML，由本脚本根据当前页面生肖注入到 #detailRecPanel。
 * 调试：可在 URL 加 ?sign=tiger&lang=zh 强制指定（生产环境靠 pathname 自动识别）。
 */
(function () {
  'use strict';

  var SANHE = {
    rat: ['dragon', 'monkey'],
    ox: ['snake', 'rooster'],
    tiger: ['horse', 'dog'],
    rabbit: ['goat', 'pig'],
    dragon: ['rat', 'monkey'],
    snake: ['ox', 'rooster'],
    horse: ['tiger', 'dog'],
    goat: ['rabbit', 'pig'],
    monkey: ['rat', 'dragon'],
    rooster: ['ox', 'snake'],
    dog: ['tiger', 'horse'],
    pig: ['rabbit', 'goat']
  };

  var ZH_NAME = {
    rat: '鼠', ox: '牛', tiger: '虎', rabbit: '兔', dragon: '龍',
    snake: '蛇', horse: '馬', goat: '羊', monkey: '猴', rooster: '雞',
    dog: '狗', pig: '豬'
  };

  var EN_NAME = {
    rat: 'Rat', ox: 'Ox', tiger: 'Tiger', rabbit: 'Rabbit', dragon: 'Dragon',
    snake: 'Snake', horse: 'Horse', goat: 'Goat', monkey: 'Monkey', rooster: 'Rooster',
    dog: 'Dog', pig: 'Pig'
  };

  var PRODUCT_IMG = {
    rat: 'https://m.media-amazon.com/images/I/313u0rLYlML._AC_SL1500_.jpg',
    ox: 'https://m.media-amazon.com/images/I/419DBWXFUOL._AC_SL1500_.jpg',
    tiger: 'https://m.media-amazon.com/images/I/31sc42aYJkL._AC_SL1500_.jpg',
    rabbit: 'https://m.media-amazon.com/images/I/21SCukRBCFL._AC_SL1500_.jpg',
    dragon: 'https://m.media-amazon.com/images/I/31nyXxIxWmL._AC_SL1500_.jpg',
    snake: 'https://m.media-amazon.com/images/I/31co4KDxSFL._AC_SL1500_.jpg',
    horse: 'https://m.media-amazon.com/images/I/31dwLDq2-LL._AC_SL1500_.jpg',
    goat: 'https://m.media-amazon.com/images/I/21ZQ4hWQFrL._AC_SL1500_.jpg',
    monkey: 'https://m.media-amazon.com/images/I/31ieqXFgfYL._AC_SL1500_.jpg',
    rooster: 'https://m.media-amazon.com/images/I/31jySgcCDtL._AC_SL1500_.jpg',
    dog: 'https://m.media-amazon.com/images/I/31X5eO3en4L._AC_SL1500_.jpg',
    pig: 'https://m.media-amazon.com/images/I/31flT9DEIkL._AC_SL1500_.jpg'
  };

  var FALLBACK_IMG = 'https://m.media-amazon.com/images/I/71Cl8mQL8oL._AC_SL1500_.jpg';
  var ASSOCIATE_TAG = 'daoessence25-20';

  function currentSign() {
    var params = new URLSearchParams(location.search);
    var s = params.get('sign');
    if (s && SANHE[s.toLowerCase()]) return s.toLowerCase();
    var m = location.pathname.match(/\/zodiac\/([a-z]+)(?:-en)?\b/i);
    if (m) {
      var x = m[1].toLowerCase();
      if (SANHE[x]) return x;
    }
    return null;
  }

  function isEnglish() {
    var params = new URLSearchParams(location.search);
    if (params.has('lang')) return params.get('lang') === 'en';
    return /-en\b/.test(location.pathname) || document.documentElement.lang === 'en';
  }

  function searchUrl(target) {
    var kw = 'Jadeous Real Jade Chinese Zodiac ' + EN_NAME[target] + ' Pendant Necklace';
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(kw) +
      '&tag=' + ASSOCIATE_TAG + '&linkCode=as2&creative=9325&camp=1789';
  }

  function render() {
    var panel = document.getElementById('detailRecPanel');
    if (!panel) return;
    var sign = currentSign();
    if (!sign) return;
    var en = isEnglish();
    var targets = SANHE[sign];

    var title = en ? 'Triple Harmony Pendants' : '三合開運吊墜';
    var subtitle = en
      ? ('Lucky charms for ' + EN_NAME[sign])
      : (ZH_NAME[sign] + '的三合生肖，助運旺人緣');
    var tagText = en ? 'Sanhe Noble' : '三合貴人';
    var cta = en ? 'View all Triple Harmony Pendants →' : '查看全部三合吊墜 →';

    var items = targets.map(function (t) {
      var name = en ? EN_NAME[t] : ZH_NAME[t];
      var label = en ? (name + ' Jade Pendant') : ('翡翠' + name + '吊墜');
      var img = PRODUCT_IMG[t] || FALLBACK_IMG;
      return '<a class="zodiac-pendant-item" href="' + searchUrl(t) + '" target="_blank" rel="nofollow sponsored noopener">' +
        '<div class="zodiac-pendant-item__img-wrap"><img src="' + img + '" alt="' + label + '" loading="lazy" onerror="this.src=\'' + FALLBACK_IMG + '\';this.onerror=null;"></div>' +
        '<div class="zodiac-pendant-item__info"><div class="zodiac-pendant-item__name">' + label + '</div><div class="zodiac-pendant-item__tag">' + name + ' · ' + tagText + '</div></div>' +
        '<span class="zodiac-pendant-item__arrow">→</span>' +
        '</a>';
    }).join('');

    panel.innerHTML =
      '<div class="zodiac-pendant-rec">' +
        '<div class="zodiac-pendant-rec__title">' + title + '</div>' +
        '<div class="zodiac-pendant-rec__subtitle">' + subtitle + '</div>' +
        '<div class="zodiac-pendant-rec__list">' + items + '</div>' +
        '<a class="zodiac-pendant-rec__cta" href="' + searchUrl(sign) + '" target="_blank" rel="nofollow sponsored noopener">' + cta + '</a>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
