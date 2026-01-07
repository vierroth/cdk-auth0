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
				await auth0.actions.create({
					name: event.ResourceProperties.name,
					code: event.ResourceProperties.code,
					dependencies: event.ResourceProperties.dependencies,
					supported_triggers: event.ResourceProperties.supportedTriggers,
					runtime: event.ResourceProperties.runtime,
					secrets: event.ResourceProperties.secrets,
				})
			).id;

			if (!id) {
				throw new Error("Create action did not return ID");
			}

			while ((await auth0.actions.get(id)).status !== "built") {
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}

			await auth0.actions.deploy(id);

			return {
				PhysicalResourceId: id,
				Data: {
					actionId: id,
				},
			};
		}
		case "Update": {
			await auth0.actions.update(event.PhysicalResourceId, {
				name: event.ResourceProperties.name,
				code: event.ResourceProperties.code,
				dependencies: event.ResourceProperties.dependencies,
				supported_triggers: event.ResourceProperties.supportedTriggers,
				runtime: event.ResourceProperties.runtime,
				secrets: event.ResourceProperties.secrets,
			});

			while (
				(await auth0.actions.get(event.PhysicalResourceId)).status !== "built"
			) {
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}

			await auth0.actions.deploy(event.PhysicalResourceId);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
				Data: {
					actionId: event.PhysicalResourceId,
				},
			};
		}
		case "Delete": {
			await auth0.actions.delete(event.PhysicalResourceId, { force: true });

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
