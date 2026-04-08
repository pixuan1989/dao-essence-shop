/**
 * 测试环境变量和 Redis 连接 API
 */
import { getRedis, redisGet, redisSet } from './redis.js';

export default async function handler(req, res) {
    const result = {
        CREEM_API_KEY: process.env.CREEM_API_KEY ? `${process.env.CREEM_API_KEY.substring(0, 10)}...` : 'MISSING',
        CREEM_PRODUCT_ID: process.env.CREEM_PRODUCT_ID || 'MISSING',
        REDIS_URL: process.env.REDIS_URL ? '已配置' : 'MISSING',
        ADMIN_KEY: process.env.ADMIN_KEY ? '已配置' : 'MISSING',
    };

    // 测试 Redis 连接
    try {
        const client = getRedis();
        if (!client) {
            result.redis = { status: '错误', message: 'Redis 客户端创建失败，请检查 REDIS_URL' };
        } else {
            // 写入测试
            await redisSet('test_key', { time: new Date().toISOString(), test: true });
            // 读取测试
            const val = await redisGet('test_key');
            // 清理
            await client.del('test_key');
            // 检查订单数据
            const orderIds = await redisGet('bazi_order_ids');

            result.redis = {
                status: '✅ 连接正常',
                readWrite: val && val.test ? '✅ 读写正常' : '❌ 读写异常',
                orderCount: orderIds ? orderIds.length : 0,
                orderIds: orderIds || []
            };
        }
    } catch (err) {
        result.redis = { status: '❌ 连接失败', message: err.message };
    }

    return res.status(200).json(result);
}
