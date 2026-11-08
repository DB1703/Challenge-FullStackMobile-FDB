import { AppError } from '@/shared/errors/app-error';

// JWT-shaped token for the local repositories: `header.payload.signature`, base64url encoded.
// The signature is a fixed fake value (there is no secret on the device).
// Hermes provides btoa/atob natively. Header and payload are ASCII, so no UTF-8 encoding is needed.

const TOKEN_LIFETIME_SECONDS = 3 * 60 * 60;

function toBase64Url(value: string): string {
	return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): string {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
}

const HEADER = toBase64Url(JSON.stringify({ alg: 'HS256' }));
const SIGNATURE = toBase64Url('local-mock-signature');

function invalidToken(): AppError {
	return new AppError('TOKEN_INVALID', 'Token is invalid');
}

/** Same payload as the API: only `sub` (user id as a string) and `exp` (in seconds). */
export function createLocalToken(userId: number): string {
	const exp = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
	const payload = toBase64Url(JSON.stringify({ sub: String(userId), exp }));
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
		payload = JSON.parse(fromBase64Url(parts[1]));
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
