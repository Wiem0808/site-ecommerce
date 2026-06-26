import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// GET /api/orders — List orders (with optional filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true, nameFr: true, nameAr: true } } } },
          tracking: { orderBy: { timestamp: 'asc' } },
          invoices: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, addressId, paymentMethod, items, promoCode, shippingAddress } = body;

    // Validate items and compute totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }

      // Check stock
      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant && variant.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${product.name} (${variant.name})` }, { status: 400 });
        }
      }

      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productName: product.name,
        variantName: item.variantName || null,
      });
    }

    // Apply promo code
    let discount = 0;
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (promo && promo.active && (!promo.expiresAt || promo.expiresAt > new Date())) {
        if (subtotal >= promo.minOrderValue) {
          if (promo.discountType === 'percentage') {
            discount = subtotal * (promo.discountValue / 100);
          } else {
            discount = promo.discountValue;
          }
          // Update usage count
          await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
        }
      }
    }

    const shippingCost = subtotal - discount > 100 ? 0 : 9.99;
    const tax = (subtotal - discount) * 0.2;
    const total = subtotal - discount + shippingCost + tax;

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = (await prisma.order.count()) + 1;
    const orderNumber = `WW-${dateStr}-${String(seq).padStart(3, '0')}`;

    // Create or find address
    let finalAddressId = addressId;
    if (!finalAddressId && shippingAddress && userId) {
      const addr = await prisma.address.create({
        data: { userId, ...shippingAddress },
      });
      finalAddressId = addr.id;
    }

    // Use a guest user ID if no userId provided
    let finalUserId = userId;
    if (!finalUserId) {
      // Create guest user
      const guestId = uuidv4();
      const guest = await prisma.user.create({
        data: { id: guestId, email: `guest-${guestId.slice(0, 8)}@wiwishop.com`, passwordHash: '', name: shippingAddress?.name || 'Guest', role: 'customer' },
      });
      finalUserId = guest.id;
      if (shippingAddress) {
        const addr = await prisma.address.create({
          data: { userId: finalUserId, ...shippingAddress },
        });
        finalAddressId = addr.id;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: finalUserId,
        addressId: finalAddressId,
        status: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        subtotal,
        shippingCost,
        tax,
        total,
        promoCode: promoCode || null,
        discount,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Create initial tracking event
    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status: 'confirmed',
        label: 'Order Confirmed',
        labelFr: 'Commande Confirmée',
        labelAr: 'تم تأكيد الطلب',
      },
    });

    // Create invoice
    const invoiceType = paymentMethod === 'cod' ? 'proforma' : 'final';
    const invoiceNumber = `${invoiceType === 'proforma' ? 'PRO' : 'INV'}-${dateStr}-${String(seq).padStart(3, '0')}`;
    await prisma.invoice.create({
      data: { orderId: order.id, type: invoiceType, invoiceNumber },
    });

    // Decrease stock
    for (const item of items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Fetch complete order
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        tracking: true,
        invoices: true,
        address: true,
      },
    });

    return NextResponse.json(fullOrder, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
