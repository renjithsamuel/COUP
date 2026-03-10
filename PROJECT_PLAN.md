# Coup Multiplayer Game — Full Project Plan

## 1. Project Overview

A real-time multiplayer implementation of the card game **Coup** (2–6 players) featuring WebSocket-driven gameplay, polished animations, and a modern minimal UI. The architecture enforces strict separation between a **Next.js** frontend and a **Python (FastAPI)** backend with **SQLite** persistence.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router) + TypeScript |
| **UI Kit** | Mantine v7 |
| **State Management** | React Context API + `useReducer` (when state count > 3–4 pieces) |
| **Server State / Caching** | TanStack React Query v5 |
| **Animations** | Framer Motion (layout/transitions) + GSAP (complex sequences) |
| **WebSocket Client** | Native WebSocket wrapped in a custom hook |
| **Testing (FE)** | Vitest + React Testing Library |
| **Backend Framework** | FastAPI (Python 3.12+) |
| **WebSocket Server** | FastAPI WebSockets (Starlette) |
| **Database** | SQLite via SQLAlchemy 2.0 (async) + Alembic migrations |
| **Validation** | Pydantic v2 (strict mode) |
| **DI Container** | `dependency-injector` library |
| **Testing (BE)** | pytest + pytest-asyncio + httpx (AsyncClient) |
| **Monorepo Management** | Separate `/frontend` and `/backend` directories at project root |

---

## 3. Game Rules Reference (Source of Truth)

All logic must conform exactly to these rules:

### 3.1 Setup
- Deck: 15 cards total — 3 each of Duke, Assassin, Captain, Ambassador, Contessa.
- Each player receives **2 face-down cards** (influence) and **2 coins**.
- Remaining cards form the **Court Deck**; remaining coins form the **Treasury**.

### 3.2 Turn Actions (exactly one per turn)

| Action | Cost | Effect | Blockable By | Challengeable |
|---|---|---|---|---|
| **Income** | 0 | +1 coin from treasury | — | No |
| **Foreign Aid** | 0 | +2 coins from treasury | Duke | No (but block is challengeable) |
| **Coup** | 7 coins | Target loses 1 influence | — | No |
| **Tax** (Duke) | 0 | +3 coins from treasury | — | Yes |
| **Assassinate** (Assassin) | 3 coins | Target loses 1 influence | Contessa | Yes |
| **Steal** (Captain) | 0 | Take 2 coins from target | Captain, Ambassador | Yes |
| **Exchange** (Ambassador) | 0 | Draw 2, return 2 to deck | — | Yes |

### 3.3 Challenge Flow
1. Any player may challenge an action claim.
2. If the acting player **has** the claimed card → challenger loses 1 influence; acting player shuffles card back and draws a new one.
3. If the acting player **does not have** the card → acting player loses 1 influence; action is cancelled (coins refunded if applicable).

### 3.4 Block Flow
1. A player declares a block (claiming a blocking character).
2. The original actor (or any player) may **challenge** the block.
3. If unchallenged, the block succeeds and the original action is cancelled.
4. If the block is challenged, follow Challenge Flow above.

### 3.5 Mandatory Coup
- If a player **starts** their turn with **≥ 10 coins**, they **must** Coup.

### 3.6 Elimination
- A revealed card stays **face-up** permanently.
- A player with **0 face-down cards** is eliminated.
- Last player standing wins.

### 3.7 Edge Cases to Handle
- Assassination: 3 coins are paid **before** the action resolves. If challenged and the assassin loses, coins are NOT refunded. If blocked by Contessa, coins are still spent.
- Steal from player with 1 coin: only 1 coin is stolen.
- Steal from player with 0 coins: action is legal but no coins move.
- Exchange: player sees their hand + 2 drawn cards, picks any 2 to keep, returns 2 to deck.
- Challenging a block: if the blocker wins the challenge, the block stands AND the challenger loses influence.
- Self-coup is not allowed.
- A dead player cannot act, block, or challenge.

---

## 4. Architecture

### 4.1 High-Level Diagram

