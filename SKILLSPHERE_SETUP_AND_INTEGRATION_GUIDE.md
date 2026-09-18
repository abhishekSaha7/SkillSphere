# SKILLSPHERE — PROJECT ANALYSIS & INTEGRATION ARCHITECTURE GUIDE

**Date:** September 18, 2026  
**Project:** SkillSphere (All-in-One Learning Management, Mentorship, Marketplace & Community Platform)  
**Technology Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Prisma ORM, NextAuth.js, Zustand, TanStack Query.

---

## 1. Executive Summary & Project Overview

SkillSphere is a full-featured EdTech and Mentorship SaaS platform designed to support 5 distinct user personas:

1. **Student:** Access enrolled courses, track learning progress, take assessments, earn certificates, book 1-on-1 mentorship sessions, buy digital products, and join discussions.
2. **Instructor:** Create & publish multi-module courses, upload video/text lessons, create quizzes/assessments, and view earnings.
3. **Mentor:** Set availability schedules, offer hourly consultation types, conduct 1-on-1 sessions, and manage student bookings.
4. **Organization:** Enterprise manage teams, assign training paths, view employee skill metrics.
5. **Super Admin:** System-wide governance, KYC verification approval, user suspension/activation, category management, financial reports, and audit logs.

The project currently uses a **clean modular architecture** with an abstract service layer (`lib/services/`) designed to allow seamless swapping between mock dev engines and real production services (Supabase, Stripe, AWS S3).

---

## 2. Project File & Folder Structure Analysis

```
SkillSphere/
├── app/                        # Next.js 14 App Router Directory
│   ├── (auth)/                 # Authentication pages (/login, /register)
│   ├── admin/                  # Super Admin Dashboard & Portal (/admin/users, /admin/verifications, etc.)
│   ├── student/                # Student Portal (/student/dashboard, /student/courses, /student/certificates)
│   ├── instructor/             # Instructor Portal (/instructor/courses, /instructor/analytics)
│   ├── mentor/                 # Mentor Portal (/mentor/availability, /mentor/bookings)
│   ├── organization/           # Organization Portal (/organization/dashboard, /organization/team)
│   ├── courses/                # Public Course Directory & Detail Pages
│   ├── mentors/                # Public Mentor Directory & Booking Modal
│   ├── marketplace/            # Digital Marketplace & Cart (/marketplace, /marketplace/cart)
│   ├── discussions/            # Community Forums & Discussion Boards
│   ├── certificates/           # Public Certificate Verification Route (/certificates/[code])
│   ├── api/                    # Server-side API Endpoints
│   │   ├── admin/              # Admin APIs (KYC verifications, user actions)
│   │   ├── auth/               # NextAuth Handler & Auth API
│   │   ├── register/           # Account Registration API
│   │   ├── courses/            # Course CRUD APIs
│   │   ├── modules/            # Module & Lesson CRUD APIs
│   │   ├── bookings/           # Mentor Session Booking API
│   │   ├── orders/             # Order Checkout & Payment API
│   │   ├── products/           # Digital Product Marketplace APIs
│   │   ├── discussions/        # Forum Posting APIs
│   │   ├── progress/           # Lesson Completion Tracking API
│   │   └── assessments/        # Assessment & Quiz Grading APIs
│   ├── layout.tsx              # Main App Layout (Providers, Navbar, Footer)
│   ├── page.tsx                # Public Landing Page
│   └── globals.css             # Tailwind CSS Custom Directives & Global Styles
├── components/                 # Reusable React UI Components
│   ├── layout/                 # Navbar, Sidebar, Footer, ThemeToggle
│   └── ui/                     # Atomic UI Design System (Button, Card, Modal, Input, Badge, Toast)
├── lib/                        # Core Backend Utilities & Services
│   ├── auth.ts                 # NextAuth Configuration & Credentials Provider
│   ├── db.ts                   # Prisma Singleton Client Initialization
│   ├── permissions.ts          # Role-Based Access Control (RBAC) Matrix
│   ├── services/               # Service Abstraction Layer (CRITICAL FOR INTEGRATIONS)
│   │   ├── payment.service.ts  # Payment Gateway Abstraction (Mock, Stripe, Razorpay)
│   │   ├── storage.service.ts  # Cloud File Storage Abstraction (Mock, S3, Supabase)
│   │   └── video.service.ts    # Video Streaming Abstraction (YouTube, Vimeo, Mux)
│   └── validations/            # Zod Form Validation Schemas (Auth, Course, Booking)
├── prisma/                     # Database Schema & Seed Engine
│   ├── schema.prisma           # Complete PostgreSQL Schema (20+ Models)
│   └── seed.ts                 # Comprehensive Demo Data Seed Script
├── providers/                  # Client-Side React Context Providers
│   ├── QueryProvider.tsx       # TanStack React Query Provider
│   ├── SessionProvider.tsx     # NextAuth Client Session Provider
│   └── ThemeProvider.tsx       # Light/Dark Theme Provider
├── store/                      # Zustand State Management
│   ├── useAuthStore.ts         # User Auth State Store
│   ├── useCartStore.ts         # Marketplace Cart State Store
│   └── useUIStore.ts           # Modal & Toast Notification UI Store
├── types/                      # TypeScript Interfaces & Model Re-exports
├── .env.example                # Template Environment Variables
├── middleware.ts               # Next.js Middleware for Route Protection & RBAC
├── package.json                # Project Dependencies & Scripts
└── tailwind.config.ts          # Tailwind CSS Theme & Styling Config
```

