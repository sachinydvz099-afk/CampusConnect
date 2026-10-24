import { Response } from 'express';
import { z } from 'zod';
import { mockDb, MockServiceRequest, MockStatusHistory, MockRequestComment } from '../services/db.js';
import { AuthenticatedRequest, RequestStatusType, RequestPriority } from '../types/index.js';
import { generateRequestNumber } from '../utils/generators.js';

export const createRequestSchema = z.object({
  serviceId: z.string().min(1, 'Service selection is required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(15, 'Please provide a detailed description (at least 15 characters)'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).default('MEDIUM'),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'IN_REVIEW',
    'ASSIGNED',
    'WAITING_FOR_STUDENT',
    'RESOLVED',
    'CLOSED',
  ] as const),
  note: z.string().optional(),
});

export const assignStaffSchema = z.object({
  assignedStaffId: z.string().min(1, 'Staff member ID is required'),
});

export const addCommentSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  isPrivateStaffNote: z.boolean().default(false),
});

export async function createRequest(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { serviceId, subject, description, priority, attachmentUrl } = req.body;

  // Validate service exists and is active
  const service = mockDb.services.find(s => s.id === serviceId && s.isActive);
  if (!service) {
    return res.status(400).json({
      success: false,
      message: 'The selected campus service does not exist or is inactive.',
    });
  }

  const requestId = `req-${Date.now()}`;
  const requestNumber = generateRequestNumber();

  const newRequest: MockServiceRequest = {
    id: requestId,
    requestNumber,
    subject,
    description,
    priority: priority as RequestPriority,
    status: 'SUBMITTED',
    serviceId,
    studentId: req.user.id,
    attachmentUrl: attachmentUrl || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockDb.requests.push(newRequest);

  // Add initial status history
  mockDb.statusHistories.push({
    id: `hist-${Date.now()}`,
    requestId,
    changedById: req.user.id,
    oldStatus: undefined,
    newStatus: 'SUBMITTED',
    note: 'Service request submitted by student.',
    createdAt: new Date(),
  });

  // Notify student
  mockDb.notifications.push({
    id: `notif-${Date.now()}`,
    userId: req.user.id,
    title: 'Request Submitted Successfully',
    message: `Your request ${requestNumber} for ${service.name} has been received.`,
    type: 'REQUEST_UPDATE',
    link: `/requests/${requestId}`,
    isRead: false,
    createdAt: new Date(),
  });

  // Notify assigned service staff
  const serviceStaff = mockDb.serviceStaff.filter(ss => ss.serviceId === serviceId);
  serviceStaff.forEach(ss => {
    mockDb.notifications.push({
      id: `notif-${Date.now()}-${ss.userId}`,
      userId: ss.userId,
      title: 'New Request Received',
      message: `New ${priority} priority ticket ${requestNumber} submitted for ${service.name}.`,
      type: 'REQUEST_UPDATE',
      link: '/staff/requests',
      isRead: false,
      createdAt: new Date(),
    });
  });

  res.status(201).json({
    success: true,
    message: `Service request ${requestNumber} submitted successfully!`,
    data: { request: newRequest },
  });
}

export async function getRequests(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { status, priority, serviceId, search } = req.query;
  const user = req.user;

  let list = [...mockDb.requests];

  // Role authorization
  if (user.role === 'STUDENT') {
    // Student can only access their own requests
    list = list.filter(r => r.studentId === user.id);
  } else if (user.role === 'STAFF') {
    // Staff can access requests assigned to them OR belonging to services they are assigned to
    const staffServiceIds = mockDb.serviceStaff
      .filter(ss => ss.userId === user.id)
      .map(ss => ss.serviceId);
    list = list.filter(r => r.assignedStaffId === user.id || staffServiceIds.includes(r.serviceId));
  }
  // Admin sees all

  // Filters
  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }
  if (priority && typeof priority === 'string' && priority !== 'ALL') {
    list = list.filter(r => r.priority === priority);
  }
  if (serviceId && typeof serviceId === 'string' && serviceId !== 'ALL') {
    list = list.filter(r => r.serviceId === serviceId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      r =>
        r.requestNumber.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  // Sort descending by created date
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Enforce enriched student, staff, and service details
  const enriched = list.map(reqItem => {
    const service = mockDb.services.find(s => s.id === reqItem.serviceId);
    const student = mockDb.users.find(u => u.id === reqItem.studentId);
    const staff = reqItem.assignedStaffId ? mockDb.users.find(u => u.id === reqItem.assignedStaffId) : null;

    return {
      ...reqItem,
      serviceName: service?.name || 'Campus Service',
      serviceCategory: service?.category || 'General',
      studentName: student?.fullName || 'Student',
      studentEmail: student?.email || '',
      studentIdNumber: student?.studentOrStaffId || '',
      assignedStaffName: staff?.fullName || 'Unassigned',
    };
  });

  res.json({
    success: true,
    data: { requests: enriched },
  });
}

export async function getRequestById(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const user = req.user;

  const requestItem = mockDb.requests.find(r => r.id === id || r.requestNumber === id);
  if (!requestItem) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  // Permissions check
  if (user.role === 'STUDENT' && requestItem.studentId !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own service requests.',
    });
  }

  if (user.role === 'STAFF') {
    const staffServiceIds = mockDb.serviceStaff
      .filter(ss => ss.userId === user.id)
      .map(ss => ss.serviceId);
    const isAssigned = requestItem.assignedStaffId === user.id;
    const isAuthorizedService = staffServiceIds.includes(requestItem.serviceId);

    if (!isAssigned && !isAuthorizedService) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this request or service.',
      });
    }
  }

  const service = mockDb.services.find(s => s.id === requestItem.serviceId);
  const student = mockDb.users.find(u => u.id === requestItem.studentId);
  const staff = requestItem.assignedStaffId ? mockDb.users.find(u => u.id === requestItem.assignedStaffId) : null;

  // Status history
  const statusHistory = mockDb.statusHistories
    .filter(h => h.requestId === requestItem.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(h => {
      const changedBy = mockDb.users.find(u => u.id === h.changedById);
      return {
        ...h,
        changedByName: changedBy?.fullName || 'System',
        changedByRole: changedBy?.role || 'SYSTEM',
      };
    });

  // Comments / Messages: STRICT PRIVACY RULE
  // If user is STUDENT, HIDE all comments where isPrivateStaffNote === true
  let comments = mockDb.comments.filter(c => c.requestId === requestItem.id);
  if (user.role === 'STUDENT') {
    comments = comments.filter(c => !c.isPrivateStaffNote);
  }

  const enrichedComments = comments
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(c => {
      const author = mockDb.users.find(u => u.id === c.authorId);
      return {
        ...c,
        authorName: author?.fullName || 'User',
        authorRole: author?.role || 'USER',
      };
    });

  res.json({
    success: true,
    data: {
      request: {
        ...requestItem,
        service,
        student: student ? { id: student.id, fullName: student.fullName, email: student.email, studentOrStaffId: student.studentOrStaffId, department: student.department } : null,
        assignedStaff: staff ? { id: staff.id, fullName: staff.fullName, email: staff.email, department: staff.department } : null,
        statusHistory,
        comments: enrichedComments,
      },
    },
  });
}

