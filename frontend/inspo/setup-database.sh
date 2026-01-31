#!/bin/bash

echo "🔧 APMAC Database Setup Script"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/apmac?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# API
NEXT_PUBLIC_API_URL="http://localhost:8000"
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📝 Please enter your PostgreSQL password for the 'postgres' user:"
echo "   (If you don't have a password set, press Enter and we'll try without password)"
read -s POSTGRES_PASSWORD

if [ -z "$POSTGRES_PASSWORD" ]; then
    DATABASE_URL="postgresql://postgres@localhost:5432/apmac?schema=public"
    echo "Trying without password..."
else
    # Update .env with the password
    sed -i.bak "s|postgresql://postgres:postgres@|postgresql://postgres:${POSTGRES_PASSWORD}@|g" .env
    DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/apmac?schema=public"
fi

export DATABASE_URL

echo ""
echo "🔨 Creating database (if it doesn't exist)..."
if [ -z "$POSTGRES_PASSWORD" ]; then
    psql -U postgres -c "CREATE DATABASE apmac;" 2>&1 || echo "Database might already exist"
else
    PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -c "CREATE DATABASE apmac;" 2>&1 || echo "Database might already exist"
fi

echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Pushing database schema..."
if [ -z "$POSTGRES_PASSWORD" ]; then
    npx prisma db push
else
    PGPASSWORD="$POSTGRES_PASSWORD" npx prisma db push
fi

echo ""
echo "🌱 Seeding database with test user..."
npm run seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📧 Login Credentials:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "🚀 You can now login at http://localhost:3000/SignIn"


