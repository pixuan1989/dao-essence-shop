const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'scripts', 'generate-wallpapers.cjs');
let c = fs.readFileSync(filePath, 'utf8');

// Find the download handler block - from "Download Limit JS" comment to "Language Switcher JS" comment
const startMarker = "    + '    <!-- Download Limit JS -->";
const endMarker = "    + '    <!-- Language Switcher JS -->";

const s = c.indexOf(startMarker);
const e = c.indexOf(endMarker);

if (s === -1) { console.error('START marker not found'); process.exit(1); }
if (e === -1) { console.error('END marker not found'); process.exit(1); }

console.log('Found block from', s, 'to', e);
console.log('Block length:', e - s);

const before = c.substring(0, s);
const after = c.substring(e);

// Check isZh
const isZh = c.includes('下載') || c.includes('下載桌布');

// Extract wallpaperId from context
const wpIdMatch = c.match(/var wallpaperId = "([^"]+)"/);
const wpId = wpIdMatch ? wpIdMatch[1] : 'unknown';
console.log('wallpaperId:', wpId);

const dlBtnText = isZh ? '下載桌布' : 'Download';

const newBlock = 
    "    + '    <!-- SAFE ZONE: Download limit - do NOT modify this block -->\\n'\n" +
    "    + '    <script>\\n'\n" +
    "    + '        (function() {\\n'\n" +
    "    + '            var btn = document.querySelector(\".btn-download\");\\n'\n" +
    "    + '            if (!btn) return;\\n'\n" +
    "    + '            var wallpaperId = \"" + wpId + "\";\\n'\n" +
    "    + '            btn.addEventListener(\"click\", async function() {\\n'\n" +
    "    + '                var url = btn.getAttribute(\"data-url\");\\n'\n" +
    "    + '                if (!url) return;\\n'\n" +
    "    + '                btn.textContent = \"Checking...\";\\n'\n" +
    "    + '                try {\\n'\n" +
    "    + '                    var token = (window.DaoAuth && window.DaoAuth.getSessionToken) ? await window.DaoAuth.getSessionToken() : null;\\n'\n" +
    "    + '                    var headers = { \"Content-Type\": \"application/json\" };\\n'\n" +
    "    + '                    if (token) headers[\"Authorization\"] = \"Bearer \" + token;\\n'\n" +
    "    + '                    var res = await fetch(\"/api/auth?action=download\", {\\n'\n" +
    "    + '                        method: \"POST\", headers: headers,\\n'\n" +
    "    + '                        body: JSON.stringify({ wallpaperId: wallpaperId })\\n'\n" +
    "    + '                    });\\n'\n" +
    "    + '                    var data = await res.json();\\n'\n" +
    "    + '                    if (res.ok && data.allowed) {\\n'\n" +
    "    + '                        var a = document.createElement(\"a\");\\n'\n" +
    "    + '                        a.href = url; a.download = \"\"; a.target = \"_blank\";\\n'\n" +
    "    + '                        document.body.appendChild(a); a.click(); document.body.removeChild(a);\\n'\n" +
    "    + '                    } else {\\n'\n" +
    "    + '                        var msg = (data.error || \"Download limit reached.\") + \" Sign in for 3/day.\";\\n'\n" +
    "    + '                        if (window.DaoAuth) { window.DaoAuth.showToast(msg, 5000); }\\n'\n" +
    "    + '                        else { alert(msg); }\\n'\n" +
    "    + '                    }\\n'\n" +
    "    + '                } catch(err) {\\n'\n" +
    "    + '                    alert(\"Network error. Please try again.\");\\n'\n" +
    "    + '                }\\n'\n" +
    "    + '                btn.textContent = \"" + dlBtnText + "\";\\n'\n" +
    "    + '            });\\n'\n" +
    "    + '        })();\\n'\n" +
    "    + '    <!-- END SAFE ZONE -->\\n'\n";

fs.writeFileSync(filePath, before + newBlock + after, 'utf8');
console.log('Replacement done.');
