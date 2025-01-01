import { Construct } from "constructs";
import { CustomResource, Names } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";
import { Client } from "./../client";

interface ConnectionBaseProps extends Auth0Props {
  readonly connectionId?: string;
  readonly displayName?: string;
  readonly name?: string;
  readonly deletionProtection?: boolean;
  /**
   * The identity provider identifier for the connection
   * @defaultValue `"auth0"`
   */
  readonly strategy?:
    | "ad"
    | "adfs"
    | "amazon"
    | "apple"
    | "dropbox"
    | "bitbucket"
    | "aol"
    | "auth0-oidc"
    | "auth0"
    | "baidu"
    | "bitly"
    | "box"
    | "custom"
    | "daccount"
    | "dwolla"
    | "email"
    | "evernote-sandbox"
    | "evernote"
    | "exact"
    | "facebook"
    | "fitbit"
    | "flickr"
    | "github"
    | "google-apps"
    | "google-oauth2"
    | "instagram"
    | "ip"
    | "line"
    | "linkedin"
    | "miicard"
    | "oauth1"
    | "oauth2"
    | "office365"
    | "oidc"
    | "okta"
    | "paypal"
    | "paypal-sandbox"
    | "pingfederate"
    | "planningcenter"
    | "renren"
    | "salesforce-community"
    | "salesforce-sandbox"
    | "salesforce"
    | "samlp"
    | "sharepoint"
    | "shopify"
    | "sms"
    | "soundcloud"
    | "thecity-sandbox"
    | "thecity"
    | "thirtysevensignals"
    | "twitter"
    | "untappd"
    | "vkontakte"
    | "waad"
    | "weibo"
    | "windowslive"
    | "wordpress"
    | "yahoo"
    | "yammer"
    | "yandex";
  /**
   * The identifiers of the clients for which the connection is to be enabled.
   * If the array is empty or the property is not specified, no clients are enabled
   * @defaultValue `[]`
   */
  readonly enabledClients?: Array<Client>;
  /**
   * @defaultValue `false`
   */
  readonly isDomainConnection?: boolean;
  readonly disableSignup?: boolean;
}

class ConnectionBase extends CustomResource {
  public readonly connectionId = this.getAttString("connectionId");
  public readonly connectionName = this.getAttString("connectionName");

  constructor(scope: Construct, id: string, props: ConnectionBaseProps) {
    super(scope, id, {
      resourceType: "Custom::Auth0Connection",
      serviceToken: Provider.getOrCreate(scope, props.apiSecret),
      properties: {
        secretName: props.apiSecret.secretName,
        connectionId: props.connectionId,
        name:
          props.name ||
          `${Names.uniqueResourceName(scope, {
            maxLength: 127 - id.length,
            allowedSpecialCharacters: "-",
            separator: "-",
          })}-${id}`,
        deletionProtection: props.deletionProtection || false,
        displayName:
          props.displayName ||
          `${Names.uniqueResourceName(scope, {
            maxLength: 127 - id.length,
            allowedSpecialCharacters: "-",
            separator: "-",
          })}-${id}`,
        strategy: props.strategy || "auth0",
        enabledClients:
          props.enabledClients?.map((client) => client.clientId) || [],
        isDomainConnection: props.isDomainConnection || false,
        disableSignup: props.disableSignup || false,
      },
    });
  }
}

export interface ConnectionProps extends Auth0Props {
  /**
   * Connection name used in the new universal login experience
   */
  readonly displayName?: string;
  /**
   * The name of the connection
   */
  readonly name?: string;
  /**
   * If `true` the connection won't be deleted when the resource is deleted
   * @default false
   */
  readonly deletionProtection?: boolean;
  /**
   * The identity provider identifier for the connection
   * @default auth0
   */
  readonly strategy?:
    | "ad"
    | "adfs"
    | "amazon"
    | "apple"
    | "dropbox"
    | "bitbucket"
    | "aol"
    | "auth0-oidc"
    | "auth0"
    | "baidu"
    | "bitly"
    | "box"
    | "custom"
    | "daccount"
    | "dwolla"
    | "email"
    | "evernote-sandbox"
    | "evernote"
    | "exact"
    | "facebook"
    | "fitbit"
    | "flickr"
    | "github"
    | "google-apps"
    | "google-oauth2"
    | "instagram"
    | "ip"
    | "line"
    | "linkedin"
    | "miicard"
    | "oauth1"
    | "oauth2"
    | "office365"
    | "oidc"
    | "okta"
    | "paypal"
    | "paypal-sandbox"
    | "pingfederate"
    | "planningcenter"
    | "renren"
    | "salesforce-community"
    | "salesforce-sandbox"
    | "salesforce"
    | "samlp"
    | "sharepoint"
    | "shopify"
    | "sms"
    | "soundcloud"
    | "thecity-sandbox"
    | "thecity"
    | "thirtysevensignals"
    | "twitter"
    | "untappd"
    | "vkontakte"
    | "waad"
    | "weibo"
    | "windowslive"
    | "wordpress"
    | "yahoo"
    | "yammer"
    | "yandex";
  /**
   * The identifiers of the clients for which the connection is to be enabled. If the array is empty or the property is not specified, no clients are enabled
   */
  readonly enabledClients?: Array<Client>;
  readonly isDomainConnection?: boolean;
  readonly disableSignup?: boolean;
}

export interface ConnectionFromIdProps extends Auth0Props {
  /**
   * Id of the role.
   */
  readonly connectionId: string;
  /**
   * Connection name used in the new universal login experience
   */
  readonly displayName?: string;
  /**
   * If `true` the connection won't be deleted when the resource is deleted
   * @default false
   */
  readonly deletionProtection?: boolean;
  /**
   * The identifiers of the clients for which the connection is to be enabled. If the array is empty or the property is not specified, no clients are enabled
   */
  readonly enabledClients?: Array<Client>;
  readonly isDomainConnection?: boolean;
  readonly disableSignup?: boolean;
}

/**
 * @category Constructs
 */
export class Connection extends ConnectionBase {
  constructor(scope: Construct, id: string, props: ConnectionProps) {
    super(scope, id, { ...props });
  }

  /**
   * @experimental
   */
  static fromConnectionId(
    scope: Construct,
    id: string,
    props: ConnectionFromIdProps,
  ) {
    return new ConnectionBase(scope, id, props) as Connection;
  }
}
