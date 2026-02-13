# OpenClaw Dashboard — SPEC.md

## Overview
A web dashboard for managing multiple OpenClaw agents. Linear-inspired dark mode aesthetic.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Auth:** NextAuth.js with credentials provider (simple username/password)
- **API:** Talks to OpenClaw Gateway REST API
- **Deployment:** Railway

## Design System (Linear Aesthetic)
- **Background:** `#0A0A0B` (near-black)
- **Surface:** `#1A1A1F` (dark gray cards)
- **Border:** `#2A2A35` (subtle borders)
- **Accent:** `#7C5CFC` (purple, Linear's signature)
- **Accent hover:** `#6B4FE0`
- **Text primary:** `#E8E8ED`
- **Text secondary:** `#8B8B9E`
- **Success:** `#4ADE80`
- **Warning:** `#FBBF24`
- **Error:** `#F87171`
- **Font:** Inter (system fallback: -apple-system, sans-serif)
- **Mono:** JetBrains Mono / SF Mono
- **Border radius:** 6px (subtle rounding)
- **Transitions:** 150ms ease

## Pages

### 1. Login (`/login`)
- Simple email/password form
- Centered card on dark background
- Purple accent button

### 2. Dashboard (`/`)
- **Agent cards** in a grid layout
  - Agent name, emoji, model
  - Status indicator (online/offline)
  - Last activity timestamp
  - Quick actions: view sessions, view cron jobs
- **Summary stats** at top
  - Total agents, active cron jobs, jobs run today

### 3. Agent Detail (`/agents/[id]`)
- Agent info (name, model, workspace path)
- Recent sessions list
- Cron jobs belonging to this agent
- SOUL.md preview

### 4. Cron Jobs (`/cron`)
- Table view of all cron jobs across all agents
  - Job name, schedule (human readable), agent, status (enabled/disabled)
  - Last run time, last result
  - Toggle enable/disable
  - Run now button
- Filter by agent
- Sort by next run / last run / name

### 5. Job Detail (`/cron/[id]`)
- Job config details
- Run history with logs
- Edit schedule
- Enable/disable toggle

## API Routes (Next.js API routes as proxy to OpenClaw Gateway)

The dashboard needs to proxy requests to the OpenClaw Gateway API.

Gateway API base: `http://localhost:19000` (default)

Key endpoints to proxy:
- `GET /api/agents` → `openclaw agents list --json` (or Gateway API equivalent)
- `GET /api/cron` → Gateway `/cron/jobs`
- `POST /api/cron/:id/run` → Gateway `/cron/jobs/:id/run`
- `PATCH /api/cron/:id` → Gateway `/cron/jobs/:id`
- `GET /api/cron/:id/runs` → Gateway `/cron/jobs/:id/runs`

## Auth
- NextAuth credentials provider
- Username/password stored as env vars: `DASHBOARD_USER`, `DASHBOARD_PASS`
- JWT session strategy
- Middleware protects all routes except `/login`

## Environment Variables
```
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=<deployment-url>
DASHBOARD_USER=jake
DASHBOARD_PASS=<password>
OPENCLAW_GATEWAY_URL=http://localhost:19000
OPENCLAW_GATEWAY_TOKEN=<gateway-bearer-token>
```

## Key Interactions
- Toggle cron job → PATCH with enabled:true/false → refresh
- Run now → POST run → show toast with result
- Click agent → navigate to detail page
- Click cron job → navigate to job detail with history

## Responsive
- Works on desktop and tablet
- Sidebar nav on desktop, hamburger on mobile
- Cards stack vertically on narrow screens
