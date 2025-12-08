FROM node:22.17.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages

# 1. Install dependencies for all workspace packages
RUN pnpm install --frozen-lockfile --filter "./packages/**"

# 2. Build all packages
RUN pnpm --filter "./packages/**" build

# 3. Copy app source
COPY apps/backend ./apps/backend

# 4. Install app dependencies
RUN pnpm install --frozen-lockfile --filter backend...

# 5. Build the backend
RUN pnpm --filter backend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json

EXPOSE 4399

CMD ["node", "dist/main"]
