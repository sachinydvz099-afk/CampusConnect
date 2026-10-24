# 🎓 CampusConnect — Campus Services & Support Platform

> **Final-Year BCA Capstone Project**  
> A full-stack, responsive web application for college students to browse campus services, submit support requests, book appointments, and track resolutions. Dedicated dashboards enable staff to triage tickets and manage consultations, while administrators manage services, users, and campus-wide analytics.

---

## 🌟 Key Project Highlights

- **Role-Based Portals**: Separate workflows and access controls for **Students**, **Staff**, and **Administrators**.
- **Interactive Services Catalog**: Searchable and filterable directory (IT Support, Academic Advising, Library, Counseling, Equipment Loans, Career Services).
- **Service Request Lifecycle**: Complete status tracking (`SUBMITTED` &rarr; `IN_REVIEW` &rarr; `ASSIGNED` &rarr; `WAITING_FOR_STUDENT` &rarr; `RESOLVED` &rarr; `CLOSED`) with unique ticket IDs (`REQ-2026-XXXX`) and audit history timeline.
- **Strict Note Privacy**: Internal staff collaboration notes are strictly withheld from student view at the API and database levels.
- **Zero-Conflict Appointment Booking**: Real-time validation and slot locking prevent double-booking across both students and staff members.
- **Interactive Analytics**: Administrator analytics powered by **Recharts** (Bar & Pie distributions) accompanied by accessible semantic data tables.
- **Dual-Mode Frontend (GitHub Pages Ready)**: Works seamlessly with a live Express REST backend via `VITE_API_URL`, with an intelligent in-memory fallback layer for standalone GitHub Pages static deployment and presentation demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router (HashRouter for GitHub Pages) |
| **Styling** | Tailwind CSS, Lucide React Icons |
| **Data Visualization** | Recharts (ResponsiveContainer, BarChart, PieChart) |
| **Backend API** | Node.js, Express, TypeScript |
| **API Validation** | Zod schemas for request validation |
| **Database & ORM** | PostgreSQL with Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens) & Bcrypt password hashing |
| **Frontend Hosting** | GitHub Pages via automated GitHub Actions |
| **Backend Hosting** | Render / Railway / Supabase / Neon (separate cloud provider) |

---

## 👥 Demo Accounts (For Presentation & Evaluation)

CampusConnect comes pre-configured with demo accounts for instant evaluation:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campusconnect.edu` | `Campus@123` | Submit requests, book appointments, track personal history |
| **Staff** | `staff@campusconnect.edu` | `Campus@123` | Triage assigned tickets, post private staff notes, manage consultations |
| **Administrator** | `admin@campusconnect.edu` | `Campus@123` | Manage users & roles, create/edit services, view campus analytics |

> 💡 *Quick Role Switcher*: When running or previewing the frontend, use the **"Demo: Student | Staff | Admin"** pill in the top navigation bar to switch personas with one click.

---

## 📁 Repository Structure

```
CampusConnect/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Actions workflow for GitHub Pages
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── public/                   # Static assets & SVG icons
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, StatusBadge, PriorityBadge, Timeline, Modal, StatCard, TableSummary
│   │   ├── context/              # AuthContext, NotificationContext
│   │   ├── pages/                # LandingPage, Login, Register, Profile, ServicesDirectory, ServiceDetail,
│   │   │                         # NewServiceRequest, MyRequests, RequestDetail, BookAppointment, MyAppointments,
│   │   │                         # StudentDashboard, StaffDashboard, AdminDashboard, AdminServices, AdminUsers, NotFound, AccessDenied
│   │   ├── services/             # API client (with live backend connection and demo fallback)
│   │   ├── types/                # Shared TypeScript models
│   │   ├── App.tsx               # HashRouter client routing with role-guarded routes
│   │   ├── main.tsx              # Application entrypoint
│   │   └── index.css             # Tailwind design system & accessible focus rules
│   ├── index.html
│   ├── vite.config.ts            # base: './' for universal GitHub Pages hosting
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── backend/                      # Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma         # Relational schema (User, Service, ServiceRequest, Appointment, etc.)
│   │   └── seed.ts               # Database seed script for PostgreSQL
│   ├── src/
│   │   ├── config/               # Environment constants & CORS rules
│   │   ├── controllers/          # auth, services, requests, appointments, notifications, users, reports
│   │   ├── middleware/           # authGuard (JWT), roleGuard, validate (Zod), errorHandler
│   │   ├── routes/               # Express REST route handlers
│   │   ├── services/             # Prisma client & database abstraction
│   │   ├── types/                # Express request extensions
│   │   ├── utils/                # Password hashing, JWT signing, ticket generators
│   │   ├── index.ts              # Express server entrypoint
│   │   └── test-api.ts           # Automated test suite
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── package.json                  # Root monorepo orchestration
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18 or v20 LTS recommended)
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CampusConnect.git
cd CampusConnect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your settings:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusconnect?schema=public"
JWT_SECRET="your_secure_random_jwt_secret"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
```env
# Point to your local Express backend
VITE_API_URL="http://localhost:5000/api"
```

### 3. Run Locally

