import { Construct } from "constructs";
import { CustomResource, Duration, Names } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface ScopeProps {
	readonly value: string;
	readonly description: string;
}

export interface TokenEncryptionKeyProps {
	readonly name?: string;
	readonly alg: "RSA-OAEP-256" | "RSA-OAEP-384" | "RSA-OAEP-512";
	readonly pem?: string;
}

export interface TokenEncryptionProps {
	readonly format: "compact-nested-jwe";
	readonly encryptionKey: TokenEncryptionKeyProps;
}

export interface ProofOfPossessionProps {
	readonly mechanism: "mtls" | "dpop";
	readonly required: boolean;
	readonly requiredFor?: "public_clients" | "all_clients";
}

export interface ResourceServerProps extends Auth0Props {
	readonly identifier?: string;
	readonly name?: string;
	readonly scopes?: Array<ScopeProps>;
	readonly signingAlg?: "HS256" | "RS256" | "PS256";
	readonly signingSecret?: string;
	readonly allowOfflineAccess?: boolean;
	readonly allowOnlineAccess?: boolean;
	readonly tokenLifetime?: Duration;
	readonly tokenLifetimeForWeb?: Duration;
	readonly tokenDialect?:
		| "access_token"
		| "access_token_authz"
		| "rfc9068_profile"
		| "rfc9068_profile_authz";
	readonly skipConsentForVerifiableFirstPartyClients?: boolean;
	readonly enforcePolicies?: boolean;
	readonly tokenEncryption?: TokenEncryptionProps;
	readonly consentPolicy?: "transactional-authorization-with-mfa";
	readonly proofOfPossession?: ProofOfPossessionProps;
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
				allowOnlineAccess: props.allowOnlineAccess || false,
				tokenLifetime: props.tokenLifetime?.toSeconds() || 86400,
				tokenDialect: props.tokenDialect || "access_token",
				skipConsentForVerifiableFirstPartyClients:
					props.skipConsentForVerifiableFirstPartyClients || false,
				enforcePolicies: props.enforcePolicies || false,
				tokenEncryption: props.tokenEncryption
					? {
							format: props.tokenEncryption.format,
							encryptionKey: {
								name: props.tokenEncryption.encryptionKey.name,
								alg: props.tokenEncryption.encryptionKey.alg,
								pem: props.tokenEncryption.encryptionKey.pem,
							},
					  }
					: undefined,
				consentPolicy: props.consentPolicy,
				proofOfPossession: props.proofOfPossession
					? {
							mechanism: props.proofOfPossession.mechanism,
							required: props.proofOfPossession.required,
							requiredFor: props.proofOfPossession.requiredFor,
					  }
					: undefined,
			},
		});
	}
}
