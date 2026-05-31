# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 (App Router) project with two distinct areas: a marketing landing page and an AI chat interface. React 19, TypeScript, Tailwind CSS v4, pnpm.

## Commands

```bash
pnpm dev          # Start dev server on http://localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

### Routes

- `/` → `app/page.tsx` — Marketing landing page (server component). Hero, features, testimonials, pricing, footer. Chinese-language content, hardcoded.
- `/chat` → `app/chat/page.tsx` — AI chat client. Multi-chat with sidebar, localStorage persistence, Markdown rendering. Fully client-rendered (`"use client"`).
- `/api/chat` → `app/api/chat/route.ts` — POST endpoint. Proxies multi-turn conversation history to DeepSeek API (`deepseek-chat` model). Validates with TypeScript type guards; returns `{ reply: string }`.

### Shared Components (`app/components/`)

- `SiteHeader` — Scroll-aware glass-morphism nav bar with theme toggle and nav links.
- `ThemeToggle` — Dark/light toggle, persists to `localStorage("theme")`.
- `ThemeScript` — Inline `<Script>` injected before interactive to set `.dark` class and prevent FOUC.
- `ScrollReveal` — Wraps children with IntersectionObserver for scroll-triggered fade-up animation.
- `MarkdownMessage` (`app/chat/markdown-message.tsx`) — Renders assistant messages via `react-markdown` + `remark-gfm` with styled custom components.

### Theme System

CSS custom properties on `:root` and `.dark` in `app/globals.css`. Tailwind `@custom-variant dark (&:where(.dark, .dark *))` mirrors the `.dark` class. Semantic tokens: `--background`, `--foreground`, `--muted`, `--accent`, `--surface`, `--surface-elevated`. Apple system font stack.

### Chat State (`app/chat/page.tsx`)

Multi-chat data model stored in `localStorage("gg-chat-messages")`:

```
{ chats: Chat[], currentChatId: string }
```

Each `Chat` has `{ id, title, messages: Message[] }`. Each `Message` has `{ id, role, content }`.
- Title auto-derived from first user message (≤32 chars).
- Messages with `id === "welcome"` are the default assistant greeting and are excluded from API calls.
- `nextId` ref syncs from stored IDs on load to avoid collisions.

### API Route (`app/api/chat/route.ts`)

- Reads `DEEPSEEK_API_KEY` from server env (in `.env.local`, gitignored).
- Validates: array exists and non-empty, all messages have valid `role`/`content`, last message is from `user`.
- Injects a Chinese-language system prompt defining the assistant persona ("GG AI Assistant", user name 郜轶元).
- Calls `https://api.deepseek.com/chat/completions` with `stream: false`.
- Returns `{ reply: string }` on success, `{ error: string }` on failure.

### Styling

Tailwind CSS v4 with `@theme inline` block mapping CSS variables to Tailwind color tokens. Custom CSS animations for hero entrance, gradient text, floating mockup, feature card hover, pricing highlight glow, and scroll reveal. `prefers-reduced-motion` respected globally.

### Tech Stack Notes

- **pnpm** only — `pnpm-lock.yaml` and `pnpm-workspace.yaml` present. Do not use npm/yarn.
- **No test framework** configured yet.
- **No database** — all persistence is client-side localStorage for chat, server-side env var for API key.
- **No authentication** — login link is a placeholder.
