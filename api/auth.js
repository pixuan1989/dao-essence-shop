// DecapCMS GitHub OAuth Proxy for Vercel
// Handles OAuth flow: /api/auth (login) → GitHub → /api/auth?code=xxx (callback)

const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url || '', 'http://localhost');
  const code = searchParams.get('code');

  // Step 1: Redirect to GitHub for authorization
  if (!code) {
    const redirectUri = encodeURIComponent(`${process.env.VERCEL_URL || 'https://www.daoessentia.com'}/api/auth`);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo&state=${Math.random().toString(36).substring(7)}`;
    res.redirect(302, githubAuthUrl);
    return;
  }

  // Step 2: Handle callback - exchange code for token
  try {
    const redirectUri = `${process.env.VERCEL_URL || 'https://www.daoessentia.com'}/api/auth`;

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
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenResponse.json();

    if (!data.access_token) {
      res.status(401).send('GitHub authorization failed');
      return;
    }

    // Return HTML that passes token to DecapCMS via postMessage
    const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:{"token":"${data.access_token}","provider":"github"}',
      e.origin
    );
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
<p>Authorization complete. You can close this window.</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth proxy error');
  }
}
