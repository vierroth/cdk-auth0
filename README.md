This collection of [CDK](https://docs.aws.amazon.com/cdk/api/v2/) constructs allows you to manage your [Auth0](https://auth0.com) resources programmatically, enabling tighter integration with [CDK](https://docs.aws.amazon.com/cdk/api/v2/) and giving you all the benefits of infrastructure as code together with [Auth0's](https://auth0.com) large feature set.

The constructs provided by this library work in the same way any native AWS CDK constructs do, and expose all of the parameters that the [Auth0 Management API](https://auth0.com/docs/api/management/v2) exposes.

## Usage

### Installation

The package is available on [NPM](https://www.npmjs.com) and can be installed using your package manager of choice:

```bash
npm i @flit/cdk-auth0
```

```bash
pnpm add @flit/cdk-auth0
```

```bash
yarn add @flit/cdk-auth0
```

### Setup

To get started you will manually create a `Machine to Machine Application` in your [Auth0](https://auth0.com) account and authorize it to have access to all permissions of the `Auth0 Management API`. This is necessary to allow the constructs to interact with the [Auth0 API](https://auth0.com) and create and manage resources on your behalf.

Once you have the `Machine to Machine Application` created you can go into the [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) and create a new secret containing the applications credentials in the following format:

```json
{
  "domain": "...",
  "clientId": "...",
  "clientSecret": "..."
}
```

All constructs will require this secret to be passed as `apiSecret` parameter.

### Example

You can now use the [Auth0](https://auth0.com) constructs as you would any native [AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/) constructs. The example below shows how to create an [Auth0](https://auth0.com) API and Application, grant the Application access to the API and add an action to the `post-login` trigger:

```typescript
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import {
  ResourceServer,
  Client,
  ClientGrant,
  Trigger,
  Action,
} from "@flit/cdk-auth0";

export class ExampleStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
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
```
