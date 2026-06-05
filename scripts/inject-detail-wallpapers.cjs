const fs = require('fs');
const path = require('path');

const dir = './zodiac';
// 只处理 rat.html, pig.html, rat-en.html 等，排除 zodiac-daily.html
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !f.includes('daily') && !f.includes('zodiac-detail'));

console.log(`Found ${files.length} files to update.`);

// 简单的生肖中英文映射（用于生成标题）
const signMap = {
  'rat': 'Rat', 'ox': 'Ox', 'tiger': 'Tiger', 'rabbit': 'Rabbit', 'dragon': 'Dragon', 'snake': 'Snake',
  'horse': 'Horse', 'goat': 'Goat', 'monkey': 'Monkey', 'rooster': 'Rooster', 'dog': 'Dog', 'pig': 'Pig'
};
const signMapZh = {
  'rat': '鼠', 'ox': '牛', 'tiger': '虎', 'rabbit': '兔', 'dragon': '龙', 'snake': '蛇',
  'horse': '马', 'goat': '羊', 'monkey': '猴', 'rooster': '鸡', 'dog': '狗', 'pig': '猪'
};

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否已经包含壁纸代码，防止重复插入
  if (content.includes('zodiac-detail-wp-grid')) {
    console.log(`Skipped (already has wallpaper): ${file}`);
    return;
  }

  // 提取基础文件名 (e.g., "pig" from "pig.html" or "pig-en.html")
  const baseName = file.replace('-en.html', '').replace('.html', '');
  const isEn = file.includes('-en');
  
  // 生成标题
  let title = "";
  let btnText = "";
  
  if (isEn) {
    const signEn = signMap[baseName] || baseName;
    title = `Today's Lucky Wallpaper for ${signEn}`;
    btnText = 'Browse All Wallpapers →';
  } else {
    const signZh = signMapZh[baseName] || baseName;
    title = `今日${signZh}幸运壁纸`;
    btnText = '查看更多玄学壁纸 →';
  }

  // 壁纸 HTML 块 (包含内联脚本，无需外部依赖，确保 100% 显示)
  const wpHtml = `
    <!-- Lucky Wallpaper Recommendation Module -->
    <div style="margin-top:32px;padding:24px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;text-align:center;">
      <h3 style="font-size:16px;color:#D4AF37;margin-bottom:16px;">${title}</h3>
      <div id="zodiac-detail-wp-grid" style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;"></div>
      <a href="/wallpaper" style="display:inline-block;margin-top:16px;padding:8px 20px;background:rgba(212,175,55,0.15);color:#D4AF37;border:1px solid rgba(212,175,55,0.3);border-radius:6px;text-decoration:none;font-size:13px;">${btnText}</a>
    </div>
    <script>
    (function(){
      var grid=document.getElementById('zodiac-detail-wp-grid');
      if(!grid)return;
      fetch('/wallpapers.json').then(function(r){return r.ok?r.json():null;}).then(function(wps){
        if(!wps||!wps.length)return;
        wps.sort(function(){return 0.5-Math.random();}).slice(0,4).forEach(function(wp){
          var a=document.createElement('a');
          a.href='/wallpaper/'+(wp.slug||wp.id);
          a.style.cssText='display:block;width:130px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);transition:transform 0.2s;';
          a.innerHTML='<img src="'+(wp.thumb||'')+'" style="width:100%;display:block;" loading="lazy"/>';
          a.onmouseenter=function(){a.style.transform='translateY(-3px)';};
          a.onmouseleave=function(){a.style.transform='';};
          grid.appendChild(a);
        });
      }).catch(function(e){console.error('[Detail WP]',e);});
    })();
    </script>
  `;

  // 插入位置策略：
  // 优先插入到 <div class="seo-divider"> (生肖百科区域) 之前
  // 如果找不到，插入到 <footer> 之前
  const marker = '<div class="seo-divider">';
  const footerMarker = '<footer class="footer">';
  
  if (content.includes(marker)) {
    content = content.replace(marker, wpHtml + marker);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated (before bio): ${file}`);
  } else if (content.includes(footerMarker)) {
    content = content.replace(footerMarker, wpHtml + footerMarker);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated (before footer): ${file}`);
  } else {
    console.log(`❌ No marker found: ${file}`);
  }
});

console.log('🎉 All done!');
