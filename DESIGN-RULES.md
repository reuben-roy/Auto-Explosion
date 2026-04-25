# Design Rules — explosion.fun

Visual language and design principles. Reference site: **https://auto.explosion.fun/**

---

## Philosophy

The site is a **tools destination** — not a portfolio. Users come to:
- Upload their data and discover insights
- Get animated, interactive visualizations
- Share results with others

The design should feel:
- **Premium but functional** — like a tool worth using daily
- **Dark and focused** — data visualizations pop on dark backgrounds
- **Animated but purposeful** — motion explains, not distracts
- **Professional** — works on desktop and mobile

**Inspiration:** The Pudding (pudding.cool), Awwwards winners, interactive data storytelling sites. Clean, bold, memorable.

---

## Color Palette

### Core Colors

```css
/* Background hierarchy */
--bg-darkest: #030303;     /* Page background */
--bg-dark: #0a0a0f;         /* Section backgrounds */
--bg-surface: #111118;     /* Cards, elevated surfaces */
--bg-elevated: #1a1a1a;     /* Modals, dropdowns */

/* Text */
--text-primary: #ffffff;    /* Headings, important text */
--text-secondary: #f5f5f4; /* Body text */
--text-muted: #a1a1aa;     /* Secondary text */
--text-faint: #71717a;     /* Labels, captions */
--text-placeholder: #57534e; /* Placeholders */

/* Primary accent — Teal */
--accent: #67c1b8;         /* Primary interactive, CTAs */
--accent-hover: #4a9e96;    /* Hover state */
--accent-glow: rgba(103, 193, 184, 0.3); /* Glow effects */

/* Secondary accent — Orange */
--accent-secondary: #f2a65a; /* Gradients, highlights */

/* Borders & Overlays */
--border: rgba(255, 255, 255, 0.08);
--border-hover: rgba(255, 255, 255, 0.15);
--border-accent: rgba(103, 193, 184, 0.4);
--overlay: rgba(0, 0, 0, 0.8);

/* Status */
--success: #22c55e;
--warning: #fbbf24;
--error: #ef4444;
--info: #3b82f6;
```

### Gradients

```css
/* Hero/section gradient */
background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);

/* Accent text gradient (used on headings) */
background: linear-gradient(135deg, #67c1b8 0%, #f2a65a 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Primary button gradient */
background: linear-gradient(135deg, #67c1b8 0%, #4a9e96 100%);

/* Fill bar gradient */
background: linear-gradient(90deg, #67c1b8 0%, #f2a65a 100%);
```

---

## Typography

