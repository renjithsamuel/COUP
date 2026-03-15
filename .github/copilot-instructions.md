# Coup – Project Guidelines

## Overview

Multiplayer Coup card game — FastAPI backend + Next.js 14 frontend. Real-time gameplay over WebSocket, lobby management, optional lobby fill-bots, and solo AI match setup via REST.

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
- Solo AI mode: `backend/app/api/game_router.py`, `backend/app/services/game_service.py`, and `backend/app/services/bot_logic.py` create direct human-vs-bot games and drive bot turns from the backend background loop, now with `easy`, `medium`, `hard`, and `lethal` difficulties plus workshop-based bot identities, core-value-driven decision heuristics, and persona-based timing
- Lobby start config may optionally add fill-bots before dealing, as long as human seats plus bots stay within the 6-player table cap
- Lobby moderation: while a room is waiting to start, any seated player may remove another seated player, but never themselves; host ownership falls through to the next remaining player if needed
- WebSocket messages: discriminated union JSON `{ type, payload }`
- WebSocket broadcasts: game events (ACTION_DECLARED, CHALLENGE_RESULT, BLOCK_DECLARED, INFLUENCE_LOST, TURN_CHANGED) are sent as separate messages before GAME_STATE
- Lobby replay reset is host-authoritative: `/api/lobbies/{id}/reset` now requires the host seat identity, preserves the room leaderboard history, and broadcasts `RETURN_TO_LOBBY` so every connected player is pushed back together before the next round
- Reconnect flow is server-authoritative: stale sockets are replaced cleanly, per-socket disconnects do not close shared game services, and empty response windows auto-resolve if their last eligible responder disappears or is eliminated

### Frontend Layers

Pages (App Router) → Containers (logic + layout) → Components (presentational)

- State: React Context + Reducer for complex state (game, lobby)
- Server state: TanStack React Query
- Models: `frontend/src/models/` — TypeScript interfaces mirroring backend Pydantic models
- Service layer: `frontend/src/services/` — API calls with snake_case → camelCase mapping and browser-stable player identity for lobby, replay, and solo AI match flows
- Home entry: `frontend/src/app/page.tsx` splits the landing flow into Play with Friends and Play with AI while keeping the existing room create/join path inside the friends branch, and solo AI setup uses the shared pre-game config modal before match creation
- Pre-game config: `frontend/src/components/PreGameConfig/` now keeps the default setup on a Simple tab with tempo, starting coins, and optional lobby fill-bots using compact custom-themed Mantine dropdowns, while an Advanced tab exposes turn/challenge/block timer overrides in the same dense dropdown language; solo AI mode still keeps bot-count and difficulty controls outside the modal, and waiting-room hosts can reopen the same modal to edit the saved next-round config before starting
- Waiting-room continuity: `frontend/src/app/lobby/[id]/page.tsx` now waits for saved session bootstrap before polling, and if a saved seat expires while the room still exists it offers a controlled rejoin-as-new-seat recovery rendered through a portal instead of crashing or silently redirecting
- Overlays and utility controls: full-screen overlays render through portals, and the shared game utility controls host leaderboard, log, rules, and mute actions across desktop and mobile
- Solo replay flow: AI `Play Again` should reuse the same bot count, difficulty, and timer config rather than returning to a lobby
- Post-game UX: the board locks immediately on `GAME_OVER`, waits briefly for celebration and toast treatment, then opens a dismissible Game Over modal with replay, exit, and winner-only share-card actions; replay also remains reachable after the modal is dismissed, with a smaller mobile recap dock replacing the desktop draggable tray pattern on touch screens and relocating to the top status area so bottom utility controls remain accessible. In multiplayer rooms, only the host sees `Back To Lobby`, while everyone else is returned automatically by the server broadcast.

## Conventions

- **Backend**: snake_case everywhere. Pydantic models with `strict=True`. Pure engine functions — no I/O in `app/engine/`.
- **Frontend**: camelCase in TS. Service layer handles snake_case ↔ camelCase conversion. Container/Component split — containers wire data, components are presentational.
- **Testing**: Backend uses pytest + pytest-asyncio. Frontend uses Vitest + React Testing Library. Mocks live alongside models (`*.mock.ts`).
- **Animations**: Framer Motion for simple transitions, GSAP timelines for complex sequences. Constants in `frontend/src/animations/constants.ts`.
- **Design**: Follow modern, minimal, and material design principles. Prefer clean surfaces, subtle shadows, restrained color palettes, and typographic hierarchy. Avoid visual clutter — every element should earn its place.

## Copilot Response Guideline

- After every code or documentation change, give a clear summary of what changed, what was verified, and any known gaps.
- After every completed change, suggest practical next steps the user may want to take.
- Treat this as a default expectation for all future work in this repository, even for small edits.

## Repository Skills

- `update-docs`: update `.github/copilot-instructions.md`, `backend/README.md`, `frontend/README.md`, and `PROJECT_PLAN.md` when behavior or structure changes.
- `backend-feature-workflow`: use for FastAPI, service, model, lobby, game, and bot logic changes on the backend.
- `frontend-gameplay-workflow`: use for Next.js gameplay, lobby, modal, responsive, and service/query integration changes on the frontend.
- `websocket-contract-changes`: use when a backend/frontend real-time event or payload changes across the socket boundary.
- `targeted-verification`: use to choose the smallest credible backend/frontend test set for the files and behavior you changed.

## Build & Test

```bash
# Backend
cd backend && pip install -r requirements.txt
python -m pytest                    # all tests
python -m pytest tests/unit/ -q     # unit tests only

# Frontend
cd frontend && npm install
npm run dev                         # dev server
npm run type-check                  # TypeScript check
npm test                            # vitest
```

## Documentation Policy

**Whenever you make changes to the project, you MUST update the relevant documentation:**

1. **This file** (`.github/copilot-instructions.md`) — update if architecture, conventions, build commands, or project structure change.
2. **`backend/README.md`** — update if backend API endpoints, setup steps, project structure, or tech stack change.
3. **`frontend/README.md`** — update if frontend structure, components, pages, or tech stack change.
4. **`PROJECT_PLAN.md`** — update if game rules, state machine, or high-level design decisions change.

Do not skip documentation updates — they are part of completing any task.
