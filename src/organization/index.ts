import { Auth0Props } from "../auth0-props";
import { CustomResource, Names } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Provider } from "./provider";

export interface OrganizationColorProps {
	/**
	 * HEX Color for primary elements
	 */
	readonly primary?: string;
	/**
	 * HEX Color for background
	 */
	readonly pageBackground?: string;
}
export interface OrganizationBrandingProps {
	/**
	 * URL of logo to display on login page
	 */
	readonly logoUrl?: string;
	/**
	 * Color scheme used to customize the login pages
	 */
	readonly colors?: OrganizationColorProps;
}

export interface EnabledConnectionProps {
	/**
	 * ID of the connection.
	 */
	readonly connectionId?: string;
	/**
	 * When true, all users that log in with this connection will be automatically granted membership in the organization. When false, users must be granted membership in the organization before logging in with this connection.
	 */
	readonly assignMembershipOnLogin?: Boolean;
	/**
	 * Determines whether a connection should be displayed on this organization’s login prompt. Only applicable for enterprise connections. Default: true.
	 */
	readonly showAsButton?: Boolean;
}

export interface OrganizationProps extends Auth0Props {
	/**
	 * The name of this organization.
	 */
	readonly name?: string;
	/**
	 * Friendly name of this organization.
	 */
	readonly displayName?: string;
	/**
	 * Theme defines how to style the login pages
	 */
	readonly branding?: OrganizationBrandingProps;
	/**
	 * Metadata associated with the organization, in the form of an object with string values (max 255 chars). Maximum of 10 metadata properties allowed.
	 */
	readonly metadata?: { [key: string]: string };
	/**
	 * Connections that will be enabled for this organization. See POST enabled_connections endpoint for the object format. (Max of 10 connections allowed)
	 */
	readonly enabledConnections?: EnabledConnectionProps;
}

/**
 * @category Constructs
 */
export class Organization extends CustomResource {
	public readonly organizationId = this.getAttString("organizationId");
	constructor(scope: Construct, id: string, props: OrganizationProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Client",
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
				displayName: props.displayName,
				branding: props.branding
					? {
							logoUrl: props.branding?.logoUrl,
							colors: {
								primary: props.branding?.colors?.primary,
								pageBackground: props.branding?.colors?.pageBackground,
							},
					  }
					: undefined,
				metadata: props.metadata,
				enabledConnections: props.enabledConnections || [],
			},
		});
	}
}
