import { Request, Response } from 'express';
import { z } from 'zod';
import { mockDb, MockUser } from '../services/db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid college email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentOrStaffId: z.string().min(3, 'Student or Staff ID is required'),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  phone: z.string().optional(),
});

function sanitizeUser(user: MockUser) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function register(req: Request, res: Response) {
  const { fullName, email, password, studentOrStaffId, department, phone } = req.body;

  // Check if email or studentOrStaffId is already registered
  const existingUser = mockDb.users.find(u => u.email === email || u.studentOrStaffId === studentOrStaffId);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email or Student/Staff ID already exists.',
    });
  }

  const hashedPassword = await hashPassword(password);
  const newUser: MockUser = {
    id: `usr-${Date.now()}`,
    email,
    passwordHash: hashedPassword,
    fullName,
    role: 'STUDENT',
    studentOrStaffId,
    department,
    phone: phone || '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockDb.users.push(newUser);

  const safeUser = sanitizeUser(newUser);
  const token = generateToken(safeUser);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to CampusConnect.',
    data: {
      user: safeUser,
      token,
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = mockDb.users.find(u => u.email === email);
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken(safeUser);

  res.json({
    success: true,
    message: `Welcome back, ${safeUser.fullName}!`,
    data: {
      user: safeUser,
      token,
    },
  });
}

export async function demoLogin(req: Request, res: Response) {
  const role = (req.body.role as UserRole) || 'STUDENT';

  const user = mockDb.users.find(u => u.role === role && u.isActive);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Demo account for role ${role} not found.`,
    });
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken(safeUser);

  res.json({
    success: true,
    message: `Signed in as Demo ${role} (${safeUser.fullName})`,
    data: {
      user: safeUser,
      token,
    },
  });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = mockDb.users.find(u => u.id === req.user!.id);
  if (!user || !user.isActive) {
    return res.status(404).json({ success: false, message: 'User not found or deactivated.' });
  }

  res.json({
    success: true,
    data: { user: sanitizeUser(user) },
  });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = mockDb.users.find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { fullName, department, phone } = req.body;
  if (fullName) user.fullName = fullName;
  if (department) user.department = department;
  if (phone !== undefined) user.phone = phone;
  user.updatedAt = new Date();

  const safeUser = sanitizeUser(user);
  const token = generateToken(safeUser);

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    data: { user: safeUser, token },
  });
}

export async function logout(req: Request, res: Response) {
  res.json({
    success: true,
    message: 'Signed out successfully.',
  });
}
