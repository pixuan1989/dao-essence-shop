/**
 * DaoEssence Auth — Clerk v6 + 独立登录页
 * 保留原有接口 (DaoAuth.getToken, getUser, updateNav 等)
 * 登录跳转 /login 页面（Zedge 风格）
 */
(function() {
    'use strict';

    const DA = {};
    let clerkInstance = null;
    let clerkReady = false;

    // ── i18n helper ──
    function t(key, fallback) {
        var v = window.DaoI18n && window.DaoI18n.t(key);
        return (v && v !== key) ? v : fallback;
    }

    // ── Token ──
    DA.getToken = function() {
        if (!clerkReady || !clerkInstance) return null;
        return clerkInstance.isSignedIn ? 'clerk_session' : null;
    };
    DA.setToken = function() {};
    DA.clearToken = function() {};

    // ── 获取用户信息 ──
    DA.getUser = async function() {
        if (!clerkReady || !clerkInstance || !clerkInstance.isSignedIn) return null;
        const user = clerkInstance.user;
        if (!user) return null;
        return {
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl
        };
    };

    // ── Toast ──
    DA.showToast = function(msg, duration) {
        duration = duration || 4000;
        var el = document.getElementById('da-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'da-toast';
            el.className = 'da-toast';
            document.body.appendChild(el);
        }
        el.innerHTML = msg;
        el.classList.add('show');
        clearTimeout(el._tid);
        el._tid = setTimeout(function() { el.classList.remove('show'); }, duration);
    };

    // ── 初始化 Clerk v6 ──
    DA._initClerk = async function() {
        if (clerkInstance) return;

        // 等待 ui.browser.js + clerk.browser.js 加载
        let attempts = 0;
        while ((!window.Clerk || !window.__internal_ClerkUICtor) && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        if (!window.Clerk || !window.__internal_ClerkUICtor) return;

        try {
            await window.Clerk.load({
                ui: { ClerkUI: window.__internal_ClerkUICtor },
                appearance: {
                    baseTheme: 'dark',
                    variables: {
                        colorPrimary: '#D4AF37',
                        colorBackground: '#1A1A1A',
                        colorText: '#ffffff',
                        colorTextSecondary: 'rgba(255,255,255,0.7)',
                        colorInputBackground: 'rgba(255,255,255,0.06)',
                        colorInputBorder: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }
                }
            });
            clerkInstance = window.Clerk;
            clerkReady = true;

            // Handle OAuth redirect callback (Google sign-in returns to this page)
            if (clerkInstance.handleRedirectCallback) {
                await clerkInstance.handleRedirectCallback({
                    signInForceRedirectUrl: window.location.origin + '/wallpaper',
                    signUpForceRedirectUrl: window.location.origin + '/wallpaper'
                });
            }

            DA.updateNav();
        } catch (err) {
            console.error('[DaoAuth] Init failed:', err);
        }
    };

    // ── 跳转登录页 ──
    DA.open = function() {
        window.location.href = '/login';
    };

    // ── 登出 ──
    DA.signOut = async function() {
        if (!clerkReady || !clerkInstance) return;
        await clerkInstance.signOut();
        DA.updateNav();
        DA.showToast(t('auth.signed_out', 'Signed out.'), 2000);
    };

    // ── 更新导航栏 ──
    DA.updateNav = async function() {
        var btn = document.getElementById('wpn-signin-btn');
        if (!btn) return;

        var oldMenu = document.getElementById('da-signout-menu');
        if (oldMenu) oldMenu.remove();

        if (!clerkReady || !clerkInstance) {
            btn.textContent = 'Loading...';
            btn.style.cssText = 'display:inline-flex;align-items:center;padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;font-size:13px;font-weight:500;color:#fff;opacity:0.5;cursor:not-allowed';
            return;
        }

        const user = clerkInstance.user;
        if (user) {
            var email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || 'U';
            var initial = email[0].toUpperCase();
            var hash = 0;
            for (var i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
            var gradients = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                'linear-gradient(135deg, #fccb81 0%, #d57eeb 100%)',
                'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
                'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
            ];
            var grad = gradients[Math.abs(hash) % gradients.length];
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:' + grad + ';color:#fff;font-size:13px;font-weight:700;margin-right:8px;box-shadow:0 2px 8px rgba(0,0,0,0.25);flex-shrink:0">' + initial + '</span><span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">' + email.split('@')[0] + '</span>';
            btn.title = t('auth.click_to_signout', 'Click to sign out');
            btn.style.cssText = 'display:inline-flex;align-items:center;padding:4px 12px 4px 4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;transition:all 0.2s;cursor:pointer';
            btn.onclick = function(e) {
                e.preventDefault(); e.stopPropagation();
                var menu = document.getElementById('da-signout-menu');
                if (menu) { menu.remove(); return; }
                menu = document.createElement('div');
                menu.id = 'da-signout-menu';
                menu.style.cssText = 'position:absolute;top:100%;right:0;margin-top:2px;z-index:10001';
                menu.innerHTML = '<a href="#" style="display:block;padding:4px 0;color:rgba(255,255,255,0.4);text-decoration:none;font-size:11px;white-space:nowrap">' + t('auth.sign_out', 'Sign Out') + '</a>';
                menu.querySelector('a').addEventListener('click', function(ev) {
                    ev.preventDefault();
                    menu.remove();
                    DA.signOut();
                });
                btn.parentNode.appendChild(menu);
                setTimeout(function() {
                    document.addEventListener('click', function _close(ev) {
                        if (menu && !menu.contains(ev.target)) { menu.remove(); }
                        document.removeEventListener('click', _close);
                    });
                }, 0);
            };
        } else {
            btn.textContent = t('auth.sign_in', 'Sign In');
            btn.title = '';
            btn.style.cssText = 'display:inline-flex;align-items:center;padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;font-size:13px;font-weight:500;color:#fff;transition:all 0.2s;cursor:pointer';
            btn.onclick = function(e) {
                e.preventDefault();
                DA.open();
            };
        }
    };

    // ── Session Token ──
    DA.getSessionToken = async function() {
        if (!clerkReady || !clerkInstance || !clerkInstance.isSignedIn) return null;
        return await clerkInstance.session.getToken();
    };

    // ── 是否已登录 ──
    DA.isSignedIn = function() {
        return clerkReady && clerkInstance && clerkInstance.isSignedIn;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', DA.init = function() { DA._initClerk(); });
    } else {
        DA._initClerk();
    }

    window.DaoAuth = DA;
})();
