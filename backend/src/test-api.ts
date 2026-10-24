import app from './index.js';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting CampusConnect Backend Automated Test Suite...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Health check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    if (healthRes.status !== 'online') throw new Error('Health check failed');
    console.log('   ✅ Health check passed: status = online');

    // 2. Demo Student Login
    console.log('2️⃣ Testing Demo Student Login...');
    const studentLogin = await fetch(`${baseUrl}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'STUDENT' }),
    }).then(r => r.json());
    if (!studentLogin.success || !studentLogin.data?.token) throw new Error('Student login failed');
    const studentToken = studentLogin.data.token;
    console.log(`   ✅ Signed in as: ${studentLogin.data.user.fullName} (${studentLogin.data.user.role})`);

    // 3. Demo Staff Login
    console.log('3️⃣ Testing Demo Staff Login...');
    const staffLogin = await fetch(`${baseUrl}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'STAFF' }),
    }).then(r => r.json());
    if (!staffLogin.success || !staffLogin.data?.token) throw new Error('Staff login failed');
    const staffToken = staffLogin.data.token;
    console.log(`   ✅ Signed in as: ${staffLogin.data.user.fullName} (${staffLogin.data.user.role})`);

    // 4. Demo Admin Login
    console.log('4️⃣ Testing Demo Admin Login...');
    const adminLogin = await fetch(`${baseUrl}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    }).then(r => r.json());
    if (!adminLogin.success || !adminLogin.data?.token) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;
    console.log(`   ✅ Signed in as: ${adminLogin.data.user.fullName} (${adminLogin.data.user.role})`);

    // 5. Get Services Directory
    console.log('5️⃣ Testing Services Directory...');
    const servicesRes = await fetch(`${baseUrl}/services`).then(r => r.json());
    if (!servicesRes.success || servicesRes.data.services.length < 5) throw new Error('Failed to fetch services');
    console.log(`   ✅ Retrieved ${servicesRes.data.services.length} active campus services`);
    const itService = servicesRes.data.services.find((s: any) => s.category === 'Technology');

    // 6. Submit a Service Request
    console.log('6️⃣ Testing Student Request Submission...');
    const submitRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        serviceId: itService.id,
        subject: 'Automated Test: Projector in BCA Lab not turning on',
        description: 'During morning lab session, the Epson overhead projector HDMI port gives no signal.',
        priority: 'HIGH',
      }),
    }).then(r => r.json());
    if (!submitRes.success || !submitRes.data?.request?.requestNumber) throw new Error('Request submission failed');
    const newRequestId = submitRes.data.request.id;
    const ticketNo = submitRes.data.request.requestNumber;
    console.log(`   ✅ Created ticket: ${ticketNo}`);

    // 7. Verify Note Privacy (Private staff note hidden from student)
    console.log('7️⃣ Testing Note Privacy Rule (Staff Note vs Student Visibility)...');
    // Staff adds public reply
    await fetch(`${baseUrl}/requests/${newRequestId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        message: 'Hello, our lab assistant has been dispatched to check the cable.',
        isPrivateStaffNote: false,
      }),
    });

    // Staff adds private note
    await fetch(`${baseUrl}/requests/${newRequestId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        message: 'SECRET INTERNAL: Projector bulb near end-of-life cycle.',
        isPrivateStaffNote: true,
      }),
    });

    // Student fetches the ticket: MUST NOT SEE private note
    const studentView = await fetch(`${baseUrl}/requests/${newRequestId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    }).then(r => r.json());
    const studentVisibleNotes = studentView.data.request.comments;
    const hasSecretInStudentView = studentVisibleNotes.some((c: any) => c.isPrivateStaffNote === true || c.message.includes('SECRET'));
    if (hasSecretInStudentView) throw new Error('SECURITY VIOLATION: Private staff note leaked to student!');
    console.log(`   ✅ Security verified: Student sees ${studentVisibleNotes.length} public comment(s), private staff notes completely withheld.`);

    // Staff fetches the ticket: MUST SEE all notes
    const staffView = await fetch(`${baseUrl}/requests/${newRequestId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    }).then(r => r.json());
    if (staffView.data.request.comments.length < 2) throw new Error('Staff could not view internal notes');
    console.log(`   ✅ Staff verified: Staff views full thread including internal staff notes.`);

    // 8. Test Double-Booking Prevention
    console.log('8️⃣ Testing Appointment Concurrency & Double-Booking Protection...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    tomorrow.setHours(14, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(15, 0, 0, 0);

    // First booking should succeed
    const booking1 = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        serviceId: itService.id,
        staffId: 'usr-staff-01',
        startTime: tomorrow.toISOString(),
        endTime: tomorrowEnd.toISOString(),
        meetingLocation: 'Room T-104',
        notes: 'Checking lab permissions',
      }),
    }).then(r => r.json());
    if (!booking1.success) throw new Error('First appointment booking failed');
    console.log(`   ✅ First booking succeeded: ${booking1.data.appointment.appointmentNumber}`);

    // Second booking for same time conflict MUST be rejected with 409 Conflict
    const booking2 = await fetch(`${baseUrl}/appointments/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        serviceId: itService.id,
        staffId: 'usr-staff-01',
        startTime: tomorrow.toISOString(),
        endTime: tomorrowEnd.toISOString(),
        meetingLocation: 'Room T-104',
      }),
    });
    if (booking2.status !== 409) throw new Error(`Double booking was not prevented! Expected 409, got ${booking2.status}`);
    console.log('   ✅ Double booking successfully prevented by backend with 409 Conflict status!');

    // 9. Test Admin Reports & Metrics
    console.log('9️⃣ Testing Admin Reports & Analytics Metrics...');
    const reportsRes = await fetch(`${baseUrl}/reports/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());
    if (!reportsRes.success || !reportsRes.data.metrics) throw new Error('Failed to get admin reports');
    console.log(`   ✅ Metrics verified: Total requests = ${reportsRes.data.metrics.totalRequests}, Avg resolution = ${reportsRes.data.metrics.avgResolutionHours} hrs`);

    console.log('\n🎉 ALL BACKEND API TESTS PASSED WITH 100% SUCCESS!\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
