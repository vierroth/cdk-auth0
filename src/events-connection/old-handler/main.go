package main

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/eventbridge"
	eventbridgetypes "github.com/aws/aws-sdk-go-v2/service/eventbridge/types"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

func handleRequest(ctx context.Context, event events.EventBridgeEvent) error {
	Logger.Info("event received", slog.String("source", event.Source), slog.String("detailType", event.DetailType), slog.String("id", event.ID))

	secOut, err := SecretsManager.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{SecretId: aws.String(Auth0SecretId)})
	if err != nil {
		Logger.Error("Error fetching secret value", slog.String("auth0SecretId", Auth0SecretId), slog.Any("error", err))
		return err
	}
	if secOut.SecretString == nil {
		Logger.Error("Secret has no SecretString (binary secrets not supported)", slog.String("auth0SecretId", Auth0SecretId))
		return errors.New("Secret has no SecretString (binary secrets not supported)")
	}

	input := &eventbridge.UpdateConnectionInput{
		Name:              aws.String(ConnectionName),
		AuthorizationType: eventbridgetypes.ConnectionAuthorizationTypeOauthClientCredentials,
		AuthParameters: &eventbridgetypes.UpdateConnectionAuthRequestParameters{
			OAuthParameters: &eventbridgetypes.UpdateConnectionOAuthRequestParameters{
				AuthorizationEndpoint: aws.String(Auth0AuthorizationEndpoint),
				HttpMethod:            eventbridgetypes.ConnectionOAuthHttpMethodPost,
				ClientParameters: &eventbridgetypes.UpdateConnectionOAuthClientRequestParameters{
					ClientID:     aws.String(Auth0ClientId),
					ClientSecret: aws.String(strings.TrimSpace(*secOut.SecretString)),
				},
				OAuthHttpParameters: &eventbridgetypes.ConnectionHttpParameters{
					BodyParameters: []eventbridgetypes.ConnectionBodyParameter{
						{
							Key:           aws.String("audience"),
							Value:         aws.String(Auth0Audience),
							IsValueSecret: false,
						},
						{
							Key:           aws.String("grant_type"),
							Value:         aws.String("client_credentials"),
							IsValueSecret: false,
						},
					},
				},
			},
		},
	}

	var lastErr error
	for attempt := range 3 {
		_, err = EventBridge.UpdateConnection(ctx, input)
		if err == nil {
			Logger.Info("Connection updated", slog.String("connectionName", ConnectionName), slog.String("secretId", Auth0SecretId))
			return nil
		}

		lastErr = err
		Logger.Error(
			"Error updating connection",
			slog.String("connectionName", ConnectionName),
			slog.Int("attempt", attempt+1),
			slog.Any("error", err),
		)

		if attempt < 2 {
			select {
			case <-time.After(20 * time.Second):
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}
	if lastErr == nil {
		Logger.Info("Connection updated", slog.String("connectionName", ConnectionName), slog.String("secretId", Auth0SecretId))
	}

	return lastErr
}

func main() {
	lambda.Start(handleRequest)
}
