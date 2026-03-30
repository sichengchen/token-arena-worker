#!/bin/sh

set -eu

if [ "${RUN_DB_MIGRATIONS:-1}" = "1" ]; then
  echo "Running Prisma migrations..."
  cd /app/web
  npx prisma migrate deploy
  cd /app
fi

exec node web/server.js
