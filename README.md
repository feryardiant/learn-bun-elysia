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

### Environment Setup

The project uses different environment files for various contexts:

- **`.env`**: Default configuration used by **Docker Compose**. It sets `DB_HOST=postgres` to communicate within the Docker network.
- **`.env.local`**: Configuration for **Local Development** on your host machine. It sets `DB_HOST=localhost` to connect to the exposed database port.
- **`.env.test`**: Automatically used when running `bun test`. It configures a separate test database (`postgres_test`) and reduces log verbosity.

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