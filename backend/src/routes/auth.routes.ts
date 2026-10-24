import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  getCurrentUser,
  updateProfile,
  logout,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authGuard.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/demo-login', demoLogin);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;
