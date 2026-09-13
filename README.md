# SkillSphere — Full-Stack Educational Learning, Mentorship & Course Marketplace

**SkillSphere** is a modular, full-stack educational learning, mentorship, and course marketplace application built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **NextAuth.js**, **Zustand**, and **TanStack Query**.

It connects 5 key user roles:
1. **Student**: Enrolls in courses, tracks lesson progress, takes assessments, earns certificates, and books 1-on-1 mentor consultations.
2. **Instructor**: Creates & manages courses, authors modules & lessons, attaches video references, and monitors student enrollments.
3. **Mentor**: Configures recurring availability windows, sets session rates, and conducts 1-on-1 career consultations.
4. **Training Organization**: Oversees affiliated instructors, enterprise course bundles, and aggregated student rosters.
5. **Super Admin**: Governs platform operations, reviews KYC documents, approves course submissions, monitors payments, and inspects analytics.

---

## 🔑 Quick Demo Credentials (Zero Setup Required)

You can instantly log in to any role using these pre-seeded demo accounts:

| Role | Email Address | Password | Portal Route |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `password123` | `/student/dashboard` |
| **Instructor** | `instructor@example.com` | `password123` | `/instructor/dashboard` |
| **Mentor** | `mentor@example.com` | `password123` | `/mentor/dashboard` |
| **Organization** | `org@example.com` | `password123` | `/organization/dashboard` |
| **Super Admin** | `admin@example.com` | `admin123` | `/admin/dashboard` |

> 💡 **One-Click Quick Logins**: The `/login` page includes instant one-click demo buttons that pre-fill and log in immediately without typing passwords.

---

## 🚀 Technology Stack

- **Framework**: Next.js 14 (App Router & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Lucide React Icons
- **Database & ORM**: Prisma ORM with SQLite for zero-config local development (easily switchable to PostgreSQL via `prisma/schema.prisma`)
- **Authentication**: NextAuth.js (Credentials Provider + `bcryptjs` password hashing)
- **Client State**: Zustand (Sidebar toggles, Shopping cart, Toast notifications)
- **Server State**: TanStack React Query (Course data, enrollments, bookings, assessments)
- **Form Handling & Validation**: React Hook Form + Zod

---

## 🛠️ Service Abstractions (Zero Credentials Required)

SkillSphere includes clear service abstractions so external cloud credentials (S3, Stripe, Razorpay, Cloudinary, YouTube) are **never** required for initial local development:

1. `StorageService` (`lib/services/storage.service.ts`): Handles local/base64 file uploads with placeholders for S3 / Cloudinary switch.
2. `PaymentService` (`lib/services/payment.service.ts`): Processes mock checkout orders and generates transaction receipts ready for Stripe / Razorpay switch.
3. `VideoService` (`lib/services/video.service.ts`): Converts raw video links into safe embeddable player formats (YouTube/Vimeo/HTML5).

---

## 📦 Installation & Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (or duplicate `.env.example`):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="skillsphere-super-secret-key-change-in-production-12345"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PROVIDER="MOCK"
PAYMENT_PROVIDER="MOCK"
VIDEO_PROVIDER="MOCK"
```

### 3. Database Initialization & Seeding
Run Prisma schema sync and execute the seed script:
```bash
# Push Prisma schema to SQLite database
npx prisma db push

# Seed demo users, courses, mentors, assessments, products, and notifications
npx tsx prisma/seed.ts
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture & Folder Structure

```text
SkillSphere/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Multi-role login with demo shortcuts
│   │   └── register/page.tsx        # Multi-role registration form
│   ├── student/                     # Student workspace
│   │   ├── dashboard/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── courses/[id]/page.tsx   # Interactive Video Course Player
│   │   ├── bookings/page.tsx
│   │   ├── certificates/page.tsx
│   │   └── profile/page.tsx
│   ├── instructor/                  # Instructor workspace
│   │   ├── dashboard/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── courses/new/page.tsx     # Course Creation Wizard
│   │   ├── courses/[id]/edit/page.tsx # Module & Lesson Builder
│   │   └── profile/page.tsx
│   ├── mentor/                      # Mentor workspace
│   │   ├── dashboard/page.tsx
│   │   ├── availability/page.tsx   # Weekly slot manager
│   │   └── bookings/page.tsx
│   ├── organization/                # Organization workspace
│   ├── admin/                       # Super Admin workspace
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx           # Account activate/suspend controls
│   │   ├── courses/page.tsx         # Course approval queue
│   │   ├── verifications/page.tsx   # KYC review queue
│   │   └── payments/page.tsx        # Transaction logs
│   ├── courses/                     # Public course marketplace catalog
│   ├── mentors/                     # Public mentor directory & booking
│   ├── marketplace/                 # Educational digital products & cart
│   ├── discussions/                 # Q&A community forum
│   ├── certificates/verify/[id]/    # Public Certificate Verification Page
│   └── api/                         # Next.js Route Handlers (REST APIs)
├── components/                      # Reusable UI & Layout components
├── lib/                             # Services, DB client, Auth & RBAC
├── prisma/                          # Relational Schema & Seed runner
├── store/                           # Zustand client state stores
├── types/                           # Central TypeScript definitions
└── middleware.ts                    # Next.js Server-Side RBAC Protection
```

---

## 🎓 Interview Explanation Guide

### How Authentication & Role-Based Access Control (RBAC) Work
1. **NextAuth Session**: User authenticates via credentials (`app/api/auth/[...nextauth]/route.ts`). Passwords are verified using `bcryptjs`. NextAuth encodes the `userId` and `role` into an encrypted JWT cookie.
2. **Next.js Middleware**: `middleware.ts` intercepts requests to `/student/*`, `/instructor/*`, `/mentor/*`, `/organization/*`, and `/admin/*`. If a user attempts to access a portal outside their role, they are cleanly redirected.
3. **Server-Side Security**: API route handlers (`app/api/*`) inspect `getServerSession(authOptions)` on the server before mutating database records, ensuring unauthorized client requests cannot perform privileged actions.

### How State Management is Divided
- **Zustand (`store/`)**: Handles pure client-side UI states, such as mobile sidebar visibility, shopping cart drawer contents, and toast notifications.
- **TanStack React Query (`providers/QueryProvider.tsx`)**: Manages server data fetching, caching, and background refetching for dynamic data like course lists, enrollments, and mentor session bookings.

---

## ⚡ Verification & Build Command

To verify complete TypeScript type safety and Next.js bundle compilation:
```bash
npx tsc --noEmit
npm run build
```
