// The only place that reads process.env. Expo inlines EXPO_PUBLIC_ variables at build time,
// and only when they are referenced with dot notation.

const DATA_SOURCES = ['local', 'api'] as const;

export type DataSource = (typeof DATA_SOURCES)[number];

function readDataSource(): DataSource {
	const value = process.env.EXPO_PUBLIC_DATA_SOURCE || 'local';

	if (!DATA_SOURCES.includes(value as DataSource)) {
		throw new Error(
			`Invalid EXPO_PUBLIC_DATA_SOURCE "${value}". Expected one of: ${DATA_SOURCES.join(', ')}.`,
		);
	}

	// Fail fast instead of silently falling back to local data.
	if (value === 'api') {
		throw new Error('EXPO_PUBLIC_DATA_SOURCE=api is not available yet: the HTTP repositories are not implemented.');
	}

	return value as DataSource;
}

const DEFAULT_LOCAL_TOKEN_TTL_SECONDS = 3 * 60 * 60;

// Development aid: a short lifetime makes token expiration testable on the device.
function readLocalTokenTtlSeconds(): number {
	const value = process.env.EXPO_PUBLIC_LOCAL_TOKEN_TTL_SECONDS;
	if (!value) {
		return DEFAULT_LOCAL_TOKEN_TTL_SECONDS;
	}

	if (!/^[1-9]\d*$/.test(value)) {
		throw new Error(`Invalid EXPO_PUBLIC_LOCAL_TOKEN_TTL_SECONDS "${value}". Expected a positive integer.`);
	}
	return Number(value);
}

export const env = Object.freeze({
	dataSource: readDataSource(),
	apiUrl: process.env.EXPO_PUBLIC_API_URL ?? null,
	/** Lifetime of the tokens issued by the local repositories. */
	localTokenTtlSeconds: readLocalTokenTtlSeconds(),
});
