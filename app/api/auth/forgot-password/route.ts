import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No user account found with that email address.' },
        { status: 404 }
      );
    }

    // SUPER_ADMIN RESTRICTION: Super Admins are restricted from resetting password via standard user flow
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Password reset via standard user flow is restricted for Super Admin accounts. Please contact system governance.' },
        { status: 403 }
      );
    }

    // Remove any existing active reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour token expiration

    await db.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    const resetUrl = `/reset-password?token=${token}`;

    return NextResponse.json(
      {
        message: 'Password reset link generated successfully.',
        resetUrl,
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during password reset request.' },
      { status: 500 }
    );
  }
}
