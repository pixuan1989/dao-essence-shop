// ESM 薄封装：让 .mjs 脚本也能用同一套记账（复用 lib/ai-usage.cjs）
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mod = require('./ai-usage.cjs');

export const recordUsage = mod.recordUsage;
export const recordImage = mod.recordImage;
export const LOG_PATH = mod.LOG_PATH;
export default mod;
