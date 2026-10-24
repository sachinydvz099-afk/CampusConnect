import { Router } from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  assignRequestStaff,
  addComment,
  createRequestSchema,
  updateStatusSchema,
  assignStaffSchema,
  addCommentSchema,
} from '../controllers/requests.controller.js';
import { authenticate } from '../middleware/authGuard.js';
import { authorize } from '../middleware/roleGuard.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// All request endpoints require authentication
router.use(authenticate);

router.post('/', validateBody(createRequestSchema), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);

// Staff / Admin actions
router.put('/:id/status', authorize('STAFF', 'ADMIN'), validateBody(updateStatusSchema), updateRequestStatus);
router.put('/:id/assign', authorize('STAFF', 'ADMIN'), validateBody(assignStaffSchema), assignRequestStaff);
router.post('/:id/comments', validateBody(addCommentSchema), addComment);

export default router;
