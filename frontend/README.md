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
│   ├── layout.tsx          # Root layout + providers + metadata icons
│   ├── page.tsx            # Home page (desktop split layout, mobile play-first flow, branded logo)
│   ├── providers.tsx       # Client-side providers
│   ├── global-error.tsx    # Error boundary
│   ├── lobby/[id]/page.tsx # Lobby detail page
│   └── game/[id]/page.tsx  # Game page
├── animations/             # Framer Motion variants + GSAP timelines
│   ├── constants.ts        # Duration & easing constants
│   ├── variants.ts         # Reusable Framer Motion variants
│   └── gsapTimelines.ts    # GSAP timeline factories
├── components/             # Presentational components
│   ├── Card/               # Character card with flip, art-backed face, glow, shadows
│   ├── CoinStack/          # Coin display with bounce animation
│   ├── PlayerAvatar/       # Compact player avatar with glow pulse
│   ├── ActionButton/       # Compact action button with shared action icons, cleaner labels, and minimal metadata
│   ├── ActionGlyph/        # Shared action and timeline glyphs
│   ├── Timer/              # Countdown progress bar
│   ├── GameOverModal/      # Premium end-of-round modal with winner/loser messaging, replay, and exit actions
│   ├── GuideModal/         # Game rules/help modal
│   ├── CoupBackgroundSVG/  # Subtle abstract ambient background motif
│   ├── PreGameConfig/      # Pre-game configuration with timer controls + Peaceful Mode toggle
│   └── TurnIndicator/      # Active turn display
├── containers/             # Stateful composite containers
│   ├── GameBoard/          # Main game board (top-bar turn status on every breakpoint, compact mobile connection dot, quieter event overlays, mobile utility dock, winner confetti, default-open desktop timeline)
│   ├── PlayerHand/         # Current player's compact card hand
│   ├── ActionPanel/        # Compact action ribbon with dense 3-column mobile layout, slimmer mobile standby strip, and minimal off-turn chrome
│   ├── OpponentArea/       # Responsive opponent carousel with centered small-table seats, fixed-width cards, and subtle edge fades
│   ├── ChallengeBlockOverlay/ # Direct-response dock for challenge/block/allow decisions
│   ├── GameDashboard/      # Game statistics dashboard (standings, revealed cards)
│   ├── GameLog/            # Real-time editorial timeline feed with numbered event rows, action highlights, and newest-first ordering
│   └── LobbyRoom/         # Lobby waiting room with a button-triggered leaderboard modal, score-based standings, and refresh-safe presence handling
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
│   ├── action/             # ActionType, ACTION_RULES, ACTION_PRESENTATIONS (source of truth)
│   ├── game/               # GamePhase, GameState
│   ├── lobby/              # Lobby models
│   └── websocket-message/  # Client/Server message types
├── queries/                # TanStack React Query hooks
│   └── useLobbyQueries.ts  # Lobby CRUD queries + mutations
├── services/               # API client layer
│   ├── api.ts              # Typed fetch wrapper
│   ├── lobbyService.ts     # Lobby REST endpoints + per-lobby session persistence
│   └── wsMessageMapper.ts  # WebSocket snake_case → camelCase mapper
├── theme/                  # Visual design system
│   ├── theme.ts            # Mantine theme config
│   └── tokens.ts           # Design tokens (colours, spacing, shadows)
└── utils/
    ├── constants.ts        # Game constants (mirrors backend)
    ├── responseWindows.ts  # Shared response eligibility helper for challenge/block windows
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
2. Add matching visual metadata in `ACTION_PRESENTATIONS` so buttons and timeline stay in sync
3. The `ActionPanel` will automatically pick it up
4. Update `src/animations/variants.ts` if it needs a custom animation

### Change Game Constants

Edit `src/utils/constants.ts` — this mirrors the backend's `config.py`.

### Change Card Visuals

