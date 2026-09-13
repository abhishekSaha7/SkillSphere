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

    const { kycId, status, notes } = await req.json();

    const updatedKYC = await db.kYCDocument.update({
      where: { id: kycId },
      data: { status, notes },
      include: { user: true },
    });

    await db.notification.create({
      data: {
        userId: updatedKYC.userId,
        title: status === 'APPROVED' ? '✅ Verification Approved!' : 'Verification Update',
        message: `Your identity & qualification document status is now ${status}.`,
        link: '/instructor/profile',
      },
    });

    return NextResponse.json(updatedKYC);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update KYC status' }, { status: 500 });
  }
}
