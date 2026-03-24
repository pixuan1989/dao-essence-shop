console.log('========================================');
console.log('🔍 快速配置检查');
console.log('========================================\n');

const fs = require('fs');
const path = require('path');

// 1. 检查 .env 文件
console.log('1️⃣ 检查 .env 文件...');
if (fs.existsSync('.env')) {
    console.log('✅ .env 文件存在\n');
} else {
    console.log('❌ .env 文件不存在');
    console.log('   请执行: copy .env.example .env\n');
    process.exit(1);
}

// 2. 读取 .env 内容
console.log('2️⃣ 检查环境变量...\n');
const envContent = fs.readFileSync('.env', 'utf8');

const checks = [
    { name: 'STRIPE_SECRET_KEY', prefix: 'sk_test_' },
    { name: 'STRIPE_PUBLISHABLE_KEY', prefix: 'pk_test_' },
    { name: 'STRIPE_WEBHOOK_SECRET', prefix: 'whsec_' }
];

let allConfigured = true;

checks.forEach(({ name, prefix }) => {
    const match = envContent.match(new RegExp(`^${name}=(.+)$`, 'm'));
    if (match && match[1]) {
        const value = match[1].trim();
        if (value.startsWith('your_') || value === '') {
            console.log(`❌ ${name}: 未配置`);
            allConfigured = false;
        } else if (value.startsWith(prefix)) {
            console.log(`✅ ${name}: 已配置 (${value.substring(0, 20)}...)`);
        } else {
            console.log(`❌ ${name}: 格式错误 (应以 ${prefix} 开头)`);
            allConfigured = false;
        }
    } else {
        console.log(`❌ ${name}: 未设置`);
        allConfigured = false;
    }
});

console.log('\n========================================');
if (allConfigured) {
    console.log('✅ 配置检查通过！');
    console.log('========================================\n');
    console.log('🚀 下一步操作:\n');
    console.log('1. 启动服务器:');
    console.log('   npm start\n');
    console.log('2. 测试支付流程:');
    console.log('   node test-webhook.js test\n');
    console.log('3. 查看详细配置指南:');
    console.log('   查看 CONFIGURE_ENV_GUIDE.md\n');
} else {
    console.log('❌ 配置不完整');
    console.log('========================================\n');
    console.log('请完成以下步骤:\n');
    console.log('1. 访问 Stripe Dashboard:');
    console.log('   https://dashboard.stripe.com/test/apikeys\n');
    console.log('2. 获取密钥:');
    console.log('   - Secret Key (sk_test_...)');
    console.log('   - Publishable Key (pk_test_...)');
    console.log('   - Webhook Secret (whsec_...)\n');
    console.log('3. 创建 Webhook:');
    console.log('   https://dashboard.stripe.com/test/webhooks\n');
    console.log('   Endpoint URL: http://localhost:3001/api/webhook\n');
    console.log('4. 更新 .env 文件:\n');
    console.log('   STRIPE_SECRET_KEY=sk_test_...\n');
    console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_...\n');
    console.log('   STRIPE_WEBHOOK_SECRET=whsec_...\n');
    console.log('5. 重新运行此脚本验证:\n');
    console.log('   node quick-check.js\n');
}

process.exit(allConfigured ? 0 : 1);
