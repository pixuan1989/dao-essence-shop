// DecapCMS OAuth - Step 1: Redirect to GitHub for authorization
const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;

export default async function handler(req, res) {
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

  const callbackUrl = `${origin}/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=repo&state=${Math.random().toString(36).substring(7)}`;

  res.redirect(302, githubAuthUrl);
}
