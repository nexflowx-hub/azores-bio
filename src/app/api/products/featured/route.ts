import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
        active: true,
        featured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            namePt: true,
            nameFr: true,
            nameDe: true,
          },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
