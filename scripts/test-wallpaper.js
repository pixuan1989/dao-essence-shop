/**
 * 壁纸页面自动测试（Node.js 本地运行）
 * 检查 HTML/CSS/JS 结构完整性，避免基础 bug 上线
 * 用法: node scripts/test-wallpaper.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
let passed = 0;

function log(type, msg) {
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    console.log(`  ${prefix} ${msg}`);
}

function check(file, test) {
    const content = fs.readFileSync(file, 'utf-8');
    const name = path.relative(root, file);

    console.log(`\n📄 ${name}`);

    for (const t of test) {
        if (t.pattern instanceof RegExp) {
            const match = t.pattern.test(content);
            if (t.required && !match) {
                log('error', t.desc);
                errors++;
            } else if (!t.required && match) {
                // optional pass
            } else {
                log('pass', t.desc);
                passed++;
            }
        }
    }
}

// ── wallpaper.html checks ──
check(path.join(root, 'wallpaper.html'), [
    { desc: 'Has ZEDGE nav', pattern: /class="wpn"/, required: true },
    { desc: 'Has auth modal', pattern: /auth-overlay/, required: true },
    { desc: 'Has Sign In button', pattern: /wpn-signin-btn/, required: true },
    { desc: 'Has search input', pattern: /id="search-input"/, required: true },
    { desc: 'Has category pills', pattern: /toolbar-row/, required: true },
    { desc: 'Has i18n switcher script', pattern: /i18n-switcher\.js/, required: true },
    { desc: 'Has auth.js', pattern: /js\/auth\.js/, required: true },
    { desc: 'Has styles.min.css', pattern: /styles\.min\.css/, required: true },
    { desc: 'No old header class', pattern: /class="header"/, required: false },
    { desc: 'Download limit toast', pattern: /da-toast/, required: true },
]);

// ── wallpaper-detail.html checks ──
check(path.join(root, 'wallpaper-detail.html'), [
    { desc: 'Has ZEDGE nav', pattern: /class="wpn"/, required: true },
    { desc: 'Has auth modal', pattern: /auth-overlay/, required: true },
    { desc: 'Has download button', pattern: /id="download-link"/, required: true },
    { desc: 'Has image element', pattern: /id="main-image"/, required: true },
    { desc: 'Has title element', pattern: /id="wp-title"/, required: true },
    { desc: 'Has description element', pattern: /id="wp-seo-desc"/, required: true },
    { desc: 'Has auth.js', pattern: /js\/auth\.js/, required: true },
    { desc: 'Has i18n script', pattern: /i18n-switcher\.js/, required: true },
    { desc: 'dlLink declared before use', pattern: /const dlLink = document/, required: true },
    { desc: 'dlLink onclick has null guard', pattern: /if \(dlLink\)/, required: true },
    { desc: 'Tags i18n support', pattern: /tags_zh|tagsArray/, required: true },
]);

// ── wallpapers.json checks ──
const wpData = JSON.parse(fs.readFileSync(path.join(root, 'wallpapers.json'), 'utf-8'));
console.log(`\n📄 wallpapers.json (${wpData.length} items)`);
for (const w of wpData) {
    if (!w.id) { log('error', `${w.title}: missing id`); errors++; continue; }
    if (!w.title) { log('error', `${w.id}: missing title`); errors++; }
    if (!w.title_zh) { log('warn', `${w.id}: missing title_zh`); warnings++; }
    if (!w.tags_zh) { log('warn', `${w.id}: missing tags_zh`); warnings++; }
    if (!w.category_zh) { log('warn', `${w.id}: missing category_zh`); warnings++; }
    if (!w.thumb) { log('error', `${w.id}: missing thumb`); errors++; }
    if (!w.original) { log('error', `${w.id}: missing original`); errors++; }
}
log('pass', `${wpData.length} wallpapers checked`); passed++;

// ── Summary ──
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${warnings} warnings, ${errors} errors`);
if (errors > 0) {
    console.log('❌ TESTS FAILED');
    process.exit(1);
} else {
    console.log('✅ All tests passed');
}
