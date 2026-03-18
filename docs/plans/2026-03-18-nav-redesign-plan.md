# Nav Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the nav bar with mobile hamburger menu, Study Guide dropdown, grad cap icon, and visual polish.

**Architecture:** Single Astro component (`NavBar.astro`) with inline `<script>` for toggle/dropdown state management. All styles in `global.css`. No external JS or frameworks.

**Tech Stack:** Astro, vanilla JS, CSS

---

### Task 1: Add grad cap SVG and update brand markup

**Files:**
- Modify: `src/components/NavBar.astro`

**Step 1: Update NavBar.astro with grad cap SVG and hamburger button**

Replace the entire content of `src/components/NavBar.astro` with:

```astro
---
const { active } = Astro.props;
const base = import.meta.env.BASE_URL;
const PRACTICE_EXAM_URL = 'https://anthropic.skilljar.com/anthropic-certification-practice-exam/425721/scorm/17p1a5iqsma8x';
const domains = [
  { num: 1, title: 'Agentic Architecture & Orchestration', href: `${base}study-guide/domain1` },
  { num: 2, title: 'Tool Design & MCP Integration', href: `${base}study-guide/domain2` },
  { num: 3, title: 'Claude Code Configuration & Workflows', href: `${base}study-guide/domain3` },
  { num: 4, title: 'Prompt Engineering & Structured Output', href: `${base}study-guide/domain4` },
  { num: 5, title: 'Context Management & Reliability', href: `${base}study-guide/domain5` },
];
---
<nav class="nav-bar">
  <a href={`${base}`} class="brand">
    <svg class="brand-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
    </svg>
    <span class="brand-full">ANTHROPIC CERT PREP</span>
    <span class="brand-short">CERT PREP</span>
  </a>

  <div class="nav-links" id="nav-links">
    <div class="nav-dropdown">
      <button
        class:list={["nav-dropdown-trigger", { active: active === 'study-guide' }]}
        aria-expanded="false"
        aria-haspopup="true"
        id="study-guide-trigger"
      >
        Study Guide <span class="dropdown-arrow">▾</span>
      </button>
      <div class="nav-dropdown-menu" id="study-guide-menu">
        <a href={`${base}study-guide`} class="dropdown-item">All Domains</a>
        {domains.map(d => (
          <a href={d.href} class="dropdown-item">D{d.num}: {d.title}</a>
        ))}
      </div>
    </div>
    <a href={`${base}flashcards`} class:list={[{ active: active === 'flashcards' }]}>Flashcards</a>
    <a href={`${base}visual-guide`} class:list={[{ active: active === 'visual-guide' }]}>Visual Guide</a>
    <a href={`${base}course-catalog`} class:list={[{ active: active === 'course-catalog' }]}>Course Catalog</a>
    <a href={PRACTICE_EXAM_URL} target="_blank" rel="noopener" class="nav-external">Practice Exam ↗</a>
  </div>

  <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>

<script>
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const sgTrigger = document.getElementById('study-guide-trigger');
  const sgMenu = document.getElementById('study-guide-menu');

  hamburger?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  sgTrigger?.addEventListener('click', () => {
    const open = sgMenu?.classList.toggle('open');
    sgTrigger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!sgTrigger?.contains(e.target as Node) && !sgMenu?.contains(e.target as Node)) {
      sgMenu?.classList.remove('open');
      sgTrigger?.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      sgMenu?.classList.remove('open');
      sgTrigger?.setAttribute('aria-expanded', 'false');
      navLinks?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    }
  });
</script>
```

**Step 2: Verify the file saved correctly**

Run: `cat src/components/NavBar.astro | head -5`
Expected: Should show the frontmatter with `const { active } = Astro.props;`

**Step 3: Commit**

```bash
git add src/components/NavBar.astro
git commit -m "feat(nav): add grad cap icon, dropdown, and hamburger markup"
```

---

### Task 2: Update CSS for desktop nav, dropdown, and brand

**Files:**
- Modify: `src/styles/global.css` (lines around `.nav-bar` block, approximately lines 4–12)

**Step 1: Replace existing `.nav-bar` styles with new styles**

