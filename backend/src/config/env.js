const DEFAULT_PORT = 3000;
const DEFAULT_JWT_EXPIRES_IN = '3h';
const MIN_JWT_SECRET_LENGTH = 32; // 256 bits, recommended for HS256.
// Positive subset of the time span format accepted by jose's setExpirationTime (e.g. '90m', '3h', '7 days').
const JWT_EXPIRES_IN_PATTERN = /^(\d+(?:\.\d+)?) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;

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
	} else if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
		problems.push(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long`);
	}

	const jwtExpiresIn = source.JWT_EXPIRES_IN?.trim() || DEFAULT_JWT_EXPIRES_IN;
	const expiresInMatch = JWT_EXPIRES_IN_PATTERN.exec(jwtExpiresIn);
	if (!expiresInMatch || Number(expiresInMatch[1]) <= 0) {
		problems.push(`JWT_EXPIRES_IN must be a positive time span such as "90m", "3h" or "7 days" (received "${jwtExpiresIn}")`);
	}

	if (problems.length > 0) {
		throw new Error(`Invalid environment configuration:\n- ${problems.join('\n- ')}`);
	}

	return Object.freeze({ port, jwtSecret, jwtExpiresIn });
}

export const env = loadEnv(process.env);
