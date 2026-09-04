<<<<<<< HEAD
# AI University Platform — Phase 1 Foundation

> A modern full-stack academic web platform built with **Next.js**, **NestJS**, **Prisma ORM**, and **PostgreSQL**. Engineered with clean architecture ready for Phase 2 campus operations and Phase 3 Python FastAPI / RAG / LLM AI services.

---

## 1. Project Overview

The **AI University Platform** provides an institutional management portal for universities. Phase 1 establishes the rock-solid architectural core:
- **Role-Based Authentication & Governance**: Strict multi-role separation for **Students**, **Faculty**, and **Administrators**.
- **Cryptographic Security**: Password hashing with `bcryptjs`, JWT access tokens (15m expiry) paired with refresh token rotation (7d expiry) and database revocation tracking.
- **Relational Integrity**: Academic hierarchy modeling Departments, Degree Courses, Curriculums/Subjects, Faculty allocations, and Student enrollments in PostgreSQL via Prisma ORM.
- **Centralized Admin Control**: Interactive management interfaces for Departments, Courses, Subjects, Students, Faculty, and System Users.
- **Responsive University SaaS UI**: Modern dashboard experience with TanStack Query caching, React Hook Form, and Tailwind CSS.
- **API Documentation**: OpenAPI / Swagger documentation at `/api/docs` with Bearer token authentication support.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching & Cache**: TanStack React Query v5
- **Forms & Validation**: React Hook Form, Zod
- **HTTP Client**: Centralized Axios client with automatic token refresh interceptors
- **Icons**: Lucide React

### Backend
- **Framework**: NestJS 10 (TypeScript REST API)
- **ORM**: Prisma ORM 5
- **Database**: PostgreSQL (Docker-ready or cloud-hosted via Render / Neon / Supabase)
- **Authentication**: Passport JWT, JWT Access & Refresh Token rotation
- **Security**: `bcryptjs` password hashing, Global HttpExceptionFilter, RolesGuard
- **Validation**: `class-validator`, `class-transformer`
- **Documentation**: Swagger / OpenAPI 3.0

---

## 3. Architecture & Monorepo Structure

```text
ai_university/
│
├── frontend/                     # Next.js App Router Frontend
│   ├── app/
│   │   ├── (auth)/               # Authentication Pages (/login, /register)
│   │   ├── (dashboard)/          # Dashboard Shell & Subpages
│   │   │   ├── student/dashboard
│   │   │   ├── faculty/dashboard
│   │   │   ├── admin/
│   │   │   │   ├── dashboard
│   │   │   │   ├── departments
│   │   │   │   ├── courses
│   │   │   │   ├── subjects
│   │   │   │   ├── students
│   │   │   │   ├── faculty
│   │   │   │   └── users
│   │   │   └── profile
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing Hero
│   ├── components/
│   │   ├── ui/                   # Reusable Primitives (Button, Input, Select, Card, Modal, Table, Badge)
│   │   ├── layout/               # Sidebar, TopNav, DashboardLayout
│   │   └── shared/               # StatCard, EmptyState, LoadingSpinner, ErrorAlert, ConfirmModal
│   ├── context/
│   │   ├── AuthContext.tsx       # Auth provider, token storage, role-based routing
│   │   └── ToastContext.tsx      # Global notification toast system
│   ├── providers/
│   │   └── QueryProvider.tsx     # TanStack React Query client provider
│   ├── lib/
│   │   ├── api/                  # Centralized typed API clients
│   │   │   ├── client.ts         # Axios instance with refresh interceptor
│   │   │   ├── auth.ts
│   │   │   ├── departments.ts
│   │   │   ├── courses.ts
│   │   │   ├── subjects.ts
│   │   │   ├── students.ts
│   │   │   ├── faculty.ts
│   │   │   └── users.ts
│   │   └── utils.ts
│   ├── types/                    # Shared TypeScript interfaces
│   └── package.json
│
├── backend/                      # NestJS REST API Server
│   ├── src/
│   │   ├── auth/                 # AuthModule, AuthService, AuthController, JwtStrategy
│   │   ├── users/                # UsersModule, UsersService, UsersController
│   │   ├── students/             # StudentsModule, StudentsService, StudentsController
│   │   ├── faculty/              # FacultyModule, FacultyService, FacultyController
│   │   ├── departments/          # DepartmentsModule, DepartmentsService, DepartmentsController
│   │   ├── courses/              # CoursesModule, CoursesService, CoursesController
│   │   ├── subjects/             # SubjectsModule, SubjectsService, SubjectsController
│   │   ├── common/
│   │   │   ├── decorators/       # @Roles(), @CurrentUser(), @Public()
│   │   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   │   ├── filters/          # HttpExceptionFilter (uniform error envelope)
│   │   │   ├── interceptors/     # TransformInterceptor (uniform success envelope)
│   │   │   └── pipes/            # Global ValidationPipe
│   │   ├── prisma/               # PrismaModule, PrismaService
│   │   ├── app.module.ts
│   │   └── main.ts               # Swagger initialization, CORS, global middlewares
│   ├── prisma/
│   │   ├── schema.prisma         # Relational schema
│   │   └── seed.ts               # Database seed script
│   ├── test/                     # Jest Unit & Integration test suites
│   └── package.json
│
├── docker-compose.yml            # PostgreSQL Docker configuration
├── .gitignore
├── .env.example
└── README.md
```

---

## 4. User Roles & Access Matrix

