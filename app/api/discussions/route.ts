import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const discussions = await db.discussion.findMany({
      include: {
        author: { select: { name: true, avatar: true, role: true } },
        course: { select: { title: true } },
        comments: {
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(discussions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to participate in discussions.' }, { status: 401 });
    }

    const { title, content, courseId } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const discussion = await db.discussion.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        courseId: courseId || null,
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create discussion' }, { status: 500 });
  }
}
