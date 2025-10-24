# syntax=docker/dockerfile:1.4
# -----------------------------------
# Stage 1: Build
FROM oven/bun:1.2.20-alpine AS builder

WORKDIR /app

ENV CI=true

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# -----------------------------------
# Stage 2: Production
FROM oven/bun:1.2.20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV CI=true

COPY --from=builder /app/package.json /app/bun.lock /app/bunfig.toml /app/drizzle.config.ts ./
COPY --from=builder /app/database ./database
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

RUN bun install --frozen-lockfile --production

# We still need to have postgres adapter for drizzle-kit to work
# https://github.com/drizzle-team/drizzle-orm/issues/4122
# https://github.com/drizzle-team/drizzle-orm/pull/4109
RUN bun add pg

ENV APP_NAME=
ENV APP_VERSION=
ENV APP_URL=http://localhost:3000
ENV APP_DOMAIN=localhost
ENV BASE_PATH=
ENV LOG_LEVEL=info
ENV AUTH_SECRET=

ENV DB_USER=
ENV DB_PASS=
ENV DB_NAME=
ENV DB_PORT=
ENV DB_HOST=

EXPOSE ${PORT}

CMD ["bun", "dist/server.js"]
