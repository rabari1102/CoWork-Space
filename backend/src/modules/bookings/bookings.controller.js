import { asyncHandler } from '../../utils/asyncHandler.js';
import * as bookingsService from './bookings.service.js';

export const create = asyncHandler(async (req, res) => {
  const booking = await bookingsService.createBooking(req.user.id, req.body);
  res.status(201).json({ booking });
});

export const listMine = asyncHandler(async (req, res) => {
  res.json(await bookingsService.listUserBookings(req.user.id, req.query));
});

export const listAll = asyncHandler(async (req, res) => {
  res.json(await bookingsService.listAllBookings(req.query));
});

export const cancel = asyncHandler(async (req, res) => {
  const booking = await bookingsService.cancelBooking(req.user, req.params.id);
  res.json({ booking });
});

export const approve = asyncHandler(async (req, res) => {
  const result = await bookingsService.approveBooking(req.params.id);
  res.json(result);
});

export const reject = asyncHandler(async (req, res) => {
  const booking = await bookingsService.rejectBooking(req.params.id);
  res.json({ booking });
});
