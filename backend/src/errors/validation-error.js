import { AppError } from './app-error.js';

export class ValidationError extends AppError {
	constructor(code, message, details) {
		super(400, code, message, details);
	}
}
