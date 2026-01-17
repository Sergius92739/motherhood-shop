import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очистка данных (осторожно!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Очистка существующих данных...');
    await prisma.resetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
  }

  // Создание тестового администратора
  const adminPassword = await hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@motherhood.ru' },
    update: {},
    create: {
      email: 'admin@motherhood.ru',
      passwordHash: adminPassword,
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'ADMIN',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  // Создание тестового пользователя
  const userPassword = await hash('Password123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: userPassword,
      firstName: 'Мария',
      lastName: 'Иванова',
      role: 'CUSTOMER',
      emailVerified: true,
      status: 'ACTIVE',
      pregnancyWeek: 24,
      dueDate: new Date('2024-07-15'),
    },
  });

  // Создание адреса для пользователя
  await prisma.address.create({
    data: {
      userId: user.id,
      title: 'Дом',
      fullName: 'Мария Иванова',
      phone: '+79161234567',
      city: 'Москва',
      street: 'ул. Примерная',
      building: 'д. 10',
      apartment: 'кв. 25',
      isDefault: true,
    },
  });

  console.log('✅ База данных успешно заполнена!');
  console.log(`👤 Admin: ${admin.email} / Admin123!`);
  console.log(`👤 User: ${user.email} / Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });