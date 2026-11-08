/** Error codes returned by the API. The local repositories use the same ones. */
export type ErrorCode =
	| 'INVALID_INPUT'
	| 'MALFORMED_JSON'
	| 'INVALID_CREDENTIALS'
	| 'TOKEN_MISSING'
	| 'TOKEN_INVALID'
	| 'TOKEN_EXPIRED'
	| 'VENUE_NOT_FOUND'
	| 'ROUTE_NOT_FOUND'
	| 'EMAIL_ALREADY_IN_USE'
	| 'PAYLOAD_TOO_LARGE'
	| 'UNSUPPORTED_MEDIA_TYPE'
	| 'INTERNAL_ERROR';

export type ErrorDetail = {
	/** Field path (e.g. `email`), or `null` when the issue is about the input as a whole. */
	field: string | null;
	message: string;
};

/** Shared error for every repository implementation, so the app handles errors the same way. */
export class AppError extends Error {
	readonly code: ErrorCode;
	readonly details?: ErrorDetail[];

	constructor(code: ErrorCode, message: string, details?: ErrorDetail[]) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.details = details;
	}
}

export function isAppError(error: unknown, code?: ErrorCode): error is AppError {
	return error instanceof AppError && (code === undefined || error.code === code);
}
