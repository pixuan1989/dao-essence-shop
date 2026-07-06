#!/usr/bin/env node
/**
 * 本地八字报告 Worker
 * 在没有 Vercel 函数超时限制的环境下，消费 bazi_report_queue 并发送邮件。
 *
 * 用法：
 *   node scripts/run-report-worker.cjs            # 排空队列（直到空或手动 Ctrl+C）
 *   node scripts/run-report-worker.cjs --once     # 只处理一个
 *   node scripts/run-report-worker.cjs --id ch_xxx  # 强制处理指定任务
 *
 * 依赖环境变量（从项目根 .env.local 自动读取，或手动 export）：
 *   KV_REST_API_URL / KV_REST_API_TOKEN   (Upstash Redis)
 *   DASHSCOPE_API_KEY                       (qwen)
 *   ALIYUN_EMAIL_ACCOUNT / ALIYUN_SMTP_PASSWORD  (邮件)
 */
const fs = require('fs');
const path = require('path');

// 载入项目根目录的 .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const txt = fs.readFileSync(envPath, 'utf8');
    for (const line of txt.split('\n')) {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.+?)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    console.log('✅ 已从 .env.local 载入环境变量');
}

const args = process.argv.slice(2);
const once = args.includes('--once');
const idArg = (() => { const i = args.indexOf('--id'); return i >= 0 ? args[i + 1] : null; })();

async function main() {
    const svc = await import('../lib/bazi-report-service.js');
    console.log('🚀 八字报告 Worker 启动');

    if (idArg) {
        const r = await svc.processJobById(idArg);
        console.log('结果:', JSON.stringify(r, null, 2));
        return;
    }

    let count = 0;
    while (true) {
        const r = await svc.processNextJob();
        if (r.processed === 0) {
            console.log('✅ 队列已清空');
            break;
        }
        count++;
        console.log(`[${count}] ${r.id} ->`, JSON.stringify(r).slice(0, 200));
        if (once) break;
    }
    console.log(`=== 完成，共处理 ${count} 个任务 ===`);
}

main().catch(err => {
    console.error('❌ Worker 崩溃:', err.message);
    process.exit(1);
});
