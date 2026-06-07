/* ============================================================
   Download Guard — v5 (2026-06-03)
   Blocks unlimited downloads. Fail-CLOSED by default.
   Shows black centered toast on errors.
   ============================================================ */

(function () {
  'use strict';
  console.log('[DownloadGuard] v5 loaded — ' + location.pathname);

  // ── Helpers ──

  function getDownloadUrl(btn) {
    var url = '';
    try { url = (btn && btn.getAttribute('data-url')) || ''; } catch (e) { /* ignore */ }
    if (!url) {
      try {
        var img = document.getElementById('main-image') || document.querySelector('.preview-image img');
        if (img && img.src) url = img.src;
      } catch (e2) { /* ignore */ }
    }
    return url;
  }

  function getWallpaperId(btn) {
    try { return (btn && btn.getAttribute('data-wallpaper-id')) || ''; } catch (e) { return ''; }
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, ms);
      })
    ]);
  }

  // ── Force download (fetch → blob → object URL) ──
  async function forceDownload(url, filename) {
    console.log('[DownloadGuard] forceDownload:', url, 'as', filename);
    var blobUrl = null;
    try {
      var res = await withTimeout(fetch(url), 15000);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'wallpaper.jpg';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      console.warn('[DownloadGuard] Blob download failed, fallback to window.open', err);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      window.open(url, '_blank');
    }
  }

  // ── Show message: black centered toast (primary) ──
  function showMessage(msg, duration, isZh) {
    console.log('[DownloadGuard] showMessage:', msg);
    duration = duration || 6000;

    // Translate to Chinese if needed
    var displayMsg = msg;
    if (isZh) {
      if (msg.indexOf('Daily download limit reached') !== -1) {
        // Guest: suggest sign in; Logged-in: plain message
        displayMsg = msg.indexOf('guests') !== -1
          ? '今日下载次数已用完，请登录获取更多'
          : '今日下载次数已用完';
      } else if (msg.indexOf('Download service unavailable') !== -1) {
        displayMsg = '下载服务暂时不可用，请稍后重试';
      } else if (msg.indexOf('Download failed') !== -1) {
        displayMsg = '下载失败，请重试';
      } else if (msg.indexOf('Download link not ready') !== -1) {
        displayMsg = '下载链接未就绪，请刷新页面';
      }
    }

    // 1. Black centered toast (always visible — PRIMARY method)
    try {
      var existing = document.getElementById('dg-toast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'dg-toast';
      toast.textContent = displayMsg;
      toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'
        + 'background:rgba(20,20,20,0.96);color:#fff;padding:28px 44px;border-radius:18px;'
        + 'font-family:sans-serif;font-size:17px;font-weight:700;z-index:2147483647;'
        + 'box-shadow:0 0 80px rgba(255,255,255,0.15),0 16px 64px rgba(0,0,0,0.8);max-width:92%;text-align:center;'
        + 'border:2px solid rgba(255,255,255,0.6);letter-spacing:0.5px;line-height:1.7;'
        + 'pointer-events:none;user-select:none;text-shadow:0 1px 3px rgba(0,0,0,0.5);';
      var root = document.body || document.documentElement;
      root.appendChild(toast);
      console.log('[DownloadGuard] Toast created:', toast.textContent, 'rect:', toast.getBoundingClientRect());
      setTimeout(function () {
        if (toast.parentNode === root) root.removeChild(toast);
      }, duration);
      return;
    } catch (e2) { /* ignore */ }

    // 2. Fallback: DaoAuth toast
    try {
      if (window.DaoAuth && window.DaoAuth.showToast) {
        window.DaoAuth.showToast(displayMsg, duration);
        return;
      }
    } catch (e) { /* ignore */ }

    // 3. Fallback: alert
    try { alert(displayMsg); } catch (e3) { /* ignore */ }

    // 4. Last resort: console
    console.log('[DownloadGuard]', displayMsg);
  }

  // ── Core: handle download click ──
  async function handleDownload(btn) {
    // 防止重复处理
    if (btn.dataset.isProcessing === 'true') return;
    btn.dataset.isProcessing = 'true';

    // 根据语言环境显示文案 (不再缓存旧文案)
    var isZh = (document.documentElement.lang === 'zh' || window.location.pathname.includes('/zh/'));
    var span = btn.querySelector('span');
    
    console.log('[DownloadGuard] handleDownload called', { id: getWallpaperId(btn), url: getDownloadUrl(btn) });

    var url = getDownloadUrl(btn);
    var wallpaperId = getWallpaperId(btn);

    // 设置 "检查中" 状态
    if (span) span.textContent = isZh ? '检查中...' : 'Checking...';
    btn.disabled = true;

    try {
      // ── Step 1: Call API and AWAIT result ──
      var allowed = false; // FAIL-CLOSED by default
      var denyReason = '';
      var isZh = (document.documentElement.lang === 'zh' || window.location.pathname.includes('/zh/'));

      try {
        var token = null;
        if (window.DaoAuth && window.DaoAuth.getSessionToken) {
          try { token = await Promise.race([window.DaoAuth.getSessionToken(), new Promise(function (_, r) { setTimeout(r, 3000); })]); } catch (e) { token = null; }
        }

        var headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        var res = await Promise.race([
          fetch('/api/auth?action=download', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ wallpaperId: wallpaperId })
          }),
          new Promise(function (_, reject) { setTimeout(function () { reject(new Error('api-timeout')); }, 8000); })
        ]);

        var data = null;
        try { data = await res.json(); } catch (e) { /* non-JSON response, ignore */ }

        console.log('[DownloadGuard] API status:', res.status, 'data:', data);

        // Priority 1: explicit deny (429 or any status with allowed=false)
        if (data && data.allowed === false) {
          allowed = false;
          
          // ✅ 新增逻辑：未登录直接弹登录框，不显示报错提示
          if (data.error === '请先登录后再下载') {
            if (window.DaoAuth && window.DaoAuth.open) {
              window.DaoAuth.open();
            }
            return; // 拦截后续流程
          }
          
          denyReason = (data.error || 'Download limit reached.') + ' ' + (isZh ? '请登录获取更多。' : 'Sign in for more.');
        }
        // Priority 2: allow only if res.ok AND data.allowed === true
        else if (res.ok && data && data.allowed === true) {
          allowed = true;
        }
        // Priority 3: any other non-ok response without explicit deny → service error
        else if (!res.ok) {
          allowed = false;
          denyReason = isZh ? '下载服务暂时不可用，请稍后重试。' : 'Service temporarily unavailable. Please try again later.';
        }
      } catch (e) {
        // API unreachable → BLOCK (fail-closed)
        console.warn('[DownloadGuard] API unreachable, blocking download:', e.message);
        allowed = false;
        denyReason = isZh ? '下载服务暂时不可用，请稍后重试。' : 'Download service unavailable. Please try again later.';
      }

      if (!allowed) {
        showMessage(denyReason, 6000, isZh);
        return;
      }

      // ── Step 2: Trigger download (only if explicitly allowed) ──
      try {
        var filename = 'wallpaper.jpg';
        try {
          var u = new URL(url);
          filename = u.pathname.split('/').pop() || 'wallpaper.jpg';
        } catch (ex) { /* ignore */ }
        await forceDownload(url, filename);
      } catch (err) {
        console.error('[DownloadGuard] Download error:', err);
        showMessage(isZh ? '下载失败，请重试。' : 'Download failed. Please try again.', 5000, isZh);
      }

    } finally {
      // 无论成功失败，都恢复 span 文字（不破坏按钮结构）
      if (span) span.textContent = origText;
      btn.disabled = false;
      btn.dataset.isProcessing = 'false';
      console.log('[DownloadGuard] Done');
    }
  }

  // ── Auto-bind: Event Delegation (Prevents duplicate bindings) ──
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-download, .btn-download-safe');
    if (!btn) return;

    // Prevent default action
    if (btn.tagName === 'A' || btn.tagName === 'BUTTON') {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('[DownloadGuard] Click intercepted on', btn.id || btn.className);
    handleDownload(btn);
  });

  // ✅ 监听登录状态变化，自动恢复下载权限（无需刷新页面）
  window.addEventListener('daoessence:auth-changed', function (e) {
    console.log('[DownloadGuard] Auth changed:', e.detail.isSignedIn);

    // 1. 清除之前的报错 Toast
    var toast = document.getElementById('dg-toast');
    if (toast) toast.remove();

    // 2. 重置所有下载按钮状态
    document.querySelectorAll('.btn-download, .btn-download-safe').forEach(function (btn) {
      btn.disabled = false;
      btn.dataset.isProcessing = 'false'; // 清除处理锁
      var span = btn.querySelector('span') || btn;
      span.textContent = btn.dataset.origText || 'Download Wallpaper';
    });
  });

})();
