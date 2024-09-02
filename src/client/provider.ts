import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import { Provider as AwsProvider } from "aws-cdk-lib/custom-resources";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { join } from "path";

import { LambdaBase, LambdaRole } from "../lambda-base";

export interface getOrCreateProps {
  readonly apiSecret: ISecret;
  readonly clientSecretSecret: ISecret;
}

export class Provider extends AwsProvider {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      onEventHandler: new LambdaBase(scope, `${id}OnEventHandler`, {
        entry: join(
          (() => {
            try {
              return __dirname;
            } catch (_) {
              // @ts-ignore
              return import.meta.dirname;
            }
          })(),
          "./../../src/client/handler.ts",
        ),
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
    props.clientSecretSecret.grantWrite(provider.onEventHandler);

    return provider.serviceToken;
  }
}
