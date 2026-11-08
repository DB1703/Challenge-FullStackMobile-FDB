import { AppError } from './app-error.js';

export class ConflictError extends AppError {
	constructor(code, message, details) {
		super(409, code, message, details);
	}
}
