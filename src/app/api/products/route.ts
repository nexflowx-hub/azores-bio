import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('categorySlug');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'featured';
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: Record<string, unknown> = {
      active: true,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { description: { contains: search } },
        { descriptionEn: { contains: search } },
        { origin: { contains: search } },
      ];
    }

    // Build orderBy
    let orderBy: Record<string, unknown> = { createdAt: 'desc' };
    switch (sort) {
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