```
┌─────────────────────────┐         WebSocket (JSON)         ┌──────────────────────────┐
│                         │ ◄──────────────────────────────► │                          │
│   Next.js Frontend      │         REST (HTTP/JSON)         │   FastAPI Backend         │
│   (Port 3000)           │ ◄──────────────────────────────► │   (Port 8000)             │
│                         │                                  │                          │
│  - Pages                │                                  │  - WebSocket Manager      │
│  - Containers           │                                  │  - Game Engine (pure)     │
│  - Components           │                                  │  - Repositories (SQLite)  │
│  - React Query          │                                  │  - DI Container           │
│  - WebSocket Hook       │                                  │  - Pydantic Models        │
└─────────────────────────┘                                  └──────────────────────────┘
```

### 4.2 Communication Protocol

| Purpose | Transport | Details |
|---|---|---|
| **Lobby management** (create/join/list games) | REST API | CRUD via React Query |
| **Real-time gameplay** (actions, challenges, blocks, state sync) | WebSocket | JSON messages with typed event schema |
| **Reconnection** | WebSocket | Token-based session resume within 60s grace period |

### 4.3 WebSocket Message Schema (examples)

```typescript
// Client → Server
{ type: "ACTION", payload: { action: "steal", targetId: "player-3" } }
{ type: "CHALLENGE", payload: { challengedPlayerId: "player-1" } }
{ type: "BLOCK", payload: { blockingCharacter: "contessa" } }
{ type: "CHOOSE_INFLUENCE", payload: { cardIndex: 0 } }

// Server → Client
{ type: "GAME_STATE", payload: { ...fullGameState } }
{ type: "ACTION_DECLARED", payload: { playerId, action, target? } }
{ type: "CHALLENGE_RESULT", payload: { challengerId, success, revealedCard } }
{ type: "WAITING_FOR", payload: { playerId, expectedAction: "choose_influence" } }
{ type: "PLAYER_ELIMINATED", payload: { playerId } }
{ type: "GAME_OVER", payload: { winnerId } }
```

---

## 5. Backend Design

### 5.1 Folder Structure

```
backend/
├── alembic/                     # DB migrations
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app factory
│   ├── config.py                # Settings via pydantic-settings
│   ├── container.py             # DI container (dependency-injector)
│   ├── dependencies.py          # FastAPI Depends helpers
│   │
│   ├── models/                  # Pydantic models (strict)
│   │   ├── __init__.py
│   │   ├── game.py              # GameState, GameConfig
│   │   ├── player.py            # Player, PlayerPublic
│   │   ├── action.py            # Action, ActionResult
│   │   ├── card.py              # Card, Character enum
│   │   ├── lobby.py             # Lobby, LobbyCreate
│   │   └── websocket_message.py # WS event schemas (discriminated union)
│   │
│   ├── entities/                # SQLAlchemy ORM entities
│   │   ├── __init__.py
│   │   ├── game_entity.py
│   │   ├── player_entity.py
│   │   └── base.py
│   │
│   ├── repositories/            # Data access layer (Repository pattern)
│   │   ├── __init__.py
│   │   ├── base.py              # Abstract base repository
│   │   ├── game_repository.py
│   │   └── player_repository.py
│   │
│   ├── services/                # Business logic layer
│   │   ├── __init__.py
│   │   ├── game_service.py      # Orchestrates game flow
│   │   ├── lobby_service.py     # Lobby CRUD
│   │   └── action_service.py    # Validates & executes actions
│   │
│   ├── engine/                  # Pure game logic (no I/O)
│   │   ├── __init__.py
│   │   ├── game_engine.py       # State machine, turn logic
│   │   ├── action_handler.py    # Per-action handlers
│   │   ├── challenge_handler.py # Challenge resolution
│   │   ├── block_handler.py     # Block resolution
│   │   └── deck.py              # Deck shuffle/draw
│   │
│   ├── api/                     # REST endpoints
│   │   ├── __init__.py
│   │   ├── router.py            # Aggregated router
│   │   ├── lobby_router.py
│   │   └── health_router.py
│   │
│   ├── ws/                      # WebSocket endpoints
│   │   ├── __init__.py
│   │   ├── connection_manager.py
│   │   ├── game_ws_handler.py
│   │   └── message_dispatcher.py
│   │
│   └── utils/
│       ├── __init__.py
│       └── timer.py             # Turn timer utilities
│
├── tests/
│   ├── conftest.py              # Shared fixtures, test DB
│   ├── unit/
│   │   ├── engine/
│   │   │   ├── test_game_engine.py
│   │   │   ├── test_action_handler.py
│   │   │   ├── test_challenge_handler.py
│   │   │   ├── test_block_handler.py
│   │   │   └── test_deck.py
│   │   ├── services/
│   │   │   ├── test_game_service.py
│   │   │   └── test_lobby_service.py
│   │   └── models/
│   │       └── test_models.py
│   ├── integration/
│   │   ├── test_lobby_api.py
│   │   ├── test_game_ws.py
│   │   └── test_repositories.py
│   └── e2e/
│       └── test_full_game.py
│
├── alembic.ini
├── pyproject.toml
├── requirements.txt
└── .env.example
```

