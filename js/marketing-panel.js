/**
 * ============================================
 * DAO Essence - 营销邮件面板
 * 独立模块，挂载到 bazi-orders.html 的 marketing Tab
 * ============================================
 * 
 * 依赖：全局变量 adminKey（由 bazi-orders.html 提供）
 * API：/api/marketing (GET=订阅者列表, POST=发送邮件)
 */

(function() {
    'use strict';

    // ========== 状态 ==========
    let subscribers = [];
    let sendHistory = [];
    let selectedEmails = new Set();

    // ========== 邮件模板 ==========
    const TEMPLATES = [
        {
            id: 'new_article',
            name: '📰 新文章推送',
            subject: '新文章发布 - {{title}}',
            html: `<div style="padding: 20px 0;">
<h2 style="color: #d4af37;">{{title}}</h2>
<p style="color: #666; font-size: 14px; margin: 10px 0;">{{name}}，你好！</p>
<p style="color: #333; line-height: 1.8;">我们刚刚发布了新文章，快来看看吧！</p>
<div style="margin: 25px 0; text-align: center;">
    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">阅读全文 →</a>
</div>
</div>`
        },
        {
            id: 'promotion',
            name: '🎉 促销活动',
            subject: '限时优惠 - {{title}}',
            html: `<div style="padding: 20px 0;">
<h2 style="color: #d4af37;">{{title}}</h2>
<p style="color: #666; font-size: 14px; margin: 10px 0;">亲爱的 {{name}}，</p>
<p style="color: #333; line-height: 1.8;">{{description}}</p>
<div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
    <p style="color: #16a34a; font-size: 28px; font-weight: 700; margin: 0;">{{discount}}</p>
    <p style="color: #166534; margin: 8px 0 0;">{{validity}}</p>
</div>
<div style="text-align: center; margin: 20px 0;">
    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #059669); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">立即抢购 →</a>
</div>
</div>`
        },
        {
            id: 'festival',
            name: '🏮 节日祝福',
            subject: '{{greeting}} - DAO Essence',
            html: `<div style="padding: 20px 0;">
<div style="text-align: center; font-size: 48px; margin: 20px 0;">{{emoji}}</div>
<h2 style="color: #d4af37; text-align: center;">{{greeting}}</h2>
<p style="color: #666; font-size: 14px; margin: 15px 0; text-align: center;">亲爱的 {{name}}，</p>
<p style="color: #333; line-height: 1.8; text-align: center;">{{message}}</p>
<div style="text-align: center; margin: 25px 0;">
    <p style="color: #888; font-size: 13px;">DAO Essence 团队 敬上</p>
</div>
</div>`
        },
        {
            id: 'custom',
            name: '✏️ 自定义邮件',
            subject: '',
            html: `<div style="padding: 20px 0;">
<p style="color: #666; font-size: 14px;">亲爱的 {{name}}，</p>
<p style="color: #333; line-height: 1.8;">在这里写你的邮件内容...</p>
<p style="color: #333; line-height: 1.8;">支持 <strong>HTML 格式</strong>。</p>
<p style="color: #999; font-size: 12px; margin-top: 20px;">可用变量：{{name}}（收件人姓名）、{{email}}（收件人邮箱）</p>
</div>`
        }
    ];

    // ========== 渲染主面板 ==========
    function render() {
        const container = document.getElementById('marketingTabContent');
        if (!container) return;

        container.innerHTML = `
        <!-- 统计栏 -->
        <div class="stats-bar" id="marketingStats">
            <div class="stat-card">
                <h3 id="statTotal">-</h3>
                <p>总收件人</p>
            </div>
            <div class="stat-card">
                <h3 id="statOrders">-</h3>
                <p>订单客户</p>
            </div>
            <div class="stat-card">
                <h3 id="statContact">-</h3>
                <p>联系表单</p>
            </div>
            <div class="stat-card">
                <h3 id="statHistory">-</h3>
                <p>已发送</p>
            </div>
        </div>

        <!-- 两栏布局 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- 左栏：收件人 -->
            <div>
                <div class="orders-table">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: #d4af37; margin: 0;">📧 收件人列表</h3>
                        <div>
                            <button class="btn btn-primary" onclick="MP.loadSubscribers()" style="padding: 6px 14px; font-size: 0.85rem;">🔄 刷新</button>
                        </div>
                    </div>
                    <div style="padding: 10px;">
                        <input type="text" id="subSearchInput" placeholder="搜索邮箱或姓名..." 
                            style="width: 100%; padding: 8px 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit; margin-bottom: 8px;"
                            oninput="MP.filterSubscribers()">
                        <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                            <select id="subSourceFilter" onchange="MP.filterSubscribers()"
                                style="padding: 6px 10px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                                <option value="">全部来源</option>
                                <option value="bazi_order">八字订单</option>
                                <option value="contact_form">联系表单</option>
                                <option value="manual">手动添加</option>
                            </select>
                            <button class="btn" onclick="MP.selectAll()" style="padding: 6px 12px; background: rgba(212,175,55,0.1); color: #d4af37; font-size: 0.8rem;">全选</button>
                            <button class="btn" onclick="MP.deselectAll()" style="padding: 6px 12px; background: rgba(255,255,255,0.05); color: #888; font-size: 0.8rem;">取消全选</button>
                        </div>
                    </div>
                    <div id="subscriberList" style="max-height: 400px; overflow-y: auto; padding: 0 10px 10px;">
                        <p style="text-align: center; color: #666; padding: 30px;">点击「刷新」加载收件人</p>
                    </div>
                    <div style="padding: 10px 15px; border-top: 1px solid rgba(212,175,55,0.2); color: #888; font-size: 0.85rem;">
                        已选择 <strong id="selectedCount" style="color: #d4af37;">0</strong> 位收件人
                    </div>
                </div>
            </div>

            <!-- 右栏：编辑器 -->
            <div>
                <div class="orders-table">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                        <h3 style="color: #d4af37; margin: 0 0 12px;">✉️ 编辑邮件</h3>
                        
                        <!-- 模板选择 -->
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">选择模板</label>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="templateButtons">
                                ${TEMPLATES.map(t => `<button class="btn" onclick="MP.loadTemplate('${t.id}')" style="padding: 6px 12px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.1);">${t.name}</button>`).join('')}
                            </div>
                        </div>

                        <!-- 模板变量输入区（动态生成） -->
                        <div id="templateVarsContainer" style="display: none; margin-bottom: 12px;"></div>

                        <!-- 主题 -->
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">邮件主题</label>
                            <input type="text" id="emailSubject" placeholder="输入邮件主题..." 
                                style="width: 100%; padding: 10px 14px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                        </div>

                        <!-- 预览邮箱 -->
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">预览邮箱（先发一封给自己看看效果）</label>
                            <input type="email" id="previewEmail" placeholder="你的邮箱..." 
                                style="width: 100%; padding: 10px 14px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                        </div>
                    </div>

                    <!-- 编辑器 -->
                    <div style="padding: 10px 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="color: #888; font-size: 0.85rem;">邮件内容 (HTML)</label>
                            <button class="btn" onclick="MP.togglePreview()" style="padding: 4px 10px; background: rgba(255,255,255,0.05); color: #888; font-size: 0.8rem;">👁 预览</button>
                        </div>
                        <textarea id="emailContent" rows="12"
                            style="width: 100%; padding: 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(0,0,0,0.3); color: #e8e8e8; font-family: 'Consolas', monospace; font-size: 0.85rem; resize: vertical; line-height: 1.6;"
                            placeholder="支持 HTML 格式。可用变量：{{name}}, {{email}}"></textarea>
                        <div id="emailPreview" style="display: none; margin-top: 10px; background: rgba(255,255,255,0.95); border-radius: 8px; padding: 20px; min-height: 200px; color: #333;"></div>
                    </div>

                    <!-- 操作按钮 -->
                    <div style="padding: 15px; border-top: 1px solid rgba(212,175,55,0.2); display: flex; gap: 10px;">
                        <button class="btn" onclick="MP.sendPreview()" style="background: rgba(100,181,246,0.2); color: #64b5f6; flex: 1;">
                            👁 发送预览
                        </button>
                        <button class="btn btn-primary" onclick="MP.confirmSend()" style="flex: 1;" id="sendBtn">
                            📤 发送给选中的收件人
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 发送记录 -->
        <div class="orders-table" style="margin-top: 20px;">
            <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                <h3 style="color: #d4af37; margin: 0;">📋 发送记录</h3>
            </div>
            <div id="sendHistoryList" style="padding: 15px;">
                <p style="text-align: center; color: #666;">暂无发送记录</p>
            </div>
        </div>
        `;

        // 不自动加载，等 adminKey 可用后由 switchTab 触发
        // loadSubscribers() will be called when user switches to marketing tab
    }

    // ========== 加载订阅者 ==========
    async function loadSubscribers() {
        if (typeof window.adminKey === 'undefined' || !window.adminKey) {
            console.error('MP: adminKey 未定义');
            return;
        }

        const listEl = document.getElementById('subscriberList');
        if (listEl) listEl.innerHTML = '<p style="text-align: center; color: #d4af37; padding: 20px;">加载中...</p>';

        try {
            const res = await fetch('/api/marketing', {
                headers: { 'Authorization': `Bearer ${window.adminKey}` }
            });

            if (res.status === 401) {
                if (listEl) listEl.innerHTML = '<p style="text-align: center; color: #ef5350;">授权已过期，请重新登录</p>';
                return;
            }

            const data = await res.json();
            if (data.success) {
                subscribers = data.subscribers;
                updateStats(data.stats);
                renderSubscribers();
            } else {
                if (listEl) listEl.innerHTML = `<p style="text-align: center; color: #ef5350;">加载失败: ${data.error}</p>`;
            }
        } catch (err) {
            console.error('MP: 加载订阅者失败', err);
            if (listEl) listEl.innerHTML = `<p style="text-align: center; color: #ef5350;">网络错误: ${err.message}</p>`;
        }
    }

    // ========== 更新统计 ==========
    function updateStats(stats) {
        const el = (id) => document.getElementById(id);
        if (el('statTotal')) el('statTotal').textContent = stats.total;
        if (el('statOrders')) el('statOrders').textContent = stats.baziOrders;
        if (el('statContact')) el('statContact').textContent = stats.contactForm;
        if (el('statHistory')) el('statHistory').textContent = sendHistory.length;
    }

    // ========== 渲染订阅者列表 ==========
    function renderSubscribers() {
        const listEl = document.getElementById('subscriberList');
        if (!listEl) return;

        const filtered = getFilteredSubscribers();

        if (filtered.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">暂无数据</p>';
            updateSelectedCount();
            return;
        }

        listEl.innerHTML = filtered.map(s => {
            const checked = selectedEmails.has(s.email) ? 'checked' : '';
            const sourceColor = s.source === 'bazi_order' ? '#4caf50' : s.source === 'contact_form' ? '#2196f3' : '#ff9800';
            return `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer;" onclick="MP.toggleSelect('${s.email}')">
                <input type="checkbox" ${checked} onclick="event.stopPropagation(); MP.toggleSelect('${s.email}')" style="accent-color: #d4af37;">
                <div style="flex: 1; min-width: 0;">
                    <div style="color: #e8e8e8; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.name || '未命名'}</div>
                    <div style="color: #666; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.email}</div>
                </div>
                <span style="font-size: 0.7rem; color: ${sourceColor}; background: ${sourceColor}20; padding: 2px 8px; border-radius: 10px; white-space: nowrap;">${s.sourceLabel || s.source}</span>
            </div>`;
        }).join('');

        updateSelectedCount();
    }

    // ========== 过滤 ==========
    function getFilteredSubscribers() {
        const search = (document.getElementById('subSearchInput')?.value || '').toLowerCase();
        const source = document.getElementById('subSourceFilter')?.value || '';

        return subscribers.filter(s => {
            const matchSearch = !search ||
                (s.email && s.email.toLowerCase().includes(search)) ||
                (s.name && s.name.toLowerCase().includes(search));
            const matchSource = !source || s.source === source;
            return matchSearch && matchSource;
        });
    }

    function filterSubscribers() {
        renderSubscribers();
    }

    // ========== 选择 ==========
    function toggleSelect(email) {
        if (selectedEmails.has(email)) {
            selectedEmails.delete(email);
        } else {
            selectedEmails.add(email);
        }
        renderSubscribers();
    }

    function selectAll() {
        const filtered = getFilteredSubscribers();
        filtered.forEach(s => selectedEmails.add(s.email));
        renderSubscribers();
    }

    function deselectAll() {
        selectedEmails.clear();
        renderSubscribers();
    }

    function updateSelectedCount() {
        const el = document.getElementById('selectedCount');
        if (el) el.textContent = selectedEmails.size;
    }

    // 当前模板变量值（模板自定义变量，如 title/description 等）
    let templateVars = {};

    // 从 HTML 中提取所有 {{xxx}} 变量名（排除 name/email，它们是收件人变量）
    function extractVars(html, subject) {
        const all = (html + ' ' + (subject || '')).match(/\{\{(\w+)\}\}/g) || [];
        const vars = new Set();
        all.forEach(v => {
            const name = v.replace(/\{\{|\}\}/g, '');
            if (!['name', 'email'].includes(name)) vars.add(name);
        });
        return [...vars];
    }

    // 变量中文标签映射
    const VAR_LABELS = {
        title: '标题', description: '描述', discount: '折扣信息', validity: '有效期',
        link: '链接', greeting: '祝福语', emoji: '表情符号', message: '自定义消息',
        cta: '按钮文字', subtitle: '副标题', code: '优惠码'
    };
    const VAR_PLACEHOLDERS = {
        title: '例如：春季八字解读限时优惠',
        description: '例如：活动详情描述...',
        discount: '例如：全场8折 / 限时立减50元',
        validity: '例如：活动时间：2026年4月17日-4月30日',
        link: 'https://www.daoessentia.com',
        greeting: '例如：新春快乐 / 端午安康',
        emoji: '🏮',
        message: '例如：祝你新的一年万事如意！',
        cta: '立即查看 →',
        subtitle: '例如：专属于您的优惠',
        code: '例如：DAO2026'
    };

    // ========== 模板 ==========
    function loadTemplate(id) {
        const tpl = TEMPLATES.find(t => t.id === id);
        if (!tpl) return;

        const subjectEl = document.getElementById('emailSubject');
        const contentEl = document.getElementById('emailContent');

        if (subjectEl) subjectEl.value = tpl.subject;
        if (contentEl) contentEl.value = tpl.html;

        // 重置变量值
        templateVars = {};

        // 提取模板变量并生成输入字段
        const vars = extractVars(tpl.html, tpl.subject);
        const varsContainer = document.getElementById('templateVarsContainer');

        if (varsContainer) {
            if (vars.length === 0) {
                varsContainer.innerHTML = '';
                varsContainer.style.display = 'none';
            } else {
                varsContainer.style.display = 'block';
                varsContainer.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="color: #d4af37; font-size: 0.85rem; display: block; margin-bottom: 8px;">📋 填写模板变量</label>
                        ${vars.map(v => `
                            <div style="margin-bottom: 8px;">
                                <label style="color: #888; font-size: 0.78rem; display: block; margin-bottom: 3px;">${VAR_LABELS[v] || v} ({{${v}}})</label>
                                <input type="text" class="tpl-var-input" data-var="${v}" 
                                    placeholder="${VAR_PLACEHOLDERS[v] || '输入' + (VAR_LABELS[v] || v) + '...'}"
                                    oninput="MP.onVarChange('${v}', this.value)"
                                    style="width: 100%; padding: 8px 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit; font-size: 0.85rem;">
                            </div>
                        `).join('')}
                    </div>`;
            }
        }

        // 高亮当前模板
        document.querySelectorAll('#templateButtons button').forEach(btn => {
            btn.style.borderColor = 'rgba(255,255,255,0.1)';
            btn.style.background = 'rgba(255,255,255,0.05)';
        });
        const btns = document.querySelectorAll('#templateButtons button');
        const idx = TEMPLATES.findIndex(t => t.id === id);
        if (btns[idx]) {
            btns[idx].style.borderColor = '#d4af37';
            btns[idx].style.background = 'rgba(212,175,55,0.15)';
        }
    }

    // 模板变量值变化时更新
    function onVarChange(varName, value) {
        templateVars[varName] = value;
    }

    // 从模板变量输入框同步到 templateVars 对象
    function syncTemplateVarsFromInputs() {
        const inputs = document.querySelectorAll('.tpl-var-input');
        inputs.forEach(input => {
            const varName = input.dataset.var;
            if (varName && input.value) {
                templateVars[varName] = input.value;
            }
        });
    }

    // 用模板变量替换内容中的占位符
    function applyTemplateVars(content) {
        let result = content;
        for (const [key, value] of Object.entries(templateVars)) {
            if (value) {
                result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
            }
        }
        return result;
    }

    // ========== 预览 ==========
    function togglePreview() {
        const contentEl = document.getElementById('emailContent');
        const previewEl = document.getElementById('emailPreview');
        if (!contentEl || !previewEl) return;

        if (previewEl.style.display === 'none') {
            // 同步模板变量输入框的值 + 用第一个选中收件人的信息渲染预览
            syncTemplateVarsFromInputs();
            let previewHtml = applyTemplateVars(contentEl.value);
            let previewSubject = applyTemplateVars(document.getElementById('emailSubject')?.value || '');
            const firstSub = subscribers.find(s => selectedEmails.has(s.email)) || { name: '张三', email: 'test@example.com' };
            previewHtml = previewHtml.replace(/\{\{name\}\}/g, firstSub.name || 'Friend');
            previewHtml = previewHtml.replace(/\{\{email\}\}/g, firstSub.email);

            // 包裹邮件外壳
            previewEl.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 3px;">DAO ESSENCE</h1>
                        <p style="color: #c9b99a; margin: 8px 0 0; font-size: 14px;">道本精酿 · 古道能量</p>
                    </div>
                    <div style="padding: 30px; background: #fff; border-left: 1px solid #eee; border-right: 1px solid #eee;">
                        ${previewHtml}
                    </div>
                    <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                        <p style="color: #c9b99a; margin: 0; font-size: 12px;">© 2026 DAO Essence · www.daoessentia.com</p>
                    </div>
                </div>`;
            previewEl.style.display = 'block';
            contentEl.style.display = 'none';
        } else {
            previewEl.style.display = 'none';
            contentEl.style.display = 'block';
        }
    }

    // ========== 发送预览 ==========
    async function sendPreview() {
        const previewEmail = document.getElementById('previewEmail')?.value?.trim();
        let subject = document.getElementById('emailSubject')?.value?.trim();
        let htmlContent = document.getElementById('emailContent')?.value?.trim();

        if (!previewEmail) {
            alert('请输入预览邮箱');
            return;
        }
        if (!subject) {
            alert('请输入邮件主题');
            return;
        }
        if (!htmlContent) {
            alert('请输入邮件内容');
            return;
        }

        // 同步模板变量输入框的值 + 替换模板变量
        syncTemplateVarsFromInputs();
        subject = applyTemplateVars(subject);
        htmlContent = applyTemplateVars(htmlContent);

        // 检查是否还有未替换的模板变量
        const unreplaced = (htmlContent + ' ' + subject).match(/\{\{(?!name|email)\w+\}\}/g);
        if (unreplaced && unreplaced.length > 0) {
            const unique = [...new Set(unreplaced)];
            const proceed = confirm(
                `⚠️ 检测到 ${unique.length} 个未替换的模板变量：\n${unique.join(', ')}\n\n` +
                `建议先在「填写模板变量」区域填写这些值。\n\n` +
                `是否仍然发送？（未替换的变量会原样显示在邮件中）`
            );
            if (!proceed) return;
        }

        try {
            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.adminKey}`
                },
                body: JSON.stringify({
                    previewEmail,
                    subject,
                    htmlContent,
                    title: subject
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`预览邮件已发送至 ${previewEmail}，请查收！`);
            } else {
                alert(`发送失败: ${data.error}`);
            }
        } catch (err) {
            alert(`网络错误: ${err.message}`);
        }
    }

    // ========== 确认发送 ==========
    function confirmSend() {
        if (selectedEmails.size === 0) {
            alert('请先选择收件人');
            return;
        }

        const subject = document.getElementById('emailSubject')?.value?.trim();
        if (!subject) {
            alert('请输入邮件主题');
            return;
        }

        const count = selectedEmails.size;
        const confirmed = confirm(
            `确认发送营销邮件？\n\n` +
            `收件人数量：${count}\n` +
            `邮件主题：${subject}\n\n` +
            `建议：发送前先发一封预览给自己确认效果。`
        );

        if (confirmed) {
            sendMarketingEmail();
        }
    }

    // ========== 发送营销邮件 ==========
    async function sendMarketingEmail() {
        let subject = document.getElementById('emailSubject')?.value?.trim();
        let htmlContent = document.getElementById('emailContent')?.value?.trim();
        const sendBtn = document.getElementById('sendBtn');

        if (!subject || !htmlContent) return;

        // 同步模板变量输入框的值 + 替换模板变量
        syncTemplateVarsFromInputs();
        subject = applyTemplateVars(subject);
        htmlContent = applyTemplateVars(htmlContent);

        // 检查是否还有未替换的模板变量（name/email 除外，它们由后端替换）
        const unreplaced = (htmlContent + ' ' + subject).match(/\{\{(?!name|email)\w+\}\}/g);
        if (unreplaced && unreplaced.length > 0) {
            const unique = [...new Set(unreplaced)];
            const proceed = confirm(
                `⚠️ 检测到 ${unique.length} 个未替换的模板变量：\n${unique.join(', ')}\n\n` +
                `建议先在「填写模板变量」区域填写这些值。\n\n` +
                `是否仍然发送？（未替换的变量会原样显示在邮件中）`
            );
            if (!proceed) return;
        }

        // 构建收件人列表
        const recipients = [];
        selectedEmails.forEach(email => {
            const sub = subscribers.find(s => s.email === email);
            if (sub) {
                recipients.push({ email: sub.email, name: sub.name || '' });
            }
        });

        if (recipients.length === 0) {
            alert('没有有效的收件人');
            return;
        }

        // 禁用按钮
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = '发送中...';
            sendBtn.style.opacity = '0.6';
        }

        try {
            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.adminKey}`
                },
                body: JSON.stringify({
                    recipients,
                    subject,
                    htmlContent,
                    title: subject,
                    fromAlias: 'DAO Essence',
                    replyTo: true
                })
            });

            const data = await res.json();

            if (data.success) {
                // 记录到本地历史
                sendHistory.unshift({
                    id: data.taskId,
                    subject,
                    total: data.total || recipients.length,
                    sent: data.sent || 0,
                    failed: data.failed || 0,
                    date: new Date().toLocaleString('zh-CN'),
                    truncated: data.truncated || false
                });
                renderSendHistory();
                updateStats({ total: subscribers.length, baziOrders: 0, contactForm: 0, manual: 0 });

                let msg = `✅ 发送完成！\n成功: ${data.sent || 0}\n失败: ${data.failed || 0}`;
                if (data.truncated) {
                    msg += `\n⚠️ 收件人超过50人，仅发送了前50封。分批发送功能开发中。`;
                }
                alert(msg);
            } else {
                alert(`发送失败: ${data.error}`);
            }
        } catch (err) {
            alert(`网络错误: ${err.message}`);
        } finally {
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = '📤 发送给选中的收件人';
                sendBtn.style.opacity = '1';
            }
        }
    }

    // ========== 发送记录 ==========
    function renderSendHistory() {
        const el = document.getElementById('sendHistoryList');
        if (!el) return;

        if (sendHistory.length === 0) {
            el.innerHTML = '<p style="text-align: center; color: #666;">暂无发送记录</p>';
            return;
        }

        el.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px; text-align: left; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.2);">主题</th>
                    <th style="padding: 10px; text-align: center; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.2);">成功/总数</th>
                    <th style="padding: 10px; text-align: right; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.2);">时间</th>
                </tr>
            </thead>
            <tbody>
                ${sendHistory.map(h => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e8e8e8;">${h.subject}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: #4caf50;">${h.sent}</span> / ${h.total}
                        ${h.failed > 0 ? `<span style="color: #ef5350; font-size: 0.8rem;"> (${h.failed}失败)</span>` : ''}
                        ${h.truncated ? '<span style="color: #ff9800; font-size: 0.7rem;"> ⚠️</span>' : ''}
                    </td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05); color: #888; font-size: 0.85rem;">${h.date}</td>
                </tr>`).join('')}
            </tbody>
        </table>`;
    }

    // ========== 暴露到全局 ==========
    window.MP = {
        loadSubscribers,
        filterSubscribers,
        toggleSelect,
        selectAll,
        deselectAll,
        loadTemplate,
        onVarChange,
        syncTemplateVarsFromInputs,
        applyTemplateVars,
        togglePreview,
        sendPreview,
        confirmSend,
        render
    };

    // ========== 自动初始化 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }

})();
