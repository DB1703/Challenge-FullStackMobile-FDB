import { z } from 'zod';

import { emailSchema } from '@/shared/schemas/common.schemas';

// Same rules as the backend's POST /auth/login. Messages are in Spanish because forms show them.
export const loginSchema = z
	.object({
		email: emailSchema,
		password: z.string().min(1, 'Ingresá tu contraseña'),
	})
	.strict();
