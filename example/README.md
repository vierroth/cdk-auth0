## Usage

### Setup

To get started you will manually create a `Machine to Machine Application` in your [Auth0](https://auth0.com) account and authorize it to have access to all permissions of the `Auth0 Management API`. This is necessary to allow the constructs to interact with the [Auth0 API](https://auth0.com) and create and manage resources on your behalf.

Once you have the `Machine to Machine Application` created you can go into the [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) and create a new secret containing the applications credentials in the following format:

```json
{
	"domain": "...",
	"clientId": "...",
	"clientSecret": "..."
}
```

All constructs will require this secret to be passed as `apiSecret` parameter.

### Initial Deployment

One you have completed the setup you can use `npm` or an alternative package manager of your choice, in the repositories root directory, to install any required packages and build the the project:

```bash
npm ci
npm run build
```

Once the project has built you can navigate to the example directory and run the initial pipeline deployment:

```bash
npx cdk deploy TestStack
```
