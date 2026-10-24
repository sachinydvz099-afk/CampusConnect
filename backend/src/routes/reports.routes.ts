import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/authGuard.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);
router.get('/metrics', authorize('ADMIN', 'STAFF'), getDashboardMetrics);

export default router;
