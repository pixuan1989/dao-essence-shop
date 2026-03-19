// 获取订单历史
// 注意：Netlify Functions 无法直接访问文件系统
// 需要集成数据库（如 Netlify Database、Supabase 等）
// 当前版本返回示例数据

exports.handler = async (event, context) => {
  // 只允许 GET 请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // TODO: 从数据库获取订单历史
    // 当前返回示例数据
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        orders: [],
        count: 0,
        note: '需要集成数据库才能返回真实订单历史'
      })
    };

  } catch (error) {
    console.error('Error retrieving orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
