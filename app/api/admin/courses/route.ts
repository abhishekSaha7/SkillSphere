import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const { courseId, status } = await req.json(); // PUBLISHED or REJECTED

    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: { status },
      include: { instructor: true },
    });

    // Notify Instructor
    await db.notification.create({
      data: {
        userId: updatedCourse.instructorId,
        title: status === 'PUBLISHED' ? '🎉 Course Approved & Published!' : 'Course Review Update',
        message: status === 'PUBLISHED'
          ? `Your course "${updatedCourse.title}" has been approved by Super Admin and is now live on SkillSphere!`
          : `Your course "${updatedCourse.title}" requires revisions before approval.`,
        link: `/instructor/courses/${courseId}/edit`,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update course status' }, { status: 500 });
  }
}
