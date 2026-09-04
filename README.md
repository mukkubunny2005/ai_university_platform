# AI University Platform — Phase 1 Foundation

> A modern full-stack academic web platform built with **Next.js**, **NestJS**, **Prisma ORM**, and **PostgreSQL**. Engineered with a clean architecture ready for Phase 2 campus operations and Phase 3 Python FastAPI / RAG / LLM AI services.

---

## 1. Project Overview

The **AI University Platform** provides an institutional management portal for universities.

Phase 1 establishes the core architecture:

* **Role-Based Authentication & Governance** — Strict separation for **Students**, **Faculty**, and **Administrators**.
* **Cryptographic Security** — Password hashing with `bcryptjs`, JWT access tokens, refresh-token rotation, and database-based token revocation.
* **Relational Integrity** — Departments, degree courses, subjects, faculty, students, and academic relationships using PostgreSQL and Prisma ORM.
* **Centralized Admin Control** — Management interfaces for Departments, Courses, Subjects, Students, Faculty, and Users.
* **Responsive University UI** — Next.js dashboard with TanStack Query, React Hook Form, Zod, and Tailwind CSS.
* **API Documentation** — OpenAPI / Swagger documentation available at `/api/docs`.

---

## 2. Technology Stack

### Frontend

* **Framework:** Next.js 16
* **UI Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Data Fetching:** TanStack React Query v5
* **Forms:** React Hook Form
* **Validation:** Zod
* **HTTP Client:** Axios
* **Icons:** Lucide React

### Backend

* **Framework:** NestJS
* **Language:** TypeScript
* **ORM:** Prisma
* **Database:** PostgreSQL
* **Authentication:** Passport JWT
* **Password Hashing:** bcryptjs
* **Validation:** class-validator + class-transformer
* **API Documentation:** Swagger / OpenAPI
* **Authorization:** JWT Authentication + Role-Based Access Control

---

## 3. Architecture & Project Structure

```text
ai_university/
│
├── frontend/                         # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── student/
│   │   │   │   └── dashboard/
│   │   │   │
│   │   │   ├── faculty/
│   │   │   │   └── dashboard/
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── departments/
│   │   │   │   ├── courses/
│   │   │   │   ├── subjects/
│   │   │   │   ├── students/
│   │   │   │   ├── faculty/
│   │   │   │   └── users/
│   │   │   │
│   │   │   └── profile/
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── providers/
│   │   └── QueryProvider.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── departments.ts
│   │   │   ├── courses.ts
│   │   │   ├── subjects.ts
│   │   │   ├── students.ts
│   │   │   ├── faculty.ts
│   │   │   └── users.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── students/
│   │   ├── faculty/
│   │   ├── departments/
│   │   ├── courses/
│   │   ├── subjects/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── filters/
│   │   │   └── interceptors/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## 4. User Roles & Access Matrix

| Feature                 | Student | Faculty | Admin |
| ----------------------- | :-----: | :-----: | :---: |
| Self Registration       |   Yes   |   Yes   |   No  |
| Student Dashboard       |   Yes   |    No   |   No  |
| Faculty Dashboard       |    No   |   Yes   |   No  |
| Admin Dashboard         |    No   |    No   |  Yes  |
| View Courses & Subjects |   Yes   |   Yes   |  Yes  |
| Manage Departments      |    No   |    No   |  Yes  |
| Manage Courses          |    No   |    No   |  Yes  |
| Manage Subjects         |    No   |    No   |  Yes  |
| Manage Students         |    No   |   View  |  Yes  |
| Manage Faculty          |    No   |    No   |  Yes  |
| Manage Users & Roles    |    No   |    No   |  Yes  |

---

## 5. Authentication & Security

The platform uses JWT-based authentication.

### Authentication Flow

```text
User
 │
 ▼
Next.js Frontend
 │
 │ Login
 ▼
NestJS Auth API
 │
 ├── Validate credentials
 │
 ├── Verify bcrypt password
 │
 ├── Generate access token
 │
 └── Generate refresh token
 │
 ▼
Authenticated User
```

### Token Strategy

* Access token: short-lived
* Refresh token: long-lived
* Refresh token rotation
* Database-backed refresh-token revocation
* JWT protected endpoints
* Role-based authorization
* Password hashing with `bcryptjs`

---

## 6. Database Architecture

PostgreSQL is used as the primary database.

Prisma ORM provides the database abstraction layer.

### Core Models

```text
User
 │
 ├── Student
 │
 └── Faculty

Department
 │
 ├── Courses
 │
 ├── Subjects
 │
 ├── Students
 │
 └── Faculty

Course
 │
 └── Subjects
```

The Prisma schema maintains relational integrity through foreign keys, unique constraints, and relationship definitions.

---

## 7. Environment Configuration

### Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=4000

DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_university?schema=public"

JWT_ACCESS_SECRET="replace-with-a-strong-access-secret"
JWT_REFRESH_SECRET="replace-with-a-different-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

FRONTEND_URL="http://localhost:3000"
```

**Do not commit `backend/.env` to Git.**

Use `.env.example` for safe configuration templates.

### Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 8. Installation

### Prerequisites

Install:

* Node.js 20+
* npm 10+
* PostgreSQL

Verify:

```powershell
node --version
npm --version
```

Verify PostgreSQL is available and running.

---

## 9. Backend Setup

Open PowerShell:

```powershell
cd D:\ai_university\backend
```

Install dependencies:

```powershell
npm install
```

Generate Prisma Client:

```powershell
npm run prisma:generate
```

Prepare the database:

