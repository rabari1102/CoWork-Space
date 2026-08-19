import { z } from 'zod';
import { DATE_PATTERN, nowLocal } from '../../utils/datetime.js';
import { localDateTime } from '../../utils/schemas.js';

const BOOKING_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

export const createBookingSchema = {
  body: z
    .object({
      spaceId: z.coerce.number().int().positive('A space must be selected'),
      startsAt: localDateTime,
      endsAt: localDateTime,
    })
    .refine((value) => value.endsAt > value.startsAt, {
      message: 'The booking must end after it starts',
      path: ['endsAt'],
    })
    .refine((value) => value.startsAt > nowLocal(), {
      message: 'Bookings cannot start in the past',
      path: ['startsAt'],
    }),
};

export const idParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive('Booking id must be a positive integer'),
  }),
};

export const listMyBookingsSchema = {
  query: z.object({
    status: z.enum(BOOKING_STATUSES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
};

export const listAllBookingsSchema = {
  query: z.object({
    status: z.enum(BOOKING_STATUSES).optional(),
    spaceId: z.coerce.number().int().positive().optional(),
    date: z.string().regex(DATE_PATTERN, 'Date must be in YYYY-MM-DD format').optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
};
