# Verify Supabase Connection

## Current Issue

The database connection is failing. Please verify the following:

## Step 1: Check Database Status

1. Go to your Supabase project dashboard:
   https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv

2. Check if the database shows:
   - ✅ **Active** - Database is running
   - ⏸️ **Paused** - Database needs to be resumed (free tier auto-pauses)

3. If paused, click **"Restore"** or **"Resume"** button

## Step 2: Get Exact Connection String

1. Go to: https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv/settings/database

2. Scroll to **"Connection string"** section

3. You'll see different tabs:
   - **URI** - Direct connection
   - **Connection pooling** - For serverless/server applications

4. **Copy the EXACT connection string** from the **URI** tab

5. It should look like one of these formats:
   ```
   postgresql://postgres:[PASSWORD]@db.izvmzpbtfmvnazyejatv.supabase.co:5432/postgres
   ```
   OR
   ```
   postgresql://postgres.izvmzpbtfmvnazyejatv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Step 3: Update Connection String

Once you have the exact connection string:

1. Replace `[PASSWORD]` with: `$!$JE?v/H2hCT$2`
2. Update the `.env` file with the exact format from Supabase

## Current Configuration

I've configured:
- Host: `db.izvmzpbtfmvnazyejatv.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: `$!$JE?v/H2hCT$2` (URL-encoded as `%24%21%24JE%3Fv%2FH2hCT%242`)

## Quick Test

You can test the connection manually if you have `psql`:

```bash
psql "postgresql://postgres:\$!\$JE?v/H2hCT\$2@db.izvmzpbtfmvnazyejatv.supabase.co:5432/postgres"
```

## What to Share

Please share:
1. Is the database **Active** or **Paused**?
2. The **exact connection string** from Supabase dashboard (URI tab)
3. Any error messages you see in Supabase dashboard


