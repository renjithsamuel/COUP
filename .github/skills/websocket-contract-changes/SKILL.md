---
name: websocket-contract-changes
description: "Handle backend/frontend WebSocket contract changes safely. Use when adding or renaming socket message types, payload fields, mapper behavior, or cross-layer real-time flows."
---
# WebSocket Contract Changes

## When to Use

Use this skill when a change affects any of these together:
- `backend/app/models/websocket_message.py`
- backend WebSocket handlers or broadcasts
- `frontend/src/models/websocket-message/`
- `frontend/src/services/wsMessageMapper.ts`
- frontend gameplay hooks that react to socket events

## Required Constraints

- Treat the backend message contract as the source event schema.
- Keep frontend models camelCase even if backend events are UPPER_CASE with snake_case payloads.
- Do not leave message additions half-wired across the stack.
- For a new server event, update all of: backend enum, backend sender, frontend enum, mapper, and consumer logic.

## End-to-End Checklist

1. Add or update the backend message enum.
2. Emit the event from the correct backend orchestration point.
3. Ensure the payload contains only the minimal data the client needs.
4. Add the matching frontend message enum entry.
5. Map UPPER_CASE and snake_case payload fields in `wsMessageMapper.ts`.
6. Update the consuming hook or container, usually under `GameBoard.hooks.ts`.
7. Verify fallback behavior if the message arrives during reconnect or stale UI state.
8. Update docs for any externally visible flow change.

## High-Risk Areas

- Replay/reset flows where multiple clients must synchronize
- Presence/connectivity updates that can race with route changes
- Game state events that also imply navigation or modal changes
- Payload shape drift between backend and mapper

## Verification Hints

- Validate both the backend broadcast path and the frontend reaction path.
- Run targeted backend tests plus frontend type-check.
- For navigation-triggering events, do a manual multi-client smoke test when possible.
