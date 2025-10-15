#!/bin/sh
set -e

echo "🚀 Starting API container..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
until nc -z -v -w30 mongodb 27017; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
done
echo "✅ MongoDB is up and ready"

# Small delay to ensure MongoDB is fully ready
sleep 3

# Run seed script on first startup
# Check if a seed flag file exists to prevent re-seeding
if [ ! -f /app/.seeded ] && [ "${RUN_SEED}" = "true" ]; then
  echo "🌱 Running database seed script..."
  
  # Run the seed script using ts-node
  npx ts-node --project tsconfig.node.json api/src/scripts/seed.ts
  
  # Check if seed was successful
  if [ $? -eq 0 ]; then
    touch /app/.seeded
    echo "✅ Database seeded successfully"
  else
    echo "⚠️  Seed script failed but continuing..."
  fi
else
  if [ -f /app/.seeded ]; then
    echo "ℹ️  Database already seeded (skipping)"
  else
    echo "ℹ️  Skipping seed (RUN_SEED not set to true)"
  fi
fi

echo "✅ API startup complete. Starting NestJS server..."

# Execute the CMD
exec "$@"