const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

async function handleApiRequest(req, res, parsedUrl) {
    const apiPath = parsedUrl.pathname;

    // Creem Checkout 创建
    if (apiPath === '/api/create-checkout') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);

                    const CREEM_API_KEY = process.env.CREEM_API_KEY;
                    const CREEM_PRODUCT_ID = process.env.CREEM_PRODUCT_ID;

                    if (!CREEM_API_KEY || !CREEM_PRODUCT_ID) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Creem API 密钥未配置' }));
                        return;
                    }

                    // 构建 Creem Checkout
                    const creemPayload = {
                        product_id: CREEM_PRODUCT_ID,
                        success_url: `${BASE_URL}/order-confirm.html?session_id={CHECKOUT_ID}`,
                        cancel_url: `${BASE_URL}/checkout.html`
                    };

                    const creemResponse = await fetch('https://api.creem.io/v1/checkouts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': CREEM_API_KEY
                        },
                        body: JSON.stringify(creemPayload)
                    });

                    const creemResult = await creemResponse.json();

                    if (!creemResponse.ok) {
                        console.error('Creem API 错误:', creemResult);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: creemResult.error || '创建支付会话失败' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        checkoutUrl: creemResult.checkout_url,
                        orderId: `ORDER_${Date.now()}`
                    }));

                } catch (error) {
                    console.error('Error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '服务器错误' }));
                }
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    }

    // 获取 Checkout 详情
    else if (apiPath === '/api/get-checkout') {
        if (req.method === 'GET') {
            const checkoutId = parsedUrl.query.checkout_id;

            if (!checkoutId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '缺少 checkout_id' }));
                return;
            }

            try {
                const response = await fetch(`https://api.creem.io/v1/checkouts/${checkoutId}`, {
                    headers: { 'x-api-key': process.env.CREEM_API_KEY }
                });

                const result = await response.json();

                if (!response.ok) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: result.error || '获取订单失败' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, checkout: result }));
            } catch (error) {
                console.error('Get Checkout Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '获取订单信息失败' }));
            }
        }
    }

    // 健康检查
    else if (apiPath === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', provider: 'Creem' }));
    }

    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// 静态文件处理
function handleStaticFileRequest(req, res, parsedUrl) {
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Error: ' + error.code);
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (parsedUrl.pathname.startsWith('/api/')) {
        handleApiRequest(req, res, parsedUrl);
    } else {
        handleStaticFileRequest(req, res, parsedUrl);
    }
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('DAO Essence Server Running (Creem)');
    console.log('========================================');
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log('========================================');
});