### 5.2 Design Principles

| Principle | Implementation |
|---|---|
| **Single Responsibility** | Engine handles pure logic; Services orchestrate; Repositories handle data; WS layer handles connections |
| **Open/Closed** | Action handlers use strategy pattern — new actions don't modify existing handler code |
| **Liskov Substitution** | Repository interfaces define contracts; implementations are interchangeable |
| **Interface Segregation** | Separate interfaces for read-only vs. write repositories |
| **Dependency Inversion** | Services depend on abstractions; DI container wires concrete implementations |
| **ACID** | SQLAlchemy sessions with explicit transaction boundaries; game state mutations are atomic |

### 5.3 Dependency Injection

```python
# container.py (using dependency-injector)
class AppContainer(containers.DeclarativeContainer):
    config = providers.Configuration()
    
    db_session = providers.Resource(get_async_session)
    
    game_repository = providers.Factory(
        GameRepository,
        session=db_session,
    )
    
    game_engine = providers.Singleton(GameEngine)
    
    game_service = providers.Factory(
        GameService,
        game_repo=game_repository,
        engine=game_engine,
    )
```

### 5.4 Game Engine State Machine

```
WAITING_FOR_PLAYERS
    │
    ▼
TURN_START ──────────► Must Coup? (≥10 coins) ──► AWAITING_COUP_TARGET
    │
    ▼
ACTION_DECLARED
    │
    ├──► CHALLENGE_WINDOW (5s timer)
    │       ├──► Challenged → RESOLVING_CHALLENGE
    │       │       ├──► Challenger loses → ACTION_RESOLVING
    │       │       └──► Actor loses → TURN_END
    │       └──► No challenge → BLOCK_WINDOW (if blockable)
    │               ├──► Blocked → BLOCK_CHALLENGE_WINDOW
    │               │       ├──► Block challenged → RESOLVING_BLOCK_CHALLENGE
    │               │       └──► Block unchallenged → TURN_END
    │               └──► No block → ACTION_RESOLVING
    │
    ▼
ACTION_RESOLVING ──► Apply effect ──► AWAITING_INFLUENCE_LOSS (if needed) ──► TURN_END
    │
    ▼
TURN_END ──► Check eliminations ──► Check winner ──► TURN_START (next player) or GAME_OVER
```

State-machine invariants:
- The server advances from `TURN_END` to the next `TURN_START` or `GAME_OVER` immediately after an action fully resolves or is cancelled; clients do not perform a separate turn-advance step.
- Challenge and block windows close only after every eligible responder has explicitly passed or timed out for the current window.
- WebSocket-driven game mutations are serialized per game on the server so overlapping player clicks cannot interleave against the same in-memory state.

### 5.5 Key Backend Validations
- Coin counts never go negative (enforced at model + engine level).
- Dead players cannot take any action.
- Mandatory coup enforced at turn start.
- Assassination costs 3 coins even if blocked/challenged.
- Steal caps at target's available coins.
- Turn timer: configurable (default 30s), auto-pass on timeout.
- Challenge/block windows: configurable (default 5s).

---

## 6. Frontend Design

### 6.1 Folder Structure