```powershell
npm run prisma:push
```

Seed the database:

```powershell
npm run seed
```

Start the backend:

```powershell
npm run start:dev
```

Backend:

```text
http://localhost:4000
```

Swagger:

```text
http://localhost:4000/api/docs
```

---

## 10. Frontend Setup

Open another PowerShell terminal:

```powershell
cd D:\ai_university\frontend
```

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 11. Running the Application

Both applications should be running:

```text
┌──────────────────────────┐
│       Next.js            │
│    localhost:3000        │
└────────────┬─────────────┘
             │
             │ REST API
             ▼
┌──────────────────────────┐
│       NestJS             │
│    localhost:4000        │
└────────────┬─────────────┘
             │
             │ Prisma
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
└──────────────────────────┘
```

---

## 12. Swagger / OpenAPI

Swagger is available at:

```text
http://localhost:4000/api/docs
```

Swagger provides interactive documentation for the backend REST API.

### Authentication

1. Register or log in.
2. Obtain a JWT access token.
3. Open Swagger.
4. Click **Authorize**.
5. Enter the JWT access token.
6. Test protected endpoints.

---

## 13. API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": []
}
```

### Error Response

```json
{
  "success": false,
  "message": "Access denied",
  "error": "FORBIDDEN"
}
```

---

## 14. Automated Tests

Run backend tests:

```powershell
cd D:\ai_university\backend
npm test
```

Run tests in watch mode:

```powershell
npm run test:watch
```

Generate coverage:

```powershell
npm run test:cov
```

Run end-to-end tests:

```powershell
npm run test:e2e
```

---

## 15. Production Build Verification

### Backend

```powershell
cd D:\ai_university\backend
npm run build
```

### Frontend

```powershell
cd D:\ai_university\frontend
npm run build
```

Both builds should complete without TypeScript or compilation errors before deployment.

---

## 16. Seeded Demo Accounts

Development/demo accounts:

| Role    | Email                           | Password         |
| ------- | ------------------------------- | ---------------- |
| Admin   | `admin@aiuniversity.edu`        | `Admin@123456`   |
| Faculty | `alan.turing@aiuniversity.edu`  | `Faculty@123456` |
| Faculty | `ada.lovelace@aiuniversity.edu` | `Faculty@123456` |
| Student | `john.doe@aiuniversity.edu`     | `Student@123456` |
| Student | `alice.smith@aiuniversity.edu`  | `Student@123456` |

> These credentials are for development/testing only. Change or remove them before production deployment.

---

## 17. Phase 1 Status

### Phase 1 — Foundation

* [x] Next.js frontend
* [x] NestJS backend
* [x] TypeScript
* [x] PostgreSQL
* [x] Prisma ORM
* [x] JWT authentication
* [x] Refresh token handling
* [x] Password hashing
* [x] Role-based authorization
* [x] Student role
* [x] Faculty role
* [x] Admin role
* [x] User management
* [x] Student management
* [x] Faculty management
* [x] Department management
* [x] Course management
* [x] Subject management
* [x] Swagger documentation
* [x] Global validation
* [x] Global error handling
* [x] API response transformation
* [x] Frontend authentication flow
* [x] Role-based dashboards
* [x] Automated tests

---

## 18. Phase 2 — University Operations

Planned Phase 2 functionality:

* Attendance tracking
* Daily attendance sessions
* Attendance reports
* Assignments
* Student assignment submissions
* Faculty grading
* Continuous assessment
* Examination scheduling
* Gradebook
* Class timetable
* University announcements
* Real-time notifications

---

## 19. Phase 3 — AI Intelligence Layer

The future architecture will introduce a Python FastAPI AI service.

```text
┌──────────────────────┐
│    Next.js Web App   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   NestJS Core API    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Python FastAPI AI    │
│       Service        │
└──────────┬───────────┘
           │
      ┌────┴────┐
      ▼         ▼
     RAG       LLM
      │         │
      └────┬────┘
           ▼
 ┌───────────────────────┐
 │ AI University Features│
 ├───────────────────────┤
 │ Course Tutor          │
 │ Syllabus Q&A          │
 │ Question Generator    │
 │ Adaptive Quizzes      │
 │ AI Study Assistant    │
 └───────────────────────┘
```

---

## 20. Backend / Frontend Relationship

The same **NestJS TypeScript backend** is designed to serve multiple clients.

```text
             ┌─────────────────┐
             │   Web Browser   │
             │   Next.js       │
             └────────┬────────┘
                      │
                      │
             ┌────────▼────────┐
             │   NestJS API    │
             │   TypeScript    │
             └────────┬────────┘
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
        PostgreSQL         Future Mobile
                            Application
```

The backend API can therefore be reused by the web application and future mobile applications.

---

## 21. Development Principles

The project follows these principles:

* TypeScript-first architecture
* Modular NestJS backend
* Component-based Next.js frontend
* Strong database relationships
* DTO-based validation
* Role-based access control
* Centralized API client
* Consistent API responses
* Secure authentication
* Environment-based configuration
* Testable backend services
* Separation of frontend and backend responsibilities

---

## 22. Security Notes

Never commit:

```text
.env
.env.local
```

Never commit:

* Production database passwords
* JWT secrets
* API keys
* Private credentials
* Production tokens

Use:

```text
.env.example
```

for configuration templates.

---

## 23. Git Workflow

Check repository status:

```powershell
git status
```

Add changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "your commit message"
```

Push:

```powershell
git push
```

---

## 24. License

This project is developed as the foundation of the **AI University Platform**.

---
