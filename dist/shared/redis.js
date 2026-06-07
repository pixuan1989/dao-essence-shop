/**
 * Redis 连接工具
 * 使用 @upstash/redis (HTTP REST API，Serverless 友好)
 */

import { Redis } from '@upstash/redis';

let redis = null;

export function getRedis() {
    if (!redis) {
        const url = process.env.KV_REST_API_URL;
        const token = process.env.KV_REST_API_TOKEN;
        if (!url || !token) {
            console.error('❌ 未配置 KV_REST_API_URL / KV_REST_API_TOKEN 环境变量');
            return null;
        }
        redis = new Redis({ url, token });
    }
    return redis;
}

/**
 * 获取值（已解析）
 */
export async function redisGet(key) {
    const client = getRedis();
    if (!client) return null;
    try {
        return await client.get(key);
    } catch (err) {
        console.error('❌ Redis GET 失败:', err.message);
        return null;
    }
}

/**
 * 删除 key
 */
export async function redisDel(key) {
    const client = getRedis();
    if (!client) return false;
    try {
        await client.del(key);
        return true;
    } catch (err) {
        console.error('❌ Redis DEL 失败:', err.message);
        return false;
    }
}

/**
 * 设置值（带 TTL，秒）
 */
export async function redisSet(key, value, ttlSeconds) {
    const client = getRedis();
    if (!client) return false;
    try {
        if (ttlSeconds) {
            await client.set(key, value, { ex: ttlSeconds });
        } else {
            await client.set(key, value);
        }
        return true;
    } catch (err) {
        console.error('❌ Redis SET 失败:', err.message);
        return false;
    }
}

/**
 * SCAN keys by pattern (returns all matching keys)
 */
export async function redisKeys(pattern) {
    const client = getRedis();
    if (!client) return [];
    try {
        const keys = [];
        let cursor = 0;
        do {
            const result = await client.scan(cursor, { match: pattern, count: 100 });
            cursor = result.cursor;
            if (result.keys) keys.push(...result.keys);
        } while (cursor !== 0);
        return keys;
    } catch (err) {
        console.error('❌ Redis KEYS failed:', err.message);
        return [];
    }
}
