import { jwtVerify, SignJWT } from 'jose';
import { env } from '../config/env.js';

const ALGORITHM = 'HS256';
const secret = new TextEncoder().encode(env.jwtSecret);

// The payload carries only `sub` and `exp`: the email is editable, so it is not part of the token.
export function signToken(userId) {
	return new SignJWT()
		.setProtectedHeader({ alg: ALGORITHM })
		.setSubject(String(userId))
		.setExpirationTime(env.jwtExpiresIn)
		.sign(secret);
}

// Throws jose errors; callers translate them. `exp` is required so a token can never be valid forever.
export async function verifyToken(token) {
	const { payload } = await jwtVerify(token, secret, {
		algorithms: [ALGORITHM],
		requiredClaims: ['sub', 'exp'],
	});

	return payload;
}
