import { Request } from 'express';

export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RequestStatusType = 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'ASSIGNED' 
  | 'WAITING_FOR_STUDENT' 
  | 'RESOLVED' 
  | 'CLOSED';
export type AppointmentStatusType = 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type NotificationType = 'REQUEST_UPDATE' | 'APPOINTMENT_UPDATE' | 'SYSTEM_NOTICE';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentOrStaffId: string;
  department: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}
