import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/stock — Get stock info
// ?mode=alerts&threshold=20  → low stock only (default)
// ?mode=all                  → all products with stock info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'alerts';
    const threshold = parseInt(searchParams.get('threshold') || '20');
    const search = searchParams.get('search') || '';

    if (mode === 'all') {
      // Return ALL products with full variant/stock info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { nameFr: { contains: search, mode: 'insensitive' } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, icon: true, name: true, nameFr: true, nameAr: true } },
          variants: { orderBy: [{ type: 'asc' }, { name: 'asc' }] },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { name: 'asc' },
      });

      const enriched = products.map(p => {
        const sizeVariants = p.variants.filter(v => v.type === 'size');
        const totalStock = sizeVariants.reduce((sum, v) => sum + v.stock, 0);
        return { ...p, totalStock };
      });

      return NextResponse.json(enriched);
    }

    // Default: alerts mode
    const variants = await prisma.productVariant.findMany({
      where: { type: 'size', stock: { lte: threshold } },
      include: {
        product: { select: { id: true, name: true, nameFr: true, nameAr: true, price: true, active: true, category: { select: { icon: true, name: true } } } },
      },
      orderBy: { stock: 'asc' },
    });

    const productMap = new Map<string, { product: typeof variants[0]['product']; totalStock: number; variants: { name: string; stock: number }[] }>();

    for (const v of variants) {
      if (!v.product.active) continue;
      const existing = productMap.get(v.productId);
      if (existing) {
        existing.totalStock += v.stock;
        existing.variants.push({ name: v.name, stock: v.stock });
      } else {
        productMap.set(v.productId, {
          product: v.product,
          totalStock: v.stock,
          variants: [{ name: v.name, stock: v.stock }],
        });
      }
    }

    const alerts = Array.from(productMap.values())
      .filter(p => p.totalStock <= threshold)
      .sort((a, b) => a.totalStock - b.totalStock);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('GET /api/stock error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
  }
}

// PATCH /api/stock — Update variant stock (single or batch)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // Batch update: [{ variantId, stock }, ...]
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const variant = await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: item.stock },
        });
        results.push(variant);
      }
      return NextResponse.json({ updated: results.length, variants: results });
    }

    // Single update: { variantId, stock }
    const { variantId, stock } = body;
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error('PATCH /api/stock error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
