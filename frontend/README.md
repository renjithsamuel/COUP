# Coup – Frontend

Next.js 14 (App Router) frontend for the multiplayer Coup card game with real-time WebSocket gameplay, rich animations (Framer Motion + GSAP), and Mantine UI.

## Tech Stack

| Layer        | Tech                                 |
| ------------ | ------------------------------------ |
| Framework    | Next.js 14 (App Router)              |
| Language     | TypeScript (strict)                  |
| UI Kit       | Mantine v7                           |
| State        | Context + Reducer                    |
| Server State | TanStack React Query v5              |
| Real-time    | Native WebSocket                     |
| Animations   | Framer Motion + GSAP                 |
| Testing      | Vitest + React Testing Library       |
| Tooling      | ESLint + Prettier + Yarn resolutions |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout + providers + metadata icons
│   ├── page.tsx            # Home page with Play with Friends / Play with AI entry modes, AI bot+difficulty setup, and shared pre-game timer config modal
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
│   ├── ActionButton/       # Compact action button with clearer action-title hierarchy and stacked bluff/cost metadata
│   ├── ActionGlyph/        # Shared action and timeline glyphs
│   ├── Timer/              # Countdown progress bar
│   ├── GameOverModal/      # Full-screen portal end-of-round modal with winner/loser messaging, replay, and exit actions
│   ├── GuideModal/         # Game rules/help modal with optional desktop pin-to-board shortcut for character actions
│   ├── CoupBackgroundSVG/  # Subtle abstract ambient background motif
│   ├── PreGameConfig/      # Pre-game configuration with timer controls + Peaceful Mode toggle
│   └── TurnIndicator/      # Active turn display
├── containers/             # Stateful composite containers
│   ├── GameBoard/          # Main game board (top-bar turn status on every breakpoint, compact mobile connection dot, readable desktop top-bar event toasts, mobile utility dock, winner confetti, default-open desktop timeline, turn-highlighted player tray, and a pinnable desktop character-action reference)
│   ├── PlayerHand/         # Current player's compact card hand
│   ├── ActionPanel/        # Compact action ribbon with dense 3-column mobile layout, slimmer mobile standby strip, and minimal off-turn chrome
│   ├── OpponentArea/       # Responsive opponent carousel with centered small-table seats, fixed-width cards, and subtle edge fades
│   ├── ChallengeBlockOverlay/ # Direct-response dock for challenge/block/allow decisions
│   ├── GameDashboard/      # Compact live-table standings view used inside the in-game leaderboard modal
│   ├── GameLog/            # Real-time editorial timeline feed with numbered event rows, action highlights, and newest-first ordering
│   └── LobbyRoom/         # Lobby waiting room with a full-screen room leaderboard modal, score-based standings, and refresh-safe presence handling
├── context/                # React Context + Reducer
│   ├── GameContext/        # Game state management
│   └── LobbyContext/       # Lobby state management
├── hooks/                  # Global hooks
│   ├── useGameAudio.ts     # Mild action-button audio, a soft turn chime, and persistent mute preference
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
│   └── useLobbyQueries.ts  # Lobby CRUD queries + mutations, plus AI match start mutation
├── services/               # API client layer
│   ├── api.ts              # Typed fetch wrapper
│   ├── lobbyService.ts     # Lobby REST endpoints, AI match setup, and per-lobby session persistence
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

| File             | Purpose                        |
| ---------------- | ------------------------------ |
| `Name.tsx`       | Component implementation       |
| `Name.styles.ts` | Style objects (CSS-in-JS)      |
| `Name.hooks.ts`  | Custom hooks for the component |
| `Name.spec.tsx`  | Tests (Vitest + RTL)           |
| `index.ts`       | Barrel export                  |

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

### Lint and Format

