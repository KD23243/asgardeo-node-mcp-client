import crypto from "crypto";
import http from "http";
import open from "open";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// PKCE helper functions
function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}

/**
 * Handles OAuth2 PKCE authentication and returns an access token.
 */

export interface OAuthPKCEParams {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export async function getTokenWithPKCE(params: OAuthPKCEParams): Promise<string> {
  const { authorizationEndpoint, tokenEndpoint, clientId, redirectUri, scope } = params;

  // 1. Generate code verifier and code challenge
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  // 2. Start a local server to listen for the redirect
  const server = http.createServer();
  const authCodePromise = new Promise<string>((resolve, reject) => {
    server.on('request', (req, res) => {
      if (!req.url) return;
      const url = new URL(req.url, redirectUri);
      const code = url.searchParams.get('code');
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication successful! You can close this window.</h1>');
        resolve(code);
        setTimeout(() => server.close(), 1000);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>No code found in the callback.</h1>');
        reject(new Error('No code in callback'));
        setTimeout(() => server.close(), 1000);
      }
    });
  });
  server.listen(8888);

  // 3. Open the browser for user login
  const authUrl = `${authorizationEndpoint}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;
  await open(authUrl);

  // 4. Wait for the code
  const code = await authCodePromise;

  // 5. Exchange code for token
  const tokenParams = new URLSearchParams();
  tokenParams.append('grant_type', 'authorization_code');
  tokenParams.append('client_id', clientId);
  tokenParams.append('code', code);
  tokenParams.append('redirect_uri', redirectUri);
  tokenParams.append('code_verifier', codeVerifier);

  const resp = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });
  if (!resp.ok) {
    throw new Error(`Token endpoint error: ${resp.status} ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.access_token;
}