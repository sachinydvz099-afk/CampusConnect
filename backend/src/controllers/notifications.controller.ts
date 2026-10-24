import { Response } from 'express';
import { mockDb } from '../services/db.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const userNotifications = mockDb.notifications
    .filter(n => n.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  res.json({
    success: true,
    data: {
      notifications: userNotifications,
      unreadCount,
    },
  });
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const notif = mockDb.notifications.find(n => n.id === id && n.userId === req.user!.id);

  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  notif.isRead = true;

  res.json({
    success: true,
    message: 'Notification marked as read.',
    data: { notification: notif },
  });
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  mockDb.notifications
    .filter(n => n.userId === req.user!.id && !n.isRead)
    .forEach(n => {
      n.isRead = true;
    });

  res.json({
    success: true,
    message: 'All notifications marked as read.',
  });
}
