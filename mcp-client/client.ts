import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getTokenWithPKCE } from "./InspectorOAuthClientProvider.js";

const main = async () => {
  const client = new Client({ name: 'streamable-http-client-example', version: '1.0.0' });
  const baseUrl = new URL('http://localhost:3000/mcp');

  let authToken = null;
  try {
    authToken = await getTokenWithPKCE();
  } catch (e) {
    console.error('OAuth2 PKCE authentication failed:', e);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${authToken}` };
  const transport = new StreamableHTTPClientTransport(baseUrl, { requestInit: { headers } });
  try {
    await client.connect(transport);
    console.log("Connected");
    const tools = await client.listTools();
    console.log('Tools:', tools);

    let result;
    result = await client.callTool({
            name: "get_pet_vaccination_info",
            arguments: {
                petId: "123",
                authorizationToken: authToken,
            }
        });

    console.log("Result:", result);

    
  } catch (err: any) {
    const msg = err?.message || err?.body || String(err);
    if (msg.includes("401") || msg.includes("invalid_token")) {
      console.error("Authentication failed: No token or invalid token provided.");
    } else {
      console.error("MCP error:", msg);
    }
  }
};

main();