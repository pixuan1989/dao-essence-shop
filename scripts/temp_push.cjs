const fs = require('fs');
const path = require('path');
const https = require('https');

// 自动读取 .env.local 文件，不需要安装 dotenv
const envPath = path.join(__dirname, '..', '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');
const env = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        env[key] = val;
    }
});

const URL = env.UPSTASH_REDIS_REST_URL;
const TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

if (!URL || !TOKEN) {
    console.error("❌ 找不到 Redis 配置");
    process.exit(1);
}

// 准备测试数据
const data = {
    id: `manual_test_${Date.now()}`,
    email: "517748938@qq.com",
    name: "wei",
    birthYear: "1993",
    birthMonth: "01",
    birthDay: "14",
    birthHour: "12",
    dominantElement: "Earth",
    source: "wuxing_quiz",
    sendAfter: "2026-06-11T00:00:00Z", // 设置为过去时间
    createdAt: new Date().toISOString()
};

console.log("正在推入队列...");

const req = https.request(`${URL}/LPUSH/pending_auto_reply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log("✅ 成功！已将测试用户推入自动回复队列。");
        console.log("👉 请现在去 GitHub Actions 点击 Run workflow 发送邮件。");
    });
});

req.on('error', e => console.error("❌ 网络请求失败:", e));
req.write(JSON.stringify(data));
req.end();