/**
 * DaoEssence Auth — 前端认证模块（无弹窗版）
 */
(function() {
    'use strict';

    const DA = {};

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
        let el = document.getElementById('da-toast');
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

    // ── 简单登录（内联表单） ──
    DA.signIn = async function() {
        const email = prompt('Enter your email to sign in or register:');
        if (!email || !email.includes('@')) {
            DA.showToast('Please enter a valid email address.', 3000);
            return;
        }
        const password = prompt('Enter your password (min 6 chars):');
        if (!password || password.length < 6) {
            DA.showToast('Password must be at least 6 characters.', 3000);
            return;
        }

        // Try login first
        try {
            let res = await fetch('/api/auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            let data = await res.json();

            if (res.ok) {
                DA.setToken(data.token);
                DA.showToast('Signed in!', 2000);
                DA.updateNav();
                return;
            }

            // Login failed — try register
            if (res.status === 401) {
                const doRegister = confirm('Account not found. Create a new account with this email?');
                if (!doRegister) return;

                res = await fetch('/api/auth?action=register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                data = await res.json();

                if (res.ok || res.status === 201) {
                    // Auto-login after register
                    res = await fetch('/api/auth?action=login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    data = await res.json();
                    if (res.ok) {
                        DA.setToken(data.token);
                        DA.showToast('Account created & signed in!', 2000);
                        DA.updateNav();
                        return;
                    }
                }
                DA.showToast(data.error || 'Registration failed.', 4000);
                return;
            }

            DA.showToast(data.error || 'Sign in failed.', 4000);
        } catch(e) {
            DA.showToast('Network error. Please try again.', 4000);
        }
    };

    // ── 登出 ──
    DA.signOut = function() {
        DA.clearToken();
        DA.updateNav();
        DA.showToast('Signed out.', 2000);
    };

    // ── 更新导航栏 ──
    DA.updateNav = async function() {
        const user = await DA.getUser();
        const btn = document.getElementById('wpn-signin-btn');
        if (!btn) return;

        if (user) {
            btn.textContent = user.email.split('@')[0];
            btn.title = 'Click to sign out';
            btn.onclick = function(e) { e.preventDefault(); DA.signOut(); };
        } else {
            btn.textContent = 'Sign In';
            btn.title = 'Sign in or register';
            btn.onclick = function(e) { e.preventDefault(); DA.signIn(); };
        }
    };

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
