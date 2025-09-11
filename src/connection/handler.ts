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
			const connection = (
				event.ResourceProperties.connectionId
					? await auth0.connections.update(
							{ id: event.ResourceProperties.connectionId },
							{
								display_name: event.ResourceProperties.displayName,
								enabled_clients: event.ResourceProperties.enabledClients,
								is_domain_connection:
									event.ResourceProperties.isDomainConnection === "true",
								options: {
									disable_signup:
										event.ResourceProperties.disableSignup === "true",
								},
							},
					  )
					: await auth0.connections.create({
							name: event.ResourceProperties.name,
							display_name: event.ResourceProperties.displayName,
							strategy: event.ResourceProperties.strategy,
							enabled_clients: event.ResourceProperties.enabledClients,
							is_domain_connection:
								event.ResourceProperties.isDomainConnection === "true",
							options: {
								disable_signup:
									event.ResourceProperties.disableSignup === "true",
							},
					  })
			).data;

			return {
				PhysicalResourceId: connection.id,
				Data: {
					connectionId: connection.id,
					connectionName: connection.name,
				},
			};
		}
		case "Update": {
			if (event.ResourceProperties.name !== event.OldResourceProperties.name) {
				throw Error("Can't change connection name");
			}

			if (
				event.ResourceProperties.strategy !==
				event.OldResourceProperties.strategy
			) {
				throw Error("Can't change connection strategy");
			}

			const connection = (
				await auth0.connections.update(
					{ id: event.PhysicalResourceId },
					{
						display_name: event.ResourceProperties.displayName,
						enabled_clients: event.ResourceProperties.enabledClients,
						is_domain_connection:
							event.ResourceProperties.isDomainConnection === "true",
						options: {
							disable_signup: event.ResourceProperties.disableSignup === "true",
						},
					},
				)
			).data;

			return {
				PhysicalResourceId: event.PhysicalResourceId,
				Data: {
					connectionId: event.PhysicalResourceId,
					connectionName: connection.name,
				},
			};
		}
		case "Delete": {
			if (event.ResourceProperties.deletionProtection !== "true") {
				await auth0.connections.delete({
					id: event.PhysicalResourceId,
				});
			}

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