```
frontend/
├── public/
│   ├── assets/
│   │   ├── cards/               # Card artwork (SVG/PNG)
│   │   ├── coins/               # Coin sprites
│   │   └── sounds/              # SFX (optional phase 2)
│   └── favicon.ico
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (providers)
│   │   ├── page.tsx             # Landing / Home
│   │   ├── lobby/
│   │   │   └── page.tsx
│   │   ├── lobby/[id]/
│   │   │   └── page.tsx
│   │   └── game/[id]/
│   │       └── page.tsx
│   │
│   ├── pages/                   # Page-level compositions
│   │   ├── HomePage/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.spec.ts
│   │   │   ├── HomePage.hooks.ts
│   │   │   ├── HomePage.styles.ts
│   │   │   └── index.ts
│   │   ├── LobbyPage/
│   │   │   ├── LobbyPage.tsx
│   │   │   ├── LobbyPage.spec.ts
│   │   │   ├── LobbyPage.hooks.ts
│   │   │   ├── LobbyPage.styles.ts
│   │   │   └── index.ts
│   │   ├── LobbyDetailPage/
│   │   │   ├── LobbyDetailPage.tsx
│   │   │   ├── LobbyDetailPage.spec.ts
│   │   │   ├── LobbyDetailPage.hooks.ts
│   │   │   ├── LobbyDetailPage.styles.ts
│   │   │   └── index.ts
│   │   └── GamePage/
│   │       ├── GamePage.tsx
│   │       ├── GamePage.spec.ts
│   │       ├── GamePage.hooks.ts
│   │       ├── GamePage.styles.ts
│   │       └── index.ts
│   │
│   ├── containers/              # Smart components (state + logic)
│   │   ├── GameBoard/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── GameBoard.spec.ts
│   │   │   ├── GameBoard.hooks.ts
│   │   │   ├── GameBoard.styles.ts
│   │   │   └── index.ts
│   │   ├── PlayerHand/
│   │   │   ├── PlayerHand.tsx
│   │   │   ├── PlayerHand.spec.ts
│   │   │   ├── PlayerHand.hooks.ts
│   │   │   ├── PlayerHand.styles.ts
│   │   │   └── index.ts
│   │   ├── ActionPanel/
│   │   │   ├── ActionPanel.tsx
│   │   │   ├── ActionPanel.spec.ts
│   │   │   ├── ActionPanel.hooks.ts
│   │   │   ├── ActionPanel.styles.ts
│   │   │   └── index.ts
│   │   ├── OpponentArea/
│   │   │   ├── OpponentArea.tsx
│   │   │   ├── OpponentArea.spec.ts
│   │   │   ├── OpponentArea.hooks.ts
│   │   │   ├── OpponentArea.styles.ts
│   │   │   └── index.ts
│   │   ├── ChallengeBlockOverlay/
│   │   │   ├── ChallengeBlockOverlay.tsx
│   │   │   ├── ChallengeBlockOverlay.spec.ts
│   │   │   ├── ChallengeBlockOverlay.hooks.ts
│   │   │   ├── ChallengeBlockOverlay.styles.ts
│   │   │   └── index.ts
│   │   ├── GameLog/
│   │   │   ├── GameLog.tsx
│   │   │   ├── GameLog.spec.ts
│   │   │   ├── GameLog.hooks.ts
│   │   │   ├── GameLog.styles.ts
│   │   │   └── index.ts
│   │   └── LobbyRoom/
│   │       ├── LobbyRoom.tsx
│   │       ├── LobbyRoom.spec.ts
│   │       ├── LobbyRoom.hooks.ts
│   │       ├── LobbyRoom.styles.ts
│   │       └── index.ts
│   │
│   ├── components/              # Presentational / dumb components
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.spec.ts
│   │   │   ├── Card.hooks.ts    # animation hooks only
│   │   │   ├── Card.styles.ts
│   │   │   └── index.ts
│   │   ├── CoinStack/
│   │   │   ├── CoinStack.tsx
│   │   │   ├── CoinStack.spec.ts
│   │   │   ├── CoinStack.hooks.ts
│   │   │   ├── CoinStack.styles.ts
│   │   │   └── index.ts
│   │   ├── PlayerAvatar/
│   │   │   ├── PlayerAvatar.tsx
│   │   │   ├── PlayerAvatar.spec.ts
│   │   │   ├── PlayerAvatar.hooks.ts
│   │   │   ├── PlayerAvatar.styles.ts
│   │   │   └── index.ts
│   │   ├── ActionButton/
│   │   │   ├── ActionButton.tsx
│   │   │   ├── ActionButton.spec.ts
│   │   │   ├── ActionButton.hooks.ts
│   │   │   ├── ActionButton.styles.ts
│   │   │   └── index.ts
│   │   ├── Timer/
│   │   │   ├── Timer.tsx
│   │   │   ├── Timer.spec.ts
│   │   │   ├── Timer.hooks.ts
│   │   │   ├── Timer.styles.ts
│   │   │   └── index.ts
│   │   ├── GameOverModal/
│   │   │   ├── GameOverModal.tsx
│   │   │   ├── GameOverModal.spec.ts
│   │   │   ├── GameOverModal.hooks.ts
│   │   │   ├── GameOverModal.styles.ts
│   │   │   └── index.ts
│   │   ├── TurnIndicator/
│   │   │   ├── TurnIndicator.tsx
│   │   │   ├── TurnIndicator.spec.ts
│   │   │   ├── TurnIndicator.hooks.ts
│   │   │   ├── TurnIndicator.styles.ts
│   │   │   └── index.ts
│   │   └── Tooltip/
│   │       ├── Tooltip.tsx
│   │       ├── Tooltip.spec.ts
│   │       ├── Tooltip.hooks.ts
│   │       ├── Tooltip.styles.ts
│   │       └── index.ts
│   │
│   ├── models/                  # Typed data models + mocks
│   │   ├── game/
│   │   │   ├── game.ts          # GameState interface
│   │   │   └── game.mock.ts     # Mock GameState data
│   │   ├── player/
│   │   │   ├── player.ts
│   │   │   └── player.mock.ts
│   │   ├── card/
│   │   │   ├── card.ts          # Character enum, Card interface
│   │   │   └── card.mock.ts
│   │   ├── action/
│   │   │   ├── action.ts
│   │   │   └── action.mock.ts
│   │   ├── lobby/
│   │   │   ├── lobby.ts
│   │   │   └── lobby.mock.ts
│   │   └── websocket-message/
│   │       ├── websocket-message.ts
│   │       └── websocket-message.mock.ts
│   │
│   ├── hooks/                   # Global reusable hooks
│   │   ├── useWebSocket.ts      # WebSocket connection + reconnect
│   │   ├── useWebSocket.spec.ts
│   │   ├── useGameState.ts      # Derives UI state from WS messages
│   │   ├── useGameState.spec.ts
│   │   ├── useCountdown.ts      # Timer hook for challenge/block windows
│   │   ├── useCountdown.spec.ts
│   │   ├── useAnimationQueue.ts # Sequences animations in order
│   │   ├── useAnimationQueue.spec.ts
│   │   ├── useSound.ts          # SFX playback (phase 2)
│   │   └── useSound.spec.ts
│   │
│   ├── context/                 # Context + Reducer state
│   │   ├── GameContext/
│   │   │   ├── GameContext.tsx       # createContext + Provider
│   │   │   ├── GameContext.reducer.ts # useReducer logic
│   │   │   ├── GameContext.types.ts   # State + Action types
│   │   │   ├── GameContext.spec.ts
│   │   │   └── index.ts
│   │   └── LobbyContext/
│   │       ├── LobbyContext.tsx
│   │       ├── LobbyContext.reducer.ts
│   │       ├── LobbyContext.types.ts
│   │       ├── LobbyContext.spec.ts
│   │       └── index.ts
│   │
│   ├── services/                # API service layer
│   │   ├── api.ts               # Axios/fetch instance
│   │   ├── lobbyService.ts      # REST calls for lobby
│   │   └── lobbyService.spec.ts
│   │
│   ├── queries/                 # React Query hooks
│   │   ├── useLobbyQueries.ts   # useQuery / useMutation for lobbies
│   │   ├── useLobbyQueries.spec.ts
│   │   ├── useGameQueries.ts
│   │   └── useGameQueries.spec.ts
│   │
│   ├── animations/              # Shared animation configs
│   │   ├── variants.ts          # Framer Motion variants
│   │   ├── gsapTimelines.ts     # GSAP timeline factories
│   │   └── constants.ts         # Durations, easings
│   │
│   ├── providers/               # Provider wrapper
│   │   └── AppProviders.tsx     # MantineProvider, QueryClientProvider, Contexts
│   │
│   ├── theme/                   # Mantine theme customization
│   │   ├── theme.ts
│   │   └── tokens.ts            # Design tokens (colors, spacing, etc.)
│   │
│   └── utils/
│       ├── testUtils.tsx        # Render helpers for tests
│       └── constants.ts
│
├── next.config.js
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── .env.local.example
```

