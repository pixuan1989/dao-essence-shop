/**
 * 简单的测试 API - 使用 Vercel 官方推荐的 fetch Web Standard API
 */
export default {
  async fetch(request) {
    return Response.json({
      success: true,
      message: '✅ Vercel Serverless Functions 工作正常！',
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url
    });
  }
};