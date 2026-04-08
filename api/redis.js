/**
 * Redis 连接工具
 * 使用 ioredis 直接连接 Redis
 */

import Redis from 'ioredis';

let redis = null;

export function getRedis() {
    if (!redis) {
        const url = process.env.REDIS_URL;
        if (!url) {
            console.error('❌ 未配置 REDIS_URL 环境变量');
            return null;
        }
        redis = new Redis(url, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                return Math.min(times * 200, 2000);
            }
        });
    }
    return redis;
}

/**
 * 获取值（自动 JSON.parse）
 */
export async function redisGet(key) {
    const client = getRedis();
    if (!client) return null;
    try {
        const val = await client.get(key);
        return val ? JSON.parse(val) : null;
    } catch (err) {
        console.error('❌ Redis GET 失败:', err.message);
        return null;
    }
}

/**
 * 设置值（自动 JSON.stringify）
 */
export async function redisSet(key, value) {
    const client = getRedis();
    if (!client) return false;
    try {
        await client.set(key, JSON.stringify(value));
        return true;
    } catch (err) {
        console.error('❌ Redis SET 失败:', err.message);
        return false;
    }
}
