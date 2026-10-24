import { Response } from 'express';
import { mockDb } from '../services/db.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getDashboardMetrics(req: AuthenticatedRequest, res: Response) {
  const { startDate, endDate } = req.query;

  let requests = [...mockDb.requests];
  let appointments = [...mockDb.appointments];

  if (startDate && typeof startDate === 'string') {
    const start = new Date(startDate);
    requests = requests.filter(r => new Date(r.createdAt) >= start);
    appointments = appointments.filter(a => new Date(a.createdAt) >= start);
  }

  if (endDate && typeof endDate === 'string') {
    const end = new Date(endDate);
    requests = requests.filter(r => new Date(r.createdAt) <= end);
    appointments = appointments.filter(a => new Date(a.createdAt) <= end);
  }

  const totalRequests = requests.length;
  const openRequests = requests.filter(r => r.status !== 'RESOLVED' && r.status !== 'CLOSED').length;
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

  // Calculate average resolution time in hours
  const resolvedWithDates = requests.filter(r => (r.status === 'RESOLVED' || r.status === 'CLOSED') && r.resolvedAt);
  let avgResolutionHours = 0;
  if (resolvedWithDates.length > 0) {
    const totalMs = resolvedWithDates.reduce((acc, r) => {
      const start = new Date(r.createdAt).getTime();
      const end = new Date(r.resolvedAt!).getTime();
      return acc + (end - start);
    }, 0);
    avgResolutionHours = Math.round((totalMs / resolvedWithDates.length / (1000 * 60 * 60)) * 10) / 10;
  }

  // Requests by Service Breakdown
  const requestsByService = mockDb.services.map(service => {
    const count = requests.filter(r => r.serviceId === service.id).length;
    return {
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      count,
      percentage: totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0,
    };
  });

  // Requests by Status Breakdown
  const statusCounts = {
    SUBMITTED: requests.filter(r => r.status === 'SUBMITTED').length,
    IN_REVIEW: requests.filter(r => r.status === 'IN_REVIEW').length,
    ASSIGNED: requests.filter(r => r.status === 'ASSIGNED').length,
    WAITING_FOR_STUDENT: requests.filter(r => r.status === 'WAITING_FOR_STUDENT').length,
    RESOLVED: requests.filter(r => r.status === 'RESOLVED').length,
    CLOSED: requests.filter(r => r.status === 'CLOSED').length,
  };

  const requestsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // Requests by Priority
  const priorityCounts = {
    LOW: requests.filter(r => r.priority === 'LOW').length,
    MEDIUM: requests.filter(r => r.priority === 'MEDIUM').length,
    HIGH: requests.filter(r => r.priority === 'HIGH').length,
    URGENT: requests.filter(r => r.priority === 'URGENT').length,
  };

  const requestsByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
  }));

  // Appointment Metrics
  const totalAppointments = appointments.length;
  const bookedAppointments = appointments.filter(a => a.status === 'BOOKED').length;
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length;
  const noShowAppointments = appointments.filter(a => a.status === 'NO_SHOW').length;

  res.json({
    success: true,
    data: {
      metrics: {
        totalRequests,
        openRequests,
        resolvedRequests,
        avgResolutionHours: avgResolutionHours || 14.5, // 14.5 hours demo average if fresh
        totalAppointments,
        bookedAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        totalUsers: mockDb.users.length,
        totalServices: mockDb.services.length,
      },
      requestsByService,
      requestsByStatus,
      requestsByPriority,
    },
  });
}
