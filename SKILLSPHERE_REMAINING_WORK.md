# SKILLSPHERE — REMAINING WORK & TASK PRIORITIZATION

**Date:** September 16, 2026  
**Document Purpose:** Prioritized roadmap of remaining tasks required to bring SkillSphere from zero-cost local development state to a full commercial production release.

---

## # P0 — BLOCKING (Commercial Go-Live Blockers)

### Task 1: Real Payment Gateway & Webhook Integration
- **Requirement:** Payment Processing & Webhooks (PAY-01, PAY-04, PAY-05, MP-11, PRD-05, PRD-17)
- **Current Status:** `MOCKED` / `MISSING`
- **Files Involved:**
  - [`lib/services/payment.service.ts`](file:///Users/abhisheksaha/Desktop/SkillSphere/lib/services/payment.service.ts)
  - [`app/api/orders/route.ts`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/api/orders/route.ts)
  - `app/api/webhooks/stripe/route.ts` *(NEW)*
- **What Needs To Be Implemented:**
  1. Integrate Stripe/Razorpay Node SDK inside [`PaymentService`](file:///Users/abhisheksaha/Desktop/SkillSphere/lib/services/payment.service.ts).
  2. Implement server-side PaymentIntent creation and signature verification.
  3. Create `/api/webhooks/stripe` to handle asynchronous events (`payment_intent.succeeded`, `charge.refunded`).
- **Dependencies:** Stripe or Razorpay API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- **Acceptance Criteria:** Submitting payment processes a live sandbox test card, fires a server webhook, and updates DB Order status to `COMPLETED`.

---

### Task 2: Cloud File Storage (S3 / Cloudinary / Supabase Storage)
- **Requirement:** Real File Uploads & Cloud Storage (STG-01, STG-02, STG-03, STG-04, REG-13, SUP-04, PRD-04)
- **Current Status:** `MOCKED`
- **Files Involved:**
  - [`lib/services/storage.service.ts`](file:///Users/abhisheksaha/Desktop/SkillSphere/lib/services/storage.service.ts)
  - [`app/api/admin/verifications/route.ts`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/api/admin/verifications/route.ts)
- **What Needs To Be Implemented:**
  1. Replace fake local string generator in [`StorageService`](file:///Users/abhisheksaha/Desktop/SkillSphere/lib/services/storage.service.ts) with AWS S3 `@aws-sdk/client-s3` or Supabase Storage JS SDK.
  2. Handle binary file stream uploads for avatar images, course thumbnails, and KYC PDF documents.
- **Dependencies:** AWS S3 bucket credentials or Supabase Storage bucket.
- **Acceptance Criteria:** Uploaded files produce publicly accessible or pre-signed HTTPS S3 URLs stored in PostgreSQL.

---

## # P1 — CRITICAL (Core Functional Polish)

### Task 3: Secure Pre-Signed URLs & Private Document Bucket
- **Requirement:** Secure Document Handling (STG-08, STG-09, PRD-06)
- **Current Status:** `MISSING`
- **Files Involved:**
  - [`lib/services/storage.service.ts`](file:///Users/abhisheksaha/Desktop/SkillSphere/lib/services/storage.service.ts)
  - [`app/admin/verifications/page.tsx`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/admin/verifications/page.tsx)
- **What Needs To Be Implemented:**
  1. Restrict KYC identity documents to a private, non-public S3 bucket.
  2. Generate short-lived (15-minute) pre-signed download URLs (`getSignedUrl`) when admins review verification requests.
- **Dependencies:** AWS S3 bucket policy configuration.
- **Acceptance Criteria:** KYC document URLs expire after 15 minutes and cannot be accessed publicly without admin authorization.

---

### Task 4: Real-Time Messaging & Notifications (WebSockets / Supabase Realtime)
- **Requirement:** Live Chat & Realtime Updates (MSG-10, SUP-05)
- **Current Status:** `MISSING`
- **Files Involved:**
  - [`prisma/schema.prisma`](file:///Users/abhisheksaha/Desktop/SkillSphere/prisma/schema.prisma#L442)
  - `components/messaging/ChatWindow.tsx` *(NEW)*
- **What Needs To Be Implemented:**
  1. Subscribe chat UI components to Supabase Realtime channels or Socket.io.
  2. Broadcast new messages directly to active recipient sockets without requiring page refresh.
- **Dependencies:** Supabase Realtime client or custom Socket.io server instance.
- **Acceptance Criteria:** Messages sent by a student instantly pop up on the mentor's screen in real time.

---

## # P2 — IMPORTANT (Feature Enhancements)

### Task 5: Password Reset Flow
- **Requirement:** Forgot Password & Email Recovery (AUT-09)
- **Current Status:** `MISSING`
- **Files Involved:**
  - `app/(auth)/forgot-password/page.tsx` *(NEW)*
  - `app/api/auth/reset-password/route.ts` *(NEW)*
- **What Needs To Be Implemented:**
  1. Build forgot password UI form requesting account email.
  2. Generate single-use password reset token stored with 1-hour expiration.
  3. Send email link to user and update password hash upon reset.
- **Dependencies:** SMTP / Resend / SendGrid email service.
- **Acceptance Criteria:** Clicking "Forgot Password" sends a valid reset email link allowing secure password updates.

---

### Task 6: PDF Certificate Binary Generation
- **Requirement:** PDF Certificate Download Engine (CRT-07)
- **Current Status:** `PARTIAL` (Browser print CSS implemented, missing server PDF binary buffer)
- **Files Involved:**
  - [`app/student/certificates/page.tsx`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/student/certificates/page.tsx)
  - `app/api/certificates/[id]/download/route.ts` *(NEW)*
- **What Needs To Be Implemented:**
  1. Integrate `jsPDF` or `pdfkit` in a Next.js API route handler.
  2. Stream high-resolution PDF diploma files directly to student browsers upon clicking Download.
- **Dependencies:** `jspdf` or `pdfkit` package.
- **Acceptance Criteria:** Clicking "Download PDF" downloads a clean `.pdf` file with student name, course title, and verification QR code.

---

### Task 7: Direct Video File Upload & Streaming Transcoding
- **Requirement:** Direct Video Upload & HLS Playback (VID-01, VID-02, VID-08)
- **Current Status:** `MISSING` / `MOCKED` (YouTube/Vimeo embeds supported, missing raw video file pipeline)
- **Files Involved:**
  - [`lib/services/video.service.ts`](file:///Users/abhisheksaha/Desktop/SkillSphere/lib/services/video.service.ts)
  - [`app/instructor/courses/[id]/edit/page.tsx`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/instructor/courses/[id]/edit/page.tsx)
- **What Needs To Be Implemented:**
  1. Connect Mux Video API or AWS IVS to process raw MP4/MOV uploads from instructors.
  2. Transcode uploaded video files into adaptive HLS streams (.m3u8).
- **Dependencies:** Mux Video API key or AWS IVS account.
- **Acceptance Criteria:** Instructors can drag & drop MP4 files which automatically transcode into adaptive video streams.

---

## # P3 — ENHANCEMENTS (Minor Nice-to-Have Features)

### Task 8: Course Wishlist / Saved Courses
- **Requirement:** Student Saved Courses (STU-08)
- **Current Status:** `MISSING`
- **Files Involved:**
  - [`prisma/schema.prisma`](file:///Users/abhisheksaha/Desktop/SkillSphere/prisma/schema.prisma)
  - [`app/courses/page.tsx`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/courses/page.tsx)
- **What Needs To Be Implemented:**
  1. Add `Wishlist` model to `schema.prisma`.
  2. Add bookmark heart icon on course cards to save/remove items.
- **Dependencies:** None.
- **Acceptance Criteria:** Students can bookmark courses and view saved items on their dashboard.

---

### Task 9: Dynamic Admin Categories & System Settings
- **Requirement:** System Settings Pages (ADM-18, ADM-19, ADM-20, ADM-21, ADM-23)
- **Current Status:** `PARTIAL` / `MISSING`
- **Files Involved:**
  - [`app/admin/settings/page.tsx`](file:///Users/abhisheksaha/Desktop/SkillSphere/app/admin/settings/page.tsx)
- **What Needs To Be Implemented:**
  1. Create dynamic forms for admins to manage course categories, site maintenance mode, and notification templates.
- **Dependencies:** None.
- **Acceptance Criteria:** Admins can add new course categories dynamically without code changes.