### 6.2 Page → Container → Component Hierarchy

```
GamePage
├── GameBoard (container)
│   ├── OpponentArea (container)
│   │   ├── PlayerAvatar (component)
│   │   ├── Card (component) × 2          ← face-down / face-up
│   │   └── CoinStack (component)
│   │
│   ├── PlayerHand (container)             ← current player's cards
│   │   ├── Card (component) × 2
│   │   └── CoinStack (component)
│   │
│   ├── ActionPanel (container)            ← action buttons
│   │   ├── ActionButton (component) × N
│   │   └── TurnIndicator (component)
│   │
│   ├── ChallengeBlockOverlay (container)  ← modal during challenge/block window
│   │   ├── Timer (component)
│   │   └── ActionButton (component)
│   │
│   └── GameLog (container)                ← scrollable event history
│
└── GameOverModal (component)
```

### 6.3 State Management Strategy

| State Type | Tool | Justification |
|---|---|---|
| **Server data** (lobbies list, game history) | React Query | Automatic caching, refetching, stale management |
| **Real-time game state** (player hands, coins, turns) | Context + `useReducer` (GameContext) | >5 state values updated via WebSocket dispatches |
| **Lobby state** (players in waiting room, ready status) | Context + `useReducer` (LobbyContext) | Multiple coordinated state values |
| **UI-local state** (modal open, selected target) | Component-level `useState` | Simple, contained |
| **Animation queue** | `useAnimationQueue` hook | Sequential playback of events |

