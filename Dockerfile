# ─── Stage 1: Build ──────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiestos primero para aprovechar la caché de capas
COPY package*.json ./
RUN npm ci

# VITE_API_URL siempre es /api (relativo) porque nginx actúa como reverse proxy.
# Así el mismo bundle funciona en local, staging y Railway sin reconstruir.
ENV VITE_API_URL=/api

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ─── Stage 2: Servir con Nginx ────────────────────────────────────────────
FROM nginx:1.25-alpine

# gettext provee envsubst para sustituir ${PORT} y ${BACKEND_UPSTREAM} en runtime
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html

# La plantilla se procesa en el entrypoint; no queremos un default.conf fijo
COPY nginx.conf /etc/nginx/templates/default.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf

COPY docker-entrypoint.sh /docker-entrypoint.sh
# Eliminar CRLF (Windows) para que el script funcione en Linux
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Render usa 10000 por defecto; se sobreescribe con la env var PORT en runtime
EXPOSE 10000
ENTRYPOINT ["/docker-entrypoint.sh"]
