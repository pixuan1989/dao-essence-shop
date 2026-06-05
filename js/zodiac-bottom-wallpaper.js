/**
 * Zodiac Aggregate Bottom Wallpaper Module (Append-Only)
 * Function: Renders 3 random wallpapers at the bottom of the aggregate page.
 * Debug: Displays status text on the webpage for troubleshooting.
 */
(function() {
  'use strict';

  async function init() {
    const grid = document.getElementById('zodiac-wp-grid');
    const container = document.getElementById('zodiac-wp-rec-container');
    
    // 调试：在网页上显示“脚本已运行”
    if (container) {
      container.innerHTML = '<div style="color:#fff;font-size:14px;">[脚本已启动] 正在请求壁纸数据...</div>';
    }
    if (!grid) {
      if (container) container.innerHTML += '<div style="color:red;font-size:14px;">[错误] 找不到显示区域 (zodiac-wp-grid)</div>';
      return;
    }

    try {
      const res = await fetch('/wallpapers.json');
      if (!res.ok) {
        if (container) container.innerHTML = '<div style="color:red;font-size:14px;">[请求失败] 网络状态码: ' + res.status + '</div>';
        return;
      }
      
      const wps = await res.json();
      
      // 调试：在网页上显示获取到的数据量
      if (container) container.innerHTML = '<div style="color:#4ade80;font-size:14px;">[成功] 获取到 ' + wps.length + ' 张壁纸，正在渲染...</div>';

      if (wps.length === 0) {
        if (container) container.innerHTML += '<div style="color:orange;font-size:14px;">[警告] 数据为空</div>';
        return;
      }

      // 随机选 3 张
      const picks = wps.sort(() => 0.5 - Math.random()).slice(0, 3);

      picks.forEach(wp => {
        const a = document.createElement('a');
        a.href = '/wallpaper/' + (wp.slug || wp.id);
        a.style.cssText = "display:block;width:110px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);transition:transform 0.2s;";
        // 检查是否有缩略图
        if (!wp.thumb) {
          console.warn('壁纸缺少 thumb 字段', wp);
        }
        a.innerHTML = '<img src="' + (wp.thumb || '') + '" style="width:100%;display:block;min-height:150px;background:#333;" loading="lazy"/>';
        a.onmouseenter = () => a.style.transform = "translateY(-4px)";
        a.onmouseleave = () => a.style.transform = "";
        grid.appendChild(a);
      });
      
      // 渲染成功后，移除调试文字（或者保留一个成功提示）
      // container.innerHTML = ''; // 暂时保留调试信息以便确认
      
    } catch (e) {
      // 调试：在网页上显示具体报错信息
      if (container) {
        container.innerHTML = '<div style="color:red;font-size:14px;text-align:left;padding:10px;">'
          + '<strong>[脚本报错]</strong><br>'
          + e.message + '<br>'
          + '<small>请截图此信息反馈</small>'
          + '</div>';
      }
      console.error('[Zodiac Wallpaper] Error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
