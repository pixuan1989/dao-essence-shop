/**
 * ============================================
 * 八字报告生成 Worker（Vercel Function）
 * 消费 Redis 队列 bazi_report_queue，生成报告并发送邮件
 *
 * 鉴权：Authorization: Bearer <ADMIN_KEY>
 *
 * 用法：
 *   GET /api/process-bazi-report            -> 处理队首 1 个任务（默认，避免超时）
 *   GET /api/process-bazi-report?max=3      -> 最多处理 3 个
 *   GET /api/process-bazi-report?id=ch_xxx  -> 强制处理指定任务
 *   POST /api/process-bazi-report  body:{id:"ch_xxx", max:1}
 *
 * 部署建议：用 Vercel Cron 每分钟调用一次本端点（每次处理 1 个，
 * 长任务由队列 + 超时重置机制保证最终完成）。
 * ============================================
 */

import { processNextJob, processJobById } from '../lib/bazi-report-service.js';

export default async function handler(req, res) {
    const authHeader = req.headers['authorization'];
    const adminKey = process.env.ADMIN_KEY;

    if (!adminKey || !authHeader || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: '未授权' });
    }

    try {
        const id = req.query?.id || req.body?.id;
        if (id) {
            const r = await processJobById(id);
            return res.status(r.error ? 404 : 200).json({ success: !r.error, ...r });
        }

        const max = Math.min(parseInt(req.query?.max || req.body?.max || '1', 10) || 1, 5);
        const results = [];
        for (let i = 0; i < max; i++) {
            const r = await processNextJob();
            if (r.processed === 0) break;
            results.push(r);
            // 处理成功或失败后继续下一个；空队列则退出
        }

        return res.status(200).json({
            success: true,
            processed: results.length,
            results
        });
    } catch (error) {
        console.error('[BaZi Worker] ❌ 处理失败:', error);
        return res.status(500).json({ error: error.message });
    }
}
