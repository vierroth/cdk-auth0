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

	let credentials: any = {};
	if (event.ResourceProperties.credentials) {
		switch (event.ResourceProperties.name) {
			case "azure_cs": {
				credentials = {
					connectionString:
						event.ResourceProperties.credentials.connectionString,
				};
				break;
			}
			case "mandrill":
			case "sendgrid": {
				credentials = {
					api_key: event.ResourceProperties.credentials.apiKey,
				};
				break;
			}
			case "mailgun": {
				credentials = {
					api_key: event.ResourceProperties.credentials.apiKey,
					domain: event.ResourceProperties.credentials.domain,
					region: event.ResourceProperties.credentials.region || null,
				};
				break;
			}
			case "ms365": {
				credentials = {
					tenantId: event.ResourceProperties.credentials.tenantId,
					clientId: event.ResourceProperties.credentials.clientId,
					clientSecret: event.ResourceProperties.credentials.clientSecret,
				};
				break;
			}
			case "ses": {
				credentials = {
					accessKeyId: event.ResourceProperties.credentials.accessKeyId,
					secretAccessKey: event.ResourceProperties.credentials.secretAccessKey,
					region: event.ResourceProperties.credentials.region,
				};
				break;
			}
			case "smtp": {
				credentials = {
					smtp_host: event.ResourceProperties.credentials.smtpHost,
					smtp_port: Number(event.ResourceProperties.credentials.smtpPort),
					smtp_user: event.ResourceProperties.credentials.smtpUser,
					smtp_pass: event.ResourceProperties.credentials.smtpPassword,
				};
				break;
			}
			case "sparkpost": {
				credentials = {
					api_key: event.ResourceProperties.credentials.apiKey,
					region: event.ResourceProperties.credentials.region || null,
				};
				break;
			}
			default:
				throw new Error("Invalid email provider credentials.");
		}
	}

	switch (event.RequestType) {
		case "Create": {
			if (((await auth0.emails.get()).data.name?.trim()?.length || 0) > 0) {
				await auth0.emails.update({
					name: event.ResourceProperties.name,
					enabled: true,
					default_from_address: event.ResourceProperties.defaultFromAddress,
					credentials: credentials,
				});
			} else {
				await auth0.emails.configure({
					name: event.ResourceProperties.name,
					enabled: true,
					default_from_address: event.ResourceProperties.defaultFromAddress,
					credentials: credentials,
				});
			}

			return;
		}
		case "Update": {
			await auth0.emails.update({
				name: event.ResourceProperties.name,
				enabled: true,
				default_from_address: event.ResourceProperties.defaultFromAddress,
				credentials: credentials,
			});

			return;
		}
		case "Delete": {
			await auth0.emails.update({
				enabled: false,
			});

			return;
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
