import { z } from 'zod';

export const loginSchema = z.object({
	// Normalized before validating, so surrounding spaces or uppercase letters are accepted.
	email: z.string().trim().toLowerCase().pipe(z.email()),
	password: z.string().min(1, 'Password is required'),
}).strict();
