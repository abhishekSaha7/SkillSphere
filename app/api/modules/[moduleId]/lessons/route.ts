import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, content, videoUrl, duration, isFree } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Lesson title is required' }, { status: 400 });
    }

    const lesson = await db.lesson.create({
      data: {
        moduleId: params.moduleId,
        title,
        content,
        videoUrl,
        duration: duration || 10,
        isFree: !!isFree,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create lesson' }, { status: 500 });
  }
}
