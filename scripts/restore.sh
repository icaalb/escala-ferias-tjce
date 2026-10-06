#!/bin/sh
set -eu
if [ ! -f .env ]; then echo ".env não encontrado"; exit 1; fi
set -a
. ./.env
set +a
FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Uso: scripts/restore.sh backup/arquivo.sql.gz"
  exit 1
fi
gunzip -c "$FILE" | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
echo "Restauração concluída."
