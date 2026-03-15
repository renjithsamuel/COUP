---
name: backend-feature-workflow
description: "Implement or modify backend features in the Coup FastAPI service. Use for lobby/game API changes, service orchestration updates, model changes, backend bot behavior, and persistence-aware gameplay fixes."
---
# Backend Feature Workflow

## When to Use

Use this skill when work touches:
- `backend/app/api/` REST or WebSocket entry points
- `backend/app/services/` orchestration logic
- `backend/app/models/` Pydantic request, response, or game-state models
- `backend/app/repositories/` persistence behavior
- `backend/app/services/bot_logic.py` or AI-related backend decisions
- Backend tests under `backend/tests/`

Do not use this skill for pure frontend changes.

## Required Constraints

- Preserve the backend layering: engine -> services -> repositories -> API.
- Keep `backend/app/engine/` pure: no I/O, no database access, no HTTP concerns.
- Use snake_case consistently.
- Keep Pydantic models strict and aligned with frontend-facing contracts.
- Prefer fixing the service/model boundary instead of patching API routes with ad hoc logic.

## Typical Workflow

1. Read the matching route, service, and model files before changing behavior.
2. Confirm where the source of truth lives:
   - Defaults in `backend/app/config.py`
   - Action rules in `backend/app/models/action.py`
   - Game config in `backend/app/models/game.py`
3. If a response shape changes, update the Pydantic model first.
4. If behavior spans API and services, keep validation in API light and orchestration in services.
5. Add or update the narrowest backend tests that prove the change.
6. Run targeted pytest commands before broader verification.
7. Invoke the `update-docs` skill if external behavior changed.

## File Map

- `backend/app/api/lobby_router.py`: lobby lifecycle, start/reset/join/leave/kick
- `backend/app/api/game_router.py`: solo AI match setup
- `backend/app/services/lobby_service.py`: lobby identity, sessions, host rules
- `backend/app/services/game_service.py`: game lifecycle orchestration
- `backend/app/services/bot_logic.py`: AI personas, heuristics, pacing
- `backend/app/models/websocket_message.py`: server event contracts
- `backend/tests/integration/test_lobby_api.py`: API behavior coverage
- `backend/tests/unit/test_game_service.py`: service-level rules
- `backend/tests/unit/test_lobby_service.py`: lobby lifecycle and authorization

## Verification Hints

- Prefer route-specific or service-specific pytest files first.
- When editing replay, lobby, or identity flows, verify both unit and integration coverage.
- If you changed WebSocket message shapes, coordinate with the frontend mapper and models.
