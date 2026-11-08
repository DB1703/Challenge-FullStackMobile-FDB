import { errors } from 'jose';
import { UnauthorizedError } from '../errors/index.js';
import { verifyToken } from '../utils/jwt.js';

const BEARER_PATTERN = /^Bearer (\S+)$/i;

function toUnauthorizedError(error) {
	// jose checks the signature before the claims, so only correctly signed tokens can be reported as expired.
	if (error instanceof errors.JWTExpired) {
		return new UnauthorizedError('TOKEN_EXPIRED', 'Token has expired');
	}
	if (error instanceof errors.JOSEError) {
		return new UnauthorizedError('TOKEN_INVALID', 'Token is invalid');
	}
	return error;
}

export async function authenticate(req, res, next) {
	const match = BEARER_PATTERN.exec(req.get('Authorization') ?? '');
	if (!match) {
		throw new UnauthorizedError('TOKEN_MISSING', 'Bearer token is missing');
	}

	let payload;
	try {
		payload = await verifyToken(match[1]);
	} catch (error) {
		throw toUnauthorizedError(error);
	}

	const id = Number(payload.sub);
	if (!Number.isInteger(id) || id <= 0) {
		throw new UnauthorizedError('TOKEN_INVALID', 'Token is invalid');
	}

	req.user = { id };
	next();
}
