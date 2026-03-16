# Visual Guide Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add interactive step-through SVG diagrams covering all 5 exam domains, integrated with existing flashcards.

**Architecture:** Shared `diagrams.js` module defines 5 SVG diagram functions. New `visual-guide.html` page renders full diagrams with step controls. Existing `index.html` flashcard backs get mini highlighted diagrams via `visualRef` fields on card data.

**Tech Stack:** Vanilla JS, inline SVG, CSS animations, localStorage

---

### Task 1: Create shared diagrams module with utilities

**Files:**
- Create: `public/diagrams.js`

**Step 1: Create `diagrams.js` with registry, colors, SVG helpers**

Core exports via `window.DiagramEngine`:
- `DIAGRAMS` — registry object
- `COLORS` — Anthropic brand palette (`#d97757` accent, `#141413` dark, `#faf9f5` bg)
- `svgEl(tag, attrs)` — create namespaced SVG element
- `createSvg(container, viewBox)` — create root SVG
- `drawNode(svg, {x, y, w, h, label, id, rx})` — rounded rect with centered text, `data-node-id`
- `drawArrow(svg, {x1, y1, x2, y2, label})` — line with arrowhead marker
- `addArrowDef(svg)` — add arrowhead marker definition
- `highlightNode(svg, nodeId)` — highlight one node (accent border + tinted fill), dim others
- `resetNodes(svg)` — restore all nodes to default style
- `initTooltips(container, diagramKey)` — hover tooltip div showing step description

**Step 2: Verify loads**

Run: `curl http://localhost:8081/diagrams.js` — returns JS.

**Step 3: Commit**

```bash
git add public/diagrams.js
git commit -m "feat: add shared SVG diagram engine module"
```

---

### Task 2: Add Agentic Loop diagram

**Files:**
- Modify: `public/diagrams.js`

**Step 1: Add `DIAGRAMS['agentic-loop']`**

5 steps with ids: `send`, `inspect`, `execute`, `append`, `loop`

Layout — rectangular flow:
```
[1. Send Request] ——→ [2. Inspect stop_reason] ——→ end_turn → done
                              ↓ tool_use
                       [3. Execute Tool(s)]
                              ↓
                       [4. Append Results]
                              ↓
[5. Loop / Finish] ←—————————┘
       ↑ continue
       └———→ back to [1. Send Request]
```

Step descriptions explain each phase of the agentic loop.

**Step 2: Commit**

```bash
git add public/diagrams.js
git commit -m "feat: add agentic loop diagram"
```

---

### Task 3: Add Multi-Agent Orchestration diagram

**Files:**
- Modify: `public/diagrams.js`

**Step 1: Add `DIAGRAMS['multi-agent']`**

5 steps: `query`, `coordinator`, `delegate`, `execute-sub`, `aggregate`

Layout — hub and spoke:
```
[User Query] → [Coordinator]
                  ↓  ↓  ↓  ↓
          [Research][Code][Review][Test]
                  ↓  ↓  ↓  ↓
              [Aggregate Results]
```

When highlighting `delegate` or `execute-sub`, highlight all subagent nodes.

**Step 2: Commit**

```bash
git add public/diagrams.js
git commit -m "feat: add multi-agent orchestration diagram"
```

---

### Task 4: Add Context Window diagram

**Files:**
- Modify: `public/diagrams.js`

**Step 1: Add `DIAGRAMS['context-window']`**

5 steps: `system`, `tools`, `history`, `cache`, `output`

Layout — horizontal stacked bar:
```
|  System 12%  |  Tools 15%  |  History 40%  | Cache 13% | Output 20% |
```

Title: "200K Context Window". Each segment colored. Active step full opacity + dark border, inactive steps 25% opacity.

**Step 2: Commit**

```bash
git add public/diagrams.js
git commit -m "feat: add context window management diagram"
```

---

### Task 5: Add Tool Design & MCP diagram

**Files:**
- Modify: `public/diagrams.js`

**Step 1: Add `DIAGRAMS['tool-mcp']`**

5 steps: `define`, `select`, `validate`, `execute-tool`, `return`

