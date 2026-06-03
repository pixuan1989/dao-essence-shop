/**
 * SAFE ZONE: Download handler — single source of truth
 * DO NOT MODIFY THIS FILE unless you know what you're doing.
 * Used by wallpaper-detail.html AND all generated static pages.
 * Version: 5 (fail-closed + cache-bust filename)
 */
(function () {
  'use strict';

  console.log('[DownloadGuard] v5 loaded —', window.location.pathname);

  // ── Get download URL from all possible sources ──
  function getDownloadUrl(btn) {
    // 1. data-url attribute (set by page JS)
    var u = btn.getAttribute('data-url');
    if (u && u !== 'null' && u !== '') return u;

    // 2. Try multiple data-* attributes
    u = btn.getAttribute('data-original')
      || btn.getAttribute('data-image')
      || btn.getAttribute('data-src');
    if (u && u !== 'null' && u !== '') return u;

    // 3. Main preview image (full-res, not thumb)
    var img = document.getElementById('main-image');
    if (img && img.dataset && img.dataset.original) return img.dataset.original;
    if (img && img.src && !img.src.includes('thumb')) return img.src;

    // 4. Any .preview-image img
    var prev = document.querySelector('.preview-image img');
    if (prev && prev.src && !prev.src.includes('thumb')) return prev.src;

    return null;
  }

  // ── Force download via fetch → blob → object URL ──
  async function forceDownload(url, filename) {
    // Method 1: fetch as blob (works for same-origin or CORS-enabled)
    try {
      var res = await Promise.race([
        fetch(url, { mode: 'cors', credentials: 'omit' }),
        new Promise(function (_, reject) { setTimeout(function () { reject(new Error('timeout')); }, 10000); })
      ]);
      if (res.ok) {
        var blob = await res.blob();
        var blobUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(blobUrl); }, 1000);
        return true;
      }
    } catch (e) {
      console.warn('[DownloadGuard] Blob download failed, trying direct...', e.message);
    }

    // Method 2: direct link (fallback)
    try {
      var a2 = document.createElement('a');
      a2.href = url;
      a2.download = filename;
      a2.target = '_blank';
      a2.rel = 'noopener';
      a2.style.display = 'none';
      document.body.appendChild(a2);
      a2.click();
      setTimeout(function () { document.body.removeChild(a2); }, 1000);
      return true;
    } catch (e2) {
      console.error('[DownloadGuard] Direct download failed', e2);
    }

    // Method 3: open in new tab (last resort)
    window.open(url, '_blank', 'noopener');
    return false;
  }

  async function handleDownload(btn) {
    console.log('[DownloadGuard] handleDownload called');

    var wallpaperId = btn.getAttribute('data-wallpaper-id') || btn.id || 'unknown';
    var url = getDownloadUrl(btn);
    var origText = btn.textContent || 'Download';
    var filename = 'wallpaper.jpg';

    console.log('[DownloadGuard] wallpaperId:', wallpaperId, 'url:', url ? 'present' : 'MISSING');

    // Extract filename from URL
    if (url) {
      try {
        var u = new URL(url, window.location.href);
        var parts = u.pathname.split('/');
        var f = parts[parts.length - 1];
        if (f && f.includes('.')) filename = decodeURIComponent(f);
      } catch (ex) { /* ignore */ }
    }

    btn.textContent = 'Checking...';
    btn.disabled = true;

    if (!url) {
      console.error('[DownloadGuard] No download URL found', btn);
      showMessage('Download link not ready. Please refresh the page.');
      btn.textContent = origText;
      btn.disabled = false;
      return;
    }

    // ── Step 1: Call API, DEFAULT = BLOCK (fail-closed) ──
    var allowed = false; // ← FAIL-CLOSED by default
    var denyReason = 'Download temporarily unavailable. Please try again later.';

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

      console.log('[DownloadGuard] API status:', res.status);

      // Try to parse JSON (API might return HTML on 503)
      var data = null;
      try { data = await res.json(); } catch (jsonErr) { /* not JSON, keep data=null */ }

      console.log('[DownloadGuard] API data:', data);

      // ONLY allow if API explicitly returns allowed: true
      if (res.ok && data && data.allowed === true) {
        allowed = true;
        console.log('[DownloadGuard] API allowed download');
      } else if (data && data.allowed === false) {
        allowed = false;
        denyReason = (data.error || 'Download limit reached.') + ' ' + (window.DaoI18n ? window.DaoI18n.t('wallpaper.sign_in_for_more') || 'Sign in for more.' : 'Sign in for more.');
        console.log('[DownloadGuard] API denied:', denyReason);
      } else {
        allowed = false;
        denyReason = 'Service temporarily unavailable. Please try again later.';
        console.log('[DownloadGuard] API non-200 or no allowed field, blocking');
      }
    } catch (e) {
      // API unreachable → BLOCK (fail-closed), don't silently allow
      console.warn('[DownloadGuard] API unreachable, blocking download:', e.message);
      allowed = false;
      denyReason = 'Download service unavailable. Please try again later.';
    }

    if (!allowed) {
      btn.textContent = origText;
      btn.disabled = false;
      showMessage(denyReason, 6000);
      return;
    }

    // ── Step 2: Trigger download (only if explicitly allowed) ──
    console.log('[DownloadGuard] Starting download...');
    try {
      await forceDownload(url, filename);
    } catch (err) {
      console.error('[DownloadGuard] Download error:', err);
      showMessage('Download failed. Please try again.', 5000);
    }

    btn.textContent = origText;
    btn.disabled = false;
    console.log('[DownloadGuard] Done');
  }

  // ── Show message (toast → DOM toast → alert → console) ──
  function showMessage(msg, duration) {
    console.log('[DownloadGuard] showMessage:', msg);
    duration = duration || 5000;
    // 1. Try DaoAuth toast
    try {
      if (window.DaoAuth && window.DaoAuth.showToast) {
        window.DaoAuth.showToast(msg, duration);
        return;
      }
    } catch (e) { /* ignore */ }

    // 2. Try inline DOM toast (always works, centered)
    try {
      var existing = document.getElementById('dg-toast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'dg-toast';
      toast.textContent = msg;
      toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'
        + 'background:#ff4444;color:#fff;padding:20px 32px;border-radius:12px;'
        + 'font-family:sans-serif;font-size:16px;font-weight:bold;z-index:2147483647;'
        + 'box-shadow:0 8px 32px rgba(0,0,0,0.5);max-width:85%;text-align:center;'
        + 'border:2px solid #fff;letter-spacing:0.5px;line-height:1.5;';
      (document.documentElement || document.body).appendChild(toast);
      setTimeout(function () {
        var root = document.documentElement || document.body;
        if (toast.parentNode === root) root.removeChild(toast);
      }, duration);
      return;
    } catch (e2) { /* ignore */ }

    // 3. Fallback alert
    try { alert(msg); } catch (e3) { /* ignore */ }

    // 4. Last resort: console
    console.log('[DownloadGuard]', msg);
  }

  // Expose for use by HTML pages
  window.DownloadGuard = {
    handleDownload: function (btn) { handleDownload(btn); }
  };

  // Auto-bind: any button with data-wallpaper-id gets guarded
  function bindButtons() {
    document.querySelectorAll('.btn-download, .btn-download-safe').forEach(function (btn) {
      if (btn.dataset.guarded) return;
      btn.dataset.guarded = '1';
      // Stop <a href="#"> from jumping to top
      if (btn.tagName === 'A') btn.setAttribute('href', 'javascript:void(0)');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[DownloadGuard] Click intercepted on', btn.id || btn.className);
        handleDownload(btn);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindButtons);
  } else {
    bindButtons();
  }
  // Re-bind after dynamic updates (for wallpaper-detail.html)
  setTimeout(bindButtons, 500);
  setTimeout(bindButtons, 1500);
  console.log('[DownloadGuard] Bindings set up');
})();
