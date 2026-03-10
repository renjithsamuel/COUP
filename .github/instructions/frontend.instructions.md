---
description: "Use when editing TypeScript/TSX files in the frontend. Covers Next.js App Router patterns, container/component split, state management, and animations."
applyTo: "frontend/src/**/*.{ts,tsx}"
---
# Frontend Conventions

## Architecture

- **Pages** (`app/`): Next.js 14 App Router. Each route is a `page.tsx`. Use `'use client'` for interactive pages.
- **Containers** (`containers/`): Wire data (context, queries, callbacks) and define layout. Named `<Feature>/<Feature>.tsx`.
- **Components** (`components/`): Presentational only — receive props, render UI. No data fetching or business logic.
- **Context** (`context/`): React Context + Reducer for complex state (game, lobby). One context per domain.
- **Models** (`models/`): TypeScript interfaces mirroring backend Pydantic models. Mocks live alongside as `*.mock.ts`.
- **Services** (`services/`): API calls. Service layer handles snake_case (backend) ↔ camelCase (frontend) conversion.
- **Queries** (`queries/`): TanStack React Query hooks wrapping service calls.

## Patterns

- All TypeScript code uses **camelCase** (variables, functions, props). Interfaces use PascalCase.
- Service layer maps snake_case API responses to camelCase TypeScript objects.
- State management: Context + Reducer when state has >3 pieces or complex transitions. React Query for server state.
- Animations: Framer Motion for simple transitions (variants in `animations/variants.ts`), GSAP timelines for complex sequences (`animations/gsapTimelines.ts`). Constants in `animations/constants.ts`.

## Testing

- Framework: Vitest + React Testing Library
- Run: `npm test`

## Documentation

When you change frontend code, update `frontend/README.md` if project structure, components, pages, or tech stack change. Update `.github/copilot-instructions.md` if architecture or conventions change.
