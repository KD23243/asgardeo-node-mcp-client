
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getTokenWithPKCE } from "./OAuthPKCEHandler.js";


export class AsgardeoClient extends Client {
  private authToken: string | null = null;
  customTransport: StreamableHTTPClientTransport;
  serverBaseUrl: URL;
  clientId?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  redirectUri?: string;
  scope?: string;

  constructor(options: any) {
    super(options);
    // Accept serverBaseUrl from options, fallback to default if not provided
    this.serverBaseUrl = new URL(options.serverBaseUrl);
    this.customTransport = new StreamableHTTPClientTransport(this.serverBaseUrl, {});
    this.clientId = options.clientId;
    this.authorizationEndpoint = options.authorizationEndpoint;
    this.tokenEndpoint = options.tokenEndpoint;
    this.redirectUri = options.redirectUri;
    this.scope = options.scope;
  }

  private updateTransport() {
    const headers: Record<string, string> = this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
    this.customTransport = new StreamableHTTPClientTransport(this.serverBaseUrl, { requestInit: { headers } });
  }

  private async ensureConnected() {
    this.updateTransport();
    await this.connect(this.customTransport);
  }

  async secureListTools() {
    try {
      await this.ensureConnected();
      return await this.listTools();
    } catch (err: any) {
      const msg = err?.message || err?.body || String(err);
      if (msg.includes("401") || msg.includes("invalid_token")) {
        console.warn("Token missing/expired. Attempting to obtain new token...");
        this.authToken = await getTokenWithPKCE({
          authorizationEndpoint: this.authorizationEndpoint!,
          tokenEndpoint: this.tokenEndpoint!,
          clientId: this.clientId!,
          redirectUri: this.redirectUri!,
          scope: this.scope!,
        });
        await this.ensureConnected();
        return await this.listTools();
      }
      throw err;
    }
  }

  async secureCallTool(toolCallArgs: any) {
    try {
      await this.ensureConnected();
      return await this.callTool({
        ...toolCallArgs,
        arguments: {
          ...toolCallArgs.arguments,
          authorizationToken: this.authToken,
        }
      });
    } catch (err: any) {
      const msg = err?.message || err?.body || String(err);
      if (msg.includes("401") || msg.includes("invalid_token")) {
        console.warn("Token missing/expired. Attempting to refresh...");
        this.authToken = await getTokenWithPKCE({
          authorizationEndpoint: this.authorizationEndpoint!,
          tokenEndpoint: this.tokenEndpoint!,
          clientId: this.clientId!,
          redirectUri: this.redirectUri!,
          scope: this.scope!,
        });
        await this.ensureConnected();
        return await this.callTool({
          ...toolCallArgs,
          arguments: {
            ...toolCallArgs.arguments,
            authorizationToken: this.authToken,
          }
        });
      }
      throw err;
    }
  }
}