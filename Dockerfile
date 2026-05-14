# --- Build: compile NestJS + Prisma client ---
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat wget

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Drop devDependencies (TypeScript, eslint, jest, …) but keep runtime deps
RUN npm prune --omit=dev

# Prisma CLI is a devDependency — add back only for `migrate deploy` in the final image
RUN npm install prisma@5.22.0 --omit=optional --no-audit --no-fund

# --- Run: minimal runtime + migrations ---
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat wget

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nestjs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

COPY --chown=nestjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/events/recent?n=1 || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
