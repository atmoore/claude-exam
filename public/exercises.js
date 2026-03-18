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
    description: "After executing a tool, you must return the result in the correct format. Fill in the missing field.",
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
  const codeHtml = ex.code.map(line => {
    return line.replace(/\{\{(\d+)\}\}/g, (match, idx) => {
      const b = ex.blanks[Number(idx)];
      const val = b.prefilled || '';
      const width = Math.max(8, (b.accepted[0].length + 2)) + 'ch';
      return `<input class="blank-input" data-idx="${idx}" value="${escHtml(val)}" placeholder="___" style="width:${width}" autocomplete="off" spellcheck="false">`;
    });
  }).join('\n');

  // Add hint and correction elements below the code
  const blanksHtml = ex.blanks.map((b, i) =>
    `<div class="blank-feedback" id="feedback-${i}">` +
    `<span class="hint-text" id="hint-${i}">${escHtml(b.hint)}</span>` +
    `<span class="blank-correction" id="correction-${i}"></span>` +
    `</div>`
  ).join('');

  codeBlock.innerHTML = codeHtml + '\n' + blanksHtml;

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
      const correction = document.getElementById('correction-' + idx);
      if (correction) {
        correction.textContent = '\u2192 ' + b.accepted[0];
        correction.classList.add('show');
      }
    }
  });

  if (allCorrect) {
    scoreCorrect++;
    exerciseResult.textContent = 'Correct!';
    exerciseResult.className = 'exercise-result pass';
  } else {
    scoreWrong++;
    exerciseResult.textContent = 'Not quite \u2014 see corrections above.';
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
