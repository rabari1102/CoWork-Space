import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as maintenanceController from '../maintenance/maintenance.controller.js';
import {
  createMaintenanceSchema,
  deleteMaintenanceSchema,
  spaceIdParamSchema,
} from '../maintenance/maintenance.validation.js';
import * as controller from './spaces.controller.js';
import {
  availabilitySchema,
  createSpaceSchema,
  idParamSchema,
  listSpacesSchema,
  updateSpaceSchema,
} from './spaces.validation.js';

export const spacesRouter = Router();

// Public: visitors browse spaces and check availability without logging in.
spacesRouter.get('/', validate(listSpacesSchema), controller.list);
spacesRouter.get('/summary', controller.summary);
spacesRouter.get('/:id', validate(idParamSchema), controller.detail);
spacesRouter.get('/:id/availability', validate(availabilitySchema), controller.availability);

// Admin only from here down.
spacesRouter.use(authenticate, authorize('admin'));

spacesRouter.post('/', validate(createSpaceSchema), controller.create);
spacesRouter.patch('/:id', validate(updateSpaceSchema), controller.update);
spacesRouter.delete('/:id', validate(idParamSchema), controller.remove);

spacesRouter.get('/:id/maintenance', validate(spaceIdParamSchema), maintenanceController.list);
spacesRouter.post('/:id/maintenance', validate(createMaintenanceSchema), maintenanceController.create);
spacesRouter.delete(
  '/:id/maintenance/:maintenanceId',
  validate(deleteMaintenanceSchema),
  maintenanceController.remove,
);
