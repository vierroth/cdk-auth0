import { ISecret } from "aws-cdk-lib/aws-secretsmanager";

export interface Auth0Props {
  /**
   * This secret is required to allow the construct to create and manage the resource on your behalf.
   * The secret shoult contain the credentails to an [Auth0](https://auth0.com) `Machine to Machine
   * Application` with access to all permissions of the `Auth0 Management API`. The secret should
   * contatin the following:
   *
   * ```json
   * {
   *   "domain": "...",
   *   "clientId": "...",
   *   "clientSecret": "..."
   * }
   * ```
   */
  readonly apiSecret: ISecret;
}
