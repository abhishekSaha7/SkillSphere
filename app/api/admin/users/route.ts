import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    const { userId, status } = await req.json();

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (targetUser.role === 'SUPER_ADMIN') return NextResponse.json({ error: 'Cannot modify Super Admin accounts.' }, { status: 400 });

    const updated = await db.user.update({
      where: { id: userId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user status' }, { status: 500 });
  }
}
