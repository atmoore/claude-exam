const ALL_CARDS = [
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "front": "What are the three stages of the agentic loop lifecycle when using the Claude API?",
    "back": "1) Send a request to Claude with tools and conversation history. 2) Inspect the response's stop_reason: if \"tool_use\", execute the requested tool(s); if \"end_turn\", the agent is done. 3) Append tool results to conversation history and send back for the next iteration. The loop continues until Claude returns stop_reason=\"end_turn\".",
    "visualRef": { "diagram": "agentic-loop", "step": 0 }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "front": "Why must tool results be appended to conversation history between agentic loop iterations?",
    "back": "The model needs the results of previous tool calls in its context to reason about what to do next. Without appending tool results, the model has no visibility into what happened and cannot make informed decisions about subsequent actions. Each iteration builds on the accumulated context of prior tool outputs.",
    "visualRef": { "diagram": "agentic-loop", "step": 3 }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "front": "What distinguishes model-driven decision-making from pre-configured decision trees in agentic systems?",
    "back": "Model-driven decision-making means Claude reasons about which tool to call next based on context, conversation history, and tool results. Pre-configured decision trees or fixed tool sequences are deterministic pipelines where the developer hardcodes the order of operations. The agentic approach lets Claude adapt dynamically, while decision trees are rigid and can't respond to unexpected situations.",
    "visualRef": { "diagram": "agentic-loop", "step": 1 }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "visualRef": { "diagram": "agentic-loop", "step": 4 },
    "front": "What are three anti-patterns for determining when an agentic loop should stop?",
    "back": "1) Parsing natural language signals (e.g., checking if the assistant said \"I'm done\") — unreliable and fragile. 2) Setting arbitrary iteration caps as the PRIMARY stopping mechanism — the model may need more or fewer iterations. 3) Checking for assistant text content as a completion indicator. The correct approach: check stop_reason==\"end_turn\" to terminate, continue when stop_reason==\"tool_use\"."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 1 },
    "front": "In a hub-and-spoke multi-agent architecture, what is the coordinator agent responsible for?",
    "back": "The coordinator manages ALL inter-subagent communication, error handling, and information routing. It handles task decomposition (breaking the query into subtasks), delegation (choosing which subagents to invoke), result aggregation, and deciding which subagents to invoke based on query complexity. Subagents never communicate directly with each other — everything flows through the coordinator."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 2 },
    "front": "Do subagents automatically inherit the coordinator's conversation history?",
    "back": "No. Subagents operate with isolated context. They do NOT automatically inherit the coordinator's conversation history or share memory between invocations. Any context a subagent needs must be explicitly provided in its prompt. This is a key architectural constraint that developers must account for when designing multi-agent systems."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 2 },
    "front": "What risk arises from overly narrow task decomposition by a coordinator agent?",
    "back": "Overly narrow decomposition leads to incomplete coverage of broad research topics. Example from the exam: a coordinator researching \"impact of AI on creative industries\" decomposed it into only visual arts subtasks (digital art, graphic design, photography), completely missing music, writing, and film. The subagents executed correctly within their assigned scope — the problem was what they were assigned. The coordinator must decompose broadly enough to cover the full topic."
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 1 },
    "front": "How should a coordinator agent decide which subagents to invoke — always use the full pipeline, or selectively?",
    "back": "The coordinator should analyze query requirements and dynamically select which subagents to invoke, NOT always route through the full pipeline. For simple queries, invoking all subagents wastes resources. The coordinator should assess complexity and only invoke the subagents needed. Additionally, it should partition research scope across subagents to minimize duplication (e.g., assign distinct subtopics or source types to each)."
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 4 },
    "front": "What is an iterative refinement loop in multi-agent orchestration?",
    "back": "The coordinator evaluates synthesis output for gaps, then re-delegates to search and analysis subagents with targeted queries, and re-invokes synthesis until coverage is sufficient. This ensures quality by letting the coordinator check if the output meets requirements before finalizing. All subagent communication routes through the coordinator for observability and consistent error handling."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.3",
    "visualRef": { "diagram": "multi-agent", "step": 2 },
    "front": "What is the Task tool in the Claude Agent SDK, and what configuration is required for a coordinator to use it?",
    "back": "The Task tool is the mechanism for spawning subagents. For a coordinator to invoke subagents, its allowedTools configuration must include \"Task\". Without this, the coordinator cannot create subagent instances. Each subagent is defined via AgentDefinition with descriptions, system prompts, and tool restrictions."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.3",
    "visualRef": { "diagram": "multi-agent", "step": 3 },
    "front": "What is fork-based session management and when would you use it?",
    "back": "fork_session creates independent branches from a shared analysis baseline to explore divergent approaches. Use it when you want to compare two different strategies (e.g., two testing approaches or refactoring approaches) starting from the same codebase analysis. Each fork operates independently without affecting the other branches."
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.3",
    "visualRef": { "diagram": "multi-agent", "step": 4 },
    "front": "How should context be passed between agents in a multi-agent system?",
    "back": "1) Include complete findings from prior agents directly in the subagent's prompt (e.g., pass web search results to the synthesis subagent). 2) Use structured data formats to separate content from metadata (source URLs, document names, page numbers) to preserve attribution. 3) Spawn parallel subagents by emitting multiple Task tool calls in a single coordinator response (not across separate turns). 4) Coordinator prompts should specify research goals and quality criteria, NOT step-by-step procedures, to enable subagent adaptability."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.4",
    "front": "When should you use programmatic enforcement (hooks/gates) vs. prompt-based guidance for workflow ordering?",
    "back": "Use programmatic enforcement when deterministic compliance is required — especially for operations with financial or security consequences. Prompt instructions alone have a non-zero failure rate. Example: identity verification MUST happen before processing refunds. A programmatic prerequisite blocks process_refund until get_customer returns a verified customer ID. Prompt-based guidance is only appropriate when occasional non-compliance is acceptable."
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.4",
    "front": "What should a structured handoff summary include when escalating to a human agent?",
    "back": "Customer ID, root cause analysis, refund amount (or relevant transaction details), and recommended action. This is essential because human agents lack access to the conversation transcript. The handoff must be self-contained with all relevant context. For multi-concern requests, decompose into distinct items, investigate each in parallel using shared context, then synthesize a unified resolution."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.5",
    "front": "What are the two main hook patterns in the Claude Agent SDK, and what does each do?",
    "back": "1) PostToolUse hooks: intercept tool RESULTS for transformation before the model processes them. Use case: normalizing heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes) from different MCP tools. 2) Tool call interception hooks: intercept OUTGOING tool calls to enforce compliance rules. Use case: blocking refunds above $500 and redirecting to human escalation. Hooks provide deterministic guarantees that prompt instructions cannot."
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.5",
    "front": "When should you choose hooks over prompt-based enforcement for business rules?",
    "back": "Choose hooks when business rules require GUARANTEED compliance. Prompt-based instructions are probabilistic — the model might not follow them 100% of the time. For example, if policy says refunds over $500 must go to a human, a hook that intercepts the process_refund tool call and checks the amount provides a deterministic guarantee. A prompt saying \"don't process refunds over $500\" will occasionally be violated."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.6",
    "front": "When should you use prompt chaining (fixed sequential pipeline) vs. dynamic adaptive decomposition?",
    "back": "Prompt chaining: use for predictable, multi-aspect reviews where the steps are known upfront (e.g., analyze each file individually, then run cross-file integration). Dynamic adaptive decomposition: use for open-ended investigation tasks where subtasks depend on what is discovered at each step (e.g., \"add comprehensive tests to a legacy codebase\" — first map structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered)."
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.6",
    "front": "How should you structure a code review of a large PR to avoid attention dilution?",
    "back": "Split into focused passes: 1) Per-file local analysis — analyze each file individually for local issues (ensures consistent depth). 2) Cross-file integration pass — examine cross-file data flow, consistency, and contradictions separately. A single pass analyzing all files together produces inconsistent results: detailed feedback for some files, superficial for others, missed bugs, and contradictory feedback. Larger context windows do NOT solve attention quality issues."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.7",
    "front": "What is the difference between --resume <session-name> and fork_session in Claude Code?",
    "back": "--resume <session-name>: continues a specific prior conversation by name. Use when prior context is mostly still valid. Important: if files have changed since the session, inform the agent about specific changes for targeted re-analysis. fork_session: creates an independent branch from a shared analysis baseline to explore divergent approaches (e.g., comparing two refactoring strategies). Each fork is independent."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.7",
    "front": "When is starting a new session with a structured summary more reliable than resuming an old session?",
    "back": "When prior tool results are stale. Resumed sessions may contain outdated file contents, old search results, or analysis based on code that has changed. Starting fresh with an injected summary of key findings is more reliable because it avoids the model reasoning over stale data. When resuming IS appropriate, inform the agent about specific file changes rather than requiring full re-exploration."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.1",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "Why do minimal tool descriptions lead to unreliable tool selection by LLMs?",
    "back": "Tool descriptions are the PRIMARY mechanism LLMs use for tool selection. Minimal descriptions (e.g., \"Retrieves customer information\" vs \"Retrieves order details\") don't give the model enough context to differentiate between similar tools. Descriptions should include: input formats, example queries, edge cases, and boundary explanations (when to use this tool vs. similar alternatives). Additionally, system prompt wording can create unintended tool associations through keyword-sensitive instructions."
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.1",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What strategies fix tool misrouting when two tools have overlapping descriptions?",
    "back": "1) Rename tools to eliminate functional overlap (e.g., rename analyze_content to extract_web_results with a web-specific description). 2) Expand descriptions to include input formats, example queries, edge cases, and boundaries. 3) Split generic tools into purpose-specific tools with defined I/O contracts (e.g., split analyze_document into extract_data_points, summarize_content, verify_claim_against_source). 4) Review system prompts for keyword-sensitive instructions that might override tool descriptions."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.2",
    "front": "What are the four error categories in MCP tool error responses, and how should they be structured?",
    "back": "Categories: 1) Transient (timeouts, service unavailability) — retryable. 2) Validation (invalid input) — not retryable without fixing input. 3) Business (policy violations) — not retryable, needs customer-friendly explanation. 4) Permission errors. Structure: use the MCP isError flag, include errorCategory, isRetryable boolean, and human-readable description. Uniform generic errors (\"Operation failed\") prevent the agent from making appropriate recovery decisions."
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.2",
    "front": "How should error recovery work in a multi-agent system?",
    "back": "Subagents should implement LOCAL recovery for transient failures (retries with backoff). Only propagate errors they CANNOT resolve to the coordinator, including: what was attempted, partial results, and potential alternatives. Critical distinction: access failures (timeouts needing retry decisions) vs. valid empty results (successful queries with no matches). Never silently suppress errors by returning empty results as success, and never terminate entire workflows on single failures."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.3",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What's the recommended number of tools per agent, and why?",
    "back": "4-5 tools per agent. Giving an agent too many tools (e.g., 18) degrades tool selection reliability by increasing decision complexity. Agents with tools outside their specialization tend to misuse them (e.g., a synthesis agent attempting web searches). Apply scoped tool access: give agents only tools needed for their role, with limited cross-role tools only for specific high-frequency needs (e.g., a verify_fact tool for the synthesis agent)."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.3",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What are the three tool_choice configuration options and when do you use each?",
    "back": "1) \"auto\" (default): model decides whether to call a tool or return text. Risk: may return text instead of structured output. 2) \"any\": model MUST call a tool but can choose which one. Use when you need guaranteed structured output with multiple possible schemas. 3) Forced selection {\"type\": \"tool\", \"name\": \"...\"}: model MUST call the specific named tool. Use to ensure a particular step runs first (e.g., forcing extract_metadata before enrichment). Process subsequent steps in follow-up turns."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.4",
    "front": "What's the difference between project-level (.mcp.json) and user-level (~/.claude.json) MCP server configuration?",
    "back": "Project-level (.mcp.json): shared team tooling, committed to version control, available to all team members. Supports environment variable expansion (e.g., ${GITHUB_TOKEN}) for credential management without committing secrets. User-level (~/.claude.json): personal/experimental servers, not shared. Both are discovered at connection time and tools from all configured servers are available simultaneously."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.4",
    "front": "What are MCP resources and how do they differ from MCP tools?",
    "back": "MCP resources expose content catalogs (e.g., issue summaries, documentation hierarchies, database schemas) that give agents visibility into available data WITHOUT requiring exploratory tool calls. Tools perform actions. Resources provide read-only content discovery. Using resources reduces the number of tool calls needed because the agent can browse what's available before acting."
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.4",
    "front": "When should you use community MCP servers vs. build custom ones?",
    "back": "Use existing community MCP servers for standard integrations (e.g., Jira, GitHub). Reserve custom MCP servers for team-specific workflows that aren't covered by community solutions. Also: enhance MCP tool descriptions to explain capabilities and outputs in detail — otherwise the agent may prefer built-in tools (like Grep) over more capable MCP tools simply because the built-in tools have better descriptions."
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.5",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What is each built-in tool used for: Grep, Glob, Read, Write, Edit, Bash?",
    "back": "Grep: search file CONTENTS for patterns (function names, error messages, imports). Glob: find files by NAME/EXTENSION patterns (e.g., **/*.test.tsx). Read: load full file contents. Write: create/overwrite entire files. Edit: targeted modifications using unique text matching (fails if match isn't unique — fallback to Read+Write). Bash: execute shell commands. Key selection: Grep for content search, Glob for file discovery, Edit for surgical changes."
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.5",
    "front": "What's the recommended strategy for building understanding of an unfamiliar codebase using built-in tools?",
    "back": "Build understanding incrementally: 1) Start with Grep to find entry points (e.g., main function, route handlers). 2) Use Read to follow imports and trace flows. 3) Do NOT read all files upfront — that wastes context. For tracing function usage across wrappers: first identify all exported names, then search for each name across the codebase. Use Glob to find files matching patterns (e.g., all test files)."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.1",
    "visualRef": { "diagram": "tool-mcp", "step": 0 },
    "front": "What are the three levels of CLAUDE.md configuration hierarchy, and what's the scoping difference?",
    "back": "1) User-level (~/.claude/CLAUDE.md): applies only to that user, NOT shared via version control. 2) Project-level (.claude/CLAUDE.md or root CLAUDE.md): shared with the team via version control. 3) Directory-level (subdirectory CLAUDE.md): applies only when working in that subdirectory. Common pitfall: a new team member not receiving instructions because they're in user-level config rather than project-level. Use /memory to verify which files are loaded."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.1",
    "visualRef": { "diagram": "tool-mcp", "step": 0 },
    "front": "What are @import and .claude/rules/ and when would you use each?",
    "back": "@import: reference external files from CLAUDE.md to keep it modular (e.g., importing specific standards files relevant to each package). .claude/rules/: directory for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md (e.g., testing.md, api-conventions.md, deployment.md). Rules files support YAML frontmatter with glob patterns for conditional activation. Use rules/ when conventions are file-type or path-specific; use @import for shared standards across packages."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "visualRef": { "diagram": "tool-mcp", "step": 0 },
    "front": "What's the difference between project-scoped commands/skills and user-scoped ones?",
    "back": "Project-scoped: .claude/commands/ and .claude/skills/ — shared via version control, available to all team members who clone the repo. User-scoped: ~/.claude/commands/ and ~/.claude/skills/ — personal, not shared. Skills have SKILL.md files with frontmatter: context: fork (isolated sub-agent), allowed-tools (restrict tool access), argument-hint (prompt for parameters). Personal skill variants use different names to avoid affecting teammates."
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "front": "What does context: fork do in a SKILL.md frontmatter, and when should you use it?",
    "back": "context: fork runs the skill in an isolated sub-agent context, preventing skill outputs from polluting the main conversation. Use it for: 1) Skills that produce verbose output (e.g., codebase analysis) that would consume main context. 2) Exploratory skills (e.g., brainstorming alternatives) where you don't want intermediate reasoning cluttering the session. The skill results are summarized back to the main conversation rather than included verbatim."
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "front": "When should you use skills (on-demand) vs. CLAUDE.md (always-loaded)?",
    "back": "CLAUDE.md: universal standards that should ALWAYS be applied (coding conventions, testing requirements, project context). Skills: task-specific workflows invoked on-demand (e.g., /review for code review, /migrate for data migration). Skills are appropriate when the workflow is occasional and would add unnecessary context if always loaded. Use allowed-tools in skill frontmatter to restrict tool access during execution."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.3",
    "front": "How do .claude/rules/ files with YAML frontmatter path scoping work?",
    "back": "Create files in .claude/rules/ with YAML frontmatter containing a paths field with glob patterns. Example:\n---\npaths: [\"terraform/**/*\"]\n---\nRules only load when editing files matching the pattern. This reduces irrelevant context and token usage. Advantage over directory-level CLAUDE.md: glob patterns can match files spread across multiple directories (e.g., **/*.test.tsx for all test files regardless of location), while CLAUDE.md files are directory-bound."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.4",
    "visualRef": { "diagram": "tool-mcp", "step": 1 },
    "front": "When should you use plan mode vs. direct execution in Claude Code?",
    "back": "Plan mode: complex tasks with large-scale changes, multiple valid approaches, architectural decisions, multi-file modifications (e.g., microservice restructuring, library migrations affecting 45+ files). Enables safe exploration before committing to changes. Direct execution: simple, well-scoped changes with clear scope (e.g., single-file bug fix with clear stack trace, adding a date validation conditional). You can combine both: plan mode for investigation, then direct execution for implementation."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.4",
    "front": "What is the Explore subagent in Claude Code and when should you use it?",
    "back": "The Explore subagent isolates verbose discovery output and returns summaries to preserve main conversation context. Use it during multi-phase tasks where the discovery phase generates lots of output (file listings, dependency traces, etc.) that would exhaust the context window. The Explore subagent does the investigation, then returns a concise summary. This prevents context window exhaustion during extended exploration."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.5",
    "visualRef": { "diagram": "tool-mcp", "step": 4 },
    "front": "What are the three main iterative refinement techniques for working with Claude Code?",
    "back": "1) Concrete input/output examples: provide 2-3 examples of expected transformations when prose descriptions produce inconsistent results. Most effective for communicating expected behavior. 2) Test-driven iteration: write test suites first, then iterate by sharing test failures to guide progressive improvement. 3) Interview pattern: have Claude ask questions to surface considerations you may not have anticipated (e.g., cache invalidation, failure modes) before implementing."
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.5",
    "front": "When should you provide all issues in a single message vs. fix them sequentially?",
    "back": "Single message: when issues INTERACT with each other (fixing one affects another). Sequential iteration: when issues are INDEPENDENT (fixing one doesn't affect others). For edge case handling, provide specific test cases with example input and expected output. The key insight is that interacting problems need holistic context to solve correctly, while independent problems are better addressed one at a time to maintain focus."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "visualRef": { "diagram": "tool-mcp", "step": 3 },
    "front": "What CLI flags are essential for running Claude Code in CI/CD pipelines?",
    "back": "-p (or --print): runs Claude Code in non-interactive mode — processes the prompt, outputs result to stdout, exits. Without this, the job hangs waiting for interactive input. --output-format json: produces machine-parseable output. --json-schema: enforces structured output schema in CI contexts. CLAUDE.md provides project context (testing standards, fixture conventions, review criteria) to CI-invoked Claude Code."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "front": "Why should code review in CI use a separate Claude session from the one that generated the code?",
    "back": "Session context isolation: the same Claude session that generated code is less effective at reviewing its own changes. The model retains reasoning context from generation, making it less likely to question its own decisions. An independent review instance (without prior reasoning context) is more effective at catching subtle issues. This is the self-review limitation."
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "front": "How should you handle re-running CI reviews after new commits to avoid duplicate comments?",
    "back": "Include prior review findings in context when re-running reviews after new commits, and instruct Claude to report only new or still-unaddressed issues. Also: provide existing test files in context so test generation avoids suggesting duplicate scenarios. Document testing standards, valuable test criteria, and available fixtures in CLAUDE.md to improve quality and reduce low-value output."
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.1",
    "visualRef": { "diagram": "prompt-engineering", "step": 0 },
    "front": "Why do vague instructions like \"be conservative\" or \"only report high-confidence findings\" fail to improve precision?",
    "back": "They lack specific categorical criteria. The model doesn't know what \"conservative\" means in your context. Instead, define WHICH issues to report (bugs, security) vs. skip (minor style, local patterns). Example: \"flag comments only when claimed behavior contradicts actual code behavior\" is far more precise than \"check that comments are accurate.\" High false positive rates in any category undermine developer trust in ALL categories."
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.1",
    "visualRef": { "diagram": "prompt-engineering", "step": 0 },
    "front": "How should you handle high false-positive categories in an automated review system?",
    "back": "Temporarily DISABLE high false-positive categories to restore developer trust while improving prompts for those categories separately. Define explicit severity criteria with concrete code examples for each severity level. Write specific criteria defining which issues to report vs. skip, rather than relying on confidence-based filtering. Trust is hard to rebuild once lost to false positives."
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.2",
    "visualRef": { "diagram": "prompt-engineering", "step": 1 },
    "front": "When are few-shot examples most effective, and how many should you use?",
    "back": "Most effective when: detailed instructions alone produce inconsistent results, ambiguous case handling needs demonstration, you need consistent output formatting, or you want to reduce hallucination in extraction tasks. Use 2-4 targeted examples. Each example should show reasoning for why one action was chosen over plausible alternatives. Few-shot examples enable the model to GENERALIZE judgment to novel patterns, not just match pre-specified cases."
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.2",
    "visualRef": { "diagram": "prompt-engineering", "step": 1 },
    "front": "What makes a good few-shot example for reducing false positives in code review?",
    "back": "Show examples that distinguish acceptable code patterns from genuine issues. Include: the specific output format (location, issue, severity, suggested fix), examples of ambiguous cases with reasoning for the chosen action, and examples demonstrating correct handling of varied document structures. Don't just show positive examples — show cases where the model should NOT flag something and explain why."
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.3",
    "visualRef": { "diagram": "prompt-engineering", "step": 4 },
    "front": "Why is tool_use with JSON schemas the most reliable approach for structured output?",
    "back": "It guarantees schema-compliant output and eliminates JSON syntax errors entirely. The model is forced to produce valid JSON matching the schema. However, it does NOT prevent semantic errors (e.g., line items that don't sum to total, values in wrong fields). Semantic validation still requires separate checks. Key schema design: use required vs optional fields, enum fields with \"other\" + detail string patterns, and nullable fields for information that may not exist in the source."
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.3",
    "visualRef": { "diagram": "prompt-engineering", "step": 4 },
    "front": "How should you design JSON schema fields to prevent the model from fabricating values?",
    "back": "Make fields OPTIONAL (nullable) when source documents may not contain the information. If a field is required, the model will fabricate values to satisfy the schema. Add enum values like \"unclear\" for ambiguous cases. Use \"other\" + detail string pattern for extensible categorization. Include format normalization rules in prompts alongside strict output schemas to handle inconsistent source formatting."
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.4",
    "visualRef": { "diagram": "prompt-engineering", "step": 2 },
    "front": "How does retry-with-error-feedback work, and when are retries ineffective?",
    "back": "Retry-with-feedback: append specific validation errors to the prompt on retry, including the original document, the failed extraction, and the specific errors. This guides the model toward correction. Retries are INEFFECTIVE when information is simply absent from the source document — no amount of retrying will make the model find data that isn't there. Retries WORK for format mismatches and structural output errors."
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.4",
    "visualRef": { "diagram": "prompt-engineering", "step": 2 },
    "front": "How can you design self-correction validation flows for extracted data?",
    "back": "1) Extract \"calculated_total\" alongside \"stated_total\" to flag discrepancies. 2) Add \"conflict_detected\" booleans for inconsistent source data. 3) Include detected_pattern fields in structured findings to enable analysis of false positive patterns when developers dismiss findings. 4) Distinguish semantic validation errors (values don't sum, wrong field) from schema syntax errors (eliminated by tool_use). Track dismissal patterns to systematically improve."
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.5",
    "front": "What are the key characteristics and limitations of the Message Batches API?",
    "back": "50% cost savings vs synchronous API. Up to 24-hour processing window with NO guaranteed latency SLA. Uses custom_id fields for correlating request/response pairs. CRITICAL LIMITATION: The batch API uses an asynchronous fire-and-forget model — there is no mechanism to intercept a tool call mid-request, execute the tool, and return results for Claude to continue analysis. This fundamentally breaks iterative tool-calling workflows that require multiple rounds of tool invocation and response within a single logical interaction. The limitation is ARCHITECTURAL (no mid-request intercept), not just about latency. Even if results came back instantly, batch still cannot support iterative tool-calling loops. Use synchronous API for any workflow requiring multi-turn tool use."
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.5",
    "front": "How should you handle batch processing failures and optimize batch submissions?",
    "back": "1) Resubmit only FAILED documents (identified by custom_id) with appropriate modifications (e.g., chunking documents that exceeded context limits). 2) Calculate batch submission frequency based on SLA constraints (e.g., 4-hour windows to guarantee 30-hour SLA with 24-hour batch processing). 3) Run prompt refinement on a SAMPLE set before batch-processing large volumes to maximize first-pass success rates and reduce resubmission costs."
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.6",
    "visualRef": { "diagram": "prompt-engineering", "step": 2 },
    "front": "Why is self-review by the same model instance less effective than independent review?",
    "back": "The model retains reasoning context from generation, making it less likely to question its own decisions in the same session. An independent review instance (without the generator's reasoning context) is more effective at catching subtle issues. This is why CI should use separate sessions for generation and review. For large reviews, split into per-file local analysis plus cross-file integration passes to avoid attention dilution and contradictory findings."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.1",
    "front": "What is the 'lost in the middle' effect and how do you mitigate it?",
    "back": "Models reliably process information at the BEGINNING and END of long inputs but may omit findings from MIDDLE sections. Mitigation: place key findings summaries at the beginning of aggregated inputs, organize detailed results with explicit section headers, and extract critical facts into a persistent \"case facts\" block included at the start of each prompt. This ensures the most important information is in positions where the model attends most reliably."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.1",
    "front": "What is progressive summarization risk and how should you handle transactional facts?",
    "back": "Progressive summarization can condense numerical values, percentages, dates, and customer-stated expectations into vague summaries, losing critical details. Solution: extract transactional facts (amounts, dates, order numbers, statuses) into a persistent \"case facts\" block included in each prompt, OUTSIDE the summarized history. Also trim verbose tool outputs to only relevant fields before they accumulate (e.g., keep only 5 return-relevant fields from 40+ field order lookups)."
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.1",
    "front": "How should upstream agents format their outputs when downstream agents have limited context budgets?",
    "back": "Return structured data (key facts, citations, relevance scores) instead of verbose content and reasoning chains. Require subagents to include metadata (dates, source locations, methodological context) in structured outputs. This lets downstream agents get the essential information without consuming their limited context on upstream reasoning. Trim before passing, not after."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.2",
    "front": "What are appropriate escalation triggers for an AI agent, and what are unreliable proxies?",
    "back": "Appropriate triggers: 1) Customer explicitly requests a human. 2) Policy exceptions/gaps — policy is ambiguous or silent on the request. 3) Inability to make meaningful progress. UNRELIABLE proxies: sentiment-based escalation (sentiment doesn't correlate with case complexity), self-reported confidence scores (poorly calibrated — agent is incorrectly confident on hard cases). When multiple customer matches are found, ask for additional identifiers rather than selecting heuristically."
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.2",
    "front": "How should an agent handle a customer who explicitly requests a human agent?",
    "back": "Honor the request IMMEDIATELY without first attempting investigation. If the issue is straightforward and within the agent's capability, acknowledge frustration while offering resolution — but escalate if the customer reiterates their preference. Escalate when policy is ambiguous (e.g., competitor price matching when policy only addresses own-site adjustments). Add explicit escalation criteria with few-shot examples to the system prompt."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.3",
    "front": "What information should structured error context include for intelligent coordinator recovery?",
    "back": "Failure type, attempted query, partial results, and potential alternative approaches. This enables the coordinator to decide whether to retry with a modified query, try an alternative approach, or proceed with partial results. Anti-patterns: 1) Generic error statuses (\"search unavailable\") that hide context. 2) Silently suppressing errors (returning empty results as success). 3) Terminating entire workflows on single failures."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.4",
    "front": "What is context degradation in extended sessions, and how do scratchpad files help?",
    "back": "In extended sessions, models start giving inconsistent answers and referencing \"typical patterns\" rather than specific classes discovered earlier. Scratchpad files persist key findings across context boundaries — agents write important discoveries to files and reference them later. Additional strategies: spawn subagents for specific investigation questions (isolates verbose output), use /compact to reduce context usage, and design crash recovery using structured agent state exports (manifests)."
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.4",
    "front": "How should you design crash recovery for multi-agent codebase exploration?",
    "back": "Structured state persistence: each agent exports state to a known location (manifests). On resume, the coordinator loads the manifest and injects state into agent prompts. Also: summarize key findings from one exploration phase BEFORE spawning sub-agents for the next phase, injecting summaries into initial context. Use /compact to reduce context usage during extended sessions when context fills with verbose discovery output."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.5",
    "front": "Why can aggregate accuracy metrics (e.g., 97% overall) be misleading for extraction systems?",
    "back": "Aggregate metrics may mask poor performance on specific document types or fields. A system might be 99% accurate on invoices but 50% accurate on handwritten receipts. You must validate accuracy by document type AND field segment before automating high-confidence extractions. Use stratified random sampling to measure error rates in high-confidence extractions and detect novel error patterns."
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.5",
    "front": "How should you implement confidence-based routing for human review?",
    "back": "1) Have models output FIELD-LEVEL confidence scores (not just document-level). 2) Calibrate review thresholds using labeled validation sets. 3) Route low-confidence or ambiguous/contradictory extractions to human review. 4) Use stratified random sampling of HIGH-confidence extractions for ongoing error rate measurement. 5) Analyze accuracy by document type and field to verify consistent performance across all segments before reducing human review."
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.6",
    "front": "How is source attribution lost during multi-source synthesis, and how do you preserve it?",
    "back": "Attribution is lost during summarization when findings are compressed without preserving claim-source mappings. Solution: require subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts). The synthesis agent must preserve and merge these mappings. For conflicting statistics from credible sources: annotate conflicts with source attribution rather than arbitrarily selecting one value."
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.6",
    "front": "How should synthesis reports handle conflicting data, temporal differences, and different content types?",
    "back": "1) Conflicting data: include both values with explicit source attribution; structure reports with sections distinguishing well-established findings from contested ones. 2) Temporal data: require publication/collection dates to prevent temporal differences from being misinterpreted as contradictions. 3) Content types: render appropriately — financial data as tables, news as prose, technical findings as structured lists. Don't convert everything to a uniform format."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.1",
    "front": "What are the key components of the Claude Agent SDK?",
    "back": "Agent definitions (AgentDefinition with descriptions, system prompts, tool restrictions), agentic loops (send request, check stop_reason, execute tools, append results), stop_reason handling (\"tool_use\" to continue, \"end_turn\" to stop), hooks (PostToolUse for result transformation, tool call interception for compliance), subagent spawning via the Task tool, and allowedTools configuration (must include \"Task\" for coordinators to spawn subagents)."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.2",
    "front": "What are the key components of Model Context Protocol (MCP)?",
    "back": "MCP servers (project-scoped .mcp.json or user-scoped ~/.claude.json), MCP tools (actions with descriptions, inputs, outputs), MCP resources (content catalogs for data discovery without tool calls), isError flag (structured error communication), tool descriptions (primary mechanism for LLM tool selection), tool distribution (4-5 tools per agent), .mcp.json configuration with environment variable expansion (${GITHUB_TOKEN})."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.3",
    "front": "What are all the key Claude Code features and configuration mechanisms?",
    "back": "CLAUDE.md hierarchy (user/project/directory), .claude/rules/ with YAML frontmatter path-scoping, .claude/commands/ for slash commands (project-scoped=shared, user-scoped=personal), .claude/skills/ with SKILL.md frontmatter (context: fork, allowed-tools, argument-hint), plan mode (complex tasks) vs direct execution (simple changes), /memory (verify loaded configs), /compact (reduce context), --resume (continue named sessions), fork_session (branch exploration), Explore subagent (isolate verbose discovery)."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.4",
    "front": "What Claude Code CLI flags are needed for CI/CD pipeline integration?",
    "back": "-p / --print: non-interactive mode, processes prompt and exits (prevents hanging). --output-format json: machine-parseable output for automated processing. --json-schema: enforces structured output schema. Without -p, Claude Code waits for interactive input and the CI job hangs indefinitely."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.5",
    "front": "What are the key Claude API features for structured output and tool control?",
    "back": "tool_use with JSON schemas for guaranteed schema-compliant output. tool_choice options: \"auto\" (may return text), \"any\" (must call a tool), forced {\"type\":\"tool\",\"name\":\"...\"} (must call specific tool). stop_reason values: \"tool_use\" (continue loop) and \"end_turn\" (stop loop). max_tokens for response length control. System prompts for providing instructions and context."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.6",
    "front": "What are the characteristics and limitations of the Message Batches API?",
    "back": "50% cost savings vs synchronous API. Up to 24-hour processing window, no guaranteed latency SLA. custom_id for request/response correlation. Poll for completion. NO multi-turn tool calling support within a single request. Appropriate for: overnight reports, weekly audits, nightly batch jobs. NOT for blocking workflows (pre-merge checks). Handle failures by resubmitting only failed items by custom_id."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.7",
    "front": "What JSON Schema design patterns are important for Claude extraction tasks?",
    "back": "Required vs optional fields: make fields optional/nullable when source may not have the info (prevents fabrication). Enum types with \"other\" + detail string pattern for extensible categorization. \"unclear\" enum value for ambiguous cases. Strict mode eliminates syntax errors but NOT semantic errors. Nullable fields prevent hallucination of missing values. Combine with format normalization rules in prompts."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.8",
    "front": "What role does Pydantic play in Claude-based extraction systems?",
    "back": "Pydantic provides schema validation for structured outputs. It catches semantic validation errors that JSON Schema strict mode cannot (e.g., values that don't sum correctly, fields with wrong relationships). Used in validation-retry loops: when Pydantic validation fails, send a follow-up request with the original document, failed extraction, and specific validation error to guide model self-correction."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.9",
    "front": "What are the six built-in tools, and what is each one's selection criterion?",
    "back": "Read: load full file contents. Write: create/overwrite files. Edit: targeted modifications via unique text matching (falls back to Read+Write if match isn't unique). Bash: execute shell commands. Grep: search file CONTENTS for patterns (use for finding function callers, error messages, imports). Glob: find files by NAME/PATH patterns (use for **/*.test.tsx). Key: Grep=content search, Glob=file discovery."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.10",
    "front": "How does few-shot prompting work in Claude applications?",
    "back": "Provide 2-4 targeted examples for ambiguous scenarios showing reasoning for decisions. Examples demonstrate desired output format for consistency. The model generalizes judgment to novel patterns (not just matching pre-specified cases). Effective for: reducing hallucination in extraction, handling varied document structures, disambiguating tool selection, reducing false positives in code review. Show both positive and negative examples."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.11",
    "front": "What is prompt chaining and when should you use it?",
    "back": "Sequential task decomposition into focused passes. Use for predictable, multi-aspect tasks where steps are known upfront. Example: code review split into per-file local analysis passes + separate cross-file integration pass. Contrast with dynamic adaptive decomposition for open-ended tasks where subtasks depend on discoveries. Prompt chaining avoids attention dilution by keeping each pass focused."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.12",
    "front": "What are the key context window management strategies?",
    "back": "Token budgets: trim verbose tool outputs to relevant fields before accumulation. Progressive summarization: risky for numerical values/dates — extract transactional facts into persistent \"case facts\" block. Lost-in-the-middle: place key findings at beginning/end of inputs. Context extraction: structured fact extraction outside summarized history. Scratchpad files: persist findings across context boundaries for long sessions. /compact: reduce context usage mid-session."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.13",
    "front": "What are the key session management features in Claude Code?",
    "back": "Session resumption: --resume <session-name> to continue named sessions (use when prior context is mostly valid). fork_session: create independent branches from shared baseline (compare approaches). Named sessions: organize investigation sessions across work sessions. Session context isolation: separate sessions for generation vs review (self-review is less effective). Start fresh with injected summaries when prior tool results are stale."
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.14",
    "front": "How does confidence scoring work in Claude extraction and review systems?",
    "back": "Field-level confidence (not just document-level) for granular review routing. Calibrate thresholds using labeled validation sets. Stratified random sampling of high-confidence extractions for ongoing error rate measurement and novel pattern detection. Validate accuracy by document type AND field segment. Important: LLM self-reported confidence is poorly calibrated — the model may be incorrectly confident on hard cases. Use external validation, not self-assessment."
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "visualRef": { "diagram": "tool-mcp", "step": 2 },
    "front": "How do you prevent Claude from suggesting test cases that duplicate existing tests in CI?",
    "back": "Include the existing test file in Claude's context so it can identify what scenarios are already covered. This directly addresses the ROOT CAUSE of duplication — Claude can only avoid suggesting already-covered scenarios if it knows what tests already exist. WRONG approaches: (1) Post-processing with keyword matching is brittle — misses semantically equivalent tests described with different wording/terminology. It addresses symptoms, not root cause. (2) Reducing the number of suggestions just limits output without ensuring quality. (3) Directing Claude to focus on edge cases doesn't prevent duplicates. Key principle: Context Provision > Post-Processing. Give Claude the information it needs upfront rather than filtering output after the fact."
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.5",
    "visualRef": { "diagram": "multi-agent", "step": 3 },
    "front": "Where should error recovery happen in a multi-agent system — at the subagent, coordinator, or a dedicated error-handling agent?",
    "back": "At the LOWEST LEVEL CAPABLE of resolving the error. Subagents should implement local recovery for transient failures (retries, skip corrupted sections, parse alternatives) and only propagate errors they truly cannot resolve to the coordinator. Include full context in escalations: what was attempted, what failed, and any partial results obtained. WRONG approaches: (1) A dedicated error-handling agent adds unnecessary architectural complexity, a shared queue dependency, and distributes error-handling logic across multiple components rather than resolving at the source. (2) Always returning success with embedded error metadata hides failures from the coordinator. (3) Having the coordinator pre-validate all inputs creates a bottleneck and doesn't handle runtime errors. Key principle: Handle locally first, escalate with context only when necessary."
  }
];

