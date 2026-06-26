import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wiwishop_secret_key_2024';

function verifyAdmin(request: Request) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) throw new Error('Unauthorized');
  const token = auth.slice(7);
  const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
  if (decoded.role !== 'admin') throw new Error('Forbidden — admin only');
  return decoded;
}

// GET /api/admin/staff — List all staff members
export async function GET(request: Request) {
  try {
    verifyAdmin(request);
    const staff = await prisma.user.findMany({
      where: { role: 'staff' },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, permissions: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(staff);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg.includes('Forbidden') ? 403 : 500 });
  }
}

// POST /api/admin/staff — Create a new staff account
export async function POST(request: Request) {
  try {
    verifyAdmin(request);
    const { name, email, password, phone, permissions } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Default permissions: all non-admin tabs
    const defaultPerms = ['overview', 'products', 'flash', 'orders', 'stock'];
    const staff = await prisma.user.create({
      data: {
        name, email, passwordHash,
        phone: phone || null,
        role: 'staff',
        permissions: JSON.stringify(permissions || defaultPerms),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, permissions: true, createdAt: true },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg.includes('Forbidden') ? 403 : 500 });
  }
}

// PATCH /api/admin/staff — Edit a staff member (name, phone, password, permissions)
export async function PATCH(request: Request) {
  try {
    verifyAdmin(request);
    const { staffId, name, phone, password, permissions } = await request.json();
    if (!staffId) return NextResponse.json({ error: 'staffId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: staffId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.role !== 'staff') return NextResponse.json({ error: 'User is not a staff member' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (password && password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    if (permissions) updateData.permissions = JSON.stringify(permissions);

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, permissions: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg.includes('Forbidden') ? 403 : 500 });
  }
}

// DELETE /api/admin/staff — Remove a staff member
export async function DELETE(request: Request) {
  try {
    verifyAdmin(request);
    const { staffId } = await request.json();
    if (!staffId) return NextResponse.json({ error: 'staffId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: staffId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.role !== 'staff') return NextResponse.json({ error: 'User is not a staff member' }, { status: 400 });

    await prisma.user.delete({ where: { id: staffId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg.includes('Forbidden') ? 403 : 500 });
  }
}
