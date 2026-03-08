#!/bin/sh
set -e

# Railway inyecta $PORT en cada servicio; por defecto usamos 80 en local.
export PORT="${PORT:-80}"

# URL interna del backend. Para Railway: http://<nombre-servicio>.railway.internal:<puerto>
# Para docker-compose local: http://backend
export BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-http://backend}"

echo ">> Iniciando frontend nginx en puerto $PORT → backend: $BACKEND_UPSTREAM"

# Sustituir SOLO ${PORT} y ${BACKEND_UPSTREAM} en la plantilla de nginx;
# las variables propias de nginx ($uri, $host, etc.) se dejan intactas.
envsubst '${PORT} ${BACKEND_UPSTREAM}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
