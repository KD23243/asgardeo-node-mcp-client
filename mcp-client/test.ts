import { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import {
  OAuthClientMetadata,
  OAuthClientInformation,
  OAuthTokens,
  OAuthClientInformationFull,
} from "@modelcontextprotocol/sdk/shared/auth.js";


export class InMemoryOAuthClientProvider implements OAuthClientProvider {
  private _redirectUrl: string | URL;
  private _clientMetadata: OAuthClientMetadata;
  private _clientInfo?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;

  constructor(redirectUrl: string | URL, clientMetadata: OAuthClientMetadata) {
    this._redirectUrl = redirectUrl;
    this._clientMetadata = clientMetadata;
  }

  get redirectUrl(): string | URL {
    return this._redirectUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this._clientMetadata;
  }

  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    return this._clientInfo;
  }

  async saveClientInformation(clientInformation: OAuthClientInformationFull): Promise<void> {
    this._clientInfo = clientInformation;
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return this._tokens;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this._tokens = tokens;
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    window.location.href = authorizationUrl.toString(); // Works in browsers
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    this._codeVerifier = codeVerifier;
  }

  async codeVerifier(): Promise<string> {
    if (!this._codeVerifier) {
      throw new Error("Code verifier not found");
    }
    return this._codeVerifier;
  }
}
