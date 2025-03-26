import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { id: 1 },
      data: { role: 'ADMIN' },
    });
    console.log('User updated successfully:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 

// npx ts-node scripts/make-admin.ts 로 실행