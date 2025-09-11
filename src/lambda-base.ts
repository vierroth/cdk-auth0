import { Construct } from "constructs";
import { Duration, Stack } from "aws-cdk-lib";
import {
	Runtime,
	ParamsAndSecretsLayerVersion,
	ParamsAndSecretsVersions,
	Architecture,
} from "aws-cdk-lib/aws-lambda";
import {
	NodejsFunction,
	NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

import type { ENV_DEFAULT } from "./environment";

export interface ENV extends ENV_DEFAULT {
	PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: string;
}

export class LambdaBase extends NodejsFunction {
	constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
		super(scope, id, {
			runtime: Runtime.NODEJS_22_X,
			architecture: Architecture.ARM_64,
			timeout: Duration.minutes(2),
			logRetention: RetentionDays.ONE_WEEK,
			paramsAndSecrets: ParamsAndSecretsLayerVersion.fromVersion(
				ParamsAndSecretsVersions.V1_0_103,
			),
			bundling: {
				minify: true,
				sourcesContent: false,
				externalModules: ["@aws-sdk"],
			},
			role: new LambdaRole(scope, `${id}Role`),
			...props,
		});
	}
}

export class LambdaRole extends Role {
	constructor(scope: Construct, id: string) {
		super(scope, id, {
			assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
			inlinePolicies: {
				logging: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: [
								"logs:CreateLogGroup",
								"logs:CreateLogStream",
								"logs:PutLogEvents",
							],
							resources: [
								`arn:aws:logs:${Stack.of(scope).region}:${
									Stack.of(scope).account
								}:log-group:/aws/lambda/*`,
							],
						}),
					],
				}),
			},
		});
	}
}
