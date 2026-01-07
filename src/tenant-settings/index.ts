import { Construct } from "constructs";
import { CustomResource, Duration } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ChangePasswordProps {
	/**
	 * Whether to use the custom change password HTML (true) or the default Auth0 page (false).
	 * @default false
	 */
	readonly enabled?: boolean;
	/**
	 * Custom change password HTML (Liquid syntax supported).
	 */
	readonly html?: string;
}

export interface DeviceFlowProps {
	/**
	 * Character set used to generate a User Code. Can be base20 or digits.
	 * @default base20
	 */
	readonly charset?: "base20" | "digits";
	/**
	 * Mask used to format a generated User Code into a friendly, readable format.
	 * @default ****-****
	 */
	readonly mask?: string;
}

export interface GuardianMfaPageProps {
	/**
	 * Whether to use the custom Guardian HTML (true) or the default Auth0 page (false).
	 * @default false
	 */
	readonly enabled?: boolean;
	/**
	 * Custom Guardian HTML (Liquid syntax is supported).
	 */
	readonly html?: string;
}

export interface ErrorPageProps {
	/**
	 * Custom Error HTML (Liquid syntax is supported).
	 */
	readonly html?: string;
	/**
	 * Whether to show the link to log as part of the default error page
	 * (true) or not to show the link (false).
	 * @default true
	 */
	readonly showLogLink?: boolean;
	/**
	 * URL to redirect to when an error occurs instead of showing the default error page.
	 * @format absolute-uri-or-empty
	 */
	readonly url?: string;
}

export interface FlagsProps {
	/**
	 * Whether all current connections should be enabled when a new client (application) is created (true) or not (false).
	 * @default true
	 */
	readonly enableClientConnections?: boolean;
	/**
	 * Whether the APIs section is enabled (true) or disabled (false).
	 * @default true
	 */
	readonly enableApisSection?: boolean;
	/**
	 * Whether advanced API Authorization scenarios are enabled (true) or disabled (false).
	 * @default true
	 */
	readonly enablePipeline2?: boolean;
	/**
	 * Whether third-party developers can dynamically register applications for your APIs (true) or not (false). This flag enables dynamic client registration.
	 * @default false
	 */
	readonly enableDynamicClientRegistration?: boolean;
	/**
	 * Whether the public sign up process shows a user_exists error (true) or a generic error (false) if the user already exists.
	 * @default false
	 */
	readonly enableLegacyProfile?: boolean;
	/**
	 * Whether classic Universal Login prompts include additional security headers to prevent clickjacking (true) or no safeguard (false).
	 * @default false
	 */
	readonly disableClickjackProtectionHeaders?: boolean;
	/**
	 * Do not Publish Enterprise Connections Information with IdP domains on the lock configuration file.
	 * @default false
	 */
	readonly noDiscloseEnterpriseConnections?: boolean;
	/**
	 * If true, SMS phone numbers will not be obfuscated in Management API GET calls.
	 * @default false
	 */
	readonly disableManagementApiSmsObfuscation?: boolean;
	/**
	 * Changes email_verified behavior for Azure AD/ADFS connections when enabled. Sets email_verified to false otherwise.
	 */
	readonly trustAzureAdfsEmailVerifiedConnectionProperty?: boolean;
	/**
	 * Enables the email verification flow during login for Azure AD and ADFS connections.
	 * @default false
	 */
	readonly enableAdfsWaadEmailVerification?: boolean;
	/**
	 * Delete underlying grant when a Refresh Token is revoked via the Authentication API.
	 * @default false
	 */
	readonly revokeRefreshTokenGrant?: boolean;
	/**
	 * Enables new insights activity page view.
	 * @default true
	 */
	readonly dashboardInsightsView?: boolean;
	/**
	 * Disables SAML fields map fix for bad mappings with repeated attributes.
	 * @default false
	 */
	readonly disableFieldsMapFix?: boolean;
	/**
	 * Used to allow users to pick what factor to enroll of the available MFA factors.
	 * @default false
	 */
	readonly mfaShowFactorListOnEnrollment?: boolean;
}

