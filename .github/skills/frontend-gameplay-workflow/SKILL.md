---
name: frontend-gameplay-workflow
description: "Implement or refine frontend gameplay, lobby, and modal UX in the Coup Next.js app. Use for GameBoard, LobbyRoom, PreGameConfig, overlays, responsive behavior, and service/query integration."
---
# Frontend Gameplay Workflow

## When to Use

Use this skill when work touches:
- `frontend/src/app/` route behavior
- `frontend/src/containers/` gameplay and lobby containers
- `frontend/src/components/` presentational game UI
- `frontend/src/services/` API integration or session persistence
- `frontend/src/queries/` React Query flows
- Responsive or mobile-only gameplay UX

## Required Constraints

- Keep pages thin, containers stateful, and components presentational.
- Keep TypeScript camelCase on the frontend even when backend payloads are snake_case.
- Put API shape conversion in services or mappers, not in presentational components.
- Reuse existing design tokens and visual language rather than inventing a parallel UI system.
- Prefer compact, intentional controls over long form-heavy flows.

## Typical Workflow

1. Read the page, container, and service/query files together before editing.
2. Check whether state belongs in:
   - route/page state
   - context/reducer state
   - React Query server state
   - session storage via a service helper
3. If data comes from the backend, update the mapper or service layer first.
4. Keep `PreGameConfig`, `GameOverModal`, and `LobbyRoom` reusable through props instead of forking components.
5. Validate mobile and desktop behavior when changing overlays, recap docks, or top/bottom utility controls.
6. Run `npm run type-check` after edits, then targeted Vitest where applicable.
7. Invoke the `update-docs` skill if flows or structure changed.

## File Map

- `frontend/src/app/lobby/[id]/page.tsx`: waiting-room lifecycle and redirects
- `frontend/src/app/game/[id]/GamePageContent.tsx`: game entry and replay path selection
- `frontend/src/containers/GameBoard/`: live board state wiring and post-game controls
- `frontend/src/containers/LobbyRoom/`: host controls, waiting room, leaderboard modal
- `frontend/src/components/PreGameConfig/`: shared setup and lobby config editing modal
- `frontend/src/components/GameOverModal/`: end-of-round modal behavior
- `frontend/src/services/lobbyService.ts`: REST calls and storage helpers
- `frontend/src/queries/useLobbyQueries.ts`: lobby fetch and mutation hooks

## Verification Hints

- Always run `npm run type-check` after TS/TSX edits.
- If behavior differs by breakpoint, manually sanity-check mobile-only branches.
- When editing replay, session, or lobby continuity, verify route transitions and storage interactions together.
