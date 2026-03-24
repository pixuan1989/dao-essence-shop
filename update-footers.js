/**
 * 批量替换所有页面页脚为标准页脚（含 WhatsApp / Telegram / WeChat）
 * run: node update-footers.js
 */
const fs = require('fs');

// ============================
// 标准页脚模板
// ============================
const STANDARD_FOOTER = `    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">
                        <span class="logo-en">DAO ESSENCE</span>
                    </div>
                    <p>Ancient Wisdom, Modern Harmony. Based on authentic Eastern wisdom traditions, we offer verifiable traditional cultural electronic redemption vouchers and services with genuine energy properties.</p>
                    <div class="footer-social">
                        <a href="https://wa.me/your-number" target="_blank" class="social-link" title="WhatsApp">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </a>
                        <a href="https://t.me/your-handle" target="_blank" class="social-link" title="Telegram">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        </a>
                        <a href="#wechat-qr" class="social-link" title="WeChat" onclick="document.getElementById('wechat-modal').style.display='flex';return false;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-3.957 3.467c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 class="footer-title">Navigation</h4>
                    <ul class="footer-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="culture.html">Energy Universe</a></li>
                        <li><a href="shop.html">Electronic Redemption Vouchers</a></li>
                        <li><a href="index.html#life-path-booking">Life Path Consulting</a></li>
                        <li><a href="guide.html">Crafting Process</a></li>
                        <li><a href="about.html">About Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="footer-title">Services</h4>
                    <ul class="footer-links">
                        <li><a href="#">Annual Energy Analysis</a></li>
                        <li><a href="#">Personal Consultation</a></li>
                        <li><a href="#">Custom Items</a></li>
                        <li><a href="redeem.html">Redeem Voucher</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="footer-title">Contact</h4>
                    <ul class="footer-links">
                        <li>
                            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:middle;margin-right:6px"><path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M3 5l7 6 7-6"/></svg>
                            <a href="mailto:517748938@qq.com">517748938@qq.com</a>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:6px;color:#D4AF37"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            <a href="https://wa.me/your-number" target="_blank">WhatsApp</a>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:6px;color:#D4AF37"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                            <a href="https://t.me/your-handle" target="_blank">Telegram</a>
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:6px;color:#D4AF37"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-3.957 3.467c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>
                            <a href="#" onclick="document.getElementById('wechat-modal').style.display='flex';return false;">WeChat</a>
                        </li>
                        <li>
                            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:middle;margin-right:6px"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/></svg>
                            Mon&ndash;Sat: 9AM&ndash;9PM (CST / UTC+8)
                        </li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 DAO Essence &amp; Five Elements. All rights reserved.</p>
                <div class="footer-legal-links">
                    <a href="privacy.html">Privacy Policy</a>
                    <span>|</span>
                    <a href="terms.html">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- WeChat QR Modal -->
    <div id="wechat-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
        <div style="background:#1a1a1a;border:1px solid rgba(212,175,55,0.4);border-radius:16px;padding:40px;text-align:center;max-width:320px;width:90%;position:relative;">
            <button onclick="document.getElementById('wechat-modal').style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(245,240,230,0.6);font-size:22px;cursor:pointer;line-height:1;">&times;</button>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="#D4AF37" style="margin-bottom:12px"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-3.957 3.467c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>
            <h3 style="color:#D4AF37;margin:0 0 8px;font-size:18px;">WeChat</h3>
            <p style="color:rgba(245,240,230,0.7);font-size:13px;margin:0 0 20px;">Scan the QR code to connect with us on WeChat</p>
            <div style="width:160px;height:160px;margin:0 auto;background:rgba(212,175,55,0.1);border:2px dashed rgba(212,175,55,0.4);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                <span style="color:rgba(245,240,230,0.4);font-size:12px;text-align:center;padding:10px;">Replace with<br>WeChat QR Code</span>
            </div>
            <p style="color:rgba(245,240,230,0.5);font-size:12px;margin:16px 0 0;">WeChat ID: your-wechat-id</p>
        </div>
    </div>`;

// ============================
// 需要处理的文件列表
// ============================
const FILES = [
  'shop.html',
  'about.html',
  'culture.html',
  'guide.html',
  'contact.html',
  'product-detail.html',
  'checkout.html',
  'order-confirm.html',
  'redeem.html',
  'destiny.html',
];

// 用正则匹配 <footer ...>...</footer> 并替换
const FOOTER_RE = /[ \t]*<!-- (?:Footer|页脚|── FOOTER ──) -->\s*<footer[\s\S]*?<\/footer>(\s*<!-- WeChat QR Modal -->[\s\S]*?<\/div>\s*<\/div>)?/g;

let updated = 0;
let skipped = 0;

for (const file of FILES) {
  const filePath = `./${file}`;
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP (not found): ${file}`);
    skipped++;
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 检测是否有 footer 标签
  if (!content.includes('<footer')) {
    console.log(`⚠️  SKIP (no footer): ${file}`);
    skipped++;
    continue;
  }

  // 替换整个 footer 区块（含注释到 </footer>，以及可能存在的 WeChat modal）
  const footerStart = content.indexOf('<!-- Footer -->') !== -1
    ? content.indexOf('<!-- Footer -->')
    : content.indexOf('<!-- 页脚 -->') !== -1
    ? content.indexOf('<!-- 页脚 -->')
    : content.indexOf('<!-- ── FOOTER ── -->') !== -1
    ? content.indexOf('<!-- ── FOOTER ── -->')
    : content.indexOf('<footer');

  // 找到 </footer> 结束位置
  const footerEnd = content.indexOf('</footer>', footerStart) + '</footer>'.length;

  if (footerStart === -1 || footerEnd < '</footer>'.length) {
    console.log(`⚠️  SKIP (footer markers not found): ${file}`);
    skipped++;
    continue;
  }

  // 检查 </footer> 后是否还有旧的 wechat-modal，一并删掉
  let afterFooter = content.slice(footerEnd);
  const wechatModalRe = /\s*<!-- WeChat QR Modal -->[\s\S]*?<\/div>\s*<\/div>/;
  if (wechatModalRe.test(afterFooter)) {
    afterFooter = afterFooter.replace(wechatModalRe, '');
  }

  const newContent = content.slice(0, footerStart) + STANDARD_FOOTER + afterFooter;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Updated: ${file}`);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);
