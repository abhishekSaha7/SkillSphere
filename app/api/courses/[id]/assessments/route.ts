import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const course = await db.course.findUnique({
      where: { id: params.id },
      select: { instructorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const assessments = await db.assessment.findMany({
      where: { courseId: params.id },
      include: {
        questions: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch course assessments' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Instructor authorization required.' }, { status: 403 });
    }

    const course = await db.course.findUnique({ where: { id: params.id } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.instructorId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You do not own this course.' }, { status: 403 });
    }

    const { title, passingScore, questions } = await req.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Assessment title is required' }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }

    // Atomic creation via Prisma Transaction
    const newAssessment = await db.$transaction(async (tx) => {
      const assessment = await tx.assessment.create({
        data: {
          courseId: params.id,
          title: title.trim(),
          passingScore: Number(passingScore) || 70,
        },
      });

      const questionData = questions.map((q: any) => ({
        assessmentId: assessment.id,
        questionText: q.questionText,
        questionType: q.questionType || 'MCQ',
        options: Array.isArray(q.options) ? JSON.stringify(q.options) : (q.options || '[]'),
        correctAnswer: q.correctAnswer,
      }));

      await tx.question.createMany({
        data: questionData,
      });

      return tx.assessment.findUnique({
        where: { id: assessment.id },
        include: { questions: true },
      });
    });

    return NextResponse.json(newAssessment, { status: 201 });
  } catch (error: any) {
    console.error('[Course Assessments POST Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to create assessment' }, { status: 500 });
  }
}
