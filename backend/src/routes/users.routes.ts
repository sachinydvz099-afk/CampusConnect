import { Router } from 'express';
import {
  getUsers,
  getStaffMembers,
  updateUserRole,
  toggleUserStatus,
  assignStaffToService,
  updateUserRoleSchema,
  assignServiceSchema,
} from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authGuard.js';
import { authorize } from '../middleware/roleGuard.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

// Staff list can be retrieved by staff or admin for ticket delegation
router.get('/staff', authorize('STAFF', 'ADMIN'), getStaffMembers);

// Full user management endpoints require ADMIN role
router.get('/', authorize('ADMIN'), getUsers);
router.put('/:id/role', authorize('ADMIN'), validateBody(updateUserRoleSchema), updateUserRole);
router.put('/:id/status', authorize('ADMIN'), toggleUserStatus);
router.post('/assign-service', authorize('ADMIN'), validateBody(assignServiceSchema), assignStaffToService);

export default router;
