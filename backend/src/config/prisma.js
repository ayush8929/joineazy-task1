import { PrismaClient } from '@prisma/client';

// A single shared Prisma client instance for the whole app.
// Import `prisma` from here anywhere you need DB access.
export const prisma = new PrismaClient();

export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Postgres connected via Prisma');
  } catch (err) {
    console.error('Postgres connection failed:', err.message);
  }
}
