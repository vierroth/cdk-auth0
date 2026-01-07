import type { CdkCustomResourceEvent } from "aws-lambda";
import { ManagementClient } from "auth0";

import type { ENV } from "./../lambda-base";
import { getSecretValue } from "./../get-secret-value";

declare global {
	namespace NodeJS {
		interface ProcessEnv extends ENV {}
	}
}

export async function handler(event: CdkCustomResourceEvent) {
	const auth0Api = JSON.parse(
		await getSecretValue(
			event.ResourceProperties.secretName,
			process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
			process.env.AWS_SESSION_TOKEN,
		),
	);

	const auth0 = new ManagementClient({
		domain: auth0Api.domain,
		clientId: auth0Api.clientId,
		clientSecret: auth0Api.clientSecret,
	});

	switch (event.RequestType) {
		case "Create": {
			await auth0.tenants.settings.update({
				change_password: {
					enabled: event.ResourceProperties.changePassword.enabled === "true",
					html: event.ResourceProperties.changePassword.html,
				},
				device_flow: {
					charset: event.ResourceProperties.deviceFlow.charset,
					mask: event.ResourceProperties.deviceFlow.mask,
				},
				guardian_mfa_page: {
					enabled: event.ResourceProperties.guardianMfaPage.enabled === "true",
					html: event.ResourceProperties.guardianMfaPage.html,
				},
				default_audience: event.ResourceProperties.defaultAudience,
				default_directory: event.ResourceProperties.defaultDirectory,
				error_page: {
					html: event.ResourceProperties.errorPage.html,
					show_log_link:
						event.ResourceProperties.errorPage.showLogLink === "true",
					url: event.ResourceProperties.errorPage.url,
				},
				flags: {
					enable_client_connections:
						event.ResourceProperties.flags.enableClientConnections === "true",
					enable_apis_section:
						event.ResourceProperties.flags.enableApisSection === "true",
					enable_pipeline2:
						event.ResourceProperties.flags.enablePipeline2 === "true",
					enable_dynamic_client_registration:
						event.ResourceProperties.flags.enableDynamicClientRegistration ===
						"true",
					enable_legacy_profile:
						event.ResourceProperties.flags.enableLegacyProfile === "true",
					disable_clickjack_protection_headers:
						event.ResourceProperties.flags.disableClickjackProtectionHeaders ===
						"true",
					no_disclose_enterprise_connections:
						event.ResourceProperties.flags.noDiscloseEnterpriseConnections ===
						"true",
					disable_management_api_sms_obfuscation:
						event.ResourceProperties.flags
							.disableManagementApiSmsObfuscation === "true",
					trust_azure_adfs_email_verified_connection_property:
						"trustAzureAdfsEmailVerifiedConnectionProperty" in
						event.ResourceProperties.flags
							? event.ResourceProperties.flags
									.trustAzureAdfsEmailVerifiedConnectionProperty === "true"
							: undefined,
					enable_adfs_waad_email_verification:
						event.ResourceProperties.flags.enableAdfsWaadEmailVerification ===
						"true",
					revoke_refresh_token_grant:
						event.ResourceProperties.flags.revokeRefreshTokenGrant === "true",
					dashboard_insights_view:
						event.ResourceProperties.flags.dashboardInsightsView === "true",
					disable_fields_map_fix:
						event.ResourceProperties.flags.disableFieldsMapFix === "true",
					mfa_show_factor_list_on_enrollment:
						event.ResourceProperties.flags.mfaShowFactorListOnEnrollment ===
						"true",
				},
				friendly_name: event.ResourceProperties.friendlyName,
				picture_url: event.ResourceProperties.pictureUrl,
				support_email: event.ResourceProperties.supportEmail,
				support_url: event.ResourceProperties.supportUrl,
				allowed_logout_urls: event.ResourceProperties.allowedLogoutUrls,
				session_lifetime: Number(event.ResourceProperties.sessionLifetime),
				idle_session_lifetime: Number(
					event.ResourceProperties.idleSessionLifetime,
				),
				sandbox_version: event.ResourceProperties.sandboxVersion,
				default_redirection_uri: event.ResourceProperties.defaultRedirectionUri,
				enabled_locales: event.ResourceProperties.enabledLocales,
				session_cookie: event.ResourceProperties.sessionCookie,
			});

			return {
				PhysicalResourceId: "tenantSettings",
			};
		}
		case "Update": {
			await auth0.tenants.settings.update({
				change_password: {
					enabled: event.ResourceProperties.changePassword.enabled === "true",
					html: event.ResourceProperties.changePassword.html,
				},
				device_flow: {
					charset: event.ResourceProperties.deviceFlow.charset,
					mask: event.ResourceProperties.deviceFlow.mask,
				},
				guardian_mfa_page: {
					enabled: event.ResourceProperties.guardianMfaPage.enabled === "true",
					html: event.ResourceProperties.guardianMfaPage.html,
				},
				default_audience: event.ResourceProperties.defaultAudience,
				default_directory: event.ResourceProperties.defaultDirectory,
				error_page: {
					html: event.ResourceProperties.errorPage.html,
					show_log_link:
						event.ResourceProperties.errorPage.showLogLink === "true",
					url: event.ResourceProperties.errorPage.url,
				},
				flags: {
					enable_client_connections:
						event.ResourceProperties.flags.enableClientConnections === "true",
					enable_apis_section:
						event.ResourceProperties.flags.enableApisSection === "true",
					enable_pipeline2:
						event.ResourceProperties.flags.enablePipeline2 === "true",
					enable_dynamic_client_registration:
						event.ResourceProperties.flags.enableDynamicClientRegistration ===
						"true",
					enable_legacy_profile:
						event.ResourceProperties.flags.enableLegacyProfile === "true",
					disable_clickjack_protection_headers:
						event.ResourceProperties.flags.disableClickjackProtectionHeaders ===
						"true",
					no_disclose_enterprise_connections:
						event.ResourceProperties.flags.noDiscloseEnterpriseConnections ===
						"true",
					disable_management_api_sms_obfuscation:
						event.ResourceProperties.flags
							.disableManagementApiSmsObfuscation === "true",
					trust_azure_adfs_email_verified_connection_property:
						"trustAzureAdfsEmailVerifiedConnectionProperty" in
						event.ResourceProperties.flags
							? event.ResourceProperties.flags
									.trustAzureAdfsEmailVerifiedConnectionProperty === "true"
							: undefined,
					enable_adfs_waad_email_verification:
						event.ResourceProperties.flags.enableAdfsWaadEmailVerification ===
						"true",
					revoke_refresh_token_grant:
						event.ResourceProperties.flags.revokeRefreshTokenGrant === "true",
					dashboard_insights_view:
						event.ResourceProperties.flags.dashboardInsightsView === "true",
					disable_fields_map_fix:
						event.ResourceProperties.flags.disableFieldsMapFix === "true",
					mfa_show_factor_list_on_enrollment:
						event.ResourceProperties.flags.mfaShowFactorListOnEnrollment ===
						"true",
				},
				friendly_name: event.ResourceProperties.friendlyName,
				picture_url: event.ResourceProperties.pictureUrl,
				support_email: event.ResourceProperties.supportEmail,
				support_url: event.ResourceProperties.supportUrl,
				allowed_logout_urls: event.ResourceProperties.allowedLogoutUrls,
				session_lifetime: Number(event.ResourceProperties.sessionLifetime),
				idle_session_lifetime: Number(
					event.ResourceProperties.idleSessionLifetime,
				),
				sandbox_version: event.ResourceProperties.sandboxVersion,
				default_redirection_uri: event.ResourceProperties.defaultRedirectionUri,
				enabled_locales: event.ResourceProperties.enabledLocales,
				session_cookie: event.ResourceProperties.sessionCookie,
			});

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		case "Delete": {
			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
