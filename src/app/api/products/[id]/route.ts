import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[id] — Get single product with all details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;
    const totalStock = product.variants.filter(v => v.type === 'size').reduce((sum, v) => sum + v.stock, 0);

    return NextResponse.json({
      ...product,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      stock: totalStock,
    });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] — Update product (including images & variants)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update core product fields
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.nameFr !== undefined && { nameFr: body.nameFr }),
        ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.descriptionFr !== undefined && { descriptionFr: body.descriptionFr }),
        ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.badge !== undefined && { badge: body.badge }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.countdownEnd !== undefined && { countdownEnd: body.countdownEnd ? new Date(body.countdownEnd) : null }),
      },
    });

    // Replace images if provided
    if (body.images && Array.isArray(body.images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < body.images.length; i++) {
        await prisma.productImage.create({
          data: { productId: id, url: body.images[i].url, alt: body.images[i].alt || product.name, sortOrder: i },
        });
      }
    }

    // Replace variants if provided
    if (body.variants && Array.isArray(body.variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      for (const v of body.variants) {
        await prisma.productVariant.create({
          data: { productId: id, type: v.type, name: v.name, value: v.value, stock: v.stock || 0 },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, images: { orderBy: { sortOrder: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] — Hard or soft delete product
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    if (hard) {
      // Hard delete — remove completely (cascades in Prisma schema)
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.review.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ message: 'Product permanently deleted' });
    } else {
      // Soft delete — just deactivate
      await prisma.product.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ message: 'Product deactivated' });
    }
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
