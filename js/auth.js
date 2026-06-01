/**
 * DaoEssence Auth — 前端认证模块
 * 挂载到 window.DaoAuth，供 wallpaper.html 和 wallpaper-detail.html 使用
 */

(function() {
    'use strict';

    const DA = {};

    // ── 打开/关闭弹窗 ──
    DA.open = function(tab) {
        const overlay = document.getElementById('auth-overlay');
        if (!overlay) return;
        overlay.classList.add('open');
        if (tab) DA.switchTab(tab);
    };

    window.closeAuth = function() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.classList.remove('open');
    };

    window.switchAuthTab = function(tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('auth-login-form');
        const regForm = document.getElementById('auth-register-form');

        tabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.auth-tab[data-tab="${tab}"]`);
        if (activeTab) activeTab.classList.add('active');

        if (tab === 'login') {
            if (loginForm) loginForm.style.display = 'block';
            if (regForm) regForm.style.display = 'none';
        } else {
            if (loginForm) loginForm.style.display = 'none';
            if (regForm) regForm.style.display = 'block';
        }
    };

    // ── 获取 JWT ──
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
        } catch(e) {
            return null;
        }
    };

    // ── 登录 ──
    window.handleLogin = async function(e) {
        e.preventDefault();
        const msgEl = document.getElementById('login-msg');
        const btn = document.getElementById('login-btn');
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            msgEl.textContent = 'Please enter email and password.';
            msgEl.className = 'auth-msg error';
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Signing in...';
        msgEl.textContent = '';
        msgEl.className = 'auth-msg';

        try {
            const res = await fetch('/api/auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                DA.setToken(data.token);
                msgEl.textContent = 'Success!';
                msgEl.className = 'auth-msg success';
                setTimeout(() => {
                    closeAuth();
                    DA.updateNav();
                }, 800);
            } else {
                msgEl.textContent = data.error || 'Login failed';
                msgEl.className = 'auth-msg error';
                if (data.notVerified) {
                    msgEl.textContent += ' Please check your email.';
                }
            }
        } catch(e) {
            msgEl.textContent = 'Network error. Please try again.';
            msgEl.className = 'auth-msg error';
        }

        btn.disabled = false;
        btn.textContent = 'Sign In';
    };

    // ── 注册 ──
    window.handleRegister = async function(e) {
        e.preventDefault();
        const msgEl = document.getElementById('register-msg');
        const btn = document.getElementById('register-btn');
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const password2 = document.getElementById('register-password2').value;

        if (!email || !password) {
            msgEl.textContent = 'All fields are required.';
            msgEl.className = 'auth-msg error';
            return;
        }
        if (password !== password2) {
            msgEl.textContent = 'Passwords do not match.';
            msgEl.className = 'auth-msg error';
            return;
        }
        if (password.length < 6) {
            msgEl.textContent = 'Password must be at least 6 characters.';
            msgEl.className = 'auth-msg error';
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creating...';
        msgEl.textContent = '';
        msgEl.className = 'auth-msg';

        try {
            const res = await fetch('/api/auth?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                msgEl.textContent = 'Registration successful! Please check your email to verify your account.';
                msgEl.className = 'auth-msg success';
                setTimeout(() => DA.switchTab('login'), 2000);
            } else {
                msgEl.textContent = data.error || 'Registration failed';
                msgEl.className = 'auth-msg error';
            }
        } catch(e) {
            msgEl.textContent = 'Network error. Please try again.';
            msgEl.className = 'auth-msg error';
        }

        btn.disabled = false;
        btn.textContent = 'Create Account';
    };

    // ── 登出 ──
    DA.logout = function() {
        DA.clearToken();
        DA.updateNav();
    };

    // ── 更新导航栏显示 ──
    DA.updateNav = async function() {
        const user = await DA.getUser();
        const signinBtn = document.getElementById('wpn-signin-btn');
        const limitEl = document.querySelector('.wpn-limit span');

        if (user) {
            // 已登录
            if (signinBtn) {
                signinBtn.textContent = user.email.split('@')[0];
                signinBtn.href = '#';
                signinBtn.onclick = function(e) { e.preventDefault(); DA.logout(); };
                signinBtn.style.fontSize = '12px';
            }

            // 登录用户 3 次/天
            const max = 3;
            const today = new Date().toISOString().slice(0, 10);
            const count = (user.downloadDate === today) ? (user.downloadCount || 0) : 0;
            if (limitEl) limitEl.textContent = count + '/' + max;
        } else {
            // 游客
            if (signinBtn) {
                signinBtn.textContent = 'Sign In';
                signinBtn.href = '#';
                signinBtn.onclick = function(e) { e.preventDefault(); DA.open('login'); };
                signinBtn.style.fontSize = '13px';
            }
            if (limitEl) limitEl.textContent = '1/1';
        }
    };

    // ── 初始化 ──
    DA.init = function() {
        // Sign In 按钮
        const signinBtn = document.getElementById('wpn-signin-btn');
        if (signinBtn) {
            signinBtn.addEventListener('click', function(e) {
                e.preventDefault();
                DA.open('login');
            });
        }

        // 点击遮罩关闭
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeAuth();
            });
        }

        // 更新导航栏状态
        DA.updateNav();
    };

    // DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', DA.init);
    } else {
        DA.init();
    }

    window.DaoAuth = DA;
})();