Layout — two regions:
```
┌─ YOUR CODE ─────────┐   ┌─ CLAUDE API ─────────┐
│ [1. Define Schema]   │──→│ [2. Claude Selects]   │
│ [3. Validate Input]  │←──│                       │
│ [5. Return result]   │←──┤                       │
└──────────────────────┘   └───────────────────────┘
                           ┌─ MCP SERVER ──────────┐
                     ────→ │ [4. Execute Tool]      │
                           └───────────────────────┘
```

**Step 2: Commit**

```bash
git add public/diagrams.js
git commit -m "feat: add tool design and MCP diagram"
```

---

### Task 6: Add Prompt Engineering diagram

**Files:**
- Modify: `public/diagrams.js`

**Step 1: Add `DIAGRAMS['prompt-engineering']`**

5 steps: `system-prompt`, `examples`, `cot`, `prefill`, `structured`

Layout — vertical layers:
```
┌──────── System Prompt ────────┐
              ↓
┌──────── Few-Shot Examples ────┐
              ↓
┌──────── Chain of Thought ─────┐
              ↓
┌──────── Assistant Prefill ────┐
              ↓
┌──────── Structured Output ────┐
```

Wide rounded rects, each with unique color. Active layer full color, others faded.

**Step 2: Commit**

```bash
git add public/diagrams.js
git commit -m "feat: add prompt engineering diagram"
```

---

### Task 7: Create Visual Guide page

**Files:**
- Create: `public/visual-guide.html`

**Step 1: Create full page with all 5 diagrams**

- Nav bar: Flashcards | **Visual Guide** (active) | Practice Exam
- Same Anthropic styling (Inter font, `#141413` nav, `#faf9f5` bg, `#d97757` accent)
- For each diagram in `DIAGRAMS`:
  - `<section>` with title, "Step N of 5" counter, description panel, SVG container
  - Controls: ◀ Prev | ▶ Next | ⏮ Reset
  - "Study related flashcards →" link to `/?domain=N`
- Loads `<script src="/diagrams.js"></script>`
- On load: iterate `DIAGRAMS`, create sections, render step 0
- Step state persisted to `localStorage('visual-guide-steps')`

**Step 2: Test all 5 diagrams render, step controls work**

Open: `http://localhost:8081/visual-guide.html`

**Step 3: Commit**

```bash
git add public/visual-guide.html
git commit -m "feat: add visual guide page with all 5 domain diagrams"
```

---

### Task 8: Update nav bar on flashcards page

**Files:**
- Modify: `public/index.html` (nav bar ~line 125-128)

**Step 1: Add Visual Guide link**

Between Flashcards and Practice Exam:
```html
<a href="/visual-guide.html">Visual Guide</a>
```

**Step 2: Add domain filter from URL query params**

On page load, read `?domain=N` and auto-set the domain filter.

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: add visual guide nav link and domain query param filter"
```

---

### Task 9: Add `visualRef` to flashcard data + mini diagrams on card backs

**Files:**
- Modify: `public/index.html`

**Step 1: Load `diagrams.js`**

Add `<script src="/diagrams.js"></script>` before the main script block.

**Step 2: Add `visualRef` to relevant cards**

Mapping:
- taskId `1.1` → `{ diagram: 'agentic-loop', step: 0-4 }`
- taskId `1.2`-`1.3` → `{ diagram: 'multi-agent', step: 0-4 }`
- taskId `2.x` → `{ diagram: 'context-window', step: 0-4 }`
- taskId `3.x` → `{ diagram: 'tool-mcp', step: 0-4 }`
- taskId `4.x` → `{ diagram: 'prompt-engineering', step: 0-4 }`

Only cards with a clear 1:1 step mapping get a ref.

**Step 3: Render mini diagram on card back**

When showing card back, if `card.visualRef` exists, append a mini diagram below the answer text with the relevant step highlighted.

**Step 4: Verify — flip a Domain 1 card, mini diagram appears**

**Step 5: Commit**

```bash
git add public/index.html
git commit -m "feat: integrate mini diagrams into flashcard backs"
```

---

### Task 10: Final integration test

**Step 1: Checklist**

1. Nav shows Flashcards | Visual Guide | Practice Exam on both pages
2. All 5 diagrams render on Visual Guide with working step controls
3. Hover tooltips appear on diagram nodes
4. "Study related flashcards →" links navigate + filter correctly
5. Mini diagrams appear on flashcard backs for mapped cards
6. Test at 375px width — scales for mobile/iPad

**Step 2: Fix any issues**

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: address integration test findings"
```
