import { env } from '@/shared/config/env';
import { AppError } from '@/shared/errors/app-error';
import { decodeBase64Url, encodeBase64Url } from '@/shared/utils/base64url';

// JWT-shaped token for the local repositories: `header.payload.signature`, base64url encoded.
// The signature is a fixed fake value (there is no secret on the device).
// Header and payload are ASCII, so no UTF-8 encoding is needed.

const HEADER = encodeBase64Url(JSON.stringify({ alg: 'HS256' }));
const SIGNATURE = encodeBase64Url('local-mock-signature');

function invalidToken(): AppError {
	return new AppError('TOKEN_INVALID', 'Token is invalid');
}

/** Same payload as the API: only `sub` (user id as a string) and `exp` (in seconds). */
export function createLocalToken(userId: number): string {
	const exp = Math.floor(Date.now() / 1000) + env.localTokenTtlSeconds;
	const payload = encodeBase64Url(JSON.stringify({ sub: String(userId), exp }));
	return `${HEADER}.${payload}.${SIGNATURE}`;
}

/**
 * Returns the user id, or throws like the API: `TOKEN_MISSING`, `TOKEN_INVALID` or `TOKEN_EXPIRED`.
 * As with the API, the signature is checked before the expiration.
 */
export function verifyLocalToken(token: string): number {
	if (!token) {
		throw new AppError('TOKEN_MISSING', 'Bearer token is missing');
	}

	const parts = token.split('.');
	if (parts.length !== 3 || parts[0] !== HEADER || parts[2] !== SIGNATURE) {
		throw invalidToken();
	}

	let payload: unknown;
	try {
		payload = JSON.parse(decodeBase64Url(parts[1]));
	} catch {
		throw invalidToken();
	}

	if (typeof payload !== 'object' || payload === null || !('exp' in payload) || typeof payload.exp !== 'number') {
		throw invalidToken();
	}
	if (payload.exp <= Date.now() / 1000) {
		throw new AppError('TOKEN_EXPIRED', 'Token has expired');
	}

	const sub = 'sub' in payload ? payload.sub : undefined;
	const userId = Number(sub);
	if (typeof sub !== 'string' || !Number.isInteger(userId) || userId <= 0) {
		throw invalidToken();
	}

	return userId;
}