const LS_KEY = 'flashcards-mastered';
let mastered = new Set(JSON.parse(localStorage.getItem(LS_KEY)||'[]'));
function saveMastered(){ localStorage.setItem(LS_KEY, JSON.stringify([...mastered])); }

let filtered = [];
let idx = 0;

const domainFilter = document.getElementById('domainFilter');
const typeFilter = document.getElementById('typeFilter');
const hideMastered = document.getElementById('hideMastered');
const cardScene = document.getElementById('cardScene');
const cardInner = document.getElementById('cardInner');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const masterBtn = document.getElementById('masterBtn');
const emptyState = document.getElementById('emptyState');

// Populate domain dropdown
const domains = [...new Map(ALL_CARDS.map(c=>[c.domain, c.domainName])).entries()].sort((a,b)=>a[0]-b[0]);
domains.forEach(([id,name])=>{
  const o = document.createElement('option');
  o.value = id; o.textContent = `Domain ${id}: ${name}`;
  domainFilter.appendChild(o);
});

function cardKey(c){ return c.taskId+'|'+c.front.slice(0,40); }

function applyFilters(){
  const d = domainFilter.value;
  const t = typeFilter.value;
  const hm = hideMastered.checked;
  filtered = ALL_CARDS.filter(c=>{
    if(d!=='all' && c.domain!==Number(d)) return false;
    if(t!=='all' && c.type!==t) return false;
    if(hm && mastered.has(cardKey(c))) return false;
    return true;
  });
  idx = 0;
  render();
}