### 6.4 React Query Usage

```typescript
// REST: Lobby operations
const { data: lobbies } = useQuery({ queryKey: ['lobbies'], queryFn: fetchLobbies });
const createLobby = useMutation({ mutationFn: createLobbyApi, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lobbies'] }) });

// Optimistic updates for join/leave
const joinLobby = useMutation({
  mutationFn: joinLobbyApi,
  onMutate: async (lobbyId) => { /* optimistic add player */ },
  onError: (err, lobbyId, context) => { /* rollback */ },
  onSettled: () => { queryClient.invalidateQueries({ queryKey: ['lobbies'] }) },
});
```

### 6.5 Mock Data Swapping

```typescript
// models/player/player.mock.ts
export const mockPlayer: Player = {
  id: 'player-1',
  name: 'Alice',
  coins: 2,
  influences: [
    { character: Character.Duke, revealed: false },
    { character: Character.Assassin, revealed: false },
  ],
  isAlive: true,
};

// In tests or when backend unavailable:
// queryClient.setQueryData(['game', gameId], mockGameState);
```

---

## 7. Animations Plan

Every game event gets a distinct, satisfying animation. Framer Motion handles layout/presence; GSAP handles complex multi-step sequences.

| Event | Animation | Library |
|---|---|---|
| **Income** | Coin floats from treasury to player's stack with bounce | GSAP |
| **Foreign Aid** | 2 coins fly to player; if blocked, coins reverse back | GSAP |
| **Tax** | 3 coins cascade from treasury with stagger | GSAP |
| **Steal** | Coins slide from target → attacker, magnetic pull effect | GSAP |
| **Coup** | Screen shake + card flip to face-up with dramatic fade | GSAP + Framer Motion |
| **Assassinate** | Dagger slash effect → card flip (or reversal if blocked) | GSAP |
| **Exchange** | Cards fan out, 2 new cards slide in, selection highlights | Framer Motion |
| **Challenge (win)** | Card briefly reveals with glow → shuffles back; challenger's card flips | GSAP |
| **Challenge (lose)** | Acting player's card flips with red pulse | GSAP |
| **Block** | Shield icon with pulse effect on blocker | Framer Motion |
| **Player eliminated** | Cards gray out + avatar fades with particles | GSAP |
| **Game Over** | Winner spotlight + confetti burst | GSAP |
| **Turn transition** | Highlight ring rotates to active player | Framer Motion |
| **Card hover** | Subtle 3D tilt (perspective transform) | Framer Motion |
| **Coin count change** | Number counter rolls up/down | Framer Motion |
| **Challenge/Block window** | Circular countdown timer fills | Framer Motion |

### 7.1 Animation Queue System

Events arrive via WebSocket rapidly. The `useAnimationQueue` hook ensures animations play in order:

```
WS event → enqueue animation descriptor → dequeue → play → onComplete → dequeue next
```

This prevents overlapping animations and ensures players see every event clearly.

---

## 8. Database Schema

