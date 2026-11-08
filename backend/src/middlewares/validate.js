import { ValidationError } from '../errors/index.js';

function toDetails(issues) {
	return issues.flatMap((issue) => {
		if (issue.code === 'unrecognized_keys') {
			return issue.keys.map((key) => ({ field: key, message: 'Field is not allowed' }));
		}

		// Issues about the body as a whole (e.g. a request without a body) have an empty path.
		const field = issue.path.length > 0 ? issue.path.join('.') : null;
		return [{ field, message: issue.message }];
	});
}

export function validate(schema) {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			throw new ValidationError('INVALID_INPUT', 'Invalid request body', toDetails(result.error.issues));
		}

		req.body = result.data;
		next();
	};
}
