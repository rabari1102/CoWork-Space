import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './bookings.controller.js';
import {
  createBookingSchema,
  idParamSchema,
  listAllBookingsSchema,
  listMyBookingsSchema,
} from './bookings.validation.js';

export const bookingsRouter = Router();

bookingsRouter.use(authenticate);

// Member
bookingsRouter.post('/', authorize('member'), validate(createBookingSchema), controller.create);
bookingsRouter.get('/me', authorize('member'), validate(listMyBookingsSchema), controller.listMine);
bookingsRouter.get('/me/stats', authorize('member'), controller.myStats);
bookingsRouter.patch('/:id/cancel', authorize('member'), validate(idParamSchema), controller.cancel);

// Admin
bookingsRouter.get('/', authorize('admin'), validate(listAllBookingsSchema), controller.listAll);
bookingsRouter.patch('/:id/approve', authorize('admin'), validate(idParamSchema), controller.approve);
bookingsRouter.patch('/:id/reject', authorize('admin'), validate(idParamSchema), controller.reject);
