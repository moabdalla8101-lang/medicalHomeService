# Supabase Connection Setup

## Current Issue

The database connection is failing. This is usually due to one of these reasons:

### 1. IP Restrictions (Most Common)

Supabase blocks connections by default. You need to allow your IP:

1. Go to: https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv/settings/database
2. Scroll to **"Connection pooling"** or **"Network restrictions"**
3. Click **"Allow all IPs"** (for development) or add your specific IP
4. Save the changes

### 2. Use Connection Pooling URL

I've updated your `.env` file to use the connection pooling URL which is more reliable.

### 3. Verify Connection String

Make sure the connection string in `.env` is correct. You can also get it directly from Supabase:

1. Go to: https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv/settings/database
2. Scroll to **"Connection string"**
3. Select **"URI"** or **"Connection pooling"**
4. Copy the exact connection string
5. Replace the password part with your password

### 4. Test Connection

After allowing IP access, test the connection:

```bash
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
npx prisma db pull
```

If that works, run migrations:

```bash
npx prisma migrate dev --name init
```

## Current Configuration

Your `.env` file is configured with:
- Connection pooling URL (recommended for serverless)
- SSL mode enabled
- URL-encoded password

## Next Steps

1. **Allow IP access in Supabase dashboard** (most important!)
2. Test connection: `npx prisma db pull`
3. Run migrations: `npx prisma migrate dev --name init`
4. Start the app: `npm run dev`


