#!/bin/sh
set -e

echo "🚀 Starting Web container..."

# Create runtime environment config file
echo "📝 Injecting runtime environment variables..."

cat > ./web/public/env-config.js << EOF
window._env_ = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL}",
  NEXT_PUBLIC_WS_URL: "${NEXT_PUBLIC_WS_URL}",
  NEXT_PUBLIC_TENANT_ID: "${NEXT_PUBLIC_TENANT_ID:-tenant-alpha}",
};
EOF

echo "✅ Runtime environment variables injected:"
echo "  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}"
echo "  NEXT_PUBLIC_WS_URL: ${NEXT_PUBLIC_WS_URL}"
echo "  NEXT_PUBLIC_TENANT_ID: ${NEXT_PUBLIC_TENANT_ID:-tenant-alpha}"

# Important: Override PORT if accidentally set
export PORT=${PORT:-3000}

echo "🚀 Starting Next.js on port $PORT..."

# Execute the CMD
exec "$@"