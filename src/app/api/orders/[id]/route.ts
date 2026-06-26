import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/orders/[id] — Get order with tracking
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Search by id or orderNumber
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        items: {
          include: {
            product: { select: { name: true, nameFr: true, nameAr: true, price: true } },
          },
        },
        tracking: { orderBy: { timestamp: 'asc' } },
        invoices: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — Update order status
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, location, latitude, longitude } = body;

    const statusLabels: Record<string, { en: string; fr: string; ar: string }> = {
      confirmed: { en: 'Order Confirmed', fr: 'Commande Confirmée', ar: 'تم تأكيد الطلب' },
      processing: { en: 'Processing', fr: 'En Traitement', ar: 'قيد المعالجة' },
      shipped: { en: 'Shipped', fr: 'Expédié', ar: 'تم الشحن' },
      out_for_delivery: { en: 'Out for Delivery', fr: 'En cours de livraison', ar: 'في طريقه إليك' },
      delivered: { en: 'Delivered', fr: 'Livré', ar: 'تم التسليم' },
      cancelled: { en: 'Cancelled', fr: 'Annulée', ar: 'ملغاة' },
    };

    // Update order status
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Add tracking event
    if (status && statusLabels[status]) {
      await prisma.trackingEvent.create({
        data: {
          orderId: id,
          status,
          label: statusLabels[status].en,
          labelFr: statusLabels[status].fr,
          labelAr: statusLabels[status].ar,
          location: location || null,
          latitude: latitude || null,
          longitude: longitude || null,
        },
      });
    }

    // If COD and delivered, update to paid and create final invoice
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      await prisma.order.update({
        where: { id },
        data: { paymentStatus: 'paid' },
      });

      // Create final invoice
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const seq = (await prisma.invoice.count()) + 1;
      await prisma.invoice.create({
        data: {
          orderId: id,
          type: 'final',
          invoiceNumber: `INV-${dateStr}-${String(seq).padStart(3, '0')}`,
        },
      });
    }

    // Return updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { tracking: { orderBy: { timestamp: 'asc' } }, invoices: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
