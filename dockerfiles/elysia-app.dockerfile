# syntax=docker/dockerfile:1.4
# -----------------------------------
# Stage 1: Build
FROM oven/bun:1.2.12-alpine AS builder

WORKDIR /app

ENV CI=true

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# -----------------------------------
# Stage 2: Production
FROM oven/bun:1.2.12-alpine AS production

WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lock /app/bunfig.toml /app/drizzle.config.ts ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src

RUN bun install --frozen-lockfile --production

# We still need to have postgres adapter for drizzle-kit to work
# https://github.com/drizzle-team/drizzle-orm/issues/4122
# https://github.com/drizzle-team/drizzle-orm/pull/4109
RUN bun add pg

ENV NODE_ENV=production
ENV PORT=3000

ENV APP_NAME=
ENV APP_VERSION=
ENV APP_URL=http://localhost:3000
ENV BASE_PATH=
ENV LOG_LEVEL=info
ENV AUTH_SECRET=

ENV DB_USER=
ENV DB_PASS=
ENV DB_NAME=
ENV DB_PORT=
ENV DB_HOST=

EXPOSE ${PORT}

CMD ["bun", "dist/index.js"]
