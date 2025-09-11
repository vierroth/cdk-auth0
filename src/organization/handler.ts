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
			const organization = (
				await auth0.organizations.create({
					name: event.ResourceProperties.name,
					display_name: event.ResourceProperties.displayName,
					branding: event.ResourceProperties.branding
						? {
								logo_url: event.ResourceProperties.branding.logoUrl,
								colors: {
									primary: event.ResourceProperties.branding.colors.primary,
									page_background:
										event.ResourceProperties.branding.colors.pageBackground,
								},
						  }
						: undefined,
					metadata: event.ResourceProperties.metadata,
					enabled_connections: event.ResourceProperties.enabledConnections
						? [
								{
									connection_id:
										event.ResourceProperties.enabledConnections.connectionId,
									assign_membership_on_login:
										event.ResourceProperties.enabledConnections
											.assignMembershipOnLogin === "true",
									show_as_button:
										event.ResourceProperties.enabledConnections.showAsButton ===
										"true",
								},
						  ]
						: [],
				})
			).data;

			return {
				PhysicalResourceId: organization.id,
				Data: {
					organizationId: organization.id,
				},
			};
		}
		case "Update": {
			if (
				JSON.stringify(event.ResourceProperties.enabledConnections) !==
				JSON.stringify(event.OldResourceProperties.enabledConnections)
			) {
				throw Error("Can't change enabled connections");
			}

			const organization = (
				await auth0.organizations.update(
					{ id: event.PhysicalResourceId },
					{
						name: event.ResourceProperties.name,
						display_name: event.ResourceProperties.displayName,
						branding: event.ResourceProperties.branding
							? {
									logo_url: event.ResourceProperties.branding.logoUrl,
									colors: {
										primary: event.ResourceProperties.branding.colors.primary,
										page_background:
											event.ResourceProperties.branding.colors.pageBackground,
									},
							  }
							: undefined,
						metadata: event.ResourceProperties.metadata || [],
					},
				)
			).data;

			return {
				PhysicalResourceId: organization.id,
				Data: {
					organizationId: organization.id,
				},
			};
		}
		case "Delete": {
			await auth0.organizations.delete({ id: event.PhysicalResourceId });

			return {
				PhysicalResourceId: event.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