```bash
# Terminal 1: Start Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🗄️ Database Schema & Prisma Migrations

The database model is defined in `backend/prisma/schema.prisma` and includes:

- `User`: Accounts with role enum (`STUDENT`, `STAFF`, `ADMIN`), Student/Staff ID, department, and deactivation flags.
- `Service`: Campus department services with hours, location, contact, and soft-deactivation protection.
- `ServiceStaff`: Many-to-many relationship assigning faculty specialists to services.
- `ServiceRequest`: Tickets with unique numbers (`REQ-YYYY-XXXX`), priority, status, and assignment.
- `RequestStatusHistory`: Audit log capturing state changes, timestamps, and staff notes.
- `RequestComment`: Public replies and private staff notes (enforced by `isPrivateStaffNote`).
- `AppointmentSlot`: Staff availability time slots with booking state.
- `Appointment`: Confirmed bookings with unique numbers (`APT-YYYY-XXXX`) and double-booking checks.
- `Notification`: User notifications with read receipts.

### Running Migrations & Seeding:
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register new student account |
| **POST** | `/api/auth/login` | Public | Authenticate user & return JWT |
| **POST** | `/api/auth/demo-login` | Public | Instant demo login for evaluation |
| **GET** | `/api/auth/me` | Authenticated | Get current user profile |
| **PUT** | `/api/auth/profile` | Authenticated | Update profile details |
| **GET** | `/api/services` | Public | List active campus services |
| **GET** | `/api/services/:id` | Public | Get service details & staff |
| **POST** | `/api/services` | Admin | Create a new campus service |
| **PUT** | `/api/services/:id` | Admin | Update service details |
| **DELETE**| `/api/services/:id` | Admin | Deactivate or delete service |
| **POST** | `/api/requests` | Student/Admin | Submit a service request |
| **GET** | `/api/requests` | Authenticated | List requests (role-filtered) |
| **GET** | `/api/requests/:id` | Authenticated | View request, history & comments |
| **PUT** | `/api/requests/:id/status`| Staff/Admin | Update request status & add note |
| **POST** | `/api/requests/:id/comments`| Authenticated| Post reply or private staff note |
| **GET** | `/api/appointments/slots` | Authenticated | View available consultation slots |
| **POST** | `/api/appointments/book` | Authenticated | Book appointment with conflict check |
| **GET** | `/api/appointments` | Authenticated | List user appointments |
| **POST** | `/api/appointments/:id/cancel`| Authenticated | Cancel appointment slot |
| **GET** | `/api/notifications` | Authenticated | View in-app notifications |
| **PUT** | `/api/notifications/:id/read`| Authenticated| Mark notification as read |
| **GET** | `/api/reports/metrics` | Admin/Staff | Aggregated analytics & charts |
| **GET** | `/api/users` | Admin | List all registered users |
| **PUT** | `/api/users/:id/role` | Admin | Promote or change user role |
| **PUT** | `/api/users/:id/status`| Admin | Suspend or activate user |

---

## 🚀 Deployment Guide

### A. Deploy Frontend to GitHub Pages

GitHub Pages serves static web files. To publish the frontend:

1. **Vite Base Path**: Configured as `base: './'` in `frontend/vite.config.ts`, ensuring all scripts and stylesheets load regardless of your repository name.
2. **Client-Side Routing**: The application uses `HashRouter` (`/#/services`, `/#/dashboard`). Refreshing pages will **never** throw a 404 error on GitHub Pages.
3. **Repository Settings**:
   - Go to your repository on GitHub: **Settings &rarr; Pages**.
   - Under **Build and deployment &rarr; Source**, choose **GitHub Actions**.
4. **Workflow Permissions**:
   - Go to **Settings &rarr; Actions &rarr; General**.
   - Under **Workflow permissions**, choose **Read and write permissions**.
5. **Deployment Trigger**:
   - Pushing changes to the `main` branch automatically triggers `.github/workflows/deploy.yml`.
   - You can also manually trigger deployment via the **Actions** tab &rarr; **Deploy Frontend to GitHub Pages** &rarr; **Run workflow**.
6. **Configuring Backend URL on GitHub Pages**:
   - If connecting to an external backend, add a Repository Variable in GitHub:
     **Settings &rarr; Secrets and variables &rarr; Actions &rarr; Variables &rarr; New repository variable**:
     - Name: `VITE_API_URL`
     - Value: `https://your-backend.onrender.com/api`
   - *If `VITE_API_URL` is omitted, the frontend automatically runs in interactive demo mode using seeded data, ensuring full functionality during demonstrations.*

---

### B. Deploy Backend & PostgreSQL (Separate Hosting)

GitHub Pages does not support Node.js or databases. The backend and PostgreSQL database should be deployed to a cloud platform:

#### Option 1: Render.com (Recommended Free Tier)
1. Create a free **PostgreSQL database** on Render. Copy the **Internal Database URL** or **External Database URL**.
2. Create a new **Web Service** on Render connected to this repository:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `npm start`
3. Add Environment Variables on Render:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A secure 32+ character random string.
   - `ALLOWED_ORIGINS`: `https://YOUR_USERNAME.github.io,http://localhost:5173`
   - `NODE_ENV`: `production`

#### Option 2: Railway or Fly.io
Deploy the `backend` folder and provision a PostgreSQL plugin using the same environment variables.

---

## 🧪 Testing and Verification

CampusConnect includes an automated API test suite covering:
1. Health check verification
2. Demo student, staff, and admin authentication
3. Service catalog retrieval
4. Ticket submission and request number generation
5. **Strict note privacy rule verification** (ensures students cannot access internal staff notes)
6. **Double-booking prevention** (validates 409 Conflict when overlapping appointment slots are selected)
7. Administrator analytics metrics calculation

Run the automated test suite locally:
```bash
npm run test:api
```

---

## 🛡️ Security & Architecture Best Practices

- **Zero Secret Commits**: All configuration files use `.env.example` templates; no private credentials or tokens are committed.
- **Backend Role Guards**: Authorization is checked at every controller endpoint; frontend guards are accompanied by strict API validation.
- **Data Integrity**: Services with historical tickets cannot be deleted destructively; they are soft-deactivated to maintain audit integrity.
- **Sanitized Outputs**: Passwords and password hashes are stripped from all API payloads before returning to clients.

---

## 📜 License & Acknowledgments

Developed as a Final Year BCA Capstone Project. Released under the MIT License.
