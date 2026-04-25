# Website Progress - explosion.fun

## Status: REBUILD IN PROGRESS

## Vision
Transform explosion.fun from a personal portfolio into a **tools destination** — a place people come back to daily because the tools are genuinely useful.

**Core concept:** "Explosion Tools" — a toolkit of interactive data visualization tools where users can upload their own data and discover insights they never knew existed.

## Setup Completed
- [x] Repo cloned to /home/ubuntu/.openclaw/workspace/Auto-Explosion
- [x] SSH access confirmed
- [x] Agent "explosion" configured in OpenClaw

## Completed Tasks
- [x] Fix duplicate next.config.js + next.config.mjs → single next.config.js
- [x] Add YouTube Channel Analyzer tool at /tools/youtube-analyzer
- [x] Create API route at /api/youtube-analyze (demo mode + API key ready)
- [x] Add /tools hub page with tool cards and status indicators
- [x] Add Tools navigation to navbar with gradient badge
- [x] UX note: Ensure complete and intuitive navigation

## CRITICAL: YouTube Data Approach
**Data source:** Google Takeout exports (NOT YouTube Data API)
- Users download their data from https://takeout.google.com/
- Takeout includes: watch history, search history, subscriptions, comments, playlists, video metadata
- Data is processed client-side or server-side with uploaded files
- No API key needed, fully private

## Rebuild Plan

### Phase 1: Universal YouTube Analyzer (REVISED)
**Approach:** 
1. User uploads their Google Takeout YouTube folder
2. System parses: history/watch-history.html, subscriptions/subscriptions.csv, playlists, video metadata
3. Transform to visualization-ready format
4. Show personal analytics dashboard (subscriber trends, content categories, engagement)

**Data folder structure from Takeout:**
```
Youtube_Data/
├── channels/
├── comments/
├── history/ (watch-history.html, search-history.html)
├── live chats/
├── playlists/
├── subscriptions/subscriptions.csv
├── video metadata/
└── ...
```

### Phase 2: DataStory — CSV Visualizer
Upload any CSV → get animated, shareable visualization stories.

### Phase 3: Map My Migration (Universal)
Users upload GPS/location history → compare to bird migration patterns.

## Design Principles (CRITICAL)
- Every tool must be accessible from homepage and navbar
- Never assume users will guess URLs
- Create clear visual hierarchy and navigation paths
- Status indicators (Live/Demo/Coming Soon) help set expectations
- Consider adding tool previews or CTAs on homepage hero section

## Tech Notes
- Takeout processing: parse HTML + CSV files
- Current YouTube Scholar as reference implementation
- Vercel auto-deploy from main branch

## Next Steps
1. Rewrite YouTube Analyzer to use Takeout upload approach
2. Build Takeout file parser (use existing youtube-scholar data as reference)
3. Add upload UI to /tools/youtube-analyzer
4. Add tool preview/CTAs to homepage hero section
5. Build Phase 2: CSV Visualizer tool
6. Teardown passive content pages