### Font
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;
```

### Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Hero title | `clamp(3rem, 6vw, 5rem)` | 800 | -0.03em letter-spacing |
| Section h1 | `clamp(2.5rem, 5vw, 3.5rem)` | 800 | |
| Section h2 | `2rem - 2.5rem` | 700 | |
| Card h3 | `1.15rem - 1.5rem` | 600 | |
| Body | `1rem` (16px) | 400 | 1.5-1.7 line-height |
| Small | `0.875rem` | 400 | |
| Caption | `0.75rem - 0.8rem` | 500 | Uppercase, letter-spacing 0.05-0.08em |

### Text Gradient Effect (Heroes)

```css
.title {
  background: linear-gradient(to bottom right, #ffffff 30%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Spacing System

Base unit: **8px**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight gaps |
| `--space-sm` | 8px | Small gaps |
| `--space-md` | 16px | Default gap |
| `--space-lg` | 24px | Section padding |
| `--space-xl` | 32px (2rem) | Large section padding |
| `--space-2xl` | 48px (3rem) | Hero spacing |
| `--space-3xl` | 64px+ | Major breaks |

### Component Spacing

```css
/* Section padding */
padding: 4rem 2rem;

/* Card padding */
padding: 1.5rem - 2rem;

/* Page padding */
padding: 0 2rem 4rem;

/* Gap between cards */
gap: 1.5rem;
```

---

## Components

### Cards

```css
.card {
  padding: 1.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.25s ease;
}

.card:hover {
  border-color: rgba(103, 193, 184, 0.4);
  box-shadow: 0 8px 32px rgba(103, 193, 184, 0.12);
  transform: translateY(-3px);
}
```

### Buttons

```css
/* Primary */
.button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #67c1b8 0%, #4a9e96 100%);
  color: #0a0a0f;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 193, 184, 0.3);
}

/* Secondary/Outline */
.button-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #a1a1aa;
}

.button-secondary:hover {
  border-color: #67c1b8;
  color: #67c1b8;
}
```

### Badges/Tags

```css
.badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a1a1aa;
}

/* Active badge */
.badge-active {
  background: #ffffff;
  color: #000000;
}

/* Accent badge */
.badge-accent {
  background: linear-gradient(135deg, #67c1b8 0%, #4a9e96 100%);
  color: #0a0a0f;
}
```

### Inputs

```css
.input {
  padding: 1rem 1.25rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: #67c1b8;
  box-shadow: 0 0 0 3px rgba(103, 193, 184, 0.15);
}

.input::placeholder {
  color: #57534e;
}
```

### Progress/Fill Bars

```css
.bar-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c1b8 0%, #f2a65a 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Animations

### Timing

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
--transition-entrance: 0.8s ease-out;
```

### Entrance Animation (Hero)

```css
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--transition-entrance), transform var(--transition-entrance);
}

.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Hover Lift

```css
.hover-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(103, 193, 184, 0.12);
}
```

### Text Gradient Shift (on hover)

```css
.gradient-text {
  background: linear-gradient(135deg, #67c1b8 0%, #f2a65a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: filter 0.3s ease;
}

.gradient-text:hover {
  filter: brightness(1.1);
}
```

---

## Layout

### Max Widths

| Content | Max Width |
|---------|-----------|
| Narrow (text, forms) | 600px - 700px |
| Default (cards, lists) | 900px - 1100px |
| Wide (dashboards) | 1200px - 1400px |
| Full (hero sections) | 100% |

### Grid

```css
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 1.5rem;
```

### Navbar

```css
navbar {
  position: fixed;
  top: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
}
```

---

## UI Libraries to Use

For rapid development, leverage these:

### Animation & Effects
- **Framer Motion** — Production-ready animations, gestures
- **Aceternity UI** — Copy-paste components with great animations
- **Magic UI** — Beautiful UI components with Shadcn integration

### Components
- **shadcn/ui** — Copy-paste components, fully customizable
- **Radix UI** — Headless, accessible primitives

### 3D & Visual
- **Three.js** — Already in project for 3D visualizations
- **@react-three/fiber** — React Three.js bindings
- **D3** — Already in project for data viz

### Utility
- **clsx** / **class-variance-authority** — Conditional classes
- **tailwind-merge** — Class merging

### When to Use

| Need | Library |
|------|---------|
| Smooth page transitions | Framer Motion |
| Interactive buttons, text effects | Aceternity UI / Magic UI |
| Card layouts, forms, modals | shadcn/ui |
| Data visualization charts | D3 (already in project) |
| 3D scenes, globe, maps | Three.js (already in project) |
| Drag-and-drop | Framer Motion + Radix |

---

## Reference Sites

### Interactive Data Storytelling
- **The Pudding** (pudding.cool) — Data essays, visual essays
- **Awwwards** — Scroll animations, creative layouts
- **Bloomberg Graphics** — Data visualization excellence

### Modern Tool UIs
- **Linear** (linear.app) — Dark theme, smooth animations
- **Vercel Dashboard** — Technical, clean
- **Raycast** — Developer tool aesthetic

### Creative & Bold
- **Going Home** (goinghome.302chanwoo.com) — Portfolio with personality
- **Taotajima** (taotajima.jp) — Bold layouts, animation
- **Arc Browser** — Premium feel, accent colors

### Animation-Focused
- **Framer** (framer.com) — Smooth, purposeful motion
- **Stripe** (stripe.com) — Micro-interactions
- **Apple** (apple.com) — Premium scroll effects

---

## Anti-patterns

❌ **Don't do these:**
- `#333` or `#444` — Use `#111118` or rgba overlays
- Pure `#000` text — Use `#ffffff` or `#f5f5f4`
- Blue for everything — Reserve `#67c1b8` for primary interactive
- Shadows as borders on dark — Use 1px borders instead
- Over-animating — Max 0.3s for micro-interactions
- More than 2-3 colors in one component
- Static content when motion could explain it

✅ **Do these:**
- Dark glass morphism with `backdrop-filter: blur()`
- Purposeful entrance animations (fade + translateY)
- Hover states that lift + glow
- Gradients on text for emphasis
- Data viz that animates on scroll
- Loading states that feel alive (skeleton shimmer, spinners)

---

## Checklist for New Components

Before shipping any component, verify:
- [ ] Dark background (`#111118` or `rgba(255,255,255,0.03)`)
- [ ] 1px border, not shadow
- [ ] Teal accent for interactive elements
- [ ] `0.2s` transitions minimum
- [ ] Hover state (lift + glow)
- [ ] Mobile responsive (test at 375px)
- [ ] Loading/empty states
- [ ] No console errors
