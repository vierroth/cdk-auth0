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
			const customDomain = (
				await auth0.customDomains.create({
					domain: event.ResourceProperties.domain,
					type: event.ResourceProperties.domainType,
					verification_method: event.ResourceProperties.verificationMethod,
					tls_policy: event.ResourceProperties.tlsPolicy,
					custom_client_ip_header:
						event.ResourceProperties.customClientIpHeader,
				})
			);

			return {
				PhysicalResourceId: customDomain.custom_domain_id,
				Data: {
					customDomainId: customDomain.custom_domain_id,
					customDomainDomain: customDomain.domain,
					customDomainRecordValue: customDomain.verification.methods![0].record,
				},
			};
		}
		case "Update": {
			const customDomain = (
				await auth0.customDomains.update(
					event.PhysicalResourceId,
					{
						tls_policy: event.ResourceProperties.tlsPolicy,
						custom_client_ip_header:
							event.ResourceProperties.customClientIpHeader,
					},
				)
			);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
				Data: {
					customDomainId: event.PhysicalResourceId,
					customDomainDomain: customDomain.domain,
					customDomainRecordValue: customDomain.verification.methods![0].record,
				},
			};
		}
		case "Delete": {
			await auth0.customDomains.delete(event.PhysicalResourceId);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
