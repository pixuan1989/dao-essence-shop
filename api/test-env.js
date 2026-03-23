/**
 * 测试环境变量 API
 */
export default async function handler(req, res) {
    const apiKey = process.env.CREEM_API_KEY;
    const productId = process.env.CREEM_PRODUCT_ID;

    console.log('环境变量原始值:', {
        CREEM_API_KEY: apiKey,
        CREEM_PRODUCT_ID: productId
    });

    return res.status(200).json({
        CREEM_API_KEY: apiKey ? `${apiKey.substring(0, 10)}... (长度: ${apiKey.length})` : 'MISSING',
        CREEM_PRODUCT_ID: productId,
        apiKeyLength: apiKey?.length,
        productIdLength: productId?.length
    });
}
