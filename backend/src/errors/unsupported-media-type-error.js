import { AppError } from './app-error.js';

export class UnsupportedMediaTypeError extends AppError {
	constructor(code, message, details) {
		super(415, code, message, details);
	}
}
