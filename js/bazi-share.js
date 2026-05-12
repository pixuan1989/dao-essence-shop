/* DAO Essence - Bazi Module Universal Share System
   Auto-detects all .case-example, figure > img, and .shensha-table elements
   and adds hover-triggered share buttons to each.
   Future content using these selectors will be automatically covered. */

(function() {
  'use strict';

  /* ---- Config ---- */
  /* SVG icons copied exactly from learn-bazi.html share buttons (line 376-384) */
  var SVG_ICONS = {
    twitter:   '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    facebook:  '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 012.063-2.065 2.064 2.064 0 012.063 2.065 2.062 2.062 0 01-2.063 2.065zM6.835 20.452H3.842V9h2.993zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    whatsapp:  '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.295-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.66-2.058-.174-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12c0 1.89.525 3.66 1.438 5.169L1.5 22.5l5.525-1.403A10.49 10.49 0 0012 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5z"/></svg>',
    reddit:    '<svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.74 3.74 0 01-1.709.275c.046.576.262 1.102.587 1.512.352.39.812.598 1.295.705.454.106.94.16 1.444.165.469.004.936-.04 1.388-.117.49-.075.957-.227 1.383-.454.004-.018.01-.037.013-.055.398-.37.59-.85.47-1.352-.12-.502-.45-.926-.92-1.141-.47-.216-1.001-.258-1.552-.173-.358.05-.71.13-1.048.252-.337.122-.643.32-.892.583-.25.262-.608.716-.608 1.26 0 .24.07.473.195.664.124.19.3.348.511.458.213.11.451.17.688.169.236.002.47-.057.683-.155.213-.098.404-.24.543-.41l1.24 1.017c-.143.168-.317.32-.518.443-.201.124-.427.22-.665.28-.238.062-.482.09-.727.083-.488-.014-1-.17-1.483-.59-.484-.42-.76-.98-.76-1.657 0-.74.252-1.396.72-1.877.47-.48 1.104-.757 1.79-.8l.003-.002.002-.002c.595-.073 1.193.046 1.71.34.518.292.93.82 1.11 1.49.182.67.083 1.39-.21 1.966-.293.575-.74 1.035-1.272 1.33l-.003.002z"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.903 1.407-5.903s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.011-.644 2.528-.978 3.936-.277 1.176.59 2.134 1.746 2.134 2.094 0 3.697-2.208 3.697-5.396 0-2.823-2.028-4.795-4.926-4.795-3.357 0-5.328 2.52-5.328 5.126 0 1.015.39 2.105.877 2.696a.54.54 0 01.098.518c-.107.446-.346 1.397-.394 1.592-.062.251-.195.304-.451.181-1.683-.784-2.733-3.248-2.733-5.23 0-4.268 3.103-8.192 8.946-8.192 4.697 0 8.346 3.348 8.346 7.815 0 4.607-2.903 8.314-6.934 8.314-1.353 0-2.623-.704-3.057-1.53l-.83 3.168c-.3 1.145-1.128 2.575-1.679 3.444C9.801 23.865 10.893 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    copy:      '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>'
  };

  var SHARE_PLATFORMS = [
    { id: 'twitter',   color: '#1DA1F2', label: 'X (Twitter)' },
    { id: 'facebook',  color: '#1877F2', label: 'Facebook' },
    { id: 'linkedin',  color: '#0A66C2', label: 'LinkedIn' },
    { id: 'whatsapp',  color: '#25D366', label: 'WhatsApp' },
    { id: 'reddit',    color: '#FF4500', label: 'Reddit' },
    { id: 'pinterest', color: '#E60023', label: 'Pinterest' },
    { id: 'instagram', color: '#E4405F', label: 'Instagram' },
    { id: 'copy',      color: '#666',    label: 'Copy Link' }
  ];

  /* ---- Helpers ---- */
  function getActiveLang() {
    var zh = document.querySelector('.zh-content');
    return (zh && zh.style.display !== 'none') ? 'zh' : 'en';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function showToast(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:8px;font-size:14px;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity .3s;opacity:1;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '0'; }, 2000);
    setTimeout(function() { toast.remove(); }, 2500);
  }

  /* Extract share info from a shareable element */
  function getShareInfo(el) {
    var pageUrl = encodeURIComponent(location.href);
    var pageTitle = encodeURIComponent(document.title);

    /* Case example card */
    if (el.classList.contains('case-example')) {
      var label = el.querySelector('.case-label');
      var title = label ? label.textContent.replace(/^📋\s*/, '').trim() : 'BaZi Case Study';
      /* Get nearby H4 as section context */
      var section = '';
      var prev = el.previousElementSibling;
      while (prev && !prev.matches('h1,h2,h3,h4')) { prev = prev.previousElementSibling; }
      if (prev) section = prev.textContent.trim();
      return {
        title: title,
        text: (section ? section + ' — ' : '') + title + ' | DaoEssence BaZi Academy',
        url: pageUrl,
        image: null
      };
    }

    /* Image inside figure */
    if (el.matches('figure') && el.querySelector('img')) {
      var img = el.querySelector('img');
      var figcaption = el.querySelector('figcaption');
      var desc = figcaption ? figcaption.textContent.trim() : (img.alt || img.title || 'BaZi Reference');
      return {
        title: desc,
        text: desc + ' | DaoEssence BaZi Academy',
        url: pageUrl,
        image: img.src
      };
    }

    /* Shensha table */
    if (el.classList.contains('shensha-table')) {
      var thText = '';
      var firstRow = el.querySelector('thead th');
      if (firstRow) thText = firstRow.textContent.trim();
      var prevHeading = '';
      var p = el.previousElementSibling;
      while (p && !p.matches('h1,h2,h3,h4')) { p = p.previousElementSibling; }
      if (p) prevHeading = p.textContent.trim();
      return {
        title: prevHeading || thText || 'Spirit Stars Reference',
        text: (prevHeading ? prevHeading + ' — ' : '') + (thText || 'Spirit Stars') + ' | DaoEssence BaZi Academy',
        url: pageUrl,
        image: null
      };
    }

    return null;
  }

  /* ---- Share Actions ---- */
  function doShare(platform, info) {
    var u = info.url;
    var t = encodeURIComponent(info.title);
    var txt = encodeURIComponent(info.text);

    switch (platform) {
      case 'twitter':
        window.open('https://twitter.com/intent/tweet?url=' + u + '&text=' + txt, '_blank', 'width=600,height=400');
        break;
      case 'facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + u + '&quote=' + txt, '_blank', 'width=600,height=600');
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + u, '_blank', 'width=600,height=600');
        break;
      case 'whatsapp':
        window.open('https://wa.me/?text=' + txt + '%20' + u, '_blank');
        break;
      case 'reddit':
        window.open('https://reddit.com/submit?url=' + u + '&title=' + t, '_blank', 'width=800,height=600');
        break;
      case 'pinterest':
        var mediaParam = info.image ? '&media=' + encodeURIComponent(info.image) : '';
        window.open('https://pinterest.com/pin/create/button/?url=' + u + '&description=' + txt + mediaParam, '_blank', 'width=750,height=600');
        break;
      case 'instagram':
        navigator.clipboard.writeText(location.href).then(function() {
          showToast('Link copied! Paste it in your Instagram post or story.');
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(location.href).then(function() {
          showToast('Link copied to clipboard!');
        });
        break;
    }
  }

  /* ---- Build UI ---- */
  var CSS_ID = 'bazi-share-style';
  var css = [
    '.bazi-shareable{position:relative}',
    '.bazi-share-trigger{position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;background:rgba(212,175,55,0.15);color:#8b6914;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s,background .2s;z-index:10;border:none}',
    '.bazi-share-trigger:hover{background:rgba(212,175,55,0.35);opacity:1!important}',
    '.bazi-shareable:hover .bazi-share-trigger{opacity:1}',
    '.bazi-share-trigger svg{width:20px;height:20px;fill:currentColor;pointer-events:none}',
    '.bazi-share-panel{position:absolute;top:36px;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100;display:none;min-width:180px}',
    '.bazi-share-panel.open{display:block}',
    '.bazi-share-panel::before{content:"";position:absolute;top:-6px;right:10px;width:12px;height:12px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg)}',
    '.bazi-share-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:13px;color:#374151;transition:background .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}',
    '.bazi-share-item:hover{background:#f3f4f6}',
    '.bazi-share-item svg{width:22px;height:22px;flex-shrink:0;pointer-events:none}',
    '@media(max-width:768px){.bazi-share-trigger{opacity:.8;width:28px;height:28px;top:6px;right:6px}.bazi-share-trigger svg{width:16px;height:16px}}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    var style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* Create share trigger button */
  function createTrigger() {
    var btn = document.createElement('div');
    btn.className = 'bazi-share-trigger';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Share');
    btn.setAttribute('tabindex', '0');
    btn.title = 'Share';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
    return btn;
  }

  /* Create share panel — regex replace for SVG coloring (DOMParser fails on arc cmd) */
  function createPanel(info) {
    var panel = document.createElement('div');
    panel.className = 'bazi-share-panel';

    SHARE_PLATFORMS.forEach(function(p) {
      var btn = document.createElement('button');
      btn.className = 'bazi-share-item';
      /* Colorize SVG: regex replace (DOMParser fails on SVG arc cmd 'a') */
      var svgHtml = SVG_ICONS[p.id] || '';
      var coloredSvg = svgHtml
        .replace(/ fill="[^"]*"/g, '')   /* strip existing fill */
        .replace(/<path /g, '<path fill="' + p.color + '" ');
      btn.innerHTML = coloredSvg + '<span>' + p.label + '</span>';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        doShare(p.id, info);
        panel.classList.remove('open');
      });
      panel.appendChild(btn);
    });

    return panel;
  }

  /* ---- Init ---- */
  function init() {
    injectCSS();

    /* Collect all shareable elements */
    var targets = [];
    document.querySelectorAll('.case-example').forEach(function(el) { targets.push(el); });
    document.querySelectorAll('figure:has(> img)').forEach(function(el) { targets.push(el); });
    document.querySelectorAll('.shensha-table').forEach(function(el) { targets.push(el); });

    if (!targets.length) return;

    targets.forEach(function(el) {
      /* Skip if already processed (re-entry guard) */
      if (el.classList.contains('bazi-shareable')) return;
      el.classList.add('bazi-shareable');

      var trigger = createTrigger();
      el.appendChild(trigger);

      /* Lazily create panel on first open */
      var panel = null;
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!panel) {
          panel = createPanel(getShareInfo(el));
          el.appendChild(panel);
        }
        /* Close other open panels */
        document.querySelectorAll('.bazi-share-panel.open').forEach(function(p) {
          if (p !== panel) p.classList.remove('open');
        });
        panel.classList.toggle('open');
      });

      /* Keyboard accessibility */
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });

    /* Close panels when clicking outside */
    document.addEventListener('click', function() {
      document.querySelectorAll('.bazi-share-panel.open').forEach(function(p) {
        p.classList.remove('open');
      });
    });
  }

  /* Run when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
