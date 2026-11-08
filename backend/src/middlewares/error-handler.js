import {
	AppError,
	PayloadTooLargeError,
	UnsupportedMediaTypeError,
	ValidationError,
} from '../errors/index.js';

const INVALID_TOKEN_CODES = new Set(['TOKEN_INVALID', 'TOKEN_EXPIRED']);

// Maps body-parser errors (thrown by express.json()) to errors of the hierarchy.
function fromBodyParserError(err) {
	switch (err.type) {
		case 'entity.parse.failed':
			return new ValidationError('MALFORMED_JSON', 'Malformed JSON body');
		case 'entity.too.large':
			return new PayloadTooLargeError('PAYLOAD_TOO_LARGE', 'Request body too large');
		case 'charset.unsupported':
		case 'encoding.unsupported':
			return new UnsupportedMediaTypeError('UNSUPPORTED_MEDIA_TYPE', 'Unsupported request body charset or encoding');
		default:
			return err;
	}
}

// RFC 6750: every 401 carries a WWW-Authenticate challenge; token problems add error="invalid_token".
function buildAuthenticateHeader(code) {
	const challenge = 'Bearer realm="api"';
	return INVALID_TOKEN_CODES.has(code) ? `${challenge}, error="invalid_token"` : challenge;
}

export function errorHandler(err, req, res, next) {
	if (res.headersSent) {
		return next(err);
	}

	const error = fromBodyParserError(err);

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
