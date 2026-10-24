import { Response } from 'express';
import { z } from 'zod';
import { mockDb, MockService } from '../services/db.js';
import { AuthenticatedRequest } from '../types/index.js';

export const createServiceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  hours: z.string().min(2, 'Operating hours are required'),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z.string().min(5, 'Valid contact phone is required'),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export async function getServices(req: AuthenticatedRequest, res: Response) {
  const { search, category, includeInactive } = req.query;

  let results = [...mockDb.services];

  // If not admin, only show active services
  const isAdmin = req.user?.role === 'ADMIN';
  if (!isAdmin || includeInactive !== 'true') {
    results = results.filter(s => s.isActive);
  }

  // Filter by category
  if (category && typeof category === 'string' && category !== 'ALL') {
    results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by search query
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
    );
  }

  // Attach assigned staff counts
  const enriched = results.map(service => {
    const staffAssigned = mockDb.serviceStaff
      .filter(ss => ss.serviceId === service.id)
      .map(ss => {
        const user = mockDb.users.find(u => u.id === ss.userId);
        return {
          id: ss.userId,
          fullName: user?.fullName || 'Staff Member',
          roleTitle: ss.roleTitle || 'Support Staff',
        };
      });

    return {
      ...service,
      staff: staffAssigned,
      totalRequests: mockDb.requests.filter(r => r.serviceId === service.id).length,
    };
  });

  res.json({
    success: true,
    data: { services: enriched },
  });
}

export async function getServiceById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const service = mockDb.services.find(s => s.id === id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Campus service not found.',
    });
  }

  // Check if active or admin
  const isAdmin = req.user?.role === 'ADMIN';
  if (!service.isActive && !isAdmin) {
    return res.status(404).json({
      success: false,
      message: 'This service is currently inactive or undergoing maintenance.',
    });
  }

  // Attach assigned staff and upcoming slots
  const staff = mockDb.serviceStaff
    .filter(ss => ss.serviceId === service.id)
    .map(ss => {
      const user = mockDb.users.find(u => u.id === ss.userId);
      return {
        id: ss.userId,
        fullName: user?.fullName || 'Staff Member',
        email: user?.email,
        phone: user?.phone,
        department: user?.department,
        roleTitle: ss.roleTitle,
      };
    });

  const availableSlots = mockDb.appointmentSlots.filter(
    slot => slot.serviceId === service.id && slot.isAvailable && new Date(slot.startTime) > new Date()
  );

  res.json({
    success: true,
    data: {
      service: {
        ...service,
        staff,
        availableSlotsCount: availableSlots.length,
      },
    },
  });
}

export async function createService(req: AuthenticatedRequest, res: Response) {
  const newService: MockService = {
    id: `srv-${Date.now()}`,
    ...req.body,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockDb.services.push(newService);

  res.status(201).json({
    success: true,
    message: `Service "${newService.name}" created successfully.`,
    data: { service: newService },
  });
}

export async function updateService(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const serviceIndex = mockDb.services.findIndex(s => s.id === id);

  if (serviceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Service not found.',
    });
  }

  const updatedService = {
    ...mockDb.services[serviceIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  mockDb.services[serviceIndex] = updatedService;

  res.json({
    success: true,
    message: `Service "${updatedService.name}" updated successfully.`,
    data: { service: updatedService },
  });
}

export async function deleteOrDeactivateService(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const serviceIndex = mockDb.services.findIndex(s => s.id === id);

  if (serviceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Service not found.',
    });
  }

  // Data integrity check: if requests or appointments exist, soft deactivate instead of hard delete
  const hasRequests = mockDb.requests.some(r => r.serviceId === id);
  const hasAppointments = mockDb.appointments.some(a => a.serviceId === id);

  if (hasRequests || hasAppointments) {
    mockDb.services[serviceIndex].isActive = false;
    mockDb.services[serviceIndex].updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Service has existing historical records (requests/appointments). It has been safely deactivated instead of deleted.',
      data: { service: mockDb.services[serviceIndex], action: 'DEACTIVATED' },
    });
  }

  const removed = mockDb.services.splice(serviceIndex, 1)[0];
  res.json({
    success: true,
    message: `Service "${removed.name}" deleted permanently.`,
    data: { service: removed, action: 'DELETED' },
  });
}
