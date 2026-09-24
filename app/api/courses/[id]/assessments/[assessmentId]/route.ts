import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string; assessmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assessment = await db.assessment.findUnique({
      where: { id: params.assessmentId },
      include: { questions: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.courseId !== params.id) {
      return NextResponse.json({ error: 'Assessment does not belong to this course' }, { status: 400 });
    }

    return NextResponse.json(assessment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch assessment' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; assessmentId: string } }
) {
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

    const existingAssessment = await db.assessment.findUnique({ where: { id: params.assessmentId } });
    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (existingAssessment.courseId !== params.id) {
      return NextResponse.json({ error: 'Assessment does not belong to this course' }, { status: 400 });
    }

    const { title, passingScore, questions } = await req.json();

    // Atomic update via Prisma Transaction
    const updatedAssessment = await db.$transaction(async (tx) => {
      await tx.assessment.update({
        where: { id: params.assessmentId },
        data: {
          title: title ? title.trim() : existingAssessment.title,
          passingScore: passingScore !== undefined ? Number(passingScore) : existingAssessment.passingScore,
        },
      });

      if (questions && Array.isArray(questions)) {
        // Replace questions for this assessment
        await tx.question.deleteMany({
          where: { assessmentId: params.assessmentId },
        });

        const questionData = questions.map((q: any) => ({
          assessmentId: params.assessmentId,
          questionText: q.questionText,
          questionType: q.questionType || 'MCQ',
          options: Array.isArray(q.options) ? JSON.stringify(q.options) : (q.options || '[]'),
          correctAnswer: q.correctAnswer,
        }));

        await tx.question.createMany({
          data: questionData,
        });
      }

      return tx.assessment.findUnique({
        where: { id: params.assessmentId },
        include: { questions: true },
      });
    });

    return NextResponse.json(updatedAssessment);
  } catch (error: any) {
    console.error('[Assessment PATCH Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to update assessment' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; assessmentId: string } }
) {
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

    const assessment = await db.assessment.findUnique({ where: { id: params.assessmentId } });
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.courseId !== params.id) {
      return NextResponse.json({ error: 'Assessment does not belong to this course' }, { status: 400 });
    }

    await db.assessment.delete({ where: { id: params.assessmentId } });

    return NextResponse.json({ message: 'Assessment deleted successfully' });
  } catch (error: any) {
    console.error('[Assessment DELETE Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to delete assessment' }, { status: 500 });
  }
}