function render(){
  const total = filtered.length;
  if(total===0){
    cardScene.style.display='none'; emptyState.style.display='block';
    progressText.textContent='Card 0 of 0'; progressFill.style.width='0%';
    updateStats(); return;
  }
  cardScene.style.display='block'; emptyState.style.display='none';
  cardInner.classList.remove('flipped');
  const c = filtered[idx];
  const domTag = `<span class="tag tag-domain">Domain ${c.domain}</span>`;
  const typeClass = c.type==='Knowledge'?'tag-knowledge':c.type==='Skill'?'tag-skill':'tag-appendix';
  const typeTag = `<span class="tag ${typeClass}">${c.type}</span>`;
  cardFront.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-question">${esc(c.front)}</div>`;
  cardBack.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-answer">${esc(c.back)}</div><div class="card-task"><span>Task ${c.taskId} &middot; ${c.domainName}</span><button class="speak-btn" onclick="speakDefinition(event)" title="Read definition aloud"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></button></div>`;
  // Mini diagram on card back
  const ref = c.visualRef;
  if (ref && window.DIAGRAMS && DIAGRAMS[ref.diagram]) {
    const miniContainer = document.createElement('div');
    miniContainer.style.cssText = 'margin-top:16px;border-top:1px solid #e5e3dd;padding-top:12px;max-height:200px;';
    DIAGRAMS[ref.diagram].draw(miniContainer, { step: ref.step, mini: true });
    cardBack.appendChild(miniContainer);
  }
  // Auto-size card to fit content
  requestAnimationFrame(()=>{
    const h = Math.max(340, cardFront.scrollHeight, cardBack.scrollHeight);
    cardScene.style.height = h + 'px';
  });
  progressFill.style.width = ((idx+1)/total*100)+'%';
  progressText.textContent = `Card ${idx+1} of ${total}`;
  const isMastered = mastered.has(cardKey(c));
  masterBtn.classList.toggle('is-mastered', isMastered);
  masterBtn.textContent = isMastered ? 'Mastered (M)' : 'Mark Mastered (M)';
  updateStats();
}

