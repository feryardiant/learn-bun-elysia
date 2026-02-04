# syntax=docker/dockerfile:1.4
# -----------------------------------
# Stage 1: Build
ARG BUN_VERSION="1.3.3"
ARG BASE_OS="alpine"
ARG BASE_VERSION="3.23"

FROM oven/bun:${BUN_VERSION}-${BASE_OS} AS build

WORKDIR /app

ENV NODE_ENV=production

COPY . .

RUN bun ci --no-cache --ignore-scripts
RUN <<EOF
    bun build \
      --compile \
      --production \
      --target bun \
      --sourcemap src/server.ts \
      --outfile server \
       src/server.ts
    chmod +x server
EOF

# -----------------------------------
# Stage 2: Runtime
FROM ${BASE_OS}:${BASE_VERSION} AS runtime

WORKDIR /app

ARG APP_NAME=""
ARG APP_VERSION=""
ARG LOG_LEVEL="info"

# Runtime dependencies
COPY --from=build /usr/lib/libstdc++.so.6 /usr/lib/
COPY --from=build /usr/lib/libgcc_s.so.1 /usr/lib/

RUN apk add --no-cache curl

ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0 \
    APP_NAME=${APP_NAME} APP_VERSION=${APP_VERSION} \
    LOG_LEVEL=${LOG_LEVEL} PATH="/app:$PATH"

COPY --from=build /app/package.json ./
COPY --from=build /app/database ./database
COPY --from=build /app/server ./server
COPY --from=build /app/public ./public

EXPOSE ${PORT}

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT [ "server" ]
