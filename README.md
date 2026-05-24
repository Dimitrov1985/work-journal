# Журнал работ на строительном объекте

Внутренний инструмент для учёта выполненных работ на объекте. Прораб ведёт журнал по дням: вид работ, объём, исполнитель.

## Стек

| Слой | Технология | Почему |
|------|-----------|--------|
| Frontend | React 18 + TypeScript + Vite | Быстрая сборка, строгая типизация |
| UI | Tailwind CSS + собственные компоненты | Гибкий, современный дизайн без лишних зависимостей |
| Запросы | TanStack Query (React Query) | Кеширование, автоинвалидация, состояния загрузки |
| Формы | React Hook Form + Zod | Декларативная валидация со строгой типизацией |
| Backend | Node.js + Express + TypeScript | Простота, широкая экосистема |
| ORM | Prisma | Автогенерация типов из схемы, удобные миграции |
| БД | PostgreSQL 16 | Надёжная реляционная БД для структурированных данных |
| Инфраструктура | Docker + docker-compose | Одна команда для запуска всего проекта |

## Функциональность

- Список записей журнала с сортировкой по дате (↑↓)
- Фильтрация по диапазону дат
- Добавление записи с валидацией всех полей
- Удаление записи с подтверждением
- Справочник видов работ из базы данных (выбор из списка)

## Быстрый запуск (Docker)

```bash
git clone <repo-url>
cd work-journal
docker-compose up --build
```

Открыть в браузере: **http://localhost**

> При первом запуске Docker автоматически:
> 1. Поднимает PostgreSQL
> 2. Применяет схему БД (`prisma db push`)
> 3. Заполняет справочник видов работ
> 4. Запускает сервер и клиент

## Запуск локально (без Docker)

**Требования:** Node.js 20+, PostgreSQL

```bash
# 1. База данных — создайте БД и задайте DATABASE_URL
cd server
cp .env.example .env   # отредактируйте DATABASE_URL

# 2. Бэкенд
npm install
npx prisma db push
npx ts-node src/seed.ts
npm run dev            # http://localhost:3000

# 3. Фронтенд (новый терминал)
cd ../client
npm install
npm run dev            # http://localhost:5173
```

## Структура проекта

```
work-journal/
├── client/             # React + TypeScript (Vite)
│   ├── src/
│   │   ├── api/        # axios-клиенты
│   │   ├── components/ # UI-компоненты
│   │   └── types/      # TypeScript типы
│   └── nginx.conf      # проксирование /api → server
├── server/             # Node.js + Express
│   ├── src/
│   │   ├── routes/     # entries, work-types
│   │   ├── lib/        # Prisma клиент
│   │   └── seed.ts     # начальные данные
│   └── prisma/
│       └── schema.prisma
└── docker-compose.yml
```

## API

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/entries` | Список записей (`?sort=asc\|desc&startDate=&endDate=`) |
| POST | `/api/entries` | Создать запись |
| DELETE | `/api/entries/:id` | Удалить запись |
| GET | `/api/work-types` | Справочник видов работ |
