FROM node:22.17.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN pnpm install --frozen-lockfile --filter frontend...

# Build the frontend and its dependencies
# Output will be in /app/dist/frontend based on vite.config.ts
RUN pnpm --filter frontend... build

FROM nginx:alpine AS runner
# Copy custom nginx config
COPY deploy/nginx/frontend.conf /etc/nginx/conf.d/default.conf
# Copy built static files
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