function speakDefinition(e){
  e.stopPropagation();
  const synth = window.speechSynthesis;
  const btn = e.currentTarget;
  if(synth.speaking){ synth.cancel(); btn.classList.remove('speaking'); return; }
  const c = filtered[idx];
  if(!c) return;
  const text = c.back.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1;
  btn.classList.add('speaking');
  utt.onend = ()=> btn.classList.remove('speaking');
  utt.onerror = ()=> btn.classList.remove('speaking');
  synth.speak(utt);
}

function esc(s){
  s = s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  // Put numbered items on their own lines: "1) ...", "2) ..." etc.
  s = s.replace(/(\d+)\)\s/g, function(match, num, offset){
    return (offset > 0 ? '<br><br>' : '') + '<b>' + num + ')</b> ';
  });
  return s;
}

function updateStats(){
  document.getElementById('statTotal').textContent = filtered.length;
  const m = filtered.filter(c=>mastered.has(cardKey(c))).length;
  document.getElementById('statMastered').textContent = m;
  document.getElementById('statRemaining').textContent = filtered.length - m;
}

function next(){ if(filtered.length){ idx=(idx+1)%filtered.length; render(); } }
function prev(){ if(filtered.length){ idx=(idx-1+filtered.length)%filtered.length; render(); } }
function shuffle(){
  for(let i=filtered.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[filtered[i],filtered[j]]=[filtered[j],filtered[i]]; }
  idx=0; render();
}
function toggleMaster(){
  if(!filtered.length) return;
  const k=cardKey(filtered[idx]);
  mastered.has(k)?mastered.delete(k):mastered.add(k);
  saveMastered(); render();
}