---

## 3. Analysis of Current Implementation & Problems Identified

During our thorough codebase inspection, the following **issues and problems** were identified that must be resolved:

### ⚠️ Problem 1: `node_modules` Directory Missing

- **Issue:** The dependencies exist in `package.json`, but `node_modules` is absent on the filesystem.
- **Impact:** TypeScript compilation fails (`Cannot find module '@prisma/client'`, `next-auth`, `zod`, etc.) and the application cannot run (`npm run dev`) or build (`npm run build`).
- **Fix:** Execute `npm install` in the project root directory.

### ⚠️ Problem 2: Mocked Service Layer (`lib/services/`)

- **Issue:** `payment.service.ts`, `storage.service.ts`, and `video.service.ts` are returning hardcoded mock strings.
- **Impact:** Payments do not process real funds; file uploads do not upload to cloud storage (generating fake paths like `/uploads/...`); videos rely on fallback YouTube embeds.
- **Fix:** Follow Section 4 and Section 5 below to wire up real Supabase Storage & Stripe/Razorpay SDKs.

### ⚠️ Problem 3: Hardcoded Fallback Secrets

- **Issue:** `lib/auth.ts` and `middleware.ts` contain fallback string `'skillsphere-secret-key-12345'`.
- **Impact:** Security risk in production if `.env` is not set properly.
- **Fix:** Define a robust `NEXTAUTH_SECRET` in `.env` and throw an error in production if missing.

### ⚠️ Problem 4: Missing Asynchronous Webhook Handlers

- **Issue:** `app/api/orders/route.ts` completes orders synchronously during mock API calls. Real payment gateways (Stripe/Razorpay) process asynchronously via Webhooks.
- **Impact:** If a user closes the browser window during payment authorization, the order will remain `PENDING` forever without webhooks.
- **Fix:** Implement dedicated webhook routes (`app/api/webhooks/stripe/route.ts` and `app/api/webhooks/razorpay/route.ts`).

---

## 4. How & Where to Add Supabase

Supabase can be integrated into SkillSphere for 3 main capabilities:

1. **Database Host (PostgreSQL)**
2. **Cloud Storage (Avatars, Course Thumbnails, KYC Documents)**
3. **Realtime Engine (WebSockets for Live Chat & Notifications)**

---

### A. Supabase PostgreSQL Database Integration

#### **Where to modify:**

