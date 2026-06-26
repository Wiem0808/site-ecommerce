require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

try {
  const prisma = new PrismaClient();
  prisma.$connect()
    .then(() => {
      console.log('OK: Connected to PostgreSQL wiwi_shop');
      return prisma.$disconnect();
    })
    .catch(e => {
      console.error('CONNECTION ERROR:', e.message.substring(0, 500));
      process.exit(1);
    });
} catch (e) {
  console.error('INIT ERROR (full):', e.message.substring(0, 1000));
  process.exit(1);
}
