import { z } from 'zod';
import { DATE_PATTERN } from '../../utils/datetime.js';

const SPACE_TYPES = ['desk', 'meeting_room'];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const idParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive('Space id must be a positive integer'),
  }),
};

export const listSpacesSchema = {
  query: z
    .object({
      search: z.string().trim().max(80).optional(),
      type: z.enum(SPACE_TYPES).optional(),
      minCapacity: z.coerce.number().int().min(1).max(500).optional(),
      date: z.string().regex(DATE_PATTERN, 'Date must be in YYYY-MM-DD format').optional(),
      startTime: z.string().regex(TIME_PATTERN, 'Start time must be in HH:mm format').optional(),
      endTime: z.string().regex(TIME_PATTERN, 'End time must be in HH:mm format').optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(9),
    })
    .refine((value) => !value.startTime || !value.endTime || value.startTime < value.endTime, {
      message: 'End time must be after start time',
      path: ['endTime'],
    })
    .refine((value) => value.date || (!value.startTime && !value.endTime), {
      message: 'A date is required when filtering by time',
      path: ['date'],
    }),
};

export const availabilitySchema = {
  params: idParamSchema.params,
  query: z.object({
    date: z.string().regex(DATE_PATTERN, 'Date must be in YYYY-MM-DD format'),
  }),
};

const spaceBody = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  type: z.enum(SPACE_TYPES, { errorMap: () => ({ message: "Type must be 'desk' or 'meeting_room'" }) }),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').max(500),
  amenities: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  description: z.string().trim().max(500).default(''),
});

export const createSpaceSchema = { body: spaceBody };

export const updateSpaceSchema = {
  params: idParamSchema.params,
  body: spaceBody.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  }),
};
