# Coup Backend

Real-time multiplayer Coup card game — FastAPI backend with WebSocket support, SQLite persistence, and dependency injection.

## About

This is the Python backend for the Coup multiplayer card game. It handles:
- **Game logic engine** — Pure, stateless game rules implementation
- **REST API** — Lobby management (create, join, list, start)
- **WebSocket** — Real-time gameplay (actions, challenges, blocks, state sync)
- **SQLite database** — Game state persistence via SQLAlchemy 2.0

## Tech Stack

| Component | Technology |
|---|---|
| Framework | FastAPI |
| WebSocket | Starlette (built into FastAPI) |
| Database | SQLite + SQLAlchemy 2.0 (async) |
| Validation | Pydantic v2 (strict mode) |
| DI Container | dependency-injector |
| Testing | pytest + pytest-asyncio + httpx |

## Project Structure

```
backend/
├── app/
│   ├── api/              # REST endpoints (lobby, health)
│   ├── engine/           # Pure game logic (no I/O)
│   │   ├── game_engine.py      # State machine & turn management
│   │   ├── action_handler.py   # Per-action handlers (strategy pattern)
│   │   ├── challenge_handler.py
│   │   ├── block_handler.py
│   │   └── deck.py             # Deck shuffle/draw
│   ├── entities/         # SQLAlchemy ORM models
│   ├── models/           # Pydantic models (source of truth for types)
│   │   ├── action.py     # ACTION_RULES — single source of truth
│   │   ├── card.py       # Character enum
│   │   ├── game.py       # GameState, GamePhase
│   │   ├── player.py     # Player, PlayerPublic
│   │   └── lobby.py
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic orchestration
│   ├── ws/               # WebSocket connection management
│   ├── config.py         # Settings (single source of truth for game constants)
│   ├── container.py      # DI container
│   └── main.py           # App factory
└── tests/
    ├── unit/engine/      # Engine logic tests
    ├── unit/models/      # Model validation tests
    └── integration/      # API integration tests
```

## Setup

### Prerequisites
- Python 3.12+
- pip

### Installation

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Environment

Copy `.env.example` to `.env` and adjust values if needed:

```bash
cp .env.example .env
```

## Running

### Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

### Running Tests

```bash
# All tests
python -m pytest

# Unit tests only
python -m pytest tests/unit/

# With coverage
python -m pytest --cov=app

# Verbose
python -m pytest -v
```

## API Reference

### REST Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/lobbies` | Create lobby (`{ host_name, max_players }`) — returns 6-char room code |
| `GET` | `/api/lobbies` | List open lobbies |
| `GET` | `/api/lobbies/{id}` | Get lobby details (case-insensitive code) |
| `POST` | `/api/lobbies/{id}/join` | Join lobby by room code (`{ player_name }`) |
| `POST` | `/api/lobbies/{id}/leave` | Leave lobby (`?player_id=...` query param) |
| `POST` | `/api/lobbies/{id}/start` | Start game (host only, optional `GameConfig` body) |

`GameConfig` request body fields:
- `turn_timer_seconds` (`0-120`) — `0` disables turn timer (Peaceful Mode)
- `challenge_window_seconds` (`0-30`) — `0` disables challenge timeout
- `block_window_seconds` (`0-30`) — `0` disables block timeout
- `starting_coins` (`1-5`)

### WebSocket

Connect to `ws://localhost:8000/ws/game/{game_id}?token={session_token}&player_id={player_id}`

#### Client Messages

```json
{ "type": "ACTION",          "payload": { "action": "steal", "targetId": "..." } }
{ "type": "CHALLENGE",       "payload": {} }
{ "type": "BLOCK",           "payload": { "blockingCharacter": "contessa" } }
{ "type": "ACCEPT",          "payload": {} }
{ "type": "CHOOSE_INFLUENCE","payload": { "cardIndex": 0 } }
{ "type": "EXCHANGE_RETURN", "payload": { "keepIndices": [0, 1] } }
```

#### Server Messages

| Type | Description |
|---|---|
| `GAME_STATE` | Full game state (personalized per player) |
| `ACTION_DECLARED` | Action announced (actor, action, target) |
| `CHALLENGE_RESULT` | Challenge outcome (challenger won/lost) |
| `BLOCK_DECLARED` | Block announced (blocker, character) |
| `INFLUENCE_LOST` | Player lost influence (player, character) |
| `PLAYER_ELIMINATED` | Player eliminated from game |
| `TURN_CHANGED` | New turn started (player, turn number) |
| `GAME_OVER` | Game finished (winner) |
| `ERROR` | Error message |

Connection presence is reflected in `players[].connected` inside `GAME_STATE`. On connect/disconnect, the server emits `PLAYER_CONNECTED`/`PLAYER_DISCONNECTED` and then sends updated game state so other players can see presence changes immediately.

## Modifying Game Rules

All game constants are in **one place**: `app/config.py` (`Settings` class).  
All action rules (costs, blocks, challenges) are in **one place**: `app/models/action.py` (`ACTION_RULES` dict).

To change a rule:
1. Edit the constant in `config.py` or the rule in `action.py`
2. Run tests to verify: `python -m pytest`

## Architecture

- **Engine** (`app/engine/`) — Pure functions, no I/O. All game logic lives here.
- **Services** — Orchestrate engine + repositories. Manage game lifecycle. `GameService` shares per-game in-memory state and per-game mutation locks across WebSocket handlers so all players operate on the same live turn state.
- **Repositories** — Data access via SQLAlchemy. Abstract DB operations.
- **DI Container** (`app/container.py`) — Wires everything together.

## License

MIT
