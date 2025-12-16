# Database Setup Instructions

## Quick Start

1. **Ensure Node.js 18+ is active:**
   ```bash
   source ~/.nvm/nvm.sh
   nvm use 18
   ```

2. **Install dependencies:**
   ```bash
   npm install prisma @prisma/client pg
   npm install -D @types/pg
   ```

3. **Set up your database:**
   - Get a PostgreSQL database (Supabase, Neon, Railway, or local)
   - Add connection string to `.env`:
     ```
     DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
     ```

4. **Initialize Prisma:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Replace `lib/db.ts`:**
   - The new Prisma-based implementation is in `lib/db.prisma.ts`
   - Rename current `lib/db.ts` to `lib/db.memory.ts` (backup)
   - Rename `lib/db.prisma.ts` to `lib/db.ts`

6. **Seed the database:**
   ```bash
   # Use the existing seed endpoint or create a Prisma seed script
   ```

## Database Providers (Free Tiers Available)

- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech  
- **Railway**: https://railway.app
- **Vercel Postgres**: https://vercel.com/storage/postgres (if using Vercel)

## Environment Variables

Add to `.env.local` or Vercel:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
```

## Migration Checklist

- [ ] Install Prisma dependencies
- [ ] Set up PostgreSQL database
- [ ] Configure DATABASE_URL
- [ ] Run Prisma migrations
- [ ] Replace db.ts with Prisma version
- [ ] Test all endpoints
- [ ] Seed initial data
- [ ] Update deployment config

## Rollback

If you need to rollback:
1. Rename `lib/db.ts` back to `lib/db.prisma.ts`
2. Rename `lib/db.memory.ts` back to `lib/db.ts`
3. Restart the server


