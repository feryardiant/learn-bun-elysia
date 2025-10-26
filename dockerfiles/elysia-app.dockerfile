# syntax=docker/dockerfile:1.4
# -----------------------------------
# Stage 1: Build
ARG BUN_VERSION="1.2.22"
ARG BASE_OS="alpine"

FROM oven/bun:${BUN_VERSION}-${BASE_OS} AS build

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN bun ci --no-cache --ignore-scripts

COPY . .
RUN bun run build

# -----------------------------------
# Stage 2: Runtime
FROM oven/bun:${BUN_VERSION}-${BASE_OS} AS runtime

WORKDIR /app

ARG APP_NAME=""
ARG APP_VERSION=""
ARG LOG_LEVEL="info"

ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

COPY --from=build /app/package.json /app/bun.lock /app/bunfig.toml ./
COPY --from=build /app/database /app/dist /app/public ./

RUN bun ci --no-cache --ignore-scripts --production

ENV APP_NAME=${APP_NAME} APP_VERSION=${APP_VERSION} LOG_LEVEL=${LOG_LEVEL}

EXPOSE ${PORT}

CMD ["bun", "dist/server.js"]
