export class AppError extends Error {
	constructor(statusCode, code, message, details) {
		super(message);
		this.name = new.target.name;
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
	}
}
