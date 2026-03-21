const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 加载环境变量
require('dotenv').config();

// 服务器端口
const PORT = process.env.PORT || 3001;

// 处理API请求的函数
function handleApiRequest(req, res, parsedUrl) {
    const apiPath = parsedUrl.pathname;
    
    // 处理create-checkout请求
    if (apiPath === '/api/create-checkout') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    
                    // 模拟Creem API响应
                    const response = {
                        success: true,
                        checkoutUrl: 'https://test-api.creem.io/test-checkout',
                        orderId: `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`
                    };
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                } catch (error) {
                    console.error('Error parsing request body:', error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    } 
    // 健康检查端点
    else if (apiPath === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'Server is running' }));
    }
    // 未找到的API端点
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// 处理静态文件请求
function handleStaticFileRequest(req, res, parsedUrl) {
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// 创建服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // 允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 处理API请求
    if (parsedUrl.pathname.startsWith('/api/')) {
        handleApiRequest(req, res, parsedUrl);
    }
    // 处理静态文件请求
    else {
        handleStaticFileRequest(req, res, parsedUrl);
    }
});

// 启动服务器
server.listen(PORT, () => {
    console.log('========================================');
    console.log('DAO Essence Payment Server Running');
    console.log('========================================');
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('========================================');
    console.log('Press Ctrl+C to stop server');
    console.log('========================================');
});
