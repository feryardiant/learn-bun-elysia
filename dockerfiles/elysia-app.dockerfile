# syntax=docker/dockerfile:1.4
# -----------------------------------
# Stage 1: Build
ARG BUN_VERSION="1.2.22"
ARG BASE_OS="alpine"
ARG BASE_VERSION="3.22"

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
FROM alpine:${BASE_VERSION} AS runtime

WORKDIR /app

ARG APP_NAME=""
ARG APP_VERSION=""
ARG LOG_LEVEL="info"

ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

COPY --from=build /app/package.json /app/bun.lock /app/bunfig.toml ./
COPY --from=build /app/database ./database
COPY --from=build /app/server ./server
COPY --from=build /app/public ./public

# Runtime dependencies
COPY --from=build /usr/lib/libstdc++.so.6.0.32 /usr/lib/libstdc++.so.6
COPY --from=build /usr/lib/libgcc_s.so.1 /usr/lib/libgcc_s.so.1

ENV APP_NAME=${APP_NAME} APP_VERSION=${APP_VERSION} LOG_LEVEL=${LOG_LEVEL}

EXPOSE ${PORT}

ENTRYPOINT [ "/app/server" ]
