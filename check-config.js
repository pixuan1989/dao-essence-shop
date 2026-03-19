/* ============================================
   Stripe 配置检查脚本
   验证 .env 文件配置是否正确
   ============================================ */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('========================================');
console.log('🔍 Stripe 配置检查');
console.log('========================================\n');

let hasErrors = false;

// 1. 检查 .env 文件是否存在
console.log('1️⃣ 检查 .env 文件...');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
    console.log('✅ .env 文件存在\n');
} else {
    console.log('❌ .env 文件不存在');
    console.log('   请运行: copy .env.example .env\n');
    hasErrors = true;
}

// 2. 检查必需的环境变量
console.log('2️⃣ 检查环境变量配置...\n');

const requiredVars = [
    { name: 'STRIPE_SECRET_KEY', prefix: 'sk_test_' },
    { name: 'STRIPE_PUBLISHABLE_KEY', prefix: 'pk_test_' },
    { name: 'STRIPE_WEBHOOK_SECRET', prefix: 'whsec_' },
    { name: 'PORT', required: true },
    { name: 'NODE_ENV', required: true }
];

requiredVars.forEach(({ name, prefix, required }) => {
    const value = process.env[name];

    if (!value) {
        console.log(`❌ ${name}: 未设置`);
        hasErrors = true;
    } else if (prefix && !value.startsWith(prefix)) {
        console.log(`❌ ${name}: 格式不正确 (应以 ${prefix} 开头)`);
        console.log(`   当前值: ${value.substring(0, 20)}...`);
        hasErrors = true;
    } else {
        if (prefix) {
            console.log(`✅ ${name}: 已设置 (${value.substring(0, 20)}...)`);
        } else {
            console.log(`✅ ${name}: ${value}`);
        }
    }
});

console.log('');

// 3. 检查依赖包
console.log('3️⃣ 检查依赖包...\n');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});

    const requiredDeps = ['stripe', 'express', 'cors', 'dotenv'];

    requiredDeps.forEach(dep => {
        if (dependencies.includes(dep)) {
            console.log(`✅ ${dep}: 已安装`);
        } else {
            console.log(`❌ ${dep}: 未安装`);
            console.log('   请运行: npm install stripe express cors dotenv');
            hasErrors = true;
        }
    });
} else {
    console.log('❌ package.json 不存在');
    hasErrors = true;
}

console.log('');

// 4. 检查关键文件
console.log('4️⃣ 检查关键文件...\n');

const requiredFiles = [
    'server.js',
    'webhook-handler.js',
    'test-webhook.js',
    'checkout.html'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}: 存在`);
    } else {
        console.log(`❌ ${file}: 不存在`);
        hasErrors = true;
    }
});

console.log('');

// 5. 测试 Stripe 连接
console.log('5️⃣ 测试 Stripe 连接...\n');

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('🔄 正在连接 Stripe API...');

        stripe.balance.retrieve().then(balance => {
            console.log('✅ Stripe API 连接成功');
            console.log('   账户状态:', balance.object);
            console.log('   可用余额:', balance.available[0].amount / 100, balance.available[0].currency);

            console.log('\n========================================');
            if (hasErrors) {
                console.log('❌ 配置检查完成 - 发现问题');
                console.log('========================================\n');
                console.log('请根据上述提示修复问题后重试。');
            } else {
                console.log('✅ 所有检查通过！');
                console.log('========================================\n');
                console.log('🚀 现在可以启动服务器:');
                console.log('   npm start\n');
                console.log('或者测试支付流程:');
                console.log('   node test-webhook.js test\n');
            }

            process.exit(hasErrors ? 1 : 0);
        }).catch(error => {
            console.log('❌ Stripe API 连接失败');
            console.log('   错误:', error.message);
            console.log('   请检查 STRIPE_SECRET_KEY 是否正确\n');
            process.exit(1);
        });
    } catch (error) {
        console.log('❌ 无法加载 Stripe SDK');
        console.log('   错误:', error.message);
        console.log('   请运行: npm install stripe\n');
        hasErrors = true;
    }
} else {
    console.log('⚠️ 跳过 Stripe 连接测试（密钥未配置或格式错误）\n');

    console.log('========================================');
    if (hasErrors) {
        console.log('❌ 配置检查完成 - 发现问题');
        console.log('========================================\n');
        console.log('请根据上述提示修复问题后重试。');
    } else {
        console.log('✅ 基本配置检查通过');
        console.log('========================================\n');
        console.log('⚠️ Stripe 密钥未配置，请先完成以下步骤:');
        console.log('   1. 访问 https://dashboard.stripe.com/test/apikeys');
        console.log('   2. 复制 Secret Key 和 Publishable Key');
        console.log('   3. 更新 .env 文件');
        console.log('   4. 重新运行此脚本验证');
    }
}
