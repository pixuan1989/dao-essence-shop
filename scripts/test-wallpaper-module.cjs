/**
 * Wallpaper Module Test Script
 * Tests wallpaper-detail.html functionality after JS parse error fix
 */

const fs = require('fs');
const path = require('path');

console.log('=== Wallpaper Module Test Suite ===\n');

let passed = 0;
let failed = 0;
let warnings = 0;

function test(name, condition, detail = '') {
    if (condition) {
        console.log(`✅ ${name}`);
        if (detail) console.log(`   ${detail}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
        if (detail) console.log(`   ${detail}`);
        failed++;
    }
}

function warn(name, detail = '') {
    console.log(`⚠️ ${name}`);
    if (detail) console.log(`   ${detail}`);
    warnings++;
}

// 1. Check wallpapers.json
console.log('📄 wallpapers.json');
try {
    const jsonPath = path.join(process.cwd(), 'wallpapers.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    test('Valid JSON format', true, `${data.length} wallpapers`);
    
    data.forEach((wp, i) => {
        test(`Wallpaper ${i+1} has required fields`, 
            wp.id && wp.title && wp.thumb && wp.original && wp.category,
            `ID: ${wp.id}`);
        
        test(`Wallpaper ${i+1} has mockup field`, 
            wp.mockup !== undefined,
            wp.mockup ? 'Mockup URL present' : 'Mockup URL missing');
        
        test(`Wallpaper ${i+1} has i18n support`, 
            wp.title_zh && wp.description_zh && wp.tags_zh,
            'Chinese translations present');
    });
} catch (e) {
    test('Valid JSON format', false, e.message);
}

// 2. Check wallpaper-detail.html
console.log('\n📄 wallpaper-detail.html');
const htmlPath = path.join(process.cwd(), 'wallpaper-detail.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

test('wp-data script tag present', html.includes('<script id="wp-data"'), 'Embedded JSON data');
test('DOMContentLoaded listener', html.includes("document.addEventListener('DOMContentLoaded', init)"), 'init() wrapped correctly');
test('img.onerror handler', html.includes('img.onerror'), 'Image load error handling');
test('try-catch in render()', html.includes('} catch(e) {') && html.includes('renderRelated(index);'), 'Error handling in render');
test('No duplicate langTrigger', (html.match(/var langTrigger/g) || []).length <= 1 && (html.match(/const langTrigger/g) || []).length <= 1, 'Single declaration only');

// 3. Check JavaScript syntax
console.log('\n🔍 JavaScript Validation');
const scriptMatch = html.match(/<script id="wp-data"[^>]*>[\s\S]*?<\/script>\s*<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    const jsCode = scriptMatch[1];
    try {
        new Function(jsCode);
        test('JavaScript syntax valid', true, 'No parse errors');
    } catch (e) {
        test('JavaScript syntax valid', false, e.message);
    }
    
    // Check specific functions
    test('init() function defined', jsCode.includes('function init()'), 'Page initialization');
    test('render() function defined', jsCode.includes('function render(index)'), 'Content rendering');
    test('renderRelated() function defined', jsCode.includes('function renderRelated'), 'Related wallpapers');
    test('View toggle listener', jsCode.includes("document.querySelectorAll('.toggle-btn').forEach"), 'Original/Mockup toggle');
    test('Download button handler', jsCode.includes('dlLink.onclick'), 'Download functionality');
    test('Share button handler', jsCode.includes('shareBtnMain.onclick'), 'Share functionality');
    test('Language change listener', jsCode.includes('daoessence:i18n-changed'), 'i18n re-render');
} else {
    test('JavaScript block found', false, 'Could not extract script');
}

// 4. Check dist build
console.log('\n📦 Build Output (dist/)');
const distPath = path.join(process.cwd(), 'dist', 'wallpaper-detail.html');
if (fs.existsSync(distPath)) {
    const distHtml = fs.readFileSync(distPath, 'utf-8');
    test('dist/wallpaper-detail.html exists', true);
    test('dist has wp-data', distHtml.includes('wp-data'), 'JSON embedded in build');
    test('dist has DOMContentLoaded', distHtml.includes('DOMContentLoaded'), 'Correct init timing');
    test('dist has onerror', distHtml.includes('onerror'), 'Error handling preserved');
} else {
    test('dist/wallpaper-detail.html exists', false, 'Build output missing');
}

// 5. Check CSS/Assets
console.log('\n Assets Check');
const distWallpaperHtml = path.join(process.cwd(), 'dist', 'wallpaper.html');
if (fs.existsSync(distWallpaperHtml)) {
    test('dist/wallpaper.html exists', true, 'Aggregate page built');
} else {
    test('dist/wallpaper.html exists', false, 'Aggregate page missing');
}

const distWallpapersJson = path.join(process.cwd(), 'dist', 'wallpapers.json');
if (fs.existsSync(distWallpapersJson)) {
    test('dist/wallpapers.json exists', true, 'JSON copied to dist');
} else {
    test('dist/wallpapers.json exists', false, 'JSON not copied to dist');
}

// 6. Check vercel.json headers
console.log('\n⚙️ Vercel Configuration');
const vercelPath = path.join(process.cwd(), 'vercel.json');
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
const hasWallpaperHeader = vercel.headers && vercel.headers.some(h => 
    h.source && h.source.includes('wallpaper-detail')
);
test('Cache-Control for wallpaper-detail', hasWallpaperHeader, 'Prevents CDN caching');

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);

if (failed === 0) {
    console.log('✅ All tests passed! Wallpaper module is ready.');
} else {
    console.log('❌ Some tests failed. Please review the issues above.');
}
