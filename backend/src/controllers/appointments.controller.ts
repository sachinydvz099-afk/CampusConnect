import { Response } from 'express';
import { z } from 'zod';
import { mockDb, MockAppointment, MockAppointmentSlot } from '../services/db.js';
import { AuthenticatedRequest, AppointmentStatusType } from '../types/index.js';
import { generateAppointmentNumber } from '../utils/generators.js';

export const bookAppointmentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  staffId: z.string().min(1, 'Staff ID is required'),
  slotId: z.string().optional(),
  startTime: z.string().datetime('Valid start time required'),
  endTime: z.string().datetime('Valid end time required'),
  meetingLocation: z.string().min(2, 'Meeting location or virtual link is required'),
  notes: z.string().optional(),
});

export const createSlotSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  staffId: z.string().min(1, 'Staff ID is required'),
  startTime: z.string().datetime('Valid start time is required'),
  endTime: z.string().datetime('Valid end time is required'),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(3, 'Please specify the cancellation reason'),
});

export async function getAvailableSlots(req: AuthenticatedRequest, res: Response) {
  const { serviceId, staffId } = req.query;

  let slots = mockDb.appointmentSlots.filter(s => s.isAvailable);

  if (serviceId && typeof serviceId === 'string' && serviceId !== 'ALL') {
    slots = slots.filter(s => s.serviceId === serviceId);
  }

  if (staffId && typeof staffId === 'string' && staffId !== 'ALL') {
    slots = slots.filter(s => s.staffId === staffId);
  }

  // Filter only upcoming slots
  const now = new Date();
  slots = slots.filter(s => new Date(s.startTime) > now);

  // Sort ascending by time
  slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const enriched = slots.map(slot => {
    const service = mockDb.services.find(s => s.id === slot.serviceId);
    const staff = mockDb.users.find(u => u.id === slot.staffId);
    return {
      ...slot,
      serviceName: service?.name || 'Service',
      staffName: staff?.fullName || 'Staff Member',
    };
  });

  res.json({
    success: true,
    data: { slots: enriched },
  });
}

export async function createSlot(req: AuthenticatedRequest, res: Response) {
  const { serviceId, staffId, startTime, endTime } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res.status(400).json({
      success: false,
      message: 'Slot end time must be after start time.',
    });
  }

  // Check overlap for the same staff member
  const overlapping = mockDb.appointmentSlots.some(
    s =>
      s.staffId === staffId &&
      ((start >= new Date(s.startTime) && start < new Date(s.endTime)) ||
        (end > new Date(s.startTime) && end <= new Date(s.endTime)))
  );

  if (overlapping) {
    return res.status(409).json({
      success: false,
      message: 'This staff member already has an availability slot during this time period.',
    });
  }

  const newSlot: MockAppointmentSlot = {
    id: `slot-${Date.now()}`,
    serviceId,
    staffId,
    startTime: start,
    endTime: end,
    isAvailable: true,
    createdAt: new Date(),
  };

  mockDb.appointmentSlots.push(newSlot);

  res.status(201).json({
    success: true,
    message: 'Appointment slot created successfully.',
    data: { slot: newSlot },
  });
}

export async function bookAppointment(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { serviceId, staffId, slotId, startTime, endTime, meetingLocation, notes } = req.body;
  const studentId = req.user.id;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Appointments can only be booked for future time slots.',
    });
  }

  // Concurrency / Double-booking prevention:
  // 1. Check if the slot is still available if slotId is given
  if (slotId) {
    const slot = mockDb.appointmentSlots.find(s => s.id === slotId);
    if (!slot || !slot.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot was just booked by another student. Please select another slot.',
      });
    }
  }

  // 2. Prevent conflicting bookings for the student:
  const studentConflict = mockDb.appointments.some(
    a =>
      a.studentId === studentId &&
      a.status === 'BOOKED' &&
      ((start >= new Date(a.startTime) && start < new Date(a.endTime)) ||
        (end > new Date(a.startTime) && end <= new Date(a.endTime)))
  );

  if (studentConflict) {
    return res.status(409).json({
      success: false,
      message: 'You already have another active appointment scheduled during this time slot.',
    });
  }

  // 3. Prevent double-booking for the staff member:
  const staffConflict = mockDb.appointments.some(
    a =>
      a.staffId === staffId &&
      a.status === 'BOOKED' &&
      ((start >= new Date(a.startTime) && start < new Date(a.endTime)) ||
        (end > new Date(a.startTime) && end <= new Date(a.endTime)))
  );

  if (staffConflict) {
    return res.status(409).json({
      success: false,
      message: 'The selected staff member has another confirmed appointment during this time.',
    });
  }

  // Mark slot unavailable
  if (slotId) {
    const slotIndex = mockDb.appointmentSlots.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      mockDb.appointmentSlots[slotIndex].isAvailable = false;
    }
  }

  const appointmentNumber = generateAppointmentNumber();
  const newAppointment: MockAppointment = {
    id: `apt-${Date.now()}`,
    appointmentNumber,
    serviceId,
    staffId,
    studentId,
    slotId,
    startTime: start,
    endTime: end,
    meetingLocation,
    status: 'BOOKED',
    notes: notes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockDb.appointments.push(newAppointment);

  // Notify student
  const service = mockDb.services.find(s => s.id === serviceId);
  const staff = mockDb.users.find(u => u.id === staffId);

  mockDb.notifications.push({
    id: `notif-${Date.now()}`,
    userId: studentId,
    title: 'Appointment Booked',
    message: `Your appointment ${appointmentNumber} with ${staff?.fullName || 'Staff'} for ${service?.name} is confirmed.`,
    type: 'APPOINTMENT_UPDATE',
    link: '/appointments',
    isRead: false,
    createdAt: new Date(),
  });

  // Notify staff
  mockDb.notifications.push({
    id: `notif-${Date.now()}-stf`,
    userId: staffId,
    title: 'New Student Appointment',
    message: `${req.user.fullName} booked appointment ${appointmentNumber} for ${start.toLocaleDateString()}.`,
    type: 'APPOINTMENT_UPDATE',
    link: '/staff/appointments',
    isRead: false,
    createdAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: `Appointment ${appointmentNumber} booked successfully!`,
    data: { appointment: newAppointment },
  });
}

