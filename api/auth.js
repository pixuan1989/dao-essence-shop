// DecapCMS OAuth - Step 1: Redirect to GitHub for authorization
const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;

export default async function handler(req, res) {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).send('Missing GITHUB_OAUTH_CLIENT_ID env var');
  }

  const origin = 'https://www.daoessentia.com';
  const callbackUrl = `${origin}/api/callback`;
  const state = Math.random().toString(36).substring(7);

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&scope=repo` +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(302, githubAuthUrl);
}
