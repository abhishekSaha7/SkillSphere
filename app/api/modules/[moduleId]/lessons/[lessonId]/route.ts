import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { moduleId: string; lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.module.course.instructorId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You do not own this course.' }, { status: 403 });
    }

    const { title, content, videoUrl, duration, isFree } = await req.json();

    const updated = await db.lesson.update({
      where: { id: params.lessonId },
      data: {
        title: title !== undefined ? title : lesson.title,
        content: content !== undefined ? content : lesson.content,
        videoUrl: videoUrl !== undefined ? videoUrl : lesson.videoUrl,
        duration: duration !== undefined ? Number(duration) : lesson.duration,
        isFree: isFree !== undefined ? Boolean(isFree) : lesson.isFree,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { moduleId: string; lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.module.course.instructorId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You do not own this course.' }, { status: 403 });
    }

    await db.lesson.delete({ where: { id: params.lessonId } });

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete lesson' }, { status: 500 });
  }
}
