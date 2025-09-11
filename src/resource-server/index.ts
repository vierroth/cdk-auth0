import { Construct } from "constructs";
import { CustomResource, Duration, Names } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ScopeProps {
	readonly value: string;
	readonly description: string;
}

export interface ResourceServerProps extends Auth0Props {
	readonly identifier?: string;
	readonly name?: string;
	readonly scopes?: Array<ScopeProps>;
	readonly signingAlg?: "HS256" | "RS256" | "PS256";
	readonly signingSecret?: string;
	readonly allowOfflineAccess?: boolean;
	readonly tokenLifetime?: Duration;
	readonly tokenDialect?: "access_token" | "access_token_authz";
	readonly skipConsentForVerifiableFirstPartyClients?: boolean;
	readonly enforcePolicies?: boolean;
}

/**
 * @category Constructs
 */
export class ResourceServer extends CustomResource {
	public readonly resourceServerId = this.getAttString("resourceServerId");
	public readonly resourceServerIdentifier = this.getAttString(
		"resourceServerIdentifier",
	);

	constructor(scope: Construct, id: string, props: ResourceServerProps) {
		super(scope, id, {
			resourceType: "Custom::ResourceServer",
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
				identifier:
					props.identifier ||
					`${Names.uniqueResourceName(scope, {
						maxLength: 127 - id.length,
						allowedSpecialCharacters: "-",
						separator: "-",
					})}-${id}`,
				scopes: props.scopes || [],
				signingAlg: props.signingAlg || "RS256",
				signingSecret: props.signingSecret,
				allowOfflineAccess: props.allowOfflineAccess || false,
				tokenLifetime: props.tokenLifetime?.toSeconds() || 86400,
				tokenDialect: props.tokenDialect || "access_token",
				skipConsentForVerifiableFirstPartyClients:
					props.skipConsentForVerifiableFirstPartyClients || false,
				enforcePolicies: props.enforcePolicies || false,
			},
		});
	}
}
