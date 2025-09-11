import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface BrandingSettingsColorsPageBackgroundProps extends Auth0Props {
	readonly backgroundType: string;
	readonly start: string;
	readonly end: string;
	readonly angleDeg: number;
}

export interface BrandingSettingsColorsProps extends Auth0Props {
	readonly primary?: string;
	readonly pageBackground?: BrandingSettingsColorsPageBackgroundProps;
}

export interface BrandingSettingsProps extends Auth0Props {
	readonly logoUrl?: string;
	readonly faviconUrl?: string;
	readonly colors?: BrandingSettingsColorsProps;
	readonly fontUrl?: string;
}

/**
 * @category Constructs
 */
export class BrandingSettings extends CustomResource {
	constructor(scope: Construct, id: string, props: BrandingSettingsProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Action",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				logoUrl: props.logoUrl,
				faviconUrl: props.faviconUrl,
				colors: props.colors,
				fontUrl: props.fontUrl,
			},
		});
	}
}
