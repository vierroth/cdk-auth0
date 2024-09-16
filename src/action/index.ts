import { Construct } from "constructs";
import { CustomResource, Names } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ActionTriggerProps {
  readonly id:
    | "post-login"
    | "credentials-exchange"
    | "pre-user-registration"
    | "post-user-registration"
    | "post-change-password"
    | "send-phone-message"
    | "iga-approval"
    | "iga-certification"
    | "iga-fulfillment-assignment"
    | "iga-fulfillment-execution"
    | "password-reset-post-challenge";
  readonly version: "v1" | "v2" | "v3";
}

export interface ActionDependencyProps {
  /**
   * The name of the npm module (e.g. lodash).
   */
  readonly name: string;
  /**
   *  The npm module version (e.g. 4.17.1).
   */
  readonly version: string;
  /**
   * An optional value used primarily for private npm registries.
   */
  readonly registryUrl?: string;
}

export interface ActionSecretProps {
  /**
   * The name of the particular secret (e.g. `API_KEY`).
   */
  readonly name: string;
  /**
   * The value of the particular secret (e.g. `secret123`).
   * A secret's value can only be set upon creation.
   * A secret's value will never be returned by the API.
   */
  readonly value: string;
}

export interface ActionProps extends Auth0Props {
  /**
   * The name of an action.
   * @defaultValue generated name
   */
  readonly name?: string;
  /**
   * The list of triggers that this action supports.
   * At this time, an action can only target a single trigger at a time.
   */
  readonly supportedTriggers: Array<ActionTriggerProps>;
  /**
   * The source code of the action.
   */
  readonly code: string;
  /**
   * The list of third party npm modules, and their versions,
   * that this action depends on.
   */
  readonly dependencies?: Array<ActionDependencyProps>;
  /**
   * The Node runtime
   * @defaultValue `"node18-actions"`
   */
  readonly runtime?: "node12" | "node16" | "node18" | "node18-actions";
  /**
   * The list of secrets that are included in an action or a version of an action
   */
  readonly secrets?: Array<ActionSecretProps>;
}

/**
 * @category Constructs
 */
export class Action extends CustomResource {
  public readonly supportedTriggers;
  public readonly actionId = this.getAttString("actionId");

  constructor(scope: Construct, id: string, props: ActionProps) {
    super(scope, id, {
      resourceType: "Custom::Auth0Action",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        name:
          props.name ||
          `${Names.uniqueResourceName(scope, {
            maxLength: 127 - id.length,
            allowedSpecialCharacters: "-",
            separator: "-",
          })}-${id}`,
        code: props.code,
        dependencies: props.dependencies,
        supportedTriggers: props.supportedTriggers,
        runtime: props.runtime || "node18-actions",
        secrets: props.secrets,
      },
    });

    this.supportedTriggers = props.supportedTriggers;
  }
}
