# AGENTS instructions

This document outlines the conventions, technologies, and patterns used in this project. It serves as a guide to ensure all future contributions are consistent with the existing codebase.

## 1. Core Technologies

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [ElysiaJS](https://elysiajs.com) - A fast, and type-safe backend framework for Bun.
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Database Driver**: [Bun.sql](https://bun.com/docs/api/sql) - Bun's built-in SQL Driver.
- **Database**: PostgreSQL
- **Linting & Formatting**: [BiomeJS](https://biomejs.dev)
- **Testing**: `bun:test` - Bun's built-in test runner.
- **API Documentation**: `@elysiajs/openapi` - Generates OpenAPI/Swagger documentation.
- **Configuration & Validation**: `@sinclair/typebox` for environment and request/response validation.

## 2. Project Structure

The project follows a modular, feature-based architecture.

```
├── database           # Drizzle ORM setup, migrations, and seeders.
│   ├── migrations/     # Drizzle migration files.
│   └── seeders/        # Database seed scripts.
├── deploy             # Deployment configurations (Docker, Compose).
│   ├── docker/         # Dockerfiles.
│   └── ...             # Compose files for different environments.
├── scripts            # Utility scripts (e.g., load testing).
├── src
│   ├── app.ts          # App initialization and configuration.
│   ├── server.ts       # Application entry point.
│   ├── config/         # Environment variable schemas and parsing (auth, db).
│   ├── modules/        # Business logic, grouped by feature (e.g., "feeds").
│   │   └── [feature]/
│   │       ├── schemas/        # Drizzle table definitions (e.g., posts.schema.ts).
│   │       ├── repositories/   # Data access logic using Drizzle.
│   │       ├── *.controller.ts # ElysiaJS controllers defining routes and handlers.
│   │       └── types.ts        # TypeScript types for the module.
│   ├── plugins/        # Reusable Elysia plugins (auth, error handling, openapi).
│   ├── routes/         # Top-level route composition.
│   └── utils/          # Shared utilities (API response formatters, custom errors).
└── test               # Test files mirroring src structure.
```

## 3. Development Workflow & Commands

All commands are run using `bun`.

- **Run development server**: `bun dev`
- **Run tests**: `bun test`
- **Check for lint errors**: `bun lint`
- **Format code**: `bun format`
- **Generate DB migrations**: `bun db:generate`
- **Apply DB migrations**: `bun db:migrate`
- **Open Drizzle Studio**: `bun db:studio`

## 4. Coding Style & Conventions

### Formatting & Linting

- **Tool**: BiomeJS is the single source of truth for formatting and linting. Configuration is in `biome.json`.
- **Style**:
  - Single quotes (`'`).
  - Semicolons are omitted (`as-needed`).
  - Follows `recommended` BiomeJS rules.
- **Imports**: Imports are organized automatically by Biome.
- **Module Alias**: The project uses the `~/*` alias for `src/*`. Always use this for internal imports (e.g., `import { logger } from '~/plugins/logger.plugin'`).

### Naming Conventions

- **Files**: Lowercase, kebab-case for multi-word files (e.g., `error-handler.plugin.ts`).
- **Controllers**: `[feature].controller.ts` (e.g., `posts.controller.ts`), if there's multiple controllers in a module put them under a folder named `controllers` within the module e.g.:
  ```
  /[feature]
  ├── controllers/
  │   ├── posts.controller.ts
  │   └── comments.controller.ts
  ├── *.repository.ts
  └── types.ts
  ```
- **Repositories**: `[feature].repository.ts` (e.g., `post.repository.ts`), if there's multiple repositories in a module put them under a folder named `repositories` within the module e.g.:
  ```
  /[feature]
  ├── repositories/
  │   ├── post.repository.ts
  │   ├── comment.repository.ts
  │   └── index.ts
  ├── *.controller.ts
  └── types.ts
  ```
  For multiple repositories, an `index.ts` file in the `repositories` directory exports each repositories with the repository initiation.

  The repository initiation done in `repositories/index.ts` should be a camelCase version of the repository name, e.g.:
  ```ts
  // repositories/post.repository.ts
  export class PostRepository {
    constructor(/* dependencies */) {}
  }

  // repositories/index.ts
  export const postRepository = new PostRepository(
    /* inject dependencies */
  );
  ```
- **Schemas**: `[name].schema.ts` (e.g., `posts.schema.ts`).
- **Plugins**: `[name].plugin.ts` (e.g., `logger.plugin.ts`). Every single third-party library should be initialized within `plugins` directory.
- **Types**: PascalCase (e.g., `type Post = ...`).

### API Design

- **Versioning**: API is versioned under `/v1`. See `src/routes/v1.route.ts`.
- **Successful Responses**: Standardized using `asItemResponse` and `asItemsResponse` from `~/utils/response.util.ts`.
  - Single item: `{ "data": { ... } }`
  - Collection: `{ "data": [ ... ], "meta": { ... } }`
- **Error Responses**: Handled globally by `errorHandlerPlugin`. Custom errors are defined in `~/utils/errors.util.ts`. Validation errors have a specific structure:
  ```json
  {
    "code": "VALIDATION",
    "message": "Invalid request...",
    "errors": [
      {
        "type": 40,
        "path": "/body/name",
        "value": null,
        "summary": "Expected string"
      }
    ]
  }
  ```

### Database (Drizzle ORM)

- **Schema Definition**: Schemas are defined in `src/modules/[feature]/schemas/`. Each table gets its own file (e.g., `posts.schema.ts`).
- **Schema Index**: The `index.ts` file in the `schemas` directory is responsible for:
  - **Exporting Tables**: Grouping all module tables into an exported object (e.g., `export const feedTables = { comments, posts }`).
  - **Defining Relations**: Defining relationships using `defineRelationsPart` (e.g., `export const feedRelations = ...`).
  - **TypeBox Schemas**: Generating and exporting TypeBox schemas using `createSelectSchema` from `drizzle-typebox` for use in API validation (e.g., `PostSchema`).
- **Database Plugin**: The database instance and configuration are centrally managed in `src/plugins/database.plugin.ts`. Modules should import the `db` instance from this plugin rather than initializing Drizzle directly.
- **Migrations**: Use `drizzle-kit` for generating and applying migrations. Migrations are stored in `database/migrations`. Never alter migration files manually after they are generated.
- **Queries**: Repositories should encapsulate all database query logic. Controllers should call repository methods, not interact with `drizzle` directly.

## 5. Testing

- **Framework**: `bun:test`.
- **Location**: Test files are located in the `test/` directory, mirroring the `src/` structure.
- **File Naming**: `*.test.ts` (e.g., `posts.controller.test.ts`).
- **Pattern**:
  - Tests are written within `describe` and `it` blocks.
  - Assertions use `expect()`.
  - For controller tests, `new Request()` is used to simulate HTTP requests passed to the Elysia instance's `.handle()` method.
  - Database state is managed using `beforeAll` and `afterAll` hooks to insert test data and clean up afterwards.

## 6. How to Contribute

1.  **Create a new Module**:
    - Create a new folder in `src/modules/` for your feature.
    - Inside, create a `schemas/` folder and add your schema definition files. Create an `index.ts` to export all schemas from this directory.
    - Create `*.repository.ts` for data logic and `*.controller.ts` for API routes.
    - Add any specific `types.ts`.
2.  **Add a new Route**:
    - Open the relevant `*.controller.ts`.
    - Add a new route handler using Elysia's syntax (e.g., `.get('/path', handler)`).
    - Define input/output schemas using `t` from `elysia` for automatic validation and OpenAPI documentation.
3.  **Write a Test**:
    - Create a corresponding `*.test.ts` file in the `test/` directory.
    - Import from `bun:test`.
    - Write tests to cover the new functionality, including success and failure cases.
4.  **Lint and Format**:
    - Run `bun format` before committing.
