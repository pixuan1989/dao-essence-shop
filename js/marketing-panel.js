/**
 * ============================================
 * DAO Essence - 钀ラ攢閭欢闈㈡澘
 * 鐙珛妯″潡锛屾寕杞藉埌 bazi-orders.html 鐨?marketing Tab
 * ============================================
 * 
 * 渚濊禆锛氬叏灞€鍙橀噺 adminKey锛堢敱 bazi-orders.html 鎻愪緵锛?
 * API锛?api/marketing (GET=璁㈤槄鑰呭垪琛? POST=鍙戦€侀偖浠?
 */

(function() {
    'use strict';

    // ========== 鐘舵€?==========
    let subscribers = [];
    let sendHistory = [];
    let selectedEmails = new Set();

    // ========== 閭欢妯℃澘 ==========
    const TEMPLATES = [
        {
            id: 'new_article',
            name: '馃摪 鏂版枃绔犳帹閫?,
            subject: '鏂版枃绔犲彂甯?- {{title}}',
            html: `<div style="padding: 20px 0;">
<h2 style="color: #d4af37;">{{title}}</h2>
<p style="color: #666; font-size: 14px; margin: 10px 0;">{{name}}锛屼綘濂斤紒</p>
<p style="color: #333; line-height: 1.8;">鎴戜滑鍒氬垰鍙戝竷浜嗘柊鏂囩珷锛屽揩鏉ョ湅鐪嬪惂锛?/p>
<div style="margin: 25px 0; text-align: center;">
    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">闃呰鍏ㄦ枃 鈫?/a>
</div>
</div>`
        },
        {
            id: 'promotion',
            name: '馃帀 淇冮攢娲诲姩',
            subject: '闄愭椂浼樻儬 - {{title}}',
            html: `<div style="padding: 20px 0;">
<h2 style="color: #d4af37;">{{title}}</h2>
<p style="color: #666; font-size: 14px; margin: 10px 0;">浜茬埍鐨?{{name}}锛?/p>
<p style="color: #333; line-height: 1.8;">{{description}}</p>
<div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
    <p style="color: #16a34a; font-size: 28px; font-weight: 700; margin: 0;">{{discount}}</p>
    <p style="color: #166534; margin: 8px 0 0;">{{validity}}</p>
</div>
<div style="text-align: center; margin: 20px 0;">
    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #059669); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">绔嬪嵆鎶㈣喘 鈫?/a>
</div>
</div>`
        },
        {
            id: 'festival',
            name: '馃彯 鑺傛棩绁濈',
            subject: '{{greeting}} - DAO Essence',
            html: `<div style="padding: 20px 0;">
<div style="text-align: center; font-size: 48px; margin: 20px 0;">{{emoji}}</div>
<h2 style="color: #d4af37; text-align: center;">{{greeting}}</h2>
<p style="color: #666; font-size: 14px; margin: 15px 0; text-align: center;">浜茬埍鐨?{{name}}锛?/p>
<p style="color: #333; line-height: 1.8; text-align: center;">{{message}}</p>
<div style="text-align: center; margin: 25px 0;">
    <p style="color: #888; font-size: 13px;">DAO Essence 鍥㈤槦 鏁笂</p>
</div>
</div>`
        },
        {
            id: 'wallpaper_digest',
            name: '澹佺焊绮鹃€夋帹閫?,
            subject: '{{title}}',
            html: `<div style="padding: 20px 0; font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4af37; text-align: center; margin-bottom: 10px;">鏈懆绮鹃€夊绾?/h2>
    <p style="color: #666; font-size: 14px; margin: 0 0 20px; text-align: center;">涓烘偍绮鹃€夋湰鍛?3 寮犲ソ杩愬绾革細</p>
    <p style="color: #555; font-size: 13px; margin: 0 0 15px; line-height: 1.6; text-align: justify; padding: 0 10px;">鎴戜滑涓烘偍绮鹃€変簡鏈懆鏈€鍙楁杩庣殑鐜勫澹佺焊锛屾兜鐩栨嫑璐€佹鑺便€佸涓氱瓑涓婚銆傛瘡涓€寮犻兘缁忚繃绮惧績璁捐锛屽笇鏈涜兘涓烘偍鐨勪竴澶╂敞鍏ユ鑳介噺涓庡ソ杩愩€傝鏌ユ敹浠ヤ笅绮鹃€夊唴瀹癸細</p>

    <!-- 绗?1 寮?(澶у浘) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
        <tr>
            <td width="100%" style="vertical-align: top;">
                <img src="{{img1}}" alt="{{title1}}" width="280" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block; margin: 0 auto;">
                <p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">{{title1}}</p>
            </td>
        </tr>
    </table>

    <!-- 绗?2-3 寮?-->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
            <td width="49%" style="vertical-align: top; padding-right: 2%;">
                <img src="{{img2}}" alt="{{title2}}" width="280" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block;">
                <p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">{{title2}}</p>
            </td>
            <td width="49%" style="vertical-align: top; padding-left: 2%;">
                <img src="{{img3}}" alt="{{title3}}" width="280" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; display: block;">
                <p style="margin: 8px 0 0; font-size: 13px; color: #333; font-weight: 600; text-align: center;">{{title3}}</p>
            </td>
        </tr>
    </table>

    <!-- 搴曢儴鎸夐挳 -->
    <div style="text-align: center; margin-top: 25px;">
        <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">涓嬭浇楂樻竻澶у浘 鈫?/a>
    </div>
    <p style="color: #888; font-size: 12px; margin: 20px 0 10px; line-height: 1.5;">濡傛灉鎮ㄥ笇鏈涙煡鐪嬫洿澶氱簿缇庡绾革紝鎴栧鎴戜滑鐨勫唴瀹规湁浠讳綍寤鸿锛屾杩庨殢鏃惰闂垜浠殑缃戠珯鎴栧洖澶嶆湰閭欢銆傛劅璋㈡偍鐨勬敮鎸侊紒</p>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">漏 2026 DAO Essence 路 <a href="https://www.daoessentia.com" style="color: #667eea;">www.daoessentia.com</a></p>
</div>`
        },
        {
            id: 'custom',
            name: '鉁忥笍 鑷畾涔夐偖浠?,
            subject: '',
            html: `<div style="padding: 20px 0;">
<p style="color: #666; font-size: 14px;">浜茬埍鐨?{{name}}锛?/p>
<p style="color: #333; line-height: 1.8;">鍦ㄨ繖閲屽啓浣犵殑閭欢鍐呭...</p>
<p style="color: #333; line-height: 1.8;">鏀寔 <strong>HTML 鏍煎紡</strong>銆?/p>
<p style="color: #999; font-size: 12px; margin-top: 20px;">鍙敤鍙橀噺锛歿{name}}锛堟敹浠朵汉濮撳悕锛夈€亄{email}}锛堟敹浠朵汉閭锛?/p>
</div>`
        }
    ];

    // ========== 娓叉煋涓婚潰鏉?==========
    function render() {
        const container = document.getElementById('marketingTabContent');
        if (!container) return;

        container.innerHTML = `
        <!-- 缁熻鏍?-->
        <div class="stats-bar" id="marketingStats">
            <div class="stat-card">
                <h3 id="statTotal">-</h3>
                <p>鎬绘敹浠朵汉</p>
            </div>
            <div class="stat-card">
                <h3 id="statOrders">-</h3>
                <p>璁㈠崟瀹㈡埛</p>
            </div>
            <div class="stat-card">
                <h3 id="statContact">-</h3>
                <p>鑱旂郴琛ㄥ崟</p>
            </div>
            <div class="stat-card">
                <h3 id="statHistory">-</h3>
                <p>宸插彂閫?/p>
            </div>
        </div>

        <!-- 涓ゆ爮甯冨眬 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- 宸︽爮锛氭敹浠朵汉 -->
            <div>
                <div class="orders-table">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: #d4af37; margin: 0;">馃摟 鏀朵欢浜哄垪琛?/h3>
                        <div>
                            <button class="btn btn-primary" onclick="MP.loadSubscribers()" style="padding: 6px 14px; font-size: 0.85rem;">馃攧 鍒锋柊</button>
                        </div>
                    </div>
                    <div style="padding: 10px;">
                        <input type="text" id="subSearchInput" placeholder="鎼滅储閭鎴栧鍚?.." 
                            style="width: 100%; padding: 8px 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit; margin-bottom: 8px;"
                            oninput="MP.filterSubscribers()">
                        <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                            <select id="subSourceFilter" onchange="MP.filterSubscribers()"
                                style="padding: 6px 10px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                                <option value="">鍏ㄩ儴鏉ユ簮</option>
                                <option value="bazi_order">鍏瓧璁㈠崟</option>
                                <option value="shop_order">鍟嗗煄璁㈠崟</option>
                                <option value="almanac_order">榛勫巻瑙ｉ攣</option>
                                <option value="contact_form">鑱旂郴琛ㄥ崟</option>
                                <option value="wuxing_quiz">浜旇娴嬭瘯</option>
                                <option value="manual">鎵嬪姩娣诲姞</option>
                            </select>
                            <button class="btn" onclick="MP.showAddSubscriber()" style="padding: 6px 12px; background: rgba(76,175,80,0.15); color: #4caf50; font-size: 0.8rem;">鉃?娣诲姞</button>
                            <button class="btn" onclick="MP.selectAll()" style="padding: 6px 12px; background: rgba(212,175,55,0.1); color: #d4af37; font-size: 0.8rem;">鍏ㄩ€?/button>
                            <button class="btn" onclick="MP.deselectAll()" style="padding: 6px 12px; background: rgba(255,255,255,0.05); color: #888; font-size: 0.8rem;">鍙栨秷鍏ㄩ€?/button>
                        </div>
                    </div>
                    <div id="subscriberList" style="max-height: 400px; overflow-y: auto; padding: 0 10px 10px;">
                        <p style="text-align: center; color: #666; padding: 30px;">鐐瑰嚮銆屽埛鏂般€嶅姞杞芥敹浠朵汉</p>
                    </div>
                    <div style="padding: 10px 15px; border-top: 1px solid rgba(212,175,55,0.2); color: #888; font-size: 0.85rem;">
                        宸查€夋嫨 <strong id="selectedCount" style="color: #d4af37;">0</strong> 浣嶆敹浠朵汉
                    </div>
                </div>
            </div>

            <!-- 鍙虫爮锛氱紪杈戝櫒 -->
            <div>
                <div class="orders-table">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                        <h3 style="color: #d4af37; margin: 0 0 12px;">鉁夛笍 缂栬緫閭欢</h3>
                        
                        <!-- 妯℃澘閫夋嫨 -->
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">閫夋嫨妯℃澘</label>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="templateButtons">
                                ${TEMPLATES.map(t => `<button class="btn" onclick="MP.loadTemplate('${t.id}')" style="padding: 6px 12px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.1);">${t.name}</button>`).join('')}
                            </div>
                        </div>

                        <!-- 鉁?澹佺焊鎺ㄩ€佷笓灞烇細涓婚閫夋嫨 + 涓€閿姄鍙?-->
                        <div id="wallpaperSmartPanel" style="display:none; margin-bottom: 12px; padding: 10px; background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px;">
                            <label style="color: #d4af37; font-size: 0.85rem; display: block; margin-bottom: 6px;">馃幆 鎺ㄩ€佷富棰橈紙鑷姩鍖归厤澹佺焊骞剁敓鎴愭爣棰橈級</label>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <select id="wpTopicSelect" style="flex:1; padding: 8px; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; background: rgba(0,0,0,0.3); color: #e8e8e8; font-family: inherit;">
                                    <option value="general">馃帀 缁煎悎濂借繍澹佺焊</option>
                                    <option value="love">馃尭 鏃烘鑺卞绾?/option>
                                    <option value="wealth">馃挵 鏃鸿储杩愬绾?/option>
                                    <option value="study">馃帗 瀛︿笟/涓婂哺澹佺焊</option>
                                    <option value="energy">馃 鍑€鍖栫鍦?鑳介噺澹佺焊</option>
                                </select>
                                <button id="btnSmartFill" class="btn" onclick="MP.smartFillWallpapers()" style="padding: 8px 16px; background: linear-gradient(135deg, #d4af37, #b8941f); color: #1a1a2e; font-weight: bold; border: none; white-space: nowrap;">
                                    鈿?涓€閿姄鍙?(涓嶉噸澶?
                                </button>
                            </div>
                        </div>

                        <!-- 妯℃澘鍙橀噺杈撳叆鍖猴紙鍔ㄦ€佺敓鎴愶級 -->
                        <div id="templateVarsContainer" style="display: none; margin-bottom: 12px;"></div>

                        <!-- 涓婚 -->
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">閭欢涓婚</label>
                            <input type="text" id="emailSubject" placeholder="杈撳叆閭欢涓婚..." 
                                style="width: 100%; padding: 10px 14px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                        </div>

                        <!-- 棰勮閭 -->
                        <div style="margin-bottom: 12px;">
                            <label style="color: #888; font-size: 0.85rem; display: block; margin-bottom: 6px;">棰勮閭锛堝厛鍙戜竴灏佺粰鑷繁鐪嬬湅鏁堟灉锛?/label>
                            <input type="email" id="previewEmail" placeholder="浣犵殑閭..." 
                                style="width: 100%; padding: 10px 14px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit;">
                        </div>
                    </div>

                    <!-- 缂栬緫鍣?-->
                    <div style="padding: 10px 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="color: #888; font-size: 0.85rem;">閭欢鍐呭 (HTML)</label>
                            <div style="display: flex; gap: 6px;">
                                <button class="btn" onclick="MP.insertImage()" style="padding: 4px 10px; background: rgba(212,175,55,0.15); color: #d4af37; font-size: 0.8rem;">馃柤 鎻掑叆鍥剧墖</button>
                                <button class="btn" id="deleteImageBtn" onclick="MP.deleteLastImage()" style="display:none;padding: 4px 10px; background: rgba(239,83,80,0.15); color: #ef5350; font-size: 0.8rem;">馃棏 鍒犻櫎鍥剧墖</button>
                                <button class="btn" onclick="MP.togglePreview()" style="padding: 4px 10px; background: rgba(255,255,255,0.05); color: #888; font-size: 0.8rem;">馃憗 棰勮</button>
                            </div>
                        </div>
                        <!-- 鍥剧墖鐘舵€佹彁绀?-->
                        <div id="imageStatus" style="display: none; margin-bottom: 6px; padding: 6px 10px; background: rgba(212,175,55,0.1); border-radius: 4px; color: #d4af37; font-size: 0.78rem;"></div>
                        <textarea id="emailContent" rows="12"
                            style="width: 100%; padding: 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; background: rgba(0,0,0,0.3); color: #e8e8e8; font-family: 'Consolas', monospace; font-size: 0.85rem; resize: vertical; line-height: 1.6;"
                            placeholder="鏀寔 HTML 鏍煎紡銆傚彲鐢ㄥ彉閲忥細{{name}}, {{email}}"></textarea>
                        <div id="emailPreview" style="display: none; margin-top: 10px; background: rgba(255,255,255,0.95); border-radius: 8px; padding: 20px; min-height: 200px; color: #333;"></div>
                    </div>

                    <!-- 鎿嶄綔鎸夐挳 -->
                    <div style="padding: 15px; border-top: 1px solid rgba(212,175,55,0.2); display: flex; gap: 10px;">
                        <button class="btn" onclick="MP.sendPreview()" style="background: rgba(100,181,246,0.2); color: #64b5f6; flex: 1;">
                            馃憗 鍙戦€侀瑙?
                        </button>
                        <button class="btn btn-primary" onclick="MP.confirmSend()" style="flex: 1;" id="sendBtn">
                            馃摛 鍙戦€佺粰閫変腑鐨勬敹浠朵汉
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 鍙戦€佽褰?-->
        <div class="orders-table" style="margin-top: 20px;">
            <div style="padding: 15px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                <h3 style="color: #d4af37; margin: 0;">馃搵 鍙戦€佽褰?/h3>
            </div>
            <div id="sendHistoryList" style="padding: 15px;">
                <p style="text-align: center; color: #666;">鏆傛棤鍙戦€佽褰?/p>
            </div>
        </div>
        `;

        // 涓嶈嚜鍔ㄥ姞杞斤紝绛?adminKey 鍙敤鍚庣敱 switchTab 瑙﹀彂
        // loadSubscribers() will be called when user switches to marketing tab
    }

    // ========== 鍔犺浇璁㈤槄鑰?==========
    async function loadSubscribers() {
        if (typeof window.adminKey === 'undefined' || !window.adminKey) {
            console.error('MP: adminKey 鏈畾涔?);
            return;
        }

        const listEl = document.getElementById('subscriberList');
        if (listEl) listEl.innerHTML = '<p style="text-align: center; color: #d4af37; padding: 20px;">鍔犺浇涓?..</p>';

        try {
            const res = await fetch('/api/marketing', {
                headers: { 'Authorization': `Bearer ${window.adminKey}` }
            });

            if (res.status === 401) {
                if (listEl) listEl.innerHTML = '<p style="text-align: center; color: #ef5350;">鎺堟潈宸茶繃鏈燂紝璇烽噸鏂扮櫥褰?/p>';
                return;
            }

            const data = await res.json();
            if (data.success) {
                subscribers = data.subscribers;
                updateStats(data.stats);
                renderSubscribers();
            } else {
                if (listEl) listEl.innerHTML = `<p style="text-align: center; color: #ef5350;">鍔犺浇澶辫触: ${data.error}</p>`;
            }
        } catch (err) {
            console.error('MP: 鍔犺浇璁㈤槄鑰呭け璐?, err);
            if (listEl) listEl.innerHTML = `<p style="text-align: center; color: #ef5350;">缃戠粶閿欒: ${err.message}</p>`;
        }
    }

    // ========== 鏇存柊缁熻 ==========
    function updateStats(stats) {
        const el = (id) => document.getElementById(id);
        if (el('statTotal')) el('statTotal').textContent = stats.total;
        if (el('statOrders')) el('statOrders').textContent = stats.baziOrders;
        if (el('statContact')) el('statContact').textContent = stats.contactForm;
        if (el('statHistory')) el('statHistory').textContent = sendHistory.length;
    }

    // ========== 娓叉煋璁㈤槄鑰呭垪琛?==========
    function renderSubscribers() {
        const listEl = document.getElementById('subscriberList');
        if (!listEl) return;

        const filtered = getFilteredSubscribers();

        if (filtered.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">鏆傛棤鏁版嵁</p>';
            updateSelectedCount();
            return;
        }

        listEl.innerHTML = filtered.map(s => {
            const checked = selectedEmails.has(s.email) ? 'checked' : '';
            const sourceColor = s.source === 'bazi_order' ? '#4caf50' : s.source === 'shop_order' ? '#ff9800' : s.source === 'almanac_order' ? '#9c27b0' : s.source === 'contact_form' ? '#2196f3' : s.source === 'wuxing_quiz' ? '#64b5f6' : '#ff9800';
            return `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer;" onclick="MP.toggleSelect('${s.email}')">
                <input type="checkbox" ${checked} onclick="event.stopPropagation(); MP.toggleSelect('${s.email}')" style="accent-color: #d4af37;">
                <div style="flex: 1; min-width: 0;">
                    <div style="color: #e8e8e8; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.name || '鏈懡鍚?}</div>
                    <div style="color: #666; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.email}</div>
                </div>
                <span style="font-size: 0.7rem; color: ${sourceColor}; background: ${sourceColor}20; padding: 2px 8px; border-radius: 10px; white-space: nowrap;">${s.sourceLabel || s.source}</span>
            </div>`;
        }).join('');

        updateSelectedCount();
    }

    // ========== 杩囨护 ==========
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

    // ========== 閫夋嫨 ==========
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

    // ========== 鎵嬪姩娣诲姞璁㈤槄鑰?==========
    function showAddSubscriber() {
        // 濡傛灉寮圭獥宸插瓨鍦紝鍏堢Щ闄?
        const existing = document.getElementById('addSubscriberModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'addSubscriberModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:30px;width:400px;max-width:90vw;">
                <h3 style="color:#d4af37;margin:0 0 20px;font-size:1.1rem;">鉃?娣诲姞璁㈤槄鑰?/h3>
                <div style="margin-bottom:14px;">
                    <label style="color:#888;font-size:0.85rem;display:block;margin-bottom:6px;">濮撳悕锛堝彲閫夛級</label>
                    <input type="text" id="addSubName" placeholder="杈撳叆濮撳悕..."
                        style="width:100%;padding:10px 14px;border:1px solid rgba(212,175,55,0.2);border-radius:8px;background:rgba(255,255,255,0.05);color:#e8e8e8;font-family:inherit;">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="color:#888;font-size:0.85rem;display:block;margin-bottom:6px;">閭 <span style="color:#ef5350;">*</span></label>
                    <input type="email" id="addSubEmail" placeholder="杈撳叆閭鍦板潃..."
                        style="width:100%;padding:10px 14px;border:1px solid rgba(212,175,55,0.2);border-radius:8px;background:rgba(255,255,255,0.05);color:#e8e8e8;font-family:inherit;">
                    <div id="addSubError" style="color:#ef5350;font-size:0.8rem;margin-top:6px;display:none;"></div>
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button onclick="document.getElementById('addSubscriberModal').remove()"
                        style="padding:10px 20px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#888;cursor:pointer;font-family:inherit;">鍙栨秷</button>
                    <button onclick="MP.addSubscriber()"
                        style="padding:10px 20px;border:none;border-radius:8px;background:linear-gradient(135deg,#4caf50,#388e3c);color:#fff;cursor:pointer;font-weight:600;font-family:inherit;">纭娣诲姞</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 鍥炶溅鎻愪氦
        modal.querySelector('#addSubEmail').addEventListener('keydown', e => {
            if (e.key === 'Enter') MP.addSubscriber();
        });
        modal.querySelector('#addSubName').addEventListener('keydown', e => {
            if (e.key === 'Enter') modal.querySelector('#addSubEmail').focus();
        });

        modal.querySelector('#addSubName').focus();
    }

    async function addSubscriber() {
        const nameEl = document.getElementById('addSubName');
        const emailEl = document.getElementById('addSubEmail');
        const errorEl = document.getElementById('addSubError');
        const name = nameEl?.value?.trim() || '';
        const email = emailEl?.value?.trim() || '';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorEl.textContent = '璇疯緭鍏ユ湁鏁堢殑閭鍦板潃';
            errorEl.style.display = 'block';
            return;
        }

        try {
            const res = await fetch('/api/marketing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.adminKey}`
                },
                body: JSON.stringify({ addSubscriber: { name, email } })
            });

            const data = await res.json();
            if (data.success) {
                document.getElementById('addSubscriberModal')?.remove();
                alert(`鉁?宸叉坊鍔犺闃呰€咃細${email}`);
                loadSubscribers(); // 鍒锋柊鍒楄〃
            } else {
                errorEl.textContent = data.error || '娣诲姞澶辫触';
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.textContent = '缃戠粶閿欒: ' + err.message;
            errorEl.style.display = 'block';
        }
    }

    // ========== 鍥剧墖鎻掑叆 ==========
    function insertImage() {
        // 濡傛灉寮圭獥宸插瓨鍦紝鍏堢Щ闄?
        const existing = document.getElementById('insertImageModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'insertImageModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:30px;width:440px;max-width:90vw;">
                <h3 style="color:#d4af37;margin:0 0 6px;font-size:1.1rem;">馃柤 鎻掑叆鍥剧墖</h3>
                <p style="color:#888;font-size:0.78rem;margin:0 0 16px;">鏀寔 JPG/PNG/GIF锛屽浘鐗囦細鑷姩鍘嬬缉鑷?600px 瀹斤紝鍗曞紶 &lt;500KB</p>

                <!-- 涓婁紶鍖哄煙 -->
                <div id="imgDropZone" onclick="document.getElementById('imgFileInput').click()"
                    style="border:2px dashed rgba(212,175,55,0.3);border-radius:10px;padding:30px;text-align:center;cursor:pointer;margin-bottom:14px;transition:all 0.2s;">
                    <div style="font-size:2rem;margin-bottom:8px;">馃搧</div>
                    <p style="color:#d4af37;margin:0;font-size:0.9rem;">鐐瑰嚮閫夋嫨鍥剧墖鎴栨嫋鎷借嚦姝ゅ</p>
                    <p style="color:#666;margin:6px 0 0;font-size:0.75rem;">JPG / PNG / GIF锛屾渶澶?1MB锛堝帇缂╁墠锛?/p>
                </div>
                <input type="file" id="imgFileInput" accept="image/jpeg,image/png,image/gif" style="display:none;" onchange="MP.handleImageFile(this.files[0])">

                <!-- 棰勮鍖?-->
                <div id="imgPreviewArea" style="display:none;margin-bottom:14px;text-align:center;">
                    <img id="imgPreview" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid rgba(212,175,55,0.2);">
                    <p id="imgSizeInfo" style="color:#888;font-size:0.78rem;margin:8px 0 0;"></p>
                </div>

                <!-- 鏇夸唬鏂囨湰 -->
                <div id="imgAltRow" style="display:none;margin-bottom:14px;">
                    <label style="color:#888;font-size:0.85rem;display:block;margin-bottom:6px;">鏇夸唬鏂囨湰锛圓lt Text锛?/label>
                    <input type="text" id="imgAltText" placeholder="鎻忚堪鍥剧墖鍐呭锛岀敤浜庢棤娉曞姞杞藉浘鐗囨椂鏄剧ず..."
                        style="width:100%;padding:10px 14px;border:1px solid rgba(212,175,55,0.2);border-radius:8px;background:rgba(255,255,255,0.05);color:#e8e8e8;font-family:inherit;">
                </div>

                <div id="imgInsertError" style="color:#ef5350;font-size:0.8rem;margin-bottom:10px;display:none;"></div>

                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button onclick="document.getElementById('insertImageModal').remove()"
                        style="padding:10px 20px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#888;cursor:pointer;font-family:inherit;">鍙栨秷</button>
                    <button id="imgInsertBtn" onclick="MP.confirmInsertImage()" disabled
                        style="padding:10px 20px;border:none;border-radius:8px;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a2e;cursor:pointer;font-weight:600;font-family:inherit;opacity:0.5;">鎻掑叆鍒伴偖浠?/button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 鎷栨嫿浜嬩欢
        const dropZone = modal.querySelector('#imgDropZone');
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#d4af37'; dropZone.style.background = 'rgba(212,175,55,0.05)'; });
        dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'rgba(212,175,55,0.3)'; dropZone.style.background = 'transparent'; });
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.style.borderColor = 'rgba(212,175,55,0.3)';
            dropZone.style.background = 'transparent';
            const file = e.dataTransfer?.files?.[0];
            if (file) MP.handleImageFile(file);
        });

        // 瀛樺偍澶勭悊鍚庣殑 base64
        modal._processedBase64 = null;
        modal._processedWidth = 0;
    }

    // 澶勭悊鍥剧墖鏂囦欢锛氬帇缂?+ 杞珺ase64
    async function handleImageFile(file) {
        const errorEl = document.getElementById('imgInsertError');
        const previewArea = document.getElementById('imgPreviewArea');
        const altRow = document.getElementById('imgAltRow');
        const insertBtn = document.getElementById('imgInsertBtn');
        const modal = document.getElementById('insertImageModal');

        errorEl.style.display = 'none';

        // 鏍￠獙鏂囦欢绫诲瀷
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            errorEl.textContent = '浠呮敮鎸?JPG銆丳NG銆丟IF 鏍煎紡';
            errorEl.style.display = 'block';
            return;
        }

        // 鏍￠獙鏂囦欢澶у皬锛堝帇缂╁墠涓嶈秴杩?2MB锛?
        if (file.size > 2 * 1024 * 1024) {
            errorEl.textContent = '鍥剧墖杩囧ぇ锛岃閫夋嫨灏忎簬 2MB 鐨勫浘鐗?;
            errorEl.style.display = 'block';
            return;
        }

        try {
            const result = await compressImage(file, 600, 500 * 1024);
            const base64 = result.base64;
            const width = result.width;
            const height = result.height;
            const sizeKB = Math.round(base64.length * 3 / 4 / 1024); // base64 瀹為檯澶у皬

            // 瀛樺偍鍒板脊绐楀璞?
            if (modal) {
                modal._processedBase64 = base64;
                modal._processedWidth = width;
            }

            // 鏄剧ず棰勮
            const previewImg = document.getElementById('imgPreview');
            const sizeInfo = document.getElementById('imgSizeInfo');
            if (previewImg) previewImg.src = base64;
            if (sizeInfo) sizeInfo.textContent = `${width} 脳 ${height}px 路 ${sizeKB}KB`;
            if (previewArea) previewArea.style.display = 'block';
            if (altRow) altRow.style.display = 'block';

            // 鍚敤鎻掑叆鎸夐挳
            if (insertBtn) { insertBtn.disabled = false; insertBtn.style.opacity = '1'; }

            // 妫€鏌?HTML 澶у皬
            checkImageSize();

        } catch (err) {
            errorEl.textContent = '鍥剧墖澶勭悊澶辫触: ' + err.message;
            errorEl.style.display = 'block';
        }
    }

    // 鍘嬬缉鍥剧墖锛氱缉鏀?+ 璐ㄩ噺 + 杞?Base64
    function compressImage(file, maxWidth, maxSizeBytes) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('鏂囦欢璇诲彇澶辫触'));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error('鍥剧墖瑙ｆ瀽澶辫触'));
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let w = img.width;
                    let h = img.height;

                    // 缂╂斁鍒?maxWidth
                    if (w > maxWidth) {
                        h = Math.round(h * maxWidth / w);
                        w = maxWidth;
                    }

                    canvas.width = w;
                    canvas.height = h;

                    // 缁樺埗
                    ctx.drawImage(img, 0, 0, w, h);

                    // 杞负 Base64锛岄€愭闄嶄綆璐ㄩ噺鐩村埌婊¤冻澶у皬闄愬埗
                    let quality = 0.85;
                    // 鎵€鏈夊浘鐗囩粺涓€鐢?JPEG锛堟瘮 PNG 灏忓緢澶氾紝閫傚悎鐓х墖绫诲唴瀹癸級
                    const mimeType = 'image/jpeg';
                    let base64;
                    base64 = canvas.toDataURL('image/jpeg', quality);
                    // 閫愭闄嶈川閲忕洿鍒版弧瓒冲ぇ灏忛檺鍒?
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

    // 纭鎻掑叆鍥剧墖鍒?textarea
    function confirmInsertImage() {
        const modal = document.getElementById('insertImageModal');
        if (!modal || !modal._processedBase64) return;

        const alt = document.getElementById('imgAltText')?.value?.trim() || 'DAO Essence';

        const imgTag = `<img src="${modal._processedBase64}" alt="${alt}" style="max-width:600px;width:100%;height:auto;border-radius:8px;display:block;margin:15px auto;">`;

        const textarea = document.getElementById('emailContent');
        if (!textarea) return;

        // 鎻掑叆鍒板唴瀹规渶涓婃柟锛堢涓€涓?< 涔嬪墠锛屽鏋滄病鏈夊垯鐩存帴鏀惧紑澶达級
        const value = textarea.value;
        const firstTagIndex = value.search(/<[a-zA-Z]/);
        if (firstTagIndex >= 0) {
            // 鍦ㄧ涓€涓爣绛惧墠鎻掑叆锛屽墠闈㈠姞绌鸿
            textarea.value = value.substring(0, firstTagIndex) + imgTag + '\n\n' + value.substring(firstTagIndex);
        } else {
            // 娌℃湁鏍囩锛岀洿鎺ユ斁寮€澶?
            textarea.value = imgTag + '\n\n' + value;
        }

        // 绉婚櫎寮圭獥
        modal.remove();

        // 鏇存柊鍥剧墖鐘舵€?
        checkImageSize();
    }

    // 鍒犻櫎鏈€鍚庢彃鍏ョ殑鍥剧墖
    function deleteLastImage() {
        const textarea = document.getElementById('emailContent');
        if (!textarea) return;

        const content = textarea.value;
        // 鎵炬墍鏈?<img> 鏍囩鐨勪綅缃?
        const imgRegex = /<img\s[^>]*src="data:image\/[^"]+;base64,[^"]*"[^>]*>\n?/g;
        const matches = [...content.matchAll(imgRegex)];

        if (matches.length === 0) {
            alert('娌℃湁鎵惧埌鍥剧墖');
            return;
        }

        // 濡傛灉鍙湁涓€寮狅紝鐩存帴纭鍒犻櫎
        // 濡傛灉鏈夊寮狅紝鍒楀嚭搴忓彿璁╃敤鎴烽€夋嫨
        if (matches.length === 1) {
            const confirmed = confirm('纭鍒犻櫎杩欏紶鍥剧墖锛?);
            if (!confirmed) return;
            textarea.value = content.replace(imgRegex, '').replace(/\n{3,}/g, '\n\n').trim();
        } else {
            const choice = prompt(`褰撳墠鏈?${matches.length} 寮犲浘鐗囷紝杈撳叆瑕佸垹闄ょ殑搴忓彿锛?-${matches.length}锛夛紝鎴栬緭鍏?"all" 鍒犻櫎鍏ㄩ儴锛歚);
            if (!choice) return;

            if (choice.toLowerCase() === 'all') {
                textarea.value = content.replace(imgRegex, '').replace(/\n{3,}/g, '\n\n').trim();
            } else {
                const index = parseInt(choice) - 1;
                if (isNaN(index) || index < 0 || index >= matches.length) {
                    alert('鏃犳晥鐨勫簭鍙?);
                    return;
                }
                // 鍒犻櫎鎸囧畾浣嶇疆鐨勫浘鐗?
                const match = matches[index];
                textarea.value = content.substring(0, match.index) + content.substring(match.index + match[0].length)
                    .replace(/\n{3,}/g, '\n\n').trim();
            }
        }

        checkImageSize();
    }

    // 妫€鏌ラ偖浠朵腑鍥剧墖鎬诲ぇ灏?
    function checkImageSize() {
        const content = document.getElementById('emailContent')?.value || '';
        const statusEl = document.getElementById('imageStatus');
        if (!statusEl) return;

        // 鍖归厤鎵€鏈?base64 鍥剧墖
        const base64Matches = content.match(/src="data:image\/[^;]+;base64,[A-Za-z0-9+/=]+"/g) || [];
        let totalBytes = 0;
        base64Matches.forEach(match => {
            const b64 = match.match(/base64,([A-Za-z0-9+/=]+)/);
            if (b64) totalBytes += b64[1].length * 3 / 4;
        });

        if (base64Matches.length === 0) {
            statusEl.style.display = 'none';
            const delBtn = document.getElementById('deleteImageBtn');
            if (delBtn) delBtn.style.display = 'none';
        } else {
            const totalKB = Math.round(totalBytes / 1024);
            const color = totalKB > 10240 ? '#ef5350' : '#d4af37';
            const warning = totalKB > 10240 ? ' 鈿狅笍 鍥剧墖鎬诲ぇ灏忚秴杩?10MB锛屽缓璁噺灏戞暟閲? : '';
            statusEl.style.display = 'block';
            statusEl.style.color = color;
            statusEl.textContent = `馃柤 宸叉彃鍏?${base64Matches.length} 寮犲浘鐗囷紝Base64 鎬诲ぇ灏忕害 ${totalKB > 1024 ? (totalKB / 1024).toFixed(1) + 'MB' : totalKB + 'KB'}${warning}`;
            const delBtn = document.getElementById('deleteImageBtn');
            if (delBtn) delBtn.style.display = 'inline-block';
        }
    }

    // 褰撳墠妯℃澘鍙橀噺鍊硷紙妯℃澘鑷畾涔夊彉閲忥紝濡?title/description 绛夛級
    let templateVars = {};

    // 浠?HTML 涓彁鍙栨墍鏈?{{xxx}} 鍙橀噺鍚嶏紙鎺掗櫎 name/email锛屽畠浠槸鏀朵欢浜哄彉閲忥級
    function extractVars(html, subject) {
        const all = (html + ' ' + (subject || '')).match(/\{\{(\w+)\}\}/g) || [];
        const vars = new Set();
        all.forEach(v => {
            const name = v.replace(/\{\{|\}\}/g, '');
            if (!['name', 'email'].includes(name)) vars.add(name);
        });
        return [...vars];
    }

    // 鍙橀噺涓枃鏍囩鏄犲皠
    const VAR_LABELS = {
        title: '鏍囬', description: '鎻忚堪', discount: '鎶樻墸淇℃伅', validity: '鏈夋晥鏈?,
        link: '閾炬帴', greeting: '绁濈璇?, emoji: '琛ㄦ儏绗﹀彿', message: '鑷畾涔夋秷鎭?,
        cta: '鎸夐挳鏂囧瓧', subtitle: '鍓爣棰?, code: '浼樻儬鐮?
    };
    const VAR_PLACEHOLDERS = {
        title: '渚嬪锛氭槬瀛ｅ叓瀛楄В璇婚檺鏃朵紭鎯?,
        description: '渚嬪锛氭椿鍔ㄨ鎯呮弿杩?..',
        discount: '渚嬪锛氬叏鍦?鎶?/ 闄愭椂绔嬪噺50鍏?,
        validity: '渚嬪锛氭椿鍔ㄦ椂闂达細2026骞?鏈?7鏃?4鏈?0鏃?,
        link: 'https://www.daoessentia.com',
        greeting: '渚嬪锛氭柊鏄ュ揩涔?/ 绔崍瀹夊悍',
        emoji: '馃彯',
        message: '渚嬪锛氱浣犳柊鐨勪竴骞翠竾浜嬪鎰忥紒',
        cta: '绔嬪嵆鏌ョ湅 鈫?,
        subtitle: '渚嬪锛氫笓灞炰簬鎮ㄧ殑浼樻儬',
        code: '渚嬪锛欴AO2026'
    };

    // ========== 妯℃澘 ==========
    function loadTemplate(id) {
        const tpl = TEMPLATES.find(t => t.id === id);
        if (!tpl) return;

        const subjectEl = document.getElementById('emailSubject');
        const contentEl = document.getElementById('emailContent');

        if (subjectEl) subjectEl.value = tpl.subject;
        if (contentEl) contentEl.value = tpl.html;

        // 閲嶇疆鍙橀噺鍊?
        templateVars = {};

        // 鎻愬彇妯℃澘鍙橀噺骞剁敓鎴愯緭鍏ュ瓧娈?
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
                        <label style="color: #d4af37; font-size: 0.85rem; display: block; margin-bottom: 8px;">馃搵 濉啓妯℃澘鍙橀噺</label>
                        ${vars.map(v => `
                            <div style="margin-bottom: 8px;">
                                <label style="color: #888; font-size: 0.78rem; display: block; margin-bottom: 3px;">${VAR_LABELS[v] || v} ({{${v}}})</label>
                                <input type="text" class="tpl-var-input" data-var="${v}" 
                                    placeholder="${VAR_PLACEHOLDERS[v] || '杈撳叆' + (VAR_LABELS[v] || v) + '...'}"
                                    oninput="MP.onVarChange('${v}', this.value)"
                                    style="width: 100%; padding: 8px 12px; border: 1px solid rgba(212,175,55,0.2); border-radius: 6px; background: rgba(255,255,255,0.05); color: #e8e8e8; font-family: inherit; font-size: 0.85rem;">
                            </div>
                        `).join('')}
                    </div>`;
            }
        }

        // 楂樹寒褰撳墠妯℃澘
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

        // 鉁?鏄剧ず/闅愯棌澹佺焊鏅鸿兘闈㈡澘
        const smartPanel = document.getElementById('wallpaperSmartPanel');
        if (smartPanel) {
            smartPanel.style.display = (id === 'wallpaper_digest') ? 'block' : 'none';
        }
    }

    // 妯℃澘鍙橀噺鍊煎彉鍖栨椂鏇存柊
    function onVarChange(varName, value) {
        templateVars[varName] = value;
    }

    // 浠庢ā鏉垮彉閲忚緭鍏ユ鍚屾鍒?templateVars 瀵硅薄
    function syncTemplateVarsFromInputs() {
        const inputs = document.querySelectorAll('.tpl-var-input');
        inputs.forEach(input => {
            const varName = input.dataset.var;
            if (varName && input.value) {
                templateVars[varName] = input.value;
            }
        });
    }

    // 鐢ㄦā鏉垮彉閲忔浛鎹㈠唴瀹逛腑鐨勫崰浣嶇
    function applyTemplateVars(content) {
        let result = content;
        for (const [key, value] of Object.entries(templateVars)) {
            if (value) {
                result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
            }
        }
        return result;
    }

    // ========== 鎻愬彇 Base64 鍥剧墖骞惰浆涓?CID 寮曠敤 ==========
    function extractBase64Images(htmlContent) {
        const images = [];
        let cidHtml = htmlContent;
        let imgIndex = 0;

        // 鍖归厤 data:image/xxx;base64,... 妯″紡
        cidHtml = cidHtml.replace(/src="(data:image\/(jpeg|jpg|png|gif);base64,([^"]+))"/gi, (match, fullSrc, mime, b64) => {
            const cid = `img_${imgIndex}`;
            images.push({
                filename: `image_${imgIndex}.${mime === 'jpeg' || mime === 'jpg' ? 'jpg' : mime === 'png' ? 'png' : 'gif'}`,
                content: b64,
                encoding: 'base64',
                cid: cid
            });
            imgIndex++;
            return `src="cid:${cid}"`;
        });

        return { htmlContent: cidHtml, images };
    }

    // ========== 棰勮 ==========
    function togglePreview() {
        const contentEl = document.getElementById('emailContent');
        const previewEl = document.getElementById('emailPreview');
        if (!contentEl || !previewEl) return;

        if (previewEl.style.display === 'none') {
            // 鍚屾妯℃澘鍙橀噺杈撳叆妗嗙殑鍊?+ 鐢ㄧ涓€涓€変腑鏀朵欢浜虹殑淇℃伅娓叉煋棰勮
            syncTemplateVarsFromInputs();
            let previewHtml = applyTemplateVars(contentEl.value);
            let previewSubject = applyTemplateVars(document.getElementById('emailSubject')?.value || '');
            const firstSub = subscribers.find(s => selectedEmails.has(s.email)) || { name: '寮犱笁', email: 'test@example.com' };
            previewHtml = previewHtml.replace(/\{\{name\}\}/g, firstSub.name || 'Friend');
            previewHtml = previewHtml.replace(/\{\{email\}\}/g, firstSub.email);

            // 鍖呰９閭欢澶栧３
            previewEl.innerHTML = `
                <div style="max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 3px;">DAO ESSENCE</h1>
                        <p style="color: #c9b99a; margin: 8px 0 0; font-size: 14px;">閬撴湰绮鹃吙 路 鍙ら亾鑳介噺</p>
                    </div>
                    <div style="padding: 30px; background: #fff; border-left: 1px solid #eee; border-right: 1px solid #eee;">
                        ${previewHtml}
                    </div>
                    <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                        <p style="color: #c9b99a; margin: 0; font-size: 12px;">漏 2026 DAO Essence 路 www.daoessentia.com</p>
                    </div>
                </div>`;
            previewEl.style.display = 'block';
            contentEl.style.display = 'none';
        } else {
            previewEl.style.display = 'none';
            contentEl.style.display = 'block';
        }
    }

    // ========== 鍙戦€侀瑙?==========
    async function sendPreview() {
        const previewEmail = document.getElementById('previewEmail')?.value?.trim();
        let subject = document.getElementById('emailSubject')?.value?.trim();
        let htmlContent = document.getElementById('emailContent')?.value?.trim();

        if (!previewEmail) {
            alert('璇疯緭鍏ラ瑙堥偖绠?);
            return;
        }
        if (!subject) {
            alert('璇疯緭鍏ラ偖浠朵富棰?);
            return;
        }
        if (!htmlContent) {
            alert('璇疯緭鍏ラ偖浠跺唴瀹?);
            return;
        }

        // 鍚屾妯℃澘鍙橀噺杈撳叆妗嗙殑鍊?+ 鏇挎崲妯℃澘鍙橀噺
        syncTemplateVarsFromInputs();
        subject = applyTemplateVars(subject);
        htmlContent = applyTemplateVars(htmlContent);

        // 妫€鏌ラ偖浠?HTML 鎬诲ぇ灏忥紙SMTP 闄愬埗绾?15MB锛?
        const previewHtmlSize = new Blob([htmlContent]).size;
        if (previewHtmlSize > 14 * 1024 * 1024) {
            alert(`閭欢鍐呭杩囧ぇ锛?{Math.round(previewHtmlSize / 1024)}KB锛夛紝SMTP 闄愬埗绾?15MB銆俓n璇峰噺灏戝浘鐗囨暟閲忔垨浣跨敤鏇村皬鐨勫浘鐗囥€俙);
            return;
        }

        // 妫€鏌ユ槸鍚﹁繕鏈夋湭鏇挎崲鐨勬ā鏉垮彉閲?
        const unreplaced = (htmlContent + ' ' + subject).match(/\{\{(?!name|email)\w+\}\}/g);
        if (unreplaced && unreplaced.length > 0) {
            const unique = [...new Set(unreplaced)];
            const proceed = confirm(
                `鈿狅笍 妫€娴嬪埌 ${unique.length} 涓湭鏇挎崲鐨勬ā鏉垮彉閲忥細\n${unique.join(', ')}\n\n` +
                `寤鸿鍏堝湪銆屽～鍐欐ā鏉垮彉閲忋€嶅尯鍩熷～鍐欒繖浜涘€笺€俓n\n` +
                `鏄惁浠嶇劧鍙戦€侊紵锛堟湭鏇挎崲鐨勫彉閲忎細鍘熸牱鏄剧ず鍦ㄩ偖浠朵腑锛塦
            );
            if (!proceed) return;
        }

        // 鎻愬彇 Base64 鍥剧墖骞惰浆涓?CID 寮曠敤
        const { htmlContent: cidHtmlContent, images } = extractBase64Images(htmlContent);

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
                    htmlContent: cidHtmlContent,
                    title: subject,
                    images: images.length > 0 ? images : undefined
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`棰勮閭欢宸插彂閫佽嚦 ${previewEmail}锛岃鏌ユ敹锛乣);
            } else {
                alert(`鍙戦€佸け璐? ${data.error}`);
            }
        } catch (err) {
            alert(`缃戠粶閿欒: ${err.message}`);
        }
    }

    // ========== 纭鍙戦€?==========
    function confirmSend() {
        if (selectedEmails.size === 0) {
            alert('璇峰厛閫夋嫨鏀朵欢浜?);
            return;
        }

        const subject = document.getElementById('emailSubject')?.value?.trim();
        if (!subject) {
            alert('璇疯緭鍏ラ偖浠朵富棰?);
            return;
        }

        const count = selectedEmails.size;
        const confirmed = confirm(
            `纭鍙戦€佽惀閿€閭欢锛焅n\n` +
            `鏀朵欢浜烘暟閲忥細${count}\n` +
            `閭欢涓婚锛?{subject}\n\n` +
            `寤鸿锛氬彂閫佸墠鍏堝彂涓€灏侀瑙堢粰鑷繁纭鏁堟灉銆俙
        );

        if (confirmed) {
            sendMarketingEmail();
        }
    }

    // ========== 鍙戦€佽惀閿€閭欢 ==========
    async function sendMarketingEmail() {
        let subject = document.getElementById('emailSubject')?.value?.trim();
        let htmlContent = document.getElementById('emailContent')?.value?.trim();
        const sendBtn = document.getElementById('sendBtn');

        if (!subject || !htmlContent) return;

        // 鍚屾妯℃澘鍙橀噺杈撳叆妗嗙殑鍊?+ 鏇挎崲妯℃澘鍙橀噺
        syncTemplateVarsFromInputs();
        subject = applyTemplateVars(subject);
        htmlContent = applyTemplateVars(htmlContent);

        // 妫€鏌ラ偖浠?HTML 鎬诲ぇ灏忥紙SMTP 闄愬埗绾?15MB锛?
        const emailHtmlSize = new Blob([htmlContent]).size;
        if (emailHtmlSize > 14 * 1024 * 1024) {
            alert(`閭欢鍐呭杩囧ぇ锛?{Math.round(emailHtmlSize / 1024)}KB锛夛紝SMTP 闄愬埗绾?15MB銆俓n璇峰噺灏戝浘鐗囨暟閲忔垨浣跨敤鏇村皬鐨勫浘鐗囥€俙);
            return;
        }

        // 妫€鏌ユ槸鍚﹁繕鏈夋湭鏇挎崲鐨勬ā鏉垮彉閲忥紙name/email 闄ゅ锛屽畠浠敱鍚庣鏇挎崲锛?
        const unreplaced = (htmlContent + ' ' + subject).match(/\{\{(?!name|email)\w+\}\}/g);
        if (unreplaced && unreplaced.length > 0) {
            const unique = [...new Set(unreplaced)];
            const proceed = confirm(
                `鈿狅笍 妫€娴嬪埌 ${unique.length} 涓湭鏇挎崲鐨勬ā鏉垮彉閲忥細\n${unique.join(', ')}\n\n` +
                `寤鸿鍏堝湪銆屽～鍐欐ā鏉垮彉閲忋€嶅尯鍩熷～鍐欒繖浜涘€笺€俓n\n` +
                `鏄惁浠嶇劧鍙戦€侊紵锛堟湭鏇挎崲鐨勫彉閲忎細鍘熸牱鏄剧ず鍦ㄩ偖浠朵腑锛塦
            );
            if (!proceed) return;
        }

        // 鏋勫缓鏀朵欢浜哄垪琛?
        const recipients = [];
        selectedEmails.forEach(email => {
            const sub = subscribers.find(s => s.email === email);
            if (sub) {
                recipients.push({ email: sub.email, name: sub.name || '' });
            }
        });

        if (recipients.length === 0) {
            alert('娌℃湁鏈夋晥鐨勬敹浠朵汉');
            return;
        }

        // 鎻愬彇 Base64 鍥剧墖骞惰浆涓?CID 寮曠敤
        const { htmlContent: cidHtmlContent, images } = extractBase64Images(htmlContent);

        // 绂佺敤鎸夐挳
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = '鍙戦€佷腑...';
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
                    htmlContent: cidHtmlContent,
                    title: subject,
                    fromAlias: 'DAO Essence',
                    replyTo: true,
                    images: images.length > 0 ? images : undefined
                })
            });

            const data = await res.json();

            if (data.success) {
                // 璁板綍鍒版湰鍦板巻鍙?
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

                let msg = `鉁?鍙戦€佸畬鎴愶紒\n鎴愬姛: ${data.sent || 0}\n澶辫触: ${data.failed || 0}`;
                if (data.truncated) {
                    msg += `\n鈿狅笍 鏀朵欢浜鸿秴杩?0浜猴紝浠呭彂閫佷簡鍓?0灏併€傚垎鎵瑰彂閫佸姛鑳藉紑鍙戜腑銆俙;
                }
                if (data.errors && data.errors.length > 0) {
                    msg += `\n\n鉂?澶辫触璇︽儏:\n${data.errors.map(e => `${e.email}: ${e.error}`).join('\n')}`;
                }
                alert(msg);
            } else {
                alert(`鍙戦€佸け璐? ${data.error}`);
            }
        } catch (err) {
            alert(`缃戠粶閿欒: ${err.message}`);
        } finally {
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = '馃摛 鍙戦€佺粰閫変腑鐨勬敹浠朵汉';
                sendBtn.style.opacity = '1';
            }
        }
    }

    // ========== 鍙戦€佽褰?==========
    function renderSendHistory() {
        const el = document.getElementById('sendHistoryList');
        if (!el) return;

        if (sendHistory.length === 0) {
            el.innerHTML = '<p style="text-align: center; color: #666;">鏆傛棤鍙戦€佽褰?/p>';
            return;
        }

        el.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px; text-align: left; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.2);">涓婚</th>
                    <th style="padding: 10px; text-align: center; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.2);">鎴愬姛/鎬绘暟</th>
                    <th style="padding: 10px; text-align: right; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.2);">鏃堕棿</th>
                </tr>
            </thead>
            <tbody>
                ${sendHistory.map(h => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e8e8e8;">${h.subject}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: #4caf50;">${h.sent}</span> / ${h.total}
                        ${h.failed > 0 ? `<span style="color: #ef5350; font-size: 0.8rem;"> (${h.failed}澶辫触)</span>` : ''}
                        ${h.truncated ? '<span style="color: #ff9800; font-size: 0.7rem;"> 鈿狅笍</span>' : ''}
                    </td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05); color: #888; font-size: 0.85rem;">${h.date}</td>
                </tr>`).join('')}
            </tbody>
        </table>`;
    }

    // ========== 鉁?鏅鸿兘澹佺焊鎶撳彇锛堢粓鏋佷慨澶嶏細鑷姩琛ュ叏 + 闃插瀮鍦?+ 閾炬帴浼樺寲锛?==========
    async function smartFillWallpapers() {
        const btn = document.getElementById('btnSmartFill');
        const topic = document.getElementById('wpTopicSelect')?.value || 'general';
        const contentEl = document.getElementById('emailContent');
        const subjectEl = document.getElementById('emailSubject');

        if (btn) { btn.disabled = true; btn.textContent = '鈴?鎶撳彇涓?..'; }

        try {
            // 1. 鑾峰彇澹佺焊鏁版嵁
            const res = await fetch('/wallpapers-lite.json');
            if (!res.ok) throw new Error('缃戠粶璇锋眰澶辫触');
            const wallpapers = await res.json();

            // 2. 涓婚鏄犲皠瑙勫垯
            const TOPIC_MAP = {
                love: ['Talismans', 'Energy', 'Feng Shui'],
                wealth: ['Five Elements', 'Feng Shui', 'Talismans'],
                study: ['Energy', 'Talismans'],
                energy: ['Energy'],
                general: []
            };
            const allowedCats = TOPIC_MAP[topic] || [];

            // 3. 绛涢€?& 鎺掑簭
            let pool = wallpapers.filter(w => {
                if (allowedCats.length === 0) return true;
                return allowedCats.includes(w.category);
            });

            // 銆愪紭鍖栥€戯細濡傛灉褰撳墠涓婚涓嶈冻 3 寮狅紝鑷姩浠庡叾浠栧垎绫昏ˉ鍏?
            if (pool.length < 3) {
                const others = wallpapers.filter(w => !pool.includes(w));
                pool = [...pool, ...others];
            }

            pool.sort(() => Math.random() - 0.5);
            const selected = pool.slice(0, 3);

            // 4. 鐢熸垚涓婚鏍囬
            const TOPIC_TITLES = {
                love: '馃尭 鏈懆绮鹃€夛細鏃烘鑺卞绾哥壒杈?,
                wealth: '馃挵 鏈懆绮鹃€夛細鏃鸿储杩愬绾哥壒杈?,
                study: '馃帗 鏈懆绮鹃€夛細瀛︿笟/涓婂哺澹佺焊鐗硅緫',
                energy: '馃 鏈懆绮鹃€夛細鍑€鍖栫鍦鸿兘閲忓绾?,
                general: '鉁?鏈懆绮鹃€夛細缁煎悎濂借繍澹佺焊'
            };
            const mainTitle = TOPIC_TITLES[topic] || TOPIC_TITLES.general;

            // 5. 鍑嗗鏁版嵁婧?
            const tpl = TEMPLATES.find(t => t.id === 'wallpaper_digest');
            let html = tpl ? tpl.html : '';

            // 6. 濉厖鍙橀噺骞跺悓姝ュ埌 templateVars
            templateVars = {};

            // 閫氱敤鍙橀噺
            html = html.replace(/{{name}}/g, '浜茬埍鐨勬湅鍙?);
            templateVars['name'] = '浜茬埍鐨勬湅鍙?;

            // 銆愭爣棰橀槻閲嶅銆戯細Subject 浣跨敤鍔ㄦ€佷富棰樺悕锛孊ody H2 淇濇寔闈欐€?"鏈懆绮鹃€夊绾告帹鑽?
            // html 涓殑 {{title}} 鍙橀噺涓昏鐢ㄤ簬 Subject锛孊ody 涓殑鏍囬宸茬粡鏄浐瀹氭枃妗?
            templateVars['title'] = mainTitle;

            // 銆愰摼鎺ヤ紭鍖栥€戯細鏄庣‘鎸囧悜澹佺焊椤?
            const wallpaperLink = 'https://www.daoessentia.com/wallpaper';
            html = html.replace('{{link}}', wallpaperLink);
            templateVars['link'] = wallpaperLink;

            // 濉叆 3 寮犲浘
            for (let i = 0; i < 3; i++) {
                const wp = selected[i] || { title: 'Lucky Wallpaper', thumb: '' };
                const idx = i + 1;
                const imgUrl = wp.thumb || wp.original || '';

                templateVars[`img${idx}`] = imgUrl;
                templateVars[`title${idx}`] = wp.title || wp.titleZh || 'Lucky Wallpaper';

                html = html.replace(new RegExp(`{{img${idx}}}`, 'g'), imgUrl);
                html = html.replace(new RegExp(`{{title${idx}}}`, 'g'), wp.title || wp.titleZh || 'Lucky Wallpaper');
            }

            // 7. 濉叆缂栬緫鍣?
            if (subjectEl) subjectEl.value = mainTitle;
            if (contentEl) contentEl.value = html;

            const varsContainer = document.getElementById('templateVarsContainer');
            if (varsContainer) varsContainer.style.display = 'block';

            alert(`鉁?鎴愬姛鎶撳彇 ${selected.length} 寮犮€?{mainTitle}銆戝绾革紒\n\n馃憠 宸查檺鍒朵负 3 寮狅紝闄嶄綆鍙嶅瀮鍦炬嫤鎴巼銆俓n馃憠 鏍囬宸蹭紭鍖栵紝涓嶅啀涓庢鏂囨爣棰橀噸澶嶃€俓n 璇峰湪宸︿晶鍕鹃€夋敹浠朵汉锛岀劧鍚庣偣鍑汇€愬彂閫佺粰閫変腑鐨勬敹浠朵汉銆戝嵆鍙兢鍙戙€俙);

        } catch (err) {
            console.error('Smart Fill Error:', err);
            alert('鉂?鎶撳彇澶辫触锛? + err.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '鈿?涓€閿姄鍙?(涓嶉噸澶?'; }
        }
    }

    // ========== 鏆撮湶鍒板叏灞€ ==========
    window.MP = {
        loadSubscribers,
        filterSubscribers,
        toggleSelect,
        selectAll,
        deselectAll,
        showAddSubscriber,
        addSubscriber,
        insertImage,
        handleImageFile,
        confirmInsertImage,
        deleteLastImage,
        checkImageSize,
        loadTemplate,
        onVarChange,
        syncTemplateVarsFromInputs,
        applyTemplateVars,
        togglePreview,
        sendPreview,
        confirmSend,
        render,
        smartFillWallpapers
    };

    // ========== 鑷姩鍒濆鍖?==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }

})();
