/**
 * SAFE ZONE: Download handler — single source of truth
 * DO NOT MODIFY THIS FILE unless you know what you're doing.
 * Used by wallpaper-detail.html AND all generated static pages.
 */
(function () {
  'use strict';

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
    var wallpaperId = btn.getAttribute('data-wallpaper-id') || btn.id || 'unknown';
    var url = getDownloadUrl(btn);
    var origText = btn.textContent || 'Download';
    var filename = 'wallpaper.jpg';

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
      if (window.DaoAuth && window.DaoAuth.showToast) {
        window.DaoAuth.showToast('Download link not ready. Please refresh.', 5000);
      } else {
        alert('Download link not ready. Please refresh the page.');
      }
      btn.textContent = origText;
      btn.disabled = false;
      return;
    }

    btn.textContent = 'Checking...';
    btn.disabled = true;

    // ── Step 1: Call API and AWAIT result ──
    var allowed = true; // default: allow (fallback if API fails)
    var denyReason = '';
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

      var data = await res.json();
      if (res.ok && data.allowed === false) {
        allowed = false;
        denyReason = (data.error || 'Download limit reached.') + ' ' + (window.DaoI18n ? window.DaoI18n.t('wallpaper.sign_in_for_more') || 'Sign in for more.' : 'Sign in for more.');
      }
      // allowed === true or non-200 response → proceed to download
    } catch (e) {
      // API unreachable → fail OPEN (let user download, server logs the attempt)
      console.warn('[DownloadGuard] API unreachable, allowing download:', e.message);
      allowed = true;
    }

    if (!allowed) {
      btn.textContent = origText;
      btn.disabled = false;
      if (window.DaoAuth && window.DaoAuth.showToast) {
        window.DaoAuth.showToast(denyReason, 6000);
      } else {
        alert(denyReason);
      }
      return;
    }

    // ── Step 2: Trigger download (only if allowed) ──
    try {
      await forceDownload(url, filename);
    } catch (err) {
      console.error('[DownloadGuard] Download error:', err);
      if (window.DaoAuth && window.DaoAuth.showToast) {
        window.DaoAuth.showToast('Download failed. Please try again.', 5000);
      } else {
        alert('Download failed. Please try again.');
      }
    }

    btn.textContent = origText;
    btn.disabled = false;
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
      btn.addEventListener('click', function (e) {
        e.preventDefault();
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
})();
