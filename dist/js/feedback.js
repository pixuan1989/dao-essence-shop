/**
 * Feedback Widget - 问题反馈悬浮按钮 + 表单
 * 提交到 /api/pageview (action=feedback)，数据存 KV
 */
(function() {
    'use strict';

    const FW = {};

    FW.init = function() {
        // 注入样式
        const style = document.createElement('style');
        style.textContent = FW.CSS;
        document.head.appendChild(style);

        // 创建 DOM
        const container = document.createElement('div');
        container.id = 'feedback-widget-root';
        container.innerHTML = FW.HTML;
        document.body.appendChild(container);

        // 绑定事件
        FW.bindEvents();
    };

    FW.bindEvents = function() {
        const root = document.getElementById('feedback-widget-root');
        if (!root) return;

        // 悬浮按钮
        const btn = root.querySelector('#fb-fab-btn');
        if (btn) btn.addEventListener('click', FW.openModal);

        // 关闭按钮
        const closeBtn = root.querySelector('#fb-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', FW.closeModal);

        // 遮罩层关闭
        const overlay = root.querySelector('#fb-overlay');
        if (overlay) overlay.addEventListener('click', FW.closeModal);

        // 提交按钮
        const submitBtn = root.querySelector('#fb-submit-btn');
        if (submitBtn) submitBtn.addEventListener('click', FW.submit);

        // 回车提交
        const msgInput = root.querySelector('#fb-message');
        if (msgInput) msgInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) FW.submit();
        });
    };

    FW.openModal = function() {
        const root = document.getElementById('feedback-widget-root');
        if (!root) return;
        const modal = root.querySelector('#fb-modal');
        if (modal) modal.classList.add('fb-modal-open');
        document.body.style.overflow = 'hidden';
    };

    FW.closeModal = function() {
        const root = document.getElementById('feedback-widget-root');
        if (!root) return;
        const modal = root.querySelector('#fb-modal');
        if (modal) modal.classList.remove('fb-modal-open');
        document.body.style.overflow = '';
    };

    FW.submit = async function() {
        const root = document.getElementById('feedback-widget-root');
        if (!root) return;

        const emailInput = root.querySelector('#fb-email');
        const msgInput = root.querySelector('#fb-message');
        const statusEl = root.querySelector('#fb-status');
        const submitBtn = root.querySelector('#fb-submit-btn');

        const email = (emailInput.value || '').trim();
        const message = (msgInput.value || '').trim();

        // 验证
        if (!email) {
            statusEl.textContent = 'Please enter your email';
            statusEl.className = 'fb-status fb-error';
            emailInput.focus();
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            statusEl.textContent = 'Invalid email format';
            statusEl.className = 'fb-status fb-error';
            emailInput.focus();
            return;
        }
        if (!message) {
            statusEl.textContent = 'Please enter your message';
            statusEl.className = 'fb-status fb-error';
            msgInput.focus();
            return;
        }

        // 禁用按钮
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        statusEl.textContent = '';
        statusEl.className = 'fb-status';

        try {
            const res = await fetch('/api/pageview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'feedback',
                    email: email,
                    message: message,
                    page: window.location.href
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                statusEl.textContent = 'Thank you! Your feedback has been submitted.';
                statusEl.className = 'fb-status fb-success';
                emailInput.value = '';
                msgInput.value = '';
                // 2 秒后自动关闭
                setTimeout(FW.closeModal, 2000);
            } else {
                statusEl.textContent = data.error || 'Submission failed. Please try again.';
                statusEl.className = 'fb-status fb-error';
            }
        } catch (err) {
            statusEl.textContent = 'Network error. Please try again.';
            statusEl.className = 'fb-status fb-error';
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    };

    FW.CSS = `
        /* 悬浮按钮 */
        #fb-fab-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(212,175,55,0.35);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            font-size: 22px;
            color: #fff;
        }
        #fb-fab-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 24px rgba(212,175,55,0.5);
        }

        /* 遮罩 */
        #fb-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 100000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .fb-modal-open ~ #fb-overlay,
        #fb-overlay.fb-overlay-open {
            opacity: 1;
            visibility: visible;
        }

        /* 模态框 */
        #fb-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            z-index: 100001;
            background: #fff;
            border-radius: 16px;
            padding: 32px;
            width: 420px;
            max-width: 90vw;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
        }
        #fb-modal.fb-modal-open {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }

        /* 标题行 */
        .fb-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .fb-header h3 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            color: #1A1612;
        }
        #fb-close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            padding: 0;
            line-height: 1;
            transition: color 0.2s;
        }
        #fb-close-btn:hover { color: #333; }

        /* 表单 */
        .fb-label {
            display: block;
            font-size: 0.85rem;
            font-weight: 500;
            color: #555;
            margin-bottom: 6px;
        }
        .fb-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 0.95rem;
            color: #1A1612;
            background: #fafafa;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
            box-sizing: border-box;
        }
        .fb-input:focus {
            border-color: #d4af37;
            box-shadow: 0 0 0 3px rgba(212,175,55,0.15);
            background: #fff;
        }
        .fb-textarea {
            min-height: 100px;
            resize: vertical;
            font-family: inherit;
        }
        .fb-field { margin-bottom: 16px; }
        .fb-hint {
            font-size: 0.75rem;
            color: #aaa;
            margin-top: 4px;
        }

        /* 状态提示 */
        .fb-status {
            font-size: 0.85rem;
            min-height: 1.2em;
            margin-bottom: 12px;
        }
        .fb-error { color: #e53e3e; }
        .fb-success { color: #38a169; }

        /* 提交按钮 */
        #fb-submit-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        #fb-submit-btn:hover { opacity: 0.9; }
        #fb-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* 移动端适配 */
        @media (max-width: 480px) {
            #fb-fab-btn { bottom: 20px; right: 20px; width: 46px; height: 46px; font-size: 20px; }
            #fb-modal { padding: 24px; }
        }
    `;

    FW.HTML = `
        <button id="fb-fab-btn" title="Feedback" aria-label="Submit feedback">&#9993;</button>
        <div id="fb-overlay"></div>
        <div id="fb-modal">
            <div class="fb-header">
                <h3>Feedback</h3>
                <button id="fb-close-btn" aria-label="Close">&times;</button>
            </div>
            <div class="fb-field">
                <label class="fb-label" for="fb-email">Email</label>
                <input class="fb-input" type="email" id="fb-email" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="fb-field">
                <label class="fb-label" for="fb-message">Message</label>
                <textarea class="fb-input fb-textarea" id="fb-message" placeholder="Tell us what you think..." maxlength="2000"></textarea>
                <div class="fb-hint">Ctrl+Enter to submit</div>
            </div>
            <div id="fb-status" class="fb-status"></div>
            <button id="fb-submit-btn">Submit</button>
        </div>
    `;

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', FW.init);
    } else {
        FW.init();
    }
})();
