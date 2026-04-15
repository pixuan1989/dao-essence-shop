// DecapCMS OAuth - Handle GitHub callback
// GitHub redirects here with ?code=xxx (GET request)
// We exchange code for token and return HTML that passes it to CMS via postMessage
const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url || '', 'http://localhost');
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    res.status(400).send(`GitHub authorization failed: ${error}`);
    return;
  }

  if (!code) {
    res.status(400).send('Missing authorization code');
    return;
  }

  try {
    // Determine origin from referer
    let origin = 'https://www.daoessentia.com';
    if (req.headers.referer) {
      try {
        origin = new URL(req.headers.referer).origin;
      } catch (e) {
        console.error('Failed to parse referer:', req.headers.referer);
      }
    } else if (process.env.VERCEL_URL) {
      origin = `https://${process.env.VERCEL_URL}`;
    }

    const callbackUrl = `${origin}/api/callback`;

    // Exchange code for access token
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
      res.status(401).send(`GitHub authorization failed: ${data.error_description || data.error}`);
      return;
    }

    // Log token scopes for debugging
    console.log('Token scopes:', data.scope);

    // Verify token has write access
    const userResp = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${data.access_token}`, 'User-Agent': 'DecapCMS-OAuth' }
    });
    const user = await userResp.json();
    console.log('Authenticated as:', user.login, '- scopes:', data.scope);

    // Return HTML page that passes token to DecapCMS via postMessage
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
  <meta charset="utf-8">
</head>
<body>
  <p style="font-family:sans-serif;text-align:center;margin-top:40px;">授权成功！正在返回管理系统...</p>
  <p style="font-family:sans-serif;text-align:center;color:#666;">用户: ${user.login} | 权限: ${data.scope || 'unknown'}</p>
  <script>
    (function() {
      function receiveMessage(e) {
        if (e.data === 'authorizing:github') {
          window.opener.postMessage(
            'authorization:github:success:{"token":"${data.access_token}","provider":"github"}',
            e.origin
          );
          window.close();
        }
      }
      window.addEventListener('message', receiveMessage, false);
      // Notify opener that we're ready
      if (window.opener) {
        window.opener.postMessage('authorizing:github', '*');
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth proxy error');
  }
}
