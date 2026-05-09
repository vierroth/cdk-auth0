package main

import (
	"context"
	"log"
	"log/slog"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/eventbridge"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

var (
	Logger         *slog.Logger
	SecretsManager *secretsmanager.Client
	EventBridge    *eventbridge.Client

	ConnectionName             string
	Auth0SecretId              string
	Auth0ClientId              string
	Auth0AuthorizationEndpoint string
	Auth0Audience              string
)

func init() {
	Logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))

	ConnectionName = os.Getenv("CONNECTION_NAME")
	Auth0SecretId = os.Getenv("AUTH0_SECRET_ID")
	Auth0ClientId = os.Getenv("AUTH0_CLIENT_ID")
	Auth0AuthorizationEndpoint = os.Getenv("AUTH0_AUTHORIZATION_ENDPOINT")
	Auth0Audience = os.Getenv("AUTH0_AUDIENCE")

	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		Logger.Error("Unable to configure aws services", slog.Any("error", err))
		log.Fatal()
	}

	SecretsManager = secretsmanager.NewFromConfig(cfg)
	EventBridge = eventbridge.NewFromConfig(cfg)
}
