#!/usr/bin/env node
/**
 * Welcome Email Worker
 * 给留了邮箱但没有生辰数据的用户发送引导邮件
 */
const https = require('https');

const CONFIG = {
  redisUrl: process.env.UPSTASH_REDIS_REST_URL,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  smtpHost: 'smtpdm.aliyun.com',
  smtpPort: 465,
  smtpUser: process.env.ALIYUN_EMAIL_ACCOUNT,
  smtpPass: process.env.ALIYUN_SMTP_PASSWORD,
  dailyQuota: 200,
  maxRetries: 3,
  retryBackoff: [1000, 3000, 5000],
  recordTTL: 86400,
};

function log(level, msg) { console.log(`${new Date().toISOString()} [${level}] ${msg}`); }
function logInfo(msg) { log('INFO', msg); }
function logWarn(msg) { log('WARN', msg); }
function logError(msg) { log('ERROR', msg); }

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function redisWithRetry(path, method = 'GET', body = null, retries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = https.request(`${CONFIG.redisUrl}${path}`, { method, headers: { 'Authorization': `Bearer ${CONFIG.redisToken}`, 'Content-Type': 'application/json' }, timeout: 10000 }, r => {
          let d = ''; r.on('data', c => d += c); r.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end();
      });
      return res;
    } catch (e) { if (attempt === retries) throw e; await sleep(CONFIG.retryBackoff[attempt - 1]); }
  }
}

async function getWelcomeQueue() { return (await redisWithRetry('/GET/welcome_email_queue')).result || []; }
async function removeWelcomeQueue(userId) { const q = await getWelcomeQueue(); await redisWithRetry('/SET/welcome_email_queue', 'POST', q.filter(x => x.id !== userId)); }
async function addSentRecord(userId) { const s = (await redisWithRetry('/GET/sent_welcome_emails')).result || []; s.unshift({ id: userId, sentAt: new Date().toISOString() }); if (s.length > 500) s.length = 500; await redisWithRetry('/SET/sent_welcome_emails', 'POST', s); }
async function isAlreadySent(userId) { return ((await redisWithRetry('/GET/sent_welcome_emails')).result || []).some(s => s.id === userId); }
async function cleanExpiredRecords() { const q = await getWelcomeQueue(); const v = q.filter(x => Date.now() - new Date(x.createdAt).getTime() < CONFIG.recordTTL * 1000); if (v.length < q.length) await redisWithRetry('/SET/welcome_email_queue', 'POST', v); }
async function checkDailyQuota() { const c = (await redisWithRetry(`/GET/daily_sent_count:${new Date().toISOString().slice(0,10)}`)).result || 0; return c < CONFIG.dailyQuota; }
async function incrementDailyCount() { await redisWithRetry(`/INCR/daily_sent_count:${new Date().toISOString().slice(0,10)}`); }

async function sendMail(to, subject, htmlBody, textBody) {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({ host: CONFIG.smtpHost, port: CONFIG.smtpPort, secure: true, auth: { user: CONFIG.smtpUser, pass: CONFIG.smtpPass } });
  await transporter.sendMail({ from: `"Dao Essentia" <${CONFIG.smtpUser}>`, to, subject, html: htmlBody, text: textBody });
}

function buildWelcomeEmailHtml(name) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px;"><h1>Hi ${name || 'friend'},</h1><p>感谢你成为 Dao Essentia 的一员。</p><p>你可能还不知道自己的八字是什么。这些答案，都藏在你出生的那一刻。</p><p><strong>我们为你准备了两种了解方式：</strong></p><div style="background:#f9f9f9;padding:15px;margin:10px 0;"><p style="margin:0 0 10px;font-weight:600;">🔍 如果你好奇，想先免费看看：</p><p style="margin:0;">试试我们的免费八字排盘工具。</p><a href="https://www.daoessentia.com/bazi-calculator">免费八字排盘 → www.daoessentia.com/bazi-calculator</a></div><div style="background:#f9f9f9;padding:15px;margin:10px 0;"><p style="margin:0 0 10px;font-weight:600;">📜 如果你想要一份深度分析报告：</p><p style="margin:0;">由我们的命理团队根据完整八字撰写。</p><a href="https://www.daoessentia.com/shop">获取完整分析报告 → www.daoessentia.com/shop</a></div><p>无论选择哪一种，希望你能从中获得对自己更深的了解。</p><p>Dao Essentia</p></body></html>`;
}

function buildWelcomeText(name) {
  return `Hi ${name || 'friend'},\n\n感谢你成为 Dao Essentia 的一员。\n\n你可能还不知道自己的八字是什么。\n\n我们为你准备了两种了解方式：\n\n1. 免费八字排盘\n试试我们的免费八字排盘工具。\n→ www.daoessentia.com/bazi-calculator\n\n2. 完整分析报告\n包含对你性格特质、事业方向、感情模式和健康建议的深度解读。\n→ www.daoessentia.com/shop\n\n无论选择哪一种，希望你能从中获得对自己更深的了解。\n\nDao Essentia`;
}

async function main() {
  logInfo('=== Welcome Email Worker 启动 ===');
  try { await cleanExpiredRecords(); } catch (e) { logError(`清理失败：${e.message}`); }
  if (!(await checkDailyQuota())) { logInfo('配额已满，退出'); process.exit(0); }
  const queue = await getWelcomeQueue();
  logInfo(`待处理队列：${queue.length} 条`);
  if (queue.length === 0) { process.exit(0); }
  const due = queue.filter(q => (!q.birthYear || q.birthYear === '') && q.source !== 'wuxing_quiz');
  logInfo(`符合条件待发送：${due.length} 条`);
  if (due.length === 0) { process.exit(0); }
  
  let sentCount = 0;
  for (const user of due) {
    try {
      if (await isAlreadySent(user.id)) { await removeWelcomeQueue(user.id); continue; }
      if (!(await checkDailyQuota())) break;
      await sendMail(user.email, 'Discover Your BaZi — Ancient Wisdom Awaits', buildWelcomeEmailHtml(user.name), buildWelcomeText(user.name));
      await addSentRecord(user.id);
      await removeWelcomeQueue(user.id);
      await incrementDailyCount();
      sentCount++;
      logInfo(`[OK] ${user.id} 发送成功`);
    } catch (err) { logError(`[FAIL] ${user.id}: ${err.message}`); }
  }
  logInfo(`=== 执行完成：成功 ${sentCount} 条 ===`);
}

main().catch(err => { logError(`Worker 崩溃：${err.message}`); process.exit(1); });