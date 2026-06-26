import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/flash-sale — Get all products in flash sale (countdownEnd != null AND in the future)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        countdownEnd: { not: null },
      },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: { select: { rating: true } },
      },
      orderBy: { countdownEnd: 'asc' },
    });

    const enriched = products.map(p => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length : 0;
      const totalStock = p.variants
        .filter(v => v.type === 'size')
        .reduce((sum, v) => sum + v.stock, 0);
      return {
        ...p,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        stock: totalStock,
        reviews: undefined,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('GET /api/flash-sale error:', error);
    return NextResponse.json({ error: 'Failed to fetch flash sale products' }, { status: 500 });
  }
}

// POST /api/flash-sale — Add a product to flash sale
export async function POST(request: Request) {
  try {
    const { productId, countdownEnd, discountPercent } = await request.json();
    if (!productId || !countdownEnd) {
      return NextResponse.json({ error: 'productId and countdownEnd required' }, { status: 400 });
    }

    // Optionally apply a discount
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {
      countdownEnd: new Date(countdownEnd),
      badge: 'FLASH',
    };

    // If a discount is provided, set originalPrice and calculate new price
    if (discountPercent && discountPercent > 0) {
      const originalPrice = product.originalPrice ?? product.price;
      const newPrice = Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
      updateData.originalPrice = originalPrice;
      updateData.price = newPrice;
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true, variants: true, images: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('POST /api/flash-sale error:', error);
    return NextResponse.json({ error: 'Failed to add to flash sale' }, { status: 500 });
  }
}

// DELETE /api/flash-sale — Remove a product from flash sale
export async function DELETE(request: Request) {
  try {
    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Restore original price if it was discounted, remove flash badge
    const updateData: Record<string, unknown> = {
      countdownEnd: null,
      badge: null,
    };

    // If originalPrice exists, restore price
    if (product.originalPrice) {
      updateData.price = product.originalPrice;
      updateData.originalPrice = null;
    }

    await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/flash-sale error:', error);
    return NextResponse.json({ error: 'Failed to remove from flash sale' }, { status: 500 });
  }
}
