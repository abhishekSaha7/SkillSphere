import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, avatar: true } },
            modules: { include: { lessons: true } },
          },
        },
        progress: { include: { lesson: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json(enrollments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Please log in as a student to enroll.' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already enrolled in this course', enrollment: existing }, { status: 200 });
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        status: 'ACTIVE',
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: 'Course Enrollment Confirmed',
        message: 'You have successfully enrolled! Start learning now.',
        link: `/student/courses/${courseId}`,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Enrollment failed' }, { status: 500 });
  }
}
