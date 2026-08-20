import { asyncHandler } from '../../utils/asyncHandler.js';
import * as spacesService from './spaces.service.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await spacesService.listSpaces(req.query));
});

export const detail = asyncHandler(async (req, res) => {
  res.json({ space: await spacesService.getSpace(req.params.id) });
});

export const availability = asyncHandler(async (req, res) => {
  res.json(await spacesService.getAvailability(req.params.id, req.query.date));
});

export const create = asyncHandler(async (req, res) => {
  const space = await spacesService.createSpace(req.body);
  res.status(201).json({ space });
});

export const update = asyncHandler(async (req, res) => {
  const space = await spacesService.updateSpace(req.params.id, req.body);
  res.json({ space });
});

export const remove = asyncHandler(async (req, res) => {
  await spacesService.deleteSpace(req.params.id);
  res.status(204).send();
});

export const summary = asyncHandler(async (req, res) => {
  res.json(await spacesService.getSpacesSummary());
});
