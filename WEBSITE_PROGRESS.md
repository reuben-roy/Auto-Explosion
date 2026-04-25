# Website Progress - explosion.fun

## Status: REBUILD IN PROGRESS

## Vision
Transform explosion.fun from a personal portfolio into a **tools destination** — a place people come back to daily because the tools are genuinely useful.

**Core concept:** "Explosion Tools" — a toolkit of interactive data visualization tools where users can upload their own data and discover insights they never knew existed.

## Setup Completed
- [x] Repo cloned to /home/ubuntu/.openclaw/workspace/Auto-Explosion
- [x] SSH access confirmed
- [x] Agent "explosion" configured in OpenClaw

## Rebuild Plan

### Phase 1: Universal YouTube Analyzer (REBUILD)
**Current state:** YouTube Scholar is hardcoded with Reuben's data — beautiful viz but not a tool.
**Goal:** Anyone enters a YouTube channel URL → gets rich analytics + visualizations.

**Approach:**
1. Build a channel analyzer form (input: channel URL/ID)
2. Use YouTube Data API or scrape to get channel data
3. Apply the existing D3 visualization engine to any channel
4. Users see: subscriber growth, content patterns, engagement analysis

### Phase 2: DataStory — CSV Visualizer
Upload any CSV → get animated, shareable visualization stories.

### Phase 3: Map My Migration (Universal)
Users upload GPS/location history → compare to bird migration patterns.

## Tear Down
- CEO affair post (not a tool)
- Solar system demo (passive demo, not a tool)
- Old blog ranking structure (passive consumption)
- Duplicate next.config.js + next.config.mjs

## Keep/Refactor
- Bird migration data + visualization engine
- YouTube Scholar D3 components (reusable)
- Core Next.js setup + Vercel deployment

## Current Task: Phase 1 — Universal YouTube Analyzer
**Steps:**
1. Set up YouTube Data API integration
2. Create channel input form
3. Fetch + transform channel data
4. Connect to existing D3 visualization components
5. Deploy universal analytics tool

## Tech Notes
- YouTube Data API v3 needed
- Current D3 components are reusable
- Vercel auto-deploy from main branch