Find the existing `.nav-bar` block (lines 4–12 of `global.css`) and replace it with:

```css
/* ── Nav Bar ── */
.nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: #141413; padding: 10px 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-bar .brand {
  display: flex; align-items: center; gap: 8px;
  color: #faf9f5; font-weight: 700; font-size: 0.85rem;
  letter-spacing: 0.05em; text-decoration: none;
}
.nav-bar .brand-icon { flex-shrink: 0; }
.nav-bar .brand-short { display: none; }

.nav-links {
  display: flex; align-items: center; gap: 28px;
}
.nav-bar a, .nav-dropdown-trigger {
  color: #87867f; font-size: 0.85rem; font-weight: 500;
  text-decoration: none; padding-bottom: 2px; transition: color 0.15s;
  background: none; border: none; cursor: pointer; font-family: inherit;
}
.nav-bar a.active, .nav-dropdown-trigger.active {
  color: #d97757; font-weight: 600; border-bottom: 2px solid #d97757;
}
.nav-bar a:hover, .nav-dropdown-trigger:hover { color: #b0aea5; }

.nav-external {
  border: 1px solid #3a3a37; border-radius: 999px;
  padding: 4px 12px !important; font-size: 0.8rem !important;
}

/* ── Dropdown ── */
.nav-dropdown { position: relative; }
.dropdown-arrow { font-size: 0.7rem; margin-left: 2px; }
.nav-dropdown-menu {
  display: none; position: absolute; top: calc(100% + 8px); left: 0;
  background: #1c1c1b; border-radius: 8px; padding: 6px 0;
  min-width: 280px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.nav-dropdown-menu.open { display: block; }
.dropdown-item {
  display: block; padding: 8px 16px; color: #87867f !important;
  font-size: 0.83rem; white-space: nowrap;
}
.dropdown-item:hover { background: #252524; color: #faf9f5 !important; }

/* ── Hamburger ── */
.hamburger {
  display: none; background: none; border: none; cursor: pointer;
  padding: 4px; flex-direction: column; gap: 5px;
}
.hamburger span {
  display: block; width: 22px; height: 2px; background: #faf9f5;
  transition: transform 0.15s, opacity 0.15s;
}
```

**Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(nav): add desktop dropdown, brand, and pill styles"
```

---

### Task 3: Add mobile responsive CSS

**Files:**
- Modify: `src/styles/global.css` (append after the hamburger styles from Task 2)

**Step 1: Add mobile media query**

Append this immediately after the hamburger styles added in Task 2:

```css
/* ── Mobile ── */
@media (max-width: 768px) {
  .nav-bar .brand-full { display: none; }
  .nav-bar .brand-short { display: inline; }

  .hamburger { display: flex; }

  .nav-links {
    display: none; flex-direction: column; align-items: stretch; gap: 0;
    position: absolute; top: 100%; left: 0; right: 0;
    background: #1c1c1b; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .nav-links.open { display: flex; }
  .nav-links > a, .nav-dropdown { padding: 12px 24px; }
  .nav-links > a { display: block; }

  .nav-dropdown-trigger { width: 100%; text-align: left; padding: 12px 24px; }
  .nav-dropdown-menu {
    position: static; box-shadow: none; background: #252524;
    border-radius: 0; min-width: auto;
  }
  .nav-dropdown-menu .dropdown-item { padding-left: 40px; }

  .nav-external { border: none; border-radius: 0; padding: 12px 24px !important; }
}
```

**Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(nav): add mobile hamburger responsive styles"
```

---

### Task 4: Manual smoke test

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test desktop**

- Verify grad cap icon appears next to brand text
- Click "Study Guide ▾" — dropdown should appear with All Domains + 5 domain links
- Click outside dropdown — should close
- Press Escape — should close
- Verify Practice Exam has pill/outlined style
- Verify active page highlighting works

**Step 3: Test mobile (resize browser to ≤768px)**

- Brand should show "CERT PREP" (not full text)
- Hamburger icon should appear
- Click hamburger — menu slides down
- Click "Study Guide ▾" in mobile menu — domains expand inline
- Click a link — navigates and menu closes
- Press Escape — menu closes

**Step 4: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(nav): address smoke test findings"
```
