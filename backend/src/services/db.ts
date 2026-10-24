import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateRequestNumber, generateAppointmentNumber } from '../utils/generators.js';
import { UserRole, RequestPriority, RequestStatusType, AppointmentStatusType, NotificationType } from '../types/index.js';

// Try initializing PrismaClient
export const prisma = new PrismaClient();

// In-Memory Data Store (Used seamlessly when PostgreSQL is not available locally)
export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  studentOrStaffId: string;
  department: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockService {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  hours: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockServiceStaff {
  id: string;
  serviceId: string;
  userId: string;
  roleTitle?: string;
  createdAt: Date;
}

export interface MockRequestComment {
  id: string;
  requestId: string;
  authorId: string;
  message: string;
  isPrivateStaffNote: boolean;
  createdAt: Date;
}

export interface MockStatusHistory {
  id: string;
  requestId: string;
  changedById: string;
  oldStatus?: RequestStatusType;
  newStatus: RequestStatusType;
  note?: string;
  createdAt: Date;
}

export interface MockServiceRequest {
  id: string;
  requestNumber: string;
  subject: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatusType;
  serviceId: string;
  studentId: string;
  assignedStaffId?: string;
  attachmentUrl?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAppointmentSlot {
  id: string;
  serviceId: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  createdAt: Date;
}

export interface MockAppointment {
  id: string;
  appointmentNumber: string;
  serviceId: string;
  staffId: string;
  studentId: string;
  slotId?: string;
  startTime: Date;
  endTime: Date;
  meetingLocation: string;
  status: AppointmentStatusType;
  notes?: string;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// Global in-memory storage seeded with rich demo data
export class MockDatabase {
  users: MockUser[] = [];
  services: MockService[] = [];
  serviceStaff: MockServiceStaff[] = [];
  requests: MockServiceRequest[] = [];
  comments: MockRequestComment[] = [];
  statusHistories: MockStatusHistory[] = [];
  appointmentSlots: MockAppointmentSlot[] = [];
  appointments: MockAppointment[] = [];
  notifications: MockNotification[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Campus@123', salt);

    // Seed Users
    const studentUser: MockUser = {
      id: 'usr-student-01',
      email: 'student@campusconnect.edu',
      passwordHash: demoPasswordHash,
      fullName: 'Aarav Sharma',
      role: 'STUDENT',
      studentOrStaffId: 'BCA-2024-042',
      department: 'Computer Applications',
      phone: '+91 98765 43210',
      isActive: true,
      createdAt: new Date('2026-01-15T09:00:00Z'),
      updatedAt: new Date('2026-01-15T09:00:00Z'),
    };

    const staffUser: MockUser = {
      id: 'usr-staff-01',
      email: 'staff@campusconnect.edu',
      passwordHash: demoPasswordHash,
      fullName: 'Prof. Rajesh Kumar',
      role: 'STAFF',
      studentOrStaffId: 'STF-ENG-108',
      department: 'IT & Infrastructure Support',
      phone: '+91 98111 22334',
      isActive: true,
      createdAt: new Date('2025-08-10T09:00:00Z'),
      updatedAt: new Date('2025-08-10T09:00:00Z'),
    };

    const advisorStaff: MockUser = {
      id: 'usr-staff-02',
      email: 'advisor@campusconnect.edu',
      passwordHash: demoPasswordHash,
      fullName: 'Dr. Priya Mehta',
      role: 'STAFF',
      studentOrStaffId: 'STF-ACA-204',
      department: 'Academic Advising & Guidance',
      phone: '+91 98222 33445',
      isActive: true,
      createdAt: new Date('2025-08-12T09:00:00Z'),
      updatedAt: new Date('2025-08-12T09:00:00Z'),
    };

    const adminUser: MockUser = {
      id: 'usr-admin-01',
      email: 'admin@campusconnect.edu',
      passwordHash: demoPasswordHash,
      fullName: 'Dean of Student Welfare (Admin)',
      role: 'ADMIN',
      studentOrStaffId: 'ADM-DIR-001',
      department: 'Office of Campus Administration',
      phone: '+91 98333 44556',
      isActive: true,
      createdAt: new Date('2025-01-01T08:00:00Z'),
      updatedAt: new Date('2025-01-01T08:00:00Z'),
    };

    this.users.push(studentUser, staffUser, advisorStaff, adminUser);

    // Seed Services
    const sampleServices: MockService[] = [
      {
        id: 'srv-it-01',
        name: 'IT Support & Wi-Fi Services',
        category: 'Technology',
        description: 'Assistance with campus Wi-Fi access, student portal authentication, software licenses, lab PCs, and campus email configuration.',
        location: 'Technology Block, Ground Floor, Room T-104',
        hours: 'Monday to Friday: 8:30 AM – 5:30 PM',
        contactEmail: 'itsupport@campusconnect.edu',
        contactPhone: '+91 80 2345 6701',
        isActive: true,
        createdAt: new Date('2025-01-10T09:00:00Z'),
        updatedAt: new Date('2025-01-10T09:00:00Z'),
      },
      {
        id: 'srv-acad-02',
        name: 'Academic Advising & Mentorship',
        category: 'Academics',
        description: 'Comprehensive academic guidance, course selection advice, credit transfer inquiries, graduation audit reviews, and peer mentor pairing.',
        location: 'Main Administrative Building, 2nd Floor, Room A-212',
        hours: 'Monday to Friday: 9:00 AM – 4:30 PM',
        contactEmail: 'advising@campusconnect.edu',
        contactPhone: '+91 80 2345 6702',
        isActive: true,
        createdAt: new Date('2025-01-10T09:00:00Z'),
        updatedAt: new Date('2025-01-10T09:00:00Z'),
      },
      {
        id: 'srv-lib-03',
        name: 'Central Library Assistance & Research',
        category: 'Library',
        description: 'Digital journal database access (IEEE, JSTOR, Springer), book reservations, inter-library book loans, thesis formatting, and study pod bookings.',
        location: 'Central Knowledge Center (Library Building)',
        hours: 'Monday to Saturday: 8:00 AM – 9:00 PM',
        contactEmail: 'library@campusconnect.edu',
        contactPhone: '+91 80 2345 6703',
        isActive: true,
        createdAt: new Date('2025-01-10T09:00:00Z'),
        updatedAt: new Date('2025-01-10T09:00:00Z'),
      },
      {
        id: 'srv-counsel-04',
        name: 'Student Counseling & Mental Wellbeing',
        category: 'Counseling',
        description: 'Confidential psychological counseling, academic stress management, career anxiety support, and personal development workshops.',
        location: 'Student Health & Wellness Pavilion, Room W-102',
        hours: 'Monday to Friday: 10:00 AM – 6:00 PM',
        contactEmail: 'wellbeing@campusconnect.edu',
        contactPhone: '+91 80 2345 6704',
        isActive: true,
        createdAt: new Date('2025-01-10T09:00:00Z'),
        updatedAt: new Date('2025-01-10T09:00:00Z'),
      },
      {
        id: 'srv-equip-05',
        name: 'Lab Equipment & Electronics Loan',
        category: 'Equipment Loans',
        description: 'Short-term checkout of IoT kits (Arduino, Raspberry Pi), VR headsets, project oscilloscopes, DSLR cameras, and high-spec loaner laptops.',
        location: 'Makerspace & Innovation Lab, Room M-01',
        hours: 'Monday to Friday: 10:00 AM – 4:00 PM',
        contactEmail: 'labloans@campusconnect.edu',
        contactPhone: '+91 80 2345 6705',
        isActive: true,
        createdAt: new Date('2025-01-10T09:00:00Z'),
        updatedAt: new Date('2025-01-10T09:00:00Z'),
      },
      {
        id: 'srv-career-06',
        name: 'Career Guidance & Placement Cell',
        category: 'Career Services',
        description: 'Resume reviews, mock technical and HR interviews, campus placement registrations, summer internship listings, and corporate networking.',
        location: 'Corporate Relations Wing, 3rd Floor, Room C-301',
        hours: 'Monday to Friday: 9:30 AM – 5:00 PM',
        contactEmail: 'placements@campusconnect.edu',
        contactPhone: '+91 80 2345 6706',
        isActive: true,
        createdAt: new Date('2025-01-10T09:00:00Z'),
        updatedAt: new Date('2025-01-10T09:00:00Z'),
      },
    ];

    this.services.push(...sampleServices);

    // Assign Staff to Services
    this.serviceStaff.push(
      {
        id: 'stf-assign-01',
        serviceId: 'srv-it-01',
        userId: 'usr-staff-01',
        roleTitle: 'Senior Systems Engineer',
        createdAt: new Date('2025-08-15T09:00:00Z'),
      },
      {
        id: 'stf-assign-02',
        serviceId: 'srv-acad-02',
        userId: 'usr-staff-02',
        roleTitle: 'Lead Academic Counselor',
        createdAt: new Date('2025-08-15T09:00:00Z'),
      }
    );

    // Seed Sample Service Requests
    const req1: MockServiceRequest = {
      id: 'req-01',
      requestNumber: 'REQ-2026-1042',
      subject: 'Hostel Block 3 Wi-Fi dropping frequently',
      description: 'The Wi-Fi access point near Room 314 disconnects every 15 minutes, making it difficult to attend virtual project seminars.',
      priority: 'HIGH',
      status: 'IN_REVIEW',
      serviceId: 'srv-it-01',
      studentId: 'usr-student-01',
      assignedStaffId: 'usr-staff-01',
      createdAt: new Date('2026-10-22T10:30:00Z'),
      updatedAt: new Date('2026-10-23T14:20:00Z'),
    };

    const req2: MockServiceRequest = {
      id: 'req-02',
      requestNumber: 'REQ-2026-1043',
      subject: 'Elective course credit verification for final semester',
      description: 'Need clarification on whether BCA-504 (Cloud Computing) fulfills the specialization requirement for Systems & Networking track.',
      priority: 'MEDIUM',
      status: 'WAITING_FOR_STUDENT',
      serviceId: 'srv-acad-02',
      studentId: 'usr-student-01',
      assignedStaffId: 'usr-staff-02',
      createdAt: new Date('2026-10-20T08:15:00Z'),
      updatedAt: new Date('2026-10-21T11:00:00Z'),
    };

    const req3: MockServiceRequest = {
      id: 'req-03',
      requestNumber: 'REQ-2026-1044',
      subject: 'Raspberry Pi 4 kit return extension request',
      description: 'Requesting a 4-day extension on the IoT kit borrowed for the final BCA capstone prototype demonstration.',
      priority: 'LOW',
      status: 'RESOLVED',
      serviceId: 'srv-equip-05',
      studentId: 'usr-student-01',
      assignedStaffId: 'usr-staff-01',
      resolvedAt: new Date('2026-10-23T16:00:00Z'),
      createdAt: new Date('2026-10-18T14:00:00Z'),
      updatedAt: new Date('2026-10-23T16:00:00Z'),
    };

    this.requests.push(req1, req2, req3);

    // Request Comments & Status History
    this.statusHistories.push(
      {
        id: 'hist-01',
        requestId: 'req-01',
        changedById: 'usr-student-01',
        oldStatus: undefined,
        newStatus: 'SUBMITTED',
        note: 'Ticket submitted by student.',
        createdAt: new Date('2026-10-22T10:30:00Z'),
      },
      {
        id: 'hist-02',
        requestId: 'req-01',
        changedById: 'usr-staff-01',
        oldStatus: 'SUBMITTED',
        newStatus: 'IN_REVIEW',
        note: 'Investigating router logs for Access Point AP-H3-14.',
        createdAt: new Date('2026-10-23T14:20:00Z'),
      }
    );

    this.comments.push(
      {
        id: 'comm-01',
        requestId: 'req-01',
        authorId: 'usr-staff-01',
        message: 'Hello Aarav, we noticed signal degradation on AP-H3-14. Our network team has scheduled a channel reconfiguration today at 4 PM.',
        isPrivateStaffNote: false, // Student can view
        createdAt: new Date('2026-10-23T14:25:00Z'),
      },
      {
        id: 'comm-02',
        requestId: 'req-01',
        authorId: 'usr-staff-01',
        message: 'INTERNAL NOTE: Replaced PoE injector; if drops persist, replace firmware on Ubiquiti AP.',
        isPrivateStaffNote: true, // Hidden from student!
        createdAt: new Date('2026-10-23T14:30:00Z'),
      }
    );

    // Seed Appointment Slots (Upcoming slots)
    const today = new Date();
    const tomorrow10am = new Date(today);
    tomorrow10am.setDate(tomorrow10am.getDate() + 1);
    tomorrow10am.setHours(10, 0, 0, 0);

    const tomorrow11am = new Date(tomorrow10am);
    tomorrow11am.setHours(11, 0, 0, 0);

    const tomorrow2pm = new Date(today);
    tomorrow2pm.setDate(tomorrow2pm.getDate() + 1);
    tomorrow2pm.setHours(14, 0, 0, 0);

    const tomorrow3pm = new Date(tomorrow2pm);
    tomorrow3pm.setHours(15, 0, 0, 0);

    const dayAfter10am = new Date(today);
    dayAfter10am.setDate(dayAfter10am.getDate() + 2);
    dayAfter10am.setHours(10, 0, 0, 0);

    const dayAfter11am = new Date(dayAfter10am);
    dayAfter11am.setHours(11, 0, 0, 0);

    this.appointmentSlots.push(
      {
        id: 'slot-01',
        serviceId: 'srv-it-01',
        staffId: 'usr-staff-01',
        startTime: tomorrow10am,
        endTime: tomorrow11am,
        isAvailable: false, // Booked by student
        createdAt: new Date(),
      },
      {
        id: 'slot-02',
        serviceId: 'srv-it-01',
        staffId: 'usr-staff-01',
        startTime: tomorrow2pm,
        endTime: tomorrow3pm,
        isAvailable: true,
        createdAt: new Date(),
      },
      {
        id: 'slot-03',
        serviceId: 'srv-acad-02',
        staffId: 'usr-staff-02',
        startTime: dayAfter10am,
        endTime: dayAfter11am,
        isAvailable: true,
        createdAt: new Date(),
      }
    );

    // Seed Booked Appointment
    this.appointments.push({
      id: 'apt-01',
      appointmentNumber: 'APT-2026-0501',
      serviceId: 'srv-it-01',
      staffId: 'usr-staff-01',
      studentId: 'usr-student-01',
      slotId: 'slot-01',
      startTime: tomorrow10am,
      endTime: tomorrow11am,
      meetingLocation: 'Technology Block Room T-104',
      status: 'BOOKED',
      notes: 'Diagnostic check for student laptop Wi-Fi card and driver reinstall.',
      createdAt: new Date('2026-10-23T15:00:00Z'),
      updatedAt: new Date('2026-10-23T15:00:00Z'),
    });

    // Seed Notifications
    this.notifications.push(
      {
        id: 'notif-01',
        userId: 'usr-student-01',
        title: 'Request In Review',
        message: 'Your request REQ-2026-1042 has been assigned to Prof. Rajesh Kumar and is currently In Review.',
        type: 'REQUEST_UPDATE',
        link: '/requests/req-01',
        isRead: false,
        createdAt: new Date('2026-10-23T14:20:00Z'),
      },
      {
        id: 'notif-02',
        userId: 'usr-student-01',
        title: 'Appointment Confirmed',
        message: 'Your IT Support appointment APT-2026-0501 is confirmed for tomorrow at 10:00 AM.',
        type: 'APPOINTMENT_UPDATE',
        link: '/appointments',
        isRead: true,
        createdAt: new Date('2026-10-23T15:00:00Z'),
      },
      {
        id: 'notif-03',
        userId: 'usr-staff-01',
        title: 'New Service Request Assigned',
        message: 'Request REQ-2026-1042 was assigned to you.',
        type: 'REQUEST_UPDATE',
        link: '/staff/requests',
        isRead: false,
        createdAt: new Date('2026-10-22T10:35:00Z'),
      }
    );
  }
}

export const mockDb = new MockDatabase();
