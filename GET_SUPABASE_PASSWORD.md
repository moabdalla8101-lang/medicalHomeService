# How to Get Your Supabase Database Password

## Quick Steps

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv/settings/database

2. **Find the Connection String:**
   - Scroll down to the **"Connection string"** section
   - You'll see options like:
     - **URI** (direct connection)
     - **Connection pooling** (for serverless)

3. **Get the Password:**
   - The connection string will look like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@izvmzpbtfmvnazyejatv.supabase.co:5432/postgres
     ```
   - Copy the password part (between `postgres:` and `@`)

4. **If You Don't Have a Password:**
   - Click **"Reset database password"** button
   - Save the new password securely

## Alternative: Use the Setup Script

Run the automated setup script which will prompt you for the password:

```bash
./setup-supabase.sh
```

## Manual Setup

If you prefer to set it up manually:

1. Get your password from the dashboard (see above)
2. Add to `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@izvmzpbtfmvnazyejatv.supabase.co:5432/postgres"
   ```
3. Run migrations:
   ```bash
   export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Connection String Formats

### Direct Connection (Development)
```
postgresql://postgres:[PASSWORD]@izvmzpbtfmvnazyejatv.supabase.co:5432/postgres
```

### Connection Pooling (Production/Serverless)
```
postgresql://postgres.izvmzpbtfmvnazyejatv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

For now, use the direct connection for development.

