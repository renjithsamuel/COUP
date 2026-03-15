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
│   ├── page.tsx            # Home page with Play with Friends / Play with AI entry modes, AI bot+difficulty setup including lethal mode, and shared pre-game timer config modal
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
│   ├── GameOverModal/      # Full-screen portal end-of-round modal with delayed reveal, dismiss/reopen flow, replay, exit, and winner-only share actions
│   ├── GuideModal/         # Game rules/help modal with optional desktop pin-to-board shortcut for character actions
│   ├── CoupBackgroundSVG/  # Subtle abstract ambient background motif
│   ├── PreGameConfig/      # Pre-game configuration with Simple and Advanced tabs, compact themed Mantine dropdown controls, optional multiplayer fill-bot controls, and reusable host-side lobby editing
│   └── TurnIndicator/      # Active turn display
├── containers/             # Stateful composite containers
│   ├── GameBoard/          # Main game board (top-bar turn status on every breakpoint, compact mobile connection dot, readable desktop top-bar event toasts, mobile utility dock, winner confetti, a brief premium start countdown, default-open desktop timeline, turn-highlighted player tray, and a pinnable desktop character-action reference)
│   ├── PlayerHand/         # Current player's compact card hand
│   ├── ActionPanel/        # Compact action ribbon with dense mobile layout and a desktop two-column side panel beside a tighter local-hand module, plus slimmer mobile standby strip and minimal off-turn chrome
│   ├── OpponentArea/       # Responsive opponent carousel with centered small-table seats, moderately enlarged desktop card sizing, fixed-width cards, and subtle edge fades
│   ├── ChallengeBlockOverlay/ # Direct-response dock for challenge/block/allow decisions
│   ├── GameDashboard/      # Compact live-table standings view used inside the in-game leaderboard modal, including a flattened mobile stat strip for coins, influence, and reveals
│   ├── GameLog/            # Real-time editorial timeline feed with numbered event rows, action highlights, and newest-first ordering
│   └── LobbyRoom/         # Lobby waiting room with a full-screen room leaderboard modal, score-based standings, and refresh-safe presence handling
├── context/                # React Context + Reducer
│   ├── GameContext/        # Game state management
│   └── LobbyContext/       # Lobby state management
├── hooks/                  # Global hooks
│   ├── useGameAudio.ts     # Mild action-button audio, a soft turn chime, and persistent mute preference
│   ├── useWebSocket.ts     # WebSocket connection + reconnect with stale retry cleanup and single-flight reconnect attempts
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
    ├── shareVictoryCard.ts # Winner-only SVG-to-PNG share/download helper
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
yarn type-check    # TypeScript compile check
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
- **Mode-based landing flow**: `src/app/page.tsx` separates Play with Friends and Play with AI, keeps create/join inside the friends branch, opens mobile on a single Play-first screen before asking for name and mode on the next step, and opens the shared pre-game config modal before an AI table starts
- **AI difficulty expansion**: `src/app/page.tsx`, `src/models/lobby/lobby.ts`, and `src/app/game/[id]/GamePageContent.tsx` now support `lethal` alongside `easy`, `medium`, and `hard`
- **Lobby fill-bots**: `src/components/PreGameConfig/PreGameConfig.tsx` and `src/app/lobby/[id]/page.tsx` let waiting-room hosts add fill-bots up to the 6-player cap, with the difficulty selector appearing only when at least one bot is added
- **Branding**: `src/app/page.tsx` renders a custom Coup logo and `public/icon.svg` provides the browser tab icon
- **Target mode flow**: `src/containers/ActionPanel/ActionPanel.hooks.ts`, `ActionPanel.tsx`, and `src/containers/OpponentArea/OpponentArea.tsx` keep Coup, Assassinate, and Steal available, then highlight valid opponents on the board
- **Press feedback**: `src/animations/variants.ts`, `src/app/globals.css`, `src/components/ActionButton/ActionButton.tsx`, `src/components/Card/Card.tsx`, and `src/containers/OpponentArea/OpponentArea.tsx` share a stronger hover/tap response, and the shared action buttons now include an inkwell-style ripple so taps read clearly on both mobile and desktop
- **Response rules**: `src/utils/responseWindows.ts`, `src/containers/GameBoard/GameBoard.hooks.ts`, and `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` mirror backend one-on-one response windows for targeted actions and full-table allow windows for untargeted actions
- **Response clarity**: `src/containers/ChallengeBlockOverlay/ChallengeBlockOverlay.tsx` renders the bottom decision dock only for the player who can currently respond
- **Server-authoritative timers**: `src/containers/GameBoard/GameBoard.hooks.ts` reads `phaseStartedAt` and `phaseDeadlineAt` from `GAME_STATE`, so countdowns stay aligned across reconnects and timeout consequences no longer depend on a single client tab
- **Reconnect hardening**: `src/hooks/useWebSocket.ts` keeps only one live reconnect attempt at a time, cancels stale retry timers, and preserves the active board instead of collapsing back to a cold load whenever possible
- **Timeline narration**: `src/containers/GameBoard/GameBoard.hooks.ts` records richer action, challenge, block, reveal, elimination, and turn messages for the timeline feed
- **Mobile utility dock**: `src/containers/GameBoard/GameBoard.tsx` keeps leaderboard, timeline, rules, and mute controls in a compact bottom dock on mobile while leaving turn status and Exit in the top bar
- **Ambient background motif**: `src/components/CoupBackgroundSVG/CoupBackgroundSVG.tsx` provides subtle abstract Coup symbolism, used as full-page ambient art in lobby and as low-opacity atmosphere in-game
- **Exit controls**: `src/containers/LobbyRoom/LobbyRoom.tsx` exposes room leave action and `src/containers/GameBoard/GameBoard.tsx` includes an explicit top-bar Exit button
- **Lobby moderation**: `src/containers/LobbyRoom/LobbyRoom.tsx` lets any waiting-room player remove another player, but leave-room and kick actions now require a confirmation modal before the backend executes them
- **Lobby layout**: `src/containers/LobbyRoom/LobbyRoom.tsx` keeps the hero and stat cards in the same desktop arrangement even when only one player is present, and hides the redundant host stat card on mobile for a cleaner top row
- **Lobby continuity**: `src/services/lobbyService.ts` stores the per-lobby session token plus the last used player name in session storage, keeps the host's last saved next-round game config in session storage, and maintains a browser-stable player profile id in local storage. `src/app/lobby/[id]/page.tsx` waits for that session bootstrap before polling, survives refreshes in the same tab, reuses the same waiting-room seat when it still exists, offers a join-new-seat recovery path when it does not, renders that recovery overlay through a portal so its actions stay clickable, leaves via the active session token, and keeps room leaderboard identity stable across games
- **Session-based rejoin**: `src/app/page.tsx` now asks whether a player wants to reuse the saved seat or join as a fresh participant before sending any stored lobby session token, and `src/services/lobbyService.ts` no longer falls back to a saved lobby token when the caller chooses a fresh join, so separate tabs or incognito windows do not silently replace an existing waiting-room seat
- **Tabbed setup modal**: `src/components/PreGameConfig/PreGameConfig.tsx` now keeps the default path on a Simple tab with just tempo, starting coins, and optional fill-bots, using compact custom-themed Mantine dropdowns, while an Advanced tab exposes turn, challenge, and block timers as dense dropdown-based overrides without forcing a long scrolling setup flow
- **Room-only scores**: `src/queries/useLobbyQueries.ts` and `src/services/lobbyService.ts` fetch cross-game leaderboard data per room code, so lobby and in-game score views only show players who have played in that room
- **Action audio**: `src/hooks/useGameAudio.ts` synthesizes very light, low-pass-filtered action-button cues plus a soft turn chime with the Web Audio API, and `src/containers/GameBoard/GameBoard.tsx` exposes a persistent mute toggle alongside the utility buttons
- **Pinned character reference**: `src/components/GuideModal/GuideModal.tsx` can pin a concise character-action panel into the desktop game board, where it can be dragged and dismissed without reopening the full rules modal
- **AI replay flow**: `src/app/game/[id]/GamePageContent.tsx` reuses the same AI bot count, difficulty, and timer config when `Play Again` is pressed after a solo match
- **Game entry pacing**: `src/containers/GameBoard/GameBoard.tsx` shows a short 3-2-1-Go countdown overlay before the live board becomes interactive, so both friend matches and AI tables get a smoother start on desktop and mobile
- **Post-game pacing**: `src/containers/GameBoard/GameBoard.tsx` holds the board in a short celebration state before opening the game-over modal, keeps the table locked after dismissal, uses a draggable, resizable summary tray on desktop, switches mobile to a smaller expand/collapse recap dock anchored in the top status area so the bottom utility dock stays clickable, gives winners a restrained dual-layer confetti treatment, exposes the multiplayer `Back To Lobby` action from the final-table flow, and keeps the exit-confirm modal focused on leaving for home only
- **Victory share card**: `src/components/GameOverModal/GameOverModal.tsx` now keeps the final-table modal narrower, uses a smaller snapshot preview to avoid inner scrollbars, and retains icon-only share/download controls above the preview card, while `src/utils/shareVictoryCard.ts` generates randomized premium card themes and rotating taglines for both share and direct PNG download
- **Difficulty controls**: `src/app/page.tsx` keeps all four AI difficulty choices on one row, and `src/components/PreGameConfig/PreGameConfig.tsx` uses the same styled dropdown treatment for multiplayer fill-bot difficulty when at least one bot is enabled
- **Scroll polish**: `src/containers/OpponentArea/OpponentArea.tsx` supports mouse-wheel horizontal scrolling for the opponent rail without showing a native scrollbar, and `src/app/globals.css` applies a shared minimal themed scrollbar across modals, logs, and the rest of the app
- **In-game leaderboard tabs**: `src/containers/GameBoard/GameBoard.tsx` presents a full-screen modal with tabs for the live table and the room's cross-game scores
- **Fullscreen overlays**: `src/containers/LobbyRoom/LobbyRoom.tsx`, `src/components/GuideModal/GuideModal.tsx`, and `src/components/GameOverModal/GameOverModal.tsx` render overlays through portals so they cover the full viewport instead of being clipped by the surrounding layout
- **Replay flow**: `src/app/lobby/[id]/page.tsx` now lets the host edit and save the next-round config directly in the waiting room, uses that saved config when `Start Game` is pressed, and uses session-backed return state to hold players on the lobby route if a match is still in progress instead of bouncing them back into the board. `src/app/game/[id]/GamePageContent.tsx` exposes `Back To Lobby` from the final-table replay flow for every multiplayer player; non-hosts go straight to the lobby and wait there, the host resets the room and then rejoins the waiting room locally, and every game client leaves the board as soon as lobby polling sees the room return to waiting, while solo AI matches still use `Play Again` to create a fresh game with the same setup

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
