# Quick Start Guide

## Prerequisites

- Node.js 18+ (use `nvm use 18` if you have nvm)
- PostgreSQL database (local or cloud)

## Setup Steps

### 1. Install Dependencies

```bash
# Make sure you're using Node.js 18+
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
npm install
```

### 2. Set Up Database

#### Option A: Use Cloud Database (Recommended)

1. **Supabase** (Free tier available):
   - Go to https://supabase.com
   - Create a new project
   - Copy the connection string from Settings > Database
   - Add to `.env.local`:
     ```
     DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"
     ```

2. **Neon** (Free tier available):
   - Go to https://neon.tech
   - Create a new project
   - Copy the connection string
   - Add to `.env.local`:
     ```
     DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require"
     ```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb medical_services
   ```
3. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/medical_services?schema=public"
   ```

### 3. Run Database Migrations

```bash
# Make sure you're using Node.js 18+
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

Or use the setup script:
```bash
./setup-database.sh
```

### 4. Seed Dummy Data (Optional)

After starting the server, you can seed dummy data:

1. **Via Admin Dashboard:**
   - Start the server: `npm run dev`
   - Visit http://localhost:3000/admin
   - Log in with any phone number (OTP will be shown in console)
   - Click "Seed Dummy Data" button

2. **Via API:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed
   ```

### 5. Start Development Server

```bash
# Make sure you're using Node.js 18+
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
npm run dev
```

The app will be available at http://localhost:3000

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Secret (optional, has default)
JWT_SECRET="your-secret-key-change-in-production"

# Environment
NODE_ENV="development"
```

## Troubleshooting

### "Prisma only supports Node.js >= 16.13"
- Make sure you're using Node.js 18+
- Run: `nvm use 18` or `export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"`

### "Can't connect to database"
- Check your DATABASE_URL is correct
- Make sure your database server is running
- For cloud databases, check firewall/network settings

### "Module not found: @prisma/client"
- Run: `npx prisma generate`

## Access Points

- **User App**: http://localhost:3000
- **Provider Dashboard**: http://localhost:3000/provider
- **Admin Dashboard**: http://localhost:3000/admin

## Testing Authentication

1. Visit any page
2. Enter a Kuwait phone number (e.g., `12345678`)
3. OTP will be shown in the browser console and server logs
4. Enter the OTP to log in

## Next Steps

- Customize provider profiles
- Add real SMS integration for OTP
- Configure payment gateway (KNET)
- Deploy to production (Vercel, Railway, etc.)


