import { CustomResource, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface EmailTemplateProps extends Auth0Props {
	/**
	 * Template name.
	 */
	readonly template:
		| "verify_email"
		| "verify_email_by_code"
		| "reset_email"
		| "reset_email_by_code"
		| "welcome_email"
		| "blocked_account"
		| "stolen_credentials"
		| "enrollment_email"
		| "mfa_oob_code"
		| "user_invitation"
		| "change_password"
		| "password_reset"
		| "async_approval";
	/**
	 * Body of the email template.
	 */
	readonly body: string;
	/**
	 * Senders from email address.
	 */
	readonly emailFrom: string;
	/**
	 * URL to redirect the user to after a successful action.
	 */
	readonly resultUrl?: string;
	/**
	 * Subject line of the email.
	 */
	readonly subject: string;
	/**
	 * Syntax of the template body.
	 * @default `"liquid"`
	 */
	readonly syntax?: string;
	/**
	 * Lifetime in seconds that the link within the email will be valid for.
	 * @default `5 days`
	 */
	readonly urlLifetime?: Duration;
	/**
	 * Whether the reset_email and verify_email templates should include the user's email address as the email parameter
	 * in the returnUrl (true) or whether no email address should be included in the redirect (false). Defaults to true.
	 * @default `true`
	 */
	readonly includeEmailInRedirect?: boolean;
	/**
	 * Whether the template is enabled (true) or disabled (false).
	 * @default `true`
	 */
	readonly enabled?: boolean;
}

/**
 * @category Constructs
 */
export class EmailTemplate extends CustomResource {
	constructor(scope: Construct, id: string, props: EmailTemplateProps) {
		super(scope, id, {
			resourceType: "Custom::Auth0Action",
			serviceToken: Provider.getOrCreate(scope, props.apiSecret),
			properties: {
				secretName: props.apiSecret.secretName,
				template: props.template,
				body: props.body,
				from: props.emailFrom,
				resultUrl: props.resultUrl,
				subject: props.subject,
				syntax: props.syntax || "liquid",
				urlLifetimeInSeconds: props.urlLifetime?.toSeconds() || 432000,
				includeEmailInRedirect: props?.includeEmailInRedirect || true,
				enabled: props.enabled || true,
			},
		});
	}
}
