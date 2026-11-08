import { Router } from 'express';
import { getMe, updateMe } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../schemas/users.schemas.js';

export const usersRoutes = Router();

// authenticate runs before validate, so a request without a token gets 401 even with an invalid body.
usersRoutes.get('/me', authenticate, getMe);
usersRoutes.put('/me', authenticate, validate(updateProfileSchema), updateMe);
