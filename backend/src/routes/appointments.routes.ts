import { Router } from 'express';
import {
  getAvailableSlots,
  createSlot,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  bookAppointmentSchema,
  createSlotSchema,
  cancelAppointmentSchema,
} from '../controllers/appointments.controller.js';
import { authenticate } from '../middleware/authGuard.js';
import { authorize } from '../middleware/roleGuard.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/slots', getAvailableSlots);
router.post('/slots', authorize('STAFF', 'ADMIN'), validateBody(createSlotSchema), createSlot);

router.get('/', getAppointments);
router.post('/book', validateBody(bookAppointmentSchema), bookAppointment);
router.post('/:id/cancel', validateBody(cancelAppointmentSchema), cancelAppointment);
router.put('/:id/status', authorize('STAFF', 'ADMIN'), updateAppointmentStatus);

export default router;
