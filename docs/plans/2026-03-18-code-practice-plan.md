# Code Practice Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/practice` page with interactive fill-in-the-blank and spot-the-bug code exercises for hands-on cert prep.

**Architecture:** New Astro page (`src/pages/practice.astro`) with styles and HTML. Separate data/logic file (`public/exercises.js`) containing exercise definitions and all interactivity. NavBar gets a new link. No external dependencies.

**Tech Stack:** Astro, vanilla JS, CSS

---

### Task 1: Add Practice Link to NavBar

**Files:**
- Modify: `src/components/NavBar.astro:40-43`

**Step 1: Add the nav link**

In `src/components/NavBar.astro`, after the Visual Guide link (line 41) and before the Course Catalog link (line 42), add:

```html
<a href={`${base}practice`} class:list={[{ active: active === 'practice' }]}>Practice</a>
```

The line order in `.nav-links` should be:
1. Study Guide dropdown
2. Flashcards
3. Visual Guide
4. **Practice** (new)
5. Course Catalog
6. Practice Exam ↗

**Step 2: Commit**

```bash
git add src/components/NavBar.astro
git commit -m "feat: add Practice link to nav bar"
```

---

### Task 2: Create Practice Page Skeleton

**Files:**
- Create: `src/pages/practice.astro`

**Step 1: Create the page with all CSS and HTML**

