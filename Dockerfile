# -------------------------------------------------------------
# Production Multi-Stage Dockerfile for FAIMESS Music Platform
# -------------------------------------------------------------

# Step 1: Build static assets with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies efficiently
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Run quality checks & build production bundle
RUN npm run check:ssr && npm run typecheck && npm run build

# Step 2: High-performance lightweight Nginx web server
FROM nginx:alpine-slim

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
