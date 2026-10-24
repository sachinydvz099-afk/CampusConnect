export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentOrStaffId: string;
  department: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ASSIGNED'
  | 'WAITING_FOR_STUDENT'
  | 'RESOLVED'
  | 'CLOSED';

export type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  hours: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  staff?: Array<{
    id: string;
    fullName: string;
    roleTitle?: string;
    email?: string;
    phone?: string;
    department?: string;
  }>;
  totalRequests?: number;
  availableSlotsCount?: number;
}

export interface StatusHistoryItem {
  id: string;
  requestId: string;
  changedById: string;
  changedByName?: string;
  changedByRole?: string;
  oldStatus?: RequestStatus;
  newStatus: RequestStatus;
  note?: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  requestId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  isPrivateStaffNote: boolean;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  subject: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  serviceId: string;
  studentId: string;
  assignedStaffId?: string;
  attachmentUrl?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Enriched fields
  serviceName?: string;
  serviceCategory?: string;
  studentName?: string;
  studentEmail?: string;
  studentIdNumber?: string;
  assignedStaffName?: string;
  statusHistory?: StatusHistoryItem[];
  comments?: CommentItem[];
  service?: Service;
}

export interface AppointmentSlot {
  id: string;
  serviceId: string;
  serviceName?: string;
  staffId: string;
  staffName?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  serviceId: string;
  serviceName?: string;
  serviceLocation?: string;
  staffId: string;
  staffName?: string;
  staffDepartment?: string;
  staffEmail?: string;
  studentId: string;
  studentName?: string;
  studentIdNumber?: string;
  studentEmail?: string;
  slotId?: string;
  startTime: string;
  endTime: string;
  meetingLocation: string;
  status: AppointmentStatus;
  notes?: string;
  cancelledReason?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'REQUEST_UPDATE' | 'APPOINTMENT_UPDATE' | 'SYSTEM_NOTICE';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalRequests: number;
  openRequests: number;
  resolvedRequests: number;
  avgResolutionHours: number;
  totalAppointments: number;
  bookedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalUsers: number;
  totalServices: number;
}
