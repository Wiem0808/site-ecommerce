import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products — List all products with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { active: true };

    if (category) where.categoryId = category;
    if (featured === 'true') where.featured = true;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameFr: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
          reviews: { select: { rating: true } },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Compute aggregate rating and total stock
    const enriched = products.map(p => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
      const totalStock = p.variants
        .filter(v => v.type === 'size')
        .reduce((sum, v) => sum + v.stock, 0);

      return {
        ...p,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        stock: totalStock,
        reviews: undefined, // don't include individual reviews in list
      };
    });

    return NextResponse.json({
      products: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — Create a new product (admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameFr, nameAr, description, descriptionFr, descriptionAr, price, originalPrice, categoryId, badge, countdownEnd, featured, variants, images } = body;

    const product = await prisma.product.create({
      data: {
        name, nameFr: nameFr || name, nameAr: nameAr || name,
        description, descriptionFr: descriptionFr || description, descriptionAr: descriptionAr || description,
        price, originalPrice, categoryId, badge,
        countdownEnd: countdownEnd ? new Date(countdownEnd) : null,
        featured: featured || false,
      },
    });

    // Create variants
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: { productId: product.id, type: v.type, name: v.name, value: v.value, stock: v.stock || 0 },
        });
      }
    }

    // Create images
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: { productId: product.id, url: images[i].url, alt: images[i].alt || name, sortOrder: i },
        });
      }
    }

    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: true, images: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
