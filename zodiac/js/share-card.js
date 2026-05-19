/**
 * 生肖运势分享卡片生成器
 * 全局暴露: window.ZodiacShareCard.generate(signName, data, image)
 */
window.ZodiacShareCard = (function() {
    'use strict';

    // 字体加载缓存
    var fontsLoaded = false;
    var FONTS = [
        { family: 'Cinzel', weight: 'bold', url: '/zodiac/fonts/Cinzel-Bold.woff2' },
        { family: 'Inter', weight: 'normal', url: '/zodiac/fonts/Inter-Regular.woff2' },
        { family: 'Inter', weight: 'bold', url: '/zodiac/fonts/Inter-Bold.woff2' },
        { family: 'Playfair Display', style: 'italic', url: '/zodiac/fonts/PlayfairDisplay-Italic.woff2' },
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

    function renderStars(score) {
        var filled = Math.round(score / 20);
        return '\u2605'.repeat(filled) + '\u2606'.repeat(5 - filled);
    }

    function wrapText(ctx, text, maxWidth) {
        var words = text.split(' ');
        var lines = [], currentLine = '';
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    /**
     * 生成分享卡片
     * @param {string} signName - 生肖名（英文大写，如 'DOG'）
     * @param {object} data - { score, number, colorName, direction, quote }
     * @param {HTMLImageElement} image - 生肖插图
     * @returns {Promise<string>} dataUrl (image/jpeg)
     */
    async function generate(signName, data, image) {
        await ensureFonts();
        var W = 1080, H = 1920;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // 1. 背景
        var bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0f0f23');
        bg.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 2. 插图（cover 模式 + 底部渐变遮罩）
        if (image && image.complete && image.naturalWidth > 0) {
            var scale = Math.max(W / image.width, H / image.height);
            ctx.drawImage(image, (W - image.width * scale) / 2, (H - image.height * scale) / 2, image.width * scale, image.height * scale);
            var mask = ctx.createLinearGradient(0, 1000, 0, H);
            mask.addColorStop(0, 'rgba(10,10,26,0)');
            mask.addColorStop(1, 'rgba(10,10,26,0.95)');
            ctx.fillStyle = mask;
            ctx.fillRect(0, 0, W, H);
        }

        // 3. 品牌头
        ctx.fillStyle = '#D4AF37';
        ctx.font = '500 24px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('D A O   E S S E N T I A', W / 2, 50);

        // 4. 数据卡片（固定高度 520px）
        var cx = 90, cw = 900, cy = 1100, ch = 520;
        ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + 24, cy);
        ctx.lineTo(cx + cw - 24, cy);
        ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + 24);
        ctx.lineTo(cx + cw, cy + ch - 24);
        ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - 24, cy + ch);
        ctx.lineTo(cx + 24, cy + ch);
        ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - 24);
        ctx.lineTo(cx, cy + 24);
        ctx.quadraticCurveTo(cx, cy, cx + 24, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        var y = cy + 50;
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 64px "Cinzel", serif';
        ctx.fillText(signName, W / 2, y);
        y += 60;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px "Inter", sans-serif';
        ctx.fillText(renderStars(data.score) + ' ' + data.score + '/100', W / 2, y);
        y += 60;

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '28px "Inter", sans-serif';
        ctx.fillText('Lucky: ' + data.number + ' \u00B7 ' + (data.colorName || ''), W / 2, y);
        y += 40;
        ctx.fillText('Direction: ' + (data.direction || ''), W / 2, y);
        y += 60;

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'italic 32px "Playfair Display", serif';
        var quoteText = data.quote || '';
        var lines = wrapText(ctx, '\u201C' + quoteText + '\u201D', cw - 80);
        lines.forEach(function(l) {
            ctx.fillText(l, W / 2, y);
            y += 45;
        });

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '20px "Inter", sans-serif';
        ctx.fillText('daoessentia.com/zodiac', W / 2, H - 40);

        return canvas.toDataURL('image/jpeg', 0.9);
    }

    return { generate: generate };
})();