- **Colours/gradients**: `src/theme/tokens.ts` → `tokens.character.*`
- **Shadows/elevation**: `src/theme/tokens.ts` → `tokens.card.shadow.*`, `tokens.elevation.*`
- **Surface colours**: `src/theme/tokens.ts` → `tokens.surface.*`, `tokens.text.*`
- **Card art assets**: `src/assets/card_faces/*`
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
- **Gameplay event sequencing**: `src/containers/GameBoard/GameBoard.hooks.ts` uses `useAnimationQueue` for higher-signal action, block, challenge-result, and victory overlays while prioritizing terminal game state over stale response prompts
- **Action-specific event effects**: `src/containers/GameBoard/GameBoard.tsx` and `GameBoard.styles.ts` render coins, shield, slash, impact, reveal, and victory effects over the event overlay
- **Live timeline panel**: `src/containers/GameBoard/GameBoard.tsx` and `src/containers/GameLog/GameLog.tsx` render a closable timeline panel on demand, with a right-side desktop layout that opens by default, reverse-chronological numbered feed, shared action icons/accents, and auto-pin-to-top behavior until the user scrolls away
- **Card-local highlights**: `src/containers/OpponentArea/OpponentArea.tsx` and `src/containers/PlayerHand/PlayerHand.tsx` show actor/target/blocker emphasis directly on card zones
- **Opponent carousel**: `src/containers/OpponentArea/OpponentArea.tsx` keeps opponents in a fixed-height horizontal rail on both desktop and mobile, centers one- and two-opponent tables without changing order, auto-centers the active seat, and uses subtle edge fades so the strip stays readable when many players join
- **Static app icon**: `public/icon.svg` serves the browser icon directly so local navigation and multi-tab dev sessions do not depend on the app icon route
- **Unified turn status**: `src/containers/GameBoard/GameBoard.tsx` keeps turn and response context in the top bar on both desktop and mobile, with only a compact mobile status pill plus a connection dot so more of the board stays playable on small screens
- **Mobile landing flow**: `src/app/page.tsx` uses a play-first entry flow on mobile before exposing create/join forms, while desktop keeps the split create/join layout
- **Branding**: `src/app/page.tsx` renders a custom Coup logo and `public/icon.svg` provides the browser tab icon
- **Target mode flow**: `src/containers/ActionPanel/ActionPanel.hooks.ts`, `ActionPanel.tsx`, and `src/containers/OpponentArea/OpponentArea.tsx` keep Coup, Assassinate, and Steal available, then highlight valid opponents on the board
- **Response rules**: `src/utils/responseWindows.ts`, `src/containers/GameBoard/GameBoard.hooks.ts`, and `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` mirror backend one-on-one response windows for targeted actions and full-table allow windows for untargeted actions
- **Response clarity**: `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` renders the bottom decision dock only for the player who can currently respond
- **Server-authoritative timers**: `src/containers/GameBoard/GameBoard.hooks.ts` reads `phaseStartedAt` and `phaseDeadlineAt` from `GAME_STATE`, so countdowns stay aligned across reconnects and timeout consequences no longer depend on a single client tab
- **Timeline narration**: `src/containers/GameBoard/GameBoard.hooks.ts` records richer action, challenge, block, reveal, elimination, and turn messages for the timeline feed
- **Mobile utility dock**: `src/containers/GameBoard/GameBoard.tsx` keeps leaderboard, timeline, and rules controls in a compact bottom dock on mobile while leaving turn status and Exit in the top bar
- **Ambient background motif**: `src/components/CoupBackgroundSVG/CoupBackgroundSVG.tsx` provides subtle abstract Coup symbolism, used as full-page ambient art in lobby and as low-opacity atmosphere in-game
- **Exit controls**: `src/containers/LobbyRoom/LobbyRoom.tsx` exposes room leave action and `src/containers/GameBoard/GameBoard.tsx` includes an explicit top-bar Exit button
- **Lobby continuity**: `src/services/lobbyService.ts` stores the per-lobby session token and a browser-stable player profile id in local storage, and `src/app/lobby/[id]/page.tsx` uses them to survive refreshes, reuse the same waiting-room seat, and keep leaderboard identity stable across games
- **Replay flow**: `src/app/lobby/[id]/page.tsx` now carries `lobbyId` into the game route, and `src/app/game/[id]/GamePageContent.tsx` resets that lobby before sending `Play Again` back to the same room so the room can continue together

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
