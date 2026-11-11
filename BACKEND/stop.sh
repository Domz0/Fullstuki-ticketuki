#!/usr/bin/env bash
#
# stop.sh — Detiene los microservicios de Ticketuki (puertos 8001, 8003-8011 y 8080).
#
set -euo pipefail

echo "🛑 Deteniendo microservicios (puertos 8001, 8003-8011 y 8080)..."
any=0
for p in 8001 $(seq 8003 8011) 8080; do
  pid=$(lsof -ti "tcp:$p" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null && echo "   ✅ detenido :$p (PID $pid)"
    any=1
  fi
done
[ "$any" -eq 0 ] && echo "   (no había nada corriendo en esos puertos)"
echo "Listo."
