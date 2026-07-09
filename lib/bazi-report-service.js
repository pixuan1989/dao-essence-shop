/**
 * ============================================
 * 八字报告生成 + 邮件发送 服务层
 * 被 webhook（内联触发）和 worker（队列消费）共用
 * ============================================
 *
 * 设计：
 * - generateBaziReport(orderData) 由 CJS 模块提供（排盘+AI+PDF）
 * - sendSingleMail 由 marketing.js 提供（阿里云 SMTP）
 * - 队列以 Redis list `bazi_report_queue` 保存 checkoutId
 * - 任务明细以 `bazi_report_job:{id}` 保存，含 status 防重入
 *
 * status: pending -> processing -> done / (失败回退 pending 进队重试)
 */

import { createRequire } from 'module';
import fs from 'fs';
import { redisGet, redisSet, redisDel } from '../shared/redis.js';
import { sendSingleMail, getEmailWrapper } from './marketing.js';

const require = createRequire(import.meta.url);
const { generateBaziReport } = require('./generate-bazi-report.cjs');

const QUEUE_KEY = 'bazi_report_queue';
const jobKey = (id) => `bazi_report_job:${id}`;

// 隔离赠品：买报告送旺运壁纸合集（默认关闭，避免影响现有邮件逻辑；上线时改 true）
const INCLUDE_WALLPAPER_GIFT = true;
const JOB_TTL = 86400 * 7; // 7 天

/**
 * 检测并修复可能的中文乱码
 * Windows Git Bash curl 等环境下 POST 中文 JSON 时可能产生编码破坏，
 * 表现为包含 U+FFFD 替换字符或大量非期望字符。
 * 乱码时 fallback 到安全默认值。
 */
function sanitizeChinese(str, fallback = '用戶') {
    if (!str) return fallback;
    // 检测 Unicode 替换字符（编码破坏的典型标志）
    if (str.includes('\uFFFD')) {
        console.warn(`[BaZi] ⚠️ 检测到乱码名称(含U+FFFD): "${str.slice(0,20)}" → 使用fallback "${fallback}"`);
        return fallback;
    }
    // 检测是否全是 CJK 范围外的不可读字符（排除常见中文名+英文/数字/点）
    const printable = str.replace(/[\w\u4e00-\u9fff\u3400-\u4dbf\.\-\s]/g, '');
    if (printable.length > str.length * 0.5) {
        console.warn(`[BaZi] ⚠️ 检测到可疑名称(非打印字符过多): "${str.slice(0,20)}" → 使用fallback "${fallback}"`);
        return fallback;
    }
    return str;
}

// ─── 生成报告并发送邮件 ───
export async function generateAndEmailReport(orderData) {
    // 防御性编码修复：确保中文字段不会因上游编码问题变成乱码
    orderData.name = sanitizeChinese(orderData.name);
    if (orderData.customerName) orderData.customerName = sanitizeChinese(orderData.customerName);

    const { htmlPath, pdfPath, baziData } = await generateBaziReport(orderData);
    const name = orderData.name || baziData?.name || 'User';

    // 附件：PDF（打印/收藏）+ HTML（网页版，无分页空白）双发
    const attachments = [];
    const hasPdf = !!(pdfPath && fs.existsSync(pdfPath));
    const hasHtml = !!(htmlPath && fs.existsSync(htmlPath));
    let reportKind = hasPdf && hasHtml ? 'PDF+HTML' : hasPdf ? 'PDF' : 'HTML';

    if (hasPdf) {
        attachments.push({
            filename: `BaZi-Report-${sanitize(name)}.pdf`,
            content: fs.readFileSync(pdfPath),
            encoding: 'buffer',
            contentType: 'application/pdf'
        });
    }
    if (hasHtml) {
        attachments.push({
            filename: `BaZi-Report-${sanitize(name)}.html`,
            content: fs.readFileSync(htmlPath),
            encoding: 'buffer',
            contentType: 'text/html'
        });
    }

    if (attachments.length === 0) {
        throw new Error('报告文件生成失败（PDF/HTML 均不存在）');
    }

    const lang = orderData.language === 'zh' ? 'zh' : 'en';
    const subject = lang === 'zh'
        ? '您的八字命理报告已生成 / Your BaZi Report is Ready'
        : 'Your BaZi Destiny Report is Ready';
    const bodyHtml = buildReportEmailBody(name, baziData, reportKind, lang);
    const fullHtml = getEmailWrapper('DAO Essence · 八字命理报告', bodyHtml);

    await sendSingleMail({
        to: orderData.email,
        subject,
        htmlBody: fullHtml,
        images: attachments
    });

    console.log(`[BaZi] ✅ 邮件已发送至 ${orderData.email} (附件: ${reportKind}, 共${attachments.length}个)`);
    return { htmlPath, pdfPath, reportKind };
}

