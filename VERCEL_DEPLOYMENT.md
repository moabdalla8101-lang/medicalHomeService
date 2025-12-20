# Deploy to Vercel

## Quick Deployment Steps

### 1. Push Code to GitHub

✅ Code is already pushed to GitHub:
- Repository: `moabdalla8101-lang/medicalHomeService`
- Branch: `main`

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your repository: `medicalHomeService`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://postgres.izvmzpbtfmvnazyejatv:asadsf543v%3A@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```

   ```
   JWT_SECRET=your-secret-key-change-in-production-use-strong-random-string
   ```

   ```
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: medical-home-services
# - Directory: ./
# - Override settings? No
```

### 3. Set Environment Variables in Vercel Dashboard

After deployment, go to:
- Project Settings → Environment Variables

Add all three variables for **Production**, **Preview**, and **Development**:

1. **DATABASE_URL**
   ```
   postgresql://postgres.izvmzpbtfmvnazyejatv:asadsf543v%3A@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```

2. **JWT_SECRET**
   ```
   [Generate a strong random string - use a password generator]
   ```

3. **NODE_ENV**
   ```
   production
   ```

### 4. Redeploy After Adding Variables

After adding environment variables:
- Go to "Deployments" tab
- Click "..." on latest deployment
- Click "Redeploy"

Or push a new commit to trigger automatic redeployment.

### 5. Run Database Migrations on Vercel

After deployment, you need to run migrations. You have two options:

#### Option A: Run Migrations via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

#### Option B: Create Migration Endpoint (Recommended)

I'll create an API endpoint to run migrations safely.

### 6. Seed Dummy Data

After deployment:
1. Visit: `https://your-app.vercel.app/admin`
2. Log in with any phone number
3. Click "Seed Dummy Data"

## Important Notes

### Database Connection
- ✅ Using Supabase Session mode pooling (works with serverless)
- ✅ SSL enabled
- ✅ Connection string configured

### Build Configuration
- ✅ Next.js 14 configured
- ✅ Prisma Client will be generated during build
- ✅ All API routes marked as dynamic

### Environment Variables
Make sure to add ALL three environment variables in Vercel:
1. `DATABASE_URL` - Your Supabase connection string
2. `JWT_SECRET` - A strong random string for JWT tokens
3. `NODE_ENV` - Set to `production`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct

### Database Connection Errors
- Verify `DATABASE_URL` in Vercel environment variables
- Check Supabase database is active
- Ensure connection pooling URL is used (Session mode)

### Migration Issues
- Run migrations via API endpoint or Vercel CLI
- Check database permissions

## After Deployment

1. ✅ Test authentication
2. ✅ Seed dummy data via admin dashboard
3. ✅ Test booking flow
4. ✅ Verify provider dashboard
5. ✅ Check admin panel

Your app will be live at: `https://your-app-name.vercel.app`



