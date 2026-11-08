const DEFAULT_PORT = 3000;
const DEFAULT_JWT_EXPIRES_IN = '3h';

function loadEnv(source) {
	const problems = [];

	const rawPort = source.PORT?.trim();
	let port = DEFAULT_PORT;
	if (rawPort) {
		port = Number(rawPort);
		if (!Number.isInteger(port) || port < 1 || port > 65535) {
			problems.push(`PORT must be an integer between 1 and 65535 (received "${rawPort}")`);
		}
	}

	const jwtSecret = source.JWT_SECRET?.trim();
	if (!jwtSecret) {
		problems.push('JWT_SECRET is required');
	}

	const jwtExpiresIn = source.JWT_EXPIRES_IN?.trim() || DEFAULT_JWT_EXPIRES_IN;

	if (problems.length > 0) {
		throw new Error(`Invalid environment configuration:\n- ${problems.join('\n- ')}`);
	}

	return Object.freeze({ port, jwtSecret, jwtExpiresIn });
}

export const env = loadEnv(process.env);
