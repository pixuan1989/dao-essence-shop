/**
 * /api/marketing 路由入口
 *
 * marketing.js 同时是「HTTP 路由 handler」+「纯函数库（sendSingleMail / getEmailWrapper）」。
 * 为遵守 Vercel Hobby 计划 12 个 Serverless Function 上限，纯函数库本体放在 lib/marketing.js，
 * 本文件只负责把 HTTP handler 重新挂回 api/ 路由，不复制任何逻辑。
 *
 * 真实实现见 lib/marketing.js（export default handler）。
 */
export { default } from '../lib/marketing.js';
