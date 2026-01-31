#!/bin/bash
# Helper script to update DATABASE_URL with connection pool parameters

ENV_FILE=".env.local"

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE not found. Creating it..."
    echo ""
    echo "Please create $ENV_FILE with your DATABASE_URL"
    echo "Example:"
    echo 'DATABASE_URL="postgresql://user@localhost:5432/db?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"'
    exit 1
fi

# Check if DATABASE_URL exists
if ! grep -q "DATABASE_URL" "$ENV_FILE"; then
    echo "⚠️  DATABASE_URL not found in $ENV_FILE"
    exit 1
fi

# Get current DATABASE_URL
CURRENT_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')

if [ -z "$CURRENT_URL" ]; then
    echo "⚠️  Could not find DATABASE_URL value"
    exit 1
fi

# Check if connection_limit already exists
if echo "$CURRENT_URL" | grep -q "connection_limit"; then
    echo "✅ DATABASE_URL already has connection pool parameters"
    echo "Current: $CURRENT_URL"
    exit 0
fi

# Add connection pool parameters
if echo "$CURRENT_URL" | grep -q "?"; then
    # URL already has query params, add with &
    NEW_URL="${CURRENT_URL}&connection_limit=10&pool_timeout=20&connect_timeout=10"
else
    # No query params, add with ?
    NEW_URL="${CURRENT_URL}?connection_limit=10&pool_timeout=20&connect_timeout=10"
fi

# Backup original file
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo "✅ Created backup: ${ENV_FILE}.backup"

# Update the file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_URL}\"|" "$ENV_FILE"
else
    # Linux sed
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_URL}\"|" "$ENV_FILE"
fi

echo "✅ Updated DATABASE_URL in $ENV_FILE"
echo ""
echo "Before: $CURRENT_URL"
echo "After:  $NEW_URL"
echo ""
echo "📝 Restart your dev server for changes to take effect:"
echo "   npm run dev"
