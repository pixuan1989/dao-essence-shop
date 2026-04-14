// DecapCMS OAuth - Step 1: Redirect to GitHub for authorization
const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer 
    ? new URL(req.headers.referer || '').origin 
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://www.daoessentia.com';

  const callbackUrl = `${origin}/api/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=repo&state=${Math.random().toString(36).substring(7)}`;

  res.redirect(302, githubAuthUrl);
}
