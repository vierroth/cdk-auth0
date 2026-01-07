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
			const id = (
				await auth0.clientGrants.create({
					client_id: event.ResourceProperties.clinetId,
					audience:
						event.ResourceProperties.audience ||
						`https://${auth0Api.domain}/api/v2/`,
					scope: event.ResourceProperties.scope,
				})
			).id;

			return {
				PhysicalResourceId: id,
				Data: {
					clinetGrantId: id,
				},
			};
		}
		case "Update": {
			if (
				event.OldResourceProperties.clinetId !==
				event.ResourceProperties.clinetId
			) {
				throw new Error("Can't modify client grant clinetId");
			}

			if (
				event.OldResourceProperties.audience !==
				event.ResourceProperties.audience
			) {
				throw new Error("Can't modify client grant audience");
			}

			await auth0.clientGrants.update(event.PhysicalResourceId, {
				scope: event.ResourceProperties.scope,
			});

			return {
				PhysicalResourceId: event.PhysicalResourceId,
				Data: {
					clinetGrantId: event.PhysicalResourceId,
				},
			};
		}
		case "Delete": {
			await auth0.clientGrants.delete(event.PhysicalResourceId);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
