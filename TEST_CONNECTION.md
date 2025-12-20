# Testing Supabase Connection

## Current Connection String

```
postgresql://postgres:[PASSWORD]@db.izvmzpbtfmvnazyejatv.supabase.co:5432/postgres
```

Password (URL-encoded): `%24%21%24JE%3Fv%2FH2hCT%242`

## Troubleshooting Steps

### 1. Verify Connection String in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/izvmzpbtfmvnazyejatv/settings/database
2. Scroll to **"Connection string"**
3. Select **"URI"** tab
4. Copy the **exact** connection string shown
5. Replace `[YOUR-PASSWORD]` with your password: `$!$JE?v/H2hCT$2`

### 2. Test Connection Manually

You can test the connection using `psql` if you have it installed:

```bash
psql "postgresql://postgres:\$!\$JE?v/H2hCT\$2@db.izvmzpbtfmvnazyejatv.supabase.co:5432/postgres"
```

### 3. Check Supabase Status

- Make sure your Supabase project is active
- Check if the database is paused (free tier projects pause after inactivity)
- If paused, go to dashboard and click "Restore" or "Resume"

### 4. Try Connection Pooling

If direct connection doesn't work, try the pooling URL from Supabase dashboard:
- Go to Connection string section
- Select **"Connection pooling"** tab
- Use that URL format instead

### 5. Verify Password

Double-check the password is correct:
- Original: `$!$JE?v/H2hCT$2`
- URL-encoded: `%24%21%24JE%3Fv%2FH2hCT%242`

## Current Configuration

The `.env` file is configured with:
```
DATABASE_URL="postgresql://postgres:%24%21%24JE%3Fv%2FH2hCT%242@db.izvmzpbtfmvnazyejatv.supabase.co:5432/postgres"
```

## Next Steps

1. Verify the connection string format in Supabase dashboard matches exactly
2. Check if database is paused/active
3. Try the connection pooling URL if available
4. Test with `psql` if possible



