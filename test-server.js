const http = require('http');

console.log('🧪 测试服务器启动...\n');

// 测试是否可以加载 server.js
try {
    const server = require('./server.js');
    console.log('✅ server.js 加载成功\n');

    // 等待服务器启动
    setTimeout(() => {
        console.log('📡 测试健康检查端点...\n');

        http.get('http://localhost:3001/api/health', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('✅ 服务器响应:', data);
                console.log('\n========================================');
                console.log('✅ 服务器测试通过！');
                console.log('========================================');
                process.exit(0);
            });
        }).on('error', (err) => {
            console.error('❌ 服务器连接失败:', err.message);
            process.exit(1);
        });
    }, 2000);

} catch (error) {
    console.error('❌ server.js 加载失败:', error.message);
    process.exit(1);
}
