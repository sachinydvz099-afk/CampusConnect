import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CampusConnect Database Seed...');

  const passwordHash = await bcrypt.hash('Campus@123', 10);

  // 1. Seed Users
  const student = await prisma.user.upsert({
    where: { email: 'student@campusconnect.edu' },
    update: {},
    create: {
      email: 'student@campusconnect.edu',
      passwordHash,
      fullName: 'Aarav Sharma',
      role: 'STUDENT',
      studentOrStaffId: 'BCA-2024-042',
      department: 'Computer Applications',
      phone: '+91 98765 43210',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@campusconnect.edu' },
    update: {},
    create: {
      email: 'staff@campusconnect.edu',
      passwordHash,
      fullName: 'Prof. Rajesh Kumar',
      role: 'STAFF',
      studentOrStaffId: 'STF-ENG-108',
      department: 'IT & Infrastructure Support',
      phone: '+91 98111 22334',
    },
  });

  const advisor = await prisma.user.upsert({
    where: { email: 'advisor@campusconnect.edu' },
    update: {},
    create: {
      email: 'advisor@campusconnect.edu',
      passwordHash,
      fullName: 'Dr. Priya Mehta',
      role: 'STAFF',
      studentOrStaffId: 'STF-ACA-204',
      department: 'Academic Advising & Guidance',
      phone: '+91 98222 33445',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusconnect.edu' },
    update: {},
    create: {
      email: 'admin@campusconnect.edu',
      passwordHash,
      fullName: 'Dean of Student Welfare (Admin)',
      role: 'ADMIN',
      studentOrStaffId: 'ADM-DIR-001',
      department: 'Office of Campus Administration',
      phone: '+91 98333 44556',
    },
  });

  console.log('✅ Users seeded: Student, Staff, Advisor, Admin');

  // 2. Seed Services
  const itService = await prisma.service.create({
    data: {
      name: 'IT Support & Wi-Fi Services',
      category: 'Technology',
      description: 'Assistance with campus Wi-Fi access, student portal authentication, software licenses, lab PCs, and campus email configuration.',
      location: 'Technology Block, Ground Floor, Room T-104',
      hours: 'Monday to Friday: 8:30 AM – 5:30 PM',
      contactEmail: 'itsupport@campusconnect.edu',
      contactPhone: '+91 80 2345 6701',
      isActive: true,
    },
  });

  const acadService = await prisma.service.create({
    data: {
      name: 'Academic Advising & Mentorship',
      category: 'Academics',
      description: 'Comprehensive academic guidance, course selection advice, credit transfer inquiries, graduation audit reviews, and peer mentor pairing.',
      location: 'Main Administrative Building, 2nd Floor, Room A-212',
      hours: 'Monday to Friday: 9:00 AM – 4:30 PM',
      contactEmail: 'advising@campusconnect.edu',
      contactPhone: '+91 80 2345 6702',
      isActive: true,
    },
  });

  const libService = await prisma.service.create({
    data: {
      name: 'Central Library Assistance & Research',
      category: 'Library',
      description: 'Digital journal database access (IEEE, JSTOR, Springer), book reservations, inter-library book loans, thesis formatting, and study pod bookings.',
      location: 'Central Knowledge Center (Library Building)',
      hours: 'Monday to Saturday: 8:00 AM – 9:00 PM',
      contactEmail: 'library@campusconnect.edu',
      contactPhone: '+91 80 2345 6703',
      isActive: true,
    },
  });

  const counselService = await prisma.service.create({
    data: {
      name: 'Student Counseling & Mental Wellbeing',
      category: 'Counseling',
      description: 'Confidential psychological counseling, academic stress management, career anxiety support, and personal development workshops.',
      location: 'Student Health & Wellness Pavilion, Room W-102',
      hours: 'Monday to Friday: 10:00 AM – 6:00 PM',
      contactEmail: 'wellbeing@campusconnect.edu',
      contactPhone: '+91 80 2345 6704',
      isActive: true,
    },
  });

  const equipService = await prisma.service.create({
    data: {
      name: 'Lab Equipment & Electronics Loan',
      category: 'Equipment Loans',
      description: 'Short-term checkout of IoT kits (Arduino, Raspberry Pi), VR headsets, project oscilloscopes, DSLR cameras, and high-spec loaner laptops.',
      location: 'Makerspace & Innovation Lab, Room M-01',
      hours: 'Monday to Friday: 10:00 AM – 4:00 PM',
      contactEmail: 'labloans@campusconnect.edu',
      contactPhone: '+91 80 2345 6705',
      isActive: true,
    },
  });

  const careerService = await prisma.service.create({
    data: {
      name: 'Career Guidance & Placement Cell',
      category: 'Career Services',
      description: 'Resume reviews, mock technical and HR interviews, campus placement registrations, summer internship listings, and corporate networking.',
      location: 'Corporate Relations Wing, 3rd Floor, Room C-301',
      hours: 'Monday to Friday: 9:30 AM – 5:00 PM',
      contactEmail: 'placements@campusconnect.edu',
      contactPhone: '+91 80 2345 6706',
      isActive: true,
    },
  });

  console.log('✅ Services seeded: 6 campus departments');

  // 3. Assign Staff
  await prisma.serviceStaff.createMany({
    data: [
      { serviceId: itService.id, userId: staff.id, roleTitle: 'Senior Systems Engineer' },
      { serviceId: acadService.id, userId: advisor.id, roleTitle: 'Lead Academic Counselor' },
    ],
  });

  console.log('✅ Service staff assigned');

  // 4. Seed Requests & Comments
  const req1 = await prisma.serviceRequest.create({
    data: {
      requestNumber: 'REQ-2026-1042',
      subject: 'Hostel Block 3 Wi-Fi dropping frequently',
      description: 'The Wi-Fi access point near Room 314 disconnects every 15 minutes, making it difficult to attend virtual project seminars.',
      priority: 'HIGH',
      status: 'IN_REVIEW',
      serviceId: itService.id,
      studentId: student.id,
      assignedStaffId: staff.id,
    },
  });

  await prisma.requestStatusHistory.create({
    data: {
      requestId: req1.id,
      changedById: staff.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'IN_REVIEW',
      note: 'Investigating router logs for Access Point AP-H3-14.',
    },
  });

  await prisma.requestComment.createMany({
    data: [
      {
        requestId: req1.id,
        authorId: staff.id,
        message: 'Hello Aarav, our network team has scheduled a channel reconfiguration today at 4 PM.',
        isPrivateStaffNote: false,
      },
      {
        requestId: req1.id,
        authorId: staff.id,
        message: 'INTERNAL NOTE: Replaced PoE injector; check logs if drops persist.',
        isPrivateStaffNote: true, // Hidden from students
      },
    ],
  });

  console.log('✅ Requests, history, and comments seeded');
  console.log('🎉 Seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
