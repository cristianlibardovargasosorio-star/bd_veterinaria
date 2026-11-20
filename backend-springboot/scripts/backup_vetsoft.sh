#!/usr/bin/env bash
# ==============================================================================
# VET-RNF-05: Respaldo diario automatizado y consistente de PostgreSQL (VetSoft)
# Política de retención: conserva respaldos comprimidos de los últimos N días (30 por defecto) y elimina los anteriores.
# ==============================================================================
set -euo pipefail

# Valores configurables por entorno (no usar credenciales en texto plano)
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-vetsoft_db}"
PGUSER="${PGUSER:-vetsoft_app}"
PGPASSFILE="${PGPASSFILE:-$HOME/.pgpass}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/vetsoft}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

export PGPASSFILE
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/vetsoft_${PGDATABASE}_${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"

# Formato custom (-Fc) con compresión máxima (-Z 9): usa snapshot MVCC de PostgreSQL
# para respaldar historiales, lotes y facturas sin bloquear escrituras cotidianas (< 1 s).
pg_dump \
  --host="$PGHOST" \
  --port="$PGPORT" \
  --username="$PGUSER" \
  --dbname="$PGDATABASE" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_FILE"

# Verificar integridad estructural del archivo generado
pg_restore --list "$BACKUP_FILE" > /dev/null

# Rotación automática según política de retención
find "$BACKUP_DIR" -type f -name "vetsoft_${PGDATABASE}_*.dump" -mtime +"$RETENTION_DAYS" -delete

echo "[OK] Respaldo verificado: $BACKUP_FILE"

# ------------------------------------------------------------------------------
# PROCEDIMIENTO DE RESTAURACIÓN Y VALIDACIÓN (referencia operativa):
# 1. Restaurar:
#    pg_restore --host="$PGHOST" --port="$PGPORT" --username="$PGUSER" \
#      --dbname="$PGDATABASE" --clean --if-exists --no-owner --no-privileges "$BACKUP_FILE"
# 2. Validar consistencia mínima:
#    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c \
#      "SELECT (SELECT COUNT(*) FROM usuarios) AS usuarios, (SELECT COUNT(*) FROM citas) AS citas, (SELECT COUNT(*) FROM lotes_inventario) AS lotes, (SELECT COUNT(*) FROM facturas) AS facturas;"
# ------------------------------------------------------------------------------
