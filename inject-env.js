/**
 * 环境变量注入脚本
 * 在构建时将环境变量注入到 HTML 文件
 */

const fs = require('fs');
const path = require('path');

// 要处理的 HTML 文件
const htmlFiles = [
    'index.html',
    'checkout.html',
    'order-confirm.html'
];

// Stripe 公钥
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY || '';

console.log('🔧 Injecting Stripe configuration...');

htmlFiles.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 查找 </head> 标签并在其前面插入配置
        const configScript = `
<script>
window.stripeConfig = {
    publicKey: '${stripePublicKey}'
};
</script>`;

        // 如果还没有配置脚本，就添加
        if (!content.includes('window.stripeConfig')) {
            content = content.replace('</head>', configScript + '</head>');
            console.log(`✅ Injected config into: ${fileName}`);
        } else {
            // 更新现有配置
            content = content.replace(
                /window\.stripeConfig = \{[^}]+\}/,
                `window.stripeConfig = {\n    publicKey: '${stripePublicKey}'\n}`
            );
            console.log(`✅ Updated config in: ${fileName}`);
        }

        // 保存修改后的文件
        fs.writeFileSync(filePath, content, 'utf8');

    } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error);
    }
});

console.log('✨ Stripe configuration injected successfully!');
