import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, order } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Module title is required' }, { status: 400 });
    }

    const moduleRecord = await db.courseModule.create({
      data: {
        courseId: params.id,
        title,
        order: order || 1,
      },
    });

    return NextResponse.json(moduleRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create module' }, { status: 500 });
  }
}
