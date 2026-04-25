# Design Rules — explosion.fun

This document defines the visual language and design principles for explosion.fun.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Teal** | `#67c1b8` | Primary accent, CTAs, highlights, interactive elements |
| **Deep Teal** | `#4a9e96` | Hover states for teal elements |
| **Orange** | `#f2a65a` | Secondary accent, gradients, category highlights |
| **Dark** | `#0a0a0f` | Background (dark sections) |
| **Surface** | `#111118` | Card backgrounds, elevated surfaces |
| **White** | `#f5f5f4` | Primary text |
| **Muted** | `#8f98a7` | Secondary text |
| **Faint** | `#57534e` | Tertiary text, placeholders |
| **Overlay** | `rgba(255,255,255,0.08)` | Borders, dividers on dark surfaces |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#22c55e` | Live status, positive states |
| **Warning** | `#fbbf24` | Demo mode status |
| **Error** | `#ef4444` | Error messages |
| **Info** | `#3b82f6` | Informational highlights |

---

## Typography

### Font Stack
```css
font-family: Arial, Helvetica, sans-serif;
```

### Scale
- **Hero titles:** `clamp(3rem, 6vw, 5rem)`, weight 800, letter-spacing -0.03em
- **Section headings:** `2rem - 2.5rem`, weight 700
- **Card titles:** `1.1rem - 1.5rem`, weight 600
- **Body:** `1rem` (16px base)
- **Small/caption:** `0.85rem - 0.9rem`
- **Label/eyebrow:** `0.75rem - 0.8rem`, uppercase, letter-spacing 0.05em - 0.08em

### Text Gradient (Heroes)
```css
background: linear-gradient(to bottom right, #ffffff 30%, #a1a1aa 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Accent Gradient
```css
background: linear-gradient(135deg, #67c1b8 0%, #f2a65a 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Spacing

### Base Unit
- **4px** — smallest gap
- **8px** — tight spacing
- **16px** (1rem) — default gap
- **24px** — section padding
- **32px** (2rem) — large section padding
- **48px** (3rem) — hero spacing
- **64px+** — major section breaks

### Border Radius
- **Small:** `8px` — buttons, inputs, small cards
- **Medium:** `12px - 16px` — cards, containers
- **Large:** `20px` — modals, major containers
- **Pill:** `9999px` — badges, tags

### Shadows
- Cards typically use **border** not shadow on dark backgrounds
- If shadow needed: `0 4px 12px rgba(103, 193, 184, 0.3)` for teal glow effects

---

## Backgrounds

### Dark Theme Base
```css
background: #0a0a0f;  /* Darkest — page background */
background: #111118;  /* Surface — cards, elevated areas */
```

### Gradients
```css
/* Hero gradient */
background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);

/* Accent gradient */
background: linear-gradient(135deg, #67c1b8 0%, #f2a65a 100%);

/* Teal button gradient */
background: linear-gradient(135deg, #67c1b8 0%, #4a9e96 100%);
```

### Glass Effect
```css
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(10px);
```

---

## Components

### Cards

```css
/* Standard card */
padding: 1.5rem - 2rem;
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;

/* Hover state */
border-color: rgba(103, 193, 184, 0.4);
box-shadow: 0 8px 32px rgba(103, 193, 184, 0.12);
transform: translateY(-3px);
```

### Buttons

```css
/* Primary button */
padding: 0.75rem 2rem;
background: linear-gradient(135deg, #67c1b8 0%, #4a9e96 100%);
color: #0a0a0f;
font-weight: 600;
border-radius: 10px - 12px;

/* Hover */
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(103, 193, 184, 0.3);

/* Secondary/outline button */
background: transparent;
border: 1px solid rgba(255, 255, 255, 0.2);
color: #8f98a7;
```

### Badges/Tags

```css
/* Status badge */
padding: 0.2rem 0.6rem;
font-size: 0.7rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
border-radius: 12px;

/* Teal accent badge */
background: linear-gradient(135deg, #67c1b8 0%, #4a9e96 100%);
color: #0a0a0f;
```

### Inputs

```css
padding: 1rem 1.25rem;
font-size: 1rem;
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
color: #f5f5f4;

/* Focus state */
border-color: #67c1b8;
box-shadow: 0 0 0 3px rgba(103, 193, 184, 0.15);
```

### Progress Bars / Fill Bars

```css
height: 6px - 8px;
background: rgba(255, 255, 255, 0.1);
border-radius: 3px - 4px;

.categoryFill {
  background: linear-gradient(90deg, #67c1b8 0%, #f2a65a 100%);
}
```

---

## Animations

### Standard Transition
```css
transition: all 0.2s ease;
```

### Card Hover
```css
transition: all 0.25s ease;
```

### Entrance Animation (Hero)
```css
.heroLeft {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
.heroLeft.loaded {
  opacity: 1;
  transform: translateY(0);
}
```

### Loading Spinner
```css
.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(103, 193, 184, 0.2);
  border-top-color: #67c1b8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## Layout

### Max Width
- **Narrow content:** 600px - 700px
- **Default content:** 900px - 1100px
- **Wide layouts:** 1200px - 1400px

### Grid
```css
grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
gap: 1.5rem;
```

### Padding
- **Section padding:** 4rem 2rem
- **Card padding:** 1.5rem - 2rem
- **Page padding:** 0 2rem 4rem

---

## Responsive

- Use `clamp()` for fluid typography
- Use CSS Grid with `auto-fit` for responsive columns
- Hide scrollbars on Firefox: `scrollbar-width: none`
- Mobile-first approach for spacing

---

## Icon Style

Use inline SVGs with `stroke="currentColor"` or `fill="currentColor"`.
Stroke width: `2` for most icons.
Size: `16px - 32px` typical.

---

## Inspiration — Reference UIs

These sites exemplify the design principles we follow:

### Data Visualization & Interactive Tools
1. **Stripe Dashboard** (stripe.com) — Clean data presentation, subtle gradients, excellent typography
2. **Linear** (linear.app) — Dark theme done right, smooth animations, minimal but not sterile
3. **Vercel Dashboard** (vercel.com) — Technical but approachable, clear hierarchy

### Personal/Portfolio & Creative Tools
4. **Figma** (figma.com) — Tool-focused UI that feels premium
5. **Notion** (notion.so) — Clean, functional, subtle use of color
6. **Raindrop.io** (raindrop.io) — Visual-first design, excellent use of cards

### Dark Themes with Accent Colors
7. **Arc Browser** (arc.net) — Bold use of color, modern feel
8. **Raycast** (raycast.com) — Developer tool aesthetic, teal accents
9. **Warp Terminal** (warp.dev) — Dark + accent color done consistently

### Animation & Micro-interactions
10. **Awwwards.org** — Showcase of excellent web animation
11. **Stripe's Elements** — Smooth, purposeful transitions
12. **Linear's Detail Views** — Satisfying open/close animations

---

## Anti-patterns to Avoid

- ❌ Don't use `#333` or `#444` — use `#111118` or `rgba(255,255,255,0.xx)`
- ❌ Don't use pure black `#000` for text — use `#f5f5f4` or `#ffffff`
- ❌ Don't use blue for everything — reserve `#67c1b8` for primary interactive
- ❌ Don't use shadows as borders — use 1px borders on dark surfaces
- ❌ Don't over-animate — subtle transitions only, 0.2s - 0.3s max
- ❌ Don't use more than 2-3 colors prominently in a component