1. `.env`
2. [`prisma/schema.prisma`](file:///c:/Users/PRATIK/Desktop/SkillSphere/prisma/schema.prisma)

#### **Step-by-Step Implementation:**

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Get your connection strings from **Project Settings -> Database**:
   - **Transaction Pooler URL** (Port 6543) -> set as `DATABASE_URL`
   - **Direct Connection URL** (Port 5432) -> set as `DIRECT_URL`
3. Update your `.env` file:

```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgboiler=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

4. Push your Prisma schema to Supabase:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

### B. Supabase Cloud File Storage Integration

#### **Where to modify:**

1. Install Supabase JS SDK: `npm install @supabase/supabase-js`
2. `.env` (Add Supabase URL and Service Role Key)
3. [`lib/services/storage.service.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/lib/services/storage.service.ts)
4. [`app/api/admin/verifications/route.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/app/api/admin/verifications/route.ts)

#### **Step-by-Step Implementation:**

1. Create Buckets in Supabase Dashboard (**Storage -> Buckets**):
   - `public-assets` (Public: For avatars, course thumbnails, product preview images)
   - `kyc-documents` (Private: For identity verification PDFs & images)

2. Add credentials to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
STORAGE_PROVIDER="SUPABASE"
```

3. Update [`lib/services/storage.service.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/lib/services/storage.service.ts):

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface StorageUploadResult {
  url: string;
  key: string;
  provider: "MOCK" | "SUPABASE" | "S3";
}

export class StorageService {
  private static provider = process.env.STORAGE_PROVIDER || "MOCK";

  /**
   * Uploads file buffer or base64 to Supabase Storage Bucket
   */
  static async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    bucketName: string = "public-assets",
    contentType: string = "image/png",
  ): Promise<StorageUploadResult> {
    if (this.provider === "SUPABASE") {
      const filePath = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (error)
        throw new Error(`Supabase Storage upload failed: ${error.message}`);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        key: filePath,
        provider: "SUPABASE",
      };
    }

    // Fallback Mock
    return {
      url: `/uploads/${bucketName}/${Date.now()}-${fileName}`,
      key: `${bucketName}/${fileName}`,
      provider: "MOCK",
    };
  }

  /**
   * Generates a 15-minute secure pre-signed download URL for private KYC documents
   */
  static async getSignedUrl(
    bucketName: string,
    fileKey: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    if (this.provider === "SUPABASE") {
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(fileKey, expiresInSeconds);

      if (error)
        throw new Error(`Signed URL generation failed: ${error.message}`);
      return data.signedUrl;
    }
    return fileKey;
  }
}
```

---

### C. Supabase Realtime Engine (Live Chat & Notifications)

#### **Where to modify:**

1. Create client utility: `lib/supabase/client.ts`
2. Create Chat component: `components/messaging/ChatWindow.tsx`

#### **Implementation Snippet (`lib/supabase/client.ts`):**

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

#### **Subscribing to Realtime Messages in Component:**

```typescript
useEffect(() => {
  const channel = supabaseClient
    .channel("messages-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Message",
        filter: `receiverId=eq.${userId}`,
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      },
    )
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}, [userId]);
```

---

## 5. How & Where to Add Payment Gateways

SkillSphere supports digital marketplace item purchases, course enrollments, and mentor session bookings.

---

### A. Stripe Payment Integration

#### **Where to modify:**

1. Install Stripe packages: `npm install stripe @stripe/stripe-js`
2. `.env` (Add `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)
3. [`lib/services/payment.service.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/lib/services/payment.service.ts)
4. [`app/api/orders/route.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/app/api/orders/route.ts)
5. Create Webhook handler: `app/api/webhooks/stripe/route.ts` _(NEW)_

#### **Step-by-Step Implementation:**

1. Add credentials to `.env`:

```env
PAYMENT_PROVIDER="STRIPE"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

2. Update [`lib/services/payment.service.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/lib/services/payment.service.ts):

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-09-30.acacia" as any,
});

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  currency?: string;
  userEmail?: string;
}

export class PaymentService {
  private static provider = process.env.PAYMENT_PROVIDER || "MOCK";

  static async createPaymentIntent(input: ProcessPaymentInput) {
    if (this.provider === "STRIPE") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(input.amount * 100), // convert dollars to cents
        currency: input.currency || "usd",
        metadata: { orderId: input.orderId },
        receipt_email: input.userEmail,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id,
        provider: "STRIPE",
      };
    }

    // Mock Fallback
    return {
      clientSecret: "mock_client_secret",
      transactionId: `txn_mock_${Date.now()}`,
      provider: "MOCK",
    };
  }
}
```

3. Create Stripe Webhook Handler (`app/api/webhooks/stripe/route.ts`):

```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia" as any,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      // Mark Order as COMPLETED
      await db.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
      });

      // Record Payment Record
      await db.payment.create({
        data: {
          orderId,
          amount: paymentIntent.amount / 100,
          provider: "STRIPE",
          status: "COMPLETED",
          transactionId: paymentIntent.id,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

---

### B. Razorpay Payment Integration (For INR / Local Gateways)

#### **Where to modify:**

1. Install Razorpay SDK: `npm install razorpay`
2. `.env` (Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`)
3. [`lib/services/payment.service.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/lib/services/payment.service.ts)
4. Create Webhook handler: `app/api/webhooks/razorpay/route.ts` _(NEW)_

#### **Step-by-Step Implementation:**

1. Add credentials to `.env`:

```env
PAYMENT_PROVIDER="RAZORPAY"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
```

2. Generate Razorpay Order in [`lib/services/payment.service.ts`](file:///c:/Users/PRATIK/Desktop/SkillSphere/lib/services/payment.service.ts):

```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Inside PaymentService:
static async createRazorpayOrder(orderId: string, amountInINR: number) {
  const options = {
    amount: Math.round(amountInINR * 100), // Paise
    currency: "INR",
    receipt: orderId,
  };
  const rzpOrder = await razorpay.orders.create(options);
  return rzpOrder;
}
```

---

## 6. Actionable Step-by-Step Execution Plan

Follow these steps in order to get the project fully configured:

### Step 1: Install Dependencies

```bash
cmd /c npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Fill in `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and chosen provider keys.

### Step 3: Run Database Migrations & Seed

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 4: Verify TypeScript & Build

```bash
cmd /c npx tsc --noEmit
cmd /c npm run build
```

### Step 5: Start Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view SkillSphere running live!
