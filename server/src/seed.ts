import 'dotenv/config';
import prisma from './lib/prisma';

const WORK_TYPES = [
  'Кладка перегородок',
  'Монтаж опалубки',
  'Бетонирование',
  'Армирование',
  'Монтаж кровли',
  'Штукатурные работы',
  'Укладка плитки',
  'Электромонтажные работы',
];

async function main() {
  for (const name of WORK_TYPES) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seed completed: work types inserted');
}

main().catch(console.error).finally(() => prisma.$disconnect());
