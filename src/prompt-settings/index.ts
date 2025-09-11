import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface PromptSettingsProps extends Auth0Props {
	readonly universalLoginExperience?: "new" | "classic";
	readonly identifierFirst?: boolean;
	readonly webauthnPlatformFirstFactor?: boolean;
}

/**
 * @category Constructs
 */
export class PromptSettings extends CustomResource {
	constructor(scope: Construct, id: string, props: PromptSettingsProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Action",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				universalLoginExperience: props.universalLoginExperience || "new",
				identifierFirst: props.identifierFirst || false,
				webauthnPlatformFirstFactor: props.webauthnPlatformFirstFactor || false,
			},
		});
	}
}