export async function updateRequestStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const { status, note } = req.body;
  const user = req.user;

  const requestItem = mockDb.requests.find(r => r.id === id);
  if (!requestItem) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  const oldStatus = requestItem.status;
  requestItem.status = status as RequestStatusType;
  requestItem.updatedAt = new Date();

  if (status === 'RESOLVED') {
    requestItem.resolvedAt = new Date();
  } else if (status === 'CLOSED') {
    requestItem.closedAt = new Date();
  }

  // Record history
  mockDb.statusHistories.push({
    id: `hist-${Date.now()}`,
    requestId: requestItem.id,
    changedById: user.id,
    oldStatus,
    newStatus: status as RequestStatusType,
    note: note || `Status updated from ${oldStatus} to ${status}`,
    createdAt: new Date(),
  });

  // Notify student
  mockDb.notifications.push({
    id: `notif-${Date.now()}`,
    userId: requestItem.studentId,
    title: `Request ${requestItem.requestNumber} Status Updated`,
    message: `Your request status changed to: ${status}. ${note ? `Note: "${note}"` : ''}`,
    type: 'REQUEST_UPDATE',
    link: `/requests/${requestItem.id}`,
    isRead: false,
    createdAt: new Date(),
  });

  res.json({
    success: true,
    message: `Request status successfully updated to ${status}.`,
    data: { request: requestItem },
  });
}

