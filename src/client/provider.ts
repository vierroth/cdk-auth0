import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Provider as AwsProvider } from "aws-cdk-lib/custom-resources";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { IConnection } from "aws-cdk-lib/aws-events";
import { join } from "path";

import { LambdaBase, LambdaRole } from "../lambda-base";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

export interface getOrCreateProps {
  readonly apiSecret: ISecret;
  readonly clientSecret: ISecret;
  readonly clientConnection?: IConnection;
}

export class Provider extends AwsProvider {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      onEventHandler: new LambdaBase(scope, `${id}OnEventHandler`, {
        entry: join(__dirname, "./../../src/client/handler.ts"),
      }),
      role: new LambdaRole(scope, `${id}Role`),
    });
  }

  static getOrCreate(scope: Construct, props: getOrCreateProps) {
    const stack = Stack.of(scope);
    const id = "Auth0ClientProvider";
    const provider =
      (stack.node.tryFindChild(id) as Provider) || new Provider(stack, id);

    props.apiSecret.grantRead(provider.onEventHandler);
    props.clientSecret.grantWrite(provider.onEventHandler);

    if (props.clientConnection) {
      provider.onEventHandler.role!.attachInlinePolicy(
        new Policy(provider, "EventBridgeConnection", {
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["events:DescribeConnection", "events:UpdateConnection"],
              resources: [props.clientConnection.connectionArn],
            }),
          ],
        }),
      );
    }

    return provider.serviceToken;
  }
}
