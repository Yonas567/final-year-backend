#!/bin/sh
set -e
cd /app

if [ "${SKIP_MIGRATIONS}" = "1" ]; then
  echo "SKIP_MIGRATIONS=1 — skipping prisma migrate deploy"
else
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
fi

exec node dist/main.js
