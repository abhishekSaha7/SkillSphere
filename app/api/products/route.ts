import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const where: any = {};
    if (type && type !== 'ALL') where.productType = type;

    const products = await db.product.findMany({
      where,
      include: { seller: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ORGANIZATION' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized to post products.' }, { status: 403 });
    }

    const { title, description, productType, price, fileUrl } = await req.json();

    const product = await db.product.create({
      data: {
        title,
        description,
        productType,
        price: parseFloat(price) || 0,
        fileUrl: fileUrl || '/mock-downloads/sample-guide.pdf',
        sellerId: session.user.id,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