```sql
-- Games table
CREATE TABLE games (
    id          TEXT PRIMARY KEY,
    status      TEXT NOT NULL CHECK(status IN ('waiting', 'in_progress', 'finished')),
    config      TEXT NOT NULL,           -- JSON: max_players, turn_timer, etc.
    deck        TEXT NOT NULL,           -- JSON: remaining cards (encrypted/hidden)
    current_turn_player_id TEXT,
    turn_number INTEGER NOT NULL DEFAULT 0,
    state_phase TEXT NOT NULL DEFAULT 'waiting_for_players',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Players table
CREATE TABLE players (
    id          TEXT PRIMARY KEY,
    game_id     TEXT NOT NULL REFERENCES games(id),
    name        TEXT NOT NULL,
    coins       INTEGER NOT NULL DEFAULT 2,
    seat_index  INTEGER NOT NULL,
    is_alive    BOOLEAN NOT NULL DEFAULT TRUE,
    session_token TEXT NOT NULL UNIQUE,
    connected   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TEXT NOT NULL
);

-- Influences (cards) table
CREATE TABLE influences (
    id          TEXT PRIMARY KEY,
    player_id   TEXT NOT NULL REFERENCES players(id),
    character   TEXT NOT NULL CHECK(character IN ('duke', 'assassin', 'captain', 'ambassador', 'contessa')),
    revealed    BOOLEAN NOT NULL DEFAULT FALSE
);

-- Game events log (append-only for replay/history)
CREATE TABLE game_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id     TEXT NOT NULL REFERENCES games(id),
    turn_number INTEGER NOT NULL,
    event_type  TEXT NOT NULL,
    payload     TEXT NOT NULL,           -- JSON
    created_at  TEXT NOT NULL
);
```

### 8.1 ACID Compliance
- **Atomicity**: Each action (e.g., steal = debit target + credit actor) runs in a single DB transaction.
- **Consistency**: CHECK constraints + Pydantic validation enforce data integrity.
- **Isolation**: SQLAlchemy session-per-request with proper commit/rollback.
- **Durability**: SQLite WAL mode for crash recovery.

---

## 9. Testing Strategy

### 9.1 Backend Testing (pytest)

| Level | Scope | Examples |
|---|---|---|
| **Unit** | Engine, handlers, models | `test_steal_caps_at_target_coins`, `test_mandatory_coup_at_10_coins`, `test_challenge_with_correct_card` |
| **Integration** | Repository + DB, Service + Repository | `test_create_game_persists`, `test_game_state_round_trip` |
| **WebSocket** | Full WS message handling | `test_action_broadcast_to_all_players`, `test_reconnect_with_token` |
| **E2E** | Full game simulation | `test_complete_2_player_game`, `test_6_player_game_all_actions` |

**TDD Flow**: Write failing test → implement minimal code → refactor → repeat.

### 9.2 Frontend Testing (Vitest + RTL)

| Level | Scope | Examples |
|---|---|---|
| **Component** | Render + interaction | `Card renders face-down`, `ActionButton disabled when not your turn` |
| **Container** | Integration with hooks/context | `ActionPanel shows correct actions for coin count`, `ChallengeOverlay fires WS message` |
| **Hook** | Custom hook logic | `useWebSocket reconnects on disconnect`, `useGameState reduces state correctly` |
| **Model** | Type guard tests | `isPlayer type guard works`, mock data matches interface |

### 9.3 Test Coverage Targets

| Area | Target |
|---|---|
| Backend engine | ≥ 95% |
| Backend services | ≥ 90% |
| Frontend hooks | ≥ 90% |
| Frontend components | ≥ 85% |
| Overall | ≥ 85% |

---

## 10. API Endpoints

### REST (lobby management)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/lobbies` | Create a new game lobby |
| `GET` | `/api/lobbies` | List open lobbies |
| `GET` | `/api/lobbies/{id}` | Get lobby details |
| `POST` | `/api/lobbies/{id}/join` | Join a lobby |
| `POST` | `/api/lobbies/{id}/leave` | Leave a lobby |
| `POST` | `/api/lobbies/{id}/start` | Start the game (host only) |
| `GET` | `/api/health` | Health check |

### WebSocket

| Path | Description |
|---|---|
| `ws://host/ws/game/{game_id}?token={session_token}` | Game WebSocket connection |

---

## 11. Security Considerations

