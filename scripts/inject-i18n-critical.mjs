/**
 * inject-i18n-critical.mjs
 *
 * 消除中文界面首屏闪烁（FOUC）的构建期注入器。
 *
 * 原理：
 *   站点默认文案为英文，i18n-switcher.js 通过异步 fetch('/i18n/zh.json')
 *   在 DOMContentLoaded 之后才把 [data-i18n] 替换成中文，导致中文用户在首屏
 *   先看到英文再跳中文。
 *
 *   本脚本在【构建期】为每个 HTML 提取页面实际用到的 data-i18n* 键，从
 *   i18n/zh.json 生成「该页专属的精简中文词典」，并以一段【同步、非 defer】
 *   的内联脚本注入到 </body> 之前。该脚本在浏览器解析到页尾时（首屏绘制前）
 *   按与 i18n-switcher.js 一致的语言判定逻辑，若命中中文则立即同步预翻译，
 *   并把英文原文缓存到 window.__I18N_CRIT_ORIGINAL__，供 i18n-switcher.js
 *   的 cacheOriginalTexts() 复用，保证之后切回英文能正确还原。
 *
 * 幂等：以 <!-- i18n-critical-injected --> 标记，重复运行会先移除旧块再注入。
 *
 * 用法：
 *   node scripts/inject-i18n-critical.mjs            # 处理全站所有 .html
 *   node scripts/inject-i18n-critical.mjs shop.html  # 仅处理指定文件（试点/调试）
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const MARKER = '<!-- i18n-critical-injected -->';

// 需要提取键值的属性（中文需来自词典）
const KEY_ATTRS = [
  'data-i18n',
  'data-i18n-placeholder',
  'data-i18n-prefix',
  'data-i18n-suffix',
];

// data-zh-* 系列：中文直接写在属性值里，无需词典，但需与 i18n-switcher 的缓存键对齐
const ZH_ATTRS = [
  'data-zh-cat',
  'data-zh-text',
  'data-zh-title',
  'data-zh-desc',
  'data-zh-faq',
  'data-zh-faq-a',
];

function loadZh() {
  const p = join(ROOT, 'i18n', 'zh.json');
  return JSON.parse(readFileSync(p, 'utf8'));
}

function resolveNested(obj, key) {
  if (!obj || !key) return null;
  return key.split('.').reduce(function (o, k) {
    return (o && o[k] !== undefined) ? o[k] : null;
  }, obj);
}

function setNested(obj, key, value) {
  const parts = key.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function extractKeys(html) {
  const keys = new Set();
  for (const attr of KEY_ATTRS) {
    const re = new RegExp(attr + '="([^"]+)"', 'g');
    let m;
    while ((m = re.exec(html)) !== null) {
      // data-i18n 可能包含多个键（空格分隔）？本站点均为单键，按单键处理
      const v = m[1].trim();
      if (v) keys.add(v);
    }
  }
  return keys;
}

function hasZhAttr(html) {
  return ZH_ATTRS.some((a) => html.indexOf(a + '=') !== -1 || html.indexOf(a + ' =') !== -1);
}

function buildCriticalScript(dict) {
  // 将 < 转义，避免中文内容中出现 </script> 时破坏脚本块
  const dictJson = JSON.stringify(dict).replace(/</g, '\\u003c');
  return `${MARKER}
<script>
(function(){
  if (window.__I18N_CRIT_DONE__) return;
  window.__I18N_CRIT_DONE__ = true;
  try {
    var SUPPORTED = ['en', 'zh'], DEFAULT = 'en', STORAGE_KEY = 'daoessence_lang';
    function getSaved(){ try { return localStorage.getItem(STORAGE_KEY); } catch(e){ return null; } }
    function detect(){ var n = navigator.language || navigator.userLanguage || ''; var c = n.split('-')[0].toLowerCase(); return SUPPORTED.indexOf(c) !== -1 ? c : null; }
    function getInitial(){
      var p = location.pathname;
      if (p.indexOf('/zh/') === 0 || p === '/zh') return 'zh';
      try { var params = new URLSearchParams(location.search); var ul = params.get('lang'); if (ul && SUPPORTED.indexOf(ul) !== -1) return ul; } catch(e){}
      var s = getSaved(); if (s && SUPPORTED.indexOf(s) !== -1) return s;
      var b = detect(); if (b) return b;
      return DEFAULT;
    }
    var lang = getInitial();
    if (lang !== 'zh') return; // 仅中文需要首屏预翻译
    var DICT = ${dictJson};
    if (!DICT || Object.keys(DICT).length === 0) return;
    var orig = {};
    function gnv(obj, key){ if(!obj||!key) return null; return key.split('.').reduce(function(o,k){ return (o&&o[k]!==undefined)?o[k]:null; }, obj); }
    // data-i18n
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++){
      var el = els[i]; var k = el.getAttribute('data-i18n');
      if (k && !orig[k]) orig[k] = el.innerHTML;
      var v = gnv(DICT, k); if (typeof v === 'string') el.innerHTML = v;
    }
    // placeholder
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var pi = 0; pi < phs.length; pi++){
      var pe = phs[pi]; var pk = pe.getAttribute('data-i18n-placeholder');
      var ck = '__placeholder__' + pk;
      if (pk && !orig[ck]) orig[ck] = pe.getAttribute('placeholder');
      var pv = gnv(DICT, pk); if (typeof pv === 'string') pe.setAttribute('placeholder', pv);
    }
    // prefix / suffix
    var pfx = document.querySelectorAll('[data-i18n-prefix]');
    for (var j = 0; j < pfx.length; j++){
      var pel = pfx[j]; var ck2 = '__prefix_suffix__' + j;
      pel.setAttribute('data-i18n-cache-key', ck2);
      if (!orig[ck2]) orig[ck2] = pel.innerHTML;
      var pv2 = gnv(DICT, pel.getAttribute('data-i18n-prefix')) || '';
      var sv2 = gnv(DICT, pel.getAttribute('data-i18n-suffix')) || '';
      var kids = []; for (var c = 0; c < pel.childNodes.length; c++) kids.push(pel.childNodes[c].cloneNode(true));
      pel.textContent = '';
      if (typeof pv2 === 'string' && pv2) pel.appendChild(document.createTextNode(pv2 + ' '));
      for (var k2 = 0; k2 < kids.length; k2++) pel.appendChild(kids[k2]);
      if (typeof sv2 === 'string' && sv2) pel.appendChild(document.createTextNode(' ' + sv2));
    }
    // data-zh-* （中文直接写在属性值里）
    var zmap = [['data-zh-cat','__zhcat__'],['data-zh-text','__zhtext__'],['data-zh-title','__zhtitle__'],['data-zh-desc','__zhdesc__'],['data-zh-faq','__zhfaq__'],['data-zh-faq-a','__zhfqa__']];
    for (var z = 0; z < zmap.length; z++){
      var attr = zmap[z][0], pre = zmap[z][1];
      var nodes = document.querySelectorAll('[' + attr + ']');
      for (var zi = 0; zi < nodes.length; zi++){
        var n = nodes[zi]; var key = pre + zi;
        if (!orig[key]) orig[key] = n.textContent;
        var val = n.getAttribute(attr); if (val) n.textContent = val;
      }
    }
    window.__I18N_CRIT_ORIGINAL__ = orig;
    try { document.documentElement.lang = 'zh-Hant'; } catch(e){}
  } catch(e){}
})();
</script>
`;
}

function removeOldBlock(html) {
  const idx = html.indexOf(MARKER);
  if (idx === -1) return html;
  const end = html.indexOf('</script>', idx);
  if (end === -1) return html;
  return html.slice(0, idx) + html.slice(end + '</script>'.length);
}

function injectInto(html, dict) {
  const cleaned = removeOldBlock(html);
  const block = buildCriticalScript(dict);
  const bodyIdx = cleaned.lastIndexOf('</body>');
  if (bodyIdx === -1) return { html: cleaned, injected: false };
  return { html: cleaned.slice(0, bodyIdx) + block + '\n' + cleaned.slice(bodyIdx), injected: true };
}

function processFile(path, zh) {
  let html;
  try { html = readFileSync(path, 'utf8'); } catch (e) { return { ok: false, reason: 'read' }; }
  if (html.indexOf(MARKER) === -1 && html.indexOf('</body>') === -1) {
    return { ok: false, reason: 'no-body' };
  }
  const keys = extractKeys(html);
  const dict = {};
  keys.forEach((k) => {
    const v = resolveNested(zh, k);
    if (v !== null && typeof v !== 'object') setNested(dict, k, v);
  });
  // 仅当页面确实用到可翻译的键（data-i18n* 能解析出中文，或存在 data-zh-*）时才注入，
  // 避免对双语静态页/无 i18n 的页注入无意义的空脚本，造成巨大 diff 与风险。
  const hasBenefit = Object.keys(dict).length > 0 || hasZhAttr(html);
  if (!hasBenefit) {
    // 若此前已注入过空块，幂等移除
    const cleaned = removeOldBlock(html);
    if (cleaned !== html) writeFileSync(path, cleaned);
    return { ok: false, reason: 'no-keys' };
  }
  const { html: out, injected } = injectInto(html, dict);
  if (!injected) return { ok: false, reason: 'no-inject' };
  writeFileSync(path, out);
  return { ok: true, keys: keys.size, resolved: Object.keys(dict).length };
}

// ── 文件遍历 ──
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.venv', '.workbuddy', 'tmp', 'logs', 'reports', 'venv_ocr']);

function walk(dir, acc) {
  let entries;
  try { entries = readdirSync(dir); } catch (e) { return acc; }
  for (const name of entries) {
    if (name === '.' || name === '..') continue;
    if (EXCLUDE_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch (e) { continue; }
    if (st.isDirectory()) {
      walk(full, acc);
    } else if (st.isFile() && name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  const args = process.argv.slice(2);
  const zh = loadZh();
  let targets;
  if (args.length > 0) {
    targets = args.map((a) => resolve(ROOT, a)).filter((p) => {
      try { return statSync(p).isFile(); } catch (e) { return false; }
    });
  } else {
    targets = walk(ROOT, []);
  }
  let total = 0, skipped = 0, keysTotal = 0;
  for (const t of targets) {
    const r = processFile(t, zh);
    if (r.ok) {
      total++;
      keysTotal += r.resolved;
      console.log(`  ✓ ${t.replace(ROOT + '/', '')}  (keys: ${r.resolved}/${r.keys})`);
    } else {
      skipped++;
      if (r.reason !== 'no-body') console.log(`  - skip ${t.replace(ROOT + '/', '')} (${r.reason})`);
    }
  }
  console.log(`\nDone: ${total} injected, ${skipped} skipped, ${keysTotal} keys inlined.`);
}

main();
