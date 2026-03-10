---
name: update-docs
description: "Update project documentation after code changes. Use when adding features, changing APIs, modifying architecture, or restructuring code. Ensures copilot-instructions.md, backend/README.md, frontend/README.md, and PROJECT_PLAN.md stay in sync with the codebase."
---
# Update Documentation

## When to Use

After any code change that affects:
- API endpoints, request/response shapes, or WebSocket messages
- Project structure (new files, folders, or modules)
- Architecture or conventions
- Game rules or state machine logic
- Build commands, setup steps, or dependencies
- Tech stack additions or removals

## Files to Update

| File | Update when... |
|------|---------------|
| `.github/copilot-instructions.md` | Architecture, conventions, build commands, or project structure change |
| `backend/README.md` | Backend API endpoints, setup steps, project structure, or tech stack change |
| `frontend/README.md` | Frontend structure, components, pages, or tech stack change |
| `PROJECT_PLAN.md` | Game rules, state machine, or high-level design decisions change |

## Procedure

1. Identify which documentation files are affected by the change
2. Read the current content of each affected file
3. Update only the sections that changed — don't rewrite unrelated sections
4. Keep the existing structure and formatting style of each file
5. Verify the updates are accurate and consistent across all docs

## Rules

- Every code change that alters public interfaces, structure, or behavior **must** include documentation updates
- Don't add speculative documentation for unimplemented features
- Keep README sections concise — link to code or other docs instead of duplicating
- Use tables for API references, bullet points for conventions
