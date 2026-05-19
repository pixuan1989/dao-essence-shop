/**
 * 生肖运势分享卡片生成器 — 优化版 v2
 * 全局暴露: window.ZodiacShareCard.generate(signName, data, image, lang)
 * 优化点：品牌头衬底、生肖名中英文适配、卡片下移毛玻璃
 */
window.ZodiacShareCard = (function() {
    'use strict';

    var fontsLoaded = false;
    // 中英文生肖映射
    var SIGN_NAMES_ZH = {
        rat:'鼠', ox:'牛', tiger:'虎', rabbit:'兔', dragon:'龙', snake:'蛇',
        horse:'马', goat:'羊', monkey:'猴', rooster:'鸡', dog:'狗', pig:'猪'
    };
    var FONTS = [
        { family: 'Cinzel', weight: 'bold', url: '/zodiac/fonts/Cinzel-Bold.woff2' },
        { family: 'Inter', weight: 'normal', url: '/zodiac/fonts/Inter-Regular.woff2' },
        { family: 'Inter', weight: 'bold', url: '/zodiac/fonts/Inter-Bold.woff2' },
        { family: 'Inter', weight: '500', url: '/zodiac/fonts/Inter-Medium.woff2' },
        { family: 'Playfair Display', style: 'italic', url: '/zodiac/fonts/PlayfairDisplay-Italic.woff2' },
        { family: 'Noto Serif SC', weight: '400', url: '/zodiac/fonts/NotoSerifSC-Regular.woff2' },
    ];

    async function ensureFonts() {
        if (fontsLoaded) return;
        try {
            await Promise.all(FONTS.map(function(f) {
                return new FontFace(f.family, 'url(' + f.url + ')', f).load()
                    .then(function(loaded) { document.fonts.add(loaded); })
                    .catch(function() { /* 忽略单个字体加载失败 */ });
            }));
            await document.fonts.ready;
            fontsLoaded = true;
        } catch (e) { fontsLoaded = true; }
    }

    // 检测文本是否包含中文
    function hasChinese(text) {
        return /[\u4e00-\u9fff]/.test(text || '');
    }

    function renderStars(score) {
        var filled = Math.round(score / 20);
        var stars = '';
        for (var i = 0; i < 5; i++) {
            stars += i < filled ? '\u2605' : '\u2606';
        }
        return stars;
    }

    function wrapText(ctx, text, maxWidth) {
        var lines = [], currentLine = '';
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            var testLine = currentLine + char;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    async function generate(signName, data, image, lang) {
        await ensureFonts();
        var W = 1080, H = 1920;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // 检测内容语言（显式 lang 优先，否则自动检测）
        var colorName = data.colorName || '';
        var direction = data.direction || '';
        var quoteText = data.quote || '';
        var isChinese = lang ? (lang === 'zh') : (hasChinese(colorName) || hasChinese(direction) || hasChinese(quoteText));

        // 1. 背景
        var bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0a0a1a');
        bg.addColorStop(1, '#161630');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 2. 插图（cover 模式 + 底部渐变遮罩）
        if (image && image.complete && image.naturalWidth > 0) {
            var scale = Math.max(W / image.width, H / image.height);
            ctx.drawImage(image, (W - image.width * scale) / 2, (H - image.height * scale) / 2, image.width * scale, image.height * scale);
            var mask = ctx.createLinearGradient(0, 900, 0, H);
            mask.addColorStop(0, 'rgba(10,10,26,0)');
            mask.addColorStop(0.6, 'rgba(10,10,26,0.6)');
            mask.addColorStop(1, 'rgba(10,10,26,0.97)');
            ctx.fillStyle = mask;
            ctx.fillRect(0, 0, W, H);
        }

        // 3. 品牌头（增加黑色半透明衬底）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(W/2 - 150, 15, 300, 55);
        
        ctx.fillStyle = 'rgba(212, 175, 55, 0.95)';
        ctx.font = '500 28px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('D A O   E S S E N T I A', W / 2, 42);
        ctx.textBaseline = 'alphabetic';

        // 4. 数据卡片（下移至底部 + 毛玻璃质感）
        var cx = 70, cw = 940, cy = 1420, ch = 420, radius = 24;
        
        // 毛玻璃背景（低透明度 + 稍微亮一点）
        ctx.fillStyle = 'rgba(20, 20, 40, 0.5)';
        ctx.beginPath();
        ctx.moveTo(cx + radius, cy);
        ctx.lineTo(cx + cw - radius, cy);
        ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + radius);
        ctx.lineTo(cx + cw, cy + ch - radius);
        ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - radius, cy + ch);
        ctx.lineTo(cx + radius, cy + ch);
        ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - radius);
        ctx.lineTo(cx, cy + radius);
        ctx.quadraticCurveTo(cx, cy, cx + radius, cy);
        ctx.closePath();
        ctx.fill();
        
        // 玻璃反光边框（亮色细线）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + radius, cy);
        ctx.lineTo(cx + cw - radius, cy);
        ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + radius);
        ctx.lineTo(cx + cw, cy + ch - radius);
        ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - radius, cy + ch);
        ctx.lineTo(cx + radius, cy + ch);
        ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - radius);
        ctx.lineTo(cx, cy + radius);
        ctx.quadraticCurveTo(cx, cy, cx + radius, cy);
        ctx.closePath();
        ctx.stroke();

        // 5. 文案块整体居中（水平 + 垂直）
        var displaySign = (isChinese && SIGN_NAMES_ZH[signName.toLowerCase()]) ? SIGN_NAMES_ZH[signName.toLowerCase()] : signName.toUpperCase();

        // 先测量文案总高度
        var measureY = cy + 80;
        measureY += 80;  // 生肖名
        measureY += 55;  // 星星
        measureY += 48;  // 分数
        measureY += 55;  // 幸运信息
        var quoteLines = wrapText(ctx, '"' + quoteText + '"', cw - 120);
        quoteLines.forEach(function(l) { measureY += 42; });
        var contentHeight = measureY - (cy + 80);

        // 计算垂直居中偏移
        var contentCenterY = (cy + 80) + contentHeight / 2;
        var cardCenterY = cy + ch / 2;
        var offset = cardCenterY - contentCenterY;

        // 渲染分隔线（随整体偏移）
        var ly = cy + 80 + offset;
        var dividerGrad = ctx.createLinearGradient(cx + 100, 0, cx + cw - 100, 0);
        dividerGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
        dividerGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.6)');
        dividerGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.strokeStyle = dividerGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 100, ly);
        ctx.lineTo(cx + cw - 100, ly);
        ctx.stroke();

        // 生肖名称
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 56px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.fillText(displaySign, W / 2, ly + 55);

        // 装饰线
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 40, ly + 67);
        ctx.lineTo(W / 2 + 40, ly + 67);
        ctx.stroke();

        // 星星
        ctx.fillStyle = '#D4AF37';
        ctx.font = '34px "Inter", sans-serif';
        ctx.fillText(renderStars(data.score), W / 2, ly + 110);

        // 分数
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px "Inter", sans-serif';
        ctx.fillText(data.score + ' / 100', W / 2, ly + 158);

        // 幸运信息
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '26px "Inter", sans-serif';
        var luckyNum = data.number || '';
        ctx.fillText('\u{1F308} ' + colorName + '    ' + '\u{1F522} ' + luckyNum + '    ' + '\u{1F9ED} ' + direction, W / 2, ly + 213);

        // 引语
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = isChinese ? '28px "Noto Serif SC", serif' : 'italic 30px "Playfair Display", serif';
        var quoteY = ly + 273;
        quoteLines.forEach(function(l) {
            ctx.fillText(l, W / 2, quoteY);
            quoteY += 42;
        });

        // 底部引流 URL（保持居中）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '22px "Inter", sans-serif';
        ctx.fillText('daoessentia.com/zodiac', W / 2, H - 45);

        return canvas.toDataURL('image/jpeg', 0.92);
    }

    return { generate: generate };
})();