- **Hidden information**: Server NEVER sends other players' face-down card identities to a client. Each player receives only their own cards + public state.
- **Session tokens**: UUID v4 tokens for player identity (not auth — this is a casual game, not production SaaS).
- **Input validation**: All WebSocket messages validated via Pydantic before processing.
- **Rate limiting**: Max 10 messages/second per client connection.
- **No SQL injection**: SQLAlchemy ORM with parameterized queries only.

---

## 12. Implementation Phases

### Phase 1 — Foundation (Core Engine + Basic UI)
1. Backend: Project setup (FastAPI, DI container, SQLite, Alembic)
2. Backend: Pydantic models + SQLAlchemy entities
3. Backend: Game engine — pure logic (fully TDD)
4. Backend: Lobby REST API + tests
5. Backend: WebSocket connection manager + game handler
6. Frontend: Project setup (Next.js, Mantine, React Query, Vitest)
7. Frontend: Models + mock data
8. Frontend: Global hooks (`useWebSocket`, `useGameState`)
9. Frontend: Context + Reducer (GameContext, LobbyContext)
10. Frontend: Lobby pages (list, detail, create)

### Phase 2 — Core Gameplay Loop
11. Frontend: GameBoard container + basic layout
12. Frontend: PlayerHand, OpponentArea, ActionPanel containers
13. Frontend: Card, CoinStack, ActionButton components
14. Integration: Connect frontend WS to backend — basic game flow
15. Full turn cycle: Income → Foreign Aid → Tax → Steal → Assassinate → Exchange → Coup
16. Challenge and Block overlays
17. Player elimination + game over

### Phase 3 — Animations & Polish
18. Animation system (`useAnimationQueue`, GSAP timelines)
19. Coin movement animations (income, tax, steal, foreign aid)
20. Card flip/reveal animations (challenge, assassination, coup)
21. Block shield + challenge result animations
22. Turn transitions + player elimination effects
23. Game over celebration (confetti, spotlight)
24. Timer animations (challenge/block countdown)

### Phase 4 — Robustness & UX
25. Reconnection handling (token-based session resume)
26. Edge case testing (disconnect during challenge, simultaneous actions)
27. Responsive layout (desktop-first, tablet support)
28. Accessibility (keyboard navigation, screen reader labels)
29. Error states (connection lost, invalid action feedback)
30. Performance optimization (memo, virtualization if needed)

### Phase 5 — Optional Enhancements
31. Sound effects (coin clink, card flip, dramatic stings)
32. Player avatars / name customization
33. Game replay (replay from event log)
34. Spectator mode
35. Game variants (Reformation expansion support)

---

## 13. Development Workflow

```
1. Pick a feature/task from the phase list
2. Write failing tests (Red)
3. Implement minimum code to pass (Green)
4. Refactor for clarity and design (Refactor)
5. PR with tests + implementation
6. Repeat
```

### 13.1 Commands Reference

```bash
# Backend
cd backend
python -m pytest                    # Run all tests
python -m pytest tests/unit/        # Unit tests only
python -m pytest --cov=app          # With coverage
uvicorn app.main:app --reload       # Dev server

# Frontend
cd frontend
npm run dev                         # Next.js dev server
npm run test                        # Vitest
npm run test -- --coverage          # With coverage
npm run lint                        # ESLint
npm run type-check                  # tsc --noEmit
```

---

## 14. Acceptance Criteria Summary

- [ ] 2–6 players can create, join, and play a full game of Coup via WebSocket
- [ ] All 7 actions work correctly (Income, Foreign Aid, Coup, Tax, Assassinate, Steal, Exchange)
- [ ] Challenges and blocks resolve correctly per official rules
- [ ] Mandatory coup at ≥ 10 coins is enforced
- [ ] Hidden card information is never leaked to other players
- [ ] Every action has a distinct, polished animation
- [ ] Animations play sequentially without overlapping or blocking input
- [ ] UI is responsive, minimal, and aesthetic (no clutter)
- [ ] Reconnection resumes game state within grace period
- [ ] Backend test coverage ≥ 85%, frontend ≥ 85%
- [ ] All Pydantic models use strict mode
- [ ] DI container wires all backend services
- [ ] Context + Reducer used for game and lobby state on frontend
- [ ] React Query used for all REST operations with caching
- [ ] Mock data available for every frontend model
- [ ] All components follow the `.tsx` / `.spec.ts` / `.hooks.ts` / `.styles.ts` convention
