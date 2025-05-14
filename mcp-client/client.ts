import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import express from "express";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { AsgardeoOAuthClientProvider } from "./AsgardeoAuthProvider.js";
import dotenv from "dotenv";
import { auth, exchangeAuthorization, startAuthorization } from "@modelcontextprotocol/sdk/client/auth.js";

dotenv.config();

(function startAuthServer() {
  const app = express();
  app.get('/mcp/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      res.status(400).send('Missing authorization code');
      return;
    }
    const authCode = code.toString();

    const authProvider = new AsgardeoOAuthClientProvider({
      redirectUrl: process.env.REDIRECT_URL!,
      client_id: process.env.CLIENT_ID!,
      grant_types: process.env.GRANT_TYPES!.split(",")
    });
    try {
      await auth(authProvider, {
        serverUrl: new URL("http://localhost:3000"),
        authorizationCode: authCode,
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
    }
    res.send('Authorization code received. You can close this window.');
  });
  app.listen(8888, () => {
    console.log('Server listening on http://localhost:8888');
  });
})();

(async () => {
  const authProvider = new AsgardeoOAuthClientProvider({
    redirectUrl: process.env.REDIRECT_URL!,
    client_id: process.env.CLIENT_ID!,
    grant_types: process.env.GRANT_TYPES!.split(",")
  });

  let result;
  try {
    result = await auth(authProvider, {
      serverUrl: new URL("http://localhost:3000"),
      authorizationCode: undefined,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
  }

  console.log("Auth result:", result);

  //   const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"), { authProvider });
  //     const client = new Client(
  //       {
  //         name: "example-client",
  //         version: "1.0.0"
  //       }
  //     );

  //     await client.connect(transport);
  //     console.log("Connected");
  //     const tools = await client.listTools();
  //     console.log('Tools:', tools);

})();
