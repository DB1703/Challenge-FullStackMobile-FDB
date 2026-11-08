import { decodeBase64Url } from './base64url';

/**
 * Reads the `exp` claim (in seconds) of any JWT, local or from the API, or returns `null` if it can't.
 * The signature is NOT verified: use it only for UI decisions. The repositories remain the authority.
 */
export function readTokenExpiration(token: string): number | null {
	const payload = token.split('.')[1];
	if (!payload) {
		return null;
	}

	try {
		const claims: unknown = JSON.parse(decodeBase64Url(payload));
		return typeof claims === 'object' && claims !== null && 'exp' in claims && typeof claims.exp === 'number'
			? claims.exp
			: null;
	} catch {
		return null;
	}
}
