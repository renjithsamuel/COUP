# Coup – Frontend

Next.js 14 (App Router) frontend for the multiplayer Coup card game with real-time WebSocket gameplay, rich animations (Framer Motion + GSAP), and Mantine UI.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI Kit | Mantine v7 |
| State | Context + Reducer |
| Server State | TanStack React Query v5 |
| Real-time | Native WebSocket |
| Animations | Framer Motion + GSAP |
| Testing | Vitest + React Testing Library |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout + providers
│   ├── page.tsx            # Home page (create/join room by code)
│   ├── providers.tsx       # Client-side providers
│   ├── global-error.tsx    # Error boundary
│   ├── lobby/[id]/page.tsx # Lobby detail page
│   └── game/[id]/page.tsx  # Game page
├── animations/             # Framer Motion variants + GSAP timelines
│   ├── constants.ts        # Duration & easing constants
│   ├── variants.ts         # Reusable Framer Motion variants
│   └── gsapTimelines.ts    # GSAP timeline factories
├── components/             # Presentational components
│   ├── Card/               # Character card with flip, glow, shadows
│   ├── CoinStack/          # Coin display with bounce animation
│   ├── PlayerAvatar/       # Player avatar with glow pulse
│   ├── ActionButton/       # Action button with scale pop + bluff badge
│   ├── Timer/              # Countdown progress bar
│   ├── GameOverModal/      # Victory modal with GSAP celebration
│   ├── GuideModal/         # Game rules/help modal
│   ├── CoupBackgroundSVG/  # Subtle abstract ambient background motif
│   ├── PreGameConfig/      # Pre-game configuration with timer controls + Peaceful Mode toggle
│   └── TurnIndicator/      # Active turn display
├── containers/             # Stateful composite containers
│   ├── GameBoard/          # Main game board (queued event overlays, card-target highlights, response status strip, winner confetti)
│   ├── PlayerHand/         # Current player's card hand
│   ├── ActionPanel/        # Action selection with target picker
│   ├── OpponentArea/       # Opponents display with stats
│   ├── ChallengeBlockOverlay/ # Challenge/block decision overlay
│   ├── GameDashboard/      # Game statistics dashboard (standings, revealed cards)
│   ├── GameLog/            # Real-time game event log
│   └── LobbyRoom/         # Lobby waiting room
├── context/                # React Context + Reducer
│   ├── GameContext/        # Game state management
│   └── LobbyContext/       # Lobby state management
├── hooks/                  # Global hooks
│   ├── useWebSocket.ts     # WebSocket connection + reconnect
│   ├── useCountdown.ts     # Countdown timer
│   └── useAnimationQueue.ts # Sequential animation queue
├── models/                 # TypeScript models + mock data
│   ├── card/               # Character enum, Card interface
│   ├── player/             # Player, PlayerPublic
│   ├── action/             # ActionType, ACTION_RULES (source of truth)
│   ├── game/               # GamePhase, GameState
│   ├── lobby/              # Lobby models
│   └── websocket-message/  # Client/Server message types
├── queries/                # TanStack React Query hooks
│   └── useLobbyQueries.ts  # Lobby CRUD queries + mutations
├── services/               # API client layer
│   ├── api.ts              # Typed fetch wrapper
│   ├── lobbyService.ts     # Lobby REST endpoints
│   └── wsMessageMapper.ts  # WebSocket snake_case → camelCase mapper
├── theme/                  # Visual design system
│   ├── theme.ts            # Mantine theme config
│   └── tokens.ts           # Design tokens (colours, spacing, shadows)
└── utils/
    ├── constants.ts        # Game constants (mirrors backend)
    └── testUtils.tsx       # Test render wrapper
```

## Component Convention

Each component/container directory contains:

| File | Purpose |
|---|---|
| `Name.tsx` | Component implementation |
| `Name.styles.ts` | Style objects (CSS-in-JS) |
| `Name.hooks.ts` | Custom hooks for the component |
| `Name.spec.tsx` | Tests (Vitest + RTL) |
| `index.ts` | Barrel export |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running on `localhost:8000`

### Install & Run

```bash
cd frontend
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run Tests

```bash
yarn test          # single run
yarn test:watch    # watch mode
```

## How to Modify

### Add a New Action

1. Add the action to `src/models/action/action.ts` → `ActionType` enum and `ACTION_RULES`
2. The `ActionPanel` will automatically pick it up
3. Update `src/animations/variants.ts` if it needs a custom animation

### Change Game Constants

Edit `src/utils/constants.ts` — this mirrors the backend's `config.py`.

### Change Card Visuals

- **Colours/gradients**: `src/theme/tokens.ts` → `tokens.character.*`
- **Shadows/elevation**: `src/theme/tokens.ts` → `tokens.card.shadow.*`, `tokens.elevation.*`
- **Surface colours**: `src/theme/tokens.ts` → `tokens.surface.*`, `tokens.text.*`
- **Character SVG icons**: `src/components/Card/CharacterIcons.tsx` (inline SVG art per character)
- **Card component**: `src/components/Card/Card.tsx` + `Card.styles.ts`

### Add a New Component

```bash
mkdir src/components/MyComponent
# Create: MyComponent.tsx, MyComponent.styles.ts, MyComponent.hooks.ts, MyComponent.spec.tsx, index.ts
```

Add the export to `src/components/index.ts`.

### Change Animations

- **Durations & easings**: `src/animations/constants.ts`
- **Framer Motion variants**: `src/animations/variants.ts`
- **Complex GSAP timelines**: `src/animations/gsapTimelines.ts`
- **Gameplay event sequencing**: `src/containers/GameBoard/GameBoard.hooks.ts` uses `useAnimationQueue` to play action/challenge/block/elimination overlays in order
- **Action-specific event effects**: `src/containers/GameBoard/GameBoard.tsx` and `GameBoard.styles.ts` render coins, shield, slash, impact, reveal, and victory effects over the event overlay
- **Card-local highlights**: `src/containers/OpponentArea/OpponentArea.tsx` and `src/containers/PlayerHand/PlayerHand.tsx` show actor/target/blocker emphasis directly on card zones
- **Response clarity**: `src/containers/GameBoard/GameBoard.tsx` and `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` show persistent waiting/approval guidance during challenge and block windows
- **Persistent status capsule**: `src/containers/GameBoard/GameBoard.tsx` keeps a fixed-height status slot (dynamic-island style) so card layout does not shift when status changes
- **Ambient background motif**: `src/components/CoupBackgroundSVG/CoupBackgroundSVG.tsx` provides subtle abstract Coup symbolism, used as full-page ambient art in lobby and as low-opacity atmosphere in-game
- **Exit controls**: `src/containers/LobbyRoom/LobbyRoom.tsx` exposes room leave action and `src/containers/GameBoard/GameBoard.tsx` includes an explicit top-bar Exit button

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Create/join lobbies |
| `/lobby/[id]` | Lobby | Waiting room before game |
| `/game/[id]` | Game | Live game board |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend REST API |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | Backend WebSocket |
