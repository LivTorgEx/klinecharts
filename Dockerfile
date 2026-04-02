# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src
RUN npm install -g pnpm@10.32.1
RUN pnpm install --frozen-lockfile --silent
RUN pnpm run build

# Runtime stage - serve dist as static files via nginx
FROM nginx:stable-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html/dist
# Default command just run nginx
CMD ["nginx", "-g", "daemon off;"]
