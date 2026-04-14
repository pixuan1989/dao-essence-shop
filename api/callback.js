// DecapCMS OAuth - Handle token exchange
// DecapCMS calls this endpoint internally (not browser redirect)
// It expects JSON response: {"token": "ghp_xxx"}
const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

export default async function handler(req, res) {
  // Only accept POST requests from DecapCMS
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    // DecapCMS sends the authorization code in the request body
    const body = await req.json();
    const code = body.code;

    if (!code) {
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }

    // Exchange code for access token
    const origin = req.headers.origin || req.headers.referer
      ? new URL(req.headers.referer || '').origin
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://www.daoessentia.com';

    const callbackUrl = `${origin}/api/callback`;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: callbackUrl,
      }),
    });

    const data = await tokenResponse.json();

    if (!data.access_token) {
      console.error('Token exchange failed:', data);
      res.status(401).json({ error: data.error_description || data.error || 'Token exchange failed' });
      return;
    }

    // DecapCMS expects: {"token": "ghp_xxx", "provider": "github"}
    res.status(200).json({
      token: data.access_token,
      provider: 'github',
    });
  } catch (error) {
    console.error('OAuth token error:', error);
    res.status(500).json({ error: 'OAuth proxy error' });
  }
}
