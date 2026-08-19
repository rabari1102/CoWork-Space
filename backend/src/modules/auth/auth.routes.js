import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './auth.controller.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.validation.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), controller.register);
authRouter.post('/login', authLimiter, validate(loginSchema), controller.login);
authRouter.post('/refresh', validate(refreshSchema), controller.refresh);
authRouter.post('/logout', validate(refreshSchema), controller.logout);
authRouter.get('/me', authenticate, controller.me);
