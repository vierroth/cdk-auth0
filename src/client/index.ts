import { Construct } from "constructs";
import { CustomResource, Duration, Names } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface JwtProps {
	/**
	 * Period (in seconds) for which JWT tokens will remain valid.
	 * @default `1 hour`
	 */
	readonly tokenLifetime?: Duration;
	/**
	 * Algorithm used to sign JWTs. Can be HS256 or RS256. PS256 available via addon.
	 * @default `"RS256"`
	 */
	readonly alg: "HS256" | "RS256" | "RS512" | "PS256";
}

export interface RefreshTokenProps {
	/**
	 * @default `"rotating"`
	 */
	readonly rotationType?: "rotating" | "non-rotating";
	/**
	 * @default `"expiring"`
	 */
	readonly expirationType?: "expiring" | "non-expiring";
	/**
	 * Period (in seconds) where the previous refresh token can be exchanged without triggering breach detection
	 * @default `0`
	 */
	readonly leeway?: Duration;
	/**
	 * Period (in seconds) for which refresh tokens will remain valid
	 * @default `30 days`
	 */
	readonly tokenLifetime?: Duration;
	/**
	 * Prevents tokens from having a set lifetime when true (takes precedence over token_lifetime values)
	 * @default `false`
	 */
	readonly infiniteTokenLifetime?: boolean;
	/**
	 * Period (in seconds) for which refresh tokens will remain valid without use
	 * @default `7 days`
	 */
	readonly idleTokenLifetime?: Duration;
	/**
	 * Prevents tokens from expiring without use when true (takes precedence over idle_token_lifetime values)
	 * @default `false`
	 */
	readonly infiniteIdleTokenLifetime?: boolean;
}

export interface ClientProps extends Auth0Props {
	/**
	 * Name of this client (min length: 1 character, does not allow < or >)
	 */
	readonly name?: string;
	/**
	 * Free text description of this client (max length: 140 characters)
	 */
	readonly description?: string;
	/**
	 * URL of the logo to display for this client. Recommended size is 150x150 pixels
	 */
	readonly logoUri?: string;
	/**
	 * List of URLs whitelisted for Auth0 to use as a callback to the client after authentication
	 */
	readonly callbacks?: Array<string>;
	/**
	 * List of URLs allowed to make requests from JavaScript to Auth0 API (typically used with CORS). By default, all your callback URLs will be allowed. This field allows you to enter other origins if necessary. You can also use wildcards at the subdomain level (e.g., https://*.contoso.com). Query strings and hash information are not taken into account when validating these URLs
	 */
	readonly allowedOrigins?: Array<string>;
	/**
	 * List of allowed origins for use with Cross-Origin Authentication, Device Flow, and web message response mode
	 */
	readonly webOrigins?: Array<string>;
	/**
	 * List of audiences/realms for SAML protocol. Used by the wsfed addon
	 */
	readonly clientAliases?: Array<string>;
	/**
	 * Metadata associated with the client, in the form of an object with string values (max 255 chars). Maximum of 10 metadata properties allowed. Field names (max 255 chars) are alphanumeric and may only include the following special characters: :,-+=_*?"/()><@ [Tab][Space]
	 */
	readonly clientMetadata?: { [key: string]: string };
	/**
	 * List of allow clients and API ids that are allowed to make delegation requests. Empty means all all your clients are allowed
	 */
	readonly allowedClients?: Array<string>;
	/**
	 * List of URLs that are valid to redirect to after logout from Auth0. Wildcards are allowed for subdomains
	 */
	readonly allowedLogoutUrls?: Array<string>;
	/**
	 * List of grant types supported for this application. Can include authorization_code, implicit, refresh_token, client_credentials, password, http://auth0.com/oauth/grant-type/password-realm, http://auth0.com/oauth/grant-type/mfa-oob, http://auth0.com/oauth/grant-type/mfa-otp, http://auth0.com/oauth/grant-type/mfa-recovery-code, and urn:ietf:params:oauth:grant-type:device_code
	 * @default `["authorization_code", "implicit"]`
	 */
	readonly grantTypes?: Array<
		| "authorization_code"
		| "implicit"
		| "refresh_token"
		| "client_credentials"
		| "password"
		| "http://auth0.com/oauth/grant-type/password-realm"
		| "http://auth0.com/oauth/grant-type/mfa-oob"
		| "http://auth0.com/oauth/grant-type/mfa-otp"
		| "http://auth0.com/oauth/grant-type/mfa-recovery-code"
		| "urn:openid:params:grant-type:ciba"
		| "and urn:ietf:params:oauth:grant-type:device_code"
	>;
	/**
	 * Defines the requested authentication method for the token endpoint. Can be none (public client without a client secret), client_secret_post (client uses HTTP POST parameters), or client_secret_basic (client uses HTTP Basic)
	 * @default `"none"`
	 */
	readonly tokenEndpointAuthMethod?:
		| "none"
		| "client_secret_post"
		| "client_secret_basic";
	/**
	 * Type of client used to determine which settings are applicable
	 */
	readonly appType?:
		| "native"
		| "spa"
		| "regular_web"
		| "non_interactive"
		| "resource_server"
		| "express_configuration"
		| "rms"
		| "box"
		| "cloudbees"
		| "concur"
		| "dropbox"
		| "mscrm"
		| "echosign"
		| "egnyte"
		| "newrelic"
		| "office365"
		| "salesforce"
		| "sentry"
		| "sharepoint"
		| "slack"
		| "springcm"
		| "zendesk"
		| "zoom"
		| "sso_integration"
		| "oag";
	/**
	 *  Whether this client a first party client or not
	 */
	readonly isFirstParty?: Boolean;
	/**
	 * Whether this client conforms to strict OIDC specifications (true) or uses legacy features (false)
	 */
	readonly oidcConformant?: boolean;
	/**
	 * JWT configuration
	 */
	readonly jwt?: JwtProps;
	/**
	 * Applies only to SSO clients and determines whether Auth0 will handle Single Sign On (true) or whether the Identity Provider will (false)
	 */
	readonly sso?: boolean;
	/**
	 * Whether this client can be used to make cross-origin authentication requests (true) or it is not allowed to make such requests (false)
	 */
	readonly crossOriginAuthentication?: boolean;
	/**
	 * URL of the location in your site where the cross origin verification takes place for the cross-origin auth flow when performing Auth in your own domain instead of Auth0 hosted login page
	 */
	readonly crossOriginLoc?: string;
	/**
	 * true to disable Single Sign On, false otherwise (default: false)
	 */
	readonly ssoDisabled?: boolean;
	/**
	 * true if the custom login page is to be used, false otherwise. Defaults to true
	 */
	readonly customLoginPageOn?: boolean;
	/**
	 * The content (HTML, CSS, JS) of the custom login page.
	 */
	readonly customLoginPage?: boolean;
	/**
	 * The content (HTML, CSS, JS) of the custom login page. (Used on Previews)
	 */
	readonly customLoginPagePreview?: boolean;
	/**
	 * HTML form template to be used for WS-Federation.
	 */
	readonly formTemplate?: string;
	/**
	 * Initiate login uri, must be https
	 */
	readonly initiateLoginUri?: string;
	/**
	 * Refresh token configuration
	 */
	readonly refreshToken?: RefreshTokenProps;
	/**
	 * Defines how to proceed during an authentication transaction with regards an organization. Can be deny (default), allow or require
	 * @default `"deny"`
	 */
	readonly organizationUsage?: "deny" | "allow" | "require";
	/**
	 * Defines how to proceed during an authentication transaction when client.organization_usage: 'require'. Can be no_prompt (default), pre_login_prompt or post_login_prompt. post_login_prompt requires oidc_conformant: true
	 * @default `"no_prompt"`
	 */
	readonly organizationRequireBehavior?:
		| "no_prompt"
		| "pre_login_prompt"
		| "post_login_prompt";
}

