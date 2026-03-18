# Nav Redesign Design

**Date:** 2026-03-18
**Approach:** Astro + inline script (Approach B)

## Goals

1. Mobile usability — hamburger menu at ≤768px
2. Discoverability — Study Guide dropdown exposing 5 domain sub-pages
3. Visual polish — grad cap icon, better spacing, external link differentiation

## Structure

### Desktop (>768px)

- Fixed top bar, dark background (`#141413`)
- Left: grad cap SVG (18px, `#faf9f5`) + "ANTHROPIC CERT PREP"
- Right: Study Guide ▾ | Flashcards | Visual Guide | Course Catalog | Practice Exam ↗
- Study Guide has a click-activated dropdown:
  - "All Domains" → study guide index
  - Domain 1–5 links
  - Background `#1c1c1b`, subtle box-shadow
  - Close on outside click or Escape

### Mobile (≤768px)

- Brand shortens to "CERT PREP"
- Hamburger (☰/✕) on the right
- Full-width panel slides down below nav bar
- Study Guide sub-items expand/collapse inline (accordion)
- Tapping a link navigates and closes menu

### Visual Details

- Nav link gap: 28px
- Practice Exam: subtle outlined/pill style to distinguish as external
- Active state: `#d97757` orange underline + bold (unchanged)
- Transitions: 150ms ease for dropdown, mobile slide, hover colors
- Dropdown/mobile menu background: `#1c1c1b`

### Accessibility

- `aria-expanded`, `aria-haspopup` on Study Guide trigger
- Focus trap in mobile menu
- Escape key closes both menus
- Inline `<script>` (~20 lines) manages toggle state and aria attributes

## Files Modified

- `src/components/NavBar.astro` — new markup, inline script, scoped styles
- `src/styles/global.css` — updated `.nav-bar` styles, add dropdown/mobile styles

## Non-Goals

- No sidebar nav or mega-menu
- No client-side framework (React, etc.)
- No new CSS files or external JS
