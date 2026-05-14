import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { active: true },
            },
          },
        },
      },
    });

    const result = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameEn: cat.nameEn,
      namePt: cat.namePt,
      nameFr: cat.nameFr,
      nameDe: cat.nameDe,
      description: cat.description,
      imageUrl: cat.imageUrl,
      sortOrder: cat.sortOrder,
      productCount: cat._count.products,
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
