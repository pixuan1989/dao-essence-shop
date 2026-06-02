/**
 * DaoEssence Auth — Clerk v6 集成版
 * 使用 Clerk FAPI CDN (ui.browser.js + clerk.browser.js)
 * Clerk v6 用 mountSignIn() 代替 openSignIn()
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

    // ── 认证 Modal ──
    function closeAuthModal() {
        var modal = document.getElementById('da-auth-modal');
        if (modal) modal.remove();
    }

    function openAuthModal(container) {
        closeAuthModal();
        var modal = document.createElement('div');
        modal.id = 'da-auth-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;display:flex;align-items:center;justify-content:center;';
        // backdrop
        var backdrop = document.createElement('div');
        backdrop.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);';
        backdrop.addEventListener('click', closeAuthModal);
        modal.appendChild(backdrop);
        // container
        var card = document.createElement('div');
        card.appendChild(container);
        card.style.cssText = 'position:relative;max-width:420px;width:90%;';
        modal.appendChild(card);
        document.body.appendChild(modal);
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
        console.log('[DaoAuth] _initClerk called, window.Clerk:', typeof window.Clerk);

        if (clerkInstance) {
            console.log('[DaoAuth] Clerk already initialized');
            return;
        }

        // 等待 Clerk SDK + UI 脚本加载（defer 属性确保在 DOMContentLoaded 后）
        let attempts = 0;
        while ((!window.Clerk || !window.__internal_ClerkUICtor) && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!window.Clerk) {
            console.error('[DaoAuth] window.Clerk not found after 5s');
            return;
        }
        if (!window.__internal_ClerkUICtor) {
            console.error('[DaoAuth] __internal_ClerkUICtor not found - ui.browser.js may not have loaded');
            return;
        }

        console.log('[DaoAuth] Clerk v6 + UI scripts loaded');

        try {
            // Clerk v6: publishableKey 从 script[data-clerk-publishable-key] 自动读取
            // UI component 通过 ui.ClerkUI 注入
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
                        colorDanger: '#e74c3c',
                        colorSuccess: '#2ecc71',
                        borderRadius: '8px',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    },
                    elements: {
                        card: {
                            backgroundColor: '#1A1A1A',
                            border: '1px solid rgba(212,175,55,0.2)',
                            borderRadius: '12px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        },
                        socialButtons: { gap: '12px' },
                        socialButtonsIconButton: {
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '10px'
                        },
                        formButtonPrimary: {
                            background: 'linear-gradient(135deg, #D4AF37, #AA8A26)',
                            color: '#0A0A0A',
                            fontWeight: '600'
                        },
                        footerActionLink: { color: '#D4AF37' }
                    }
                }
            });

            clerkInstance = window.Clerk;
            clerkReady = true;

            // 监听认证状态变化 → 自动关闭 Modal
            clerkInstance.addListener(function(state) {
                if (state.user) {
                    closeAuthModal();
                    DA.updateNav();
                }
            });

            DA.updateNav();
            console.log('[DaoAuth] Clerk v6 initialized, signed in:', clerkInstance.isSignedIn);
        } catch (err) {
            console.error('[DaoAuth] Clerk init failed:', err);
        }
    };

    // ── 打开登录 Modal（Clerk v6: mountSignIn）──
    DA.open = function() {
        console.log('[DaoAuth] open() called, clerkReady:', clerkReady);
        if (!clerkReady || !clerkInstance) {
            DA.showToast('Auth service loading, please wait...', 2000);
            setTimeout(function() {
                if (clerkReady && clerkInstance) DA.open();
            }, 2000);
            return;
        }
        var container = document.createElement('div');
        clerkInstance.mountSignIn(container, {
            appearance: {
                baseTheme: 'dark',
                variables: { colorPrimary: '#D4AF37', colorBackground: '#1A1A1A' }
            }
        });
        openAuthModal(container);
    };

    // ── 关闭 ──
    DA.close = function() {
        closeAuthModal();
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
            btn.style.cssText = 'display:inline-flex !important;align-items:center !important;padding:8px 16px !important;background:rgba(255,255,255,0.08) !important;border:1px solid rgba(255,255,255,0.15) !important;border-radius:999px !important;font-size:13px !important;font-weight:500 !important;color:#fff !important;opacity:0.5 !important;cursor:not-allowed !important;';
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
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:' + grad + ';color:#fff;font-size:13px;font-weight:700;margin-right:8px;vertical-align:middle;box-shadow:0 2px 8px rgba(0,0,0,0.25);flex-shrink:0;">' + initial + '</span><span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;">' + email.split('@')[0] + '</span>';
            btn.title = t('auth.click_to_signout', 'Click to sign out');
            btn.style.cssText = 'display:inline-flex !important;align-items:center !important;padding:4px 12px 4px 4px !important;background:rgba(255,255,255,0.08) !important;border:1px solid rgba(255,255,255,0.15) !important;border-radius:999px !important;transition:all 0.2s !important;cursor:pointer !important;';
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                var menu = document.getElementById('da-signout-menu');
                if (menu) { menu.remove(); return; }
                menu = document.createElement('div');
                menu.id = 'da-signout-menu';
                menu.style.cssText = 'position:absolute;top:100%;right:0;margin-top:2px;z-index:10001;';
                menu.innerHTML = '<a href="#" style="display:block;padding:4px 0;color:rgba(255,255,255,0.4);text-decoration:none;font-size:11px;transition:color 0.15s;white-space:nowrap;" onmouseover="this.style.color=\'#D4AF37\'" onmouseout="this.style.color=\'rgba(255,255,255,0.4)\'">' + t('auth.sign_out', 'Sign Out') + '</a>';
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
            btn.style.cssText = 'display:inline-flex !important;align-items:center !important;padding:8px 16px !important;background:rgba(255,255,255,0.08) !important;border:1px solid rgba(255,255,255,0.15) !important;border-radius:999px !important;font-size:13px !important;font-weight:500 !important;color:#fff !important;transition:all 0.2s !important;cursor:pointer !important;';
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

    // ── 检查是否已登录 ──
    DA.isSignedIn = function() {
        return clerkReady && clerkInstance && clerkInstance.isSignedIn;
    };

    // ── 初始化 ──
    DA.init = function() {
        DA._initClerk();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', DA.init);
    } else {
        DA.init();
    }

    window.DaoAuth = DA;
})();
