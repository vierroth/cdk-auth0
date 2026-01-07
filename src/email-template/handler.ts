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

	console.log(`Event: ${JSON.stringify(event)}`);

	switch (event.RequestType) {
		case "Create": {
			const body = {
				template: event.ResourceProperties.template,
				body: event.ResourceProperties.body,
				from: event.ResourceProperties.from,
				resultUrl: event.ResourceProperties.resultUrl,
				subject: event.ResourceProperties.subject,
				syntax: event.ResourceProperties.syntax,
				urlLifetimeInSeconds: Number(
					event.ResourceProperties.urlLifetimeInSeconds,
				),
				includeEmailInRedirect:
					event.ResourceProperties.includeEmailInRedirect === "true",
				enabled: event.ResourceProperties.enabled === "true",
			};

			try {
				await auth0.emailTemplates.create(body);
			} catch (error: any) {
				if (error.statusCode === 409) {
					console.info(
						`${event.ResourceProperties.template} already created, updating email template.`,
					);
					await auth0.emailTemplates.update(
						event.ResourceProperties.template,
						body,
					);
				} else {
					console.error(JSON.stringify(error));
					throw error;
				}
			}

			return {
				PhysicalResource: event.ResourceProperties.template,
			};
		}
		case "Update": {
			await auth0.emailTemplates.update(
				event.ResourceProperties.template,
				{
					template: event.ResourceProperties.template,
					body: event.ResourceProperties.body,
					from: event.ResourceProperties.from,
					resultUrl: event.ResourceProperties.resultUrl,
					subject: event.ResourceProperties.subject,
					syntax: event.ResourceProperties.syntax,
					urlLifetimeInSeconds: Number(
						event.ResourceProperties.urlLifetimeInSeconds,
					),
					includeEmailInRedirect:
						event.ResourceProperties.includeEmailInRedirect === "true",
					enabled: event.ResourceProperties.enabled === "true",
				},
			);

			return {
				PhysicalResource: event.ResourceProperties.template,
			};
		}
		case "Delete": {
			return {
				PhysicalResource: event.ResourceProperties.PhysicalResourceId,
			};
		}
		default: {
			throw new Error("Invalid request type");
		}
	}
}
