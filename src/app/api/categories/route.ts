import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories — List all categories with product count
export async function GET() {
 try {
 const categories = await prisma.category.findMany({
 orderBy: { sortOrder: 'asc' },
 include: {
 _count: { select: { products: true } },
 },
 });

 const result = categories.map(c => ({
 ...c,
 productCount: c._count.products,
 _count: undefined,
 }));

 return NextResponse.json(result);
 } catch (error) {
 console.error('GET /api/categories error:', error);
 return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
 }
}

// POST /api/categories — Create a new category
export async function POST(request: Request) {
 try {
 const body = await request.json();
 const { name, nameFr, nameAr, icon, gradient, sortOrder } = body;

 if (!name || !nameFr) {
 return NextResponse.json({ error: 'Name and French name are required' }, { status: 400 });
 }

 const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
 const category = await prisma.category.create({
 data: {
 name,
 nameFr,
 nameAr: nameAr || name,
 icon: icon || '',
 gradient: gradient || 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
 sortOrder: sortOrder ?? (maxSort._max.sortOrder || 0) + 1,
 },
 });

 return NextResponse.json(category, { status: 201 });
 } catch (error) {
 console.error('POST /api/categories error:', error);
 return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
 }
}
