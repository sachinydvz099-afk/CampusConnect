import { Response } from 'express';
import { z } from 'zod';
import { mockDb } from '../services/db.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

export const updateUserRoleSchema = z.object({
  role: z.enum(['STUDENT', 'STAFF', 'ADMIN'] as const),
});

export const assignServiceSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  roleTitle: z.string().optional(),
});

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  const { role, search, department } = req.query;

  let list = [...mockDb.users];

  if (role && typeof role === 'string' && role !== 'ALL') {
    list = list.filter(u => u.role === role);
  }

  if (department && typeof department === 'string' && department !== 'ALL') {
    list = list.filter(u => u.department.toLowerCase() === department.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.studentOrStaffId.toLowerCase().includes(q)
    );
  }

  const safeUsers = list.map(({ passwordHash, ...safe }) => safe);

  res.json({
    success: true,
    data: { users: safeUsers },
  });
}

export async function getStaffMembers(req: AuthenticatedRequest, res: Response) {
  const staff = mockDb.users
    .filter(u => (u.role === 'STAFF' || u.role === 'ADMIN') && u.isActive)
    .map(({ passwordHash, ...safe }) => safe);

  res.json({
    success: true,
    data: { staff },
  });
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { role } = req.body;

  const user = mockDb.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Prevent admin from removing their own admin role
  if (user.id === req.user?.id && role !== 'ADMIN') {
    return res.status(400).json({
      success: false,
      message: 'You cannot revoke your own administrator privileges.',
    });
  }

  user.role = role as UserRole;
  user.updatedAt = new Date();

  const { passwordHash, ...safeUser } = user;

  res.json({
    success: true,
    message: `Role for ${safeUser.fullName} updated to ${role}.`,
    data: { user: safeUser },
  });
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const user = mockDb.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.id === req.user?.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own administrative account.',
    });
  }

  user.isActive = !user.isActive;
  user.updatedAt = new Date();

  const { passwordHash, ...safeUser } = user;

  res.json({
    success: true,
    message: `User ${safeUser.fullName} has been ${user.isActive ? 'activated' : 'deactivated'}.`,
    data: { user: safeUser },
  });
}

export async function assignStaffToService(req: AuthenticatedRequest, res: Response) {
  const { serviceId, userId, roleTitle } = req.body;

  const service = mockDb.services.find(s => s.id === serviceId);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

  const user = mockDb.users.find(u => u.id === userId);
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return res.status(400).json({ success: false, message: 'User must have a Staff or Admin role.' });
  }

  const existing = mockDb.serviceStaff.find(ss => ss.serviceId === serviceId && ss.userId === userId);
  if (existing) {
    existing.roleTitle = roleTitle || existing.roleTitle;
    return res.json({
      success: true,
      message: `${user.fullName} assignment updated for ${service.name}.`,
      data: { assignment: existing },
    });
  }

  const newAssignment = {
    id: `assign-${Date.now()}`,
    serviceId,
    userId,
    roleTitle: roleTitle || 'Support Specialist',
    createdAt: new Date(),
  };

  mockDb.serviceStaff.push(newAssignment);

  res.status(201).json({
    success: true,
    message: `${user.fullName} successfully assigned to ${service.name}.`,
    data: { assignment: newAssignment },
  });
}
