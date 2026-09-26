import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Authenticated user session required.' },
        { status: 401 }
      );
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required.' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Fetch enrollment
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        progress: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'User is not enrolled in this course.' },
        { status: 404 }
      );
    }

    // Fetch full course data including modules, lessons, and assessments
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { include: { lessons: true } },
        assessments: true,
        instructor: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      );
    }

    const allLessons = course.modules.flatMap((m) => m.lessons);
    const completedLessonIds = new Set(
      enrollment.progress.filter((p) => p.isCompleted).map((p) => p.lessonId)
    );

    const lessonsCompletedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const totalLessonsCount = allLessons.length;
    const allLessonsDone = totalLessonsCount > 0 && lessonsCompletedCount === totalLessonsCount;

    // Check assessments
    let allAssessmentsPassed = true;
    if (course.assessments.length > 0) {
      const attempts = await db.assessmentAttempt.findMany({
        where: {
          userId,
          assessmentId: { in: course.assessments.map((a) => a.id) },
          passed: true,
        },
      });

      const passedAssessmentIds = new Set(attempts.map((a) => a.assessmentId));
      allAssessmentsPassed = course.assessments.every((a) => passedAssessmentIds.has(a.id));
    }

    const isFullyCompleted = allLessonsDone && allAssessmentsPassed;

    if (isFullyCompleted) {
      // Mark enrollment as completed if not already marked
      if (enrollment.status !== 'COMPLETED') {
        await db.enrollment.update({
          where: { id: enrollment.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }

      // Check or create certificate
      let certificate = await db.certificate.findFirst({
        where: { userId, courseId },
      });

      if (!certificate) {
        certificate = await db.certificate.create({
          data: {
            userId,
            courseId,
            certificateCode: `SKILL-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
          },
        });
      }

      return NextResponse.json({
        isCompleted: true,
        certificateId: certificate.id,
        certificateCode: certificate.certificateCode,
        issuedAt: certificate.issuedAt,
        lessonsCompleted: lessonsCompletedCount,
        totalLessons: totalLessonsCount,
      });
    }

    return NextResponse.json({
      isCompleted: false,
      lessonsCompleted: lessonsCompletedCount,
      totalLessons: totalLessonsCount,
      allLessonsDone,
      allAssessmentsPassed,
      totalAssessments: course.assessments.length,
    });
  } catch (error: any) {
    console.error('Certificate check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check completion status.' },
      { status: 500 }
    );
  }
}
