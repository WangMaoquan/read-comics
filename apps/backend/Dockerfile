FROM node:22.17.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install dependencies (all)
RUN pnpm install --frozen-lockfile

# Build workspace packages
RUN pnpm --filter "./packages/**" build

# Build backend
RUN pnpm --filter backend build

# Deploy production dependencies for backend
RUN pnpm deploy --filter=backend --prod /app/deploy

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy deployed production dependencies
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/deploy/package.json ./package.json

# Copy built backend code and local packages code
# Need to copy packages dist because they are workspace dependencies
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 4399

CMD ["node", "dist/main"]
