import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enrollmentId, lessonId, isCompleted } = await req.json();

    const progress = await db.learningProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        enrollmentId,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Check if total lessons in course are completed to generate certificate automatically!
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
        progress: true,
      },
    });

    if (enrollment) {
      const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
      const completedLessons = enrollment.progress.filter((p) => p.isCompleted);

      if (allLessons.length > 0 && completedLessons.length >= allLessons.length) {
        // Mark enrollment as COMPLETED
        await db.enrollment.update({
          where: { id: enrollmentId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        // Issue Certificate if not already issued
        const existingCert = await db.certificate.findFirst({
          where: {
            userId: session.user.id,
            courseId: enrollment.courseId,
          },
        });

        if (!existingCert) {
          const newCert = await db.certificate.create({
            data: {
              userId: session.user.id,
              courseId: enrollment.courseId,
            },
          });

          await db.notification.create({
            data: {
              userId: session.user.id,
              title: '🏆 Certificate Earned!',
              message: `Congratulations! You have completed "${enrollment.course.title}" and earned a certificate.`,
              link: `/student/certificates`,
            },
          });
        }
      }
    }

    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update progress' }, { status: 500 });
  }
}