cardScene.addEventListener('click',()=>cardInner.classList.toggle('flipped'));
domainFilter.addEventListener('change',applyFilters);
typeFilter.addEventListener('change',applyFilters);
hideMastered.addEventListener('change',applyFilters);

document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
  if(e.key==='ArrowRight') next();
  else if(e.key==='ArrowLeft') prev();
  else if(e.key===' '){ e.preventDefault(); cardInner.classList.toggle('flipped'); }
  else if(e.key==='m'||e.key==='M') toggleMaster();
});

// Save/restore state for cross-device transfer
function exportState(){
  const state = { mastered: [...mastered], idx, domain: domainFilter.value, type: typeFilter.value, hide: hideMastered.checked };
  const encoded = btoa(JSON.stringify(state));
  navigator.clipboard.writeText(encoded).then(()=>{
    alert('State copied to clipboard! Paste it on your other device.');
  }).catch(()=>{
    prompt('Copy this text and paste on your other device:', encoded);
  });
}

function importState(){
  const encoded = prompt('Paste the state string from your other device:');
  if(!encoded) return;
  try {
    const state = JSON.parse(atob(encoded));
    mastered.clear();
    (state.mastered||[]).forEach(k=>mastered.add(k));
    saveMastered();
    domainFilter.value = state.domain||'all';
    typeFilter.value = state.type||'all';
    hideMastered.checked = !!state.hide;
    applyFilters();
    idx = Math.min(state.idx||0, filtered.length-1);
    render();
  } catch(e){ alert('Invalid state string.'); }
}

// URL query param support: ?domain=N auto-filters
const urlParams = new URLSearchParams(window.location.search);
const domainParam = urlParams.get('domain');
if (domainParam && !isNaN(Number(domainParam))) {
  domainFilter.value = domainParam;
}

applyFilters();
