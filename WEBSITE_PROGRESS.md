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
- [x] UX note: Ensure complete and intuitive navigation — users MUST be able to reach all tools from homepage

## Rebuild Plan

### Phase 1: Universal YouTube Analyzer ✓ (LAUNCHED, NEEDS API KEY)
**Status:** Tool exists at /tools/youtube-analyzer with demo mode
**Navigation:** Accessible from /tools hub and navbar
**Next:** Add YOUTUBE_DATA_API_KEY environment variable to Vercel

### Phase 2: DataStory — CSV Visualizer
Upload any CSV → get animated, shareable visualization stories.

### Phase 3: Map My Migration (Universal)
Users upload GPS/location history → compare to bird migration patterns.

## Tear Down (Pending)
- CEO affair post (not a tool)
- Solar system demo (passive demo, not a tool)
- Old blog ranking structure (passive consumption)
- Personal portfolio Hero section (replaced by tools focus)

## Keep/Refactor
- Bird migration data + visualization engine
- YouTube Scholar D3 components (reusable)
- Core Next.js setup + Vercel deployment
- Navbar + navigation structure

## Design Principles (CRITICAL)
- Every tool must be accessible from homepage and navbar
- Never assume users will guess URLs
- Create clear visual hierarchy and navigation paths
- Status indicators (Live/Demo/Coming Soon) help set expectations
- Consider adding tool previews or CTAs on homepage hero section

## Tech Notes
- YouTube Data API v3 needed for live data
- Current D3 components are reusable
- Vercel auto-deploy from main branch

## Next Steps
1. Set YOUTUBE_DATA_API_KEY in Vercel environment variables
2. Add tool preview/CTAs to homepage hero section
3. Build Phase 2: CSV Visualizer tool
4. Teardown passive content pages