```bash
yarn lint
yarn lint:fix
yarn format
yarn format:check
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
- **Mode-based landing flow**: `src/app/page.tsx` separates Play with Friends and Play with AI, keeps create/join inside the friends branch, lets mobile users choose between friends and AI after the play-first step, and opens the shared pre-game config modal before an AI table starts
- **Branding**: `src/app/page.tsx` renders a custom Coup logo and `public/icon.svg` provides the browser tab icon
- **Target mode flow**: `src/containers/ActionPanel/ActionPanel.hooks.ts`, `ActionPanel.tsx`, and `src/containers/OpponentArea/OpponentArea.tsx` keep Coup, Assassinate, and Steal available, then highlight valid opponents on the board
- **Press feedback**: `src/animations/variants.ts`, `src/app/globals.css`, `src/components/ActionButton/ActionButton.tsx`, `src/components/Card/Card.tsx`, and `src/containers/OpponentArea/OpponentArea.tsx` share a stronger hover/tap response, and the shared action buttons now include an inkwell-style ripple so taps read clearly on both mobile and desktop
- **Response rules**: `src/utils/responseWindows.ts`, `src/containers/GameBoard/GameBoard.hooks.ts`, and `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` mirror backend one-on-one response windows for targeted actions and full-table allow windows for untargeted actions
- **Response clarity**: `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` renders the bottom decision dock only for the player who can currently respond
- **Server-authoritative timers**: `src/containers/GameBoard/GameBoard.hooks.ts` reads `phaseStartedAt` and `phaseDeadlineAt` from `GAME_STATE`, so countdowns stay aligned across reconnects and timeout consequences no longer depend on a single client tab
- **Timeline narration**: `src/containers/GameBoard/GameBoard.hooks.ts` records richer action, challenge, block, reveal, elimination, and turn messages for the timeline feed
- **Mobile utility dock**: `src/containers/GameBoard/GameBoard.tsx` keeps leaderboard, timeline, rules, and mute controls in a compact bottom dock on mobile while leaving turn status and Exit in the top bar
- **Ambient background motif**: `src/components/CoupBackgroundSVG/CoupBackgroundSVG.tsx` provides subtle abstract Coup symbolism, used as full-page ambient art in lobby and as low-opacity atmosphere in-game
- **Exit controls**: `src/containers/LobbyRoom/LobbyRoom.tsx` exposes room leave action and `src/containers/GameBoard/GameBoard.tsx` includes an explicit top-bar Exit button
- **Lobby moderation**: `src/containers/LobbyRoom/LobbyRoom.tsx` lets any waiting-room player remove another player, but leave-room and kick actions now require a confirmation modal before the backend executes them
- **Lobby layout**: `src/containers/LobbyRoom/LobbyRoom.tsx` keeps the hero and stat cards in the same desktop arrangement even when only one player is present, and hides the redundant host stat card on mobile for a cleaner top row
- **Lobby continuity**: `src/services/lobbyService.ts` stores the per-lobby session token and a browser-stable player profile id in local storage, and `src/app/lobby/[id]/page.tsx` uses them to survive refreshes, reuse the same waiting-room seat, and keep room leaderboard identity stable across games
- **Session-based rejoin**: `src/services/lobbyService.ts` now sends the saved lobby session token on join so refresh/rejoin continuity is tied to the lobby session rather than collapsing separate deliberate players that happen to share a profile id
- **Room-only scores**: `src/queries/useLobbyQueries.ts` and `src/services/lobbyService.ts` fetch cross-game leaderboard data per room code, so lobby and in-game score views only show players who have played in that room
- **Action audio**: `src/hooks/useGameAudio.ts` synthesizes very light, low-pass-filtered action-button cues plus a soft turn chime with the Web Audio API, and `src/containers/GameBoard/GameBoard.tsx` exposes a persistent mute toggle alongside the utility buttons
- **Pinned character reference**: `src/components/GuideModal/GuideModal.tsx` can pin a concise character-action panel into the desktop game board, where it can be dragged and dismissed without reopening the full rules modal
- **AI replay flow**: `src/app/game/[id]/GamePageContent.tsx` reuses the same AI bot count, difficulty, and timer config when `Play Again` is pressed after a solo match
- **In-game leaderboard tabs**: `src/containers/GameBoard/GameBoard.tsx` presents a full-screen modal with tabs for the live table and the room's cross-game scores
- **Fullscreen overlays**: `src/containers/LobbyRoom/LobbyRoom.tsx`, `src/components/GuideModal/GuideModal.tsx`, and `src/components/GameOverModal/GameOverModal.tsx` render overlays through portals so they cover the full viewport instead of being clipped by the surrounding layout
- **Replay flow**: `src/app/lobby/[id]/page.tsx` now carries `lobbyId` into the game route, and `src/app/game/[id]/GamePageContent.tsx` resets that lobby before sending `Play Again` back to the same room so the room can continue together

## Routes

| Route         | Page  | Description                                                                                    |
| ------------- | ----- | ---------------------------------------------------------------------------------------------- |
| `/`           | Home  | Choose Play with Friends or Play with AI; create/join rooms or configure and start an AI table |
| `/lobby/[id]` | Lobby | Waiting room before game                                                                       |
| `/game/[id]`  | Game  | Live game board                                                                                |

## Environment Variables

| Variable              | Default                 | Description       |
| --------------------- | ----------------------- | ----------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend REST API  |
| `NEXT_PUBLIC_WS_URL`  | `ws://localhost:8000`   | Backend WebSocket |
