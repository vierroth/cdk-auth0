import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";
import { Client } from "./../client";
import { ResourceServer } from "./../resource-server";

export interface ClientGrantProps extends Auth0Props {
	readonly client: Client;
	readonly audience?: ResourceServer;
	readonly scope: Array<string>;
}

/**
 * @category Constructs
 */
export class ClientGrant extends CustomResource {
	public readonly actionId = this.getAttString("clinetGrantId");

	constructor(scope: Construct, id: string, props: ClientGrantProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0ClientGrant",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				clinetId: props.client.clientId,
				audience: props.audience?.resourceServerIdentifier,
				scope: props.scope,
			},
		});
	}
}