export interface TenantSettingsProps extends Auth0Props {
	/**
	 * Change Password page customization.
	 */
	readonly changePassword?: ChangePasswordProps;
	/**
	 * Device Flow configuration.
	 */
	readonly deviceFlow?: DeviceFlowProps;
	/**
	 * Guardian page customization.
	 */
	readonly guardianMfaPage?: GuardianMfaPageProps;
	/**
	 * Default audience for API Authorization.
	 */
	readonly defaultAudience?: string;
	/**
	 * Name of connection used for password grants at the /token endpoint. The
	 * following connection types are supported: LDAP, AD, Database Connections,
	 * Passwordless, Windows Azure Active Directory, ADFS.
	 */
	readonly defaultDirectory?: string;
	/**
	 * Error page customization.
	 */
	readonly errorPage?: ErrorPageProps;
	/**
	 * Flags used to change the behavior of this tenant.
	 */
	readonly flags?: FlagsProps;
	/**
	 * Friendly name for this tenant.
	 */
	readonly friendlyName?: string;
	/**
	 * URL of logo to be shown for this tenant (recommended size: 150x150).
	 */
	readonly pictureUrl?: string;
	/**
	 * End-user support email.
	 */
	readonly supportEmail?: string;
	/**
	 * End-user support url.
	 */
	readonly supportUrl?: string;
	/**
	 * URLs that are valid to redirect to after logout from Auth0.
	 */
	readonly allowedLogoutUrls?: string[];
	/**
	 * The amount of time a session will stay valid.
	 * @default 30 days
	 */
	readonly sessionLifetime?: Duration;
	/**
	 * The amount of time a session can be inactive before the user must log in again.
	 * @default 3 days
	 */
	readonly idleSessionLifetime?: Duration;
	/**
	 * length: <= length <= 8
	 * Selected sandbox version for the extensibility environment.
	 */
	readonly sandboxVersion?: string;
	/**
	 * The default absolute redirection uri, must be https.
	 * @format absolute-https-uri-or-empty
	 */
	readonly defaultRedirectionUri?: string;
	/**
	 * Supported locales for the user interface.
	 * @default ["en"]
	 */
	readonly enabledLocales?: string[];
	/**
	 * Session cookie configuration.
	 */
	readonly sessionCookie?: "persistent" | "non-persistent";
}

/**
 * @category Constructs
 */
export class TenantSettings extends CustomResource {
	constructor(scope: Construct, id: string, props: TenantSettingsProps) {
		const sessionLifetime = props.sessionLifetime?.toHours() || 336;
		const idleSessionLifetime = props.idleSessionLifetime?.toHours() || 72;

		if (sessionLifetime > 336) {
			throw new Error("sessionLifetime can't exceed 336 hours");
		}

		if (idleSessionLifetime > 72) {
			throw new Error("idleSessionLifetime can't exceed 72 hours");
		}

		super(scope, id, {
			resourceType: "Custom::Auth0Action",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				changePassword: {
					enabled: props.changePassword?.enabled || false,
					html: props.changePassword?.html,
				},
				deviceFlow: {
					charset: props.deviceFlow?.charset || "base20",
					mask: props.deviceFlow?.mask || "****-****",
				},
				guardianMfaPage: {
					enabled: props.guardianMfaPage?.enabled || false,
					html: props.guardianMfaPage?.html,
				},
				defaultAudience: props.defaultAudience,
				defaultDirectory: props.defaultDirectory,
				errorPage: {
					html: props.errorPage?.html,
					showLogLink: props.errorPage?.showLogLink || true,
					url: props.errorPage?.url,
				},
				flags: {
					enableClientConnections: props.flags?.enableClientConnections || true,
					enableApisSection: props.flags?.enableApisSection || true,
					enablePipeline2: props.flags?.enablePipeline2 || true,
					enableDynamicClientRegistration:
						props.flags?.enableDynamicClientRegistration || false,
					enableLegacyProfile: props.flags?.enableLegacyProfile || false,
					disableClickjackProtectionHeaders:
						props.flags?.disableClickjackProtectionHeaders || false,
					noDiscloseEnterpriseConnections:
						props.flags?.noDiscloseEnterpriseConnections || false,
					disableManagementApiSmsObfuscation:
						props.flags?.disableManagementApiSmsObfuscation || false,
					trustAzureAdfsEmailVerifiedConnectionProperty:
						props.flags?.trustAzureAdfsEmailVerifiedConnectionProperty,
					enableAdfsWaadEmailVerification:
						props.flags?.enableAdfsWaadEmailVerification || false,
					revokeRefreshTokenGrant:
						props.flags?.revokeRefreshTokenGrant || false,
					dashboardInsightsView: props.flags?.dashboardInsightsView || true,
					disableFieldsMapFix: props.flags?.disableFieldsMapFix || false,
					mfaShowFactorListOnEnrollment:
						props.flags?.mfaShowFactorListOnEnrollment || false,
				},
				friendlyName: props.friendlyName,
				pictureUrl: props.pictureUrl,
				supportEmail: props.supportEmail,
				supportUrl: props.supportUrl,
				allowedLogoutUrls: props.allowedLogoutUrls,
				sessionLifetime,
				idleSessionLifetime,
				sandboxVersion: props.sandboxVersion,
				defaultRedirectionUri: props.defaultRedirectionUri,
				enabledLocales: props.enabledLocales || ["en"],
				sessionCookie: props.sessionCookie,
			},
		});
	}
}
