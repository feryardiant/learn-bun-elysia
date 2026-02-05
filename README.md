# Learn Elysia.js & Bun

This project demonstrates a modern backend API built with [ElysiaJS](https://elysiajs.com) running on the [Bun](https://bun.sh) runtime. It features a modular architecture, PostgreSQL database integration via Drizzle ORM, and comprehensive Docker support.

## Features

- **Runtime**: Bun (Fast JavaScript runtime)
- **Framework**: ElysiaJS (Type-safe, ergonomic web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Validation**: TypeBox
- **Documentation**: Swagger/OpenAPI (via Elysia plugin)
- **Deployment**: Docker & Docker Compose ready

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2.22 or later)
- [Docker](https://www.docker.com/) & Docker Compose

### Environment & Configuration

The project uses different environment files for various contexts:

- **`[.env.example](.env.example)`**: Acts as the template. It lists all required environment variables with safe defaults for local development.
- **`.env`**: Default configuration used by **Docker Compose**. It sets `DB_HOST=postgres` to communicate within the Docker network.
- **`.env.local`**: Configuration for **Local Development** on your host machine. It sets `DB_HOST=localhost` to connect to the exposed database port.
- **`.env.test`**: Automatically used when running `bun test`. It configures a separate test database (`postgres_test`) and reduces log verbosity.
- **`[src/config/*.ts](src/config/)`**: These files use schema validation (TypeBox) to load these variables into the application at runtime, ensuring types and required fields are present.

#### Configuration Breakdown

**1. Server & Runtime**
Used to configure the HTTP server and runtime mode.
- `PORT`, `HOST`: Server binding. `0.0.0.0` in Docker, `localhost` locally.
- `NODE_ENV`: Defines behavior (`local`, `production`).

**2. Docker Infrastructure**
These define the base images and versions for Docker. They are **not** used by the application code (`src/*`).
- `BASE_OS`, `BASE_VERSION`: Alpine version selection.
- `BUN_VERSION`, `DB_VERSION`: Tool versions.
- `FORWARD_APP_PORT`, `FORWARD_DB_PORT`: Allow you to change which ports are exposed to your host machine without changing the internal container ports.

**3. Application Metadata**
*Config: `[src/config/app.config.ts](src/config/app.config.ts)`*
- `APP_NAME`, `APP_VERSION`: Metadata (can be baked into Docker image) with defaults value come from `[package.json](package.json)`. They are unique because they are often injected at **build time** (see below) to bake the version into the release binary.
- `APP_URL`, `APP_DOMAIN`: Public access URLs.
- `LOG_LEVEL`: Logging verbosity.

**4. Authentication & Security**
*Config: `[src/config/auth.config.ts](src/config/auth.config.ts)`*
- `AUTH_SECRET`: Critical key for cryptographic signing.
- `TRUSTED_ORIGINS`: CORS allowlist (CSV format).

**5. Database**
*Config: `[src/config/db.config.ts](src/config/db.config.ts)`*
- `DB_USER`, `DB_PASS`, `DB_NAME`: Credentials.
- `DB_HOST`: `postgres` (internal Docker DNS) or `localhost` (host).

#### Docker Strategy

**Build vs Runtime (`[deploy/docker/elysia-app.dockerfile](deploy/docker/elysia-app.dockerfile)`)**:
| Variable | Type | Stage | Description |
| :--- | :--- | :--- | :--- |
| **BUN_VERSION** | `ARG` | Build | Selects the Bun version for the builder image. |
| **BASE_OS** | `ARG` | Build | Selects the OS (Alpine) for builder and runtime images. |
| **BASE_VERSION** | `ARG` | Build | Selects the OS version. |
| **APP_NAME** | `ARG` → `ENV` | **Both** | Passed as an ARG during build, then baked into the image as a default ENV. |
| **APP_VERSION** | `ARG` → `ENV` | **Both** | Same as above. Allows `server health` to report version without needing `.env` at runtime. |
| **LOG_LEVEL** | `ARG` → `ENV` | **Both** | Sets default logging verbosity. |
| **NODE_ENV** | `ENV` | Run | Hardcoded to `production` in the final stage. |
| **PORT / HOST** | `ENV` | Run | Hardcoded to `3000` / `0.0.0.0` for container compatibility. |

**Dev Container (`[.devcontainer/dockerfile](.devcontainer/dockerfile)`)**:
- Uses `ARG` only for image selection (`BUN_VERSION`, `BASE_OS`).
- Everything else is Runtime `ENV`.
- Sets `NODE_ENV=devcontainer` so the app knows it's in a dev environment.

**Compose Structure**
1. **`[deploy/compose.yml](deploy/compose.yml)` (Base)**:
   * Defines the core services (`app`, `postgres`).
   * Uses shell expansion (`${VAR:-default}`) to allow `.env` overrides but provides sane defaults (e.g., `DB_HOST` defaults to `postgres`).
   * **Crucial**: It loads the `.env` file (`env_file: - path: ../.env`) so your local config works immediately.

2. **`[deploy/compose.staging.yml](deploy/compose.staging.yml)`**:
   * Extends the base.
   * Forces `NODE_ENV: staging`.

3. **`[compose.yml](compose.yml)` (Root)**:
   * This is likely your main entry point for `docker compose up`.
   * Extends `[deploy/compose.yml](deploy/compose.yml)`.
   * **Build Context**: Points to current directory (`.`) so it can copy source code.
   * **Build Args**: Passes `APP_NAME`, `APP_VERSION`, etc., from your `.env` to the Docker build process.

**Setup Steps:**

1. Copy the example file to create your base `.env`:
   ```bash
   cp .env.example .env
   ```
2. For local development (running `bun dev`), create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   # Ensure DB_HOST=localhost in .env.local
   ```
   *Note: Bun automatically prioritizes `.env.local` over `.env` when not running in production.*

---

### Option 1: Local Development

Run the application locally with a Dockerized database.

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start the Database:**
   Use Docker Compose to start only the PostgreSQL service.
   ```bash
   docker compose up -d postgres
   ```

3. **Run Migrations:**
   Apply database migrations to the running Postgres instance.
   ```bash
   bun db:migrate
   ```

4. **Start the Development Server:**
   ```bash
   bun dev
   ```
   The API will be available at `http://localhost:3000`.
   Swagger documentation is available at `http://localhost:3000/swagger`.

---

### Option 2: Run with Docker

Run the entire stack (App + DB) using Docker Compose.

```bash
docker compose up -d
```
The application will be accessible at `http://localhost:3010` (or the port defined in `FORWARD_APP_PORT`).

---

### Option 3: DevContainer

This project includes a `.devcontainer` configuration for VS Code.

1. Open the project in VS Code.
2. Install the **Dev Containers** extension.
3. Run the command **"Dev Containers: Reopen in Container"**.

This will set up a complete development environment with Bun, PostgreSQL, and all extensions pre-installed.

## Scripts

- `bun dev`: Start dev server with hot reload.
- `bun build`: Build for production.
- `bun lint`: Lint code with Biome.
- `bun format`: Format code with Biome.
- `bun test`: Run unit tests.
- `bun test:load`: Run k6 load tests.
- `bun db:generate`: Generate Drizzle migrations.
- `bun db:migrate`: Apply migrations.
- `bun db:studio`: Open Drizzle Studio.

## Project Structure

```
/database           # Drizzle ORM setup, migrations, and seeders.
/deploy             # Docker and Compose configurations.
/src
├── config/         # Environment configurations.
├── modules/        # Feature-based modules (Controller, Repository, Schema).
├── plugins/        # Elysia plugins.
└── utils/          # Shared utilities.
/test               # Tests.
```
