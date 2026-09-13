import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SkillSphere database...');

  // Hash passwords
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Super Admin',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Dr. Sarah Jenkins',
      passwordHash: defaultPasswordHash,
      role: 'INSTRUCTOR',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      instructorProfile: {
        create: {
          title: 'Senior Full Stack Software Architect',
          bio: '12+ years of industry experience teaching React, Node.js, and Cloud Architectures.',
          expertise: 'Full Stack Web Development, Next.js, Cloud Architecture',
          yearsExperience: 12,
        },
      },
    },
  });

  // 3. Mentor
  const mentorUser = await prisma.user.upsert({
    where: { email: 'mentor@example.com' },
    update: {},
    create: {
      email: 'mentor@example.com',
      name: 'Alex Rivera',
      passwordHash: defaultPasswordHash,
      role: 'MENTOR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      mentorProfile: {
        create: {
          title: 'Lead Systems Engineer @ TechCorp',
          bio: 'Helping engineers land top tech roles, crack system design interviews, and accelerate career progress.',
          expertise: 'System Design, Career Coaching, Node.js, Microservices',
          hourlyRate: 75.0,
          yearsExperience: 9,
          consultationTypes: 'System Design Mock Interview, Resume Review, Career Roadmap',
          rating: 4.9,
          totalReviews: 28,
        },
      },
    },
  });

  // 4. Student
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'John Doe',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      studentProfile: {
        create: {
          skills: 'HTML, CSS, JavaScript',
          interests: 'Next.js, TypeScript, AI Engineering',
          learningGoals: 'Become a Senior Full-Stack Next.js Developer',
          bio: 'Passionate learner aiming to transition into high-growth software development roles.',
        },
      },
    },
  });

  // 5. Training Organization
  const orgUser = await prisma.user.upsert({
    where: { email: 'org@example.com' },
    update: {},
    create: {
      email: 'org@example.com',
      name: 'TechAcademy Global',
      passwordHash: defaultPasswordHash,
      role: 'ORGANIZATION',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
      organizationProfile: {
        create: {
          companyName: 'TechAcademy Global',
          website: 'https://techacademy.example.com',
          description: 'Leading international professional certification academy for enterprise technologies.',
        },
      },
    },
  });

  console.log('✅ Base users created: Admin, Instructor, Mentor, Student, Organization');

  // Seed Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Full-Stack Next.js 14 Masterclass: Zero to Hero',
      description: 'Master modern full-stack development using Next.js App Router, React 18, TypeScript, Tailwind CSS, and Prisma ORM.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
      category: 'Web Development',
      level: 'INTERMEDIATE',
      price: 89.99,
      status: 'PUBLISHED',
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Module 1: Next.js Fundamentals & App Router',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Introduction to Next.js App Router & Architecture',
                  content: 'Understanding Server Components, Client Components, and Routing paradigm.',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  duration: 15,
                  order: 1,
                  isFree: true,
                },
                {
                  title: 'Server-Side Rendering (SSR) & Static Site Generation (SSG)',
                  content: 'Deep dive into rendering strategies and dynamic data fetching.',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  duration: 20,
                  order: 2,
                  isFree: false,
                },
              ],
            },
          },
          {
            title: 'Module 2: Database Integration with Prisma & PostgreSQL',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Prisma Schema Modeling & Migrations',
                  content: 'Designing relational schemas, relations, and executing database migrations.',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  duration: 25,
                  order: 1,
                  isFree: false,
                },
                {
                  title: 'Building REST API Route Handlers in Next.js',
                  content: 'Writing secure GET, POST, PATCH, and DELETE route handlers.',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  duration: 30,
                  order: 2,
                  isFree: false,
                },
              ],
            },
          },
        ],
      },
      assessments: {
        create: [
          {
            title: 'Next.js 14 Knowledge Check',
            passingScore: 80,
            questions: {
              create: [
                {
                  questionText: 'What is the default component rendering mode in Next.js App Router?',
                  questionType: 'MCQ',
                  options: JSON.stringify(['React Server Component', 'Client Component', 'Static HTML', 'Web Worker']),
                  correctAnswer: 'React Server Component',
                },
                {
                  questionText: 'Is Prisma an ORM for relational databases?',
                  questionType: 'TRUE_FALSE',
                  options: JSON.stringify(['True', 'False']),
                  correctAnswer: 'True',
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced Microservices & System Design',
      description: 'Learn how to architect high-throughput, fault-tolerant distributed systems using Node.js, Docker, and Kafka.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
      category: 'Software Engineering',
      level: 'ADVANCED',
      price: 129.99,
      status: 'PUBLISHED',
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Module 1: Principles of Distributed Systems',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'CAP Theorem and Eventual Consistency',
                  content: 'Understanding trade-offs in distributed data storage.',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  duration: 18,
                  order: 1,
                  isFree: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Courses & Modules seeded');

  // Enrollment & Progress for demo student
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      status: 'ACTIVE',
    },
  });

  // Get first lesson
  const firstLesson = await prisma.lesson.findFirst({
    where: { module: { courseId: course1.id } },
  });

  if (firstLesson) {
    await prisma.learningProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId: firstLesson.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  // Mentor Availability
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: mentorUser.id },
  });

  if (mentorProfile) {
    await prisma.mentorAvailability.createMany({
      data: [
        { mentorId: mentorProfile.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 60 },
        { mentorId: mentorProfile.id, dayOfWeek: 3, startTime: '10:00', endTime: '16:00', slotDuration: 60 },
        { mentorId: mentorProfile.id, dayOfWeek: 5, startTime: '13:00', endTime: '18:00', slotDuration: 60 },
      ],
    });

    // Sample Booking
    await prisma.mentorBooking.create({
      data: {
        studentId: student.id,
        mentorId: mentorProfile.id,
        date: '2026-09-20',
        timeSlot: '10:00 AM - 11:00 AM',
        sessionType: 'System Design Mock Interview',
        fee: 75.0,
        status: 'CONFIRMED',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        notes: 'Review microservices design and API gateway setup.',
      },
    });
  }

  // Educational Products
  await prisma.product.createMany({
    data: [
      {
        title: 'Full-Stack Technical Interview Survival Handbook (PDF)',
        description: 'Comprehensive guide covering 150+ real coding interview questions, system design templates, and behavioral strategies.',
        productType: 'EBOOK',
        price: 29.99,
        fileUrl: '/mock-downloads/interview-handbook.pdf',
        sellerId: instructor.id,
      },
      {
        title: 'AWS Certified Solutions Architect Exam Test Pack (10 Practice Tests)',
        description: 'Realistic exam simulation with detailed answers and references for 2026 certification syllabus.',
        productType: 'PRACTICE_TEST',
        price: 39.99,
        fileUrl: '/mock-downloads/aws-practice-tests.pdf',
        sellerId: instructor.id,
      },
    ],
  });

  // Discussions
  await prisma.discussion.create({
    data: {
      title: 'Best practices for organizing Next.js App Router Server Actions vs Route Handlers?',
      content: 'I am building an enterprise Next.js app and wondering when to prefer Server Actions over API route handlers.',
      authorId: student.id,
      courseId: course1.id,
      comments: {
        create: [
          {
            authorId: instructor.id,
            content: 'Great question! Use Server Actions for progressive form enhancements and direct mutations. Use Route Handlers for public REST APIs or webhooks.',
          },
        ],
      },
    },
  });

  // KYC Verification Document for Instructor
  await prisma.kYCDocument.create({
    data: {
      userId: instructor.id,
      documentType: 'University Degree & Professional License',
      fileUrl: '/mock-docs/sarah-jenkins-degree.pdf',
      status: 'APPROVED',
      notes: 'Verified against university database.',
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: 'Mentor Session Confirmed',
        message: 'Your 1-on-1 session with Alex Rivera on 2026-09-20 has been confirmed.',
        link: '/student/bookings',
      },
      {
        userId: student.id,
        title: 'Welcome to SkillSphere!',
        message: 'Explore courses, connect with top mentors, and accelerate your tech career today.',
        link: '/student/dashboard',
      },
    ],
  });

  console.log('🎉 SkillSphere Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
