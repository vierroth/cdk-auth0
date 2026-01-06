import { ENV } from "../lambda-base";
import { CdkCustomResourceEvent } from "aws-lambda";
import { getSecretValue } from "../get-secret-value";
import { ManagementClient } from "auth0";

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
			const role = (
				event.ResourceProperties.roleId
					? await auth0.roles.update(
							event.ResourceProperties.roleId,
							{
								name: event.ResourceProperties.name,
								description: event.ResourceProperties.description,
							},
					  )
					: await auth0.roles.create({
							name: event.ResourceProperties.name,
							description: event.ResourceProperties.description,
					  })
			);

			return {
				PhysicalResourceId: role.id,
				Data: {
					roleId: role.id,
				},
			};
		}
		case "Update": {
			const role = (
				await auth0.roles.update(
					event.PhysicalResourceId,
					{
						name: event.ResourceProperties.name,
						description: event.ResourceProperties.description,
					},
				)
			);

			return {
				PhysicalResourceId: role.id,
				Data: {
					roleId: role.id,
					roleName: role.name,
				},
			};
		}
		case "Delete": {
			await auth0.roles.delete(event.PhysicalResourceId);

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
