import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const expertise = searchParams.get('expertise');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { bio: { contains: search } },
        { expertise: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    if (expertise && expertise !== 'ALL') {
      where.expertise = { contains: expertise };
    }

    const mentors = await db.mentorProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        availabilities: true,
      },
      orderBy: { rating: 'desc' },
    });

    return NextResponse.json(mentors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch mentors' }, { status: 500 });
  }
}
