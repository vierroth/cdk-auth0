import type { EventBridgeEvent } from "aws-lambda";
import {
	EventBridgeClient,
	UpdateConnectionCommand,
} from "@aws-sdk/client-eventbridge";
import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import type { ENV } from "./../lambda-base";

declare global {
	namespace NodeJS {
		interface ProcessEnv extends ENV {
			CONNECTION_NAME: string;
			AUTH0_SECRET_ID: string;
			AUTH0_CLIENT_ID: string;
			AUTH0_AUTHORIZATION_ENDPOINT: string;
			AUTH0_AUDIENCE: string;
		}
	}
}

const eventBridge = new EventBridgeClient({});
const secretsManager = new SecretsManagerClient({});

export async function handler(event: EventBridgeEvent<string, unknown>) {
	console.log("event received", {
		source: event.source,
		detailType: event["detail-type"],
		id: event.id,
	});

	const secret = await secretsManager.send(
		new GetSecretValueCommand({ SecretId: process.env.AUTH0_SECRET_ID }),
	);

	if (!secret.SecretString) {
		throw new Error(
			"Secret has no SecretString (binary secrets not supported)",
		);
	}

	const command = new UpdateConnectionCommand({
		Name: process.env.CONNECTION_NAME,
		AuthorizationType: "OAUTH_CLIENT_CREDENTIALS",
		AuthParameters: {
			OAuthParameters: {
				AuthorizationEndpoint: process.env.AUTH0_AUTHORIZATION_ENDPOINT,
				HttpMethod: "POST",
				ClientParameters: {
					ClientID: process.env.AUTH0_CLIENT_ID,
					ClientSecret: secret.SecretString.trim(),
				},
				OAuthHttpParameters: {
					BodyParameters: [
						{
							Key: "audience",
							Value: process.env.AUTH0_AUDIENCE,
							IsValueSecret: false,
						},
						{
							Key: "grant_type",
							Value: "client_credentials",
							IsValueSecret: false,
						},
					],
				},
			},
		},
	});

	let lastError: unknown;
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			await eventBridge.send(command);
			console.log("Connection updated", {
				connectionName: process.env.CONNECTION_NAME,
				secretId: process.env.AUTH0_SECRET_ID,
			});
			return;
		} catch (error) {
			lastError = error;
			console.error("Error updating connection", {
				connectionName: process.env.CONNECTION_NAME,
				attempt: attempt + 1,
				error,
			});

			if (attempt < 2) {
				await new Promise((resolve) => setTimeout(resolve, 20_000));
			}
		}
	}

	throw lastError;
}
