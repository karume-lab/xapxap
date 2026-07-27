# Xapxap

Welcome to Xapxap! This repository contains a complete full-stack monorepo featuring a React Native (Expo) mobile app, a modular Drizzle ORM database package, and a self-hosted Supabase setup.

## Project Structure

- `apps/mobile/`: React Native (Expo) application.
- `apps/supabase/`: Supabase configuration, edge functions, and local development setup.
- `packages/db/`: Modular Drizzle ORM setup with domain-specific schemas, migrations, and seeding scripts.
- `packages/types/`: Shared TypeScript type definitions.
- `packages/validators/`: Shared Zod validation schemas.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Bun](https://bun.sh/) installed for package management and script execution.
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (optional, but recommended).

### 1. Environment Setup

Environment variables are decentralized and live close to where they are needed. Copy the example files and update them with your local credentials:

```bash
# Database package (Backend)
cp packages/db/.env.example packages/db/.env

# Mobile app (Frontend)
cp apps/mobile/.env.example apps/mobile/.env
```

Ensure `packages/db/.env` contains your local Supabase credentials (including the Service Role Key if you intend to run the seed script for media uploads).

### 2. Running the Supabase Containers

If you are using the local Supabase self-hosted Docker stack via `docker-compose.yml`, you must explicitly point Docker Compose to the `apps/supabase/.env` file so it can read the decentralized environment variables:

```bash
docker compose --env-file apps/supabase/.env up -d
```

*(Note: To stop the stack, run `docker compose --env-file apps/supabase/.env down`)*

Once the stack is up, you can access:
- **Supabase Studio (Dashboard):** [http://localhost:54323](http://localhost:54323)
- **REST API:** [http://localhost:54321](http://localhost:54321)
- **Postgres Database:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres`


### 3. Database Migrations

We use Drizzle ORM to manage our database schemas. To apply the latest schema changes to your local database:

```bash
cd packages/db

# Generate missing migrations if schemas have changed
bun run db:generate

# Push migrations to the database
bun run db:migrate
```

### 4. Database Seeding

We have a robust, domain-driven seeding system that inserts placeholder users, content, wallets, streams, and uploads media assets directly into the Supabase local storage bucket.

To completely wipe your local database and re-seed it from scratch:

```bash
cd packages/db
bun run db:seed:fresh
```

To seed specific domains without wiping the database, you can use individual flags:

```bash
bun run db:seed --users --content
```

*(Run `bun run db:seed --help` to see all available seeding options).*
