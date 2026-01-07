import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import {
	Action,
	Client,
	ClientGrant,
	ResourceServer,
	Trigger,
} from "@flit/cdk-auth0";

export interface TestStackProps extends StackProps {}

export class TestStack extends Stack {
	constructor(scope: Construct, id: string, props: TestStackProps) {
		super(scope, id, props);

		const auth0Secret = Secret.fromSecretNameV2(
			this,
			"Secret",
			"YourSecretName",
		);

		const resourceServer = new ResourceServer(this, "ResourceServer", {
			apiSecret: auth0Secret,
			enforcePolicies: true,
			allowOfflineAccess: true,
		});

		const webClient = new Client(this, "WebClient", {
			apiSecret: auth0Secret,
			appType: "regular_web",
			isFirstParty: true,
			tokenEndpointAuthMethod: "client_secret_basic",
			initiateLoginUri: "https://test.com/auth",
			callbacks: ["https://test.com/auth/callback"],
			allowedLogoutUrls: ["https://test.com"],
			oidcConformant: true,
			refreshToken: {
				rotationType: "rotating",
				expirationType: "expiring",
				tokenLifetime: Duration.days(7),
				idleTokenLifetime: Duration.days(1),
			},
			grantTypes: ["implicit", "authorization_code", "refresh_token"],
		});

		new ClientGrant(this, "ClientGrant", {
			apiSecret: auth0Secret,
			client: webClient,
			audience: resourceServer,
			scope: [],
		});

		new Trigger(this, "Auth0PostLoginTrigger", {
			apiSecret: auth0Secret,
			id: "post-login",
			actions: [
				new Action(this, "Auth0AugmentClaimAction", {
					apiSecret: auth0Secret,
					supportedTriggers: [{ id: "post-login", version: "v3" }],
					code: `
            exports.onExecutePostLogin = async (event, api) => {
              api.idToken.setCustomClaim("example", "test123");
              api.accessToken.setCustomClaim("example", "test123");
            }
          `,
				}),
			],
		});
	}
}
