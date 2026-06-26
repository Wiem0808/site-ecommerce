require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const variants = await prisma.productVariant.count();
  const orders = await prisma.order.count();
  const reviews = await prisma.review.count();
  const promos = await prisma.promoCode.count();
  const tracking = await prisma.trackingEvent.count();
  const invoices = await prisma.invoice.count();

  console.log('📊 WIWI_SHOP Database Status:');
  console.log('  Users:', users);
  console.log('  Categories:', categories);
  console.log('  Products:', products);
  console.log('  Variants:', variants);
  console.log('  Reviews:', reviews);
  console.log('  Orders:', orders);
  console.log('  Tracking Events:', tracking);
  console.log('  Invoices:', invoices);
  console.log('  Promo Codes:', promos);

  await prisma.$disconnect();
  await pool.end();
}

verify().catch(e => { console.error(e); process.exit(1); });
