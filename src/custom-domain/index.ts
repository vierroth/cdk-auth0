import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface CustomDomainProps extends Auth0Props {
	/**
	 * Domain name.
	 */
	readonly domain: string;
	/**
	 * Custom domain provisioning type.
	 * @default `"auth0_managed_certs"`
	 */
	readonly domainType?: "auth0_managed_certs" | "self_managed_certs";
	/**
	 * Custom domain verification method.
	 * @default `"txt"`
	 */
	readonly verificationMethod?: "txt";
	/**
	 * Custom domain TLS policy.
	 * @default `"recommended"`
	 */
	readonly tlsPolicy?: "recommended";
	/**
	 * The HTTP header to fetch the client's IP address
	 */
	readonly customClientIpHeader?:
		| "true-client-ip"
		| "cf-connecting-ip"
		| "x-forwarded-for"
		| "x-azure-clientip";
}

/**
 * @category Constructs
 */
export class CustomDomain extends CustomResource {
	public readonly customDomainId = this.getAttString("customDomainId");
	public readonly customDomainDomain = this.getAttString("customDomainDomain");
	public readonly customDomainRecordValue = this.getAttString(
		"customDomainRecordValue",
	);

	constructor(scope: Construct, id: string, props: CustomDomainProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0CustomDomain",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				domain: props.domain,
				domainType: props.domainType || "auth0_managed_certs",
				verificationMethod: props.verificationMethod || "txt",
				tlsPolicy: props.tlsPolicy || "recommended",
				customClientIpHeader: props.customClientIpHeader,
			},
		});
	}
}
