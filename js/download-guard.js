/**
 * SAFE ZONE: Download limit — single source of truth
 * DO NOT MODIFY THIS FILE unless you know what you're doing.
 * Used by wallpaper-detail.html AND all generated static pages.
 * ONE file = ONE place to break = easier to protect.
 */
(function () {
  'use strict';

  // Race a promise against a timeout so UI never freezes
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('Timeout')); }, ms);
      })
    ]);
  }

  async function handleDownload(btn) {
    // Support both data-wallpaper-id and falling back to btn.id
    let wallpaperId = btn.getAttribute('data-wallpaper-id');
    if (!wallpaperId || wallpaperId === 'null' || wallpaperId === '') {
      wallpaperId = btn.id || 'unknown';
    }
    const url = btn.getAttribute('data-url');
    const origText = btn.textContent || 'Download';
    btn.textContent = 'Checking...';

    if (!url) {
      console.error('[DownloadGuard] Missing data-url', btn);
      btn.textContent = origText;
      return;
    }

    try {
      // Get auth token with 3s timeout — prevents stuck button if Clerk/auth is broken
      let token = null;
      if (window.DaoAuth && window.DaoAuth.getSessionToken) {
        try {
          token = await withTimeout(window.DaoAuth.getSessionToken(), 3000);
        } catch (e) {
          console.warn('[DownloadGuard] Auth token timeout, proceeding as guest');
          token = null;
        }
      }
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      // Fetch with 8s timeout
      const ctrl = new AbortController();
      const timer = setTimeout(function () { ctrl.abort(); }, 8000);
      const res = await fetch('/api/auth?action=download', {
        method: 'POST',
        headers,
        body: JSON.stringify({ wallpaperId }),
        signal: ctrl.signal
      });
      clearTimeout(timer);

      // Also timeout JSON parsing — server might return HTML 404 page
      const data = await withTimeout(res.json(), 5000);

      if (res.ok && data.allowed) {
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const msg = (data.error || 'Download limit reached.') + ' Sign in for 3/day.';
        if (window.DaoAuth && window.DaoAuth.showToast) {
          window.DaoAuth.showToast(msg, 5000);
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error('[DownloadGuard] Fetch error:', err);
      alert('Network error. Please try again.');
    } finally {
      btn.textContent = origText;
    }
  }

  // Expose for use by HTML pages
  window.DownloadGuard = {
    handleDownload: function (btn) { handleDownload(btn); }
  };

  // Auto-bind: any button with data-wallpaper-id gets guarded
  // data-url is read at click time (set dynamically by page JS)
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
  // Also re-bind after dynamic updates (for wallpaper-detail.html)
  setTimeout(bindButtons, 500);
  setTimeout(bindButtons, 1500);
})();
