---
description: "Use when editing Python files in the backend. Covers FastAPI patterns, Pydantic models, engine purity, and layered architecture."
applyTo: "backend/**/*.py"
---
# Backend Conventions

## Architecture

- **Engine** (`app/engine/`): Pure functions only — no I/O, no database, no HTTP. All game logic lives here.
- **Services** (`app/services/`): Orchestrate engine + repositories. Manage game lifecycle.
- **Repositories** (`app/repositories/`): SQLAlchemy async data access. Abstract DB operations behind methods.
- **API** (`app/api/`): Thin REST routers. Validate input via Pydantic, delegate to services.
- **WebSocket** (`app/ws/`): Connection management + game message handler. Messages are discriminated unions: `{ type, payload }`.
- **Models** (`app/models/`): Pydantic v2 models with `strict=True`. These are the source of truth for types.
- **Entities** (`app/entities/`): SQLAlchemy ORM models mapped to the database.

## Patterns

- All Python code uses **snake_case** (variables, functions, fields, endpoints).
- Pydantic models always use `model_config = ConfigDict(strict=True)`.
- Game constants live in `app/config.py` (`Settings` class) — single source of truth.
- Action rules (costs, blocks, challenges) live in `app/models/action.py` (`ACTION_RULES` dict).
- DI wiring is in `app/container.py` using `dependency-injector`.

## Testing

- Framework: pytest + pytest-asyncio + httpx
- Unit tests go in `tests/unit/`, integration in `tests/integration/`
- Run: `python -m pytest tests/unit/ -q`

## Documentation

When you change backend code, update `backend/README.md` if API endpoints, project structure, setup steps, or tech stack change. Update `.github/copilot-instructions.md` if architecture or conventions change.
