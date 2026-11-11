#!/usr/bin/env bash
#
# start.sh — Levanta los microservicios de Ticketuki en orden de dependencias,
# incluyendo ms-auth (8011) y el API Gateway (8080).
# Usa Java 21 (requerido: Lombok no compila con JDK 24).
#
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p logs

# --- Fijar Java 21 ---------------------------------------------------------
JAVA21="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
if [ -z "$JAVA21" ]; then
  echo "❌ No se encontró un JDK 21. Instálalo (p. ej. Temurin 21) y reintenta."
  exit 1
fi
export JAVA_HOME="$JAVA21"
echo "☕ Usando JAVA_HOME=$JAVA_HOME"

# --- Orden de arranque (puerto:servicio) -----------------------------------
# Respeta dependencias: recinto y usuario primero; venta y ticket al final.
ORDER=(
  "8011:ms-auth"
  "8008:ms-recinto"
  "8001:ms-usuario"
  "8003:ms-evento"
  "8010:ms-historial"
  "8006:ms-venta"
  "8005:ms-ticket"
  "8080:ms-gateway"
)

# --- Esperar a que un puerto quede escuchando ------------------------------
wait_port() {
  local port="$1" name="$2" i
  for i in $(seq 1 30); do
    if lsof -ti "tcp:$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "   ✅ $name arriba en :$port"
      return 0
    fi
    sleep 5
  done
  echo "   ❌ $name NO arrancó en :$port — revisa logs/$name.log"
  return 1
}

# --- Liberar puertos ocupados por instancias previas -----------------------
echo "🧹 Liberando puertos (8001, 8003-8011 y 8080) si están ocupados..."
for p in 8001 $(seq 8003 8011) 8080; do
  pid=$(lsof -ti "tcp:$p" -sTCP:LISTEN 2>/dev/null || true)
  [ -n "$pid" ] && kill "$pid" 2>/dev/null && echo "   detenido :$p (PID $pid)"
done
sleep 2

# --- Levantar en orden -----------------------------------------------------
echo "🚀 Levantando microservicios..."
for entry in "${ORDER[@]}"; do
  port="${entry%%:*}"; ms="${entry##*:}"
  echo "→ $ms (:$port)"
  ( cd "$ms" && nohup mvn -q -o spring-boot:run > "../logs/$ms.log" 2>&1 & )
  wait_port "$port" "$ms" || true
done

echo "------------------------------------------------------"
echo "✅ Arranque completado. Logs en ./logs/ms-*.log"
echo "   Detén todo con: ./stop.sh"
