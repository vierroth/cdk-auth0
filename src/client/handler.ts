import type { CdkCustomResourceEvent } from "aws-lambda";
import {
  SecretsManagerClient,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";
import { ManagementClient } from "auth0";

import type { ENV } from "./../lambda-base";
import { getSecretValue } from "./../get-secret-value";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ENV {}
  }
}

const SECRETS_MANAGER = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

export async function handler(event: CdkCustomResourceEvent) {
  const auth0Api = JSON.parse(
    await getSecretValue(
      event.ResourceProperties.secretName,
      process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
      process.env.AWS_SESSION_TOKEN,
    ),
  );

  const auth0 = new ManagementClient({
    domain: auth0Api.domain,
    clientId: auth0Api.clientId,
    clientSecret: auth0Api.clientSecret,
  });

  switch (event.RequestType) {
    case "Create": {
      const client = (
        await auth0.clients.create({
          name: event.ResourceProperties.name,
          description: event.ResourceProperties.description,
          logo_uri: event.ResourceProperties.logoUri,
          callbacks: event.ResourceProperties.callbacks,
          allowed_origins: event.ResourceProperties.allowedOrigins,
          web_origins: event.ResourceProperties.webOrigins,
          client_aliases: event.ResourceProperties.clientAliases,
          client_metadata: event.ResourceProperties.clientMetadata,
          allowed_clients: event.ResourceProperties.allowedClients,
          allowed_logout_urls: event.ResourceProperties.allowedLogoutUrls,
          grant_types: event.ResourceProperties.grantTypes,
          token_endpoint_auth_method:
            event.ResourceProperties.tokenEndpointAuthMethod,
          app_type: event.ResourceProperties.appType,
          is_first_party: event.ResourceProperties.isFirstParty === "true",
          oidc_conformant: event.ResourceProperties.oidcConformant === "true",
          jwt_configuration: {
            alg: event.ResourceProperties.jwt.alg,
          },
          sso: event.ResourceProperties.sso === "true",
          cross_origin_authentication:
            event.ResourceProperties.crossOriginAuthentication === "true",
          cross_origin_loc: event.ResourceProperties.crossOriginLoc,
          sso_disabled: event.ResourceProperties.ssoDisabled === "true",
          custom_login_page_on:
            event.ResourceProperties.customLoginPageOn === "true",
          custom_login_page: event.ResourceProperties.customLoginPage,
          custom_login_page_preview:
            event.ResourceProperties.customLoginPagePreview,
          form_template: event.ResourceProperties.formTemplate,
          initiate_login_uri: event.ResourceProperties.initiateLoginUri,
          refresh_token: event.ResourceProperties.refreshToken
            ? {
                rotation_type:
                  event.ResourceProperties.refreshToken.rotationType,
                expiration_type:
                  event.ResourceProperties.refreshToken.expirationType,
                leeway: parseInt(event.ResourceProperties.refreshToken.leeway),
                token_lifetime: parseInt(
                  event.ResourceProperties.refreshToken.tokenLifetime,
                ),
                infinite_token_lifetime:
                  event.ResourceProperties.refreshToken
                    .infiniteTokenLifetime === "true",
                idle_token_lifetime: parseInt(
                  event.ResourceProperties.refreshToken.idleTokenLifetime,
                ),
                infinite_idle_token_lifetime:
                  event.ResourceProperties.refreshToken
                    .infiniteIdleTokenLifetime === "true",
              }
            : undefined,
          organization_usage: event.ResourceProperties.organizationUsage,
          organization_require_behavior:
            event.ResourceProperties.organizationRequireBehavior,
        })
      ).data;

      return {
        PhysicalResourceId: client.client_id,
        Data: {
          clientDomain: auth0Api.domain,
          clientId: client.client_id,
          clientSecretArn: (
            await SECRETS_MANAGER.send(
              new UpdateSecretCommand({
                SecretId: event.ResourceProperties.clientSecretName,
                SecretString: client.client_secret,
              }),
            )
          ).ARN,
        },
      };
    }
    case "Update": {
      await auth0.clients.update(
        { client_id: event.PhysicalResourceId },
        {
          name: event.ResourceProperties.name || event.LogicalResourceId,
          description: event.ResourceProperties.description,
          logo_uri: event.ResourceProperties.logoUri,
          callbacks: event.ResourceProperties.callbacks,
          allowed_origins: event.ResourceProperties.allowedOrigins,
          web_origins: event.ResourceProperties.webOrigins,
          client_aliases: event.ResourceProperties.clientAliases,
          client_metadata: event.ResourceProperties.clientMetadata,
          allowed_clients: event.ResourceProperties.allowedClients,
          allowed_logout_urls: event.ResourceProperties.allowedLogoutUrls,
          grant_types: event.ResourceProperties.grantTypes,
          token_endpoint_auth_method:
            event.ResourceProperties.tokenEndpointAuthMethod,
          app_type: event.ResourceProperties.appType,
          is_first_party: event.ResourceProperties.isFirstParty === "true",
          oidc_conformant: event.ResourceProperties.oidcConformant === "true",
          jwt_configuration: {
            alg: event.ResourceProperties.jwt.alg,
          },
          sso: event.ResourceProperties.sso === "true",
          cross_origin_authentication:
            event.ResourceProperties.crossOriginAuthentication === "true",
          cross_origin_loc: event.ResourceProperties.crossOriginLoc,
          sso_disabled: event.ResourceProperties.ssoDisabled === "true",
          custom_login_page_on:
            event.ResourceProperties.customLoginPageOn === "true",
          custom_login_page: event.ResourceProperties.customLoginPage,
          custom_login_page_preview:
            event.ResourceProperties.customLoginPagePreview,
          form_template: event.ResourceProperties.formTemplate,
          initiate_login_uri: event.ResourceProperties.initiateLoginUri,
          refresh_token: event.ResourceProperties.refreshToken
            ? {
                rotation_type:
                  event.ResourceProperties.refreshToken.rotationType,
                expiration_type:
                  event.ResourceProperties.refreshToken.expirationType,
                leeway: parseInt(event.ResourceProperties.refreshToken.leeway),
                token_lifetime: parseInt(
                  event.ResourceProperties.refreshToken.tokenLifetime,
                ),
                infinite_token_lifetime:
                  event.ResourceProperties.refreshToken
                    .infiniteTokenLifetime === "true",
                idle_token_lifetime: parseInt(
                  event.ResourceProperties.refreshToken.idleTokenLifetime,
                ),
                infinite_idle_token_lifetime:
                  event.ResourceProperties.refreshToken
                    .infiniteIdleTokenLifetime === "true",
              }
            : undefined,
          organization_usage: event.ResourceProperties.organizationUsage,
          organization_require_behavior:
            event.ResourceProperties.organizationRequireBehavior,
        },
      );

      const client = (
        await auth0.clients.get({ client_id: event.PhysicalResourceId })
      ).data;

      return {
        PhysicalResourceId: event.PhysicalResourceId,
        Data: {
          clientDomain: auth0Api.domain,
          clientId: event.PhysicalResourceId,
          clientSecretArn: (
            await SECRETS_MANAGER.send(
              new UpdateSecretCommand({
                SecretId: event.ResourceProperties.clientSecretName,
                SecretString: client.client_secret,
              }),
            )
          ).ARN,
        },
      };
    }
    case "Delete": {
      await auth0.clients.delete({ client_id: event.PhysicalResourceId });

      return {
        PhysicalResourceId: event.PhysicalResourceId,
      };
    }
    default: {
      throw new Error("Invalid request type");
    }
  }
}
