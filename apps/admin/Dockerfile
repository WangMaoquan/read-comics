FROM node:22.17.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/admin ./apps/admin

# Install dependencies
RUN pnpm install --frozen-lockfile --filter admin...

# Build the admin app and its dependencies
# Output will be in /app/dist/admin based on vite.config.ts
RUN pnpm --filter admin... build

FROM nginx:alpine AS runner
# Copy custom nginx config
COPY deploy/nginx/admin.conf /etc/nginx/conf.d/default.conf
# Copy built static files
COPY --from=builder /app/dist/admin /usr/share/nginx/html

EXPOSE 5174
CMD ["nginx", "-g", "daemon off;"]
