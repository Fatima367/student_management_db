# Student Management Dashboard

A full-featured student management system built with **Next.js (App Router)**, **Supabase** (Auth, Postgres, RLS), and **Vercel AI SDK**. Designed for schools and educational institutions to manage students, courses, batches, attendance, grades, and fees with role-based access.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Auth & Database | Supabase (Auth, Postgres, RLS) |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| AI | Vercel AI SDK |
| UI Primitives | Custom components (shadcn-inspired) |

## Features

- **Role-Based Access** — Admin, Instructor, and Student/Parent roles with RLS-enforced data isolation
- **Student Management** — Full CRUD with search, filter, pagination, and soft-delete
- **Courses & Batches** — Course catalog, batch scheduling, instructor assignment, capacity tracking
- **Enrollment** — Add/remove students to batches with duplicate and capacity checks
- **Attendance** — Mark daily attendance per batch with present/absent/late/excused, bulk actions
- **Grades & Assessments** — Create assessments, enter scores, per-student grade history with trend chart
- **Fee Management** — Fee structures per course, payment recording, computed dues via Postgres view
- **Dashboard** — Role-scoped stats and charts: attendance trends, enrollment growth, fee collection vs outstanding
- **Admin Panel** — User role management, guardian-student linking

## Architecture

```
app/
├── (auth)/                  Login & Signup
├── (dashboard)/
│   ├── dashboard/           Stats + charts (role-aware)
│   ├── students/            CRUD, search, filter
│   ├── courses/             Courses + batches + enrollment
│   ├── attendance/          Mark and view attendance
│   ├── grades/              Assessments + score entry
│   ├── fees/                Fee structures, payments, dues
│   ├── notifications/       AI-drafted messages (nice-to-have)
│   └── admin/users/         Role management
├── components/ui/           Button, Card, Input, Badge
├── lib/
│   ├── supabase/            Client/server helpers, auth, user
│   └── actions/             Server Actions (auth, students, courses, etc.)
```

## Database Schema

```
profiles              (id → auth.users, full_name, role: admin|instructor|student_parent)
  │
students              (id, full_name, dob, contact, guardian, status: active|inactive|graduated)
  │
courses               (id, name, description, fee_amount)
  │
batches               (id, course_id → courses, name, instructor_id → profiles, schedule, capacity)
  │
enrollments           (id, student_id → students, batch_id → batches, status)
  │
attendance            (id, student_id → students, batch_id → batches, date, status: present|absent|late|excused)
  │
assessments           (id, batch_id → batches, title, max_score)
  │
grades                (id, assessment_id → assessments, student_id → students, score)
  │
fee_structures        (id, course_id → courses, amount, due_frequency)
  │
fee_payments          (id, student_id → students, fee_structure_id → fee_structures, amount_paid, method)
  │
student_guardian_links (id, student_id → students, profile_id → profiles)
  │
student_fee_summary   (VIEW: expected_total, paid_total, outstanding_total per student)
```

RLS is enabled on every table with policies scoped by `admin` (full access), `instructor` (own batches), and `student_parent` (linked students only).

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

The project already has a fully migrated Supabase instance. If you're starting fresh:

```bash
npx supabase start
npx supabase migration up
npx supabase db push
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any of the demo accounts below.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** — full access to all features | `admin@school.com` | `password123` |
| **Instructor** — manage own batches, attendance, grades | `instructor@school.com` | `password123` |
| **Student / Parent** — view linked student's data | `parent@school.com` | `password123` |

### What each role can do

- **Admin**: Everything — CRUD students/courses/batches, manage attendance/grades/fees, manage users and roles, view all dashboards and charts
- **Instructor**: View students in their batches, mark attendance for own batches, create assessments and enter grades, view fees of enrolled students
- **Student/Parent**: Read-only view of linked student's profile, attendance history, grades, and fee status

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

Deploy on Vercel:

```bash
npx vercel
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.

## Project Status

All core features implemented (Phases 1–9). See [PLAN.md](./PLAN.md) for the full implementation plan.
