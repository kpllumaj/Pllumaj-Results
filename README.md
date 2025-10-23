# Pllumaj Results Monorepo

This repository contains the initial scaffolding for the Pllumaj Results platform covering the web client, API, and shared packages. It uses pnpm workspaces to coordinate development across the monorepo.

## Project Layout

- apps/web - Next.js (App Router) frontend with TailwindCSS and example flows for posting a need, reviewing offers, checking out, provider profiles, and admin controls.
- apps/api - NestJS backend with Prisma ORM, Stripe payment scaffolding, and REST endpoints for authentication, needs, offers, orders, payments, reviews, and admin tasks.
- packages/shared - Shared TypeScript utilities, enums, and validation schemas reused across the stack.

## Getting Started

```
pnpm install
pnpm dev:web
pnpm dev:api
```

Copy apps/api/.env.example to apps/api/.env and update the values before running the API. The API defaults to port 3001 and expects a Postgres database.

## Database

The Prisma schema lives at apps/api/prisma/schema.prisma and models all core MVP entities including users, businesses, inventory, needs, offers, orders, payments, reviews, disputes, categories, and cities.

## Scripts

- pnpm dev:web - Start the Next.js development server.
- pnpm dev:api - Start the NestJS API with live reload.
- pnpm build:web / pnpm build:api - Build the respective applications.
- pnpm lint - Run linting across workspace targets.
- pnpm test - Execute API tests placeholder (Vitest configured for future use).

## Next Steps

- Configure Prisma migrations (pnpm --filter api prisma:migrate dev).
- Connect Stripe keys and Clerk/Auth.js for production-ready auth.
- Implement background jobs for reminders, notifications, and analytics.
- Expand the shared package with domain events, API contracts, and Zod schemas for end-to-end validation.