export async function assignRequestStaff(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const { assignedStaffId } = req.body;

  const requestItem = mockDb.requests.find(r => r.id === id);
  if (!requestItem) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  const staff = mockDb.users.find(u => u.id === assignedStaffId && (u.role === 'STAFF' || u.role === 'ADMIN'));
  if (!staff) {
    return res.status(400).json({ success: false, message: 'Invalid staff member selected.' });
  }

  requestItem.assignedStaffId = assignedStaffId;
  if (requestItem.status === 'SUBMITTED') {
    requestItem.status = 'ASSIGNED';
  }
  requestItem.updatedAt = new Date();

  // Log history
  mockDb.statusHistories.push({
    id: `hist-${Date.now()}`,
    requestId: requestItem.id,
    changedById: req.user.id,
    newStatus: requestItem.status,
    note: `Assigned to staff member: ${staff.fullName}`,
    createdAt: new Date(),
  });

  // Notify assigned staff
  mockDb.notifications.push({
    id: `notif-${Date.now()}`,
    userId: assignedStaffId,
    title: 'Service Request Assigned',
    message: `You were assigned to ticket ${requestItem.requestNumber}: "${requestItem.subject}".`,
    type: 'REQUEST_UPDATE',
    link: `/requests/${requestItem.id}`,
    isRead: false,
    createdAt: new Date(),
  });

  res.json({
    success: true,
    message: `Ticket assigned to ${staff.fullName}.`,
    data: { request: requestItem },
  });
}

export async function addComment(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const { message, isPrivateStaffNote } = req.body;
  const user = req.user;

  const requestItem = mockDb.requests.find(r => r.id === id);
  if (!requestItem) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  // Students can NEVER create private staff notes
  const privateFlag = user.role === 'STUDENT' ? false : Boolean(isPrivateStaffNote);

  const newComment: MockRequestComment = {
    id: `comm-${Date.now()}`,
    requestId: requestItem.id,
    authorId: user.id,
    message,
    isPrivateStaffNote: privateFlag,
    createdAt: new Date(),
  };

  mockDb.comments.push(newComment);
  requestItem.updatedAt = new Date();

  // Notifications
  if (!privateFlag) {
    // If staff replied publicly, notify student
    if (user.role !== 'STUDENT') {
      mockDb.notifications.push({
        id: `notif-${Date.now()}`,
        userId: requestItem.studentId,
        title: 'New Reply on Request',
        message: `${user.fullName} replied to your request ${requestItem.requestNumber}.`,
        type: 'REQUEST_UPDATE',
        link: `/requests/${requestItem.id}`,
        isRead: false,
        createdAt: new Date(),
      });
    } else if (requestItem.assignedStaffId) {
      // If student replied, notify assigned staff
      mockDb.notifications.push({
        id: `notif-${Date.now()}`,
        userId: requestItem.assignedStaffId,
        title: 'Student Responded',
        message: `${user.fullName} commented on ticket ${requestItem.requestNumber}.`,
        type: 'REQUEST_UPDATE',
        link: `/requests/${requestItem.id}`,
        isRead: false,
        createdAt: new Date(),
      });
    }
  }

  res.status(201).json({
    success: true,
    message: privateFlag ? 'Internal staff note added.' : 'Reply posted successfully.',
    data: {
      comment: {
        ...newComment,
        authorName: user.fullName,
        authorRole: user.role,
      },
    },
  });
}
