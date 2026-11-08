/**
 * Booking rules are local (the API has no bookings), so their errors are not API codes and don't use AppError.
 * The UI already prevents these cases; the errors are a safety net.
 */
export type BookingErrorCode =
	| 'NOT_AUTHENTICATED'
	| 'SESSION_ALREADY_STARTED'
	| 'DATE_NOT_AVAILABLE'
	| 'BOOKING_DUPLICATE'
	| 'BOOKING_NOT_FOUND'
	| 'BOOKING_NOT_CANCELLABLE';

export class BookingError extends Error {
	readonly code: BookingErrorCode;

	constructor(code: BookingErrorCode, message: string) {
		super(message);
		this.name = 'BookingError';
		this.code = code;
	}
}
