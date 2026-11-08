import { z } from 'zod';

import { emailSchema } from '@/shared/schemas/common.schemas';

// Same rules as the backend's PUT /users/me. Messages are in Spanish because forms show them.

const nameSchema = z
	.string()
	.trim()
	.min(1, 'No puede estar vacío')
	.max(50, 'Debe tener como máximo 50 caracteres');

// Full replacement: every key is required, and address is sent as null to clear it.
export const updateProfileSchema = z
	.object({
		firstName: nameSchema,
		lastName: nameSchema,
		email: emailSchema,
		address: z
			.string()
			.trim()
			.max(200, 'Debe tener como máximo 200 caracteres')
			.nullable()
			.transform((value) => value || null), // Empty (or whitespace only) becomes null.
	})
	.strict();
