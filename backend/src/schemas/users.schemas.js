import { z } from 'zod';
import { emailSchema } from './common.schemas.js';

const nameSchema = z.string()
	.trim()
	.min(1, 'Must not be empty')
	.max(50, 'Must be at most 50 characters');

// PUT is a full replacement: every key is required, and address must be sent as null to clear it.
export const updateProfileSchema = z.object({
	firstName: nameSchema,
	lastName: nameSchema,
	email: emailSchema,
	address: z.string()
		.trim()
		.max(200, 'Must be at most 200 characters')
		.nullable()
		.transform((value) => value || null), // Empty (or whitespace only) is stored as NULL.
}).strict();
