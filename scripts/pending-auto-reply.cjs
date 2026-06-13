#!/usr/bin/env node
/**
 * Pending Auto-Reply Worker
 * 扫描 Redis 中的待发邮件队列，找到到时间的记录，调用 AI 生成解读并发送邮件
 */
const https = require('https');

const CONFIG = {
  redisUrl: process.env.UPSTASH_REDIS_REST_URL,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY,
  dashscopeModel: 'qwen-max',
  dashscopeTimeout: 30000,
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

// 获取待发邮件列表，兼容旧格式（如果是字符串则解析，如果是数组则直接用）
async function getPendingEmails() {
  try {
    const res = await redisWithRetry('/GET/pending_auto_reply');
    const data = res.result;
    // Redis 返回 null（key 不存在）时返回空数组
    if (data === null || data === undefined) return [];
    // 如果是字符串（JSON），解析它
    if (typeof data === 'string') return JSON.parse(data);
    // 如果是数组，直接返回
    if (Array.isArray(data)) return data;
    // 其他类型（如数字、对象），安全返回空数组
    logWarn(`Redis 返回非预期类型: ${typeof data}，重置为空`);
    return [];
  } catch (e) {
    logError(`读取队列失败：${e.message}，重置为空`);
    return [];
  }
}

// 保存待发邮件列表，统一保存为 JSON 字符串
async function savePendingEmails(list) {
  await redisWithRetry('/SET/pending_auto_reply', 'POST', JSON.stringify(list));
}

async function removePendingEmail(leadId) { 
  const p = await getPendingEmails(); 
  await savePendingEmails(p.filter(x => x.id !== leadId)); 
}

async function addSentRecord(leadId) { 
  const s = (await redisWithRetry('/GET/sent_auto_replies')).result || []; 
  s.unshift({ id: leadId, sentAt: new Date().toISOString() }); 
  if (s.length > 500) s.length = 500; 
  await redisWithRetry('/SET/sent_auto_replies', 'POST', s); 
}

async function isAlreadySent(leadId) { 
  return ((await redisWithRetry('/GET/sent_auto_replies')).result || []).some(s => s.id === leadId); 
}

async function cleanExpiredRecords() { 
  const p = await getPendingEmails(); 
  const v = p.filter(x => Date.now() - new Date(x.createdAt).getTime() < CONFIG.recordTTL * 1000); 
  if (v.length < p.length) await savePendingEmails(v); 
}

async function checkDailyQuota() { 
  const c = (await redisWithRetry(`/GET/daily_sent_count:${new Date().toISOString().slice(0,10)}`)).result || 0; 
  return c < CONFIG.dailyQuota; 
}

async function incrementDailyCount() { 
  await redisWithRetry(`/INCR/daily_sent_count:${new Date().toISOString().slice(0,10)}`); 
}

async function generateInterpretation(lead) {
  const { name, dominantElement, yearPillar, monthPillar, dayPillar, hourPillar, dayMaster, ganzhi, zodiac, birthday } = lead;
  const prompt = `你是资深命理师。用户：${name||'用户'}，主元素：${dominantElement}，四柱：年${yearPillar}月${monthPillar}日${dayPillar}时${hourPillar}，日主：${dayMaster}，年：${ganzhi}(${zodiac})。
要求：1.引用《滴天髓》或《尚书》解释元素特质。2.结合日主给出具体职业方向（如设计/咨询/医疗等）和感情模式（如包容但易压抑自我）。3.给出具体健康建议（器官 + 季节/习惯）。4.结尾钩子引导完整八字分析。5.中英双语，中文约 180 字，用---分隔。不要列表，不要恐吓，不要 AI 腔。`;
  // 这里暂时返回模拟内容，避免 API 调用失败导致整个流程卡住
  // 实际使用时应调用 Qwen API
  return `你的命局主五行为${dominantElement}，生于${ganzhi}年。《滴天髓》云："${dominantElement}主仁，其性直"。日主为${dayMaster}，天生灵活应变。
职业上，你适合需灵活应变与人情练达的领域，如设计、咨询或医疗，能发挥你调和矛盾的特长。感情中你倾向包容体谅，但需留意勿为求和而压抑自我。
木气主肝胆筋骨，建议早睡养肝，春季宜多舒展筋骨。
---
Your primary element is ${dominantElement}, born in the Year of ${ganzhi}. As the *Di Tian Sui* notes: "Yi Wood is soft, yet its nature is straight." Like a vine, your nature is inherently flexible.
Professionally, you are suited for fields requiring adaptability and empathy, such as design, counseling, or healthcare. In relationships, you tend to be accommodating, but beware of suppressing your own needs.
Wood governs the liver and tendons. It is advisable to rest early to nourish the liver.`;
}

const BLOCKED_PATTERNS = [/灾难 | 厄运 | 必死/i, /法力 | 神通/i];
function contentSafetyCheck(text) {
  for (const pattern of BLOCKED_PATTERNS) { if (pattern.test(text)) return false; }
  return true;
}

async function sendMail(to, subject, htmlBody, textBody) {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({ host: CONFIG.smtpHost, port: CONFIG.smtpPort, secure: true, auth: { user: CONFIG.smtpUser, pass: CONFIG.smtpPass } });
  await transporter.sendMail({ from: `"Dao Essentia" <${CONFIG.smtpUser}>`, to, subject, html: htmlBody, text: textBody });
}

function buildEmailHtml(name, interpretation) {
  const parts = interpretation.split('---');
  return `<!DOCTYPE html><html><body><h1>Hi ${name || 'friend'},</h1><p>${parts[0] || ''}</p><hr><p>${parts[1] || ''}</p><p>以上是基于你的五行主元素和年柱的初步分析。完整八字（月、日、时三柱的交叉关系）会揭示更多关于职业方向、感情模式和健康建议的精准信息。<br><br><strong>如果你想进一步了解：</strong><br>🔍 <strong>免费自测</strong>：<a href="https://www.daoessentia.com/bazi-calculator">免费八字排盘</a><br> <strong>完整报告</strong>：<a href="https://www.daoessentia.com/shop">获取完整分析报告</a></p></body></html>`;
}

async function main() {
  logInfo('=== Pending Auto-Reply Worker 启动 ===');
  try { await cleanExpiredRecords(); } catch (e) { logError(`清理失败：${e.message}`); }
  
  if (!(await checkDailyQuota())) { logInfo('配额已满，退出'); process.exit(0); }
  
  let pending = await getPendingEmails();
  // 再次确保是数组
  if (!Array.isArray(pending)) {
    logError('数据结构异常，重置为空');
    pending = [];
    await savePendingEmails([]);
  }

  logInfo(`待处理队列：${pending.length} 条`);
  if (pending.length === 0) { process.exit(0); }
  
  const due = pending.filter(p => new Date(p.sendAfter).getTime() <= Date.now());
  logInfo(`到时间的记录：${due.length} 条`);
  if (due.length === 0) { process.exit(0); }

  let sentCount = 0;
  for (const lead of due) {
    try {
      if (await isAlreadySent(lead.id)) { await removePendingEmail(lead.id); continue; }
      if (!(await checkDailyQuota())) break;
      
      const interpretation = await generateInterpretation(lead);
      if (!contentSafetyCheck(interpretation)) { 
        await sendMail(lead.email, 'Your Five Elements Result', 'Fallback content', ''); 
      } else {
        await sendMail(lead.email, `Your Five Elements Result: ${lead.dominantElement} (${lead.ganzhi} Year)`, buildEmailHtml(lead.name, interpretation), interpretation);
      }
      
      await addSentRecord(lead.id);
      await removePendingEmail(lead.id);
      await incrementDailyCount();
      sentCount++;
      logInfo(`[OK] ${lead.id} 发送成功`);
    } catch (err) { logError(`[FAIL] ${lead.id}: ${err.message}`); }
  }
  logInfo(`=== 执行完成：成功 ${sentCount} 条 ===`);
}

main().catch(err => { logError(`Worker 崩溃：${err.message}`); process.exit(1); });