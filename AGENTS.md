# AGENTS instructions

ElysiaJS + Bun API with Drizzle ORM (PostgreSQL), Better Auth, OpenTelemetry, Biome, and `bun:test`.

## Commands

All commands use `bun`.

- Install deps: `bun install` (postinstall registers `simple-git-hooks` unless `CI` is set)
- Dev server (watch): `bun dev`
- Build: `bun build` → compiled binary at `dist/server`
- Lint: `bun lint` (`biome check`, does **not** write)
- Format: `bun format` (`biome format --write`)
- Test: `bun test`
- Single file: `bun test test/modules/feeds/posts.controller.test.ts`
- Single test by name: `bun test -t "retrieves a post by id"`
- Coverage: `bun test --coverage` (CI uses this; reports land in `test/coverage`)
- Load test: `bun test:load` (requires `k6`)
- DB: `bun db:generate`, `bun db:migrate`, `bun db:studio`
- Server CLI: `bun run src/server.ts migrate` / `health` (default action starts the server)

There is no `typecheck` script. Biome is the only static check; run `bun lint` after changes.

## Testing

- **Tests require a running PostgreSQL.** `test/setup.ts` is preloaded (via `bunfig.toml`) and calls `migrate()` in `beforeAll`, exiting the process if it fails.
- Test config comes from `.env.test`: `DB_HOST=127.0.0.1`, `DB_PORT=5433`, `DB_NAME=postgres_test`. Start it with `docker compose up -d postgres` if not started; `deploy/init-db.sql` creates `postgres_test` on first init.
- `bunfig.toml` sets test root `./test` and coverage output to `test/coverage`.
- Tests import repo code via `~/...` and test helpers via `test/...` (e.g. `test/fixtures`).
- Controller tests call `controller.handle(new Request(...))` directly; no HTTP server is started.

## Environment

- Bun auto-loads `.env`; `.env.local` overrides it locally (non-test), `.env.test` is used for tests. Copy `.env.example` first.
- `src/config/index.ts` validates the full env with TypeBox at import time and throws on missing/invalid values. Config modules live in `src/config/*.config.ts`.
- `NODE_ENV` also gates behavior (e.g. local/test use wildcard CORS and disable DB SSL).
- `BASE_PATH` prefixes the entire app; API routes are additionally versioned under `/v1`. Swagger UI is at `/docs`.

## Architecture

- `src/server.ts` — entrypoint (Commander CLI: `migrate`, `health`, default serve).
- `src/app.ts` — composes global plugins and routes (`authRoute`, `baseRoute`, `v1Route`).
- `src/modules/[feature]/` — schemas/, repositories/, `*.controller.ts`, `types.ts`. Modules export their pieces via `index.ts` (e.g. `feedModels`).
- `src/plugins/` — every third-party library is initialized here (database, auth, logger, mail, otel, openapi, static, error-handler).
- `src/utils/` — response/error formatters, pagination, filters, otel helpers.
- **DB singleton** is `db` in `~/plugins/database.plugin.ts`. Controllers build repositories in a `.resolve` hook and inject `db` (`new PostRepository(db)`). `repositories/index.ts` only re-exports classes — do not eagerly instantiate repositories there.
- Auth is Better Auth mounted at `${BASE_PATH}/auth`; `authPlugin` resolves `user`/`session` and throws `AuthenticationError` (401) when unauthenticated.

## Conventions

- Biome is the single source of truth: single quotes, no semicolons, auto-organized imports. Pre-commit runs `lint-staged` → `biome format --write` on staged files (format only, not lint).
- Use the `~/*` alias for `src/*` across directories; relative paths only within the same/child directory. `package.json` is directly importable.
- Files: kebab-case (`error-handler.plugin.ts`). Schemas: `*.schema.ts`. Plugins: `*.plugin.ts`. Types: PascalCase.
- Multiple controllers/repositories in one module go under `controllers/` or `repositories/` folders.
- API responses use `asItemResponse` / `asItemsResponse` from `~/utils/response.util.ts`. Errors are centralized in `errorHandlerPlugin`; define custom errors in `~/utils/errors.util.ts`.
- Schemas `index.ts` owns three things: the `*Tables` object, relations via `defineRelationsPart`, and TypeBox schemas via `createSelectSchema` from **`drizzle-orm/typebox-legacy`** (not `drizzle-typebox`).
- Drizzle is `1.0.0-rc` and uses the new relational API: relations are declared with `defineRelationsPart` and consumed as relational filters (see `src/modules/feeds/repositories/post.repository.ts`).
- `drizzle.config.ts` globs `./src/modules/*/schemas/*.schema.ts`; migrations live in `database/migrations` and apply to `postgres_test` in tests. Never hand-edit generated migrations.
- The Docker image runs `server health` as its healthcheck and the app reports migrations through `src/server.ts migrate`.

## Verification before finishing

1. `bun lint`
2. `bun test` (needs the database up)
