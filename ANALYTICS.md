# Website Analytics & Automation

## Analytics Setup

### PostHog Integration
- **Status:** Infrastructure ready (need API key to activate)
- **Package:** `posthog-js` installed
- **Component:** `AnalyticsProvider.js` added to layout
- **Features enabled:** Page views, pageleave, autocapture, session recording

### How to Activate
1. Create free account at **posthog.com**
2. Create a new project
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```
4. Redeploy to Vercel

### Already Have
- ✅ Vercel Analytics (built-in, passive)
- ✅ Vercel Speed Insights (built-in, passive)

---

## Automation: Website Review (Every 3 Days)

### Cron Job ID: `website-analytics-review`

**Schedule:** Every 3 days at 9:00 AM MST

### Prompt for Automation:

```
You are an autonomous website improvement agent. Analyze the website at https://auto.explosion.fun and its analytics data (PostHog/Vercel Analytics if available).

## Your Task

### 1. Check Analytics Health
- Review traffic patterns (trends, anomalies, drop-offs)
- Identify top-performing pages and tools
- Note user retention and drop-off points
- Check conversion funnels (if tool uploads are tracked)

### 2. Performance Review  
- Check Core Web Vitals (LCP, FID, CLS)
- Review Vercel Speed Insights dashboard
- Identify slow pages or components

### 3. UX Audit
- Review session recordings (PostHog) for rage clicks, confusion points
- Check heatmaps (if available) for engagement patterns
- Note any friction points in the upload/analysis flow

### 4. Content & SEO Check
- Review search console (Google) for ranking changes
- Check indexing status of /tools pages
- Look for new keyword opportunities

### 5. Competitive Analysis
- Check if any competitor tools changed their approach
- Note new features others have launched

### 6. Generate Report

Format your findings as:

## 📊 Analytics Report — [DATE]

### Traffic Summary
- [Key metrics and trends]

### Top Performers  
- [Best performing content/tools]

### Issues Found
- [Problems requiring attention]

### Opportunities
- [Potential improvements]

### Recommended Actions
- [Prioritized list of changes to make]
- [Specific things to build/improve]

### A/B Test Ideas
- [Hypothesis for testing]
- [Expected impact]

## Important Rules
- If analytics shows clear user pain points, prioritize fixing those
- If a tool page has high bounce rate, investigate and improve
- If engagement is high on certain content, create more of it
- Always test changes before deploying
- Prefer small, frequent improvements over large rewrites
- Focus on tools that drive return visits
- Make recommendations specific and actionable

After generating the report:
1. Create issues/tasks for high-priority improvements
2. If a fix is obvious and quick (e.g., copy change, UI polish), implement it immediately
3. Save the report to /workspace/Auto-Explosion/ANALYTICS_REPORTS/[date].md
4. Post summary to Discord if major issues found
```

---

## A/B Test Opportunities

When PostHog is active, track these experiments:

| Test | Variant A | Variant B | Metrics |
|------|-----------|-----------|---------|
| Hero CTA | "Analyze Your YouTube" | "See What You Watch" | Upload rate |
| Tool Card Style | Icon + text | Animated preview | Click-through |
| Upload UI | Drag & drop | Browse button | Completion |
| Results Summary | Card layout | Story narrative | Share rate |

---

## PostHog Feature Flags to Enable

- `new_tool_onboarding` — for testing new user flows
- `animated_results` — for testing animated data reveals
- `share_button` — for testing viral sharing

---