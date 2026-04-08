/**
 * 临时调试接口 - 直接查看 Redis 中的订单数据
 * ⚠️ 部署完成后请删除此文件
 */
import { getRedis, redisGet } from './redis.js';

export default async function handler(req, res) {
    const result = {
        env: {
            REDIS_URL: process.env.REDIS_URL ? '已配置' : '❌ 未配置',
            ADMIN_KEY: process.env.ADMIN_KEY ? '已配置' : '❌ 未配置',
        }
    };

    // 测试 Redis 连接
    try {
        const client = getRedis();
        if (!client) {
            result.redis = { status: '❌ 创建失败' };
            return res.status(200).json(result);
        }

        // Ping 测试
        const pong = await client.ping();
        result.redis = { status: '✅ 连接成功', ping: pong };

        // 获取订单 ID 列表
        const orderIds = await redisGet('bazi_order_ids');
        result.orderIds = orderIds || [];
        result.orderCount = orderIds ? orderIds.length : 0;

        // 获取每笔订单详情
        const orders = [];
        if (orderIds && orderIds.length > 0) {
            for (const id of orderIds.slice(0, 10)) {
                const order = await redisGet(`bazi_order:${id}`);
                if (order) {
                    orders.push(order);
                }
            }
        }
        result.orders = orders;

        // 尝试列出 Redis 中所有 key（前缀匹配）
        const keys = await client.keys('bazi_*');
        result.allBaziKeys = keys;

    } catch (err) {
        result.redis = { status: '❌ 错误', message: err.message };
    }

    return res.status(200).json(result);
}