// ─── 消费队列头部一个任务（不预先出队，成功才出队，防丢失） ───
export async function processNextJob() {
    const queue = await redisGet(QUEUE_KEY) || [];
    if (queue.length === 0) return { processed: 0 };

    const id = queue[0];
    const job = await redisGet(jobKey(id));
    if (!job) {
        // 任务数据丢失，出队
        await redisSet(QUEUE_KEY, queue.slice(1));
        return { processed: 0, id, error: 'JOB_DATA_MISSING' };
    }

    const result = await runJob(id, job);
    // runJob 内部已处理重试入队（pending-retry 推队尾）；这里一律出队队头，
    // 保证 done / failed / 跳过 都会移除，队列永不卡死
    await redisSet(QUEUE_KEY, queue.slice(1));
    return { processed: 1, id, ...result };
}

// ─── 按 ID 处理（手动触发用） ───
export async function processJobById(id) {
    const job = await redisGet(jobKey(id));
    if (!job) return { id, error: 'NOT_FOUND' };
    return runJob(id, job);
}

// ─── 实际执行单个任务（含防重入 / 超时重置） ───
async function runJob(id, job) {
    if (job.status === 'done') {
        return { id, status: 'done', skipped: true };
    }
    if (job.status === 'processing') {
        const started = job.startedAt ? Date.now() - new Date(job.startedAt).getTime() : Infinity;
        if (started < 15 * 60 * 1000) {
            return { id, status: 'processing', skipped: true }; // 15 分钟内视为进行中/被冻结
        }
        console.log(`[BaZi] 任务 ${id} 处理超时，重置为 pending 重试`);
    }

    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    await redisSet(jobKey(id), job);

    try {
        const r = await generateAndEmailReport(job);
        job.status = 'done';
        job.completedAt = new Date().toISOString();
        job.result = r;
        await redisSet(jobKey(id), job);
        return { id, status: 'done', ...r };
    } catch (err) {
        job.retryCount = (job.retryCount || 0) + 1;
        job.lastError = err.message;
        job.failedAt = new Date().toISOString();
        if (job.retryCount >= 3) {
            // 超过重试上限：标记 failed 且不再入队，避免卡死整个队列
            job.status = 'failed';
            await redisSet(jobKey(id), job);
            console.error(`[BaZi] ❌ 任务 ${id} 重试 ${job.retryCount} 次仍失败，标记 failed（不再重试，队列继续）`);
            return { id, status: 'failed', error: err.message, retries: job.retryCount };
        }
        job.status = 'pending';
        await redisSet(jobKey(id), job);
        // 放回队尾以便重试
        const q = await redisGet(QUEUE_KEY) || [];
        if (!q.includes(id)) {
            q.push(id);
            await redisSet(QUEUE_KEY, q);
        }
        return { id, status: 'pending-retry', error: err.message, retries: job.retryCount };
    }
}

// ─── 入队（webhook 调用） ───
export async function enqueueReportJob(orderData) {
    const id = orderData.checkoutId || `report_${Date.now()}`;
    const job = { ...orderData, checkoutId: id, status: 'pending' };
    await redisSet(jobKey(id), job, JOB_TTL);
    const q = await redisGet(QUEUE_KEY) || [];
    if (!q.includes(id)) {
        q.push(id);
        await redisSet(QUEUE_KEY, q);
    }
    console.log(`[BaZi] 📤 已入队报告任务: ${id}`);
    return id;
}

