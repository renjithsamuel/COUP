# Coup – Project Guidelines

## Overview

Multiplayer Coup card game — FastAPI backend + Next.js 14 frontend. Real-time gameplay over WebSocket, lobby management and solo AI match setup via REST.

## Architecture

- **Backend** (`backend/`): Python 3.12+, FastAPI, SQLAlchemy 2.0 (async SQLite), Pydantic v2 (strict), dependency-injector
- **Frontend** (`frontend/`): Next.js 14 App Router, TypeScript (strict), Mantine v7, TanStack React Query v5, Framer Motion + GSAP
- Game rules defined in `PROJECT_PLAN.md` (source of truth)

### Backend Layers

Engine (pure logic, no I/O) → Services (orchestration) → Repositories (data access) → API (REST + WebSocket)

- Game constants: `backend/app/config.py` (`Settings` class) — single source of truth for defaults
- Per-game config: `backend/app/models/game.py` (`GameConfig`) — host-configurable settings (timers, starting coins) sent at game start and stored in `GameState.config` (timer values may be set to `0` for timerless/Peaceful mode)
- Action rules: `backend/app/models/action.py` (`ACTION_RULES` dict) — single source of truth
- Lobby and leaderboard identity: clients may send a stable `profile_id` so replay flows and cross-game scores follow the same person even if they reconnect or rename themselves
- Solo AI mode: `backend/app/api/game_router.py`, `backend/app/services/game_service.py`, and `backend/app/services/bot_logic.py` create direct human-vs-bot games and drive bot turns from the backend background loop
- Lobby moderation: while a room is waiting to start, any seated player may remove another seated player, but never themselves; host ownership falls through to the next remaining player if needed
- WebSocket messages: discriminated union JSON `{ type, payload }`
- WebSocket broadcasts: game events (ACTION_DECLARED, CHALLENGE_RESULT, BLOCK_DECLARED, INFLUENCE_LOST, TURN_CHANGED) are sent as separate messages before GAME_STATE

### Frontend Layers

Pages (App Router) → Containers (logic + layout) → Components (presentational)

- State: React Context + Reducer for complex state (game, lobby)
- Server state: TanStack React Query
- Models: `frontend/src/models/` — TypeScript interfaces mirroring backend Pydantic models
- Service layer: `frontend/src/services/` — API calls with snake_case → camelCase mapping and browser-stable player identity for lobby, replay, and solo AI match flows
- Home entry: `frontend/src/app/page.tsx` splits the landing flow into Play with Friends and Play with AI while keeping the existing room create/join path inside the friends branch
- Overlays and utility controls: full-screen overlays render through portals, and the shared game utility controls host leaderboard, log, rules, and mute actions across desktop and mobile

## Conventions

- **Backend**: snake_case everywhere. Pydantic models with `strict=True`. Pure engine functions — no I/O in `app/engine/`.
- **Frontend**: camelCase in TS. Service layer handles snake_case ↔ camelCase conversion. Container/Component split — containers wire data, components are presentational.
- **Testing**: Backend uses pytest + pytest-asyncio. Frontend uses Vitest + React Testing Library. Mocks live alongside models (`*.mock.ts`).
- **Animations**: Framer Motion for simple transitions, GSAP timelines for complex sequences. Constants in `frontend/src/animations/constants.ts`.
- **Design**: Follow modern, minimal, and material design principles. Prefer clean surfaces, subtle shadows, restrained color palettes, and typographic hierarchy. Avoid visual clutter — every element should earn its place.

## Build & Test

```bash
# Backend
cd backend && pip install -r requirements.txt
python -m pytest                    # all tests
python -m pytest tests/unit/ -q     # unit tests only

# Frontend
cd frontend && npm install
npm run dev                         # dev server
npm test                            # vitest
```

## Documentation Policy

**Whenever you make changes to the project, you MUST update the relevant documentation:**

1. **This file** (`.github/copilot-instructions.md`) — update if architecture, conventions, build commands, or project structure change.
2. **`backend/README.md`** — update if backend API endpoints, setup steps, project structure, or tech stack change.
3. **`frontend/README.md`** — update if frontend structure, components, pages, or tech stack change.
4. **`PROJECT_PLAN.md`** — update if game rules, state machine, or high-level design decisions change.

Do not skip documentation updates — they are part of completing any task.
