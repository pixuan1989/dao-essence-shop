/**
 * ============================================
 * DAO Essence - 营销邮件面板
 * 独立模块，挂载到 bazi-orders.html 的 marketing Tab
 * ============================================
 *
 * 依赖：全局变量 adminKey（由 bazi-orders.html 提供）
 * API：/api/marketing (GET=订阅者列表 POST=发送邮件)
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
            name: '新文章推送',
            subject: '新文章发布 - {{title}}',
            html: '<div style="padding: 20px 0;"><h2 style="color: #d4af37;">{{title}}</h2><p style="color: #666; font-size: 14px; margin: 10px 0;">{{name}}，你好！</p><p style="color: #333; line-height: 1.8;">我们刚刚发布了新文章，快来看看吧！</p><div style="margin: 25px 0; text-align: center;"><a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">阅读全文 &rarr;</a></div></div>'
        },
        {
            id: 'promotion',
            name: '促销活动',
            subject: '限时优惠 - {{title}}',
            html: '<div style="padding: 20px 0;"><h2 style="color: #d4af37;">{{title}}</h2><p style="color: #666; font-size: 14px; margin: 10px 0;">亲爱的 {{name}}：</p><p style="color: #333; line-height: 1.8;">{{description}}</p><div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;"><p style="color: #16a34a; font-size: 28px; font-weight: 700; margin: 0;">{{discount}}</p><p style="color: #166534; margin: 8px 0 0;">{{validity}}</p></div><div style="text-align: center; margin: 20px 0;"><a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #059669); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">立即抢购 &rarr;</a></div></div>'
        },
        {
            id: 'festival',
            name: '节日祝福',
            subject: '{{greeting}} - DAO Essence',
            html: '<div style="padding: 20px 0;"><div style="text-align: center; font-size: 48px; margin: 20px 0;">{{emoji}}</div><h2 style="color: #d4af37; text-align: center;">{{greeting}}</h2><p style="color: #666; font-size: 14px; margin: 15px 0; text-align: center;">亲爱的 {{name}}：</p><p style="color: #333; line-height: 1.8; text-align: center;">{{message}}</p><div style="text-align: center; margin: 25px 0;"><p style="color: #888; font-size: 13px;">DAO Essence 团队 敬上</p></div></div>'
        },
        {
            id: 'wallpaper_digest',
            name: '壁纸精选推送',
            subject: '{{title}}',
            html: '<div style="padding: 20px 0; font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #d4af37; text-align: center; margin-bottom: 10px;">本周精选壁纸</h2><p style="color: #666; font-size: 14px; margin: 0 0 20px; text-align: center;">为您精选本周 3 张好运壁纸：</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;"><tr><td width="100%" style="vertical-align: top;"><img src="{{img1}}" alt="{{title1}}" width="280" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block; margin: 0 auto;"><p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">{{title1}}</p></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;"><tr><td width="49%" style="vertical-align: top; padding-right: 2%;"><img src="{{img2}}" alt="{{title2}}" width="280" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block;"><p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">{{title2}}</p></td><td width="49%" style="vertical-align: top; padding-left: 2%;"><img src="{{img3}}" alt="{{title3}}" width="280" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block;"><p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">{{title3}}</p></td></tr></table><div style="text-align: center; margin-top: 25px;"><a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">下载高清大图 &rarr;</a></div><p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">&copy; 2026 DAO Essence</p></div>'
        },
        {
            id: 'custom',
            name: '自定义邮件',
            subject: '',
            html: '<div style="padding: 20px 0;"><p style="color: #666; font-size: 14px;">亲爱的 {{name}}：</p><p style="color: #333; line-height: 1.8;">在这里写你的邮件内容...</p><p style="color: #333; line-height: 1.8;">支持 <strong>HTML 格式</strong>。</p><p style="color: #999; font-size: 12px; margin-top: 20px;">可用变量：{{name}}（收件人姓名）、{{email}}（收件人邮箱）</p></div>'
        }
    ];

    // ========== 渲染主面板 ==========
    function render() {
        const container = document.getElementById('marketingTabContent');
        if (!container) return;

        container.innerHTML = `
        <!-- 统计栏 -->
        <div class="stats-bar" id="marketingStats">
            <div class="stat-card"><h3 id="statTotal">-</h3><p>总收件人</p></div>
            <div class="stat-card"><h3 id="statOrders">-</h3><p>订单客户</p></div>
            <div class="stat-card"><h3 id="statContact">-</h3><p>联系表单</p></div>
            <div class="stat-card"><h3 id="statHistory">-</h3><p>已发送</p></div>
        </div>

        <!-- 两栏布局 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- 左栏：收件人 -->
            <div>
                <div class="orders-table">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: #d4af37; margin: 0;">收件人列表</h3>
                        <div><button class="btn btn-primary" onclick="MP.loadSubscribers()" style="padding: 6px 14px; font-size: 0.85rem;">刷新</button></div>
                    </div>
                    <div style="padding: 10px;">
                        <input type="text" id="subSearchInput" placeholder="搜索邮箱或姓名..." style="width: 100%; padding: 8px 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit; margin-bottom: 8px;" oninput="MP.filterSubscribers()">
                        <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                            <select id="subSourceFilter" onchange="MP.filterSubscribers()" style="padding: 6px 10px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                                <option value="">全部来源</option>
                                <option value="bazi_order">八字订单</option>
                                <option value="shop_order">商城订单</option>
                                <option value="almanac_order">黄历解锁</option>
                                <option value="contact_form">联系表单</option>
                                <option value="wuxing_quiz">五行测试</option>
                                <option value="manual">手动添加</option>
                            </select>
                            <button class="btn" onclick="MP.showAddSubscriber()" style="padding: 6px 12px; background: rgba(76,175,80,0.15); color: #4caf50; font-size: 0.8rem;">+ 添加</button>
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
                        <h3 style="color: #d4af37; margin: 0 0 12px;">编辑邮件</h3>
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">选择模板</label>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="templateButtons">
                                ${TEMPLATES.map(t => '<button class="btn" onclick="MP.loadTemplate(&quot;' + t.id + '&quot;)" style="padding: 6px 12px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.1);">' + t.name + '</button>').join('')}
                            </div>
                        </div>
                        <div id="wallpaperSmartPanel" style="display:none; margin-bottom: 12px; padding: 10px; background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px;">
                            <label style="color: #d4af37; font-size: 0.85rem; display: block; margin-bottom: 6px;">推送主题（自动匹配壁纸并生成标题）</label>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <select id="wpTopicSelect" style="flex:1; padding: 8px; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(0,0,0,0.3); color: #e8e8e8; font-family: inherit;">
                                    <option value="general">综合好运壁纸</option>
                                    <option value="love">旺桃花壁纸</option>
                                    <option value="wealth">旺财运壁纸</option>
                                    <option value="study">学业/上岸壁纸</option>
                                    <option value="energy">净化磁场/能量壁纸</option>
                                </select>
                                <button id="btnSmartFill" class="btn" onclick="MP.smartFillWallpapers()" style="padding: 8px 16px; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; font-weight: bold; border: none; white-space: nowrap;">一键抓取 (不重复)</button>
                            </div>
                        </div>
                        <div id="templateVarsContainer" style="display: none; margin-bottom: 12px;"></div>
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">邮件主题</label>
                            <input type="text" id="emailSubject" placeholder="输入邮件主题..." style="width: 100%; padding: 10px 14px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                        </div>
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">预览邮箱（先发一封给自己看看效果）</label>
                            <input type="email" id="previewEmail" placeholder="你的邮箱..." style="width: 100%; padding: 10px 14px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                        </div>
                    </div>
                    <div style="padding: 10px 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="color: #888; font-size: 0.85rem;">邮件内容 (HTML)</label>
                            <div style="display: flex; gap: 6px;">
                                <button class="btn" onclick="MP.insertImage()" style="padding: 4px 10px; background: rgba(212,175,55,0.15); color: #d4af37; font-size: 0.8rem;">插入图片</button>
                                <button class="btn" id="deleteImageBtn" onclick="MP.deleteLastImage()" style="display:none;padding: 4px 10px; background: rgba(239,83,80,0.15); color: #ef5350; font-size: 0.8rem;">删除图片</button>
                                <button class="btn" onclick="MP.togglePreview()" style="padding: 4px 10px; background: rgba(255,255,255,0.05); color: #888; font-size: 0.8rem;">预览</button>
                            </div>
                        </div>
                        <div id="imageStatus" style="display: none; margin-bottom: 6px; padding: 6px 10px; background: rgba(212,175,55,0.1); border-radius: 4px; color: #d4af37; font-size: 0.78rem;"></div>
                        <textarea id="emailContent" rows="12" style="width: 100%; padding: 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(0,0,0,0.3); color: #e8e8e8; font-family: 'Consolas', monospace; font-size: 0.85rem; resize: vertical; line-height: 1.6;" placeholder="支持 HTML 格式。可用变量：{{name}}, {{email}}"></textarea>
                        <div id="emailPreview" style="display: none; margin-top: 10px; background: rgba(255,255,255,0.95); border-radius: 8px; padding: 20px; min-height: 200px; color: #333;"></div>
                    </div>
                    <div style="padding: 15px; border-top: 1px solid rgba(212,175,55,0.2); display: flex; gap: 10px;">
                        <button class="btn" onclick="MP.sendPreview()" style="background: rgba(100,181,246,0.2); color: #64b5f6; flex: 1;">发送预览</button>
                        <button class="btn btn-primary" onclick="MP.confirmSend()" style="flex: 1;" id="sendBtn">发送给选中的收件人</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 发送记录 -->
        <div class="orders-table" style="margin-top: 20px;">
            <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                <h3 style="color: #d4af37; margin: 0;">发送记录</h3>
            </div>
            <div id="sendHistoryList" style="padding: 15px;">
                <p style="text-align: center; color: #666;">暂无发送记录</p>
            </div>
        </div>
        `;
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
                headers: { 'Authorization': 'Bearer ' + window.adminKey }
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
                if (listEl) listEl.innerHTML = '<p style="text-align: center; color: #ef5350;">加载失败: ' + data.error + '</p>';
            }
        } catch (err) {
            console.error('MP: 加载订阅者失败', err);
            if (listEl) listEl.innerHTML = '<p style="text-align: center; color: #ef5350;">网络错误: ' + err.message + '</p>';
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
            const sourceColor = s.source === 'bazi_order' ? '#4caf50' : s.source === 'shop_order' ? '#ff9800' : s.source === 'almanac_order' ? '#9c27b0' : s.source === 'contact_form' ? '#2196f3' : s.source === 'wuxing_quiz' ? '#64b5f6' : '#ff9800';
            return '<div style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer;" onclick="MP.toggleSelect(&quot;' + s.email + '&quot;)">' +
                '<input type="checkbox" ' + checked + ' onclick="event.stopPropagation(); MP.toggleSelect(&quot;' + s.email + '&quot;)" style="accent-color: #d4af37;">' +
                '<div style="flex: 1; min-width: 0;"><div style="color: #e8e8e8; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + (s.name || '未命名') + '</div>' +
                '<div style="color: #666; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + s.email + '</div></div>' +
                '<span style="font-size: 0.7rem; color: ' + sourceColor + '; background: ' + sourceColor + '20; padding: 2px 8px; border-radius: 10px; white-space: nowrap;">' + (s.sourceLabel || s.source) + '</span></div>';
        }).join('');
        updateSelectedCount();
    }

    // ========== 过滤 ==========
    function getFilteredSubscribers() {
        const search = (document.getElementById('subSearchInput')?.value || '').toLowerCase();
        const source = document.getElementById('subSourceFilter')?.value || '';
        return subscribers.filter(s => {
            const matchSearch = !search || (s.email && s.email.toLowerCase().includes(search)) || (s.name && s.name.toLowerCase().includes(search));
            const matchSource = !source || s.source === source;
            return matchSearch && matchSource;
        });
    }
    function filterSubscribers() { renderSubscribers(); }

    // ========== 选择 ==========
    function toggleSelect(email) {
        if (selectedEmails.has(email)) selectedEmails.delete(email);
        else selectedEmails.add(email);
        renderSubscribers();
    }
    function selectAll() {
        getFilteredSubscribers().forEach(s => selectedEmails.add(s.email));
        renderSubscribers();
    }
    function deselectAll() { selectedEmails.clear(); renderSubscribers(); }
    function updateSelectedCount() {
        const el = document.getElementById('selectedCount');
        if (el) el.textContent = selectedEmails.size;
    }

    // ========== 手动添加订阅者 ==========
    function showAddSubscriber() {
        const existing = document.getElementById('addSubscriberModal');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'addSubscriberModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = '<div style="background:#1a1a2e;border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:30px;width:400px;max-width:90vw;">' +
            '<h3 style="color:#d4af37;margin:0 0 20px;font-size:1.1rem;">添加订阅者</h3>' +
            '<div style="margin-bottom:14px;"><label style="color:#888;font-size:0.85rem;display:block;margin-bottom:6px;">姓名（可选）</label>' +
            '<input type="text" id="addSubName" placeholder="输入姓名..." style="width:100%;padding:10px 14px;border:1px solid rgba(212,175,55,0.2);border-radius:8px;background:rgba(255,255,255,0.05);color:#e8e8e8;font-family:inherit;"></div>' +
            '<div style="margin-bottom:20px;"><label style="color:#888;font-size:0.85rem;display:block;margin-bottom:6px;">邮箱 <span style="color:#ef5350;">*</span></label>' +
            '<input type="email" id="addSubEmail" placeholder="输入邮箱地址..." style="width:100%;padding:10px 14px;border:1px solid rgba(212,175,55,0.2);border-radius:8px;background:rgba(255,255,255,0.05);color:#e8e8e8;font-family:inherit;">' +
            '<div id="addSubError" style="color:#ef5350;font-size:0.8rem;margin-top:6px;display:none;"></div></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button onclick="document.getElementById(&quot;addSubscriberModal&quot;).remove()" style="padding:10px 20px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#888;cursor:pointer;font-family:inherit;">取消</button>' +
            '<button onclick="MP.addSubscriber()" style="padding:10px 20px;border:none;border-radius:8px;background:linear-gradient(135deg,#4caf50,#388e3c);color:#fff;cursor:pointer;font-weight:600;font-family:inherit;">确认添加</button></div></div>';
        document.body.appendChild(modal);
        modal.querySelector('#addSubEmail').addEventListener('keydown', e => { if (e.key === 'Enter') MP.addSubscriber(); });
        modal.querySelector('#addSubName').addEventListener('keydown', e => { if (e.key === 'Enter') modal.querySelector('#addSubEmail').focus(); });
        modal.querySelector('#addSubName').focus();
    }

    async function addSubscriber() {
        const nameEl = document.getElementById('addSubName');
        const emailEl = document.getElementById('addSubEmail');
        const errorEl = document.getElementById('addSubError');
        const name = nameEl?.value?.trim() || '';
        const email = emailEl?.value?.trim() || '';
        if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
            errorEl.textContent = '请输入有效的邮箱地址';
            errorEl.style.display = 'block';
            return;
        }
        try {
            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.adminKey },
                body: JSON.stringify({ addSubscriber: { name, email } })
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('addSubscriberModal')?.remove();
                alert('已添加订阅者：' + email);
                loadSubscribers();
            } else {
                errorEl.textContent = data.error || '添加失败';
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.textContent = '网络错误: ' + err.message;
            errorEl.style.display = 'block';
        }
    }

    // ========== 图片插入 ==========
    function insertImage() {
        const existing = document.getElementById('insertImageModal');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'insertImageModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = '<div style="background:#1a1a2e;border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:30px;width:440px;max-width:90vw;">' +
            '<h3 style="color:#d4af37;margin:0 0 6px;font-size:1.1rem;">插入图片</h3>' +
            '<p style="color:#888;font-size:0.78rem;margin:0 0 16px;">支持 JPG/PNG/GIF，图片会自动压缩至 600px 宽，单张 &lt;500KB</p>' +
            '<div id="imgDropZone" onclick="document.getElementById(&quot;imgFileInput&quot;).click()" style="border:2px dashed rgba(212,175,55,0.3);border-radius:10px;padding:30px;text-align:center;cursor:pointer;margin-bottom:14px;transition:all 0.2s;">' +
            '<div style="font-size:2rem;margin-bottom:8px;">📷</div>' +
            '<p style="color:#d4af37;margin:0;font-size:0.9rem;">点击选择图片或拖拽至此处</p>' +
            '<p style="color:#666;margin:6px 0 0;font-size:0.75rem;">JPG / PNG / GIF，最大 2MB（压缩前）</p></div>' +
            '<input type="file" id="imgFileInput" accept="image/jpeg,image/png,image/gif" style="display:none;" onchange="MP.handleImageFile(this.files[0])">' +
            '<div id="imgPreviewArea" style="display:none;margin-bottom:14px;text-align:center;">' +
            '<img id="imgPreview" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid rgba(212,175,55,0.2);">' +
            '<p id="imgSizeInfo" style="color:#888;font-size:0.78rem;margin:8px 0 0;"></p></div>' +
            '<div id="imgAltRow" style="display:none;margin-bottom:14px;">' +
            '<label style="color:#888;font-size:0.85rem;display:block;margin-bottom:6px;">替代文本（Alt Text）</label>' +
            '<input type="text" id="imgAltText" placeholder="描述图片内容，用于无法加载图片时显示..." style="width:100%;padding:10px 14px;border:1px solid rgba(212,175,55,0.2);border-radius:8px;background:rgba(255,255,255,0.05);color:#e8e8e8;font-family:inherit;"></div>' +
            '<div id="imgInsertError" style="color:#ef5350;font-size:0.8rem;margin-bottom:10px;display:none;"></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
            '<button onclick="document.getElementById(&quot;insertImageModal&quot;).remove()" style="padding:10px 20px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#888;cursor:pointer;font-family:inherit;">取消</button>' +
            '<button id="imgInsertBtn" onclick="MP.confirmInsertImage()" disabled style="padding:10px 20px;border:none;border-radius:8px;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a2e;cursor:pointer;font-weight:600;font-family:inherit;opacity:0.5;">插入到邮件</button></div></div>';
        document.body.appendChild(modal);
        const dropZone = modal.querySelector('#imgDropZone');
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#d4af37'; dropZone.style.background = 'rgba(212,175,55,0.05)'; });
        dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'rgba(212,175,55,0.3)'; dropZone.style.background = 'transparent'; });
        dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.style.borderColor = 'rgba(212,175,55,0.3)'; dropZone.style.background = 'transparent'; if (e.dataTransfer?.files?.[0]) MP.handleImageFile(e.dataTransfer.files[0]); });
        modal._processedBase64 = null;
        modal._processedWidth = 0;
    }

    async function handleImageFile(file) {
        const errorEl = document.getElementById('imgInsertError');
        const previewArea = document.getElementById('imgPreviewArea');
        const altRow = document.getElementById('imgAltRow');
        const insertBtn = document.getElementById('imgInsertBtn');
        const modal = document.getElementById('insertImageModal');
        errorEl.style.display = 'none';
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            errorEl.textContent = '仅支持 JPG、PNG、GIF 格式';
            errorEl.style.display = 'block'; return;
        }
        if (file.size > 2 * 1024 * 1024) {
            errorEl.textContent = '图片过大，请选择小于 2MB 的图片';
            errorEl.style.display = 'block'; return;
        }
        try {
            const result = await compressImage(file, 600, 500 * 1024);
            if (modal) { modal._processedBase64 = result.base64; modal._processedWidth = result.width; }
            const previewImg = document.getElementById('imgPreview');
            const sizeInfo = document.getElementById('imgSizeInfo');
            if (previewImg) previewImg.src = result.base64;
            if (sizeInfo) sizeInfo.textContent = result.width + ' x ' + result.height + 'px';
            if (previewArea) previewArea.style.display = 'block';
            if (altRow) altRow.style.display = 'block';
            if (insertBtn) { insertBtn.disabled = false; insertBtn.style.opacity = '1'; }
            checkImageSize();
        } catch (err) {
            errorEl.textContent = '图片处理失败: ' + err.message;
            errorEl.style.display = 'block';
        }
    }

    function compressImage(file, maxWidth, maxSizeBytes) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error('图片解析失败'));
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                    canvas.width = w; canvas.height = h;
                    ctx.drawImage(img, 0, 0, w, h);
                    let quality = 0.85;
                    let base64 = canvas.toDataURL('image/jpeg', quality);
                    while (base64.length * 3 / 4 > maxSizeBytes && quality > 0.3) {
                        quality -= 0.05;
                        base64 = canvas.toDataURL('image/jpeg', Math.max(quality, 0.3));
                    }
                    resolve({ base64, width: w, height: h });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function confirmInsertImage() {
        const modal = document.getElementById('insertImageModal');
        if (!modal || !modal._processedBase64) return;
        const alt = document.getElementById('imgAltText')?.value?.trim() || 'DAO Essence';
        const imgTag = '<img src="' + modal._processedBase64 + '" alt="' + alt + '" style="max-width:600px;width:100%;height:auto;border-radius:8px;display:block;margin:15px auto;">';
        const textarea = document.getElementById('emailContent');
        if (!textarea) return;
        const value = textarea.value;
        const firstTagIndex = value.search(/<[a-zA-Z]/);
        if (firstTagIndex >= 0) {
            textarea.value = value.substring(0, firstTagIndex) + imgTag + '\n\n' + value.substring(firstTagIndex);
        } else {
            textarea.value = imgTag + '\n\n' + value;
        }
        modal.remove();
        checkImageSize();
    }

    function deleteLastImage() {
        const textarea = document.getElementById('emailContent');
        if (!textarea) return;
        const content = textarea.value;
        const imgRegex = /<img\s[^>]*src="data:image\/[^"]+;base64,[^"]*"[^>]*>\n?/g;
        const matches = [...content.matchAll(imgRegex)];
        if (matches.length === 0) { alert('没有找到图片'); return; }
        textarea.value = content.replace(imgRegex, '').replace(/\n{3,}/g, '\n\n').trim();
        checkImageSize();
    }

    function checkImageSize() {
        const content = document.getElementById('emailContent')?.value || '';
        const statusEl = document.getElementById('imageStatus');
        if (!statusEl) return;
        const base64Matches = content.match(/src="data:image\/[^;]+;base64,[A-Za-z0-9+/=]+"/g) || [];
        let totalBytes = 0;
        base64Matches.forEach(match => { const b64 = match.match(/base64,([A-Za-z0-9+/=]+)/); if (b64) totalBytes += b64[1].length * 3 / 4; });
        if (base64Matches.length === 0) {
            statusEl.style.display = 'none';
            const delBtn = document.getElementById('deleteImageBtn');
            if (delBtn) delBtn.style.display = 'none';
        } else {
            const totalKB = Math.round(totalBytes / 1024);
            statusEl.style.display = 'block';
            statusEl.textContent = '已插入 ' + base64Matches.length + ' 张图片，Base64 总大小约 ' + (totalKB > 1024 ? (totalKB / 1024).toFixed(1) + 'MB' : totalKB + 'KB');
            const delBtn = document.getElementById('deleteImageBtn');
            if (delBtn) delBtn.style.display = 'inline-block';
        }
    }

    // ========== 模板变量处理 ==========
    let templateVars = {};
    function extractVars(html, subject) {
        const all = (html + ' ' + (subject || '')).match(/\{\{(\w+)\}\}/g) || [];
        const vars = new Set();
        all.forEach(v => { const name = v.replace(/\{\{|\}\}/g, ''); if (!['name', 'email'].includes(name)) vars.add(name); });
        return [...vars];
    }
    const VAR_LABELS = { title: '标题', description: '描述', discount: '折扣信息', validity: '有效期', link: '链接', greeting: '祝福语', emoji: '表情符号', message: '自定义消息', cta: '按钮文字', subtitle: '副标题', code: '优惠码' };
    const VAR_PLACEHOLDERS = { title: '例如：春季八字解读限时优惠', description: '例如：活动详情描述...', discount: '例如：全场 8 折 / 限时立减50元', validity: '例如：活动时间：2026年6月17日-6月20日', link: 'https://www.daoessentia.com', greeting: '例如：新春快乐 / 端午安康', emoji: '', message: '例如：祝你新的一年万事如意！', cta: '立即查看 →', subtitle: '例如：专属于您的优惠', code: '例如：DAO2026' };

    function loadTemplate(id) {
        const tpl = TEMPLATES.find(t => t.id === id);
        if (!tpl) return;
        const subjectEl = document.getElementById('emailSubject');
        const contentEl = document.getElementById('emailContent');
        if (subjectEl) subjectEl.value = tpl.subject;
        if (contentEl) contentEl.value = tpl.html;
        templateVars = {};
        const vars = extractVars(tpl.html, tpl.subject);
        const varsContainer = document.getElementById('templateVarsContainer');
        if (varsContainer) {
            if (vars.length === 0) { varsContainer.innerHTML = ''; varsContainer.style.display = 'none'; }
            else {
                varsContainer.style.display = 'block';
                varsContainer.innerHTML = '<div style="margin-bottom: 12px;"><label style="color: #d4af37; font-size: 0.85rem; display: block; margin-bottom: 8px;">填写模板变量</label>' +
                    vars.map(v => '<div style="margin-bottom: 8px;"><label style="color: #888; font-size: 0.78rem; display: block; margin-bottom: 3px;">' + (VAR_LABELS[v] || v) + ' ({{' + v + '}})</label>' +
                    '<input type="text" class="tpl-var-input" data-var="' + v + '" placeholder="' + (VAR_PLACEHOLDERS[v] || '输入' + (VAR_LABELS[v] || v) + '...') + '" oninput="MP.onVarChange(&quot;' + v + '&quot;, this.value)" style="width: 100%; padding: 8px 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit; font-size: 0.85rem;"></div>').join('') + '</div>';
            }
        }
        document.querySelectorAll('#templateButtons button').forEach(btn => { btn.style.borderColor = 'rgba(255,255,255,0.1)'; btn.style.background = 'rgba(255,255,255,0.05)'; });
        const btns = document.querySelectorAll('#templateButtons button');
        const idx = TEMPLATES.findIndex(t => t.id === id);
        if (btns[idx]) { btns[idx].style.borderColor = '#d4af37'; btns[idx].style.background = 'rgba(212,175,55,0.15)'; }
        const smartPanel = document.getElementById('wallpaperSmartPanel');
        if (smartPanel) smartPanel.style.display = (id === 'wallpaper_digest') ? 'block' : 'none';
    }
    function onVarChange(varName, value) { templateVars[varName] = value; }
    function syncTemplateVarsFromInputs() {
        document.querySelectorAll('.tpl-var-input').forEach(input => {
            const varName = input.dataset.var;
            if (varName && input.value) templateVars[varName] = input.value;
        });
    }
    function applyTemplateVars(content) {
        let result = content;
        for (const [key, value] of Object.entries(templateVars)) {
            if (value) result = result.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), value);
        }
        return result;
    }
    function extractBase64Images(htmlContent) {
        const images = [];
        let cidHtml = htmlContent;
        let imgIndex = 0;
        cidHtml = cidHtml.replace(/src="(data:image\/(jpeg|jpg|png|gif);base64,([^"]+))"/gi, (match, fullSrc, mime, b64) => {
            const cid = 'img_' + imgIndex;
            images.push({ filename: 'image_' + imgIndex + '.' + (mime === 'jpeg' || mime === 'jpg' ? 'jpg' : mime === 'png' ? 'png' : 'gif'), content: b64, encoding: 'base64', cid: cid });
            imgIndex++;
            return 'src="cid:' + cid + '"';
        });
        return { htmlContent: cidHtml, images };
    }

    // ========== 预览 ==========
    function togglePreview() {
        const contentEl = document.getElementById('emailContent');
        const previewEl = document.getElementById('emailPreview');
        if (!contentEl || !previewEl) return;
        if (previewEl.style.display === 'none') {
            syncTemplateVarsFromInputs();
            let previewHtml = applyTemplateVars(contentEl.value);
            const firstSub = subscribers.find(s => selectedEmails.has(s.email)) || { name: '张三', email: 'test@example.com' };
            previewHtml = previewHtml.replace(/\{\{name\}\}/g, firstSub.name || 'Friend');
            previewHtml = previewHtml.replace(/\{\{email\}\}/g, firstSub.email);
            previewEl.innerHTML = '<div style="max-width: 600px; margin: 0 auto;">' +
                '<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">' +
                '<h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 3px;">DAO ESSENCE</h1>' +
                '<p style="color: #c9b99a; margin: 8px 0 0; font-size: 14px;">道本精酿 · 古道能量</p></div>' +
                '<div style="padding: 30px; background: #fff; border-left: 1px solid #eee; border-right: 1px solid #eee;">' + previewHtml + '</div>' +
                '<div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">' +
                '<p style="color: #c9b99a; margin: 0; font-size: 12px;">© 2026 DAO Essence · www.daoessentia.com</p></div></div>';
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
        if (!previewEmail) { alert('请输入预览邮箱'); return; }
        if (!subject) { alert('请输入邮件主题'); return; }
        if (!htmlContent) { alert('请输入邮件内容'); return; }
        syncTemplateVarsFromInputs();
        htmlContent = applyTemplateVars(htmlContent);
        subject = applyTemplateVars(subject);
        const { htmlContent: cidHtml, images } = extractBase64Images(htmlContent);
        const btn = document.getElementById('sendBtn');
        if (btn) { btn.disabled = true; btn.textContent = '发送中...'; }
        try {
            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.adminKey },
                body: JSON.stringify({ preview: true, to: previewEmail, subject, htmlContent: cidHtml, images })
            });
            const data = await res.json();
            if (data.success) { alert('预览邮件已发送至 ' + previewEmail); }
            else { alert('发送失败: ' + data.error); }
        } catch (err) { alert('网络错误: ' + err.message); }
        finally { if (btn) { btn.disabled = false; btn.textContent = '发送给选中的收件人'; } }
    }

    // ========== 确认发送 ==========
    async function confirmSend() {
        const subject = document.getElementById('emailSubject')?.value?.trim();
        const htmlContent = document.getElementById('emailContent')?.value?.trim();
        if (!subject) { alert('请输入邮件主题'); return; }
        if (!htmlContent) { alert('请输入邮件内容'); return; }
        if (selectedEmails.size === 0) { alert('请先选择收件人'); return; }
        const confirmed = confirm('确认发送给 ' + selectedEmails.size + ' 位收件人？\n主题: ' + subject);
        if (!confirmed) return;
        syncTemplateVarsFromInputs();
        const recipients = subscribers.filter(s => selectedEmails.has(s.email));
        const btn = document.getElementById('sendBtn');
        if (btn) { btn.disabled = true; btn.textContent = '发送中 (0/' + recipients.length + ')...'; }
        try {
            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.adminKey },
                body: JSON.stringify({ bulkSend: true, recipients, subject, htmlContent, templateVars })
            });
            const data = await res.json();
            if (data.success) {
                alert('发送完成！成功: ' + data.sent + ' / 失败: ' + data.failed);
                sendHistory.unshift({ date: new Date().toISOString(), subject, sent: data.sent, failed: data.failed, recipients: recipients.length });
                updateStats({ total: subscribers.length, baziOrders: 0, contactForm: 0 });
            } else { alert('发送失败: ' + data.error); }
        } catch (err) { alert('网络错误: ' + err.message); }
        finally { if (btn) { btn.disabled = false; btn.textContent = '发送给选中的收件人'; } }
    }

    // ========== 壁纸智能填充 ==========
    async function smartFillWallpapers() {
        const btn = document.getElementById('btnSmartFill');
        if (btn) { btn.disabled = true; btn.textContent = '抓取中...'; }
        try {
            const topic = document.getElementById('wpTopicSelect')?.value || 'general';
            const res = await fetch('/api/marketing', {
                headers: { 'Authorization': 'Bearer ' + window.adminKey }
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || '获取壁纸失败');
            // Filter wallpapers by topic and limit to 3
            let wallpapers = (data.wallpapers || []).filter(w => {
                if (topic === 'general') return true;
                const tags = (w.tags || '').toLowerCase();
                if (topic === 'love') return tags.includes('love') || tags.includes('桃花');
                if (topic === 'wealth') return tags.includes('wealth') || tags.includes('财') || tags.includes('富');
                if (topic === 'study') return tags.includes('study') || tags.includes('学业') || tags.includes('考');
                if (topic === 'energy') return tags.includes('energy') || tags.includes('能量') || tags.includes('净化');
                return true;
            });
            // Deduplicate: exclude recently sent wallpapers
            const history = data.sentHistory || [];
            wallpapers = wallpapers.filter(w => !history.includes(w.id));
            // Limit to 3
            wallpapers = wallpapers.slice(0, 3);
            if (wallpapers.length === 0) throw new Error('没有符合条件的壁纸');
            // Generate title
            const topicTitles = { general: '本周综合好运壁纸精选', love: '本周旺桃花壁纸精选', wealth: '本周旺财运壁纸精选', study: '本周学业/上岸壁纸精选', energy: '本周净化能量壁纸精选' };
            const mainTitle = topicTitles[topic] || '本周精选壁纸';
            let html = '<div style="padding: 20px 0; font-family: sans-serif; max-width: 600px; margin: 0 auto;">';
            html += '<h2 style="color: #d4af37; text-align: center; margin-bottom: 10px;">' + mainTitle + '</h2>';
            html += '<p style="color: #666; font-size: 14px; margin: 0 0 20px; text-align: center;">为您精选 ' + wallpapers.length + ' 张好运壁纸：</p>';
            wallpapers.forEach((wp, idx) => {
                const imgUrl = wp.thumbnail || wp.imageUrl || '';
                html += '<div style="text-align: center; margin-bottom: 15px;">';
                html += '<img src="' + imgUrl + '" alt="' + (wp.title || wp.titleZh || 'Lucky Wallpaper') + '" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block; margin: 0 auto;">';
                html += '<p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">' + (wp.title || wp.titleZh || 'Lucky Wallpaper') + '</p>';
                html += '</div>';
            });
            html += '<div style="text-align: center; margin-top: 25px;">';
            html += '<a href="https://www.daoessentia.com/wallpaper" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">下载高清大图 →</a></div>';
            html += '<p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">© 2026 DAO Essence</p></div>';
            document.getElementById('emailSubject').value = mainTitle;
            document.getElementById('emailContent').value = html;
            document.getElementById('templateVarsContainer').style.display = 'none';
            alert('成功抓取 ' + wallpapers.length + ' 张壁纸！请在左侧勾选收件人，然后点击【发送给选中的收件人】即可群发。');
        } catch (err) { alert('抓取失败: ' + err.message); }
        finally { if (btn) { btn.disabled = false; btn.textContent = '一键抓取 (不重复)'; } }
    }

    // ========== 渲染发送记录 ==========
    function renderSendHistory() {
        const listEl = document.getElementById('sendHistoryList');
        if (!listEl) return;
        if (sendHistory.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #666;">暂无发送记录</p>';
            return;
        }
        listEl.innerHTML = sendHistory.map(h => '<div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.03);">' +
            '<div style="color: #e8e8e8; font-size: 0.9rem;">' + h.subject + '</div>' +
            '<div style="color: #888; font-size: 0.8rem;">' + new Date(h.date).toLocaleString() + ' · ' + h.recipients + ' 位收件人 · 成功 ' + h.sent + ' / 失败 ' + h.failed + '</div></div>').join('');
    }

    // ========== 暴露到全局 ==========
    window.MP = {
        loadSubscribers, filterSubscribers, toggleSelect, selectAll, deselectAll,
        showAddSubscriber, addSubscriber,
        insertImage, handleImageFile, confirmInsertImage, deleteLastImage, checkImageSize,
        loadTemplate, onVarChange, syncTemplateVarsFromInputs, applyTemplateVars,
        togglePreview, sendPreview, confirmSend,
        render, smartFillWallpapers
    };

    // ========== 自动初始化 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }

})();
