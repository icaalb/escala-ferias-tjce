#!/bin/sh
set -eu
mkdir -p backup
STAMP=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "backup/ferias_$STAMP.sql.gz"
echo "Backup criado: backup/ferias_$STAMP.sql.gz"
