import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Super Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Backend restriction: Prevent modifying the application name from "SkillSphere"
    if (body.siteName && body.siteName !== 'SkillSphere') {
      return NextResponse.json(
        { error: 'Application name modification is restricted. SkillSphere system name is locked.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Platform settings updated successfully.',
        settings: {
          siteName: 'SkillSphere',
          paymentProvider: body.paymentProvider || 'MOCK',
          storageProvider: body.storageProvider || 'MOCK',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update platform settings.' },
      { status: 500 }
    );
  }
}
