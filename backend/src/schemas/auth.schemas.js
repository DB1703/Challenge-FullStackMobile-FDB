import { z } from 'zod';
import { emailSchema } from './common.schemas.js';

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Password is required'),
}).strict();
