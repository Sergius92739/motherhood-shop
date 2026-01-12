# SETUP.md — Инструкция по настройке проекта

## Оглавление
- [Требования к системе](#требования-к-системе)
- [Быстрый старт](#быстрый-старт)
- [Подробная настройка](#подробная-настройка)
- [Настройка базы данных](#настройка-базы-данных)
- [Настройка внешних сервисов](#настройка-внешних-сервисов)
- [Развёртывание на VDS](#развёртывание-на-vds)
- [Скрипты и команды](#скрипты-и-команды)
- [Устранение неполадок](#устранение-неполадок)

## Требования к системе

### Минимальные требования
- Node.js: 18.17.0 или выше
- npm: 9.0.0 или выше
- Docker: 20.10.0 или выше (опционально)
- PostgreSQL: 15 или выше
- Оперативная память: 4 ГБ
- Дисковое пространство: 10 ГБ

### Рекомендуемые требования
- Node.js: 20.9.0 (LTS)
- npm: 10.0.0
- Docker: 24.0.0 с Docker Compose
- PostgreSQL: 16
- Оперативная память: 8 ГБ
- Дисковое пространство: 20 ГБ

## Быстрый старт

### 1. **Клонирование репозитория**

   ```bash
   git clone <repository-url>
   cd motherhood-shop
   ```
### 2. Автоматическая настройка
   ```bash
   # Дайте права на выполнение скрипта
   chmod +x scripts/setup.sh

   # Запустите скрипт настройки
   ./scripts/setup.sh
   ```
### 3. Ручная настройка
#### Если автоматический скрипт не работает, выполните шаги вручную:
   ```bash
   # Установите зависимости
   npm install

   # Настройте переменные окружения
   cp .env.example .env.local
   
   # Отредактируйте .env.local (укажите свои значения)
   nano .env.local

   # Запустите базу данных через Docker
   docker-compose up -d postgres redis

   # Настройте базу данных
   npx prisma generate
   npx prisma db push

   # Запустите проект
   npm run dev
   ```
   ## Подробная настройка
   ### 1. Настройка переменных окружения
   #### Создайте файл .env.local на основе примера:
   ```bash
      # Дайте права на выполнение скрипта
      chmod +x scripts/setup.sh

      # Запустите скрипт настройки
      ./scripts/setup.sh
   ```
   #### Отредактируйте .env.local и укажите следующие значения:
   Обязательные настройки:
   ```bash
      # База данных
DATABASE_URL="postgresql://user:password@localhost:5432/motherhood_shop"

      # JWT
JWT_ACCESS_SECRET="your-32-character-secret-here"
JWT_REFRESH_SECRET="another-32-character-secret-here"

      # URL приложения
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   ```

### 2. Установка зависимостей  
```bash
# Полная установка зависимостей
npm ci

# Или установка только production зависимостей
npm ci --only=production

# Если есть проблемы с зависимостями
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
   ```
### 3. Настройка Docker
#### Локальная разработка с Docker:
```bash
# Запуск только базы данных
docker-compose up -d postgres redis

# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка всех сервисов
docker-compose down

# Остановка с удалением томов
docker-compose down -v
   ```

#### Без Docker (локальная база данных):
1. Установите PostgreSQL 15+

2. Создайте базу данных:
```sql
CREATE DATABASE motherhood_shop;
CREATE USER motherhood_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE motherhood_shop TO motherhood_user;
```
## Настройка базы данных

### 1. Инициализация базы данных
```bash
# Генерация Prisma клиента
npx prisma generate

# Создание миграций (если это первый запуск)
npx prisma migrate dev --name init

# Или применение схемы без миграций
npx prisma db push

# Запуск Prisma Studio для просмотра данных
npx prisma studio
```

### 2. Создание начальных данных
#### Создайте файл prisma/seed.ts:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Создание администратора
  await prisma.user.create({
    data: {
      email: 'admin@motherhood.ru',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      firstName: 'Администратор',
      lastName: 'Системы',
    },
  });

  // Создание категорий
  await prisma.category.createMany({
    data: [
      { name: 'Одежда для беременных', slug: 'odezhda' },
      { name: 'Аксессуары', slug: 'aksessuary' },
      { name: 'Для кормления', slug: 'kormlenie' },
    ],
  });

  console.log('Начальные данные созданы');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
#### Запустите сидинг:
```bash
npx ts-node prisma/seed.ts
```
### 3. Резервное копирование
```bash
# Экспорт базы данных
pg_dump -U motherhood_user motherhood_shop > backup_$(date +%Y%m%d).sql

# Импорт базы данных
psql -U motherhood_user motherhood_shop < backup_file.sql
```

## Настройка внешних сервисов

### 1. ЮKassa (Платежи)
1. Зарегистрируйтесь на kassa.yookassa.ru

2. Получите ShopID и Secret Key

3. Настройте вебхуки в личном кабинете:

   - URL: https://ваш-домен/api/payment/webhook

   - События: ```payment.succeeded, payment.canceled, payment.waiting_for_capture```

### 2. Яндекс Доставка
1. Зарегистрируйтесь в Яндекс Доставке

2. Получите API ключ

3. Настройте магазин в личном кабинете

### 3. Cloudinary (Изображения)
1. Создайте аккаунт на cloudinary.com

2. Получите Cloud Name, API Key и API Secret

3. Настройте пресеты для оптимизации изображений

### 4. Sentry (Мониторинг ошибок)
1. Создайте проект на sentry.io
2. Получите DSN для Next.js
3. Настройте окружения (development, production)

### 5. Почта России API
1. Зарегистрируйтесь на pochta.ru
2. Получите доступ к API
3. Настройте аккаунт для расчетов доставки

## Развертывание на VDS

### 1. Подготовка сервера

```bash
# Подключение к серверу
ssh user@server-ip

# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt install docker-compose-plugin

# Настройка пользователя для Docker
sudo usermod -aG docker $USER

# Установка Node.js (опционально)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

### 2. Развертывание приложения

```bash
# Клонирование репозитория
git clone <repository-url> /var/www/motherhood-shop
cd /var/www/motherhood-shop

# Копирование переменных окружения
cp .env.example .env.production
nano .env.production  # Отредактируйте файл

# Настройка прав
chmod 600 .env.production

# Запуск Docker контейнеров
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Инициализация базы данных
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed

# Настройка Nginx и SSL
sudo certbot --nginx -d ваш-домен.ru
```

### 3. Настройка CI/CD (GitHub Actions)
#### Создайте файл .github/workflows/deploy.yml:

```yaml
name: Deploy to VDS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/motherhood-shop
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

## Скрипты и команды
### Основные команды npm
```bash
# Разработка
npm run dev              # Запуск в режиме разработки
npm run build           # Сборка проекта
npm start              # Запуск production версии

# База данных
npm run prisma:generate # Генерация Prisma клиента
npm run prisma:migrate  # Применение миграций
npm run prisma:studio   # Открытие Prisma Studio

# Тестирование
npm test               # Запуск тестов
npm run test:watch     # Тесты в watch режиме
npm run test:coverage  # Тесты с покрытием

# Линтинг
npm run lint           # Проверка кода
npm run lint:fix       # Автоисправление ошибок

# Docker
npm run docker:build   # Сборка Docker образа
npm run docker:up      # Запуск контейнеров
npm run docker:down    # Остановка контейнеров
```
### Полезные скрипты
#### Проверка окружения
```bash
# Проверка версий
node --version
npm --version
docker --version
docker-compose --version

# Проверка доступности сервисов
curl http://localhost:3000/api/health
```

### Миграции базы данных
```bash
# Создание новой миграции
npx prisma migrate dev --name add_reviews_table

# Откат миграции
npx prisma migrate reset

# Проверка состояния миграций
npx prisma migrate status
```

## Устранение неполадок
### 1. Ошибки базы данных
#### Проблема: ```Не удается подключиться к PostgreSQL```
```bash
# Проверьте, запущена ли база данных
docker ps | grep postgres

# Проверьте логи
docker-compose logs postgres

# Проверьте строку подключения
echo $DATABASE_URL
```
#### Решение:
```bash
# Перезапустите базу данных
docker-compose restart postgres

# Сбросьте базу данных (осторожно!)
docker-compose down -v
docker-compose up -d postgres
```
### 2. Ошибки сборки Next.js
#### Проблема: ```Ошибки при npm run build```
#### Решение:
```bash
# Очистите кэш
rm -rf .next
rm -rf node_modules/.cache

# Переустановите зависимости
npm ci

# Попробуйте собрать с подробным выводом
npm run build --debug
```
### 3. Ошибки Docker
#### Проблема: Контейнеры не запускаются
```bash
# Проверьте статус контейнеров
docker-compose ps

# Просмотрите логи
docker-compose logs

# Проверьте использование портов
sudo lsof -i :3000
sudo lsof -i :5432
```

### 4. Ошибки Prisma
#### Проблема: ```PrismaClientInitializationError```
```bash
# Перегенерируйте Prisma клиент
npx prisma generate --force

# Проверьте строку подключения
cat .env.local | grep DATABASE_URL

# Перезапустите приложение
docker-compose restart app
```
## Дополнительная помощь
### Полезные ссылки
- [Документация Next.js](https://nextjs.org/docs)

- [Документация Prisma](https://www.prisma.io/docs)

- [Документация Docker](https://docs.docker.com/)

- [Документация PostgreSQL](https://www.postgresql.org/docs/)

### Поддержка
1. Проверьте логи: docker-compose logs -f

2. Посмотрите документацию модулей

3. Создайте issue в репозитории

4. Напишите на support@motherhood-shop.ru

### Важно: Все команды выполняйте из корневой директории проекта. Для production окружения используйте отдельный файл .env.production.