Create `src/pages/practice.astro` with the following content:

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="Anthropic Cert Prep – Code Practice" active="practice">
  <style is:global>
    .practice-controls {
      display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:16px;
    }
    .practice-controls select {
      font-family:'Inter',sans-serif; font-size:0.82rem; font-weight:500; padding:6px 16px;
      border:1px solid #d1cdc4; border-radius:999px; background:#fff; color:#141413;
      cursor:pointer; transition:all 0.15s;
    }
    .practice-controls select:hover { border-color:#d97757; color:#d97757; }

    .practice-progress { margin-bottom:16px; }
    .practice-bar { height:6px; background:#e8e6dc; border-radius:3px; overflow:hidden; }
    .practice-fill { height:100%; background:#d97757; transition:width 0.3s; }
    .practice-text { font-size:0.8rem; color:#87867f; margin-top:4px; text-align:center; }

    .practice-score {
      display:flex; justify-content:center; gap:20px; margin-bottom:16px;
      font-family:'Inter',sans-serif; font-size:0.85rem; font-weight:600;
    }
    .practice-score .score-correct { color:#27ae60; }
    .practice-score .score-wrong { color:#e74c3c; }
    .practice-score .score-pct { color:#141413; }

    .exercise-card {
      background:#fff; border-radius:16px; padding:28px 32px;
      border:1px solid rgba(20,20,19,0.1);
      box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
      margin-bottom:16px;
    }
    .exercise-header { margin-bottom:16px; }
    .exercise-tags { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
    .exercise-tag {
      font-size:0.7rem; font-weight:600; padding:3px 10px; border-radius:100px;
      text-transform:uppercase; letter-spacing:0.03em;
    }
    .exercise-tag-domain { background:#ebdbbc; color:#5e5d59; }
    .exercise-tag-fill { background:#bcd1ca; color:#2d4a42; }
    .exercise-tag-bug { background:#ebcece; color:#7a3030; }
    .exercise-title {
      font-family:'Source Serif 4',Georgia,serif; font-size:1.15rem;
      font-weight:600; color:#141413; margin:0 0 6px;
    }
    .exercise-desc {
      font-size:0.9rem; line-height:1.5; color:#5e5d59; margin:0;
    }

    .code-block {
      background:#1e1e1e; border-radius:10px; padding:16px; margin-bottom:16px;
      overflow-x:auto; font-family:'SF Mono','Fira Code','Consolas',monospace;
      font-size:0.85rem; line-height:1.7; color:#e0e0e0;
      white-space:pre;
    }
    .code-block .blank-input {
      font-family:'SF Mono','Fira Code','Consolas',monospace;
      font-size:0.85rem; color:#fff; background:transparent;
      border:none; border-bottom:2px solid #d97757;
      padding:1px 4px; outline:none; min-width:60px;
      transition:border-color 0.15s, background-color 0.15s;
    }
    .code-block .blank-input::placeholder { color:#666; }
    .code-block .blank-input:focus { border-bottom-color:#f0a080; }
    .code-block .blank-input.correct {
      border-bottom-color:#27ae60; background:rgba(39,174,96,0.15); color:#6ee7a0;
    }
    .code-block .blank-input.wrong {
      border-bottom-color:#e74c3c; background:rgba(231,76,60,0.15); color:#f0a0a0;
    }
    .blank-correction {
      display:none; font-family:'SF Mono','Fira Code','Consolas',monospace;
      font-size:0.78rem; color:#6ee7a0; margin-top:2px;
    }
    .blank-correction.show { display:block; }

    .exercise-actions {
      display:flex; gap:8px; justify-content:center; margin-bottom:16px;
    }
    .exercise-actions button {
      font-family:'Inter',sans-serif; font-size:0.82rem; font-weight:600;
      padding:8px 24px; border-radius:999px; cursor:pointer; transition:all 0.15s;
    }
    .btn-check {
      border:2px solid #d97757; background:#fff; color:#d97757;
    }
    .btn-check:hover:not(:disabled) { background:#d97757; color:#fff; }
    .btn-check:disabled { opacity:0.4; cursor:default; }
    .btn-hint {
      border:2px solid #d1cdc4; background:#fff; color:#87867f;
    }
    .btn-hint:hover { border-color:#b0aea5; color:#5e5d59; }
    .btn-next {
      border:2px solid #141413; background:#141413; color:#fff;
    }
    .btn-next:hover { background:#3d3d3a; }

    .hint-text {
      font-size:0.82rem; color:#d97757; font-style:italic;
      margin-top:4px; display:none;
    }
    .hint-text.show { display:block; }

    .exercise-result {
      text-align:center; font-family:'Inter',sans-serif; font-size:0.95rem;
      font-weight:600; margin-bottom:16px; display:none;
    }
    .exercise-result.pass { color:#27ae60; display:block; }
    .exercise-result.fail { color:#e74c3c; display:block; }

    .nav-buttons-practice {
      display:flex; gap:8px; justify-content:center; margin-bottom:16px;
    }
    .nav-buttons-practice button {
      font-family:'Inter',sans-serif; font-size:0.82rem; font-weight:500;
      padding:8px 18px; border:1px solid #d1cdc4; border-radius:999px;
      background:#fff; color:#3d3d3a; cursor:pointer; transition:all 0.15s;
    }
    .nav-buttons-practice button:hover { background:#f0eee6; border-color:#b0aea5; }

    .practice-empty {
      text-align:center; padding:60px 20px; color:#87867f;
      font-family:'Source Serif 4',Georgia,serif; font-size:0.95rem;
    }

    @media(max-width:600px){
      .exercise-card { padding:20px; }
      .code-block { font-size:0.78rem; padding:12px; }
    }
  </style>

  <div class="container">
    <h1>Code Practice</h1>

    <div class="practice-controls">
      <select id="domainFilter"><option value="all">All Domains</option></select>
      <select id="typeFilter">
        <option value="all">All Types</option>
        <option value="fill-blank">Fill in the Blank</option>
        <option value="spot-bug">Spot the Bug</option>
      </select>
    </div>

    <div class="practice-progress">
      <div class="practice-bar"><div class="practice-fill" id="progressFill"></div></div>
      <div class="practice-text" id="progressText">Exercise 0 of 0</div>
    </div>

    <div class="practice-score" id="scoreDisplay" style="display:none">
      <span class="score-correct">&#10003; <span id="scoreCorrect">0</span></span>
      <span class="score-wrong">&#10007; <span id="scoreWrong">0</span></span>
      <span class="score-pct"><span id="scorePct">0</span>%</span>
    </div>

    <div class="exercise-card" id="exerciseCard"></div>

    <div class="code-block" id="codeBlock"></div>

    <div class="exercise-result" id="exerciseResult"></div>

    <div class="exercise-actions" id="exerciseActions">
      <button class="btn-hint" id="btnHint" onclick="toggleHints()">Show Hints</button>
      <button class="btn-check" id="btnCheck" onclick="checkExercise()">Check</button>
    </div>

    <div class="nav-buttons-practice">
      <button onclick="prevExercise()">&#8592; Prev</button>
      <button onclick="nextExercise()">Next &#8594;</button>
    </div>

    <div class="practice-empty" id="emptyState" style="display:none">No exercises match your filters.</div>
  </div>

  <script is:inline src={`${import.meta.env.BASE_URL}exercises.js`}></script>
</Layout>
```

**Step 2: Commit**

```bash
git add src/pages/practice.astro
git commit -m "feat: create practice page with all HTML and CSS"
```

---

### Task 3: Create Exercise Data and Core Logic

**Files:**
- Create: `public/exercises.js`

**Step 1: Create the exercises data file with all logic**

Create `public/exercises.js`. This file contains:
1. The `EXERCISES` array with ~12 exercises
2. Filtering, rendering, validation, and keyboard logic

```javascript
const EXERCISES = [
  // ── Domain 1: Agentic Architecture & Orchestration ──
  {
    id: "agentic-loop-stop",
    type: "fill-blank",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Agentic Loop Termination",
    description: "Complete the agentic loop by filling in the correct stop_reason values.",
    code: [
      "while True:",
      "    response = client.messages.create(",
      "        model=\"claude-sonnet-4-20250514\",",
      "        messages=messages,",
      "        tools=tools",
      "    )",
      "    if response.stop_reason == \"{{0}}\":",
      "        break",
      "    elif response.stop_reason == \"{{1}}\":",
      "        result = execute_tool(response.content)",
      "        messages.append({\"role\": \"user\", \"content\": result})"
    ],
    blanks: [
      { accepted: ["end_turn"], hint: "What stop_reason means the agent is done?" },
      { accepted: ["tool_use"], hint: "What stop_reason means Claude wants to call a tool?" }
    ]
  },
  {
    id: "subagent-context",
    type: "fill-blank",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Subagent Context Isolation",
    description: "The coordinator must explicitly pass context to subagents. Fill in the missing parameter.",
    code: [
      "def run_subagent(task, coordinator_context):",
      "    response = client.messages.create(",
      "        model=\"claude-sonnet-4-20250514\",",
      "        system=\"You are a research subagent.\",",
      "        messages=[{",
      "            \"role\": \"user\",",
      "            \"content\": f\"Task: {task}\\nContext: {{{0}}}\"",
      "        }]",
      "    )",
      "    return response.content"
    ],
    blanks: [
      { accepted: ["coordinator_context"], hint: "What variable holds the context the coordinator needs to pass?" }
    ]
  },
  {
    id: "max-tokens-guard",
    type: "fill-blank",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Agentic Loop Safety Guard",
    description: "Add a safety mechanism to prevent infinite loops. Fill in the condition.",
    code: [
      "MAX_ITERATIONS = 10",
      "iterations = 0",
      "",
      "while True:",
      "    iterations += 1",
      "    if iterations > {{0}}:",
      "        raise Exception(\"Max iterations exceeded\")",
      "    response = client.messages.create(...)",
      "    if response.stop_reason == \"end_turn\":",
      "        break"
    ],
    blanks: [
      { accepted: ["max_iterations", "MAX_ITERATIONS"], hint: "What constant defines the maximum allowed iterations?" }
    ]
  },
  // ── Domain 2: Tool Design & MCP Integration ──
  {
    id: "tool-schema-type-bug",
    type: "spot-bug",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    title: "Tool Definition Schema Type",
    description: "This tool definition has a bug in the input_schema. Find and fix it.",
    code: [
      "tool = {",
      "    \"name\": \"get_weather\",",
      "    \"description\": \"Get current weather for a city\",",
      "    \"input_schema\": {",
      "        \"type\": \"{{0}}\",",
      "        \"properties\": {",
      "            \"city\": {\"type\": \"string\", \"description\": \"City name\"}",
      "        },",
      "        \"required\": [\"city\"]",
      "    }",
      "}"
    ],
    blanks: [
      { prefilled: "string", accepted: ["object"], hint: "What JSON Schema type describes an object with properties?" }
    ]
  },
  {
    id: "tool-result-format",
    type: "fill-blank",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    title: "Tool Result Message Format",
    description: "After executing a tool, you must return the result in the correct format. Fill in the missing fields.",
    code: [
      "tool_result = {",
      "    \"type\": \"tool_result\",",
      "    \"tool_use_id\": {{0}},",
      "    \"content\": result_text",
      "}"
    ],
    blanks: [
      { accepted: ["tool_use.id", "tool_call.id", "block.id", "response.id"], hint: "What ID links this result back to the original tool call?" }
    ]
  },
  // ── Domain 3: Claude Code Configuration & Workflows ──
  {
    id: "claude-md-structure",
    type: "fill-blank",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    title: "CLAUDE.md Project Instructions",
    description: "Complete the CLAUDE.md file that tells Claude Code how to work in this project.",
    code: [
      "# CLAUDE.md",
      "",
      "## Build & Test",
      "- Run tests: `{{0}}`",
      "- Build: `npm run build`",
      "",
      "## Code Style",
      "- Use TypeScript strict mode",
      "- Prefer functional components"
    ],
    blanks: [
      { accepted: ["npm test", "npm run test"], hint: "What's the standard npm command to run tests?" }
    ]
  },
  {
    id: "hooks-permission-bug",
    type: "spot-bug",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    title: "Claude Code Hook Configuration",
    description: "This hook config has a problem with when it runs. Fix the event name.",
    code: [
      "// .claude/settings.json",
      "{",
      "  \"hooks\": {",
      "    \"{{0}}\": [{",
      "      \"matcher\": \"Edit\",",
      "      \"command\": \"npm run lint --fix $FILE\"",
      "    }]",
      "  }",
      "}"
    ],
    blanks: [
      { prefilled: "before_tool_call", accepted: ["after_tool_call", "AfterToolCall"], hint: "Should linting run before or after a file is edited?" }
    ]
  },
  {
    id: "allowlist-pattern",
    type: "fill-blank",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    title: "Permission Allowlist",
    description: "Configure Claude Code to allow running tests without prompting.",
    code: [
      "// .claude/settings.json",
      "{",
      "  \"permissions\": {",
      "    \"allow\": [",
      "      \"{{0}}\"",
      "    ]",
      "  }",
      "}"
    ],
    blanks: [
      { accepted: ["Bash(npm test)", "Bash(npm run test)"], hint: "What format does Claude Code use for tool permissions? Tool(command)" }
    ]
  },
  // ── Domain 4: Prompt Engineering & Structured Output ──
  {
    id: "system-prompt-prefill",
    type: "fill-blank",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Assistant Prefill for JSON Output",
    description: "Use assistant prefill to force Claude to output valid JSON.",
    code: [
      "response = client.messages.create(",
      "    model=\"claude-sonnet-4-20250514\",",
      "    messages=[",
      "        {\"role\": \"user\", \"content\": \"List 3 colors as JSON\"},",
      "        {\"role\": \"{{0}}\", \"content\": \"{\"}",
      "    ]",
      ")"
    ],
    blanks: [
      { accepted: ["assistant"], hint: "Which role do you use for prefill — user or assistant?" }
    ]
  },
  {
    id: "structured-output-bug",
    type: "spot-bug",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Chain of Thought with Structured Output",
    description: "This prompt asks for structured output but has an issue with chain-of-thought ordering. Fix the tag name.",
    code: [
      "prompt = \"\"\"",
      "Analyze this customer feedback and classify the sentiment.",
      "",
      "First, think step by step in <{{0}}> tags.",
      "Then provide your answer in <answer> tags as JSON:",
      "{\"sentiment\": \"positive|negative|neutral\", \"confidence\": 0.0-1.0}",
      "\"\"\""
    ],
    blanks: [
      { prefilled: "answer", accepted: ["thinking", "reasoning", "analysis", "scratchpad"], hint: "CoT should go in a separate tag from the answer — what's it typically called?" }
    ]
  },
  {
    id: "tool-choice-force",
    type: "fill-blank",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Forcing a Specific Tool Call",
    description: "Configure the API request to force Claude to use a specific tool.",
    code: [
      "response = client.messages.create(",
      "    model=\"claude-sonnet-4-20250514\",",
      "    messages=messages,",
      "    tools=tools,",
      "    tool_choice={\"type\": \"{{0}}\", \"name\": \"get_weather\"}",
      ")"
    ],
    blanks: [
      { accepted: ["tool", "any"], hint: "What tool_choice type forces a specific named tool?" }
    ]
  },
  // ── Domain 5: Context Management & Reliability ──
  {
    id: "cache-control-breakpoint",
    type: "fill-blank",
    domain: 5,
    domainName: "Context Management & Reliability",
    title: "Prompt Caching Breakpoint",
    description: "Add a cache control breakpoint to cache the system prompt.",
    code: [
      "response = client.messages.create(",
      "    model=\"claude-sonnet-4-20250514\",",
      "    system=[{",
      "        \"type\": \"text\",",
      "        \"text\": long_system_prompt,",
      "        \"cache_control\": {\"type\": \"{{0}}\"}",
      "    }],",
      "    messages=messages",
      ")"
    ],
    blanks: [
      { accepted: ["ephemeral"], hint: "What cache_control type marks content for caching?" }
    ]
  }
];

// ── State ──
let filtered = [];
let exIdx = 0;
let checked = false;
let hintsShown = false;
let scoreCorrect = 0;
let scoreWrong = 0;

// ── DOM refs ──
const domainFilter = document.getElementById('domainFilter');
const typeFilter = document.getElementById('typeFilter');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const scoreDisplay = document.getElementById('scoreDisplay');
const exerciseCard = document.getElementById('exerciseCard');
const codeBlock = document.getElementById('codeBlock');
const exerciseResult = document.getElementById('exerciseResult');
const exerciseActions = document.getElementById('exerciseActions');
const btnCheck = document.getElementById('btnCheck');
const btnHint = document.getElementById('btnHint');
const emptyState = document.getElementById('emptyState');

// ── Populate domain dropdown ──
const domains = [...new Map(EXERCISES.map(e => [e.domain, e.domainName])).entries()].sort((a, b) => a[0] - b[0]);
domains.forEach(([id, name]) => {
  const o = document.createElement('option');
  o.value = id; o.textContent = `Domain ${id}: ${name}`;
  domainFilter.appendChild(o);
});

// ── Filtering ──
function applyFilters() {
  const d = domainFilter.value;
  const t = typeFilter.value;
  filtered = EXERCISES.filter(e => {
    if (d !== 'all' && e.domain !== Number(d)) return false;
    if (t !== 'all' && e.type !== t) return false;
    return true;
  });
  exIdx = 0;
  scoreCorrect = 0; scoreWrong = 0;
  scoreDisplay.style.display = 'none';
  render();
}

domainFilter.addEventListener('change', applyFilters);
typeFilter.addEventListener('change', applyFilters);

// ── Normalize answer for comparison ──
function normalize(s) {
  return s.trim().toLowerCase().replace(/^["']|["']$/g, '');
}

// ── Render ──
function render() {
  checked = false;
  hintsShown = false;
  exerciseResult.className = 'exercise-result';
  exerciseResult.textContent = '';
  btnCheck.disabled = false;
  btnHint.textContent = 'Show Hints';

  const total = filtered.length;
  if (total === 0) {
    exerciseCard.style.display = 'none';
    codeBlock.style.display = 'none';
    exerciseActions.style.display = 'none';
    emptyState.style.display = 'block';
    progressText.textContent = 'Exercise 0 of 0';
    progressFill.style.width = '0%';
    return;
  }

  exerciseCard.style.display = 'block';
  codeBlock.style.display = 'block';
  exerciseActions.style.display = 'flex';
  emptyState.style.display = 'none';

  const ex = filtered[exIdx];
  const typeBadge = ex.type === 'fill-blank'
    ? '<span class="exercise-tag exercise-tag-fill">Fill in the Blank</span>'
    : '<span class="exercise-tag exercise-tag-bug">Spot the Bug</span>';

  exerciseCard.innerHTML = `
    <div class="exercise-header">
      <div class="exercise-tags">
        <span class="exercise-tag exercise-tag-domain">Domain ${ex.domain}</span>
        ${typeBadge}
      </div>
      <h2 class="exercise-title">${ex.title}</h2>
      <p class="exercise-desc">${ex.description}</p>
    </div>
  `;

  // Build code block with inline inputs
  let blankIdx = 0;
  const codeHtml = ex.code.map(line => {
    return line.replace(/\{\{(\d+)\}\}/g, (match, idx) => {
      const b = ex.blanks[Number(idx)];
      const val = b.prefilled || '';
      const width = Math.max(8, (b.accepted[0].length + 2)) + 'ch';
      const hint = `<span class="hint-text" id="hint-${idx}">${escHtml(b.hint)}</span>`;
      return `<input class="blank-input" data-idx="${idx}" value="${escHtml(val)}" placeholder="___" style="width:${width}" autocomplete="off" spellcheck="false">${hint}`;
    });
  }).join('\n');

  codeBlock.innerHTML = codeHtml;

  // Focus first blank
  const firstInput = codeBlock.querySelector('.blank-input');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);

  progressFill.style.width = ((exIdx + 1) / total * 100) + '%';
  progressText.textContent = `Exercise ${exIdx + 1} of ${total}`;
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Check answers ──
function checkExercise() {
  if (checked) return;
  checked = true;
  btnCheck.disabled = true;

  const ex = filtered[exIdx];
  const inputs = codeBlock.querySelectorAll('.blank-input');
  let allCorrect = true;

  inputs.forEach(input => {
    const idx = Number(input.dataset.idx);
    const b = ex.blanks[idx];
    const userAnswer = normalize(input.value);
    const isCorrect = b.accepted.some(a => normalize(a) === userAnswer);

    input.classList.add(isCorrect ? 'correct' : 'wrong');
    input.readOnly = true;

    if (!isCorrect) {
      allCorrect = false;
      const correction = document.getElementById('hint-' + idx);
      if (correction) {
        correction.textContent = '→ ' + b.accepted[0];
        correction.classList.add('show');
        correction.style.color = '#6ee7a0';
      }
    }
  });

  if (allCorrect) {
    scoreCorrect++;
    exerciseResult.textContent = 'Correct!';
    exerciseResult.className = 'exercise-result pass';
  } else {
    scoreWrong++;
    exerciseResult.textContent = 'Not quite — see corrections above.';
    exerciseResult.className = 'exercise-result fail';
  }

  updateScore();
}

function updateScore() {
  const total = scoreCorrect + scoreWrong;
  scoreDisplay.style.display = total > 0 ? 'flex' : 'none';
  document.getElementById('scoreCorrect').textContent = scoreCorrect;
  document.getElementById('scoreWrong').textContent = scoreWrong;
  document.getElementById('scorePct').textContent = total > 0 ? Math.round(scoreCorrect / total * 100) : 0;
}

// ── Hints ──
function toggleHints() {
  hintsShown = !hintsShown;
  btnHint.textContent = hintsShown ? 'Hide Hints' : 'Show Hints';
  const ex = filtered[exIdx];
  ex.blanks.forEach((b, i) => {
    const el = document.getElementById('hint-' + i);
    if (el && !checked) {
      el.textContent = b.hint;
      el.style.color = '#d97757';
      el.classList.toggle('show', hintsShown);
    }
  });
}

// ── Navigation ──
function nextExercise() {
  if (filtered.length) { exIdx = (exIdx + 1) % filtered.length; render(); }
}
function prevExercise() {
  if (filtered.length) { exIdx = (exIdx - 1 + filtered.length) % filtered.length; render(); }
}

// ── Keyboard ──
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (e.target.classList.contains('blank-input')) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); checkExercise(); }
    if (e.key === 'Tab' && !e.shiftKey) {
      const inputs = [...codeBlock.querySelectorAll('.blank-input')];
      const curIdx = inputs.indexOf(e.target);
      if (curIdx < inputs.length - 1) { e.preventDefault(); inputs[curIdx + 1].focus(); }
    }
    return;
  }
  if (e.key === 'ArrowRight') nextExercise();
  else if (e.key === 'ArrowLeft') prevExercise();
});

// ── URL params ──
const urlParams = new URLSearchParams(window.location.search);
const domainParam = urlParams.get('domain');
if (domainParam && !isNaN(Number(domainParam))) domainFilter.value = domainParam;

// ── Init ──
applyFilters();
```

**Step 2: Commit**

```bash
git add public/exercises.js
git commit -m "feat: add exercise data and practice page logic"
```

---

### Task 4: Build Check and Manual Testing

**Step 1: Build**

Run: `npm run build`
Expected: Clean build, 11 pages (was 10, now includes `/practice`)

**Step 2: Manual test matrix**

Run `npm run dev` and verify:

| Test | Expected |
|------|----------|
| Nav shows "Practice" link | Link between Visual Guide and Course Catalog |
| `/practice` loads | Shows exercises with domain filter |
| Fill-in-the-blank: type correct answer | Input turns green on Check |
| Fill-in-the-blank: type wrong answer | Input turns red, correction shown |
| Spot-the-bug: has prefilled value | Input shows buggy value |
| Spot-the-bug: replace with fix | Green on Check |
| Show Hints button | Hints appear below blanks |
| Cmd/Ctrl+Enter | Submits answers |
| Tab between blanks | Focus moves to next blank |
| ArrowRight/Left | Navigate exercises |
| Domain filter | Filters exercises by domain |
| Type filter | Filters by fill-blank or spot-bug |
| Score updates | Correct/wrong counts update |
| Mobile (<600px) | Code block scrolls, card compresses |

**Step 3: Fix any issues found**

**Step 4: Commit fixes**

```bash
git add src/pages/practice.astro public/exercises.js
git commit -m "fix: practice page edge cases"
```

---

### Task 5: Final Build Verification

**Step 1: Clean build**

Run: `npm run build`
Expected: 11 pages, no errors, no warnings.
