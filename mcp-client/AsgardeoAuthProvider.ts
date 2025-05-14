import { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import {
    OAuthClientMetadata,
    OAuthClientInformation,
    OAuthTokens,
    OAuthClientInformationFull,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { promises as fs } from "fs";
import { join } from "path";

export class AsgardeoOAuthClientProvider implements OAuthClientProvider {
    #tokens?: OAuthTokens;
    #codeVerifier?: string;
    #codeVerifierFile = join(__dirname, ".code_verifier");
    #tokensFile = join(__dirname, ".tokens");

    private _redirectUrl: string;
    private _clientId: string;
    private _grantTypes: string[];

    constructor({
        redirectUrl,
        client_id,
        grant_types
    }: {
        redirectUrl: string;
        client_id: string;
        grant_types: string[];
    }) {
        this._redirectUrl = redirectUrl;
        this._clientId = client_id;
        this._grantTypes = grant_types;
    }

    get redirectUrl(): string {
        return this._redirectUrl;
    }

    get clientMetadata(): OAuthClientMetadata {
        //server metadata call
        return {
            client_id: this._clientId,
            redirect_uris: [this.redirectUrl],
            response_types: ["code"],
            codeChallengeMethod: ["S256"],
            grant_types: this._grantTypes
        };
    }

    async clientInformation(): Promise<OAuthClientInformation> {
        return {
            client_id: this._clientId
        };
    }

    async tokens(): Promise<OAuthTokens | undefined> {
        if (this.#tokens) return this.#tokens;
        try {
            const tokensStr = await fs.readFile(this.#tokensFile, "utf-8");
            const tokens = JSON.parse(tokensStr);
            this.#tokens = tokens;
            return tokens;
        } catch (err) {
            return undefined;
        }
    }

    async saveTokens(tokens: OAuthTokens): Promise<void> {
        console.log("Saving tokens:", tokens);
        this.#tokens = tokens;
        await fs.writeFile(this.#tokensFile, JSON.stringify(tokens), "utf-8");
    }

    async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
        console.log("Code verifier:", this.#codeVerifier);
        console.log("Redirect to:", authorizationUrl.toString());
    }

    async saveCodeVerifier(codeVerifier: string): Promise<void> {
        this.#codeVerifier = codeVerifier;
        await fs.writeFile(this.#codeVerifierFile, codeVerifier, "utf-8");
    }

    async codeVerifier(): Promise<string> {
        if (this.#codeVerifier) return this.#codeVerifier;
        try {
            const codeVerifier = await fs.readFile(this.#codeVerifierFile, "utf-8");
            this.#codeVerifier = codeVerifier;
            return codeVerifier;
        } catch (err) {
            throw new Error("Missing code verifier");
        }
    }
}