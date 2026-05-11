/* DAO Essence - Bazi Module Universal Share System
   Auto-detects all .case-example, figure > img, and .shensha-table elements
   and adds hover-triggered share buttons to each.
   Future content using these selectors will be automatically covered. */

(function() {
  'use strict';

  /* ---- Config ---- */
  var SHARE_PLATFORMS = [
    { id: 'twitter',   icon: 'M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.58-2.11-9.96-5.02-.42.72-.66 1.56-.66 2.46 0 1.68.85 3.16 2.14 4.02-.79-.02-1.53-.24-2.18-.6v.06c0 2.35 1.67 4.31 3.88 4.76-.41.1-.83.16-1.27.16-.31 0-.62-.03-.92-.08.63 1.96 2.45 3.39 4.61 3.43-1.69 1.32-3.83 2.1-6.15 2.1-.4 0-.8-.02-1.19-.07 2.19 1.4 4.78 2.22 7.57 2.22 9.07 0 14.02-7.52 14.02-14.02 0-.21 0-.42-.01-.63.96-.7 1.8-1.56 2.46-2.55z', color: '#1DA1F2', label: 'X (Twitter)' },
    { id: 'facebook',  icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: '#1877F2', label: 'Facebook' },
    { id: 'linkedin',  icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: '#0A66C2', label: 'LinkedIn' },
    { id: 'whatsapp',  icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z', color: '#25D366', label: 'WhatsApp' },
    { id: 'reddit',    icon: 'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z', color: '#FF4500', label: 'Reddit' },
    { id: 'pinterest', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z', color: '#E60023', label: 'Pinterest' },
    { id: 'instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', color: '#E4405F', label: 'Instagram' },
    { id: 'copy',      icon: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z', color: '#666', label: 'Copy Link' }
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
        navigator.clipboard.writeText(decodeURIComponent(u)).then(function() {
          showToast('Link copied! Paste it in your Instagram post or story.');
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(decodeURIComponent(u)).then(function() {
          showToast('Link copied to clipboard!');
        });
        break;
    }
  }

  /* ---- Build UI ---- */
  var CSS_ID = 'bazi-share-style';
  var css = [
    '.bazi-shareable{position:relative}',
    '.bazi-share-trigger{position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.9);border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s,box-shadow .2s;box-shadow:0 1px 4px rgba(0,0,0,0.08);z-index:10}',
    '.bazi-share-trigger:hover{box-shadow:0 2px 8px rgba(0,0,0,0.15);opacity:1!important}',
    '.bazi-shareable:hover .bazi-share-trigger{opacity:1}',
    '.bazi-share-trigger svg{width:15px;height:15px;fill:#6b7280;pointer-events:none}',
    '.bazi-share-panel{position:absolute;top:36px;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100;display:none;min-width:180px}',
    '.bazi-share-panel.open{display:block}',
    '.bazi-share-panel::before{content:"";position:absolute;top:-6px;right:10px;width:12px;height:12px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg)}',
    '.bazi-share-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:13px;color:#374151;transition:background .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}',
    '.bazi-share-item:hover{background:#f3f4f6}',
    '.bazi-share-item svg{width:16px;height:16px;flex-shrink:0;pointer-events:none}',
    '@media(max-width:768px){.bazi-share-trigger{opacity:.7;width:24px;height:24px;top:4px;right:4px}.bazi-share-trigger svg{width:13px;height:13px}}'
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
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>';
    return btn;
  }

  /* Create share panel */
  function createPanel(info) {
    var panel = document.createElement('div');
    panel.className = 'bazi-share-panel';

    SHARE_PLATFORMS.forEach(function(p) {
      var btn = document.createElement('button');
      btn.className = 'bazi-share-item';
      btn.innerHTML = '<svg viewBox="0 0 24 24" style="fill:' + p.color + '"><path d="' + p.icon + '"/></svg><span>' + p.label + '</span>';
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
