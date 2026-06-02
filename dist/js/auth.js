/**
 * DaoEssence Auth — Clerk 集成版
 * 保留原有接口 (DaoAuth.getToken, getUser, updateNav, showToast 等)
 * 内部使用 Clerk 处理认证
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

    // ── Clerk Publishable Key ──
    // 从环境变量或全局配置读取
    const CLERK_KEY = window.CLERK_PUBLISHABLE_KEY || '';

    // ── Token（Clerk 使用 session token）──
    DA.getToken = function() {
        if (!clerkReady || !clerkInstance) return null;
        // Clerk 使用内部 session 管理，我们返回一个标记表示已登录
        return clerkInstance.isSignedIn ? 'clerk_session' : null;
    };
    DA.setToken = function(token) {
        // Clerk 自动管理，无需手动存储
    };
    DA.clearToken = function() {
        // Clerk 自动管理
    };

    // ── 获取用户信息 ──
    DA.getUser = async function() {
        if (!clerkReady || !clerkInstance || !clerkInstance.isSignedIn) return null;
        const user = clerkInstance.user;
        if (!user) return null;
        return {
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '',
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

    // ── 初始化 Clerk ──
    DA._initClerk = async function() {
        console.log('[DaoAuth] _initClerk called');

        if (clerkInstance) {
            console.log('[DaoAuth] Clerk already initialized');
            return;
        }

        // 等待 Clerk 脚本加载（HTML中通过 data-clerk-publishable-key 预加载）
        let attempts = 0;
        while (!window.Clerk && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!window.Clerk) {
            console.error('[DaoAuth] window.Clerk not found after 5s');
            return;
        }

        console.log('[DaoAuth] window.Clerk found');

        try {
            await window.Clerk.load({
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
                        socialButtons: {
                            gap: '12px'
                        },
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
                        footerActionLink: {
                            color: '#D4AF37'
                        }
                    }
                }
            });

            clerkInstance = window.Clerk;
            clerkReady = true;
            DA.updateNav();

            console.log('[DaoAuth] Clerk initialized successfully, user:', clerkInstance.user ? 'signed in' : 'signed out');
        } catch (err) {
            console.error('[DaoAuth] Clerk init failed:', err);
        }
    };

    // ── 打开登录 Modal ──
    DA.open = function() {
        console.log('[DaoAuth] open() called, clerkReady:', clerkReady, 'clerkInstance:', !!clerkInstance);
        if (!clerkReady || !clerkInstance) {
            DA.showToast('Auth service loading, please wait...', 2000);
            // 如果正在初始化，等2秒后重试
            setTimeout(() => {
                if (clerkReady && clerkInstance) {
                    clerkInstance.openSignIn({
                        appearance: { baseTheme: 'dark', variables: { colorPrimary: '#D4AF37', colorBackground: '#1A1A1A' } }
                    });
                }
            }, 2000);
            return;
        }
        clerkInstance.openSignIn({
            appearance: {
                baseTheme: 'dark',
                variables: {
                    colorPrimary: '#D4AF37',
                    colorBackground: '#1A1A1A'
                }
            }
        });
    };

    // ── 关闭（Clerk 自动处理）──
    DA.close = function() {
        // Clerk modal 自动关闭
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

        // 移除旧的下拉菜单
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
            // Generate a consistent gradient based on username
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

    // ── 获取 Clerk Session Token（用于 API 调用）──
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
