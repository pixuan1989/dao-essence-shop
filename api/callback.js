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
    // Determine origin safely
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

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      res.status(500).send(`<h2>Configuration Error</h2>
        <p><b>GITHUB_OAUTH_CLIENT_ID:</b> ${GITHUB_CLIENT_ID || 'NOT SET'}</p>
        <p><b>GITHUB_OAUTH_CLIENT_SECRET:</b> ${GITHUB_CLIENT_SECRET ? '***SET***' : 'NOT SET'}</p>
        <p><b>VERCEL_URL:</b> ${process.env.VERCEL_URL || 'NOT SET'}</p>
        <hr>
        <p>Vercel environment variables are not being read. Possible causes:</p>
        <ol>
          <li>Environment variables were added AFTER the last deployment</li>
          <li>Variables are scoped to Production only (not Preview)</li>
          <li>Variable names don't match exactly</li>
        </ol>
        <p><b>Fix:</b> In Vercel Dashboard → Settings → Environment Variables:</p>
        <ul>
          <li>Make sure <code>GITHUB_OAUTH_CLIENT_ID</code> and <code>GITHUB_OAUTH_CLIENT_SECRET</code> exist</li>
          <li>Set scope to <b>All environments</b> (Production + Preview + Development)</li>
          <li>Then Redeploy this branch</li>
        </ul>`);
      return;
    }

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
      console.error('Token exchange failed:', JSON.stringify(data));
      const details = JSON.stringify(data, null, 2);
      res.status(401).send(`<h2>GitHub authorization failed</h2>
        <pre>${details}</pre>
        <p><b>Client ID prefix:</b> ${GITHUB_CLIENT_ID ? GITHUB_CLIENT_ID.substring(0, 6) + '...' : 'NOT SET (undefined)'}</p>
        <p><b>Client Secret:</b> ${GITHUB_CLIENT_SECRET ? 'SET (' + GITHUB_CLIENT_SECRET.length + ' chars)' : 'NOT SET (undefined)'}</p>
        <p><b>Code:</b> ${code ? code.substring(0, 10) + '...' : 'MISSING'}</p>
        <p><b>Callback URL:</b> ${callbackUrl}</p>
        <hr>
        <p>Please check your Vercel Environment Variables:</p>
        <ul>
          <li>GITHUB_OAUTH_CLIENT_ID = your OAuth App Client ID from GitHub</li>
          <li>GITHUB_OAUTH_CLIENT_SECRET = your OAuth App Client Secret from GitHub</li>
        </ul>
        <p>Go to: GitHub → Settings → Developer settings → OAuth Apps → your app</p>`);
      return;
    }

    // Verify token
    const userResp = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${data.access_token}`, 'User-Agent': 'DecapCMS-OAuth' }
    });
    const user = await userResp.json();
    console.log('Authenticated as:', user.login, '- scopes:', data.scope);

    // Return HTML page that passes token to DecapCMS via postMessage
    // With fallback: if window.opener is null (due to redirects), use localStorage
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
  <meta charset="utf-8">
</head>
<body>
  <p style="font-family:sans-serif;text-align:center;margin-top:40px;">授权成功！正在返回管理系统...</p>
  <p style="font-family:sans-serif;text-align:center;color:#666;">用户: ${user.login} | 权限: ${data.scope || 'unknown'}</p>
  <p id="fallback-msg" style="font-family:sans-serif;text-align:center;color:red;display:none;">
    无法自动返回，请 <a id="fallback-link" href="#" onclick="fallback()">点击这里</a> 手动完成授权
  </p>
  <script>
    (function() {
      var tokenData = '{"token":"${data.access_token}","provider":"github"}';
      var tokenPayload = 'authorization:github:success:' + tokenData;

      // Method 1: postMessage (standard DecapCMS flow)
      function receiveMessage(e) {
        if (e.data === 'authorizing:github') {
          console.log('[OAuth] CMS ping received, sending token');
          window.opener.postMessage(tokenPayload, e.origin);
          // Keep window open briefly to ensure message is delivered
          setTimeout(function() { window.close(); }, 500);
        }
      }
      window.addEventListener('message', receiveMessage, false);

      // Try to send immediately if opener is ready
      if (window.opener) {
        console.log('[OAuth] window.opener exists, notifying CMS');
        window.opener.postMessage('authorizing:github', '*');
      } else {
        console.warn('[OAuth] window.opener is null! Trying fallback...');
        // Fallback: store token in localStorage for the parent window to pick up
        try {
          localStorage.setItem('ncp-github', tokenData);
          console.log('[OAuth] Token saved to localStorage as fallback');
          document.getElementById('fallback-msg').style.display = 'block';
          document.getElementById('fallback-link').href = window.location.origin + '/admin/';
        } catch(e) {
          console.error('[OAuth] localStorage fallback failed:', e);
        }
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
