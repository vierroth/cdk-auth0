export async function getSecretValue(
	secretName: string,
	port: string,
	sessionToken: string,
) {
	const url = `http://localhost:${port}/secretsmanager/get?secretId=${secretName}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"X-Aws-Parameters-Secrets-Token": sessionToken,
		},
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const secretContent = (await response.json()) as { SecretString: string };

	return secretContent.SecretString;
}
