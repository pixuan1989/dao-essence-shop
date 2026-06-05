/**
 * Zodiac Daily Wallpaper Recommendation Module (Task P2)
 * Function: Adds a "Today's Lucky Wallpaper" recommendation to each zodiac card on the aggregate page.
 * Strategy: Append-Only, injects wallpaper cards into each zodiac card after data loads.
 * Style: Dark semi-transparent glass cards, consistent with existing modules.
 *
 * Element mapping (sign → inherent element):
 *   Rat/Pig → Water | Tiger/Rabbit → Wood | Snake/Horse → Fire
 *   Monkey/Rooster → Metal | Ox/Dragon/Goat/Dog → Earth
 */
(function() {
  'use strict';

  const CONFIG = {
    signToElement: {
      'rat': 'Water', 'pig': 'Water',
      'tiger': 'Wood', 'rabbit': 'Wood',
      'snake': 'Fire', 'horse': 'Fire',
      'monkey': 'Metal', 'rooster': 'Metal',
      'ox': 'Earth', 'dragon': 'Earth', 'goat': 'Earth', 'dog': 'Earth'
    },
    elementToCategory: {
      'Water': 'Five Elements', 'Wood': 'Nature', 'Fire': 'Energy',
      'Metal': 'Five Elements', 'Earth': 'Feng Shui'
    },
    limit: 1 // 1 wallpaper per sign card
  };

  // Get language from URL
  function getLang() {
    return window.location.pathname.indexOf('/zh/') === 0 ? 'zh' : 'en';
  }

  // Build title for a sign
  function buildTitle(sign, lang) {
    const isZh = lang === 'zh';
    const signNames = {
      rat: { zh: '鼠', en: 'Rat' }, ox: { zh: '牛', en: 'Ox' }, tiger: { zh: '虎', en: 'Tiger' },
      rabbit: { zh: '兔', en: 'Rabbit' }, dragon: { zh: '龙', en: 'Dragon' }, snake: { zh: '蛇', en: 'Snake' },
      horse: { zh: '马', en: 'Horse' }, goat: { zh: '羊', en: 'Goat' }, monkey: { zh: '猴', en: 'Monkey' },
      rooster: { zh: '鸡', en: 'Rooster' }, dog: { zh: '狗', en: 'Dog' }, pig: { zh: '猪', en: 'Pig' }
    };
    const name = signNames[sign] || { zh: sign, en: sign };
    return isZh ? `今日${name.zh}幸运壁纸` : `Today's Lucky Wallpaper for ${name.en}`;
  }

  // Render wallpaper recommendation into a card
  function renderCardRec(cardEl, wallpapers, sign) {
    if (cardEl.querySelector('.zodiac-wp-rec')) return; // Already rendered

    const element = CONFIG.signToElement[sign];
    const category = element ? CONFIG.elementToCategory[element] : null;
    let matched = [];

    if (category) {
      matched = wallpapers.filter(wp => wp.category === category);
    }
    if (matched.length === 0) {
      matched = [...wallpapers].sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
    } else {
      matched = matched.sort(() => 0.5 - Math.random()).slice(0, CONFIG.limit);
    }

    if (matched.length === 0) return;

    const lang = getLang();
    const title = buildTitle(sign, lang);
    const wp = matched[0];

    const recDiv = document.createElement('div');
    recDiv.className = 'zodiac-wp-rec';
    recDiv.innerHTML = `
      <div class="zwp-title">${title}</div>
      <a href="/wallpaper/${wp.slug || wp.id}" class="zwp-card">
        <img src="${wp.thumb}" alt="${wp.title}" loading="lazy" />
      </a>
    `;
    cardEl.appendChild(recDiv);
  }

  // Inject CSS
  function injectStyle() {
    if (document.getElementById('zodiac-wp-rec-style')) return;
    const style = document.createElement('style');
    style.id = 'zodiac-wp-rec-style';
    style.textContent = `
      .zodiac-wp-rec {
        margin-top: 10px;
        text-align: center;
      }
      .zwp-title {
        font-size: 11px;
        color: #D4AF37;
        margin-bottom: 6px;
        font-weight: 600;
        letter-spacing: 0.5px;
        opacity: 0.85;
      }
      .zwp-card {
        display: inline-block;
        width: 80px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.06);
        transition: transform 0.2s, border-color 0.2s;
      }
      .zwp-card:hover {
        transform: translateY(-2px);
        border-color: #D4AF37;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .zwp-card img { width: 100%; height: auto; display: block; }
      @media (max-width: 600px) {
        .zwp-card { width: 65px; }
        .zwp-title { font-size: 10px; }
      }
    `;
    document.head.appendChild(style);
  }

  // Core logic
  async function init() {
    const grid = document.getElementById('cardGrid');
    if (!grid) return;

    let wallpapers = [];
    try {
      const res = await fetch('/wallpapers.json');
      if (res.ok) wallpapers = await res.json();
    } catch (e) {
      console.warn('[Zodiac WP Rec] Failed to load wallpapers:', e);
    }
    if (wallpapers.length === 0) return;

    injectStyle();

    // Map each card to its sign
    const cards = grid.querySelectorAll('.zodiac-card');
    const signMap = {
      'Rat': 'rat', 'Ox': 'ox', 'Tiger': 'tiger', 'Rabbit': 'rabbit',
      'Dragon': 'dragon', 'Snake': 'snake', 'Horse': 'horse', 'Goat': 'goat',
      'Monkey': 'monkey', 'Rooster': 'rooster', 'Dog': 'dog', 'Pig': 'pig'
    };

    cards.forEach(function(card) {
      const nameEl = card.querySelector('.card-name');
      if (!nameEl) return;
      const signName = nameEl.textContent.trim();
      const sign = signMap[signName];
      if (!sign) return;
      // Append to .card-info (inside the <a> tag)
      const infoEl = card.querySelector('.card-info');
      if (!infoEl) return;
      renderCardRec(infoEl, wallpapers, sign);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
