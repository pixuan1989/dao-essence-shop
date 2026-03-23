/**
 * ========================================
 * Creem 产品同步脚本 - 兼容性文件
 * ========================================
 * 
 * 用途：作为 creem-sync-v2.js 的别名
 * 确保所有引用 creem-sync.js 的代码仍能正常工作
 */

// 重定向到 creem-sync-v2.js
console.log('🔄 creem-sync.js: 重定向到 creem-sync-v2.js');

// 动态加载 creem-sync-v2.js
const script = document.createElement('script');
script.src = 'js/creem-sync-v2.js';
script.defer = true;
document.head.appendChild(script);

// 导出与 creem-sync-v2.js 相同的接口
if (typeof module !== 'undefined' && module.exports) {
  try {
    const v2Module = require('./creem-sync-v2.js');
    module.exports = v2Module;
  } catch (e) {
    console.warn('⚠️ 无法加载 creem-sync-v2.js 模块');
  }
}
