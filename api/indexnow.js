// IndexNow API endpoint for Vercel Serverless Functions
// Sends URL notifications to Bing/Yandex when content changes
// POST /api/indexnow with body: { "host": "www.daoessentia.com", "urlList": ["https://..."] }

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple API key check to prevent abuse
    const apiKey = process.env.INDEXNOW_KEY || '5ad49cf218073b6e';
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${apiKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { urlList } = req.body;

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
        return res.status(400).json({ error: 'urlList is required' });
    }

    // Validate URLs
    const validUrls = urlList.filter(url =>
        typeof url === 'string' && url.startsWith('https://www.daoessentia.com/')
    );

    if (validUrls.length === 0) {
        return res.status(400).json({ error: 'No valid URLs provided' });
    }

    try {
        // Send to IndexNow
        const indexNowPayload = {
            host: 'www.daoessentia.com',
            key: apiKey,
            urlList: validUrls
        };

        const response = await fetch('https://api.indexnow.org/IndexNow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(indexNowPayload)
        });

        if (response.ok || response.status === 202) {
            return res.status(200).json({
                success: true,
                notified: validUrls.length,
                urls: validUrls
            });
        } else {
            return res.status(502).json({
                error: 'IndexNow API returned non-success status',
                status: response.status
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
