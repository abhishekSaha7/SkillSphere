import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseSchema } from '@/lib/validations/course';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'PUBLISHED';

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (level && level !== 'ALL') {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const courses = await db.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, avatar: true } },
        modules: {
          include: { lessons: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Only instructors can create courses.' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = courseSchema.parse(body);

    const course = await db.course.create({
      data: {
        ...validatedData,
        instructorId: session.user.id,
        status: 'PENDING_REVIEW', // Requires admin approval
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create course' }, { status: 500 });
  }
}
