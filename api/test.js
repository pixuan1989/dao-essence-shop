/**
 * 简单的测试 API
 */
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: '✅ Vercel Serverless Functions 工作正常！',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}