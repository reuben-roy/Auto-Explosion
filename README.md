# Auto-Explosion

> Personal portfolio, blog, and interactive tools hub built with Next.js — a digital playground for data-driven storytelling.

## What It Does

Auto-Explosion is the codebase behind [explosion.fun](https://explosion.fun), a personal website that combines:

- **Portfolio & Blog** — A ranked, categorized blog for reviewing anime, manga, movies, TV series, and books with custom scoring systems.
- **Interactive Visualizations** — Bird migration maps, solar system simulations, and animated data stories using D3.js and Three.js.
- **Data Tools** — YouTube Google Takeout analyzer, goal alignment tools, and time-management dashboards.
- **App Changelogs** — Public changelog pages for side projects like Side-Track.

Originally a personal portfolio, it's evolving into a **tools destination** where visitors can upload their own data and extract insights through interactive visualizations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org/) 15 (App Router, Turbopack) |
| Frontend | React 19, CSS Modules |
| Data Viz | [D3.js](https://d3js.org/), [Three.js](https://threejs.org/), TopoJSON |
| Backend CMS | WordPress Headless (GraphQL API at `cms.explosion.fun`) |
| Analytics | Vercel Analytics, Vercel Speed Insights, PostHog |
| Auth/Data | Firebase (v11) |
| Font | Geist (Google Fonts) |

## Quick Start

```bash
# Install dependencies
npm install

# Start the dev server (Turbopack)
npm run dev

# Or use the Node version specified in .nvmrc
nvm use && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run youtube:data` | Process YouTube export data |

## Project Structure

```
src/
  app/              # Next.js App Router pages
    blog/           # Blog listing, ranked views, post pages
    career/         # Portfolio / resume page
    projects/       # Project showcases (YouTube Scholar, Time Management)
    tools/          # Interactive tools hub
    side-track/     # App changelog & legal pages
  components/       # Reusable React components
  config/           # GraphQL queries for WordPress CMS
  lib/              # Analytics & config utilities
  utils/            # Data parsers & category helpers
public/
  data/             # Static datasets (bird migration, world map, YouTube exports)
scripts/            # Data processing & analysis scripts
```

## Key Features

- **GraphQL-powered Blog** — Posts and reviews fetched from a headless WordPress instance with category-specific scoring fields.
- **Interactive Posts** — Dedicated interactive blog posts with bird migration visualizations, solar system simulations, and narrative experiences.
- **YouTube Data Tools** — Client-side analysis of Google Takeout exports (watch history, subscriptions, playlists) — no API key required, fully private.
- **Goal Alignment Tool** — Interactive framework for aligning personal activities with goals.
- **Time Management Dashboard** — Analyzes exported activity data for productivity insights.
- **PostHog + Vercel Analytics** — Dual-layer analytics with privacy-first product analytics.

## Configuration

### Environment Variables

Create a `.env.local` file for local secrets:

```env
# PostHog (optional)
NEXT_PUBLIC_POSTHOG_API_KEY=your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Firebase (if enabling auth features)
# See Firebase console for project credentials
```

### CMS Endpoint

The WordPress GraphQL endpoint is configured in `src/config/graphql.js`:
- Production: `https://cms.explosion.fun/graphql`

## Design & Navigation Rules

- Every tool is reachable from both the homepage and navbar.
- Tools show status indicators (Live / Demo / Coming Soon).
- No assumptions about URL memorization — clear visual hierarchy throughout.

## License

No explicit LICENSE file in this repository. Assume all rights reserved unless otherwise stated.

---

Built with curiosity by [Reuben Roy](https://github.com/reuben-roy).
