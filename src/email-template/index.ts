import { CustomResource } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Auth0Props } from "../auth0-props";
import { Provider } from "./provider";

export interface EmailTemplateProps extends Auth0Props {
  /**
   * Template name. Can be verify_email, verify_email_by_code, reset_email, reset_email_by_code, welcome_email,
   * blocked_account, stolen_credentials, enrollment_email, mfa_oob_code, user_invitation, change_password (legacy),
   * or password_reset (legacy).
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
    | "change_password";
  /**
   * Body of the email template.
   */
  readonly body: string;
  /**
   * Senders from email address.
   */
  readonly from: string;
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
   * @default liquid
   */
  readonly syntax?: string;
  /**
   * Lifetime in seconds that the link within the email will be valid for.
   * @default 432000 (5 days)
   */
  readonly urlLifetimeInSeconds?: number;
  /**
   * Whether the reset_email and verify_email templates should include the user's email address as the email parameter
   * in the returnUrl (true) or whether no email address should be included in the redirect (false). Defaults to true.
   * @default true
   */
  readonly includeEmailInRedirect?: boolean;
  /**
   * Whether the template is enabled (true) or disabled (false).
   */
  readonly enabled: boolean;
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
        from: props.from,
        resultUrl: props.resultUrl,
        subject: props.subject,
        syntax: props.syntax || "liquid",
        urlLifetimeInSeconds: props?.urlLifetimeInSeconds || 432000,
        includeEmailInRedirect: props?.includeEmailInRedirect || true,
        enabled: props.enabled,
      },
    });
  }
}