| Feature | Student | Faculty | Admin |
| :--- | :---: | :---: | :---: |
| Self-Registration | Yes | Yes | No (Seeded/Admin-provisioned) |
| Student Dashboard | Yes | No | No |
| Faculty Dashboard | No | Yes | No |
| Admin Dashboard | No | No | Yes |
| View Enrolled Courses & Subjects | Yes | Yes | Yes |
| Manage Departments (CRUD) | No | No | Yes |
| Manage Courses (CRUD) | No | No | Yes |
| Manage Subjects (CRUD) | No | No | Yes |
| Manage Students (CRUD) | No | View Only | Yes |
| Manage Faculty (CRUD) | No | No | Yes |
| Manage Users & Roles (CRUD) | No | No | Yes |

---

## 5. Seeded Demo Accounts

The database seed provides ready-to-test accounts for every role:

| Role | Email | Password | Identifier / Title |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@aiuniversity.edu` | `Admin@123456` | System Administrator |
| **Faculty** | `alan.turing@aiuniversity.edu` | `Faculty@123456` | `FAC-CSE-001` (Senior Professor & Chair) |
| **Faculty** | `ada.lovelace@aiuniversity.edu` | `Faculty@123456` | `FAC-AI-001` (Associate Professor & AI Lab Dir.) |
| **Student** | `john.doe@aiuniversity.edu` | `Student@123456` | `STU-2026-001` (Semester 4, CSE) |
| **Student** | `alice.smith@aiuniversity.edu` | `Student@123456` | `STU-2026-002` (Semester 6, AIDS) |

*Note: The frontend `/login` page features a **Quick Demo Fill** section that fills these credentials with a single click.*

---

## 6. Getting Started & Installation

### Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+ or v11+
- **PostgreSQL**: A running instance (Local PostgreSQL or free online instance on [Render.com](https://render.com))

---

### Step 1: Configure Environment Variables

1. **Backend Configuration**:
   Inside `backend/`, copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Set your PostgreSQL database connection URL:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_university?schema=public"
   JWT_ACCESS_SECRET="ai_university_phase1_super_secure_access_token_secret_key_2026"
   JWT_REFRESH_SECRET="ai_university_phase1_super_secure_refresh_token_secret_key_2026"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   FRONTEND_URL="http://localhost:3000"
   ```
   *(For Render.com: paste the "External Database URL" provided in your Render dashboard into `DATABASE_URL`)*.

2. **Frontend Configuration**:
   Inside `frontend/`, copy the example file:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
   Ensure the API URL points to the backend:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   ```

---

### Step 2: Database Migration & Seeding

Once your PostgreSQL database is reachable via `DATABASE_URL`:

```bash
cd backend

# 1. Generate Prisma Client
npm run prisma:generate

# 2. Push schema to PostgreSQL database
npm run prisma:push

# 3. Seed initial admin, departments, courses, subjects, faculty, and students
npm run seed
```

---

### Step 3: Run the Applications

Open two terminal tabs:

**Terminal 1 — Backend (NestJS)**:
```bash
cd backend
npm run start:dev
```
*Backend runs on: `http://localhost:4000`*  
*Swagger Documentation: `http://localhost:4000/api/docs`*

**Terminal 2 — Frontend (Next.js)**:
```bash
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 7. Running Automated Tests

The backend includes unit and integration tests for authentication, role authorization, departments, and courses:

```bash
cd backend
npm test
```

All test suites execute with zero external database dependencies via test mocks:
- `src/auth/auth.service.spec.ts`
- `src/departments/departments.service.spec.ts`
- `src/courses/courses.service.spec.ts`
- `src/common/guards/roles.guard.spec.ts`

---

## 8. Swagger / OpenAPI Documentation

Explore and execute live REST requests directly through the interactive Swagger UI:
- **URL**: `http://localhost:4000/api/docs`
- **Authentication**: Click **Authorize** (top right) and enter your JWT access token obtained from `POST /auth/login` to test protected endpoints.

---

## 9. Standardized API Envelopes

Every API endpoint complies with strict, predictable JSON envelopes:

### Success Response
```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": [
    {
      "id": "c1f7a29e-...",
      "name": "Computer Science & Engineering",
      "code": "CSE",
      "description": "Department of Computer Science...",
      "_count": { "courses": 2, "students": 1, "faculty": 1 }
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Access denied: requires one of [ADMIN], current role is [STUDENT]",
  "error": "FORBIDDEN"
}
```

---

## 10. Future Architecture & Roadmap

### Phase 2: University Operations
- Attendance Tracking (daily session logging & reports)
- Continuous Assessment & Assignments (student submission & faculty grading)
- Examination Scheduling & Gradebook
- Real-time Notifications & Departmental Announcements
- Class Timetable Generator

### Phase 3: AI Intelligence Layer
```text
Next.js Frontend
       │
       ▼
NestJS Core API
       │ (REST / gRPC)
       ▼
Python FastAPI AI Service
       │
   ┌───┴───┐
   ▼       ▼
RAG       LLM
(Chroma/Qdrant)  (GPT-4 / Claude / Gemini)
   │       │
   └───────┴──────► AI Course Tutor / Syllabus Q&A
                    Automated Exam Question Generator
                    Personalized Adaptive Quizzes
```

---

## 11. License
This project is open-source and developed for the AI University Platform Foundation.
=======
# ai_university_platform
>>>>>>> 8914c248d7ae7539c8ed550916be48526479cbb8