/**
 * @category Constructs
 */
export class Client extends CustomResource {
	/**
	 * The ID of the Auth0 client
	 */
	public readonly clientId = this.getAttString("clientId");
	/**
	 * A secret instance containing the secret value of the Auth0 client
	 */
	public readonly clientSecret: Secret;
	/**
	 * The domain of the Auth0 client
	 */
	public readonly clientDomain = this.getAttString("clientDomain");

	constructor(scope: Construct, id: string, props: ClientProps) {
		const clientSecretSecret = new Secret(scope, `${id}Secret`);

		super(scope, id, {
			resourceType: "Custom::Auth0Client",
			serviceToken: Provider.getOrCreate(scope, {
				apiSecret: props.apiSecret,
				clientSecret: clientSecretSecret,
			}),
			properties: {
				secretName: props.apiSecret.secretName,
				clientSecretName: clientSecretSecret.secretName,
				name:
					props.name ||
					`${Names.uniqueResourceName(scope, {
						maxLength: 127 - id.length,
						allowedSpecialCharacters: "-",
						separator: "-",
					})}-${id}`,
				description: props.description,
				logoUri: props.logoUri,
				callbacks: props.callbacks || [],
				allowedOrigins: props.allowedOrigins || [],
				webOrigins: props.webOrigins || [],
				clientAliases: props.clientAliases || [],
				clientMetadata: props.clientMetadata,
				allowedClients: props.allowedClients || [],
				allowedLogoutUrls: props.allowedLogoutUrls || [],
				grantTypes: props.grantTypes || ["authorization_code", "implicit"],
				tokenEndpointAuthMethod: props.tokenEndpointAuthMethod || "none",
				appType: props.appType,
				isFirstParty: props.isFirstParty || false,
				oidcConformant: props.oidcConformant || false,
				jwt: {
					tokenLifetime: props.jwt?.tokenLifetime?.toSeconds() || 3600,
					alg: props.jwt?.alg || "RS256",
				},
				sso: props.sso || false,
				crossOriginAuthentication: props.crossOriginAuthentication || false,
				crossOriginLoc: props.crossOriginLoc,
				ssoDisabled: props.ssoDisabled || false,
				customLoginPageOn: props.customLoginPageOn || false,
				customLoginPage: props.customLoginPage || false,
				customLoginPagePreview: props.customLoginPagePreview || false,
				formTemplate: props.formTemplate,
				initiateLoginUri: props.initiateLoginUri,
				refreshToken: props.refreshToken
					? {
							rotationType: props.refreshToken?.rotationType || "rotating",
							expirationType: props.refreshToken?.expirationType || "expiring",
							leeway: props.refreshToken?.leeway?.toSeconds() || 0,
							tokenLifetime:
								props.refreshToken?.tokenLifetime?.toSeconds() || 2592000,
							infiniteTokenLifetime:
								props.refreshToken?.infiniteTokenLifetime || false,
							idleTokenLifetime:
								props.refreshToken?.idleTokenLifetime?.toSeconds() || 604800,
							infiniteIdleTokenLifetime:
								props.refreshToken?.infiniteIdleTokenLifetime || false,
					  }
					: undefined,
				organizationUsage: props.organizationUsage,
				organizationRequireBehavior: props.organizationRequireBehavior,
			},
		});

		this.clientSecret = clientSecretSecret;
	}
}
