/**
 * Amazon affiliate product icon renderer.
 * Renders a branded SVG placeholder for a product when no real photo is available.
 * Tinted by the product's five-element affinity. Works in Node (build) and browser.
 */
(function (global) {
  'use strict';

  var ELEMENT_COLORS = {
    wood: '#4F9162',
    fire: '#C0563B',
    earth: '#B8893B',
    metal: '#9AA7B0',
    water: '#2E6F95'
  };

  var GOLD = '#D4AF37';

  // Simple, recognizable line-art paths per icon type (viewBox 0 0 64 64)
  var ICONS = {
    book: '<path d="M20 14c-5-3-13-3-13 2v30c0-5 8-5 13-2v-30z"/><path d="M44 14c5-3 13-3 13 2v30c0-5-8-5-13-2v-30z"/><path d="M32 12v34"/><path d="M20 16l12 2 12-2"/>',
    bracelet: '<circle cx="32" cy="32" r="15"/><circle cx="32" cy="32" r="9"/><path d="M32 17a15 15 0 0 1 0 30" stroke-width="1.2"/><circle cx="32" cy="14" r="2.4"/>',
    jade: '<circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="11" stroke-width="1.2"/><path d="M20 26h24M20 38h24" stroke-width="1"/>',
    zodiac: '<circle cx="32" cy="32" r="16"/><path d="M32 16v32M16 32h32"/><circle cx="32" cy="32" r="4"/>',
    compass: '<circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="12" stroke-width="1"/><path d="M32 20l5 12-5 12-5-12z" fill="#D4AF37" stroke="none"/><path d="M32 18v4M32 42v4M18 32h4M42 32h4" stroke-width="1.2"/>',
    bowl: '<path d="M16 30h32c0 10-7 16-16 16s-16-6-16-16z"/><path d="M12 30h40"/><path d="M32 14c-2 3 2 5 0 8M26 12c-2 3 2 5 0 8M38 12c-2 3 2 5 0 8" stroke-width="1.2"/>',
    incense: '<path d="M22 46h20"/><path d="M32 46V24"/><path d="M32 24c-3-3 3-6 0-9M32 24c3-3-3-6 0-9" stroke-width="1.2"/><path d="M22 50h20" stroke-width="1"/>',
    mala: '<circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="11" stroke-width="1"/><path d="M32 49v6M29 55h6" stroke-width="1.2"/>',
    coin: '<circle cx="32" cy="32" r="17"/><rect x="26" y="26" width="12" height="12" rx="1" stroke-width="1.5"/><path d="M32 16v4M32 44v4M16 32h4M44 32h4" stroke-width="1"/>',
    bagua: '<circle cx="32" cy="32" r="18"/><path d="M32 14a18 18 0 0 1 0 36 9 9 0 0 1 0-18 9 9 0 0 0 0-18z" fill="#D4AF37" stroke="none"/><circle cx="32" cy="23" r="2.5" fill="#1a1a1a" stroke="none"/><circle cx="32" cy="41" r="2.5" fill="#D4AF37" stroke="none"/>',
    tree: '<path d="M32 50V30"/><path d="M32 30c-9 0-15-6-15-13 0-7 6-13 15-13s15 6 15 13c0 7-6 13-15 13z"/><path d="M24 44h16" stroke-width="1"/>',
    fountain: '<path d="M18 44h28l-4-10H22z"/><path d="M22 34h20"/><path d="M32 34V18M32 18c-4 0-6 3-6 6M32 18c4 0 6 3 6 6" stroke-width="1.2"/><path d="M18 48h28" stroke-width="1"/>',
    vase: '<path d="M24 14h16l-2 6c6 4 8 10 8 16s-7 14-14 14-14-6-14-14 2-12 8-16z"/><path d="M24 14h16" stroke-width="1"/>',
    frog: '<path d="M18 40c0-10 6-16 14-16s14 6 14 16c0 4-3 6-6 6H24c-3 0-6-2-6-6z"/><circle cx="26" cy="30" r="2.2"/><circle cx="38" cy="30" r="2.2"/><path d="M16 44c-3-2-3-8 1-9M48 44c3-2 3-8-1-9" stroke-width="1.2"/>',
    zen: '<rect x="14" y="40" width="36" height="8" rx="2"/><path d="M20 40c0-6 4-8 12-8s12 2 12 8M22 32c2-4 6-5 10-5s8 1 10 5" stroke-width="1.2"/><circle cx="40" cy="26" r="3"/>',
    tea: '<path d="M20 28h22v10c0 7-6 12-11 12s-11-5-11-12z"/><path d="M42 30h4c3 0 4 4 1 6s-5 1-5-2" stroke-width="1.2"/><path d="M26 20c-2 2 2 4 0 6M32 18c-2 2 2 4 0 6" stroke-width="1"/>',
    candle: '<rect x="24" y="24" width="16" height="26" rx="2"/><path d="M32 24V14"/><path d="M32 14c-3-2 3-5 0-8M32 14c3-2-3-5 0-8" stroke-width="1.2"/><path d="M24 50h16" stroke-width="1"/>',
    cushion: '<ellipse cx="32" cy="34" rx="18" ry="13"/><path d="M20 30c0-3 2-5 5-5M44 30c0-3-2-5-5-5M20 40c0 3 2 5 5 5M44 40c0 3-2 5-5 5" stroke-width="1"/>'
  };

  function amazonIconSVG(icon, element) {
    var key = ICONS[icon] ? icon : 'book';
    var tint = ELEMENT_COLORS[element] || ELEMENT_COLORS.earth;
    var paths = ICONS[key];
    return (
      '<svg class="amazon-icon" viewBox="0 0 64 64" width="100%" height="100%" ' +
      'role="img" aria-label="product icon" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="32" cy="32" r="31" fill="' + tint + '" opacity="0.16"/>' +
      '<circle cx="32" cy="32" r="27" fill="none" stroke="' + tint + '" stroke-width="1" opacity="0.5"/>' +
      '<g stroke="' + GOLD + '" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      paths +
      '</g></svg>'
    );
  }

  var api = { amazonIconSVG: amazonIconSVG, ELEMENT_COLORS: ELEMENT_COLORS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.AmazonIcons = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
