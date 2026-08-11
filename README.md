# GG AI Assistant

An AI assistant web application built with Next.js, React, and DeepSeek API.

## Overview

This is my first complete AI web application, built to learn the full stack of AI-powered application development — from API integration and streaming to deployment and project management.

It was built as a learning project to understand:

- AI API integration (DeepSeek / OpenAI-compatible)
- Next.js App Router and API routes
- Streaming responses (SSE)
- Client-side state management with React
- Git / GitHub workflow
- Production deployment and testing

## Features

- **Multi-turn AI chat** — full conversation history sent to the model
- **Streaming output** — tokens rendered progressively as they arrive
- **Markdown rendering** — rich formatting with code blocks, tables, and GFM support
- **Multi-chat management** — create, switch, and clear chat sessions
- **LocalStorage persistence** — chat history survives page reloads
- **AI Persona** — Chinese-language system prompt defining assistant behavior
- **Dark UI** — dark-themed chat interface
- **Responsive design** — works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Markdown | react-markdown, remark-gfm |
| AI API | DeepSeek (`deepseek-chat`) |
| Package Manager | pnpm |
| Deployment | Vercel (removed) |

## Architecture

```
User Browser
    ↓
Next.js / React (Client)
    ↓
/api/chat (Next.js API Route)
    ↓
DeepSeek API (deepseek-chat, stream: true)
    ↓
SSE → ReadableStream → text/plain chunked response
    ↓
React state → Markdown render → UI
```

The client sends the full conversation history to `/api/chat`. The API route validates the request, injects a system prompt, and forwards everything to DeepSeek with streaming enabled. Tokens are streamed back to the client as `text/plain` chunks and rendered progressively via React state.

## Project Structure

```
├── app/
│   ├── api/chat/route.ts          # API route — DeepSeek proxy with streaming
│   ├── chat/
│   │   ├── page.tsx               # Chat UI — multi-chat manager
│   │   └── markdown-message.tsx   # Markdown renderer with custom styles
│   ├── components/
│   │   ├── site-header.tsx        # Navigation bar
│   │   ├── theme-toggle.tsx       # Dark/light toggle
│   │   ├── theme-script.tsx       # FOUC prevention
│   │   └── scroll-reveal.tsx      # Scroll animation wrapper
│   ├── globals.css                # Global styles + theme tokens
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── public/                        # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── pnpm-lock.yaml
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or [http://localhost:3000/chat](http://localhost:3000/chat) for the chat interface.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPSEEK_API_KEY` | API key for DeepSeek API |

Create a `.env.local` file in the project root:

```
DEEPSEEK_API_KEY=your_api_key_here
```

**Note:** Never commit `.env.local` to version control. It is gitignored by default.

## What I Learned

This project taught me the complete lifecycle of an AI-powered web application:

1. **API integration** — working with OpenAI-compatible chat completion APIs
2. **Streaming** — parsing SSE (Server-Sent Events) and forwarding token streams
3. **State management** — React state and localStorage persistence for multi-chat
4. **TypeScript validation** — runtime type guards for API request bodies
5. **Error handling** — client disconnect, upstream errors, malformed SSE parsing
6. **Git workflow** — feature branches, conventional commits, GitHub releases
7. **Deployment** — Vercel production deployment with environment variables
8. **Project completion** — documentation, cleanup, and archival

## Deployment

This project was previously deployed to Vercel for production testing.

The Vercel deployment has been intentionally removed after the project was completed.

## Project Status

**Completed / Archived**

This project is considered complete and is no longer under active feature development. It is retained as a portfolio reference — my first complete AI web application project.

## Future Direction

My learning focus is now shifting from basic AI chat applications to:

- AI Agents
- Tool Use / Function Calling
- MCP (Model Context Protocol)
- Agent Workflows
- AI-assisted software engineering

These will be explored in new, separate projects.
