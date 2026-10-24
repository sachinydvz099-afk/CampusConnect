import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteOrDeactivateService,
  createServiceSchema,
  updateServiceSchema,
} from '../controllers/services.controller.js';
import { authenticate } from '../middleware/authGuard.js';
import { authorize } from '../middleware/roleGuard.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public / Student readable endpoints
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin only endpoints
router.post('/', authenticate, authorize('ADMIN'), validateBody(createServiceSchema), createService);
router.put('/:id', authenticate, authorize('ADMIN'), validateBody(updateServiceSchema), updateService);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteOrDeactivateService);

export default router;
