import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/promo/validate — Validate a promo code
export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    const promo = await prisma.promoCode.findUnique({ where: { code } });

    if (!promo) return NextResponse.json({ valid: false, error: 'Invalid promo code' });
    if (!promo.active) return NextResponse.json({ valid: false, error: 'This promo code is no longer active' });
    if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ valid: false, error: 'This promo code has expired' });
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return NextResponse.json({ valid: false, error: 'This promo code has been fully used' });
    if (subtotal < promo.minOrderValue) return NextResponse.json({ valid: false, error: `Minimum order of $${promo.minOrderValue} required` });

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = subtotal * (promo.discountValue / 100);
    } else {
      discount = Math.min(promo.discountValue, subtotal);
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      code: promo.code,
    });
  } catch (error) {
    console.error('POST /api/promo/validate error:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
