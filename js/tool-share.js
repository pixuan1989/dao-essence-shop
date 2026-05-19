/* DAO Essence - Tool Result Share Component
   Reusable share bar for all tool result pages.
   Platforms match blog/learn-bazi share buttons.
   Usage: add <div id="tool-share-bar"></div> in result area, then call ToolShare.render() */

(function() {
  'use strict';

  var CSS_ID = 'tool-share-css';
  var css = [
    '.tool-share-bar{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:0.5rem;padding:0.8rem 0 0.5rem;margin-top:0.5rem;border-top:1px solid rgba(255,255,255,0.1)}',
    '.tool-share-label{font-size:0.78rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em;margin-right:0.5rem;white-space:nowrap}',
    '.tool-share-btn{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:rgba(255,255,255,0.7);text-decoration:none;padding:0}',
    '.tool-share-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}',
    '.tool-share-btn svg{width:18px;height:18px;pointer-events:none;fill:currentColor}',
    '.tool-share-btn img{width:18px;height:18px;pointer-events:none;filter:brightness(0) invert(1)}',
    '.tool-share-btn[data-platform="twitter"]:hover{background:#1DA1F2;border-color:#1DA1F2;color:#fff}',
    '.tool-share-btn[data-platform="twitter"]:hover svg{fill:#fff}',
    '.tool-share-btn[data-platform="facebook"]:hover{background:#1877F2;border-color:#1877F2;color:#fff}',
    '.tool-share-btn[data-platform="linkedin"]:hover{background:#0A66C2;border-color:#0A66C2;color:#fff}',
    '.tool-share-btn[data-platform="whatsapp"]:hover{background:#25D366;border-color:#25D366;color:#fff}',
    '.tool-share-btn[data-platform="reddit"]:hover{background:#FF4500;border-color:#FF4500;color:#fff}',
    '.tool-share-btn[data-platform="copy"]:hover{background:#374151;border-color:#374151;color:#fff}',
    '.tool-share-btn[data-platform="copy"]:hover svg{fill:#fff}',
    '.tool-share-btn[data-platform="copy"].copied{background:#22c55e;border-color:#22c55e;color:#fff}',
    '.tool-share-btn[data-platform="download"]:hover{background:#D4AF37;border-color:#D4AF37;color:#0f0f23}',
    '.tool-share-btn[data-platform="download"]:hover svg{fill:#0f0f23}',
    '@media(max-width:480px){.tool-share-bar{gap:0.4rem}.tool-share-btn{width:30px;height:30px}.tool-share-btn svg{width:16px;height:16px}.tool-share-label{font-size:0.72rem}}'
  ].join('\n');

  /* SVG icons — same paths as bazi-share.js / learn-bazi.html share buttons */
  var SVG_ICONS = {
    twitter:   '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    facebook:  '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 012.063-2.065 2.064 2.064 0 012.063 2.065 2.062 2.062 0 01-2.063 2.065zM6.835 20.452H3.842V9h2.993zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    whatsapp:  '<img src="/images/whatapp.svg" alt="WhatsApp">',
    reddit:    '<img src="/images/reddit.svg" alt="Reddit">',
    copy:      '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    download:  '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>'
  };

  var PLATFORMS = [
    { id: 'twitter',   title: 'Share on X (Twitter)' },
    { id: 'facebook',  title: 'Share on Facebook' },
    { id: 'linkedin',  title: 'Share on LinkedIn' },
    { id: 'whatsapp',  title: 'Share on WhatsApp' },
    { id: 'reddit',    title: 'Share on Reddit' },
    { id: 'copy',      title: 'Copy Link' }
  ];

  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function showToast(msg) {
    var existing = document.querySelector('.tool-share-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'tool-share-toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity .3s;opacity:1;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '0'; }, 2000);
    setTimeout(function() { toast.remove(); }, 2500);
  }

  function doShareFallback(platform, text) {
    var t = encodeURIComponent(text || document.title);
    var u = encodeURIComponent(location.href);
    var urls = {
      twitter:   'https://twitter.com/intent/tweet?url=' + u + '&text=' + t,
      facebook:  'https://www.facebook.com/sharer/sharer.php?u=' + u,
      linkedin:  'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      whatsapp:  'https://wa.me/?text=' + t + '%20' + u,
      reddit:    'https://reddit.com/submit?url=' + u + '&title=' + t
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    } else {
      navigator.clipboard.writeText(location.href);
      showToast('Link copied!');
    }
  }

  function dataUrlToBlob(dataUrl) {
    return new Promise(function(resolve, reject) {
      fetch(dataUrl).then(function(r) { return r.blob(); }).then(resolve).catch(reject);
    });
  }

  /**
   * Render share bar into a target container.
   * @param {string|HTMLElement} target - Container element ID or DOM element
   * @param {object} [opts]
   * @param {string} [opts.label] - Label text (default: "Share Your Result")
   * @param {string} [opts.labelKey] - i18n key (default: "tool_share.label")
   * @param {string} [opts.text] - Custom share text (for text sharing)
   */
  function render(target, opts) {
    opts = opts || {};
    injectCSS();

    var container = typeof target === 'string' ? document.getElementById(target) : target;
    if (!container) return;
    if (container.querySelector('.tool-share-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'tool-share-bar';

    var label = document.createElement('span');
    label.className = 'tool-share-label';
    label.textContent = opts.label || 'Share Your Result';
    label.setAttribute('data-i18n', opts.labelKey || 'tool_share.label');
    bar.appendChild(label);

    PLATFORMS.forEach(function(p) {
      var btn = document.createElement('button');
      btn.className = 'tool-share-btn';
      btn.setAttribute('data-platform', p.id);
      btn.title = p.title;
      btn.innerHTML = SVG_ICONS[p.id] || '';
      btn.addEventListener('click', function() {
        doShareFallback(p.id, opts.text);
        if (p.id === 'copy') {
          btn.classList.add('copied');
          setTimeout(function() { btn.classList.remove('copied'); }, 2000);
        }
      });
      bar.appendChild(btn);
    });

    container.appendChild(bar);
  }

  /**
   * Render download horoscope card button (zodiac page only).
   * @param {string|HTMLElement} target - Container element ID or DOM element
   * @param {object} [opts]
   * @param {string} [opts.sign] - Zodiac sign key (e.g. "dog")
   * @param {object} [opts.data] - { score, number, colorName, direction, quote }
   */
  function renderDownloadBtn(target, opts) {
    opts = opts || {};
    injectCSS();

    var container = typeof target === 'string' ? document.getElementById(target) : target;
    if (!container) return;
    if (container.querySelector('.tool-share-download')) return;

    var bar = document.createElement('div');
    bar.className = 'tool-share-bar tool-share-download';

    var btn = document.createElement('button');
    btn.className = 'tool-share-btn';
    btn.setAttribute('data-platform', 'download');
    btn.title = 'Download Horoscope Card';
    btn.innerHTML = SVG_ICONS['download'] || '';
    btn.addEventListener('click', async function() {
      if (!opts.sign || !opts.data || !window.ZodiacShareCard) {
        showToast('Card generation failed.');
        return;
      }
      try {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = '/zodiac/images/' + opts.sign + '.webp';
        await new Promise(function(resolve, reject) {
          img.onload = resolve;
          img.onerror = reject;
        });

        var cardUrl = await window.ZodiacShareCard.generate(opts.sign.toUpperCase(), opts.data, img);
        var blob = await dataUrlToBlob(cardUrl);
        var blobUrl = URL.createObjectURL(blob);

        // Try window.open first, fallback to a.click
        var win = window.open(blobUrl, '_blank');
        if (!win || win.closed) {
          var a = document.createElement('a');
          a.href = blobUrl;
          a.download = opts.sign + '-horoscope.jpg';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        showToast('Card downloaded!');
        setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 5000);
      } catch (err) {
        console.error('[ToolShare] download error:', err);
        showToast('Card generation failed, link copied.');
        navigator.clipboard.writeText(location.href);
      }
    });

    bar.appendChild(btn);
    container.appendChild(bar);
  }

  // Expose globally
  window.ToolShare = { render: render, renderDownloadBtn: renderDownloadBtn };
})();