export async function getAppointments(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { status, timeframe } = req.query;
  const user = req.user;

  let list = [...mockDb.appointments];

  if (user.role === 'STUDENT') {
    list = list.filter(a => a.studentId === user.id);
  } else if (user.role === 'STAFF') {
    list = list.filter(a => a.staffId === user.id);
  }
  // Admin sees all

  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter(a => a.status === status);
  }

  const now = new Date();
  if (timeframe === 'upcoming') {
    list = list.filter(a => new Date(a.startTime) >= now && a.status === 'BOOKED');
  } else if (timeframe === 'past') {
    list = list.filter(a => new Date(a.startTime) < now || a.status !== 'BOOKED');
  }

  // Sort by start time ascending for upcoming, descending for past
  list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const enriched = list.map(apt => {
    const service = mockDb.services.find(s => s.id === apt.serviceId);
    const staff = mockDb.users.find(u => u.id === apt.staffId);
    const student = mockDb.users.find(u => u.id === apt.studentId);

    return {
      ...apt,
      serviceName: service?.name || 'Service',
      serviceLocation: service?.location || '',
      staffName: staff?.fullName || 'Staff Member',
      staffDepartment: staff?.department || '',
      staffEmail: staff?.email || '',
      studentName: student?.fullName || 'Student',
      studentIdNumber: student?.studentOrStaffId || '',
      studentEmail: student?.email || '',
    };
  });

  res.json({
    success: true,
    data: { appointments: enriched },
  });
}

export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user;

  const apt = mockDb.appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  // Permission check
  if (user.role === 'STUDENT' && apt.studentId !== user.id) {
    return res.status(403).json({ success: false, message: 'Access denied. You can only cancel your own appointments.' });
  }

  if (user.role === 'STAFF' && apt.staffId !== user.id) {
    return res.status(403).json({ success: false, message: 'Access denied. You are not the assigned staff for this appointment.' });
  }

  if (apt.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'This appointment is already cancelled.' });
  }

  apt.status = 'CANCELLED';
  apt.cancelledReason = reason;
  apt.updatedAt = new Date();

  // Free up the slot if it was tied to a slot
  if (apt.slotId) {
    const slot = mockDb.appointmentSlots.find(s => s.id === apt.slotId);
    if (slot && new Date(slot.startTime) > new Date()) {
      slot.isAvailable = true;
    }
  }

  // Send notifications
  if (user.role === 'STUDENT') {
    mockDb.notifications.push({
      id: `notif-${Date.now()}`,
      userId: apt.staffId,
      title: 'Appointment Cancelled by Student',
      message: `Appointment ${apt.appointmentNumber} was cancelled. Reason: "${reason}".`,
      type: 'APPOINTMENT_UPDATE',
      link: '/staff/appointments',
      isRead: false,
      createdAt: new Date(),
    });
  } else {
    mockDb.notifications.push({
      id: `notif-${Date.now()}`,
      userId: apt.studentId,
      title: 'Appointment Cancelled',
      message: `Your appointment ${apt.appointmentNumber} was cancelled by staff. Reason: "${reason}".`,
      type: 'APPOINTMENT_UPDATE',
      link: '/appointments',
      isRead: false,
      createdAt: new Date(),
    });
  }

  res.json({
    success: true,
    message: 'Appointment cancelled successfully.',
    data: { appointment: apt },
  });
}

export async function updateAppointmentStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

  const { id } = req.params;
  const { status } = req.body;

  const apt = mockDb.appointments.find(a => a.id === id);
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  apt.status = status as AppointmentStatusType;
  apt.updatedAt = new Date();

  res.json({
    success: true,
    message: `Appointment marked as ${status}.`,
    data: { appointment: apt },
  });
}
