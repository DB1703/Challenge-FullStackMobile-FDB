import { AppError } from './app-error.js';

export class PayloadTooLargeError extends AppError {
	constructor(code, message, details) {
		super(413, code, message, details);
	}
}
