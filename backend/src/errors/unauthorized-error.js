import { AppError } from './app-error.js';

export class UnauthorizedError extends AppError {
	constructor(code, message, details) {
		super(401, code, message, details);
	}
}
