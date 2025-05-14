# MCP Client Example

This project demonstrates how to use the [Model Context Protocol (MCP)](https://modelcontextprotocol.org/) SDK to authenticate with an OAuth provider (Asgardeo) and connect to an MCP server using Node.js and Express.

## Features

- OAuth2 authentication flow using Asgardeo as the provider.
- Express server to handle OAuth callback.
- Connects to an MCP server and lists available tools.

## Prerequisites

- Node.js (v18+ recommended)
- [pnpm](https://pnpm.io/)
- MCP server running at `http://localhost:3000`
- Asgardeo OAuth application credentials

## Setup

1. **Install dependencies:**
   ```sh
   pnpm install
   ```

2. **Configure environment variables:**

   Create a `.env` file in the `mcp-client` directory with the following content:
   ```env
   REDIRECT_URL=http://localhost:8888/mcp/callback
   CLIENT_ID=<your-asgardeo-client-id>
   GRANT_TYPES=authorization_code,refresh_token
   ```
   Adjust values as needed for your Asgardeo application.

## Usage

1. **Start the authentication server and client:**
   ```sh
   pnpm dev
   ```

2. **Authenticate:**
   - Visit the authorization URL provided by your Asgardeo application.
   - After authorizing, you will be redirected to `http://localhost:8888/mcp/callback`.

3. **MCP Client:**
   - After successful authentication, the client connects to the MCP server and lists available tools in the console.

## How Tokens Are Stored

- After successful OAuth authentication, the access token (and optionally refresh token) is stored by the `AsgardeoOAuthClientProvider` implementation.
- By default, tokens are persisted in the `.tokens` file in the project directory. This allows the client to recall tokens across restarts, so you do not need to re-authenticate every time.

## How Tokens Are Recalled

- When the MCP client (`client.ts`) is started again, the `auth` function checks for an existing valid token via the `authProvider`.
- If the `.tokens` file exists and contains a valid token, it is reused for authentication and API calls, so the user does not need to re-authenticate.
- If the token is expired or missing, the OAuth flow is triggered again.

## File Structure

- `client.ts` – Main entry point; handles OAuth flow and MCP client connection.
- `AsgardeoAuthProvider.ts` – Custom OAuth provider implementation for Asgardeo.
- `.env` – Environment variables (not committed to version control).
- `.env` – Environment variables (not committed to version control).
