import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().trim().toLowerCase().email('A valid email address is required'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().trim().toLowerCase().email('A valid email address is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
};

export const updateProfileSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
    email: z.string().trim().toLowerCase().email('A valid email address is required').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72).optional(),
  }),
};

