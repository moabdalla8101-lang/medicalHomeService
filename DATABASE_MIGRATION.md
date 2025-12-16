# Database Migration Guide

This guide will help you migrate from the in-memory database to PostgreSQL with Prisma.

## Prerequisites

1. **Node.js 18+** - Make sure you're using Node.js 18 or higher:
   ```bash
   source ~/.nvm/nvm.sh
   nvm use 18
   node --version  # Should show v18.x.x
   ```

2. **PostgreSQL Database** - You'll need a PostgreSQL database. Options:
   - **Local**: Install PostgreSQL locally
   - **Cloud**: Use services like:
     - [Supabase](https://supabase.com) (Free tier available)
     - [Neon](https://neon.tech) (Free tier available)
     - [Railway](https://railway.app) (Free tier available)
     - [Vercel Postgres](https://vercel.com/storage/postgres) (if deploying on Vercel)

## Step 1: Install Dependencies

```bash
# Make sure you're using Node 18+
source ~/.nvm/nvm.sh
nvm use 18

# Install Prisma and PostgreSQL client
npm install prisma @prisma/client pg
npm install -D @types/pg
```

## Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables (add your DATABASE_URL here)

## Step 3: Configure Database Connection

Edit `.env` and add your database URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/medical_services?schema=public"
```

For cloud databases, use the connection string provided by your service.

## Step 4: Create Prisma Schema

The Prisma schema will be created based on your existing TypeScript types. See `prisma/schema.prisma` (to be created).

## Step 5: Run Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

## Step 6: Update Code

Replace `lib/db.ts` with Prisma-based implementation (see implementation files).

## Step 7: Seed Database

```bash
# Create seed script in prisma/seed.ts
# Then run:
npx prisma db seed
```

## Environment Variables

Add to your `.env.local` or Vercel environment variables:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
NODE_ENV="production"
```

## Deployment

For Vercel:
1. Add `DATABASE_URL` to Vercel environment variables
2. Add build command: `prisma generate && next build`
3. Add install command: `npm install && prisma generate`

## Rollback

If you need to rollback, you can temporarily switch back to the in-memory database by:
1. Keeping the old `lib/db.ts` as `lib/db.memory.ts`
2. Switching imports when needed


