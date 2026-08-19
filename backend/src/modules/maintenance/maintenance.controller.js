import { asyncHandler } from '../../utils/asyncHandler.js';
import * as maintenanceService from './maintenance.service.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ data: await maintenanceService.listWindows(req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  const maintenance = await maintenanceService.createWindow(req.params.id, req.body);
  res.status(201).json({ maintenance });
});

export const remove = asyncHandler(async (req, res) => {
  await maintenanceService.deleteWindow(req.params.id, req.params.maintenanceId);
  res.status(204).send();
});
