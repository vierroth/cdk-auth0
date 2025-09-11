import { Construct } from "constructs";
import { CustomResource } from "aws-cdk-lib";

import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

/**
 * Azure requires connectionString
 */
export interface AzureCredentialsProps {
	readonly connectionString: string;
}

export interface AzureProviderProps extends Auth0Props {
	readonly name: "azure_cs";
	readonly defaultFromAddress: string;
	readonly credentials: AzureCredentialsProps;
}

/**
 * mandrill and sendgrid requires api_key
 */
export interface ApiKeyCredentialsProps {
	readonly apiKey: string;
}

export interface MandrillProviderProps extends Auth0Props {
	readonly name: "mandrill";
	readonly defaultFromAddress: string;
	readonly credentials: ApiKeyCredentialsProps;
}

/**
 * mailgun requires api_key and domain. Optionally, set region to eu to use the Mailgun service hosted in Europe;
 * set to null otherwise. eu or null are the only valid values for region.
 */
export interface MailgunCredentialsProps {
	readonly apiKey: string;
	readonly domain: string;
	readonly region?: "eu";
}

export interface MailgunProviderProps extends Auth0Props {
	readonly name: "mailgun";
	readonly defaultFromAddress: string;
	readonly credentials: MailgunCredentialsProps;
}

/**
 * Microsoft365 requires tenantId, clientId, and clientSecret
 */
export interface Microsoft365CredentialsProps {
	readonly tenantId: string;
	readonly clientId: string;
	readonly clientSecret: string;
}

export interface Microsoft365ProviderProps extends Auth0Props {
	readonly name: "ms365";
	readonly defaultFromAddress: string;
	readonly credentials: Microsoft365CredentialsProps;
}

export interface SendGridProviderProps extends Auth0Props {
	readonly name: "sendgrid";
	readonly defaultFromAddress: string;
	readonly credentials: ApiKeyCredentialsProps;
}

/**
 * ses requires accessKeyId, secretAccessKey, and region
 */
export interface SesCredentialsProps {
	readonly accessKeyId: string;
	readonly secretAccessKey: string;
	readonly region: string;
}

export interface SesProviderProps extends Auth0Props {
	readonly name: "ses";
	readonly defaultFromAddress: string;
	readonly credentials: SesCredentialsProps;
}

/**
 * smtp requires smtp_host, smtp_port, smtp_user, and smtp_pass
 */
export interface SmtpCredentialsProps {
	readonly smtpHost: Array<string>;
	readonly smtpPort: number;
	readonly smtpUser: string;
	readonly smtpPassword: string;
}

export interface SmtpProviderProps extends Auth0Props {
	readonly name: "smtp";
	readonly defaultFromAddress: string;
	readonly credentials: SmtpCredentialsProps;
}

/**
 * sparkpost requires api_key. Optionally, set region to eu to use the SparkPost service hosted in Western Europe;
 * set to null to use the SparkPost service hosted in North America. eu or null are the only valid values for region.
 */
export interface SparkPostCredentialsProps {
	readonly apiKey: string;
	readonly region?: "eu";
}

export interface SparkPostProviderProps extends Auth0Props {
	readonly name: "sparkpost";
	readonly defaultFromAddress: string;
	readonly credentials: SparkPostCredentialsProps;
}

/**
 * @category Constructs
 */
export class EmailProvider extends CustomResource {
	constructor(
		scope: Construct,
		id: string,
		props:
			| AzureProviderProps
			| MandrillProviderProps
			| MailgunProviderProps
			| Microsoft365ProviderProps
			| SesProviderProps
			| SendGridProviderProps
			| SmtpProviderProps
			| SparkPostProviderProps,
	) {
		super(scope, id, {
			resourceType: "Custom::EmailProvider",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				name: props.name,
				defaultFromAddress: props.defaultFromAddress,
				credentials: props.credentials,
			},
		});
	}
}
