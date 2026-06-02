/**
 * DaoEssence Auth — Clerk headless mode (jsdelivr CDN)
 * DA.open() → Google OAuth redirect. No UI components needed.
 */
(function() {
    'use strict';

    const DA = {};
    let clerkInstance = null;
    let clerkReady = false;

    function t(key, fallback) {
        var v = window.DaoI18n && window.DaoI18n.t(key);
        return (v && v !== key) ? v : fallback;
    }

    DA.getToken = function() { return clerkReady && clerkInstance && clerkInstance.isSignedIn ? 'clerk_session' : null; };
    DA.setToken = function() {};
    DA.clearToken = function() {};

    DA.getUser = async function() {
        if (!clerkReady || !clerkInstance || !clerkInstance.isSignedIn) return null;
        var u = clerkInstance.user;
        if (!u) return null;
        return { email: u.primaryEmailAddress?.emailAddress || '', id: u.id, firstName: u.firstName, lastName: u.lastName, imageUrl: u.imageUrl };
    };

    DA.showToast = function(msg, duration) {
        duration = duration || 4000;
        var el = document.getElementById('da-toast');
        if (!el) { el = document.createElement('div'); el.id = 'da-toast'; el.className = 'da-toast'; document.body.appendChild(el); }
        el.innerHTML = msg; el.classList.add('show');
        clearTimeout(el._tid);
        el._tid = setTimeout(function() { el.classList.remove('show'); }, duration);
    };

    DA._initClerk = async function() {
        if (clerkInstance) return;
        var a = 0;
        while (!window.Clerk && a < 50) { await new Promise(r => setTimeout(r, 100)); a++; }
        if (!window.Clerk) { console.error('[Auth] Clerk script not loaded'); return; }

        try {
            await window.Clerk.load();
            clerkInstance = window.Clerk;
            clerkReady = true;
            clerkInstance.addListener(function(s) {
                if (s.user) {
                    DA.updateNav();
                    // Auto-redirect back from Clerk domain after successful auth
                    if (location.hostname.includes('accounts.dev') && !location.hostname.includes('daoessentia')) {
                        window.location.replace('https://daoessentia.com/wallpaper');
                    }
                }
            });
            // Handle OAuth redirect callback
            if (clerkInstance.handleRedirectCallback) {
                await clerkInstance.handleRedirectCallback({
                    signInForceRedirectUrl: 'https://daoessentia.com/wallpaper',
                    signUpForceRedirectUrl: 'https://daoessentia.com/wallpaper'
                });
            }
            DA.updateNav();
            // Also redirect if already signed in on Clerk domain after callback
            if (clerkInstance.user && location.hostname.includes('accounts.dev') && !location.hostname.includes('daoessentia')) {
                window.location.replace('https://daoessentia.com/wallpaper');
            }
        } catch (e) { console.error('[Auth] Init failed:', e); }
    };

    // Google OAuth redirect (headless — no UI needed)
    DA.open = function() {
        if (!clerkReady || !clerkInstance) { DA.showToast('Loading...', 2000); return; }
        clerkInstance.client.signIn.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: location.origin + '/wallpaper',
            redirectUrlComplete: location.origin + '/wallpaper'
        });
    };

    DA.signOut = async function() {
        if (!clerkReady || !clerkInstance) return;
        await clerkInstance.signOut();
        DA.updateNav();
        DA.showToast(t('auth.signed_out', 'Signed out.'), 2000);
    };

    DA.updateNav = async function() {
        var btn = document.getElementById('wpn-signin-btn');
        if (!btn) return;
        var om = document.getElementById('da-signout-menu'); if (om) om.remove();

        if (!clerkReady || !clerkInstance) {
            btn.textContent = 'Loading...';
            btn.style.cssText = 'display:inline-flex;align-items:center;padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;font-size:13px;font-weight:500;color:#fff;opacity:0.5;cursor:not-allowed';
            return;
        }
        var u = clerkInstance.user;
        if (u) {
            var email = u.primaryEmailAddress?.emailAddress || 'U', initial = email[0].toUpperCase(), hash = 0;
            for (var i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
            var g = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#fccb81,#d57eeb)','linear-gradient(135deg,#e0c3fc,#8ec5fc)','linear-gradient(135deg,#ffd89b,#19547b)','linear-gradient(135deg,#ff9a9e,#fecfef)','linear-gradient(135deg,#d4af37,#f4d03f)','linear-gradient(135deg,#2af598,#009efd)'];
            var grad = g[Math.abs(hash) % g.length];
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:'+grad+';color:#fff;font-size:13px;font-weight:700;margin-right:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);flex-shrink:0">'+initial+'</span><span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);overflow:hidden;text-overflow:ellipsis;max-width:120px;white-space:nowrap">'+email.split('@')[0]+'</span>';
            btn.title = t('auth.click_to_signout','Click to sign out');
            btn.style.cssText = 'display:inline-flex;align-items:center;padding:4px 12px 4px 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;transition:all 0.2s;cursor:pointer';
            btn.onclick = function(e) { e.preventDefault();e.stopPropagation();var m=document.getElementById('da-signout-menu');if(m){m.remove();return;}m=document.createElement('div');m.id='da-signout-menu';m.style.cssText='position:absolute;top:100%;right:0;margin-top:2px;z-index:10001';m.innerHTML='<a href="#" style="display:block;padding:4px 0;color:rgba(255,255,255,0.4);text-decoration:none;font-size:11px;white-space:nowrap">'+t('auth.sign_out','Sign Out')+'</a>';m.querySelector('a').addEventListener('click',function(ev){ev.preventDefault();m.remove();DA.signOut();});btn.parentNode.appendChild(m);setTimeout(function(){document.addEventListener('click',function _c(ev){if(m&&!m.contains(ev.target)){m.remove();}document.removeEventListener('click',_c);});},0);};
        } else {
            btn.textContent = t('auth.sign_in','Sign In');btn.title='';
            btn.style.cssText = 'display:inline-flex;align-items:center;padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;font-size:13px;font-weight:500;color:#fff;transition:all 0.2s;cursor:pointer';
            btn.onclick = function(e) { e.preventDefault(); DA.open(); };
        }
    };

    DA.getSessionToken = async function() {
        if (!clerkReady||!clerkInstance||!clerkInstance.isSignedIn) return null;
        return await clerkInstance.session.getToken();
    };
    DA.isSignedIn = function() { return clerkReady && clerkInstance && clerkInstance.isSignedIn; };

    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){DA._initClerk();});
    else DA._initClerk();
    window.DaoAuth = DA;
})();
