# Setting Up Supabase Database

## Step 1: Get Your Database Password

1. Go to your Supabase project: https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string** section
4. Look for **Connection pooling** or **Direct connection**
5. Copy the password from the connection string, OR
6. If you haven't set a password, click **Reset database password** and save the new password

## Step 2: Construct DATABASE_URL

Your Supabase connection string format:
```
postgresql://postgres:[YOUR-PASSWORD]@izvmzpbtfmvnazyejatv.supabase.co:5432/postgres
```

Replace `[YOUR-PASSWORD]` with the password from Step 1.

## Step 3: Add to .env.local

The connection string will be added automatically, or you can add it manually.

## Step 4: Run Migrations

After adding the DATABASE_URL, run:
```bash
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
npx prisma generate
npx prisma migrate dev --name init
```

## Alternative: Use Connection Pooling (Recommended for Production)

Supabase also provides a connection pooling URL which is better for serverless environments:

```
postgresql://postgres.izvmzpbtfmvnazyejatv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

But for development, the direct connection works fine.



