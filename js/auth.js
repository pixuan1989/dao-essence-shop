/**
 * DaoEssence Auth — 前端认证模块（自定义 modal + i18n）
 */
(function() {
    'use strict';

    const DA = {};

    // ── i18n helper (don't show key if translation missing) ──
    function t(key, fallback) {
        var v = window.DaoI18n && window.DaoI18n.t(key);
        return (v && v !== key) ? v : fallback;
    }

    // ── Token ──
    DA.getToken = function() {
        try { return localStorage.getItem('da_token'); } catch(e) { return null; }
    };
    DA.setToken = function(token) {
        try { localStorage.setItem('da_token', token); } catch(e) {}
    };
    DA.clearToken = function() {
        try { localStorage.removeItem('da_token'); } catch(e) {}
    };

    // ── 获取用户信息 ──
    DA.getUser = async function() {
        const token = DA.getToken();
        if (!token) return null;
        try {
            const res = await fetch('/api/auth?action=me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) { DA.clearToken(); return null; }
            return await res.json();
        } catch(e) { return null; }
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

    // ── 创建 Auth Modal DOM ──
    DA._ensureModal = function() {
        if (document.getElementById('da-auth-modal')) return;
        var style = document.createElement('style');
        style.textContent =
            '.da-am-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;display:none;align-items:center;justify-content:center}' +
            '.da-am-overlay.open{display:flex}' +
            '.da-am-box{background:#1A1A1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:32px 28px;max-width:360px;width:90%;position:relative}' +
            '.da-am-close{position:absolute;top:10px;right:16px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;cursor:pointer;font-family:serif;line-height:1}' +
            '.da-am-close:hover{color:#fff}' +
            '.da-am-tabs{display:flex;margin-bottom:20px}' +
            '.da-am-tab{flex:1;padding:8px 0;text-align:center;cursor:pointer;background:none;border:none;border-bottom:2px solid transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:500;font-family:inherit;transition:all 0.2s}' +
            '.da-am-tab.active{color:#D4AF37;border-bottom-color:#D4AF37}' +
            '.da-am-tab:hover{color:#fff}' +
            '.da-am-field{margin-bottom:12px}' +
            '.da-am-field label{display:block;color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:3px}' +
            '.da-am-field input{width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s}' +
            '.da-am-field input:focus{border-color:rgba(212,175,55,0.4)}' +
            '.da-am-btn{width:100%;padding:11px;background:linear-gradient(135deg,#D4AF37,#AA8A26);color:#0A0A0A;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity 0.2s}' +
            '.da-am-btn:hover{opacity:0.9}' +
            '.da-am-btn:disabled{opacity:0.5;cursor:not-allowed}' +
            '.da-am-msg{font-size:12px;text-align:center;margin-top:8px;min-height:16px}' +
            '.da-am-msg.error{color:#e74c3c}' +
            '.da-am-msg.success{color:#2ecc71}';
        document.head.appendChild(style);

        var html = document.createElement('div');
        html.id = 'da-auth-modal';
        html.innerHTML =
            '<div class="da-am-overlay" id="da-am-overlay">' +
            '<div class="da-am-box">' +
            '<button class="da-am-close" onclick="DaoAuth.close()">&times;</button>' +
            '<div class="da-am-tabs">' +
            '<button class="da-am-tab active" data-datab="login" id="da-am-tab-login">' + t('auth.sign_in', 'Sign In') + '</button>' +
            '<button class="da-am-tab" data-datab="register" id="da-am-tab-register">' + t('auth.register', 'Register') + '</button>' +
            '</div>' +
            '<form id="da-am-form-login" onsubmit="DaoAuth._handleLogin(event)">' +
            '<div class="da-am-field"><label>' + t('auth.email', 'Email') + '</label><input type="email" id="da-am-login-email" required></div>' +
            '<div class="da-am-field"><label>' + t('auth.password', 'Password') + '</label><input type="password" id="da-am-login-password" required minlength="6"></div>' +
            '<button type="submit" class="da-am-btn" id="da-am-login-btn">' + t('auth.sign_in', 'Sign In') + '</button>' +
            '<div class="da-am-msg" id="da-am-login-msg"></div>' +
            '</form>' +
            '<form id="da-am-form-register" style="display:none" onsubmit="DaoAuth._handleRegister(event)">' +
            '<div class="da-am-field"><label>' + t('auth.email', 'Email') + '</label><input type="email" id="da-am-register-email" required></div>' +
            '<div class="da-am-field"><label>' + t('auth.password', 'Password') + '</label><input type="password" id="da-am-register-password" required minlength="6"></div>' +
            '<div class="da-am-field"><label>' + t('auth.confirm_password', 'Confirm Password') + '</label><input type="password" id="da-am-register-password2" required minlength="6"></div>' +
            '<button type="submit" class="da-am-btn" id="da-am-register-btn">' + t('auth.create_account', 'Create Account') + '</button>' +
            '<div class="da-am-msg" id="da-am-register-msg"></div>' +
            '</form>' +
            '</div></div>';
        document.body.appendChild(html);

        // Tab switching
        document.getElementById('da-am-tab-login').addEventListener('click', function() { DA._switchTab('login'); });
        document.getElementById('da-am-tab-register').addEventListener('click', function() { DA._switchTab('register'); });

        // Click overlay to close
        document.getElementById('da-am-overlay').addEventListener('click', function(e) {
            if (e.target === this) DA.close();
        });
    };

    // ── Modal 控制 ──
    DA.open = function(tab) {
        DA._ensureModal();
        document.getElementById('da-am-overlay').classList.add('open');
        if (tab) DA._switchTab(tab);
    };
    DA.close = function() {
        var o = document.getElementById('da-am-overlay');
        if (o) o.classList.remove('open');
    };

    DA._switchTab = function(tab) {
        document.getElementById('da-am-tab-login').classList.toggle('active', tab === 'login');
        document.getElementById('da-am-tab-register').classList.toggle('active', tab === 'register');
        document.getElementById('da-am-form-login').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('da-am-form-register').style.display = tab === 'register' ? 'block' : 'none';
    };

    // ── 登录 ──
    DA._handleLogin = async function(e) {
        e.preventDefault();
        var msgEl = document.getElementById('da-am-login-msg');
        var btn = document.getElementById('da-am-login-btn');
        var email = document.getElementById('da-am-login-email').value.trim();
        var password = document.getElementById('da-am-login-password').value;

        if (!email || !password) {
            msgEl.textContent = t('auth.fill_all', 'Please fill in all fields.');
            msgEl.className = 'da-am-msg error';
            return;
        }

        btn.disabled = true;
        btn.textContent = '...';
        msgEl.textContent = '';
        msgEl.className = 'da-am-msg';

        try {
            var res = await fetch('/api/auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            var data = await res.json();

            if (res.ok) {
                DA.setToken(data.token);
                msgEl.textContent = t('auth.login_success', 'Signed in!');
                msgEl.className = 'da-am-msg success';
                setTimeout(function() { DA.close(); DA.updateNav(); }, 600);
            } else {
                msgEl.textContent = data.error || t('auth.login_failed', 'Login failed');
                msgEl.className = 'da-am-msg error';
            }
        } catch(e) {
            msgEl.textContent = t('auth.network_error', 'Network error');
            msgEl.className = 'da-am-msg error';
        }
        btn.disabled = false;
        btn.textContent = t('auth.sign_in', 'Sign In');
    };

    // ── 注册 ──
    DA._handleRegister = async function(e) {
        e.preventDefault();
        var msgEl = document.getElementById('da-am-register-msg');
        var btn = document.getElementById('da-am-register-btn');
        var email = document.getElementById('da-am-register-email').value.trim();
        var password = document.getElementById('da-am-register-password').value;
        var password2 = document.getElementById('da-am-register-password2').value;

        if (!email || !password) {
            msgEl.textContent = t('auth.fill_all', 'Please fill in all fields.');
            msgEl.className = 'da-am-msg error';
            return;
        }
        if (password !== password2) {
            msgEl.textContent = t('auth.passwords_mismatch', 'Passwords do not match.');
            msgEl.className = 'da-am-msg error';
            return;
        }
        if (password.length < 6) {
            msgEl.textContent = t('auth.password_short', 'Password must be at least 6 characters.');
            msgEl.className = 'da-am-msg error';
            return;
        }

        btn.disabled = true;
        btn.textContent = '...';
        msgEl.textContent = '';
        msgEl.className = 'da-am-msg';

        try {
            var res = await fetch('/api/auth?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            var data = await res.json();

            if (res.ok || res.status === 201) {
                msgEl.textContent = t('auth.register_success', 'Account created! Signing in...');
                msgEl.className = 'da-am-msg success';
                // Auto-login
                var res2 = await fetch('/api/auth?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });
                var data2 = await res2.json();
                if (res2.ok) {
                    DA.setToken(data2.token);
                    setTimeout(function() { DA.close(); DA.updateNav(); }, 500);
                    return;
                }
            }
            msgEl.textContent = data.error || t('auth.register_failed', 'Registration failed');
            msgEl.className = 'da-am-msg error';
        } catch(e) {
            msgEl.textContent = t('auth.network_error', 'Network error');
            msgEl.className = 'da-am-msg error';
        }
        btn.disabled = false;
        btn.textContent = t('auth.create_account', 'Create Account');
    };

    // ── 登出 ──
    DA.signOut = function() {
        DA.clearToken();
        DA.updateNav();
        DA.showToast(t('auth.signed_out', 'Signed out.'), 2000);
    };

    // ── 更新导航栏 ──
    DA.updateNav = async function() {
        var user = await DA.getUser();
        var btn = document.getElementById('wpn-signin-btn');
        if (!btn) return;

        // 移除旧的下拉菜单
        var oldMenu = document.getElementById('da-signout-menu');
        if (oldMenu) oldMenu.remove();

        if (user) {
            var email = user.email || 'U';
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
                // 创建简洁的退出链接（跟随邮箱下方）
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
                // 点击其他区域关闭
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
            btn.onclick = function(e) { e.preventDefault(); DA.open('login'); };
        }
    };

    // ── Re-translate modal when language changes ──
    DA._retranslate = function() {
        var el = document.getElementById('da-auth-modal');
        if (!el) return;
        // Rebuild modal to pick up new translations
        el.remove();
        DA._ensureModal();
    };
    document.addEventListener('daoessence:i18n-changed', DA._retranslate);

    // ── 初始化 ──
    DA.init = function() {
        DA.updateNav();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', DA.init);
    } else {
        DA.init();
    }

    window.DaoAuth = DA;
})();
