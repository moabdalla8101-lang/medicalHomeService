#!/bin/bash

# Supabase Database Setup Script
# This script helps configure your Supabase PostgreSQL database

set -e

echo "🔧 Supabase Database Setup"
echo "=========================="
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

# Load nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use 18 2>/dev/null || true
fi

# Set PATH to use Node 18 if nvm is available
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH" 2>/dev/null || true

PROJECT_REF="izvmzpbtfmvnazyejatv"
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

echo "📋 Your Supabase Project:"
echo "   Project URL: ${PROJECT_URL}"
echo "   Project Ref: ${PROJECT_REF}"
echo ""

# Check if DATABASE_URL is already set
if grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
    echo "⚠️  DATABASE_URL already exists in .env.local"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing DATABASE_URL"
        SKIP_DB_URL=true
    fi
fi

if [ -z "$SKIP_DB_URL" ]; then
    echo ""
    echo "🔑 To get your database password:"
    echo "   1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
    echo "   2. Scroll to 'Connection string' section"
    echo "   3. Look for 'URI' or 'Connection pooling'"
    echo "   4. Copy the password from the connection string"
    echo ""
    echo "   OR click 'Reset database password' if you haven't set one"
    echo ""
    
    read -p "Enter your Supabase database password: " -s DB_PASSWORD
    echo ""
    echo ""
    
    if [ -z "$DB_PASSWORD" ]; then
        echo "❌ Password cannot be empty"
        exit 1
    fi
    
    # Construct DATABASE_URL
    DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${PROJECT_REF}.supabase.co:5432/postgres"
    
    # Add or update DATABASE_URL in .env.local
    if grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
        # Update existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env.local
        else
            # Linux
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env.local
        fi
        echo "✅ Updated DATABASE_URL in .env.local"
    else
        # Add new
        echo "" >> .env.local
        echo "# Supabase Database" >> .env.local
        echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env.local
        echo "✅ Added DATABASE_URL to .env.local"
    fi
fi

echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Running database migrations..."
echo "   This will create all tables in your Supabase database..."
npx prisma migrate dev --name init

echo ""
echo "✅ Supabase setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Seed dummy data (optional):"
echo "   - Visit http://localhost:3000/admin"
echo "   - Log in with any phone number"
echo "   - Click 'Seed Dummy Data'"
echo ""
echo "Your app is now connected to Supabase! 🚀"
echo ""

