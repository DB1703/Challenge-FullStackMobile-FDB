import { AppError, ValidationError } from '../errors/index.js';

const INVALID_TOKEN_CODES = new Set(['TOKEN_INVALID', 'TOKEN_EXPIRED']);

// RFC 6750: every 401 carries a WWW-Authenticate challenge; token problems add error="invalid_token".
function buildAuthenticateHeader(code) {
	const challenge = 'Bearer realm="api"';
	return INVALID_TOKEN_CODES.has(code) ? `${challenge}, error="invalid_token"` : challenge;
}

export function errorHandler(err, req, res, next) {
	if (res.headersSent) {
		return next(err);
	}

	let error = err;

	// Thrown by express.json() when the body is not valid JSON.
	if (err.type === 'entity.parse.failed') {
		error = new ValidationError('MALFORMED_JSON', 'Malformed JSON body');
	}

	if (error instanceof AppError) {
		if (error.statusCode === 401) {
			res.set('WWW-Authenticate', buildAuthenticateHeader(error.code));
		}

		const body = { code: error.code, message: error.message };
		if (error.details) {
			body.details = error.details;
		}

		return res.status(error.statusCode).json({ error: body });
	}

	console.error(err);
	res.status(500).json({
		error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
	});
}
