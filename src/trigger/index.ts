import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";
import { Action } from "./../action";

export interface TriggerProps extends Auth0Props {
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
	readonly actions: Array<Action>;
}

/**
 * @category Constructs
 */
export class Trigger extends CustomResource {
	constructor(scope: Construct, id: string, props: TriggerProps) {
		props.actions.forEach((action) => {
			if (
				!action.supportedTriggers.some((trigger) => trigger.id === props.id)
			) {
				throw new Error(
					`${action.actionId} does not support ${props.id} trigger.`,
				);
			}
		});

		super(scope, id, {
			resourceType: "Custom::Trigger",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				id: props.id,
				actions: props.actions.map((action) => action.actionId),
			},
		});
	}
}
