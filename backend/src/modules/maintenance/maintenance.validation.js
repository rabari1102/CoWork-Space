import { z } from 'zod';
import { localDateTime } from '../../utils/schemas.js';

export const spaceIdParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive('Space id must be a positive integer'),
  }),
};

export const createMaintenanceSchema = {
  params: spaceIdParamSchema.params,
  body: z
    .object({
      startsAt: localDateTime,
      endsAt: localDateTime,
      reason: z.string().trim().max(200).default(''),
    })
    .refine((value) => value.endsAt > value.startsAt, {
      message: 'The window must end after it starts',
      path: ['endsAt'],
    }),
};

export const deleteMaintenanceSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
    maintenanceId: z.coerce.number().int().positive(),
  }),
};
