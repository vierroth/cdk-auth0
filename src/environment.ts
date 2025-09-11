export type ENV_DEFAULT = {
	_HANDLER: string;
	_X_AMZN_TRACE_ID?: string;
	AWS_REGION:
		| "us-east-1"
		| "us-east-2"
		| "us-west-1"
		| "us-west-2"
		| "ca-central-1"
		| "eu-west-1"
		| "eu-central-1"
		| "eu-west-2"
		| "eu-west-3"
		| "eu-north-1"
		| "ap-northeast-1"
		| "ap-northeast-2"
		| "ap-southeast-1"
		| "ap-southeast-2"
		| "ap-south-1"
		| "sa-east-1"
		| "us-gov-west-1"
		| "us-gov-east-1";
	AWS_EXECUTION_ENV: string;
	AWS_LAMBDA_FUNCTION_NAME: string;
	AWS_LAMBDA_FUNCTION_MEMORY_SIZE: string;
	AWS_LAMBDA_FUNCTION_VERSION: string;
	AWS_LAMBDA_INITIALIZATION_TYPE:
		| "on-demand"
		| "provisioned-concurrency"
		| "snap-start";
	AWS_LAMBDA_LOG_GROUP_NAME: string;
	AWS_LAMBDA_LOG_STREAM_NAME: string;
	AWS_ACCESS_KEY?: string;
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	AWS_SESSION_TOKEN: string;
	AWS_LAMBDA_RUNTIME_API: string;
	LAMBDA_TASK_ROOT: string;
	LAMBDA_RUNTIME_DIR: string;
};
