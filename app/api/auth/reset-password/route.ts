import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Password reset token is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token.' },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      await db.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { error: 'Password reset link has expired. Please request a new link.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account associated with this token no longer exists.' },
        { status: 404 }
      );
    }

    // SUPER_ADMIN RESTRICTION: Super Admins cannot reset passwords via user-facing token link
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Password reset via standard user flow is restricted for Super Admin accounts.' },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete token after successful password reset
    await db.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json(
      { message: 'Password reset successful! You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while resetting password.' },
      { status: 500 }
    );
  }
}
