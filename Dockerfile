# =========================================
# Stage 1 : build de l'application Angular
# =========================================
ARG NODE_VERSION=24.7.0-alpine
ARG NGINX_VERSION=alpine3.22

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Dependances d'abord, pour profiter du cache Docker
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

# =========================================
# Stage 2 : fichiers statiques servis par nginx
# =========================================
FROM nginx:${NGINX_VERSION}
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/MangaReversible/browser /usr/share/nginx/html
EXPOSE 80
