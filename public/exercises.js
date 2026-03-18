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
  },
  // ── Rec 1: Error handling in agentic loop ──
  {
    id: "error-handling-loop",
    type: "fill-blank",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Tool Error Handling in Agentic Loop",
    description: "When a tool execution fails, return an error result so Claude can recover. Fill in the missing fields.",
    code: [
      "try:",
      "    result = execute_tool(tool_name, tool_input)",
      "except Exception as e:",
      "    result = {",
      "        \"type\": \"tool_result\",",
      "        \"tool_use_id\": tool_use_id,",
      "        \"is_error\": {{0}},",
      "        \"content\": str(e)",
      "    }"
    ],
    blanks: [
      { accepted: ["true", "True"], hint: "What boolean flag tells Claude this tool result is an error?" }
    ]
  },
  {
    id: "session-management",
    type: "fill-blank",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Conversation Session Management",
    description: "Append the assistant's response to conversation history before the next iteration.",
    code: [
      "while True:",
      "    response = client.messages.create(",
      "        model=\"claude-sonnet-4-20250514\",",
      "        messages=messages, tools=tools",
      "    )",
      "    # Append assistant response to history",
      "    messages.append({\"role\": \"{{0}}\", \"content\": response.content})",
      "    if response.stop_reason == \"end_turn\":",
      "        break",
      "    # Execute tools and append results...",
    ],
    blanks: [
      { accepted: ["assistant"], hint: "What role does the model's response have in conversation history?" }
    ]
  },
  // ── Rec 2: Claude Code config gaps ──
  {
    id: "rules-file-path",
    type: "fill-blank",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    title: "Path-Specific Rules",
    description: "Create a rules file that applies only to test files.",
    code: [
      "# File: .claude/rules/{{0}}",
      "",
      "Always use descriptive test names.",
      "Prefer integration tests over unit tests.",
      "Never mock the database."
    ],
    blanks: [
      { accepted: ["tests", "test", "tests.md", "test.md", "testing", "testing.md"], hint: "What should the rules file be named to target test files?" }
    ]
  },
  {
    id: "skill-frontmatter",
    type: "fill-blank",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    title: "Custom Skill Frontmatter",
    description: "Define a custom skill that runs in an isolated context and can only use specific tools.",
    code: [
      "---",
      "name: deploy",
      "description: Deploy the application to production",
      "context: {{0}}",
      "allowed-tools: Bash, Read",
      "---",
      "",
      "Run the deploy script and verify health checks pass."
    ],
    blanks: [
      { accepted: ["fork"], hint: "What context mode gives the skill an isolated copy of conversation?" }
    ]
  },
  {
    id: "mcp-server-config",
    type: "fill-blank",
    domain: 3,
    domainName: "Claude Code Configuration & Workflows",
    title: "MCP Server Configuration",
    description: "Add an MCP server to Claude Code's project settings.",
    code: [
      "// .claude/settings.json",
      "{",
      "  \"mcpServers\": {",
      "    \"my-db\": {",
      "      \"command\": \"npx\",",
      "      \"args\": [\"-y\", \"@modelcontextprotocol/server-postgres\"],",
      "      \"env\": {",
      "        \"{{0}}\": \"postgresql://localhost:5432/mydb\"",
      "      }",
      "    }",
      "  }",
      "}"
    ],
    blanks: [
      { accepted: ["DATABASE_URL", "POSTGRES_URL", "CONNECTION_STRING", "DB_URL"], hint: "What environment variable typically holds the database connection string?" }
    ]
  },
  // ── Rec 3: MCP tool differentiation and structured errors ──
  {
    id: "tool-required-fields",
    type: "fill-blank",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    title: "Tool Required Parameters",
    description: "Mark the 'city' parameter as required in this tool's JSON Schema.",
    code: [
      "tool = {",
      "    \"name\": \"get_weather\",",
      "    \"description\": \"Get weather for a city\",",
      "    \"input_schema\": {",
      "        \"type\": \"object\",",
      "        \"properties\": {",
      "            \"city\": {\"type\": \"string\"},",
      "            \"units\": {\"type\": \"string\"}",
      "        },",
      "        \"{{0}}\": [\"city\"]",
      "    }",
      "}"
    ],
    blanks: [
      { accepted: ["required"], hint: "What JSON Schema keyword lists mandatory parameters?" }
    ]
  },
  {
    id: "structured-error-response",
    type: "fill-blank",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    title: "Structured Tool Error Response",
    description: "Return a structured error so the agent can decide whether to retry.",
    code: [
      "def handle_tool_error(error, tool_name):",
      "    return {",
      "        \"error\": str(error),",
      "        \"error_category\": \"rate_limit\",",
      "        \"{{0}}\": True,",
      "        \"suggestion\": \"Wait 5 seconds and retry\"",
      "    }"
    ],
    blanks: [
      { accepted: ["retryable", "is_retryable", "retry", "can_retry"], hint: "What flag tells the agent this error can be retried?" }
    ]
  },
  // ── Rec 4: Validation-retry and batch processing ──
  {
    id: "validation-retry-loop",
    type: "fill-blank",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Validation-Retry Loop",
    description: "Implement a retry loop that re-prompts Claude when JSON validation fails.",
    code: [
      "for attempt in range(3):",
      "    response = client.messages.create(",
      "        model=\"claude-sonnet-4-20250514\",",
      "        messages=messages, tools=tools,",
      "        tool_choice={\"type\": \"tool\", \"name\": \"extract_data\"}",
      "    )",
      "    data = parse_tool_result(response)",
      "    errors = validate(data, schema)",
      "    if not errors:",
      "        break",
      "    messages.append({\"role\": \"assistant\", \"content\": response.content})",
      "    messages.append({\"role\": \"{{0}}\", \"content\": f\"Validation failed: {errors}. Please fix.\"})"
    ],
    blanks: [
      { accepted: ["user"], hint: "What role sends the validation feedback back to Claude?" }
    ]
  },
  {
    id: "batch-api-request",
    type: "fill-blank",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Message Batches API",
    description: "Submit multiple requests as a batch for async processing at lower cost.",
    code: [
      "batch = client.messages.batches.create(",
      "    requests=[",
      "        {",
      "            \"custom_id\": \"item-001\",",
      "            \"params\": {",
      "                \"model\": \"claude-sonnet-4-20250514\",",
      "                \"max_tokens\": 1024,",
      "                \"messages\": [{\"role\": \"{{0}}\", \"content\": text}]",
      "            }",
      "        }",
      "        for text in documents",
      "    ]",
      ")"
    ],
    blanks: [
      { accepted: ["user"], hint: "What role initiates a conversation in the Messages API?" }
    ]
  },
  // ── Rec 5: Few-shot and multi-pass review ──
  {
    id: "few-shot-example",
    type: "fill-blank",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Few-Shot Example Format",
    description: "Add a few-shot example using the correct message roles to teach Claude a classification pattern.",
    code: [
      "messages = [",
      "    {\"role\": \"user\", \"content\": \"Classify: 'The product broke after one day'\"},",
      "    {\"role\": \"{{0}}\", \"content\": '{\"sentiment\": \"negative\", \"topic\": \"quality\"}'},",
      "    {\"role\": \"user\", \"content\": \"Classify: 'Amazing customer service!'\"},",
      "    {\"role\": \"{{1}}\", \"content\": '{\"sentiment\": \"positive\", \"topic\": \"support\"}'},",
      "    {\"role\": \"user\", \"content\": f\"Classify: '{new_input}'\"}",
      "]"
    ],
    blanks: [
      { accepted: ["assistant"], hint: "What role provides the example output?" },
      { accepted: ["assistant"], hint: "Same role for the second example output." }
    ]
  },
  {
    id: "multi-pass-review-bug",
    type: "spot-bug",
    domain: 4,
    domainName: "Prompt Engineering & Structured Output",
    title: "Multi-Pass Code Review Architecture",
    description: "This multi-pass review sends the full file to each reviewer, but the second pass should see the first pass results. Fix the input.",
    code: [
      "# Pass 1: Security review",
      "security_results = review(code, \"Check for security issues\")",
      "",
      "# Pass 2: Logic review (should build on pass 1)",
      "logic_results = review({{0}}, \"Check for logic errors\")"
    ],
    blanks: [
      { prefilled: "code", accepted: ["code + security_results", "code + \"\\n\" + security_results", "f\"{code}\\n{security_results}\"", "code, security_results"], hint: "Pass 2 should see both the original code AND the security findings." }
    ]
  },
  // ── Rec 6: Context management gaps ──
  {
    id: "structured-extraction",
    type: "fill-blank",
    domain: 5,
    domainName: "Context Management & Reliability",
    title: "Extracting Structured Facts from Tool Output",
    description: "Instead of passing raw verbose output, extract only the key facts before adding to context.",
    code: [
      "raw_output = run_tool(\"search_logs\", query)",
      "",
      "# Extract structured summary instead of raw output",
      "summary = client.messages.create(",
      "    model=\"claude-haiku-4-5-20251001\",",
      "    messages=[{\"role\": \"user\", \"content\":",
      "        f\"Extract key facts as JSON from this log output:\\n{raw_output}\"",
      "    }],",
      "    max_tokens={{0}}",
      ")"
    ],
    blanks: [
      { accepted: ["256", "512", "200", "300", "400", "1024"], hint: "Use a small max_tokens to force concise extraction." }
    ]
  },
  {
    id: "scratchpad-pattern",
    type: "fill-blank",
    domain: 5,
    domainName: "Context Management & Reliability",
    title: "Scratchpad File for Long Sessions",
    description: "Use a scratchpad file to persist findings across a long agentic session without filling the context window.",
    code: [
      "SCRATCHPAD = \"{{0}}\"",
      "",
      "def save_finding(finding):",
      "    with open(SCRATCHPAD, \"a\") as f:",
      "        f.write(finding + \"\\n\")",
      "",
      "def get_findings():",
      "    with open(SCRATCHPAD, \"r\") as f:",
      "        return f.read()"
    ],
    blanks: [
      { accepted: ["scratchpad.md", "scratchpad.txt", "notes.md", ".scratchpad", "findings.md"], hint: "What file name would you use for a temporary scratchpad?" }
    ]
  },
  {
    id: "subagent-delegation",
    type: "fill-blank",
    domain: 5,
    domainName: "Context Management & Reliability",
    title: "Subagent Delegation for Context Limits",
    description: "Delegate a large file analysis to a subagent to avoid filling the coordinator's context.",
    code: [
      "def analyze_large_file(file_path):",
      "    \"\"\"Delegate to subagent — keeps coordinator context clean.\"\"\"",
      "    return client.messages.create(",
      "        model=\"claude-sonnet-4-20250514\",",
      "        max_tokens=1024,",
      "        system=\"Analyze this file and return a {{0}}-sentence summary.\",",
      "        messages=[{\"role\": \"user\", \"content\": read_file(file_path)}]",
      "    ).content"
    ],
    blanks: [
      { accepted: ["3", "5", "2", "4", "brief", "short", "concise"], hint: "Constrain the subagent's output length to keep the coordinator's context small." }
    ]
  },
  // ── Rec 7: Escalation and human-in-the-loop ──
  {
    id: "confidence-routing",
    type: "fill-blank",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Confidence-Based Escalation Routing",
    description: "Route to human review when the agent's confidence is below a threshold.",
    code: [
      "result = agent.process(request)",
      "",
      "if result.confidence < {{0}}:",
      "    escalate_to_human(",
      "        request=request,",
      "        reason=\"Low confidence\",",
      "        agent_draft=result.response",
      "    )",
      "else:",
      "    send_response(result.response)"
    ],
    blanks: [
      { accepted: ["0.8", "0.7", "0.9", "0.75", "0.85"], hint: "What confidence threshold should trigger human review?" }
    ]
  },
  {
    id: "escalation-conditions-bug",
    type: "spot-bug",
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Escalation Conditions",
    description: "This escalation check is missing a critical condition. The agent should also escalate when it can't make progress after multiple attempts.",
    code: [
      "def should_escalate(context):",
      "    if context.policy_gap_detected:",
      "        return True",
      "    if context.customer_requests_human:",
      "        return True",
      "    if context.{{0}} > MAX_RETRIES:",
      "        return True",
      "    return False"
    ],
    blanks: [
      { prefilled: "message_count", accepted: ["failed_attempts", "retry_count", "attempts", "failures", "consecutive_failures"], hint: "What should we count — total messages or failed attempts to make progress?" }
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
      const width = Math.min(40, Math.max(8, (b.accepted[0].length + 2))) + 'ch';
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
    // Persist completed exercise for readiness tracking
    const completed = JSON.parse(localStorage.getItem('readiness-exercises') || '[]');
    if (!completed.includes(ex.id)) {
      completed.push(ex.id);
      localStorage.setItem('readiness-exercises', JSON.stringify(completed));
    }
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
