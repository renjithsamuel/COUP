---
name: targeted-verification
description: "Choose and run the smallest credible verification set for Coup changes. Use after backend, frontend, websocket, lobby, replay, or UI updates to confirm behavior without defaulting to the full suite every time."
---
# Targeted Verification

## When to Use

Use this skill after making changes, especially when the work touched:
- lobby lifecycle or player identity
- replay/reset behavior
- WebSocket message handling
- backend API contracts
- frontend route transitions or storage helpers
- gameplay UI logic with conditional rendering

## Verification Strategy

Pick the smallest set that actually covers the change.

### Backend

- Lobby API changes: `python -m pytest backend/tests/integration/test_lobby_api.py -q`
- Lobby service changes: `python -m pytest backend/tests/unit/test_lobby_service.py -q`
- Game service or bot logic changes: `python -m pytest backend/tests/unit/test_game_service.py -q`

### Frontend

- Any TS/TSX change: `npm run type-check`
- UI behavior with a focused spec: run the nearest relevant Vitest file
- Mapper/model changes: at minimum run `npm run type-check`, then add/adjust a spec if behavior is non-trivial

## Rules

- Do not claim verification you did not run.
- If only targeted tests were run, say so explicitly.
- If a change spans backend and frontend, verify both sides.
- If there is no existing focused test, say that a manual smoke test is still advisable.

## Common Pairings

- Lobby reset or host authorization:
  - `backend/tests/unit/test_lobby_service.py`
  - `backend/tests/integration/test_lobby_api.py`
  - `npm run type-check`
- WebSocket contract change:
  - targeted backend tests for the emitting flow
  - `npm run type-check`
  - manual multi-client smoke test if navigation or synchronization changed
- UI-only modal/layout change:
  - `npm run type-check`
  - nearest Vitest spec if one exists
