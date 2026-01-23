import {
	Authorization,
	Connection,
	HttpMethod,
	HttpParameter,
	Rule,
} from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Duration } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

import { Client } from "..";
import { join } from "path";
import { Architecture } from "aws-cdk-lib/aws-lambda";

export interface EventConnectionProps {
	readonly client: Client;
}

export class EventConnection extends Connection {
	constructor(scope: Construct, id: string, props: EventConnectionProps) {
		if (props.client.tokenEndpointAuthMethod !== "client_secret_basic") {
			throw new Error(
				"Event connection can only be created for clients with `tokenEndpointAuthMethod` set to `client_secret_basic`",
			);
		}

		if (!props.client.grantTypes?.includes("client_credentials")) {
			throw new Error(
				"Event connection can only be created for clients where `grantTypes` includes `client_credentials`",
			);
		}

		const authorizationEndpoint = `https://${props.client.clientDomain}/oauth/token`;
		const audience = `https://${props.client.clientDomain}/api/v2/`;

		super(scope, id, {
			authorization: Authorization.oauth({
				authorizationEndpoint: authorizationEndpoint,
				httpMethod: HttpMethod.POST,
				clientId: props.client.clientId,
				clientSecret: props.client.clientSecret.secretValue,
				bodyParameters: {
					audience: HttpParameter.fromString(audience),
					grant_type: HttpParameter.fromString("client_credentials"),
				},
			}),
		});

		const updater = new GoFunction(this, "ConnectionSecretUpdater", {
			entry: join(__dirname, "./handler").replace("/dist/", "/src/"),
			architecture: Architecture.ARM_64,
			timeout: Duration.minutes(1),
			memorySize: 128,
			bundling: {
				forcedDockerBundling: true,
				goBuildFlags: ["-trimpath", `-ldflags="-s -w"`],
			},
			environment: {
				CONNECTION_NAME: this.connectionName,
				AUTH0_SECRET_ID: props.client.clientSecret.secretArn,
				AUTH0_CLIENT_ID: props.client.clientId,
				AUTH0_AUTHORIZATION_ENDPOINT: authorizationEndpoint,
				AUTH0_AUDIENCE: audience,
			},
		});

		props.client.clientSecret.grantRead(updater);
		updater.addToRolePolicy(
			new PolicyStatement({
				actions: ["events:UpdateConnection"],
				resources: [this.connectionArn],
			}),
		);

		const onSecretChange = new Rule(this, "OnClientSecretChange", {
			eventPattern: {
				source: ["aws.secretsmanager"],
				detailType: [
					"AWS API Call via CloudTrail",
					"AWS Service Event via CloudTrail",
				],
				resources: [props.client.clientSecret.secretArn],
				detail: {
					eventSource: ["secretsmanager.amazonaws.com"],
					eventName: ["PutSecretValue", "UpdateSecret", "RotationSucceeded"],
				},
			},
		});

		onSecretChange.addTarget(new LambdaFunction(updater));
	}
}
