# Project: AI Chat Assistant

## What this is
A chat interface for an internship project. Frontend built first with mocked responses; will connect to a real AI backend later.

## Stack
- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI variant) for components

## Structure
- `src/components/chat/` — chat feature components (ChatShell, MessageList, MessageBubble, MessageInput)
- `src/components/ui/` — shadcn-generated components, don't hand-edit unless necessary
- `src/hooks/useChat.ts` — chat state (messages, loading) and the `send` function
- `src/lib/api.ts` — API layer. Currently mocked via `USE_MOCK = true`. Real backend will be called at `/api/chat`
- `src/lib/types.ts` — shared types (`Message`, `Role`)

## Conventions
- Function components with TypeScript, no default exports except `App`
- Styling: Tailwind utility classes only, no CSS modules or styled-components
- Path alias `@/` maps to `src/`
- Branch naming: `feature/*`, `fix/*`, `chore/*`
- Git default branch is `master` (not `main`)

## Current status
Day 1 complete: static chat shell built and styled, API layer stubbed with mock responses, pushed to GitHub on `feature/chat-shell-ui`.

Next: wire up the real backend and flip `USE_MOCK` to `false` in `src/lib/api.ts`.