// js/wallpaper-share.js
// 壁纸模块多平台分享（方案 A：不接 X API，零成本）
// 支持：X、Facebook、Pinterest(原生图)、WhatsApp、复制链接、移动端系统分享(带图)
// 用法：页面里放一组 <button class="share-icon-btn" data-share="x|facebook|pinterest|whatsapp|copy|native">
//       外层包一个 <div class="share-row" data-share-root data-image="原图URL" data-title="标题" data-desc="描述">

(function () {
  'use strict';

  function getMeta() {
    var root = document.querySelector('[data-share-root]');
    var image = '', title = '', desc = '';
    if (root) {
      image = root.getAttribute('data-image') || '';
      title = root.getAttribute('data-title') || '';
      desc = root.getAttribute('data-desc') || '';
    }
    var url = (window.location.href || '').split('#')[0];
    if (!title) {
      var t = document.querySelector('meta[property="og:title"]');
      title = (t && t.content) ? t.content : (document.title || 'Dao Essence Wallpaper');
    }
    if (!desc) {
      var d = document.querySelector('meta[property="og:description"]');
      desc = (d && d.content) ? d.content : title;
    }
    return { url: url, title: title, desc: desc, image: image };
  }

  function enc(s) { return encodeURIComponent(s || ''); }

  function popup(link) {
    var w = 620, h = 560;
    var left = (window.screen.width - w) / 2;
    var top = (window.screen.height - h) / 2;
    window.open(link, '_blank', 'noopener,noreferrer,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
  }

  function copyLink(u) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(u).then(function () { toast('Link copied'); }, function () { fallbackCopy(u); });
    } else {
      fallbackCopy(u);
    }
  }

  function fallbackCopy(u) {
    try {
      var ta = document.createElement('textarea');
      ta.value = u;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      toast('Link copied');
    } catch (e) {
      toast('Copy failed');
    }
  }

  function shareNative(m) {
    var shareData = { title: m.title, text: m.desc, url: m.url };
    if (!navigator.share) {
      copyLink(m.url);
      return;
    }
    // 移动端：尝试直接传原图文件（可放大、可保存）
    if (m.image && navigator.canShare && typeof navigator.canShare === 'function') {
      fetch(m.image, { mode: 'cors' })
        .then(function (r) { return r.blob(); })
        .then(function (blob) {
          var file = new File([blob], 'wallpaper.png', { type: blob.type || 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: m.title, text: m.desc }).catch(function () {});
          } else {
            navigator.share(shareData).catch(function () {});
          }
        })
        .catch(function () {
          navigator.share(shareData).catch(function () {});
        });
    } else {
      navigator.share(shareData).catch(function () {});
    }
  }

  function openShare(network) {
    var m = getMeta();
    var u = m.url, t = m.title, d = m.desc, img = m.image;
    if (network === 'x') {
      popup('https://twitter.com/intent/tweet?url=' + enc(u) + '&text=' + enc(t));
    } else if (network === 'facebook') {
      popup('https://www.facebook.com/sharer/sharer.php?u=' + enc(u));
    } else if (network === 'pinterest') {
      popup('https://pinterest.com/pin/create/button/?url=' + enc(u) + '&media=' + enc(img) + '&description=' + enc(t));
    } else if (network === 'whatsapp') {
      popup('https://wa.me/?text=' + enc(t + ' ' + u));
    } else if (network === 'copy') {
      copyLink(u);
    } else if (network === 'native') {
      shareNative(m);
    }
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('wp-share-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wp-share-toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 18px;border-radius:24px;font-size:14px;z-index:99999;opacity:0;transition:opacity .25s;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 1800);
  }

  function init() {
    var btns = document.querySelectorAll('[data-share]');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        openShare(b.getAttribute('data-share'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
