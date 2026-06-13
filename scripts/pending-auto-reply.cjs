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

async function redisWithRetry(path, method = 'GET', body = null, retries = CONFIG.maxRetries, rawBody = false) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = https.request(`${CONFIG.redisUrl}${path}`, { method, headers: { 'Authorization': `Bearer ${CONFIG.redisToken}`, 'Content-Type': 'application/json' }, timeout: 10000 }, r => {
          let d = ''; r.on('data', c => d += c); r.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject); 
        if (body) req.write(rawBody ? body : JSON.stringify(body)); 
        req.end();
      });
      return res;
    } catch (e) { if (attempt === retries) throw e; await sleep(CONFIG.retryBackoff[attempt - 1]); }
  }
}

// 获取待发邮件列表，兼容旧格式（如果是字符串则解析，如果是数组则直接用）
async function getPendingEmails() {
  try {
    const res = await redisWithRetry('/GET/pending_auto_reply');
    let data = res.result;
    // Redis 返回 null（key 不存在）时返回空数组
    if (data === null || data === undefined) return [];
    // 如果是字符串，解析它
    if (typeof data === 'string') {
      let parsed = JSON.parse(data);
      // 处理 double-encoded 情况：Upstash 可能把 "[...]" 存成了 "\"[...]\""
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) ? parsed : [];
    }
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

// 保存待发邮件列表，直接发送 JSON 字符串（不二次编码）
async function savePendingEmails(list) {
  // Upstash SET 命令直接存 body 内容，无需 stringify
  await redisWithRetry('/SET/pending_auto_reply', 'POST', JSON.stringify(list), false);
}

async function removePendingEmail(leadId) {
  const p = await getPendingEmails();
  if (!Array.isArray(p)) return;
  await savePendingEmails(p.filter(x => x.id !== leadId));
}

async function addSentRecord(leadId) {
  const s = (await redisWithRetry('/GET/sent_auto_replies')).result || [];
  const parsed = typeof s === 'string' ? JSON.parse(s) : (Array.isArray(s) ? s : []);
  // 处理 double-encoded 情况
  const arr = typeof parsed === 'string' ? JSON.parse(parsed) : (Array.isArray(parsed) ? parsed : []);
  arr.unshift({ id: leadId, sentAt: new Date().toISOString() });
  if (arr.length > 500) arr.length = 500;
  await redisWithRetry('/SET/sent_auto_replies', 'POST', JSON.stringify(arr), 3, true);
}

async function isAlreadySent(leadId) {
  const s = (await redisWithRetry('/GET/sent_auto_replies')).result || [];
  const parsed = typeof s === 'string' ? JSON.parse(s) : (Array.isArray(s) ? s : []);
  const arr = typeof parsed === 'string' ? JSON.parse(parsed) : (Array.isArray(parsed) ? parsed : []);
  return arr.some(item => item.id === leadId);
}

async function cleanExpiredRecords() {
  const p = await getPendingEmails();
  if (!Array.isArray(p)) return;
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
  
  const systemPrompt = `你是Dao Essentia的资深命理顾问。请用温暖、专业的语气为用户写一封个性化的五行解读邮件。`;
  
  const userPrompt = `请为以下用户生成五行解读邮件内容：

用户：${name || '用户'}
五行主元素：${dominantElement}
出生年份：${ganzhi}年（${zodiac}年）
四柱：年柱${yearPillar}、月柱${monthPillar}、日柱${dayPillar}、时柱${hourPillar}
日主：${dayMaster}

要求：
1. 中文部分（约150字）：引用古籍解释五行特质，给出职业建议（2-3个方向）和感情特点，健康建议（器官+季节）。语气像朋友间的专业建议。
2. 英文部分（约120词）：翻译核心内容，用现代灵性词汇（energy, alignment, balance等）。
3. 用"---"分隔中英文，不要列表，不要夸张用语。

直接输出内容，不要加标题或前后缀。`;

  try {
    const res = await new Promise((resolve, reject) => {
      const body = JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      const req = https.request('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.dashscopeApiKey}`
        },
        timeout: CONFIG.dashscopeTimeout
      }, r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => {
          try {
            const json = JSON.parse(d);
            if (json.choices && json.choices[0] && json.choices[0].message) {
              resolve(json.choices[0].message.content);
            } else {
              reject(new Error(`API返回异常: ${d.slice(0, 200)}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(body);
      req.end();
    });
    
    logInfo(`[AI] 生成成功 (${res.length}字)`);
    return res;
  } catch (err) {
    logError(`[AI] 生成失败: ${err.message}，使用兜底内容`);
    return `你的命局主五行为${dominantElement}，生于${ganzhi}年。《滴天髓》云："${dominantElement}主仁，其性直"。日主为${dayMaster}，天生灵活应变。职业上适合设计、咨询或医疗领域。感情中倾向包容体谅。木气主肝胆筋骨，建议早睡养肝，春季多舒展筋骨。
---
Your primary element is ${dominantElement}, born in the Year of ${ganzhi}. Like the ancient texts note, your nature is inherently flexible. You are suited for fields requiring adaptability and empathy, such as design, counseling, or healthcare. Wood governs the liver and tendons. It is advisable to rest early to nourish the liver.`;
  }
}

const BLOCKED_PATTERNS = [/灾难 | 厄运 | 必死/i, /法力 | 神通/i];
function contentSafetyCheck(text) {
  for (const pattern of BLOCKED_PATTERNS) { if (pattern.test(text)) return false; }
  return true;
}

async function sendMail(to, subject, htmlBody, textBody) {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({ 
    host: CONFIG.smtpHost, 
    port: CONFIG.smtpPort, 
    secure: true, 
    auth: { user: CONFIG.smtpUser, pass: CONFIG.smtpPass },
    // 降低被判定为spam的概率
    tls: { rejectUnauthorized: false }
  });
  
  await transporter.sendMail({
    from: `"Dao Essentia" <${CONFIG.smtpUser}>`,
    to,
    subject,
    html: htmlBody,
    text: textBody, // 纯文本版本，降低spam判定概率
    // 邮件头优化
    headers: {
      'X-Mailer': 'DaoEssentia-AutoReply',
      'List-Unsubscribe': `<https://www.daoessentia.com/unsubscribe?email=${encodeURIComponent(to)}>`
    }
  });
}

function buildEmailHtml(name, interpretation) {
  const parts = interpretation.split('---');
  const zhContent = (parts[0] || '').trim();
  const enContent = (parts[1] || '').trim();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .greeting { margin-bottom: 20px; }
    .content { margin: 20px 0; }
    .divider { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 13px; color: #888; }
    .link { color: #D4AF37; text-decoration: none; }
  </style>
</head>
<body>
  <p class="greeting">Hi ${name || 'friend'},</p>
  
  <p>Thanks for taking the Five Elements Quiz! Here's your personalized insight:</p>
  
  <div class="content">
    <p>${zhContent.replace(/\n/g, '<br>')}</p>
  </div>
  
  <hr class="divider">
  
  <div class="content">
    <p>${enContent.replace(/\n/g, '<br>')}</p>
  </div>
  
  <div class="footer">
    <p>This is a brief analysis based on your primary element and birth year. A complete BaZi reading (including month, day, and hour pillars) reveals more about your career direction, relationships, and health.</p>
    <p><a href="https://www.daoessentia.com/bazi-calculator" class="link">Free BaZi Calculator</a> &nbsp;|&nbsp; <a href="https://www.daoessentia.com/shop" class="link">Full Reading Report</a></p>
    <p style="margin-top: 20px; font-size: 12px;">Dao Essentia — <a href="https://www.daoessentia.com" class="link">www.daoessentia.com</a></p>
  </div>
</body>
</html>`;
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