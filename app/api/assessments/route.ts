import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assessments = await db.assessment.findMany({
      include: {
        course: { select: { title: true } },
        questions: true,
        attempts: {
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assessments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId, userAnswers } = await req.json(); // userAnswers: Record<questionId, answerString>

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // SERVER-SIDE SCORING LOGIC (Do NOT trust client score)
    let correctCount = 0;
    const totalQuestions = assessment.questions.length;

    for (const q of assessment.questions) {
      const submittedAnswer = userAnswers[q.id]?.trim().toLowerCase();
      const expectedAnswer = q.correctAnswer?.trim().toLowerCase();

      if (submittedAnswer && expectedAnswer && submittedAnswer === expectedAnswer) {
        correctCount += 1;
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const passed = score >= assessment.passingScore;

    // Record Assessment Attempt
    const attempt = await db.assessmentAttempt.create({
      data: {
        userId: session.user.id,
        assessmentId,
        score,
        passed,
      },
    });

    // Notification
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: passed ? '🎉 Quiz Passed!' : 'Quiz Attempt Completed',
        message: `You scored ${score}% on "${assessment.title}". (${passed ? 'Passed' : 'Try again'})`,
        link: '/student/assessments',
      },
    });

    return NextResponse.json({
      attempt,
      score,
      passed,
      correctCount,
      totalQuestions,
      passingScore: assessment.passingScore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Assessment submission failed' }, { status: 500 });
  }
}
