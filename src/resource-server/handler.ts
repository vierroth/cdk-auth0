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
			const resourceServers = await auth0.resourceServers.create({
				name: event.ResourceProperties.name,
				identifier: event.ResourceProperties.identifier,
				scopes: event.ResourceProperties.scopes,
				signing_alg: event.ResourceProperties.signingAlg,
				signing_secret: event.ResourceProperties.signingSecret,
				allow_offline_access:
					event.ResourceProperties.allowOfflineAccess === "true",
				token_lifetime: parseInt(event.ResourceProperties.tokenLifetime),
				token_dialect: event.ResourceProperties.tokenDialect,
				skip_consent_for_verifiable_first_party_clients:
					event.ResourceProperties.skipConsentForVerifiableFirstPartyClients ===
					"true",
				enforce_policies: event.ResourceProperties.enforcePolicies === "true",
			});

			return {
				PhysicalResourceId: resourceServers.id,
				Data: {
					resourceServerId: resourceServers.id,
					resourceServerIdentifier: resourceServers.identifier,
				},
			};
		}
		case "Update": {
			const resourceServers = await auth0.resourceServers.update(
				event.PhysicalResourceId,
				{
					name: event.ResourceProperties.name || event.LogicalResourceId,
					scopes: event.ResourceProperties.scopes,
					signing_alg: event.ResourceProperties.signingAlg,
					signing_secret: event.ResourceProperties.signingSecret,
					allow_offline_access:
						event.ResourceProperties.allowOfflineAccess === "true",
					token_lifetime: parseInt(event.ResourceProperties.tokenLifetime),
					token_dialect: event.ResourceProperties.tokenDialect,
					skip_consent_for_verifiable_first_party_clients:
						event.ResourceProperties
							.skipConsentForVerifiableFirstPartyClients === "true",
					enforce_policies: event.ResourceProperties.enforcePolicies === "true",
				},
			);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
				Data: {
					resourceServerId: event.PhysicalResourceId,
					resourceServerIdentifier: resourceServers.identifier,
				},
			};
		}
		case "Delete": {
			await auth0.resourceServers.delete(event.PhysicalResourceId);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
