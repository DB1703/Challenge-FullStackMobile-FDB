import type { z } from 'zod';

import { AppError, type ErrorDetail } from '@/shared/errors/app-error';

// Same mapping as the backend's validate middleware.
function toDetails(issues: z.core.$ZodIssue[]): ErrorDetail[] {
	return issues.flatMap((issue) => {
		if (issue.code === 'unrecognized_keys') {
			return issue.keys.map((key) => ({ field: key, message: 'Campo no permitido' }));
		}

		const field = issue.path.length > 0 ? issue.path.map(String).join('.') : null;
		return [{ field, message: issue.message }];
	});
}

/** Validates and normalizes the input, or throws `INVALID_INPUT` with details, like the API. */
export function parseOrThrow<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
	const result = schema.safeParse(input);
	if (!result.success) {
		throw new AppError('INVALID_INPUT', 'Invalid request body', toDetails(result.error.issues));
	}
	return result.data;
}
