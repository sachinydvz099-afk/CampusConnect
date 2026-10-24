import {
  User,
  Service,
  ServiceRequest,
  Appointment,
  AppointmentSlot,
  NotificationItem,
  DashboardMetrics,
  UserRole,
} from '../types/index.js';

// Read API URL strictly from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('campusconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------------------------------------------------
// IN-MEMORY / LOCALSTORAGE FALLBACK ENGINE (For standalone GitHub Pages demo)
// -------------------------------------------------------------
const STORAGE_PREFIX = 'campusconnect_db_';

function getStorage<T>(key: string, initial: T): T {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : initial;
  } catch {
    return initial;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Initial seed data for fallback
const INITIAL_USERS: User[] = [
  {
    id: 'usr-student-01',
    email: 'student@campusconnect.edu',
    fullName: 'Aarav Sharma',
    role: 'STUDENT',
    studentOrStaffId: 'BCA-2024-042',
    department: 'Computer Applications',
    phone: '+91 98765 43210',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-staff-01',
    email: 'staff@campusconnect.edu',
    fullName: 'Prof. Rajesh Kumar',
    role: 'STAFF',
    studentOrStaffId: 'STF-ENG-108',
    department: 'IT & Infrastructure Support',
    phone: '+91 98111 22334',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-admin-01',
    email: 'admin@campusconnect.edu',
    fullName: 'Dean of Student Welfare (Admin)',
    role: 'ADMIN',
    studentOrStaffId: 'ADM-DIR-001',
    department: 'Office of Campus Administration',
    phone: '+91 98333 44556',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-it-01',
    name: 'IT Support & Campus Wi-Fi',
    category: 'Technology',
    description: 'Assistance with campus Wi-Fi access, student portal authentication, software licenses, lab PCs, and campus email configuration.',
    location: 'Technology Block, Ground Floor, Room T-104',
    hours: 'Monday to Friday: 8:30 AM – 5:30 PM',
    contactEmail: 'itsupport@campusconnect.edu',
    contactPhone: '+91 80 2345 6701',
    isActive: true,
    totalRequests: 14,
    availableSlotsCount: 4,
    staff: [{ id: 'usr-staff-01', fullName: 'Prof. Rajesh Kumar', roleTitle: 'Senior Systems Engineer' }],
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
    totalRequests: 9,
    availableSlotsCount: 6,
    staff: [{ id: 'usr-staff-02', fullName: 'Dr. Priya Mehta', roleTitle: 'Lead Academic Counselor' }],
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
    totalRequests: 6,
    availableSlotsCount: 8,
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
    totalRequests: 4,
    availableSlotsCount: 3,
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
    totalRequests: 8,
    availableSlotsCount: 5,
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
    totalRequests: 11,
    availableSlotsCount: 7,
  },
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-01',
    requestNumber: 'REQ-2026-1042',
    subject: 'Hostel Block 3 Wi-Fi dropping frequently',
    description: 'The Wi-Fi access point near Room 314 disconnects every 15 minutes, making it difficult to attend virtual project seminars.',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    serviceId: 'srv-it-01',
    serviceName: 'IT Support & Campus Wi-Fi',
    serviceCategory: 'Technology',
    studentId: 'usr-student-01',
    studentName: 'Aarav Sharma',
    studentIdNumber: 'BCA-2024-042',
    assignedStaffId: 'usr-staff-01',
    assignedStaffName: 'Prof. Rajesh Kumar',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    statusHistory: [
      {
        id: 'hist-1',
        requestId: 'req-01',
        changedById: 'usr-student-01',
        changedByName: 'Aarav Sharma',
        changedByRole: 'STUDENT',
        newStatus: 'SUBMITTED',
        note: 'Ticket submitted by student.',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        id: 'hist-2',
        requestId: 'req-01',
        changedById: 'usr-staff-01',
        changedByName: 'Prof. Rajesh Kumar',
        changedByRole: 'STAFF',
        oldStatus: 'SUBMITTED',
        newStatus: 'IN_REVIEW',
        note: 'Investigating router logs for Access Point AP-H3-14.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
    comments: [
      {
        id: 'comm-1',
        requestId: 'req-01',
        authorId: 'usr-staff-01',
        authorName: 'Prof. Rajesh Kumar',
        authorRole: 'STAFF',
        message: 'Hello Aarav, we observed packet loss on the hostel AP switch. Our network technician will check the cable connector this afternoon.',
        isPrivateStaffNote: false,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'comm-2',
        requestId: 'req-01',
        authorId: 'usr-staff-01',
        authorName: 'Prof. Rajesh Kumar',
        authorRole: 'STAFF',
        message: 'INTERNAL NOTE: If switch port re-crimping does not resolve issue, replace AP with spare Cisco unit.',
        isPrivateStaffNote: true, // Hidden from students
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'req-02',
    requestNumber: 'REQ-2026-1043',
    subject: 'Elective course credit verification for final semester',
    description: 'Need clarification on whether BCA-504 (Cloud Computing) fulfills the specialization requirement for Systems & Networking track.',
    priority: 'MEDIUM',
    status: 'WAITING_FOR_STUDENT',
    serviceId: 'srv-acad-02',
    serviceName: 'Academic Advising & Mentorship',
    serviceCategory: 'Academics',
    studentId: 'usr-student-01',
    studentName: 'Aarav Sharma',
    studentIdNumber: 'BCA-2024-042',
    assignedStaffId: 'usr-staff-01',
    assignedStaffName: 'Prof. Rajesh Kumar',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    statusHistory: [
      {
        id: 'hist-3',
        requestId: 'req-02',
        changedById: 'usr-student-01',
        changedByName: 'Aarav Sharma',
        changedByRole: 'STUDENT',
        newStatus: 'SUBMITTED',
        note: 'Course verification submitted.',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      },
    ],
    comments: [
      {
        id: 'comm-3',
        requestId: 'req-02',
        authorId: 'usr-staff-01',
        authorName: 'Prof. Rajesh Kumar',
        authorRole: 'STAFF',
        message: 'Please attach your semester 4 grade card so we can verify the prerequisite requirements.',
        isPrivateStaffNote: false,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'req-03',
    requestNumber: 'REQ-2026-1044',
    subject: 'Raspberry Pi 4 kit return extension request',
    description: 'Requesting a 4-day extension on the IoT kit borrowed for the final BCA capstone prototype demonstration.',
    priority: 'LOW',
    status: 'RESOLVED',
    serviceId: 'srv-equip-05',
    serviceName: 'Lab Equipment & Electronics Loan',
    serviceCategory: 'Equipment Loans',
    studentId: 'usr-student-01',
    studentName: 'Aarav Sharma',
    studentIdNumber: 'BCA-2024-042',
    assignedStaffId: 'usr-staff-01',
    assignedStaffName: 'Prof. Rajesh Kumar',
    resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    statusHistory: [
      {
        id: 'hist-4',
        requestId: 'req-03',
        changedById: 'usr-staff-01',
        changedByName: 'Prof. Rajesh Kumar',
        changedByRole: 'STAFF',
        oldStatus: 'SUBMITTED',
        newStatus: 'RESOLVED',
        note: 'Extension approved until Friday 4 PM.',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ],
    comments: [],
  },
];

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
tomorrowDate.setHours(10, 0, 0, 0);

const tomorrowEndDate = new Date(tomorrowDate);
tomorrowEndDate.setHours(11, 0, 0, 0);

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-01',
    appointmentNumber: 'APT-2026-0501',
    serviceId: 'srv-it-01',
    serviceName: 'IT Support & Campus Wi-Fi',
    serviceLocation: 'Technology Block, Ground Floor, Room T-104',
    staffId: 'usr-staff-01',
    staffName: 'Prof. Rajesh Kumar',
    staffDepartment: 'IT & Infrastructure Support',
    studentId: 'usr-student-01',
    studentName: 'Aarav Sharma',
    studentIdNumber: 'BCA-2024-042',
    startTime: tomorrowDate.toISOString(),
    endTime: tomorrowEndDate.toISOString(),
    meetingLocation: 'Technology Block Room T-104',
    status: 'BOOKED',
    notes: 'Diagnostic check for laptop Wi-Fi driver and student VPN profile.',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    userId: 'usr-student-01',
    title: 'Request In Review',
    message: 'Your request REQ-2026-1042 has been assigned to Prof. Rajesh Kumar and is currently In Review.',
    type: 'REQUEST_UPDATE',
    link: '/requests/req-01',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-02',
    userId: 'usr-student-01',
    title: 'Appointment Confirmed',
    message: 'Your IT Support appointment APT-2026-0501 is confirmed for tomorrow at 10:00 AM.',
    type: 'APPOINTMENT_UPDATE',
    link: '/appointments',
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-03',
    userId: 'usr-staff-01',
    title: 'New Service Request Assigned',
    message: 'Request REQ-2026-1042 was assigned to you.',
    type: 'REQUEST_UPDATE',
    link: '/staff/requests',
    isRead: false,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

// -------------------------------------------------------------
// API CLIENT
// -------------------------------------------------------------
export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('campusconnect_token', data.data.token);
        localStorage.setItem('campusconnect_user', JSON.stringify(data.data.user));
        return data.data;
      } catch (err: any) {
        if (!err.message?.includes('Failed to fetch')) throw err;
      }
    }

    // In-Memory Fallback
    const users = getStorage<User[]>('users', INITIAL_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid email or password.');
    const token = `demo-token-${user.id}-${Date.now()}`;
    localStorage.setItem('campusconnect_token', token);
    localStorage.setItem('campusconnect_user', JSON.stringify(user));
    return { user, token };
  },

  async demoLogin(role: UserRole): Promise<{ user: User; token: string }> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/auth/demo-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('campusconnect_token', data.data.token);
          localStorage.setItem('campusconnect_user', JSON.stringify(data.data.user));
          return data.data;
        }
      } catch {
        // Fallback below
      }
    }

    const users = getStorage<User[]>('users', INITIAL_USERS);
    const user = users.find(u => u.role === role) || users[0];
    const token = `demo-token-${user.id}-${Date.now()}`;
    localStorage.setItem('campusconnect_token', token);
    localStorage.setItem('campusconnect_user', JSON.stringify(user));
    return { user, token };
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    studentOrStaffId: string;
    department: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        localStorage.setItem('campusconnect_token', data.data.token);
        localStorage.setItem('campusconnect_user', JSON.stringify(data.data.user));
        return data.data;
      } catch (err: any) {
        if (!err.message?.includes('Failed to fetch')) throw err;
      }
    }

    const users = getStorage<User[]>('users', INITIAL_USERS);
    if (users.some(u => u.email === payload.email || u.studentOrStaffId === payload.studentOrStaffId)) {
      throw new Error('An account with this email or Student ID already exists.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: payload.email,
      fullName: payload.fullName,
      role: 'STUDENT',
      studentOrStaffId: payload.studentOrStaffId,
      department: payload.department,
      phone: payload.phone || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorage('users', users);

    const token = `demo-token-${newUser.id}-${Date.now()}`;
    localStorage.setItem('campusconnect_token', token);
    localStorage.setItem('campusconnect_user', JSON.stringify(newUser));
    return { user: newUser, token };
  },

  async getCurrentUser(): Promise<User> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.user;
        }
      } catch {}
    }

    const cached = localStorage.getItem('campusconnect_user');
    if (cached) return JSON.parse(cached);
    return INITIAL_USERS[0];
  },

  async updateProfile(payload: { fullName?: string; department?: string; phone?: string }): Promise<User> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('campusconnect_user', JSON.stringify(data.data.user));
          return data.data.user;
        }
      } catch {}
    }

    const users = getStorage<User[]>('users', INITIAL_USERS);
    const cached = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const index = users.findIndex(u => u.id === cached.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...payload };
      setStorage('users', users);
      localStorage.setItem('campusconnect_user', JSON.stringify(users[index]));
      return users[index];
    }
    return cached;
  },

  // Services
  async getServices(params?: { search?: string; category?: string; includeInactive?: boolean }): Promise<Service[]> {
    if (BASE_URL) {
      try {
        const url = new URL(`${BASE_URL}/services`);
        if (params?.search) url.searchParams.set('search', params.search);
        if (params?.category) url.searchParams.set('category', params.category);
        if (params?.includeInactive) url.searchParams.set('includeInactive', 'true');
        const res = await fetch(url.toString(), { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data.services;
        }
      } catch {}
    }

    let services = getStorage<Service[]>('services', INITIAL_SERVICES);
    if (!params?.includeInactive) {
      services = services.filter(s => s.isActive);
    }
    if (params?.category && params.category !== 'ALL') {
      services = services.filter(s => s.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      services = services.filter(
        s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    return services;
  },

  async getServiceById(id: string): Promise<Service> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/services/${id}`, { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data.service;
        }
      } catch {}
    }

    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const service = services.find(s => s.id === id);
    if (!service) throw new Error('Service not found');
    return service;
  },

  async createService(payload: Omit<Service, 'id' | 'isActive'>): Promise<Service> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.service;
        }
      } catch {}
    }

    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const newService: Service = {
      ...payload,
      id: `srv-${Date.now()}`,
      isActive: true,
      totalRequests: 0,
      availableSlotsCount: 5,
    };
    services.push(newService);
    setStorage('services', services);
    return newService;
  },

  async updateService(id: string, payload: Partial<Service>): Promise<Service> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.service;
        }
      } catch {}
    }

    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const index = services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    services[index] = { ...services[index], ...payload };
    setStorage('services', services);
    return services[index];
  },

  async deleteOrDeactivateService(id: string): Promise<{ service: Service; action: string }> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/services/${id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
        if (res.ok) return await res.json();
      } catch {}
    }

    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const index = services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    // Soft deactivate for data integrity
    services[index].isActive = false;
    setStorage('services', services);
    return { service: services[index], action: 'DEACTIVATED' };
  },

  // Service Requests
  async getRequests(params?: { status?: string; priority?: string; serviceId?: string; search?: string }): Promise<ServiceRequest[]> {
    if (BASE_URL) {
      try {
        const url = new URL(`${BASE_URL}/requests`);
        if (params?.status) url.searchParams.set('status', params.status);
        if (params?.priority) url.searchParams.set('priority', params.priority);
        if (params?.serviceId) url.searchParams.set('serviceId', params.serviceId);
        if (params?.search) url.searchParams.set('search', params.search);
        const res = await fetch(url.toString(), { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data.requests;
        }
      } catch {}
    }

    let requests = getStorage<ServiceRequest[]>('requests', INITIAL_REQUESTS);
    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');

    // Role filtering: Student sees only their own
    if (currentUser.role === 'STUDENT') {
      requests = requests.filter(r => r.studentId === currentUser.id);
    }

    if (params?.status && params.status !== 'ALL') {
      requests = requests.filter(r => r.status === params.status);
    }
    if (params?.priority && params.priority !== 'ALL') {
      requests = requests.filter(r => r.priority === params.priority);
    }
    if (params?.serviceId && params.serviceId !== 'ALL') {
      requests = requests.filter(r => r.serviceId === params.serviceId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      requests = requests.filter(
        r => r.requestNumber.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }

    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getRequestById(id: string): Promise<ServiceRequest> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/requests/${id}`, { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data.request;
        }
      } catch {}
    }

    const requests = getStorage<ServiceRequest[]>('requests', INITIAL_REQUESTS);
    const req = requests.find(r => r.id === id || r.requestNumber === id);
    if (!req) throw new Error('Service request not found.');

    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    if (currentUser.role === 'STUDENT' && req.studentId !== currentUser.id) {
      throw new Error('Access denied. You can only view your own requests.');
    }

    // Filter private notes for student
    const sanitizedComments = (req.comments || []).filter(c => {
      if (currentUser.role === 'STUDENT') return !c.isPrivateStaffNote;
      return true;
    });

    return { ...req, comments: sanitizedComments };
  },

  async createRequest(payload: {
    serviceId: string;
    subject: string;
    description: string;
    priority: string;
    attachmentUrl?: string;
  }): Promise<ServiceRequest> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.request;
        }
      } catch {}
    }

    const requests = getStorage<ServiceRequest[]>('requests', INITIAL_REQUESTS);
    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const service = services.find(s => s.id === payload.serviceId);

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const requestNumber = `REQ-${year}-${random}`;

    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      requestNumber,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority as any,
      status: 'SUBMITTED',
      serviceId: payload.serviceId,
      serviceName: service?.name || 'Campus Service',
      serviceCategory: service?.category || 'General',
      studentId: currentUser.id || 'usr-student-01',
      studentName: currentUser.fullName || 'Aarav Sharma',
      studentIdNumber: currentUser.studentOrStaffId || 'BCA-2024-042',
      attachmentUrl: payload.attachmentUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          requestId: `req-${Date.now()}`,
          changedById: currentUser.id,
          changedByName: currentUser.fullName,
          changedByRole: currentUser.role,
          newStatus: 'SUBMITTED',
          note: 'Request submitted by student.',
          createdAt: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    requests.unshift(newRequest);
    setStorage('requests', requests);

    // Add in-app notification
    const notifications = getStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Request Submitted Successfully',
      message: `Your request ${requestNumber} for ${service?.name} has been received.`,
      type: 'REQUEST_UPDATE',
      link: `/requests/${newRequest.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStorage('notifications', notifications);

    return newRequest;
  },

  async updateRequestStatus(id: string, status: string, note?: string): Promise<ServiceRequest> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ status, note }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.request;
        }
      } catch {}
    }

    const requests = getStorage<ServiceRequest[]>('requests', INITIAL_REQUESTS);
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const oldStatus = requests[index].status;
    requests[index].status = status as any;
    requests[index].updatedAt = new Date().toISOString();

    if (status === 'RESOLVED') requests[index].resolvedAt = new Date().toISOString();
    if (status === 'CLOSED') requests[index].closedAt = new Date().toISOString();

    requests[index].statusHistory = requests[index].statusHistory || [];
    requests[index].statusHistory!.push({
      id: `hist-${Date.now()}`,
      requestId: id,
      changedById: currentUser.id,
      changedByName: currentUser.fullName,
      changedByRole: currentUser.role,
      oldStatus,
      newStatus: status as any,
      note: note || `Status updated from ${oldStatus} to ${status}`,
      createdAt: new Date().toISOString(),
    });

    setStorage('requests', requests);
    return requests[index];
  },

  async addRequestComment(id: string, message: string, isPrivateStaffNote = false): Promise<any> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/requests/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ message, isPrivateStaffNote }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.comment;
        }
      } catch {}
    }

    const requests = getStorage<ServiceRequest[]>('requests', INITIAL_REQUESTS);
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const privateFlag = currentUser.role === 'STUDENT' ? false : isPrivateStaffNote;

    const newComment = {
      id: `comm-${Date.now()}`,
      requestId: id,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      message,
      isPrivateStaffNote: privateFlag,
      createdAt: new Date().toISOString(),
    };

    requests[index].comments = requests[index].comments || [];
    requests[index].comments!.push(newComment);
    requests[index].updatedAt = new Date().toISOString();
    setStorage('requests', requests);

    return newComment;
  },

  // Appointments
  async getAppointments(params?: { status?: string; timeframe?: string }): Promise<Appointment[]> {
    if (BASE_URL) {
      try {
        const url = new URL(`${BASE_URL}/appointments`);
        if (params?.status) url.searchParams.set('status', params.status);
        if (params?.timeframe) url.searchParams.set('timeframe', params.timeframe);
        const res = await fetch(url.toString(), { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data.appointments;
        }
      } catch {}
    }

    let appointments = getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');

    if (currentUser.role === 'STUDENT') {
      appointments = appointments.filter(a => a.studentId === currentUser.id);
    } else if (currentUser.role === 'STAFF') {
      appointments = appointments.filter(a => a.staffId === currentUser.id);
    }

    if (params?.status && params.status !== 'ALL') {
      appointments = appointments.filter(a => a.status === params.status);
    }

    return appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  },

  async bookAppointment(payload: {
    serviceId: string;
    staffId: string;
    startTime: string;
    endTime: string;
    meetingLocation: string;
    notes?: string;
  }): Promise<Appointment> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/appointments/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Booking conflict detected.');
        return data.data.appointment;
      } catch (err: any) {
        if (!err.message?.includes('Failed to fetch')) throw err;
      }
    }

    const appointments = getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const users = getStorage<User[]>('users', INITIAL_USERS);

    const start = new Date(payload.startTime);
    const end = new Date(payload.endTime);

    // Double-booking check
    const conflict = appointments.some(
      a =>
        a.status === 'BOOKED' &&
        (a.staffId === payload.staffId || a.studentId === currentUser.id) &&
        ((start >= new Date(a.startTime) && start < new Date(a.endTime)) ||
          (end > new Date(a.startTime) && end <= new Date(a.endTime)))
    );

    if (conflict) {
      throw new Error('Conflict detected: You or the staff member already have an active appointment scheduled during this time slot.');
    }

    const service = services.find(s => s.id === payload.serviceId);
    const staff = users.find(u => u.id === payload.staffId);

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const appointmentNumber = `APT-${year}-${random}`;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      appointmentNumber,
      serviceId: payload.serviceId,
      serviceName: service?.name || 'Service',
      serviceLocation: service?.location || '',
      staffId: payload.staffId,
      staffName: staff?.fullName || 'Prof. Rajesh Kumar',
      staffDepartment: staff?.department || 'Support',
      studentId: currentUser.id || 'usr-student-01',
      studentName: currentUser.fullName || 'Aarav Sharma',
      studentIdNumber: currentUser.studentOrStaffId || 'BCA-2024-042',
      startTime: payload.startTime,
      endTime: payload.endTime,
      meetingLocation: payload.meetingLocation,
      status: 'BOOKED',
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    setStorage('appointments', appointments);

    // Add Notification
    const notifications = getStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Appointment Booked',
      message: `Your appointment ${appointmentNumber} with ${staff?.fullName} is confirmed.`,
      type: 'APPOINTMENT_UPDATE',
      link: '/appointments',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStorage('notifications', notifications);

    return newAppointment;
  },

  async cancelAppointment(id: string, reason: string): Promise<Appointment> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ reason }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.appointment;
        }
      } catch {}
    }

    const appointments = getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    appointments[index].status = 'CANCELLED';
    appointments[index].cancelledReason = reason;
    setStorage('appointments', appointments);
    return appointments[index];
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/notifications`, { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data;
        }
      } catch {}
    }

    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const all = getStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    const userNotifs = all.filter(n => n.userId === currentUser.id);
    const unreadCount = userNotifs.filter(n => !n.isRead).length;
    return { notifications: userNotifs, unreadCount };
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (BASE_URL) {
      try {
        await fetch(`${BASE_URL}/notifications/${id}/read`, {
          method: 'PUT',
          headers: getAuthHeader(),
        });
      } catch {}
    }

    const all = getStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    const item = all.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      setStorage('notifications', all);
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    if (BASE_URL) {
      try {
        await fetch(`${BASE_URL}/notifications/mark-all-read`, {
          method: 'PUT',
          headers: getAuthHeader(),
        });
      } catch {}
    }

    const currentUser: User = JSON.parse(localStorage.getItem('campusconnect_user') || '{}');
    const all = getStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    all.forEach(n => {
      if (n.userId === currentUser.id) n.isRead = true;
    });
    setStorage('notifications', all);
  },

  // Admin Reports & Metrics
  async getReportsMetrics(): Promise<{
    metrics: DashboardMetrics;
    requestsByService: Array<{ serviceName: string; category: string; count: number; percentage: number }>;
    requestsByStatus: Array<{ status: string; count: number }>;
    requestsByPriority: Array<{ priority: string; count: number }>;
  }> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/reports/metrics`, { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data;
        }
      } catch {}
    }

    const requests = getStorage<ServiceRequest[]>('requests', INITIAL_REQUESTS);
    const appointments = getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const services = getStorage<Service[]>('services', INITIAL_SERVICES);
    const users = getStorage<User[]>('users', INITIAL_USERS);

    const totalRequests = requests.length;
    const openRequests = requests.filter(r => r.status !== 'RESOLVED' && r.status !== 'CLOSED').length;
    const resolvedRequests = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

    const requestsByService = services.map(s => {
      const count = requests.filter(r => r.serviceId === s.id).length;
      return {
        serviceName: s.name,
        category: s.category,
        count,
        percentage: totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0,
      };
    });

    const requestsByStatus = [
      { status: 'SUBMITTED', count: requests.filter(r => r.status === 'SUBMITTED').length },
      { status: 'IN_REVIEW', count: requests.filter(r => r.status === 'IN_REVIEW').length },
      { status: 'ASSIGNED', count: requests.filter(r => r.status === 'ASSIGNED').length },
      { status: 'WAITING_FOR_STUDENT', count: requests.filter(r => r.status === 'WAITING_FOR_STUDENT').length },
      { status: 'RESOLVED', count: requests.filter(r => r.status === 'RESOLVED').length },
      { status: 'CLOSED', count: requests.filter(r => r.status === 'CLOSED').length },
    ];

    const requestsByPriority = [
      { priority: 'LOW', count: requests.filter(r => r.priority === 'LOW').length },
      { priority: 'MEDIUM', count: requests.filter(r => r.priority === 'MEDIUM').length },
      { priority: 'HIGH', count: requests.filter(r => r.priority === 'HIGH').length },
      { priority: 'URGENT', count: requests.filter(r => r.priority === 'URGENT').length },
    ];

    return {
      metrics: {
        totalRequests,
        openRequests,
        resolvedRequests,
        avgResolutionHours: 14.5,
        totalAppointments: appointments.length,
        bookedAppointments: appointments.filter(a => a.status === 'BOOKED').length,
        completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelledAppointments: appointments.filter(a => a.status === 'CANCELLED').length,
        noShowAppointments: appointments.filter(a => a.status === 'NO_SHOW').length,
        totalUsers: users.length,
        totalServices: services.length,
      },
      requestsByService,
      requestsByStatus,
      requestsByPriority,
    };
  },

  // Admin Users
  async getUsers(params?: { role?: string; search?: string }): Promise<User[]> {
    if (BASE_URL) {
      try {
        const url = new URL(`${BASE_URL}/users`);
        if (params?.role) url.searchParams.set('role', params.role);
        if (params?.search) url.searchParams.set('search', params.search);
        const res = await fetch(url.toString(), { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          return data.data.users;
        }
      } catch {}
    }

    let users = getStorage<User[]>('users', INITIAL_USERS);
    if (params?.role && params.role !== 'ALL') {
      users = users.filter(u => u.role === params.role);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      users = users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return users;
  },

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ role }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.user;
        }
      } catch {}
    }

    const users = getStorage<User[]>('users', INITIAL_USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    users[index].role = role;
    setStorage('users', users);
    return users[index];
  },

  async toggleUserStatus(userId: string): Promise<User> {
    if (BASE_URL) {
      try {
        const res = await fetch(`${BASE_URL}/users/${userId}/status`, {
          method: 'PUT',
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          return data.data.user;
        }
      } catch {}
    }

    const users = getStorage<User[]>('users', INITIAL_USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    users[index].isActive = !users[index].isActive;
    setStorage('users', users);
    return users[index];
  },
};
