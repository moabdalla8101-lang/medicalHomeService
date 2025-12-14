#!/bin/bash

# Setup script for Home Medical Services App Database
# This script helps set up PostgreSQL database with Prisma

set -e

echo "🏥 Home Medical Services App - Database Setup"
echo "=============================================="
echo ""

# Check if Node.js 18+ is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    echo "💡 If you have nvm installed, run: nvm use 18"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable is not set."
    echo ""
    echo "Please set up your database connection string:"
    echo ""
    echo "Option 1: Add to .env.local file:"
    echo "  DATABASE_URL=\"postgresql://user:password@localhost:5432/medical_services?schema=public\""
    echo ""
    echo "Option 2: Use a cloud database (recommended for production):"
    echo "  - Supabase: https://supabase.com"
    echo "  - Neon: https://neon.tech"
    echo "  - Railway: https://railway.app"
    echo ""
    echo "Example for Supabase:"
    echo "  DATABASE_URL=\"postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres\""
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ DATABASE_URL is set"
    echo ""
fi

# Load nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use 18 2>/dev/null || true
fi

# Set PATH to use Node 18 if nvm is available
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH" 2>/dev/null || true

echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Seed dummy data (optional):"
echo "   - Visit /admin and click 'Seed Dummy Data', or"
echo "   - Call POST /api/admin/seed"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""

