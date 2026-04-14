// DecapCMS OAuth - Step 2: Handle GitHub callback, exchange code for token, pass to CMS
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
      res.status(401).send(`GitHub authorization failed: ${data.error_description || data.error}`);
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
