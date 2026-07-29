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

### 1. Environment Setup

Environment variables are decentralized and live close to where they are needed. Copy the example files and update them with your local credentials:

```bash
# Database package (Backend)
cp packages/db/.env.example packages/db/.env

# Mobile app (Frontend)
cp apps/mobile/.env.example apps/mobile/.env
```

Ensure `packages/db/.env` contains your local Supabase credentials (including the Service Role Key if you intend to run the seed script for media uploads).

### 2. Running the Supabase Backend (CLI)

We use the Supabase CLI to manage our local development environment. This automatically handles container orchestration, database schemas, and Edge Functions.

Start the backend services from the root of the project:

```bash
bun run start:supabase
```

*(Note: To stop the stack, run `cd apps/supabase && bunx supabase stop`)*

Once the stack is up, you can access:
- **Supabase Studio (Dashboard):** [http://127.0.0.1:54323](http://127.0.0.1:54323)
- **REST API:** [http://127.0.0.1:54321](http://127.0.0.1:54321)

### 3. Database Schema & Seeding

We use Drizzle ORM to manage our database schemas. To sync your local database with your Drizzle schemas and seed it with dummy data:

```bash
# Push the latest schema to the local database
bun run db:push

# Run the domain-driven seeding script
bun run db:seed
```

*(Run `bun run db:seed --help` to see all available seeding options).*

### 4. Viewing Logs & Debugging

**Option A: Supabase Studio (Recommended)**
The easiest way to view API requests (GET/POST/etc.) and database query logs is through the local dashboard:
1. Go to [http://127.0.0.1:54323](http://127.0.0.1:54323)
2. Navigate to **Logs > API** (PostgREST) or **Logs > Postgres** to see a visual, real-time feed of requests.

**Option B: Terminal / Docker Logs**
If you prefer the raw terminal view, you can attach directly to the Docker containers spawned by the CLI. (Check `docker ps` to confirm the exact container names):

```bash
# View API Gateway logs (All HTTP requests like GET, POST, etc.)
docker logs -f supabase_kong_xapxap

# View Database API Engine logs (PostgREST)
docker logs -f supabase_rest_xapxap

# View Edge Function logs
docker logs -f supabase_edge_runtime_xapxap
```
