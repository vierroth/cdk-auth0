import { App } from "aws-cdk-lib";

import { TestStack } from "./stacks/test-stack.js";

const APP = new App();

new TestStack(APP, "TestStack", {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
});
