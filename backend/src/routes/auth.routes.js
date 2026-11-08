import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../schemas/auth.schemas.js';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), login);
