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
    
    // 璋冭瘯锛氬湪缃戦〉涓婃樉绀衡€滆剼鏈凡杩愯鈥?
    if (container) {
      container.innerHTML = '<div style="color:#fff;font-size:14px;">[鑴氭湰宸插惎鍔╙ 姝ｅ湪璇锋眰澹佺焊鏁版嵁...</div>';
    }
    if (!grid) {
      if (container) container.innerHTML += '<div style="color:red;font-size:14px;">[閿欒] 鎵句笉鍒版樉绀哄尯鍩?(zodiac-wp-grid)</div>';
      return;
    }

    try {
      const res = await fetch('/wallpapers-lite.json');
      if (!res.ok) {
        if (container) container.innerHTML = '<div style="color:red;font-size:14px;">[璇锋眰澶辫触] 缃戠粶鐘舵€佺爜: ' + res.status + '</div>';
        return;
      }
      
      const wps = await res.json();
      
      // 璋冭瘯锛氬湪缃戦〉涓婃樉绀鸿幏鍙栧埌鐨勬暟鎹噺
      if (container) container.innerHTML = '<div style="color:#4ade80;font-size:14px;">[鎴愬姛] 鑾峰彇鍒?' + wps.length + ' 寮犲绾革紝姝ｅ湪娓叉煋...</div>';

      if (wps.length === 0) {
        if (container) container.innerHTML += '<div style="color:orange;font-size:14px;">[璀﹀憡] 鏁版嵁涓虹┖</div>';
        return;
      }

      // 闅忔満閫?3 寮?
      const picks = wps.sort(() => 0.5 - Math.random()).slice(0, 3);

      picks.forEach(wp => {
        const a = document.createElement('a');
        a.href = '/wallpaper/' + (wp.slug || wp.id);
        a.style.cssText = "display:block;width:110px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);transition:transform 0.2s;";
        // 妫€鏌ユ槸鍚︽湁缂╃暐鍥?
        if (!wp.thumb) {
          console.warn('澹佺焊缂哄皯 thumb 瀛楁', wp);
        }
        a.innerHTML = '<img src="' + (wp.thumb || '') + '" style="width:100%;display:block;min-height:150px;background:#333;" loading="lazy"/>';
        a.onmouseenter = () => a.style.transform = "translateY(-4px)";
        a.onmouseleave = () => a.style.transform = "";
        grid.appendChild(a);
      });
      
      // 娓叉煋鎴愬姛鍚庯紝绉婚櫎璋冭瘯鏂囧瓧锛堟垨鑰呬繚鐣欎竴涓垚鍔熸彁绀猴級
      // container.innerHTML = ''; // 鏆傛椂淇濈暀璋冭瘯淇℃伅浠ヤ究纭
      
    } catch (e) {
      // 璋冭瘯锛氬湪缃戦〉涓婃樉绀哄叿浣撴姤閿欎俊鎭?
      if (container) {
        container.innerHTML = '<div style="color:red;font-size:14px;text-align:left;padding:10px;">'
          + '<strong>[鑴氭湰鎶ラ敊]</strong><br>'
          + e.message + '<br>'
          + '<small>璇锋埅鍥炬淇℃伅鍙嶉</small>'
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
