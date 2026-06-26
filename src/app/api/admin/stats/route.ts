import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/stats — Dashboard statistics
export async function GET() {
 try {
 const now = new Date();
 const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

 const [
 totalOrders,
 thisMonthOrders,
 lastMonthOrders,
 totalProducts,
 totalCustomers,
 totalRevenue,
 thisMonthRevenue,
 lastMonthRevenue,
 recentOrders,
 ordersByDay,
 ] = await Promise.all([
 prisma.order.count(),
 prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
 prisma.order.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
 prisma.product.count({ where: { active: true } }),
 prisma.user.count({ where: { role: 'customer' } }),
 prisma.order.aggregate({ _sum: { total: true } }),
 prisma.order.aggregate({ where: { createdAt: { gte: thisMonth } }, _sum: { total: true } }),
 prisma.order.aggregate({ where: { createdAt: { gte: lastMonth, lt: thisMonth } }, _sum: { total: true } }),
 prisma.order.findMany({
 take: 10,
 orderBy: { createdAt: 'desc' },
 include: {
 user: { select: { name: true, email: true } },
 items: { select: { quantity: true, totalPrice: true } },
 },
 }),
 prisma.order.groupBy({
 by: ['createdAt'],
 _count: true,
 orderBy: { createdAt: 'desc' },
 take: 30,
 }),
 ]);

 const revenue = totalRevenue._sum.total || 0;
 const thisMonthRev = thisMonthRevenue._sum.total || 0;
 const lastMonthRev = lastMonthRevenue._sum.total || 0;

 const orderChange = lastMonthOrders > 0 ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : '0';
 const revenueChange = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : '0';

 // Build weekly chart data
 const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 const weeklyData = days.map((day, i) => {
 const count = ordersByDay.filter(o => new Date(o.createdAt).getDay() === i).reduce((sum, o) => sum + o._count, 0);
 return { day, count };
 });

 return NextResponse.json({
 stats: [
 { label: 'revenue', value: `$${(revenue / 1000).toFixed(1)}K`, change: `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`, icon: '', positive: Number(revenueChange) >= 0 },
 { label: 'orders', value: totalOrders.toLocaleString(), change: `${Number(orderChange) >= 0 ? '+' : ''}${orderChange}%`, icon: '', positive: Number(orderChange) >= 0 },
 { label: 'products', value: totalProducts.toLocaleString(), change: '+0%', icon: '', positive: true },
 { label: 'customers', value: totalCustomers.toLocaleString(), change: '+0%', icon: '👥', positive: true },
 ],
 recentOrders,
 weeklyChart: weeklyData,
 });
 } catch (error) {
 console.error('GET /api/admin/stats error:', error);
 return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
 }
}
