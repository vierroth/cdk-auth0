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
			await auth0.actions.triggers.bindings.updateMany(
				event.ResourceProperties.id,
				{
					bindings: event.ResourceProperties.actions.map((action: string) => {
						return { ref: { type: "action_id", value: action } };
					}),
				},
			);

			return;
		}
		case "Update": {
			await auth0.actions.triggers.bindings.updateMany(
				event.ResourceProperties.id,
				{
					bindings: event.ResourceProperties.actions.map((action: string) => {
						return { ref: { type: "action_id", value: action } };
					}),
				},
			);

			return;
		}
		case "Delete": {
			return;
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
