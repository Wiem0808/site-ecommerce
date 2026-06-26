import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wiwishop-secret-key-change-in-production';

function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/auth/profile — get current user
export async function GET(request: Request) {
  const decoded = getUserFromToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PUT /api/auth/profile — update profile
export async function PUT(request: Request) {
  const decoded = getUserFromToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone } = body;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('PUT /api/auth/profile error:', error);
    return NextResponse.json({ error: 'Mise à jour échouée' }, { status: 500 });
  }
}