// ─── 邮件正文 ───
function buildReportEmailBody(name, baziData, reportKind, lang) {
    const four = baziData
        ? `${baziData.yearGan}${baziData.yearZhi} ${baziData.monthGan}${baziData.monthZhi} ${baziData.dayGan}${baziData.dayZhi} ${baziData.hourGan}${baziData.hourZhi}`
        : '';
    let htmlNote = '';
    if (reportKind === 'PDF+HTML') {
        htmlNote = lang === 'zh'
            ? '<p style="color:#555;font-size:13px;">本次附上两种格式：<strong>PDF</strong>（适合打印/收藏）+ <strong>HTML</strong>（网页版，用浏览器打开，排版更顺滑、无分页空白）。建议优先用 HTML 阅读。</p>'
            : '<p style="color:#555;font-size:13px;">Two formats attached: <strong>PDF</strong> (print/archive) + <strong>HTML</strong> (open in browser, smoother layout, no page breaks). We recommend reading the HTML version.</p>';
    } else if (reportKind === 'HTML') {
        htmlNote = lang === 'zh'
            ? '<p style="color:#c0392b;">当前附件为 HTML 格式，请用浏览器打开查看（PDF 生成暂不可用）。</p>'
            : '<p style="color:#c0392b;">The attachment is currently HTML — open it in a browser (PDF generation is temporarily unavailable).</p>';
    }

    const giftHtml = INCLUDE_WALLPAPER_GIFT ? buildGiftBlock(lang) : '';

    if (lang === 'zh') {
        return `
            <p>尊敬的 ${escapeHtml(name)}：</p>
            <p>您的专属八字命理报告已生成完毕，请查收邮件附件。</p>
            ${four ? `<p><strong>命盘：</strong>${escapeHtml(four)}</p>` : ''}
            <p>报告涵盖：命盘总览、性格深度解读、格局与五行、十神分析、大运走势、近五年流年、事业·财运·感情、开运指南，以及盲派做功解析。</p>
            ${htmlNote}
            ${giftHtml}
            <p>感谢您对 DAO Essence 的信任，愿这份报告为您带来清晰的自我认知。</p>
            <p style="color:#999;font-size:12px;">如果未收到附件，请回复本邮件联系我们。</p>
        `;
    }
    return `
        <p>Dear ${escapeHtml(name)},</p>
        <p>Your personalized BaZi destiny report is ready. Please find it attached to this email.</p>
        ${four ? `<p><strong>BaZi:</strong> ${escapeHtml(four)}</p>` : ''}
        <p>It covers: chart overview, personality, pattern &amp; elements, ten gods, luck pillars, next 5 years, career/wealth/love, fortune guide, and blind-school analysis.</p>
        ${htmlNote}
        ${giftHtml}
        <p>Thank you for trusting DAO Essence. We hope this report brings you clarity.</p>
        <p style="color:#999;font-size:12px;">If the attachment is missing, please reply to this email.</p>
    `;
}

// 隔离赠品区块：买报告送旺运壁纸合集（高清打包版）。默认不启用，由 INCLUDE_WALLPAPER_GIFT 控制。
function buildGiftBlock(lang) {
    const zh = lang === 'zh';
    const title = zh ? '赠品 · 旺运壁纸合集' : 'Your Bonus · Wealth &amp; Luck Wallpaper Pack';
    const desc = zh
        ? '感谢购买八字报告！附赠 8 张高清旺运壁纸（暴富·福禄·寿吉），手机壁纸与桌面背景均可使用，点击下方领取。'
        : 'Thank you for your BaZi report! Enjoy 8 bonus HD wallpapers (wealth, fortune &amp; luck) — perfect for phone or desktop. Tap below to claim yours.';
    const cta = zh ? '领取旺运壁纸 →' : 'Claim your wallpapers →';
    const url = 'https://www.daoessentia.com/wallpaper-collection';
    return `
        <div style="margin:22px 0;padding:18px;border:1px solid #D4AF37;border-radius:12px;background:#fffaf0;text-align:center;">
            <div style="font-size:12px;letter-spacing:2px;color:#B8860B;margin-bottom:8px;">BONUS GIFT</div>
            <div style="font-size:17px;font-weight:700;color:#8B0000;margin-bottom:8px;">${title}</div>
            <div style="font-size:13px;color:#555;line-height:1.6;margin-bottom:14px;">${desc}</div>
            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8860B);color:#0a0a0a;text-decoration:none;font-weight:600;font-size:13px;padding:10px 22px;border-radius:999px;">${cta}</a>
        </div>`;
}

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitize(str) {
    return String(str || 'user').replace(/[^\w一-龥-]+/g, '_').slice(0, 40);
}
