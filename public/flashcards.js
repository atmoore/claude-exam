const ALL_CARDS = [
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "front": "What are the three stages of the agentic loop lifecycle when using the Claude API?",
    "hint": "Name the 3 steps in order",
    "back": "1) Send a request to Claude with tools and conversation history. 2) Inspect the response's stop_reason: if \"tool_use\", execute the requested tool(s); if \"end_turn\", the agent is done. 3) Append tool results to conversation history and send back for the next iteration. The loop continues until Claude returns stop_reason=\"end_turn\".",
    "visualRef": { "diagram": "agentic-loop", "step": 0 },
    "quiz": {
      "stem": "You are building a customer support agent that uses tools like get_customer, lookup_order, and process_refund. After sending a request to the Claude API, you receive a response. What is the correct sequence of steps to implement the agentic loop?",
      "correct": "Check the stop_reason: if it is 'tool_use', execute the requested tool, append the result to conversation history, and send another request. If it is 'end_turn', the agent is finished.",
      "distractors": [
        "Parse the assistant's text response to determine if it mentions needing a tool, then execute the tool and start a new conversation from scratch with the result.",
        "Set a fixed iteration count of 5 loops, executing all available tools in each iteration regardless of what the model requests, then return the final response.",
        "Check if the response contains any text content — if it does, the loop is complete; if it only contains tool calls, execute them and retry up to a maximum of 3 times."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "front": "Why must tool results be appended to conversation history between agentic loop iterations?",
    "hint": "Think about what the model needs to reason",
    "back": "The model needs the results of previous tool calls in its context to reason about what to do next. Without appending tool results, the model has no visibility into what happened and cannot make informed decisions about subsequent actions. Each iteration builds on the accumulated context of prior tool outputs.",
    "visualRef": { "diagram": "agentic-loop", "step": 3 },
    "quiz": {
      "stem": "A developer building an order management agent notices that Claude sometimes repeats the same lookup_order call with identical parameters across consecutive loop iterations. What is the most likely cause?",
      "correct": "Tool results from previous iterations are not being appended to the conversation history, so the model has no visibility into what already happened and cannot make informed decisions.",
      "distractors": [
        "The model's temperature setting is too high, causing it to randomly select tools without considering prior outputs. Lowering temperature to 0 will fix this.",
        "The tool description for lookup_order is too vague, causing the model to call it repeatedly hoping for different results. Rewriting the description will resolve it.",
        "The context window is too small to hold the full conversation, so earlier tool results are being truncated. Switching to a model with a larger context window is needed."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "front": "What distinguishes model-driven decision-making from pre-configured decision trees in agentic systems?",
    "hint": "Compare dynamic vs rigid approaches",
    "back": "Model-driven decision-making means Claude reasons about which tool to call next based on context, conversation history, and tool results. Pre-configured decision trees or fixed tool sequences are deterministic pipelines where the developer hardcodes the order of operations. The agentic approach lets Claude adapt dynamically, while decision trees are rigid and can't respond to unexpected situations.",
    "visualRef": { "diagram": "agentic-loop", "step": 1 },
    "quiz": {
      "stem": "A team is designing a customer support agent that handles returns. One engineer proposes a fixed pipeline: always call get_customer, then lookup_order, then process_refund in sequence. Another proposes letting Claude decide which tools to call based on the conversation. Which approach is more appropriate for an agentic system and why?",
      "correct": "Letting Claude decide dynamically is the agentic approach — it can adapt to unexpected situations like missing orders or customers needing different actions, whereas a fixed pipeline cannot handle cases outside its predefined sequence.",
      "distractors": [
        "The fixed pipeline is preferred because it guarantees all necessary steps are completed and prevents the model from skipping critical verification steps.",
        "Both approaches are equivalent in production — the fixed pipeline is just an optimization of the dynamic approach that reduces latency by eliminating decision overhead.",
        "The dynamic approach only works with Claude's largest model; smaller models require fixed pipelines because they cannot reliably select tools on their own."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.1",
    "visualRef": { "diagram": "agentic-loop", "step": 4 },
    "front": "What are three anti-patterns for determining when an agentic loop should stop?",
    "hint": "List 3 things NOT to do",
    "back": "1) Parsing natural language signals (e.g., checking if the assistant said \"I'm done\") — unreliable and fragile. 2) Setting arbitrary iteration caps as the PRIMARY stopping mechanism — the model may need more or fewer iterations. 3) Checking for assistant text content as a completion indicator. The correct approach: check stop_reason==\"end_turn\" to terminate, continue when stop_reason==\"tool_use\".",
    "quiz": {
      "stem": "A developer's customer support agent occasionally stops mid-task. Their loop termination logic checks whether the assistant's response text contains phrases like 'I have completed' or 'All done'. What should they change?",
      "correct": "Replace the natural language parsing with a check on the API's stop_reason field — continue the loop when stop_reason is 'tool_use' and terminate when it is 'end_turn'.",
      "distractors": [
        "Add more completion phrases to the detection list and use a regex pattern to catch variations like 'finished', 'done', and 'completed' more reliably.",
        "Set a fixed iteration cap of 10 loops as the primary stopping mechanism, which guarantees the agent always terminates and avoids infinite loops.",
        "Check whether the response contains any text content at all — if the model returns text instead of a tool call, that indicates it has finished its task."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 1 },
    "front": "In a hub-and-spoke multi-agent architecture, what is the coordinator agent responsible for?",
    "hint": "Describe the coordinator's key responsibilities",
    "back": "The coordinator manages ALL inter-subagent communication, error handling, and information routing. It handles task decomposition (breaking the query into subtasks), delegation (choosing which subagents to invoke), result aggregation, and deciding which subagents to invoke based on query complexity. Subagents never communicate directly with each other — everything flows through the coordinator.",
    "quiz": {
      "stem": "You are building a multi-agent research system with a coordinator, a web search subagent, and an analysis subagent. The analysis subagent needs data from the search subagent. How should this data flow?",
      "correct": "The search subagent returns results to the coordinator, which then passes the relevant data to the analysis subagent. All inter-subagent communication must route through the coordinator.",
      "distractors": [
        "The search subagent should write results to a shared message queue that the analysis subagent reads from directly, bypassing the coordinator for efficiency.",
        "The search subagent should call the analysis subagent directly using a peer-to-peer tool invocation, since both agents are in the same runtime.",
        "The coordinator should merge the search and analysis subagents into a single agent with both toolsets to avoid the overhead of passing data between agents."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 2 },
    "front": "Do subagents automatically inherit the coordinator's conversation history?",
    "hint": "Yes or no, then explain why",
    "back": "No. Subagents operate with isolated context. They do NOT automatically inherit the coordinator's conversation history or share memory between invocations. Any context a subagent needs must be explicitly provided in its prompt. This is a key architectural constraint that developers must account for when designing multi-agent systems.",
    "quiz": {
      "stem": "A developer's multi-agent system has a coordinator that gathers customer details, then spawns an analysis subagent. The subagent consistently fails to reference the customer's account history even though the coordinator retrieved it earlier. What is the most likely cause?",
      "correct": "Subagents do not automatically inherit the coordinator's conversation history. The customer account history must be explicitly included in the subagent's prompt for it to have access.",
      "distractors": [
        "The subagent's context window is too small to hold the customer history. Upgrading to a larger context model will allow it to access the coordinator's prior conversation.",
        "The coordinator needs to store the customer history in a shared database that both agents can query, since subagents cannot receive data through their prompts.",
        "The subagent's system prompt is overriding the conversation history. Removing the subagent's system prompt will allow it to see the coordinator's context."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 2 },
    "front": "What risk arises from overly narrow task decomposition by a coordinator agent?",
    "hint": "Think about what gets missed and why",
    "back": "Overly narrow decomposition leads to incomplete coverage of broad research topics. Example from the exam: a coordinator researching \"impact of AI on creative industries\" decomposed it into only visual arts subtasks (digital art, graphic design, photography), completely missing music, writing, and film. The subagents executed correctly within their assigned scope — the problem was what they were assigned. The coordinator must decompose broadly enough to cover the full topic.",
    "quiz": {
      "stem": "A multi-agent research system is tasked with analyzing 'the impact of AI on creative industries.' The final report thoroughly covers digital art, graphic design, and photography but completely omits music, writing, and film. Each subagent's output is high quality. Where is the failure?",
      "correct": "The coordinator's task decomposition was too narrow — it only assigned visual arts subtopics to subagents, missing entire creative domains. The subagents performed well within their assigned scope.",
      "distractors": [
        "The subagents failed to expand their research scope beyond the narrow topics assigned to them. Subagents should autonomously broaden their investigation when initial results seem incomplete.",
        "The synthesis subagent dropped the music, writing, and film sections during result aggregation. Adding a validation step after synthesis will catch missing sections.",
        "The system had too few subagents to cover all topics. Adding more subagents — one per creative industry — would prevent coverage gaps."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 1 },
    "front": "How should a coordinator agent decide which subagents to invoke — always use the full pipeline, or selectively?",
    "hint": "Contrast selective vs always-full-pipeline approaches",
    "back": "The coordinator should analyze query requirements and dynamically select which subagents to invoke, NOT always route through the full pipeline. For simple queries, invoking all subagents wastes resources. The coordinator should assess complexity and only invoke the subagents needed. Additionally, it should partition research scope across subagents to minimize duplication (e.g., assign distinct subtopics or source types to each).",
    "quiz": {
      "stem": "A multi-agent research system has search, analysis, and synthesis subagents. For a simple factual query like 'What is Claude's max context window?', all three subagents are invoked, adding latency and cost. How should the coordinator be improved?",
      "correct": "The coordinator should assess query complexity and selectively invoke only the subagents needed. Simple factual queries may only require the search subagent, not the full pipeline.",
      "distractors": [
        "Add a preprocessing classifier model that categorizes queries before they reach the coordinator, routing simple queries to a separate single-agent system entirely.",
        "Cache all previous query results so that simple queries can be answered from the cache without invoking any subagents at all.",
        "Merge all three subagents into a single agent with all tools, eliminating the multi-agent overhead for every query regardless of complexity."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.2",
    "visualRef": { "diagram": "multi-agent", "step": 4 },
    "front": "What is an iterative refinement loop in multi-agent orchestration?",
    "hint": "Describe the loop pattern and its purpose",
    "back": "The coordinator evaluates synthesis output for gaps, then re-delegates to search and analysis subagents with targeted queries, and re-invokes synthesis until coverage is sufficient. This ensures quality by letting the coordinator check if the output meets requirements before finalizing. All subagent communication routes through the coordinator for observability and consistent error handling.",
    "quiz": {
      "stem": "A multi-agent research system produces a report that is missing coverage of key subtopics. The coordinator currently accepts the synthesis output and returns it immediately. What orchestration pattern should be added?",
      "correct": "An iterative refinement loop where the coordinator evaluates the synthesis for gaps, re-delegates targeted queries to search and analysis subagents, and re-invokes synthesis until coverage is sufficient.",
      "distractors": [
        "A post-processing validation agent that rewrites the report to fill in gaps using its own knowledge, ensuring comprehensive coverage without additional subagent calls.",
        "A pre-processing step where the coordinator generates the complete expected outline first, then verifies each section exists in the output before returning it.",
        "Have each subagent self-evaluate its own output quality and autonomously re-run if it detects gaps, reporting back to the coordinator only when fully satisfied."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.3",
    "visualRef": { "diagram": "multi-agent", "step": 2 },
    "front": "What is the Task tool in the Claude Agent SDK, and what configuration is required for a coordinator to use it?",
    "hint": "Name the tool and the required config field",
    "back": "The Task tool is the mechanism for spawning subagents. For a coordinator to invoke subagents, its allowedTools configuration must include \"Task\". Without this, the coordinator cannot create subagent instances. Each subagent is defined via AgentDefinition with descriptions, system prompts, and tool restrictions.",
    "quiz": {
      "stem": "A developer configures a coordinator agent in the Claude Agent SDK with a system prompt instructing it to delegate research tasks to subagents. However, the coordinator never spawns any subagents and tries to do everything itself. What is the most likely configuration issue?",
      "correct": "The coordinator's allowedTools configuration does not include 'Task'. Without this, the coordinator cannot spawn subagent instances regardless of its system prompt instructions.",
      "distractors": [
        "The subagent AgentDefinitions are missing system prompts, which prevents them from being instantiated by any coordinator agent.",
        "The coordinator's model is too small to handle multi-agent orchestration. Upgrading to a larger model will enable subagent spawning capabilities.",
        "The system prompt needs to explicitly list each subagent by name with their full configuration for the coordinator to discover and invoke them."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.3",
    "visualRef": { "diagram": "multi-agent", "step": 3 },
    "front": "What is fork-based session management and when would you use it?",
    "hint": "Explain branching behavior and its use case",
    "back": "fork_session creates independent branches from a shared analysis baseline to explore divergent approaches. Use it when you want to compare two different strategies (e.g., two testing approaches or refactoring approaches) starting from the same codebase analysis. Each fork operates independently without affecting the other branches.",
    "quiz": {
      "stem": "A developer wants to compare two different refactoring strategies for a legacy module. Both strategies need the same initial codebase analysis. What Claude Code session management approach should they use?",
      "correct": "Use fork_session to create independent branches from the shared analysis baseline. Each fork explores a different strategy without affecting the other.",
      "distractors": [
        "Run --resume on the same session twice in parallel, which will automatically create two independent branches from the current session state.",
        "Start two completely new sessions and repeat the codebase analysis in each one to ensure both have the same starting context.",
        "Use a single session and ask Claude to analyze both approaches sequentially, using /compact between them to reset the context."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.3",
    "visualRef": { "diagram": "multi-agent", "step": 4 },
    "front": "How should context be passed between agents in a multi-agent system?",
    "hint": "List methods for sharing context explicitly",
    "back": "1) Include complete findings from prior agents directly in the subagent's prompt (e.g., pass web search results to the synthesis subagent). 2) Use structured data formats to separate content from metadata (source URLs, document names, page numbers) to preserve attribution. 3) Spawn parallel subagents by emitting multiple Task tool calls in a single coordinator response (not across separate turns). 4) Coordinator prompts should specify research goals and quality criteria, NOT step-by-step procedures, to enable subagent adaptability.",
    "quiz": {
      "stem": "A coordinator needs to launch three research subagents simultaneously and pass web search results to a synthesis subagent. The coordinator's prompt currently gives the synthesis subagent step-by-step instructions. What two changes should be made?",
      "correct": "Emit all three Task tool calls in a single coordinator response to run them in parallel, and replace the step-by-step instructions with research goals and quality criteria to enable subagent adaptability.",
      "distractors": [
        "Spawn each subagent in a separate coordinator turn for better error handling, and include detailed procedural steps so the synthesis subagent follows a consistent process.",
        "Pass only URLs to the synthesis subagent instead of complete findings to reduce token usage, and use a shared memory store for parallel subagent coordination.",
        "Have each subagent write its output to a shared file system, and give the synthesis subagent a fixed template to fill in rather than goals-based instructions."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.4",
    "front": "When should you use programmatic enforcement (hooks/gates) vs. prompt-based guidance for workflow ordering?",
    "hint": "Compare when each approach is appropriate",
    "back": "Use programmatic enforcement when deterministic compliance is required — especially for operations with financial or security consequences. Prompt instructions alone have a non-zero failure rate. Example: identity verification MUST happen before processing refunds. A programmatic prerequisite blocks process_refund until get_customer returns a verified customer ID. Prompt-based guidance is only appropriate when occasional non-compliance is acceptable.",
    "quiz": {
      "stem": "You are building a customer support agent with get_customer, lookup_order, process_refund, and escalate_to_human. Company policy requires identity verification before any refund. A developer adds a system prompt: 'Always verify customer identity before processing refunds.' Is this sufficient?",
      "correct": "No. Prompt instructions have a non-zero failure rate. A programmatic prerequisite that blocks process_refund until get_customer returns a verified customer ID provides deterministic enforcement for this security-critical workflow.",
      "distractors": [
        "Yes, system prompt instructions are reliably followed by Claude for safety-critical operations, making additional enforcement unnecessary overhead.",
        "No, but the fix is to use tool_choice to force get_customer first on every request, regardless of whether the user is asking about a refund.",
        "No, the solution is to combine both tools into a single verify_and_refund tool so the model cannot skip the verification step."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.4",
    "front": "What should a structured handoff summary include when escalating to a human agent?",
    "hint": "List the key fields in a handoff payload",
    "back": "Customer ID, root cause analysis, refund amount (or relevant transaction details), and recommended action. This is essential because human agents lack access to the conversation transcript. The handoff must be self-contained with all relevant context. For multi-concern requests, decompose into distinct items, investigate each in parallel using shared context, then synthesize a unified resolution.",
    "quiz": {
      "stem": "A customer support agent escalates a complex refund case to a human agent using the escalate_to_human tool. The human agent complains they cannot understand the situation. What should the escalation payload include?",
      "correct": "Customer ID, root cause analysis, refund amount, and recommended action. The handoff must be self-contained since human agents lack access to the AI conversation transcript.",
      "distractors": [
        "A link to the full conversation transcript so the human agent can read through the entire interaction and understand the context themselves.",
        "Only the customer ID and a flag indicating the issue type, since human agents have access to the same tools and can re-investigate from scratch.",
        "A summary of the AI agent's reasoning process and confidence level, so the human agent can decide whether to trust the AI's preliminary analysis."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.5",
    "front": "What are the two main hook patterns in the Claude Agent SDK, and what does each do?",
    "hint": "Name the 2 hook types and their targets",
    "back": "1) PostToolUse hooks: intercept tool RESULTS for transformation before the model processes them. Use case: normalizing heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes) from different MCP tools. 2) Tool call interception hooks: intercept OUTGOING tool calls to enforce compliance rules. Use case: blocking refunds above $500 and redirecting to human escalation. Hooks provide deterministic guarantees that prompt instructions cannot.",
    "quiz": {
      "stem": "Your agent integrates three MCP tools that return dates in different formats: Unix timestamps, ISO 8601, and locale strings. The model frequently misinterprets these inconsistent formats. What is the best solution?",
      "correct": "Use PostToolUse hooks to intercept and normalize tool results into a consistent date format before the model processes them.",
      "distractors": [
        "Add detailed format descriptions to each tool's description so the model learns to parse all three formats correctly from context.",
        "Use a tool call interception hook to rewrite the outgoing tool requests so they all request the same date format from the APIs.",
        "Add a system prompt instruction telling the model to always convert dates to ISO 8601 before reasoning about them."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.5",
    "front": "When should you choose hooks over prompt-based enforcement for business rules?",
    "hint": "Think about guaranteed vs probabilistic compliance",
    "back": "Choose hooks when business rules require GUARANTEED compliance. Prompt-based instructions are probabilistic — the model might not follow them 100% of the time. For example, if policy says refunds over $500 must go to a human, a hook that intercepts the process_refund tool call and checks the amount provides a deterministic guarantee. A prompt saying \"don't process refunds over $500\" will occasionally be violated.",
    "quiz": {
      "stem": "Company policy states that refunds over $500 must be approved by a human. A developer implements this by adding to the system prompt: 'Never process refunds exceeding $500.' During testing, the agent processes a $750 refund 2% of the time. What is the correct fix?",
      "correct": "Implement a tool call interception hook that checks the refund amount on every process_refund call and deterministically blocks amounts over $500, redirecting to human escalation.",
      "distractors": [
        "Rephrase the prompt instruction more emphatically with capitalization and repetition to reduce the failure rate below an acceptable threshold.",
        "Lower the model's temperature to 0 to eliminate the randomness that causes occasional non-compliance with the prompt instruction.",
        "Add a second validation prompt that reviews the agent's actions after each turn and reverses any unauthorized refunds it detects."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.6",
    "front": "When should you use prompt chaining (fixed sequential pipeline) vs. dynamic adaptive decomposition?",
    "hint": "Compare predictable vs discovery-driven tasks",
    "back": "Prompt chaining: use for predictable, multi-aspect reviews where the steps are known upfront (e.g., analyze each file individually, then run cross-file integration). Dynamic adaptive decomposition: use for open-ended investigation tasks where subtasks depend on what is discovered at each step (e.g., \"add comprehensive tests to a legacy codebase\" — first map structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered).",
    "quiz": {
      "stem": "You need to add comprehensive tests to a large legacy codebase with unknown structure and hidden dependencies. Should you use prompt chaining or dynamic adaptive decomposition?",
      "correct": "Dynamic adaptive decomposition, because subtasks depend on what is discovered at each step — you must map structure first, identify high-impact areas, then adapt the plan as dependencies are uncovered.",
      "distractors": [
        "Prompt chaining with a fixed sequence: generate unit tests for each file alphabetically, then run integration tests, since the predictable order ensures complete coverage.",
        "Neither — use a single prompt with the full codebase in context and ask Claude to generate all tests at once, leveraging the large context window.",
        "Prompt chaining, because testing always follows a known sequence: unit tests first, then integration tests, then end-to-end tests, regardless of the codebase."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.6",
    "front": "How should you structure a code review of a large PR to avoid attention dilution?",
    "hint": "Describe the multi-pass strategy",
    "back": "Split into focused passes: 1) Per-file local analysis — analyze each file individually for local issues (ensures consistent depth). 2) Cross-file integration pass — examine cross-file data flow, consistency, and contradictions separately. A single pass analyzing all files together produces inconsistent results: detailed feedback for some files, superficial for others, missed bugs, and contradictory feedback. Larger context windows do NOT solve attention quality issues.",
    "quiz": {
      "stem": "A team uses Claude to review a 15-file PR in a single pass. The review gives detailed feedback on the first few files but superficial comments on later files, and some feedback contradicts itself. A developer suggests upgrading to a larger context window model. Is this the right fix?",
      "correct": "No. Larger context windows do not solve attention quality issues. Split the review into per-file local analysis passes for consistent depth, then a separate cross-file integration pass.",
      "distractors": [
        "Yes, the inconsistency is caused by context window limits truncating later files. A larger context window will allow the model to attend equally to all files.",
        "No, the fix is to reduce the PR to fewer than 5 files, since Claude cannot effectively review more files regardless of approach.",
        "Yes, but also increase max_tokens so the model has enough output space to provide equally detailed feedback for every file."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.7",
    "front": "What is the difference between --resume <session-name> and fork_session in Claude Code?",
    "hint": "Compare the two features and their use cases",
    "back": "--resume <session-name>: continues a specific prior conversation by name. Use when prior context is mostly still valid. Important: if files have changed since the session, inform the agent about specific changes for targeted re-analysis. fork_session: creates an independent branch from a shared analysis baseline to explore divergent approaches (e.g., comparing two refactoring strategies). Each fork is independent.",
    "quiz": {
      "stem": "A developer analyzed a codebase yesterday and wants to continue today. Some files changed overnight. What is the best approach?",
      "correct": "Use --resume with the session name and inform the agent about the specific file changes so it can do targeted re-analysis rather than re-exploring the entire codebase.",
      "distractors": [
        "Start a completely new session and redo the full codebase analysis from scratch, since any prior context is now invalid due to file changes.",
        "Use fork_session to create a branch from yesterday's session, which will automatically detect and incorporate the file changes.",
        "Use --resume and rely on the model to automatically detect which files changed by comparing its memory against the current file system."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.7",
    "front": "When is starting a new session with a structured summary more reliable than resuming an old session?",
    "hint": "Think about when prior data becomes unreliable",
    "back": "When prior tool results are stale. Resumed sessions may contain outdated file contents, old search results, or analysis based on code that has changed. Starting fresh with an injected summary of key findings is more reliable because it avoids the model reasoning over stale data. When resuming IS appropriate, inform the agent about specific file changes rather than requiring full re-exploration.",
    "quiz": {
      "stem": "A developer's Claude Code session from last week contains extensive analysis of a module that has since been significantly refactored. They want to continue working on a related task. Should they resume the old session?",
      "correct": "No. Start a new session with a structured summary of key findings injected into the prompt. The old session contains stale file contents and analysis that would mislead the model.",
      "distractors": [
        "Yes, resume the session and the model will automatically detect that the code has changed and update its analysis accordingly.",
        "Yes, resume the session but run /compact first to clear the outdated tool results while preserving the analytical conclusions.",
        "No, use fork_session from the old session to create a fresh branch that inherits only the still-valid portions of the analysis."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.1",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "Why do minimal tool descriptions lead to unreliable tool selection by LLMs?",
    "hint": "Explain what descriptions need to include",
    "back": "Tool descriptions are the PRIMARY mechanism LLMs use for tool selection. Minimal descriptions (e.g., \"Retrieves customer information\" vs \"Retrieves order details\") don't give the model enough context to differentiate between similar tools. Descriptions should include: input formats, example queries, edge cases, and boundary explanations (when to use this tool vs. similar alternatives). Additionally, system prompt wording can create unintended tool associations through keyword-sensitive instructions.",
    "quiz": {
      "stem": "You're building a customer support agent with separate tools for retrieving customer profiles and order histories. During testing, the agent frequently calls the wrong tool. Both descriptions simply say 'Retrieves customer [profiles/orders].' What is the most likely root cause?",
      "correct": "The tool descriptions are too minimal for the model to differentiate between them. Adding input formats, example queries, edge cases, and boundary explanations would fix the misrouting.",
      "distractors": [
        "The model's temperature is set too high, causing random tool selection. Lowering temperature to 0 will make tool calls deterministic and reliable.",
        "The tools need to be registered in a strict priority order so the model checks the first tool before considering the second one.",
        "You should add a routing classifier model before Claude that determines which tool to call, removing tool selection from the LLM entirely."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.1",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What strategies fix tool misrouting when two tools have overlapping descriptions?",
    "hint": "List concrete strategies to eliminate overlap",
    "back": "1) Rename tools to eliminate functional overlap (e.g., rename analyze_content to extract_web_results with a web-specific description). 2) Expand descriptions to include input formats, example queries, edge cases, and boundaries. 3) Split generic tools into purpose-specific tools with defined I/O contracts (e.g., split analyze_document into extract_data_points, summarize_content, verify_claim_against_source). 4) Review system prompts for keyword-sensitive instructions that might override tool descriptions.",
    "quiz": {
      "stem": "Your agent has two tools: analyze_content (general text analysis) and extract_web_results (web scraping). The agent keeps using analyze_content for web pages instead of extract_web_results. What is the best combination of fixes?",
      "correct": "Rename tools to eliminate ambiguity, expand descriptions with input formats and boundary explanations for when to use each, and review system prompts for keyword-sensitive instructions that may override tool descriptions.",
      "distractors": [
        "Remove analyze_content entirely and have extract_web_results handle all content analysis, consolidating into a single tool to eliminate confusion.",
        "Add a pre-processing step that inspects the input URL and deterministically routes to the correct tool before the LLM sees the request.",
        "Set tool_choice to force extract_web_results for all requests, then manually switch to analyze_content when web scraping is not needed."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.2",
    "front": "What are the four error categories in MCP tool error responses, and how should they be structured?",
    "hint": "Name the 4 categories and key response fields",
    "back": "Categories: 1) Transient (timeouts, service unavailability) — retryable. 2) Validation (invalid input) — not retryable without fixing input. 3) Business (policy violations) — not retryable, needs customer-friendly explanation. 4) Permission errors. Structure: use the MCP isError flag, include errorCategory, isRetryable boolean, and human-readable description. Uniform generic errors (\"Operation failed\") prevent the agent from making appropriate recovery decisions.",
    "quiz": {
      "stem": "You're designing MCP tool error responses for a travel booking agent. A tool call fails because the airline's API is temporarily down. Currently, the tool returns {\"error\": \"Operation failed\"}. What should you change?",
      "correct": "Return a structured error with the MCP isError flag, an errorCategory of 'transient', isRetryable set to true, and a human-readable description. This lets the agent decide to retry rather than giving up.",
      "distractors": [
        "Return an empty successful result so the agent can continue the workflow and try a different airline instead of getting stuck on the error.",
        "Throw an unhandled exception to terminate the entire agent loop, since transient API failures indicate the workflow cannot complete.",
        "Return the raw HTTP 503 status code and headers directly to the model so it can interpret the failure from the HTTP response."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.2",
    "front": "How should error recovery work in a multi-agent system?",
    "hint": "Describe local vs escalated recovery roles",
    "back": "Subagents should implement LOCAL recovery for transient failures (retries with backoff). Only propagate errors they CANNOT resolve to the coordinator, including: what was attempted, partial results, and potential alternatives. Critical distinction: access failures (timeouts needing retry decisions) vs. valid empty results (successful queries with no matches). Never silently suppress errors by returning empty results as success, and never terminate entire workflows on single failures.",
    "quiz": {
      "stem": "In a multi-agent research system, a web-scraping subagent encounters a timeout when fetching a source. It has partial results from other sources. What is the correct error handling approach?",
      "correct": "The subagent should retry locally with backoff for the transient timeout. If retries fail, propagate to the coordinator with what was attempted, partial results gathered, and potential alternatives — without terminating the entire workflow.",
      "distractors": [
        "The subagent should return the partial results as a successful response with no error indication, since some data is better than none and the coordinator does not need to know about the failure.",
        "Route all errors to a dedicated error-handling agent that maintains a shared queue of failures and centrally decides retry strategies for all subagents.",
        "The coordinator should pre-validate all URLs before dispatching to subagents, preventing timeout errors from occurring in the first place."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.3",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What's the recommended number of tools per agent, and why?",
    "hint": "State the number and explain the tradeoff",
    "back": "4-5 tools per agent. Giving an agent too many tools (e.g., 18) degrades tool selection reliability by increasing decision complexity. Agents with tools outside their specialization tend to misuse them (e.g., a synthesis agent attempting web searches). Apply scoped tool access: give agents only tools needed for their role, with limited cross-role tools only for specific high-frequency needs (e.g., a verify_fact tool for the synthesis agent).",
    "quiz": {
      "stem": "Your research agent has 18 tools including web search, database queries, file operations, email sending, and calendar management. The agent frequently misuses tools outside its core research function. What architectural change would most improve reliability?",
      "correct": "Reduce to 4-5 tools per agent by applying scoped tool access — give the research agent only research-related tools and move other capabilities to specialized agents.",
      "distractors": [
        "Keep all 18 tools but add detailed chain-of-thought prompting that instructs the agent to reason about which tool to use before each call.",
        "Implement a tool access control list that dynamically enables and disables tools based on the current conversation topic detected by a classifier.",
        "Increase the context window size so the model can hold all 18 tool descriptions in memory simultaneously without confusion."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.3",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What are the three tool_choice configuration options and when do you use each?",
    "hint": "Name the 3 options and when to pick each",
    "back": "1) \"auto\" (default): model decides whether to call a tool or return text. Risk: may return text instead of structured output. 2) \"any\": model MUST call a tool but can choose which one. Use when you need guaranteed structured output with multiple possible schemas. 3) Forced selection {\"type\": \"tool\", \"name\": \"...\"}: model MUST call the specific named tool. Use to ensure a particular step runs first (e.g., forcing extract_metadata before enrichment). Process subsequent steps in follow-up turns.",
    "quiz": {
      "stem": "You're building a document processing pipeline where the first step must always extract metadata before any other processing occurs. The agent sometimes skips metadata extraction and jumps to summarization. How should you configure tool_choice?",
      "correct": "Use forced tool selection ({\"type\": \"tool\", \"name\": \"extract_metadata\"}) for the first turn to guarantee metadata extraction runs, then switch to 'auto' for subsequent turns.",
      "distractors": [
        "Set tool_choice to 'any' so the model is forced to call a tool, which will reliably select extract_metadata since it is the most relevant tool for the first step.",
        "Add a system prompt instruction that says 'Always call extract_metadata first' and keep tool_choice on 'auto', since clear instructions are sufficient to guarantee ordering.",
        "Create a wrapper tool called process_document that internally calls extract_metadata then summarize in sequence, and set tool_choice to 'auto'."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.4",
    "front": "What's the difference between project-level (.mcp.json) and user-level (~/.claude.json) MCP server configuration?",
    "hint": "Compare scoping and sharing behavior",
    "back": "Project-level (.mcp.json): shared team tooling, committed to version control, available to all team members. Supports environment variable expansion (e.g., ${GITHUB_TOKEN}) for credential management without committing secrets. User-level (~/.claude.json): personal/experimental servers, not shared. Both are discovered at connection time and tools from all configured servers are available simultaneously.",
    "quiz": {
      "stem": "Your team wants to share a custom MCP server for Jira integration across all developers. The server requires each developer's personal API token. Where should the server be configured and how should credentials be handled?",
      "correct": "Configure the server in the project-level .mcp.json (committed to version control) and use environment variable expansion (e.g., ${JIRA_TOKEN}) so each developer provides their own token without committing secrets.",
      "distractors": [
        "Each developer should configure the server in their personal ~/.claude.json with their token hardcoded, since user-level config is the only way to handle per-user credentials.",
        "Create a shared .env file committed to the repository with a team-wide service account token that all developers use for the Jira MCP server.",
        "Configure the server in .mcp.json and store API tokens in a .claude/secrets.json file that is gitignored, which the MCP server reads at startup."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.4",
    "front": "What are MCP resources and how do they differ from MCP tools?",
    "hint": "Contrast read-only discovery vs actions",
    "back": "MCP resources expose content catalogs (e.g., issue summaries, documentation hierarchies, database schemas) that give agents visibility into available data WITHOUT requiring exploratory tool calls. Tools perform actions. Resources provide read-only content discovery. Using resources reduces the number of tool calls needed because the agent can browse what's available before acting.",
    "quiz": {
      "stem": "Your agent needs to understand a project's database schema before writing queries. Currently it makes multiple exploratory tool calls to discover table structures. How could MCP resources improve this workflow?",
      "correct": "Expose the database schema as an MCP resource, giving the agent read-only visibility into available tables and columns without requiring exploratory tool calls.",
      "distractors": [
        "Create a dedicated 'discover_schema' MCP tool that the agent calls first, which is functionally identical to resources but uses the tool interface for consistency.",
        "Pre-load the entire database schema into the system prompt so the agent always has it available, eliminating the need for any runtime discovery mechanism.",
        "Configure the MCP server to automatically inject schema information into every tool response so the agent passively learns the schema over time."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.4",
    "front": "When should you use community MCP servers vs. build custom ones?",
    "hint": "Describe the decision criteria for each choice",
    "back": "Use existing community MCP servers for standard integrations (e.g., Jira, GitHub). Reserve custom MCP servers for team-specific workflows that aren't covered by community solutions. Also: enhance MCP tool descriptions to explain capabilities and outputs in detail — otherwise the agent may prefer built-in tools (like Grep) over more capable MCP tools simply because the built-in tools have better descriptions.",
    "quiz": {
      "stem": "Your team needs Claude Code to interact with Jira for ticket management and also with an internal proprietary deployment system. How should you approach MCP server selection?",
      "correct": "Use the existing community MCP server for Jira (a standard integration) and build a custom MCP server only for the proprietary deployment system. Enhance MCP tool descriptions so the agent prefers them over built-in tools.",
      "distractors": [
        "Build custom MCP servers for both Jira and the deployment system to ensure consistent API patterns and full control over tool descriptions and error handling.",
        "Use community servers for both by forking the closest community server to the deployment system and modifying it, since community servers are always more stable.",
        "Skip MCP servers entirely and use Bash tool calls to invoke CLI commands for both Jira and the deployment system, since shell scripts are more maintainable."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.5",
    "visualRef": { "diagram": "context-window", "step": 1 },
    "front": "What is each built-in tool used for: Grep, Glob, Read, Write, Edit, Bash?",
    "hint": "Name each tool and its primary purpose",
    "back": "Grep: search file CONTENTS for patterns (function names, error messages, imports). Glob: find files by NAME/EXTENSION patterns (e.g., **/*.test.tsx). Read: load full file contents. Write: create/overwrite entire files. Edit: targeted modifications using unique text matching (fails if match isn't unique — fallback to Read+Write). Bash: execute shell commands. Key selection: Grep for content search, Glob for file discovery, Edit for surgical changes.",
    "quiz": {
      "stem": "A developer asks Claude Code to find all files importing a deprecated 'auth-legacy' module across the codebase. Which built-in tool is most appropriate?",
      "correct": "Grep — it searches file contents for patterns like import statements and function names. Glob finds files by name/extension patterns, not by content.",
      "distractors": [
        "Glob — use the pattern '**/*auth-legacy*' to find all files that reference the deprecated module by matching the module name in file paths.",
        "Bash — run a shell find command with xargs to search file contents, since Bash provides more flexibility than the built-in search tools.",
        "Read — sequentially open each source file and scan for the import, since Read is the most reliable way to inspect file contents."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 2,
    "domainName": "Tool Design & MCP Integration",
    "taskId": "2.5",
    "front": "What's the recommended strategy for building understanding of an unfamiliar codebase using built-in tools?",
    "hint": "Describe the incremental exploration approach",
    "back": "Build understanding incrementally: 1) Start with Grep to find entry points (e.g., main function, route handlers). 2) Use Read to follow imports and trace flows. 3) Do NOT read all files upfront — that wastes context. For tracing function usage across wrappers: first identify all exported names, then search for each name across the codebase. Use Glob to find files matching patterns (e.g., all test files).",
    "quiz": {
      "stem": "A new team member asks Claude Code to help them understand a large unfamiliar codebase. What approach should they take?",
      "correct": "Build understanding incrementally: use Grep to find entry points like main functions or route handlers, then Read to follow imports and trace flows. Avoid reading all files upfront as it wastes context.",
      "distractors": [
        "Start by reading every file in the src/ directory to build a complete mental model before doing any targeted investigation or code tracing.",
        "Use Bash to run a static analysis tool that generates a full dependency graph, then read the output to understand the entire codebase structure at once.",
        "Create a CLAUDE.md file describing the entire codebase architecture first, then use that as reference for all future exploration."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.1",
    "visualRef": { "diagram": "tool-mcp", "step": 0 },
    "front": "What are the three levels of CLAUDE.md configuration hierarchy, and what's the scoping difference?",
    "hint": "Name the 3 levels and their scoping differences",
    "back": "1) User-level (~/.claude/CLAUDE.md): applies only to that user, NOT shared via version control. 2) Project-level (.claude/CLAUDE.md or root CLAUDE.md): shared with the team via version control. 3) Directory-level (subdirectory CLAUDE.md): applies only when working in that subdirectory. Common pitfall: a new team member not receiving instructions because they're in user-level config rather than project-level. Use /memory to verify which files are loaded.",
    "quiz": {
      "stem": "A new developer joins your team and reports that Claude Code is not following the project's coding conventions that other team members see. The conventions are defined in ~/.claude/CLAUDE.md on the tech lead's machine. What is the problem?",
      "correct": "User-level CLAUDE.md (~/.claude/CLAUDE.md) is personal and not shared via version control. The conventions should be in project-level config (.claude/CLAUDE.md or root CLAUDE.md) so all team members receive them.",
      "distractors": [
        "The new developer needs to run /memory import to sync CLAUDE.md settings from the team's shared configuration server before they take effect.",
        "User-level CLAUDE.md takes lowest priority, so the project-level file is overriding it. The tech lead should move conventions to a directory-level CLAUDE.md instead.",
        "The new developer needs to restart Claude Code after cloning the repository because CLAUDE.md files are only read on first launch, not on session start."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.1",
    "visualRef": { "diagram": "tool-mcp", "step": 0 },
    "front": "What are @import and .claude/rules/ and when would you use each?",
    "hint": "Compare modular imports vs topic-specific rules",
    "back": "@import: reference external files from CLAUDE.md to keep it modular (e.g., importing specific standards files relevant to each package). .claude/rules/: directory for organizing topic-specific rule files as an alternative to a monolithic CLAUDE.md (e.g., testing.md, api-conventions.md, deployment.md). Rules files support YAML frontmatter with glob patterns for conditional activation. Use rules/ when conventions are file-type or path-specific; use @import for shared standards across packages.",
    "quiz": {
      "stem": "Your monorepo has three packages, each with different coding standards. You want Claude to apply the right standards when working in each package without duplicating rules. What is the best configuration approach?",
      "correct": "Use @import in each package's CLAUDE.md to reference shared standards files, keeping configuration modular. Alternatively, use .claude/rules/ with YAML frontmatter glob patterns for path-specific rules that activate conditionally.",
      "distractors": [
        "Create a single root CLAUDE.md with all three packages' standards and rely on Claude to infer which package's rules apply based on the file being edited.",
        "Use directory-level CLAUDE.md files in each package and duplicate the shared standards across all three, since @import is only supported in the root CLAUDE.md.",
        "Configure three separate MCP servers, one per package, each providing the coding standards as tool descriptions that Claude reads before making changes."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "visualRef": { "diagram": "tool-mcp", "step": 0 },
    "front": "What's the difference between project-scoped commands/skills and user-scoped ones?",
    "hint": "Compare shared vs personal scope and config location",
    "back": "Project-scoped: .claude/commands/ and .claude/skills/ — shared via version control, available to all team members who clone the repo. User-scoped: ~/.claude/commands/ and ~/.claude/skills/ — personal, not shared. Skills have SKILL.md files with frontmatter: context: fork (isolated sub-agent), allowed-tools (restrict tool access), argument-hint (prompt for parameters). Personal skill variants use different names to avoid affecting teammates.",
    "quiz": {
      "stem": "You've created a helpful /deploy skill for your personal workflow. A teammate wants to use it too, but it should not affect the rest of the team. What should you recommend?",
      "correct": "The teammate should copy the skill to their own ~/.claude/skills/ (user-scoped, not shared). If the whole team eventually wants it, move it to .claude/skills/ in the project repo (project-scoped, version controlled).",
      "distractors": [
        "Share the skill by adding it to the project's .claude/commands/ directory with a user-filter frontmatter field that restricts execution to specific usernames.",
        "Export the skill as an MCP server plugin so individual developers can install it independently without affecting the project repository.",
        "Add the skill to the root CLAUDE.md using @import so it loads for everyone, but wrap it in a conditional block that checks the developer's username."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "front": "What does context: fork do in a SKILL.md frontmatter, and when should you use it?",
    "hint": "Explain what isolated sub-agent execution achieves",
    "back": "context: fork is the big one — the skill runs in an isolated sub-agent. All verbose output stays contained there; the main conversation stays clean. Only a summary of results is returned. Use for anything noisy: codebase analysis, brainstorming, large explorations. Without it, verbose skill output fills the context window and degrades subsequent conversation quality.",
    "quiz": {
      "stem": "You've built a /analyze-deps skill that traces all dependency chains in a large monorepo. When you run it, the verbose output fills the context window and degrades subsequent conversation quality. How should you fix this?",
      "correct": "Add 'context: fork' to the SKILL.md frontmatter. This runs the skill in an isolated sub-agent, and only a summary of results is returned to the main conversation, preventing context pollution.",
      "distractors": [
        "Add 'max-output: 500' to the SKILL.md frontmatter to truncate the skill's output to 500 tokens before it enters the main conversation context.",
        "Split the skill into multiple smaller skills that each analyze one dependency chain, keeping individual outputs small enough to fit in the context window.",
        "Set 'context: stream' in the SKILL.md frontmatter to pipe the output to a file instead of the conversation, then read the file summary afterward."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "front": "What does the allowed-tools field do in SKILL.md frontmatter, and when should you use it?",
    "hint": "Describe the security restriction mechanism",
    "back": "allowed-tools is a security boundary. It restricts which tools the skill can access during execution. If a skill should only read and search (never edit or run commands), lock it down here. For example, a /review skill that should only analyze code can be restricted to Read, Glob, and Grep tools, preventing accidental edits or command execution during review.",
    "quiz": {
      "stem": "You've built a /security-audit skill that scans code for vulnerabilities. You want to ensure it can never accidentally modify files or execute commands during its analysis. How should you configure this?",
      "correct": "Add 'allowed-tools' to the SKILL.md frontmatter listing only Read, Glob, and Grep. This acts as a security boundary, preventing the skill from accessing Edit, Write, or Bash tools.",
      "distractors": [
        "Add 'read-only: true' to the SKILL.md frontmatter, which prevents all write operations globally for the duration of the skill execution.",
        "Include instructions in the skill's prompt saying 'Do not edit any files' — the model will follow these instructions reliably without needing tool restrictions.",
        "Set 'context: sandbox' in the SKILL.md frontmatter to run the skill in a restricted filesystem environment where write operations are blocked at the OS level."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "front": "What does argument-hint do in SKILL.md frontmatter?",
    "hint": "Explain the UX convenience it provides",
    "back": "argument-hint is a UX convenience. When someone invokes the skill without arguments, they get prompted with this hint. For example, a /migrate skill with argument-hint: 'source database URL' will prompt the user for that input if they just type /migrate without arguments, rather than failing silently or running with missing context.",
    "quiz": {
      "stem": "Your team's /deploy skill requires a target environment name (e.g., staging, production). Team members keep invoking it without specifying the environment, causing confusion. How can you improve the UX?",
      "correct": "Add 'argument-hint: \"target environment (e.g., staging, production)\"' to the SKILL.md frontmatter. When someone types /deploy without arguments, they'll be prompted with this hint.",
      "distractors": [
        "Add a 'required-args' field to the SKILL.md frontmatter that throws an error and blocks execution if the environment argument is not provided.",
        "Add a default-args field set to 'staging' so the skill always has a fallback environment, avoiding the need for the user to specify one.",
        "Add validation logic inside the skill's prompt that checks for arguments and prints a usage message, since frontmatter cannot handle argument prompting."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.2",
    "front": "When should you use skills (on-demand) vs. CLAUDE.md (always-loaded)?",
    "hint": "Compare always-loaded vs on-demand workflows",
    "back": "CLAUDE.md: universal standards that should ALWAYS be applied (coding conventions, testing requirements, project context). Skills: task-specific workflows invoked on-demand (e.g., /review for code review, /migrate for data migration). Skills are appropriate when the workflow is occasional and would add unnecessary context if always loaded. Use allowed-tools in skill frontmatter to restrict tool access during execution.",
    "quiz": {
      "stem": "Your team has both universal coding conventions (always applicable) and an occasional database migration workflow. Where should each be configured?",
      "correct": "Put universal coding conventions in CLAUDE.md so they are always loaded. Create the migration workflow as a skill (e.g., /migrate) invoked on-demand, since it would add unnecessary context if always loaded.",
      "distractors": [
        "Put both in CLAUDE.md with section headers, since having all instructions in one place makes them easier to maintain and ensures nothing is missed.",
        "Put both as skills — universal conventions as /conventions and migration as /migrate — so developers can choose which context to load for each session.",
        "Put coding conventions in .claude/rules/ and the migration workflow in CLAUDE.md, since workflows need to be always-available to ensure consistency."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.3",
    "front": "How do .claude/rules/ files with YAML frontmatter path scoping work?",
    "hint": "Explain glob patterns and conditional activation",
    "back": "Create files in .claude/rules/ with YAML frontmatter containing a paths field with glob patterns. Example:\n---\npaths: [\"terraform/**/*\"]\n---\nRules only load when editing files matching the pattern. This reduces irrelevant context and token usage. Advantage over directory-level CLAUDE.md: glob patterns can match files spread across multiple directories (e.g., **/*.test.tsx for all test files regardless of location), while CLAUDE.md files are directory-bound.",
    "quiz": {
      "stem": "Your project has Terraform configs in terraform/ and test files spread across many directories (e.g., src/auth/*.test.tsx, src/api/*.test.tsx). You want different Claude rules for each. What is the most flexible configuration approach?",
      "correct": "Use .claude/rules/ files with YAML frontmatter path globs: one with paths: [\"terraform/**/*\"] for infra rules and another with paths: [\"**/*.test.tsx\"] for test rules. Unlike directory-level CLAUDE.md, glob patterns match files across multiple directories.",
      "distractors": [
        "Place CLAUDE.md files in both the terraform/ directory and every directory containing test files, duplicating the test rules in each location.",
        "Use a single root CLAUDE.md with @import statements that conditionally load based on file extensions, since @import supports glob pattern conditions.",
        "Create an MCP server that detects the current file type and dynamically injects the appropriate rules into the system prompt before each edit."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.4",
    "visualRef": { "diagram": "tool-mcp", "step": 1 },
    "front": "When should you use plan mode vs. direct execution in Claude Code?",
    "hint": "Compare task complexity to choose the right mode",
    "back": "Plan mode: complex tasks with large-scale changes, multiple valid approaches, architectural decisions, multi-file modifications (e.g., microservice restructuring, library migrations affecting 45+ files). Enables safe exploration before committing to changes. Direct execution: simple, well-scoped changes with clear scope (e.g., single-file bug fix with clear stack trace, adding a date validation conditional). You can combine both: plan mode for investigation, then direct execution for implementation.",
    "quiz": {
      "stem": "You need to migrate a library used across 45+ files in your codebase. The migration involves API changes that could be approached several ways. How should you use Claude Code?",
      "correct": "Start with plan mode to explore approaches and make architectural decisions safely, then switch to direct execution for implementation. Plan mode is ideal for complex multi-file changes with multiple valid approaches.",
      "distractors": [
        "Use direct execution for the entire migration since Claude Code can handle multi-file changes atomically and will roll back automatically if any file fails.",
        "Use plan mode for the entire migration including implementation, since direct execution should only be used for single-file changes under 50 lines.",
        "Break the migration into 45 separate single-file tasks and run each in direct execution mode sequentially, since Claude Code cannot reliably handle multi-file changes."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.4",
    "front": "What is the Explore subagent in Claude Code and when should you use it?",
    "hint": "Describe its purpose and when to invoke it",
    "back": "The Explore subagent isolates verbose discovery output and returns summaries to preserve main conversation context. Use it during multi-phase tasks where the discovery phase generates lots of output (file listings, dependency traces, etc.) that would exhaust the context window. The Explore subagent does the investigation, then returns a concise summary. This prevents context window exhaustion during extended exploration.",
    "quiz": {
      "stem": "You're investigating a complex bug that requires tracing through many files, reading dependency trees, and examining logs. You're worried about exhausting Claude Code's context window during the discovery phase. What feature should you use?",
      "correct": "Use the Explore subagent, which isolates verbose discovery output and returns a concise summary to the main conversation. This preserves the main context window for the actual fix implementation.",
      "distractors": [
        "Use the --compact flag when starting Claude Code to compress all file reads to summaries, reducing context usage by 80% during exploration.",
        "Start a new Claude Code session for each file you need to investigate, then manually compile your findings into a summary for the fix session.",
        "Use plan mode exclusively, which automatically manages context by discarding intermediate exploration output and only retaining the final plan."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.5",
    "visualRef": { "diagram": "tool-mcp", "step": 4 },
    "front": "What are the three main iterative refinement techniques for working with Claude Code?",
    "hint": "List the 3 techniques in priority order",
    "back": "Reach for these in priority order: 1) Concrete input/output examples (BEST) — show 2-3 before/after examples of the exact transformation. Models generalise from examples more reliably than from prose. Prose is ambiguous; examples are unambiguous. 2) Test-driven iteration — write tests first, share failures. The failing test output tells Claude exactly what's expected vs. produced. 3) Interview pattern — have Claude ask you questions before implementing. Surfaces considerations you'd miss, especially in unfamiliar domains.",
    "quiz": {
      "stem": "A developer describes a code transformation in prose (e.g., 'convert all function names to snake_case'). Claude Code interprets it differently each time, producing inconsistent results. What technique should they try first?",
      "correct": "Concrete input/output examples. Prose is ambiguous; examples are unambiguous. Show 2-3 examples like 'getUserData(id) → get_user_data(id)' and the model will generalise the pattern reliably.",
      "distractors": [
        "Add more detailed prose descriptions with explicit formatting rules, since longer and more precise instructions will eliminate output inconsistencies.",
        "Set the temperature to 0 and increase max_tokens to ensure deterministic and complete output on every run.",
        "Create a JSON schema for the output format and pass it via --json-schema flag, since schema validation is the only reliable way to enforce consistent formatting."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.5",
    "front": "When should you provide all issues in a single message vs. fix them sequentially?",
    "hint": "Compare interacting vs independent issues",
    "back": "Single message: when issues INTERACT with each other (fixing one affects another). Sequential iteration: when issues are INDEPENDENT (fixing one doesn't affect others). For edge case handling, provide specific test cases with example input and expected output. The key insight is that interacting problems need holistic context to solve correctly, while independent problems are better addressed one at a time to maintain focus.",
    "quiz": {
      "stem": "After reviewing Claude Code's output, you found three bugs: a race condition in the cache layer, a typo in a log message, and an off-by-one error in pagination. How should you communicate these fixes?",
      "correct": "Fix them sequentially since the issues are independent — fixing one doesn't affect the others. Sequential iteration maintains focus. Batch issues into a single message only when they interact with each other.",
      "distractors": [
        "Always provide all issues in a single message so Claude has complete context about everything that needs fixing, regardless of whether the issues are related.",
        "Create a numbered checklist in CLAUDE.md with all three issues and let Claude work through them in order, since persistent instructions ensure nothing is missed.",
        "Open three separate Claude Code sessions in parallel, one for each bug, to maximize throughput and avoid any possibility of fixes interfering with each other."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "visualRef": { "diagram": "tool-mcp", "step": 3 },
    "front": "What does the -p flag do in Claude Code, and why is it critical for CI/CD?",
    "hint": "Explain what the flag does and why CI needs it",
    "back": "-p (--print) runs Claude Code in non-interactive (print) mode. Without it, Claude waits for interactive input and your CI job hangs indefinitely.\n\nHangs: claude \"Analyse this PR\"\nWorks: claude -p \"Analyse this PR\"\n\nThis is the single most important flag for any non-interactive use of Claude Code — CI pipelines, shell scripts, automation workflows. It processes the prompt, outputs the result to stdout, and exits.",
    "quiz": {
      "stem": "A developer adds 'claude \"Analyse this PR\"' to their CI pipeline. The job hangs indefinitely. What single change fixes it?",
      "correct": "Add the -p flag: 'claude -p \"Analyse this PR\"'. The -p (print) flag runs Claude Code in non-interactive mode. Without it, Claude waits for interactive input, which causes the CI job to hang.",
      "distractors": [
        "Wrap the command in 'echo | claude \"Analyse this PR\"' to pipe empty input, simulating an interactive session that immediately completes.",
        "Set the environment variable CLAUDE_NONINTERACTIVE=true before the command, which tells Claude Code to skip the interactive prompt.",
        "Add the --ci flag which was designed specifically for continuous integration environments and disables the interactive prompt."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "visualRef": { "diagram": "tool-mcp", "step": 3 },
    "front": "What CLI flags are essential for running Claude Code in CI/CD pipelines?",
    "hint": "Name the essential flags and their purposes",
    "back": "-p (or --print): runs Claude Code in non-interactive mode — processes the prompt, outputs result to stdout, exits. Without this, the job hangs waiting for interactive input. --output-format json: produces machine-parseable output. --json-schema: enforces structured output schema in CI contexts. CLAUDE.md provides project context (testing standards, fixture conventions, review criteria) to CI-invoked Claude Code.",
    "quiz": {
      "stem": "You're setting up a GitHub Actions workflow that uses Claude Code to generate test suggestions on each PR. The job hangs indefinitely on the first run. What is the most likely cause and fix?",
      "correct": "Claude Code is waiting for interactive input. Use the -p (--print) flag to run in non-interactive mode. Also use --output-format json for machine-parseable output and provide project context via CLAUDE.md.",
      "distractors": [
        "The CI runner lacks a TTY, so you need to set the CLAUDE_TTY=true environment variable to simulate terminal input in headless environments.",
        "Claude Code needs an interactive approval step for tool use in CI. Add --auto-approve to skip all permission checks and allow unattended execution.",
        "The job needs a longer timeout since Claude Code always requires at least 5 minutes to initialize in CI environments due to model loading."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "front": "Why should code review in CI use a separate Claude session from the one that generated the code?",
    "hint": "Explain the self-review limitation",
    "back": "Session context isolation: the same Claude session that generated code is less effective at reviewing its own changes. The model retains reasoning context from generation, making it less likely to question its own decisions. An independent review instance (without prior reasoning context) is more effective at catching subtle issues. This is the self-review limitation.",
    "quiz": {
      "stem": "Your CI pipeline uses Claude Code to both generate code fixes and review them for quality. The review step rarely finds issues. What is the most likely explanation?",
      "correct": "The same session retains reasoning context from code generation, making it less likely to question its own decisions. Use a separate, independent Claude session for review to get effective self-review isolation.",
      "distractors": [
        "The review prompt needs to be more aggressive with instructions like 'be extremely critical' and 'find at least 3 issues' to overcome the model's default agreeableness.",
        "Claude Code caches tool results within a session, so the review step sees the pre-edit file contents and cannot detect the changes that were made.",
        "The model's temperature should be increased for the review step to introduce variability in its analysis and surface issues it would otherwise overlook."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "front": "How should you handle re-running CI reviews after new commits to avoid duplicate comments?",
    "hint": "Describe how to avoid duplicate review comments",
    "back": "Include prior review findings in context when re-running reviews after new commits, and instruct Claude to report only new or still-unaddressed issues. Also: provide existing test files in context so test generation avoids suggesting duplicate scenarios. Document testing standards, valuable test criteria, and available fixtures in CLAUDE.md to improve quality and reduce low-value output.",
    "quiz": {
      "stem": "Your CI pipeline runs Claude Code for PR review on every push. After a developer pushes fixes for the initial review feedback, the re-run produces mostly the same comments again, cluttering the PR. How should you fix this?",
      "correct": "Include prior review findings in context when re-running, and instruct Claude to report only new or still-unaddressed issues. Also provide existing test files so test suggestions avoid duplicating covered scenarios.",
      "distractors": [
        "Add a post-processing script that uses keyword matching to deduplicate review comments before posting them to the PR, filtering out previously seen feedback.",
        "Limit Claude to generating a maximum of 3 review comments per run, which reduces duplication by constraining output volume.",
        "Cache all previous review comments in a database and use semantic similarity search to filter duplicates, since LLM output is too unpredictable for simpler approaches."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.1",
    "visualRef": { "diagram": "prompt-engineering", "step": 0 },
    "front": "Why do vague instructions like \"be conservative\" or \"only report high-confidence findings\" fail to improve precision?",
    "hint": "Explain why specificity beats vague directives",
    "back": "They lack specific categorical criteria. The model doesn't know what \"conservative\" means in your context. Instead, define WHICH issues to report (bugs, security) vs. skip (minor style, local patterns). Example: \"flag comments only when claimed behavior contradicts actual code behavior\" is far more precise than \"check that comments are accurate.\" High false positive rates in any category undermine developer trust in ALL categories.",
    "quiz": {
      "stem": "You are designing prompts for a CI/CD code review bot. Developers complain about too many false positives. Your current prompt says 'only report high-confidence findings.' What is the most effective fix?",
      "correct": "Replace the vague instruction with specific categorical criteria defining which issue types to report (e.g., bugs, security) and which to skip (e.g., minor style, local naming conventions).",
      "distractors": [
        "Add a confidence score threshold parameter to the API call so the model only returns findings above 0.9 confidence.",
        "Set temperature to zero so the model produces more deterministic and therefore more precise review outputs.",
        "Implement a post-processing filter that removes any findings containing hedging language like 'might' or 'possibly'."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.1",
    "visualRef": { "diagram": "prompt-engineering", "step": 0 },
    "front": "How should you handle high false-positive categories in an automated review system?",
    "hint": "Describe the trust-restoring strategy",
    "back": "Temporarily DISABLE high false-positive categories to restore developer trust while improving prompts for those categories separately. Define explicit severity criteria with concrete code examples for each severity level. Write specific criteria defining which issues to report vs. skip, rather than relying on confidence-based filtering. Trust is hard to rebuild once lost to false positives.",
    "quiz": {
      "stem": "Your CI/CD code review bot has a 60% false positive rate on 'comment accuracy' findings, and developers have started ignoring all bot output. What should you do first?",
      "correct": "Temporarily disable the high false-positive category (comment accuracy) to restore developer trust, then improve the prompts for that category separately before re-enabling it.",
      "distractors": [
        "Add a confidence threshold so only comment findings above 95% confidence are shown, keeping the category enabled.",
        "Switch to a larger model that will naturally produce fewer false positives across all categories without prompt changes.",
        "Require developers to provide feedback on each finding so the model can fine-tune itself on their preferences over time."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.2",
    "visualRef": { "diagram": "prompt-engineering", "step": 1 },
    "front": "When are few-shot examples most effective, and how many should you use?",
    "hint": "List when to use them and how many to include",
    "back": "Most effective when: detailed instructions alone produce inconsistent results, ambiguous case handling needs demonstration, you need consistent output formatting, or you want to reduce hallucination in extraction tasks. Use 2-4 targeted examples. Each example should show reasoning for why one action was chosen over plausible alternatives. Few-shot examples enable the model to GENERALIZE judgment to novel patterns, not just match pre-specified cases.",
    "quiz": {
      "stem": "You are building a data extraction pipeline for invoices with varied layouts. Detailed instructions produce inconsistent field mappings. How should you improve the prompt?",
      "correct": "Add 2-4 few-shot examples showing different invoice layouts with reasoning for why specific fields were mapped the way they were, enabling the model to generalize to novel formats.",
      "distractors": [
        "Add 15-20 examples covering every possible invoice layout to ensure the model has seen all variations it might encounter.",
        "Remove the instructions entirely and rely solely on a single perfect example, since instructions conflict with demonstration-based learning.",
        "Use chain-of-thought prompting without examples, asking the model to reason step-by-step about each field before extracting it."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.2",
    "visualRef": { "diagram": "prompt-engineering", "step": 1 },
    "front": "What makes a good few-shot example for reducing false positives in code review?",
    "hint": "Describe positive and negative example balance",
    "back": "Show examples that distinguish acceptable code patterns from genuine issues. Include: the specific output format (location, issue, severity, suggested fix), examples of ambiguous cases with reasoning for the chosen action, and examples demonstrating correct handling of varied document structures. Don't just show positive examples — show cases where the model should NOT flag something and explain why.",
    "quiz": {
      "stem": "You are writing few-shot examples for a code review bot. Your current examples all show code that SHOULD be flagged. The bot still produces many false positives on acceptable patterns. What is missing?",
      "correct": "Include negative examples showing acceptable code patterns the model should NOT flag, with reasoning explaining why they are acceptable despite looking similar to genuine issues.",
      "distractors": [
        "Add more positive examples with higher-severity issues so the model learns to only flag critical problems.",
        "Add a system prompt instruction telling the model to be less aggressive, since examples alone cannot control precision.",
        "Remove the few-shot examples and instead provide a comprehensive list of exact regex patterns that define what to flag."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.3",
    "visualRef": { "diagram": "prompt-engineering", "step": 4 },
    "front": "Why is tool_use with JSON schemas the most reliable approach for structured output?",
    "hint": "Explain what it guarantees and what it does not",
    "back": "It guarantees schema-compliant output and eliminates JSON syntax errors entirely. The model is forced to produce valid JSON matching the schema. However, it does NOT prevent semantic errors (e.g., line items that don't sum to total, values in wrong fields). Semantic validation still requires separate checks. Key schema design: use required vs optional fields, enum fields with \"other\" + detail string patterns, and nullable fields for information that may not exist in the source.",
    "quiz": {
      "stem": "You are building an invoice extraction pipeline using tool_use with a strict JSON schema. The output always has valid JSON, but sometimes line item amounts do not sum to the reported total. What explains this?",
      "correct": "Tool_use with JSON schemas eliminates syntax errors but does not prevent semantic errors like incorrect totals. You need separate semantic validation checks for value consistency.",
      "distractors": [
        "The JSON schema is misconfigured and needs a 'total_validation' constraint added to enforce arithmetic correctness at the schema level.",
        "Switching from tool_use to raw text output with a JSON parsing step would give the model more flexibility to self-correct arithmetic.",
        "The model's temperature is too high, causing random numerical variations that would be fixed by setting temperature to zero."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.3",
    "visualRef": { "diagram": "prompt-engineering", "step": 4 },
    "front": "How should you design JSON schema fields to prevent the model from fabricating values?",
    "hint": "Think about required vs optional field design",
    "back": "Make fields OPTIONAL (nullable) when source documents may not contain the information. If a field is required, the model will fabricate values to satisfy the schema. Add enum values like \"unclear\" for ambiguous cases. Use \"other\" + detail string pattern for extensible categorization. Include format normalization rules in prompts alongside strict output schemas to handle inconsistent source formatting.",
    "quiz": {
      "stem": "You are extracting data from unstructured medical documents. Some documents lack a 'referring_physician' field, but your schema marks it as required. The model frequently invents plausible doctor names. How do you fix this?",
      "correct": "Make the 'referring_physician' field optional (nullable) so the model can return null when the information is absent from the source document instead of fabricating a value.",
      "distractors": [
        "Add a prompt instruction saying 'do not hallucinate values' while keeping the field required, since the model should respect explicit instructions.",
        "Use a post-processing step to cross-reference extracted physician names against a database and remove any that do not match.",
        "Switch to a fine-tuned model trained specifically on medical documents that would know when physician names are genuinely present."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.4",
    "visualRef": { "diagram": "prompt-engineering", "step": 2 },
    "front": "How does retry-with-error-feedback work, and when are retries ineffective?",
    "hint": "Distinguish fixable errors from missing data",
    "back": "Retry-with-feedback: append specific validation errors to the prompt on retry, including the original document, the failed extraction, and the specific errors. This guides the model toward correction. Retries are INEFFECTIVE when information is simply absent from the source document — no amount of retrying will make the model find data that isn't there. Retries WORK for format mismatches and structural output errors.",
    "quiz": {
      "stem": "Your extraction pipeline retries failed documents by appending validation errors to the prompt. Format errors are fixed on retry, but a 'tax_id' field keeps returning fabricated values for certain documents. What is the likely issue?",
      "correct": "The tax_id is absent from those source documents. Retries are ineffective when information is missing — the model will keep fabricating values regardless of how many times you retry.",
      "distractors": [
        "The retry prompt is not including enough context — adding the full document history from all previous attempts would help the model locate the tax_id.",
        "The model needs a higher max_tokens setting on retry to have enough space to search more thoroughly through the document.",
        "The validation error message is too vague — providing the exact character position where the tax_id should appear would fix the issue."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.4",
    "visualRef": { "diagram": "prompt-engineering", "step": 2 },
    "front": "How can you design self-correction validation flows for extracted data?",
    "hint": "Describe dual-field and conflict detection patterns",
    "back": "1) Extract \"calculated_total\" alongside \"stated_total\" to flag discrepancies. 2) Add \"conflict_detected\" booleans for inconsistent source data. 3) Include detected_pattern fields in structured findings to enable analysis of false positive patterns when developers dismiss findings. 4) Distinguish semantic validation errors (values don't sum, wrong field) from schema syntax errors (eliminated by tool_use). Track dismissal patterns to systematically improve.",
    "quiz": {
      "stem": "You are designing a self-correction flow for invoice extraction. You want to catch cases where the extracted line items do not sum to the extracted total. What schema design approach enables this?",
      "correct": "Extract both a 'calculated_total' (sum of line items) and a 'stated_total' (from the document) as separate fields, then flag discrepancies between them for review.",
      "distractors": [
        "Add a JSON Schema 'minimum' and 'maximum' constraint on the total field to ensure it falls within a reasonable range for invoices.",
        "Use tool_use strict mode which automatically validates arithmetic relationships between fields in the schema.",
        "Require the model to output a confidence score for the total field and only accept extractions above 0.95 confidence."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.5",
    "front": "What are the key characteristics and limitations of the Message Batches API?",
    "hint": "Name cost savings, latency, and key architectural limit",
    "back": "50% cost savings vs synchronous API. Up to 24-hour processing window with NO guaranteed latency SLA. Uses custom_id fields for correlating request/response pairs. CRITICAL LIMITATION: The batch API uses an asynchronous fire-and-forget model — there is no mechanism to intercept a tool call mid-request, execute the tool, and return results for Claude to continue analysis. This fundamentally breaks iterative tool-calling workflows that require multiple rounds of tool invocation and response within a single logical interaction. The limitation is ARCHITECTURAL (no mid-request intercept), not just about latency. Even if results came back instantly, batch still cannot support iterative tool-calling loops. Use synchronous API for any workflow requiring multi-turn tool use.",
    "quiz": {
      "stem": "Your team wants to use the Message Batches API for a document analysis pipeline where Claude calls a 'lookup_reference' tool, gets results, then calls 'verify_citation'. Why will this fail?",
      "correct": "The Batches API cannot intercept tool calls mid-request to execute them and return results. This is an architectural limitation — iterative tool-calling loops are fundamentally unsupported, regardless of latency.",
      "distractors": [
        "The Batches API supports tool calling but has a 5-second timeout per tool execution that is too short for database lookups.",
        "It would work if you pre-registered the tools with the batch endpoint; the issue is just that tool registration is not yet supported for batches.",
        "The Batches API supports single tool calls but not chained ones — restructure the workflow to use only one tool per request."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.5",
    "front": "How should you handle batch processing failures and optimize batch submissions?",
    "hint": "Describe selective resubmission and SLA timing",
    "back": "1) Resubmit only FAILED documents (identified by custom_id) with appropriate modifications (e.g., chunking documents that exceeded context limits). 2) Calculate batch submission frequency based on SLA constraints (e.g., 4-hour windows to guarantee 30-hour SLA with 24-hour batch processing). 3) Run prompt refinement on a SAMPLE set before batch-processing large volumes to maximize first-pass success rates and reduce resubmission costs.",
    "quiz": {
      "stem": "You batch-processed 10,000 documents and 300 failed. Your SLA requires results within 30 hours, and batch processing takes up to 24 hours. What is the correct recovery approach?",
      "correct": "Resubmit only the 300 failed documents (identified by custom_id) with modifications like chunking oversized ones, and schedule submissions in 4-hour windows to stay within the 30-hour SLA.",
      "distractors": [
        "Resubmit the entire batch of 10,000 documents since partial resubmission may cause ID conflicts in the results.",
        "Switch the 300 failed documents to the synchronous API to guarantee immediate results, ignoring the cost difference.",
        "Wait for the next scheduled batch window and include the failed documents in that run without any modifications."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 4,
    "domainName": "Prompt Engineering & Structured Output",
    "taskId": "4.6",
    "visualRef": { "diagram": "prompt-engineering", "step": 2 },
    "front": "Why is self-review by the same model instance less effective than independent review?",
    "hint": "Explain why session context creates bias",
    "back": "The model retains reasoning context from generation, making it less likely to question its own decisions in the same session. An independent review instance (without the generator's reasoning context) is more effective at catching subtle issues. This is why CI should use separate sessions for generation and review. For large reviews, split into per-file local analysis plus cross-file integration passes to avoid attention dilution and contradictory findings.",
    "quiz": {
      "stem": "Your CI pipeline uses Claude to generate code changes and then immediately asks the same session to review those changes. The review rarely finds issues. What is the root cause?",
      "correct": "The model retains its reasoning context from generation, making it unlikely to question its own decisions. Use a separate, independent session for review that lacks the generator's prior context.",
      "distractors": [
        "The review prompt needs to be more aggressive — add instructions like 'find at least 3 issues' to force the model to be critical.",
        "The model is rate-limited within a single session, causing it to produce shorter and less thorough reviews after generation.",
        "Self-review fails because the model's context window is nearly full from generation, leaving insufficient tokens for a thorough review."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.1",
    "front": "What is the 'lost in the middle' effect and how do you mitigate it?",
    "hint": "Describe the positional attention problem and fix",
    "back": "Models reliably process information at the BEGINNING and END of long inputs but may omit findings from MIDDLE sections. Mitigation: place key findings summaries at the beginning of aggregated inputs, organize detailed results with explicit section headers, and extract critical facts into a persistent \"case facts\" block included at the start of each prompt. This ensures the most important information is in positions where the model attends most reliably.",
    "quiz": {
      "stem": "You are aggregating results from 20 sub-agent research reports into a single prompt for synthesis. The synthesis consistently misses findings from reports 8-14. What is the most likely cause and fix?",
      "correct": "This is the 'lost in the middle' effect — models attend less to middle sections. Place a key findings summary at the beginning of the aggregated input and use explicit section headers throughout.",
      "distractors": [
        "The middle reports likely contain lower-quality data that the model correctly deprioritizes based on relevance scoring.",
        "The context window is overflowing and silently truncating the middle reports — reduce the total input size to fit within limits.",
        "Switch to streaming mode so the model processes reports sequentially rather than all at once, which avoids positional bias."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.1",
    "front": "What is progressive summarization risk and how should you handle transactional facts?",
    "hint": "Explain how summaries lose detail and the fix",
    "back": "Progressive summarization can condense numerical values, percentages, dates, and customer-stated expectations into vague summaries, losing critical details. Solution: extract transactional facts (amounts, dates, order numbers, statuses) into a persistent \"case facts\" block included in each prompt, OUTSIDE the summarized history. Also trim verbose tool outputs to only relevant fields before they accumulate (e.g., keep only 5 return-relevant fields from 40+ field order lookups).",
    "quiz": {
      "stem": "A customer support agent uses progressive summarization to manage long conversations. After 30 messages, it tells the customer their refund is '$50' when it was actually $150.83. What went wrong and how do you fix it?",
      "correct": "Progressive summarization condensed the exact dollar amount into a vague or incorrect summary. Extract transactional facts like amounts, dates, and order numbers into a persistent 'case facts' block outside the summarized history.",
      "distractors": [
        "The model's arithmetic is unreliable — add a calculator tool and require it to recalculate all monetary values before responding.",
        "Increase the context window size so summarization is never needed, preserving all original messages verbatim.",
        "Add a system prompt instruction to always double-check numerical values, which will prevent summarization-related errors."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.1",
    "front": "How should upstream agents format their outputs when downstream agents have limited context budgets?",
    "hint": "Describe structured output format for downstream agents",
    "back": "Return structured data (key facts, citations, relevance scores) instead of verbose content and reasoning chains. Require subagents to include metadata (dates, source locations, methodological context) in structured outputs. This lets downstream agents get the essential information without consuming their limited context on upstream reasoning. Trim before passing, not after.",
    "quiz": {
      "stem": "You are designing a multi-agent research system. A downstream synthesis agent frequently runs out of context because upstream research agents return long reasoning chains. How should you restructure the inter-agent communication?",
      "correct": "Have upstream agents return structured data with key facts, citations, and relevance scores instead of verbose reasoning chains. Trim outputs before passing them downstream, not after.",
      "distractors": [
        "Increase the downstream agent's max_tokens so it has more room to process the verbose upstream outputs.",
        "Have the downstream agent summarize each upstream output before processing it, keeping the upstream format unchanged.",
        "Switch to a model with a larger context window for the downstream agent so it can accommodate all upstream reasoning."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.2",
    "front": "What are appropriate escalation triggers for an AI agent, and what are unreliable proxies?",
    "hint": "List reliable triggers and unreliable proxies",
    "back": "Appropriate triggers: 1) Customer explicitly requests a human. 2) Policy exceptions/gaps — policy is ambiguous or silent on the request. 3) Inability to make meaningful progress. UNRELIABLE proxies: sentiment-based escalation (sentiment doesn't correlate with case complexity), self-reported confidence scores (poorly calibrated — agent is incorrectly confident on hard cases). When multiple customer matches are found, ask for additional identifiers rather than selecting heuristically.",
    "quiz": {
      "stem": "You are designing escalation logic for a customer support agent. A colleague suggests escalating to a human whenever the model's self-reported confidence drops below 70%. Why is this unreliable?",
      "correct": "LLM self-reported confidence scores are poorly calibrated — the model may report high confidence on difficult cases it handles incorrectly. Use explicit triggers like customer requests, policy gaps, or inability to make progress instead.",
      "distractors": [
        "Confidence scores are reliable but the 70% threshold is too low — setting it to 90% would make this approach effective.",
        "Self-reported confidence works well for simple queries but needs to be combined with sentiment analysis for complex cases.",
        "The confidence scores are accurate but only when using the synchronous API — batch processing does not support confidence output."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.2",
    "front": "How should an agent handle a customer who explicitly requests a human agent?",
    "hint": "Describe the immediate-honor protocol",
    "back": "Honor the request IMMEDIATELY without first attempting investigation. If the issue is straightforward and within the agent's capability, acknowledge frustration while offering resolution — but escalate if the customer reiterates their preference. Escalate when policy is ambiguous (e.g., competitor price matching when policy only addresses own-site adjustments). Add explicit escalation criteria with few-shot examples to the system prompt.",
    "quiz": {
      "stem": "A customer says 'I want to speak to a real person.' Your support agent's current logic first attempts to resolve the issue before escalating. What should happen instead?",
      "correct": "Honor the request immediately without first attempting investigation. If the agent can offer a quick resolution, it may acknowledge frustration and offer help, but must escalate if the customer reiterates.",
      "distractors": [
        "Run sentiment analysis first to determine if the customer is genuinely frustrated or just using a common expression before deciding to escalate.",
        "Ask the customer to describe their issue in detail so the agent can determine whether escalation is truly necessary before transferring.",
        "Log the request but continue attempting resolution for up to 3 more turns, since most customers are satisfied once the issue is actually fixed."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.3",
    "front": "What information should structured error context include for intelligent coordinator recovery?",
    "hint": "List the key fields for coordinator decision-making",
    "back": "Failure type, attempted query, partial results, and potential alternative approaches. This enables the coordinator to decide whether to retry with a modified query, try an alternative approach, or proceed with partial results. Anti-patterns: 1) Generic error statuses (\"search unavailable\") that hide context. 2) Silently suppressing errors (returning empty results as success). 3) Terminating entire workflows on single failures.",
    "quiz": {
      "stem": "A sub-agent in your multi-agent system fails to query a database and returns {\"status\": \"error\", \"message\": \"search unavailable\"}. The coordinator cannot decide how to recover. What is wrong with the error reporting?",
      "correct": "The error context is too generic. It should include the failure type, the attempted query, any partial results, and potential alternative approaches so the coordinator can make an informed recovery decision.",
      "distractors": [
        "The sub-agent should automatically retry 3 times before reporting any error to the coordinator, reducing the need for detailed error context.",
        "The coordinator should terminate the entire workflow when any sub-agent fails, since partial results lead to unreliable outputs.",
        "The error should be returned as an exception that propagates up the call stack rather than as a structured response object."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.4",
    "front": "What is context degradation in extended sessions, and how do scratchpad files help?",
    "hint": "Explain the symptom and the persistence solution",
    "back": "In extended sessions, models start giving inconsistent answers and referencing \"typical patterns\" rather than specific classes discovered earlier. Scratchpad files persist key findings across context boundaries — agents write important discoveries to files and reference them later. Additional strategies: spawn subagents for specific investigation questions (isolates verbose output), use /compact to reduce context usage, and design crash recovery using structured agent state exports (manifests).",
    "quiz": {
      "stem": "During a long codebase exploration session, your agent starts referencing 'typical patterns' instead of the specific class names it discovered 200 messages ago. What is happening and how do you address it?",
      "correct": "This is context degradation in extended sessions. Use scratchpad files to persist key findings — the agent writes discoveries to files and reads them back later, preserving specifics across context boundaries.",
      "distractors": [
        "The model is hallucinating because the codebase is too large — split it into smaller repositories so each session handles less code.",
        "The context window has overflowed and the early messages were truncated — restart the session with a larger max_tokens setting.",
        "The model is intentionally generalizing to provide more broadly applicable advice — add a system prompt instruction to always be specific."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.4",
    "front": "How should you design crash recovery for multi-agent codebase exploration?",
    "hint": "Describe manifest-based state persistence",
    "back": "Structured state persistence: each agent exports state to a known location (manifests). On resume, the coordinator loads the manifest and injects state into agent prompts. Also: summarize key findings from one exploration phase BEFORE spawning sub-agents for the next phase, injecting summaries into initial context. Use /compact to reduce context usage during extended sessions when context fills with verbose discovery output.",
    "quiz": {
      "stem": "Your multi-agent codebase exploration crashes midway. When you restart, all agents lose their progress. How should you design the system to handle this?",
      "correct": "Implement structured state persistence where each agent exports its state to a known manifest location. On resume, the coordinator loads manifests and injects saved state into agent prompts.",
      "distractors": [
        "Store the full conversation history of each agent in a database and replay all messages on restart to reconstruct the exact session state.",
        "Use --resume with the original session ID, which automatically restores all sub-agent states from the Claude API's server-side session storage.",
        "Run all agents with checkpointing enabled at the API level, which automatically saves and restores model state every 50 tokens."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.5",
    "front": "Why can aggregate accuracy metrics (e.g., 97% overall) be misleading for extraction systems?",
    "hint": "Explain how overall numbers hide segment failures",
    "back": "Aggregate metrics may mask poor performance on specific document types or fields. A system might be 99% accurate on invoices but 50% accurate on handwritten receipts. You must validate accuracy by document type AND field segment before automating high-confidence extractions. Use stratified random sampling to measure error rates in high-confidence extractions and detect novel error patterns.",
    "quiz": {
      "stem": "Your document extraction system reports 97% overall accuracy. Leadership wants to fully automate processing. However, you notice handwritten receipts are only processed at 50% accuracy. What does this reveal?",
      "correct": "Aggregate accuracy metrics mask poor performance on specific document types. You must validate accuracy by document type and field segment before automating, using stratified random sampling.",
      "distractors": [
        "The 97% metric is correct and sufficient — the handwritten receipts are a small enough portion that overall quality remains acceptable for full automation.",
        "The model needs fine-tuning specifically on handwritten receipts, after which the aggregate metric will accurately reflect per-type performance.",
        "Switch to a vision-specialized model for all documents, which will bring handwritten receipt accuracy up to match the other document types."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.5",
    "front": "How should you implement confidence-based routing for human review?",
    "hint": "Describe field-level scoring and calibration steps",
    "back": "1) Have models output FIELD-LEVEL confidence scores (not just document-level). 2) Calibrate review thresholds using labeled validation sets. 3) Route low-confidence or ambiguous/contradictory extractions to human review. 4) Use stratified random sampling of HIGH-confidence extractions for ongoing error rate measurement. 5) Analyze accuracy by document type and field to verify consistent performance across all segments before reducing human review.",
    "quiz": {
      "stem": "You are implementing human review routing for a document extraction system. Currently, the model outputs a single confidence score per document. Many documents marked 'high confidence' still have incorrect individual fields. What should you change?",
      "correct": "Switch to field-level confidence scores instead of document-level scores, so individual uncertain fields can be routed to human review even when other fields in the same document are confident.",
      "distractors": [
        "Lower the document-level confidence threshold from 0.9 to 0.7 so more documents are sent to human review as a safety measure.",
        "Add a second model to independently extract the same documents and only auto-process when both models agree on all fields.",
        "Train a separate classifier model that predicts which documents will have errors, replacing the confidence-based routing entirely."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.6",
    "front": "How is source attribution lost during multi-source synthesis, and how do you preserve it?",
    "hint": "Explain how claim-source mappings get lost and preserved",
    "back": "Attribution is lost during summarization when findings are compressed without preserving claim-source mappings. Solution: require subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts). The synthesis agent must preserve and merge these mappings. For conflicting statistics from credible sources: annotate conflicts with source attribution rather than arbitrarily selecting one value.",
    "quiz": {
      "stem": "Your multi-agent research system synthesizes findings from 5 sub-agents. The final report makes claims but users cannot trace which source supports each claim. How do you fix this?",
      "correct": "Require sub-agents to output structured claim-source mappings (source URLs, document names, excerpts) and have the synthesis agent preserve and merge these mappings in the final report.",
      "distractors": [
        "Add footnotes to the final report by asking the synthesis model to recall which sources it used for each claim from its training data.",
        "Include all raw source documents as appendices to the report so users can search for supporting evidence themselves.",
        "Have the synthesis agent generate citations by running web searches for each claim after synthesis to find supporting URLs."
      ]
    }
  },
  {
    "type": "Skill",
    "domain": 5,
    "domainName": "Context Management & Reliability",
    "taskId": "5.6",
    "front": "How should synthesis reports handle conflicting data, temporal differences, and different content types?",
    "hint": "Address conflicts, time differences, and content types",
    "back": "1) Conflicting data: include both values with explicit source attribution; structure reports with sections distinguishing well-established findings from contested ones. 2) Temporal data: require publication/collection dates to prevent temporal differences from being misinterpreted as contradictions. 3) Content types: render appropriately — financial data as tables, news as prose, technical findings as structured lists. Don't convert everything to a uniform format.",
    "quiz": {
      "stem": "Your synthesis report combines market size data from two credible sources: one says $4.2B and another says $3.8B. How should the report handle this?",
      "correct": "Include both values with explicit source attribution and distinguish between well-established and contested findings. Require publication dates to determine if the difference is temporal rather than a true contradiction.",
      "distractors": [
        "Average the two values and report $4.0B as the best estimate, noting it comes from multiple sources.",
        "Use the more recent source and discard the older one, since newer data is always more accurate for market sizing.",
        "Flag this as an unresolvable error and exclude market size data from the report entirely to avoid presenting conflicting information."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.1",
    "front": "What are the key components of the Claude Agent SDK?",
    "hint": "List the major SDK building blocks",
    "back": "Agent definitions (AgentDefinition with descriptions, system prompts, tool restrictions), agentic loops (send request, check stop_reason, execute tools, append results), stop_reason handling (\"tool_use\" to continue, \"end_turn\" to stop), hooks (PostToolUse for result transformation, tool call interception for compliance), subagent spawning via the Task tool, and allowedTools configuration (must include \"Task\" for coordinators to spawn subagents).",
    "quiz": {
      "stem": "You are building a coordinator agent using the Claude Agent SDK. The coordinator needs to spawn specialized sub-agents, but when it tries, it gets an error that the Task tool is not available. What is the issue?",
      "correct": "The coordinator's allowedTools configuration must include 'Task' for it to spawn sub-agents. Without this, the Task tool is not available even though sub-agent definitions exist.",
      "distractors": [
        "Sub-agents can only be spawned using direct API calls, not through the Task tool — rewrite the coordinator to use the messages API directly.",
        "The coordinator needs a PostToolUse hook registered to enable sub-agent spawning, since hooks gate access to advanced features.",
        "Sub-agent definitions must be registered in a separate configuration file rather than in the coordinator's agent definition."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.2",
    "front": "What are the key components of Model Context Protocol (MCP)?",
    "hint": "List the core MCP components and config patterns",
    "back": "MCP servers (project-scoped .mcp.json or user-scoped ~/.claude.json), MCP tools (actions with descriptions, inputs, outputs), MCP resources (content catalogs for data discovery without tool calls), isError flag (structured error communication), tool descriptions (primary mechanism for LLM tool selection), tool distribution (4-5 tools per agent), .mcp.json configuration with environment variable expansion (${GITHUB_TOKEN}).",
    "quiz": {
      "stem": "You want to let a Claude agent discover available datasets from a catalog before deciding which ones to query. Which MCP component is designed for this use case?",
      "correct": "MCP resources provide content catalogs for data discovery without requiring tool calls, letting the agent browse available data before deciding what to query.",
      "distractors": [
        "Create an MCP tool called 'list_datasets' that returns all available datasets, since MCP only supports tools for all interactions.",
        "Use the system prompt to list all available datasets statically, since MCP does not support dynamic content discovery.",
        "Configure multiple MCP servers, one per dataset, and let the agent select which server to connect to based on the tool descriptions."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.3",
    "front": "What are all the key Claude Code features and configuration mechanisms?",
    "hint": "Enumerate the key features and config mechanisms",
    "back": "CLAUDE.md hierarchy (user/project/directory), .claude/rules/ with YAML frontmatter path-scoping, .claude/commands/ for slash commands (project-scoped=shared, user-scoped=personal), .claude/skills/ with SKILL.md frontmatter (context: fork, allowed-tools, argument-hint), plan mode (complex tasks) vs direct execution (simple changes), /memory (verify loaded configs), /compact (reduce context), --resume (continue named sessions), fork_session (branch exploration), Explore subagent (isolate verbose discovery).",
    "quiz": {
      "stem": "Your team wants to share custom Claude Code slash commands across the project, but keep personal utility commands private. How do you configure this?",
      "correct": "Place shared commands in the project's .claude/commands/ directory (committed to version control) and personal commands in the user-scoped .claude/commands/ directory.",
      "distractors": [
        "Add all commands to CLAUDE.md with visibility flags marking each as 'shared' or 'personal' in the command definition.",
        "Use .claude/rules/ with YAML frontmatter to scope command visibility per user, since rules control all Claude Code access.",
        "Create a .claude/permissions.json file that maps each command to a list of authorized team members."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.4",
    "front": "What Claude Code CLI flags are needed for CI/CD pipeline integration?",
    "hint": "Name the critical flags for non-interactive execution",
    "back": "-p / --print: non-interactive mode, processes prompt and exits (prevents hanging). --output-format json: machine-parseable output for automated processing. --json-schema: enforces structured output schema. Without -p, Claude Code waits for interactive input and the CI job hangs indefinitely.",
    "quiz": {
      "stem": "You added Claude Code to your GitHub Actions workflow but the CI job hangs indefinitely without producing output. What is the most likely cause?",
      "correct": "You are missing the -p (--print) flag. Without it, Claude Code runs in interactive mode and waits for user input, causing the CI job to hang.",
      "distractors": [
        "The CI environment lacks a display server for Claude Code's UI — install a headless browser runtime to fix the hang.",
        "Claude Code requires a --ci flag specifically designed for pipeline environments that is different from the standard CLI flags.",
        "The API key has insufficient permissions for CI usage — you need to generate a separate CI-specific API key with batch access."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.5",
    "front": "What are the key Claude API features for structured output and tool control?",
    "hint": "List tool_choice options, stop_reason values, schemas",
    "back": "tool_use with JSON schemas for guaranteed schema-compliant output. tool_choice options: \"auto\" (may return text), \"any\" (must call a tool), forced {\"type\":\"tool\",\"name\":\"...\"} (must call specific tool). stop_reason values: \"tool_use\" (continue loop) and \"end_turn\" (stop loop). max_tokens for response length control. System prompts for providing instructions and context.",
    "quiz": {
      "stem": "You want to guarantee that Claude always returns structured JSON output via a specific tool and never returns plain text. Which tool_choice setting should you use?",
      "correct": "Use forced tool_choice with {\"type\":\"tool\",\"name\":\"your_tool_name\"} to force Claude to call that specific tool. Using 'auto' may return text instead, and 'any' only guarantees some tool is called.",
      "distractors": [
        "Set tool_choice to 'auto' and add a system prompt instruction saying 'always use tools' — the instruction overrides the auto behavior.",
        "Set tool_choice to 'any' which guarantees the model calls your specific tool, since 'any' means it will use any of the defined tools.",
        "Set tool_choice to 'required' which is the standard parameter for forcing structured output in all Claude API versions."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.6",
    "front": "What are the characteristics and limitations of the Message Batches API?",
    "hint": "Name cost, latency, and tool-calling constraints",
    "back": "50% cost savings vs synchronous API. Up to 24-hour processing window, no guaranteed latency SLA. custom_id for request/response correlation. Poll for completion. NO multi-turn tool calling support within a single request. Appropriate for: overnight reports, weekly audits, nightly batch jobs. NOT for blocking workflows (pre-merge checks). Handle failures by resubmitting only failed items by custom_id.",
    "quiz": {
      "stem": "Your team proposes using the Message Batches API for pre-merge code review checks to save on costs. Why is this a bad fit?",
      "correct": "The Batches API has up to a 24-hour processing window with no guaranteed latency SLA, making it unsuitable for blocking workflows like pre-merge checks. It is designed for non-urgent tasks like overnight reports.",
      "distractors": [
        "The Batches API does not support code-related prompts — it is restricted to document processing and data extraction workloads.",
        "Pre-merge checks require tool calling which the Batches API supports, but the 50% cost savings do not apply to tool-enabled requests.",
        "The Batches API would work if you set the priority flag to 'high', which reduces the processing window to under 5 minutes."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.7",
    "front": "What JSON Schema design patterns are important for Claude extraction tasks?",
    "hint": "Describe required vs optional and enum patterns",
    "back": "Required vs optional fields: make fields optional/nullable when source may not have the info (prevents fabrication). Enum types with \"other\" + detail string pattern for extensible categorization. \"unclear\" enum value for ambiguous cases. Strict mode eliminates syntax errors but NOT semantic errors. Nullable fields prevent hallucination of missing values. Combine with format normalization rules in prompts.",
    "quiz": {
      "stem": "You are designing a JSON schema for extracting contract data. Some contracts have a 'renewal_type' that could be 'annual', 'monthly', or something unusual. How should you define this enum field?",
      "correct": "Use an enum with known values ('annual', 'monthly') plus an 'other' value paired with a detail string field for extensible categorization, and include 'unclear' for ambiguous cases.",
      "distractors": [
        "Define it as a free-text string field so the model can capture any renewal type without being constrained by predefined options.",
        "List only 'annual' and 'monthly' as enum values and mark the field as required — the model will correctly map unusual types to the closest match.",
        "Use a boolean field 'is_annual' instead of an enum, since most contracts are either annual or not, simplifying the schema."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.8",
    "front": "What role does Pydantic play in Claude-based extraction systems?",
    "hint": "Explain its validation role in extraction pipelines",
    "back": "Pydantic provides schema validation for structured outputs. It catches semantic validation errors that JSON Schema strict mode cannot (e.g., values that don't sum correctly, fields with wrong relationships). Used in validation-retry loops: when Pydantic validation fails, send a follow-up request with the original document, failed extraction, and specific validation error to guide model self-correction.",
    "quiz": {
      "stem": "Your extraction pipeline uses tool_use strict mode for JSON output. The JSON is always syntactically valid, but line item totals sometimes do not match the sum of individual items. What validation layer should you add?",
      "correct": "Add Pydantic validation to catch semantic errors like incorrect totals. When validation fails, retry with the original document, the failed extraction, and the specific error to guide self-correction.",
      "distractors": [
        "Switch from tool_use to raw text output with manual JSON parsing, which gives the model more flexibility to self-verify arithmetic.",
        "Add arithmetic constraint definitions to the JSON Schema itself, since strict mode can enforce cross-field mathematical relationships.",
        "Use a separate Claude call to verify the arithmetic after extraction, passing only the numbers without the original document context."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.9",
    "front": "What are the six built-in tools, and what is each one's selection criterion?",
    "hint": "Name all 6 tools and when to pick each one",
    "back": "Read: load full file contents. Write: create/overwrite files. Edit: targeted modifications via unique text matching (falls back to Read+Write if match isn't unique). Bash: execute shell commands. Grep: search file CONTENTS for patterns (use for finding function callers, error messages, imports). Glob: find files by NAME/PATH patterns (use for **/*.test.tsx). Key: Grep=content search, Glob=file discovery.",
    "quiz": {
      "stem": "You need to find all files in a codebase that import a specific module called 'AuthService'. Which built-in Claude Code tool should you use?",
      "correct": "Use Grep to search file contents for the import pattern. Grep is for content search (finding function callers, error messages, imports), while Glob is for finding files by name/path patterns.",
      "distractors": [
        "Use Glob with the pattern '**/*AuthService*' to find all files related to authentication services by their file names.",
        "Use Bash to run a recursive 'find' command, since the built-in tools cannot search inside file contents.",
        "Use Read on each file in the project to manually check for the import statement, since there is no search tool available."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.10",
    "front": "How does few-shot prompting work in Claude applications?",
    "hint": "Explain generalization from targeted examples",
    "back": "Provide 2-4 targeted examples for ambiguous scenarios showing reasoning for decisions. Examples demonstrate desired output format for consistency. The model generalizes judgment to novel patterns (not just matching pre-specified cases). Effective for: reducing hallucination in extraction, handling varied document structures, disambiguating tool selection, reducing false positives in code review. Show both positive and negative examples.",
    "quiz": {
      "stem": "Your extraction pipeline handles 50 different document formats. You cannot create examples for all of them. How does few-shot prompting help despite this limitation?",
      "correct": "The model generalizes judgment from 2-4 targeted examples to novel patterns it has not seen. Examples teach reasoning principles, not just exact format matching, enabling handling of unseen document structures.",
      "distractors": [
        "Few-shot prompting cannot help here — you need at least one example per document format for the model to handle each correctly.",
        "Add all 50 formats as examples in the prompt so the model has complete coverage, since few-shot only works with exhaustive examples.",
        "Use fine-tuning instead of few-shot prompting, because few-shot examples are limited to 5 and cannot cover enough variety."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.11",
    "front": "What is prompt chaining and when should you use it?",
    "hint": "Describe sequential decomposition and its use case",
    "back": "Sequential task decomposition into focused passes. Use for predictable, multi-aspect tasks where steps are known upfront. Example: code review split into per-file local analysis passes + separate cross-file integration pass. Contrast with dynamic adaptive decomposition for open-ended tasks where subtasks depend on discoveries. Prompt chaining avoids attention dilution by keeping each pass focused.",
    "quiz": {
      "stem": "You need to review a 20-file pull request for both per-file issues and cross-file integration problems. A single prompt produces inconsistent results and misses issues. What approach should you use?",
      "correct": "Use prompt chaining: split into per-file local analysis passes for each file, then a separate cross-file integration pass. This avoids attention dilution by keeping each pass focused.",
      "distractors": [
        "Use dynamic adaptive decomposition where the model decides at runtime which files to review and in what order based on complexity.",
        "Increase the context window size and submit all 20 files in a single prompt with more detailed instructions for thoroughness.",
        "Run the same single-prompt review 3 times and take the union of all findings, since multiple runs will catch different issues."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.12",
    "front": "What are the key context window management strategies?",
    "hint": "List strategies for token budgets and fact persistence",
    "back": "Token budgets: trim verbose tool outputs to relevant fields before accumulation. Progressive summarization: risky for numerical values/dates — extract transactional facts into persistent \"case facts\" block. Lost-in-the-middle: place key findings at beginning/end of inputs. Context extraction: structured fact extraction outside summarized history. Scratchpad files: persist findings across context boundaries for long sessions. /compact: reduce context usage mid-session.",
    "quiz": {
      "stem": "A customer support agent's context fills up quickly because each order lookup returns 40+ fields. Most fields are irrelevant to the customer's return request. What context management strategy should you apply first?",
      "correct": "Trim verbose tool outputs to only the relevant fields (e.g., keep only the 5 return-relevant fields) before they accumulate in the conversation context.",
      "distractors": [
        "Use /compact after every tool call to automatically reduce the context, keeping all fields but in a compressed format.",
        "Increase the model's max_tokens to accommodate larger contexts so all 40+ fields can be retained without issue.",
        "Summarize the entire conversation history after each tool call to make room for the verbose outputs."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.13",
    "front": "What are the key session management features in Claude Code?",
    "hint": "Name resume, fork, compact, and explore features",
    "back": "Session resumption: --resume <session-name> to continue named sessions (use when prior context is mostly valid). fork_session: create independent branches from shared baseline (compare approaches). Named sessions: organize investigation sessions across work sessions. Session context isolation: separate sessions for generation vs review (self-review is less effective). Start fresh with injected summaries when prior tool results are stale.",
    "quiz": {
      "stem": "You want to compare two different refactoring approaches for a module without losing your current investigation context. Which Claude Code feature should you use?",
      "correct": "Use fork_session to create independent branches from the shared baseline. Each fork can explore a different approach without affecting the other or the original session.",
      "distractors": [
        "Use --resume with two different session names, which automatically creates parallel branches of the same session.",
        "Open two terminal windows and run Claude Code simultaneously — the sessions will automatically share context through a shared state file.",
        "Use /compact to save the current state, then manually copy-paste the context into a new session for the alternative approach."
      ]
    }
  },
  {
    "type": "Appendix",
    "domain": 0,
    "domainName": "Appendix",
    "taskId": "A.14",
    "front": "How does confidence scoring work in Claude extraction and review systems?",
    "hint": "Describe field-level scoring and calibration limits",
    "back": "Field-level confidence (not just document-level) for granular review routing. Calibrate thresholds using labeled validation sets. Stratified random sampling of high-confidence extractions for ongoing error rate measurement and novel pattern detection. Validate accuracy by document type AND field segment. Important: LLM self-reported confidence is poorly calibrated — the model may be incorrectly confident on hard cases. Use external validation, not self-assessment.",
    "quiz": {
      "stem": "Your team relies on the model's self-reported confidence scores to decide which extractions to auto-approve. A review reveals the model reports high confidence on cases it gets wrong. What should you change?",
      "correct": "LLM self-reported confidence is poorly calibrated and cannot be trusted for approval decisions. Use external validation with labeled validation sets and stratified random sampling of high-confidence extractions instead.",
      "distractors": [
        "Fine-tune the model on your specific domain so its confidence scores become accurately calibrated to your document types.",
        "Add a prompt instruction telling the model to be more conservative with its confidence scores, which will fix the calibration.",
        "Average the confidence scores across multiple runs of the same extraction to get a more reliable confidence estimate."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 3,
    "domainName": "Claude Code Configuration & Workflows",
    "taskId": "3.6",
    "visualRef": { "diagram": "tool-mcp", "step": 2 },
    "front": "How do you prevent Claude from suggesting test cases that duplicate existing tests in CI?",
    "hint": "Explain the root cause approach to prevent duplicates",
    "back": "Include the existing test file in Claude's context so it can identify what scenarios are already covered. This directly addresses the ROOT CAUSE of duplication — Claude can only avoid suggesting already-covered scenarios if it knows what tests already exist. WRONG approaches: (1) Post-processing with keyword matching is brittle — misses semantically equivalent tests described with different wording/terminology. It addresses symptoms, not root cause. (2) Reducing the number of suggestions just limits output without ensuring quality. (3) Directing Claude to focus on edge cases doesn't prevent duplicates. Key principle: Context Provision > Post-Processing. Give Claude the information it needs upfront rather than filtering output after the fact.",
    "quiz": {
      "stem": "Your CI pipeline uses Claude Code to suggest new test cases for changed code. However, many suggestions duplicate tests that already exist in the test suite. What is the most effective fix?",
      "correct": "Include the existing test file in Claude's context so it can see what scenarios are already covered. This addresses the root cause — Claude can only avoid duplicates if it knows what tests already exist.",
      "distractors": [
        "Add a post-processing step that uses keyword matching to filter out suggested tests whose names or descriptions overlap with existing test names.",
        "Instruct Claude to focus only on edge cases and boundary conditions, which are less likely to overlap with existing tests that cover happy paths.",
        "Reduce the number of test suggestions to 2 per run, which statistically decreases the chance of suggesting duplicates."
      ]
    }
  },
  {
    "type": "Knowledge",
    "domain": 1,
    "domainName": "Agentic Architecture & Orchestration",
    "taskId": "1.5",
    "visualRef": { "diagram": "multi-agent", "step": 3 },
    "front": "Where should error recovery happen in a multi-agent system — at the subagent, coordinator, or a dedicated error-handling agent?",
    "hint": "Identify the right recovery level and explain why",
    "back": "At the LOWEST LEVEL CAPABLE of resolving the error. Subagents should implement local recovery for transient failures (retries, skip corrupted sections, parse alternatives) and only propagate errors they truly cannot resolve to the coordinator. Include full context in escalations: what was attempted, what failed, and any partial results obtained. WRONG approaches: (1) A dedicated error-handling agent adds unnecessary architectural complexity, a shared queue dependency, and distributes error-handling logic across multiple components rather than resolving at the source. (2) Always returning success with embedded error metadata hides failures from the coordinator. (3) Having the coordinator pre-validate all inputs creates a bottleneck and doesn't handle runtime errors. Key principle: Handle locally first, escalate with context only when necessary.",
    "quiz": {
      "stem": "A multi-agent system encounters a timeout when a web-scraping subagent tries to fetch a page. A developer proposes creating a dedicated error-handling agent that receives all errors via a shared queue and decides recovery strategies centrally. Is this the right approach?",
      "correct": "No. Error recovery should happen at the lowest level capable of resolving it. The subagent should retry locally for transient failures and only propagate to the coordinator errors it cannot resolve, with full context about what was attempted and any partial results.",
      "distractors": [
        "Yes, a dedicated error-handling agent centralizes recovery logic and provides consistent error handling across all subagents in the system.",
        "No, the coordinator should pre-validate all inputs before dispatching to subagents, which prevents errors from occurring in the first place.",
        "No, the subagent should return success with embedded error metadata so the workflow continues uninterrupted and errors can be reviewed later."
      ]
    }
  }
];

// === Spaced Repetition System ===
const SRS_KEY = 'flashcards-srs';
let srsData = JSON.parse(localStorage.getItem(SRS_KEY) || '{}');
function saveSRS() { localStorage.setItem(SRS_KEY, JSON.stringify(srsData)); }

function getSRS(key) {
  return srsData[key] || { ease: 2.5, interval: 0, due: null, reps: 0 };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isDue(key) {
  const s = srsData[key];
  if (!s || !s.due) return true; // new card = due
  return s.due <= todayStr();
}

function rateSRS(key, rating) {
  const s = getSRS(key);
  const today = todayStr();

  if (rating === 'again') {
    s.interval = 0;
    s.due = today;
    s.reps = 0;
    s.ease = Math.max(1.3, s.ease - 0.2);
  } else if (rating === 'hard') {
    s.interval = Math.max(1, Math.ceil(s.interval * 1.2));
    s.due = addDays(today, s.interval);
    s.reps += 1;
    s.ease = Math.max(1.3, s.ease - 0.15);
  } else { // good
    if (s.reps === 0) s.interval = 1;
    else if (s.reps === 1) s.interval = 3;
    else s.interval = Math.ceil(s.interval * s.ease);
    s.due = addDays(today, s.interval);
    s.reps += 1;
  }

  srsData[key] = s;
  saveSRS();
}

// Migrate old mastered data
(function migrateMastered() {
  const old = JSON.parse(localStorage.getItem('flashcards-mastered') || '[]');
  if (old.length && Object.keys(srsData).length === 0) {
    const today = todayStr();
    old.forEach(key => {
      srsData[key] = { ease: 2.5, interval: 3, due: addDays(today, 3), reps: 2 };
    });
    saveSRS();
    localStorage.removeItem('flashcards-mastered');
  }
})();

let reviewedThisSession = 0;

let currentMode = 'flashcard';

function setMode(mode) {
  currentMode = mode;
  document.getElementById('modeFlashcard').classList.toggle('active', mode === 'flashcard');
  document.getElementById('modeQuiz').classList.toggle('active', mode === 'quiz');
  document.getElementById('modeRecall').classList.toggle('active', mode === 'recall');
  document.getElementById('cardScene').style.display = mode === 'flashcard' ? 'block' : 'none';
  document.getElementById('quizContainer').style.display = mode === 'quiz' ? 'block' : 'none';
  document.getElementById('recallContainer').style.display = mode === 'recall' ? 'block' : 'none';
  document.getElementById('ratingButtons').style.display = 'none';
  quizCorrect = 0; quizWrong = 0; quizResults = []; historyVisible = false; updateQuizScore(); const h = document.getElementById('quizHistory'); if(h) h.style.display='none';
  render();
}

function rate(rating) {
  if (!filtered.length) return;
  // In quiz mode, selectAnswer already handles scoring — only allow rate() for non-quiz cards (revealQuizAnswer flow)
  if (currentMode === 'quiz' && quizAnswered && document.getElementById('ratingButtons').style.display === 'none') return;
  const c = filtered[idx];
  rateSRS(cardKey(c), rating);
  reviewedThisSession++;
  const isCorrect = rating === 'good';
  if (isCorrect) quizCorrect++; else quizWrong++;
  addQuizResult(c, isCorrect);
  updateQuizScore();
  document.getElementById('ratingButtons').style.display = 'none';
  next();
}

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
const emptyState = document.getElementById('emptyState');
const quizContainer = document.getElementById('quizContainer');
const quizCard = document.getElementById('quizCard');
const quizChoices = document.getElementById('quizChoices');
const quizExplanation = document.getElementById('quizExplanation');
const recallContainer = document.getElementById('recallContainer');
const recallQuestion = document.getElementById('recallQuestion');
const recallTextarea = document.getElementById('recallTextarea');
const recallCheckBtn = document.getElementById('recallCheckBtn');
const recallCompare = document.getElementById('recallCompare');
const recallInput = document.getElementById('recallInput');
const recallYourAnswer = document.getElementById('recallYourAnswer');
const recallCorrectAnswer = document.getElementById('recallCorrectAnswer');

recallTextarea.addEventListener('input', () => {
  recallCheckBtn.disabled = recallTextarea.value.trim().length === 0;
  recallTextarea.style.height = 'auto';
  recallTextarea.style.height = Math.min(recallTextarea.scrollHeight, 300) + 'px';
});

// Populate domain dropdown
const domains = [...new Map(ALL_CARDS.map(c=>[c.domain, c.domainName])).entries()].sort((a,b)=>a[0]-b[0]);
domains.forEach(([id,name])=>{
  const o = document.createElement('option');
  o.value = id; o.textContent = id === 0 ? name : `Domain ${id}: ${name}`;
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
    if(hm){
      const s = getSRS(cardKey(c));
      if(s.reps >= 3 && !isDue(cardKey(c))) return false;
    }
    return true;
  });
  // Sort: due/overdue first (oldest due first), then new cards
  filtered.sort((a, b) => {
    const aDue = isDue(cardKey(a));
    const bDue = isDue(cardKey(b));
    if(aDue && !bDue) return -1;
    if(!aDue && bDue) return 1;
    if(aDue && bDue){
      const aDate = (srsData[cardKey(a)]||{}).due || '0000';
      const bDate = (srsData[cardKey(b)]||{}).due || '0000';
      return aDate.localeCompare(bDate);
    }
    return 0;
  });
  idx = 0;
  updateDomainLinks(d);
  render();
}

function updateDomainLinks(domain) {
  const el = document.getElementById('domainLinks');
  if (!el) return;
  if (domain === 'all') { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  const base = document.querySelector('meta[name="base-url"]')?.content || '/';
  document.getElementById('linkStudyGuide').href = base + 'study-guide/domain' + domain + '/';
  document.getElementById('linkVisualGuide').href = base + 'visual-guide/?domain=' + domain;
}

let quizAnswered = false;
let quizCorrect = 0;
let quizWrong = 0;
let quizResults = []; // { card, isCorrect, stem }
let historyFilter = 'all';
let historyVisible = false;

function updateQuizScore() {
  const scoreEl = document.getElementById('quizScore');
  if (!scoreEl) return;
  const total = quizCorrect + quizWrong;
  scoreEl.style.display = total > 0 ? 'flex' : 'none';
  document.getElementById('scoreCorrect').textContent = quizCorrect;
  document.getElementById('scoreWrong').textContent = quizWrong;
  document.getElementById('scorePct').textContent = total > 0 ? Math.round(quizCorrect / total * 100) : 0;
}

function addQuizResult(card, isCorrect) {
  const stem = card.quiz ? card.quiz.stem : card.front;
  quizResults.push({ card, isCorrect, stem, domain: card.domain, domainName: card.domainName });
  if (historyVisible) renderQuizHistory();
}

function renderQuizHistory() {
  const list = document.getElementById('quizHistoryList');
  if (!list) return;
  const items = historyFilter === 'all' ? quizResults
    : quizResults.filter(r => historyFilter === 'correct' ? r.isCorrect : !r.isCorrect);
  list.innerHTML = items.map((r, i) =>
    `<div class="quiz-history-item ${r.isCorrect ? 'is-correct' : 'is-wrong'}">
      <span class="history-icon">${r.isCorrect ? '&#10003;' : '&#10007;'}</span>
      <span class="history-text">
        <span class="history-domain">D${r.domain}</span>
        ${esc(r.stem.length > 120 ? r.stem.slice(0, 120) + '...' : r.stem)}
      </span>
    </div>`
  ).join('');
}

function toggleQuizHistory() {
  historyVisible = !historyVisible;
  const el = document.getElementById('quizHistory');
  if (el) {
    el.style.display = historyVisible ? 'block' : 'none';
    if (historyVisible) renderQuizHistory();
  }
}

function filterHistory(f) {
  historyFilter = f;
  const row = document.getElementById('historyFilterRow');
  if (row) row.querySelectorAll('button').forEach(b => {
    b.className = b.textContent.toLowerCase() === f ? 'active' : '';
  });
  renderQuizHistory();
}

function shuffleArray(arr) {
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

function renderQuiz(){
  document.getElementById('ratingButtons').style.display = 'none';
  const total = filtered.length;
  if(total===0){
    quizContainer.style.display='none'; emptyState.style.display='block';
    progressText.textContent='Card 0 of 0'; progressFill.style.width='0%';
    updateStats(); return;
  }
  quizContainer.style.display='block'; emptyState.style.display='none';
  quizAnswered = false;
  quizExplanation.style.display = 'none';

  const c = filtered[idx];
  const domTag = `<span class="tag tag-domain">Domain ${c.domain}</span>`;
  const typeClass = c.type==='Knowledge'?'tag-knowledge':c.type==='Skill'?'tag-skill':'tag-appendix';
  const typeTag = `<span class="tag ${typeClass}">${c.type}</span>`;

  if(c.quiz){
    quizCard.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-question">${esc(c.quiz.stem)}</div>${c.hint ? '<div class="card-hint">' + esc(c.hint) + '</div>' : ''}`;
    const answers = shuffleArray([
      { text: c.quiz.correct, isCorrect: true },
      ...c.quiz.distractors.map(d => ({ text: d, isCorrect: false }))
    ]);
    const letters = ['A','B','C','D'];
    quizChoices.innerHTML = answers.map((a, i) =>
      `<button class="quiz-choice" data-correct="${a.isCorrect}" onclick="selectAnswer(this)"><span class="choice-letter">${letters[i]}</span> ${esc(a.text)}</button>`
    ).join('');
  } else {
    quizCard.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-question">${esc(c.front)}</div>${c.hint ? '<div class="card-hint">' + esc(c.hint) + '</div>' : ''}`;
    quizChoices.innerHTML = `<button class="quiz-choice" onclick="revealQuizAnswer()">Reveal Answer</button>`;
  }

  progressFill.style.width = ((idx+1)/total*100)+'%';
  progressText.textContent = `Card ${idx+1} of ${total}`;
  updateQuizScore();
  updateStats();
}

function selectAnswer(btn){
  if(quizAnswered) return;
  quizAnswered = true;
  const allBtns = quizChoices.querySelectorAll('.quiz-choice');
  allBtns.forEach(b => {
    b.disabled = true;
    if(b.dataset.correct === 'true') b.classList.add('correct');
  });
  const isCorrect = btn.dataset.correct === 'true';
  if(!isCorrect) btn.classList.add('wrong');

  const c = filtered[idx];
  rateSRS(cardKey(c), isCorrect ? 'good' : 'again');
  reviewedThisSession++;
  if (isCorrect) quizCorrect++; else quizWrong++;
  addQuizResult(c, isCorrect);

  quizExplanation.innerHTML = `<b>${isCorrect ? 'Correct!' : 'Incorrect.'}</b><br><br>${escBack(c.back)}`;
  quizExplanation.style.display = 'block';
  updateQuizScore();
  updateStats();
}

function revealQuizAnswer(){
  if(quizAnswered) return;
  quizAnswered = true;
  const c = filtered[idx];
  quizExplanation.innerHTML = escBack(c.back);
  quizExplanation.style.display = 'block';
  document.getElementById('ratingButtons').style.display = 'flex';
}

let recallChecked = false;

function renderRecall() {
  document.getElementById('ratingButtons').style.display = 'none';
  recallChecked = false;
  const total = filtered.length;
  if (total === 0) {
    recallContainer.style.display = 'none'; emptyState.style.display = 'block';
    progressText.textContent = 'Card 0 of 0'; progressFill.style.width = '0%';
    updateStats(); return;
  }
  recallContainer.style.display = 'block'; emptyState.style.display = 'none';

  const c = filtered[idx];
  const domTag = `<span class="tag tag-domain">Domain ${c.domain}</span>`;
  const typeClass = c.type === 'Knowledge' ? 'tag-knowledge' : c.type === 'Skill' ? 'tag-skill' : 'tag-appendix';
  const typeTag = `<span class="tag ${typeClass}">${c.type}</span>`;

  recallQuestion.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-question">${esc(c.front)}</div>${c.hint ? '<div class="card-hint">' + esc(c.hint) + '</div>' : ''}<div class="card-task"><span>Task ${c.taskId} &middot; ${c.domainName}</span></div>`;

  recallInput.style.display = 'block';
  recallCompare.style.display = 'none';
  recallTextarea.value = '';
  recallTextarea.style.height = 'auto';
  recallCheckBtn.disabled = true;
  recallTextarea.focus();

  progressFill.style.width = ((idx + 1) / total * 100) + '%';
  progressText.textContent = `Card ${idx + 1} of ${total}`;
  updateStats();
}

function checkRecall() {
  if (recallChecked || recallTextarea.value.trim().length === 0) return;
  recallChecked = true;
  const c = filtered[idx];

  recallInput.style.display = 'none';
  recallCompare.style.display = 'grid';
  recallYourAnswer.innerHTML = esc(recallTextarea.value.trim());

  let correctHtml = escBack(c.back);
  if (c.visualRef && window.DIAGRAMS && DIAGRAMS[c.visualRef.diagram]) {
    correctHtml += '<div id="recallMiniDiagram" style="margin-top:12px;border-top:1px solid #e5e3dd;padding-top:10px;max-height:200px;"></div>';
  }
  correctHtml += `<div class="card-task" style="margin-top:12px;"><span>Task ${c.taskId} &middot; ${c.domainName}</span><button class="speak-btn" onclick="speakDefinition(event)" title="Read definition aloud"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></button></div>`;
  recallCorrectAnswer.innerHTML = correctHtml;

  if (c.visualRef && window.DIAGRAMS && DIAGRAMS[c.visualRef.diagram]) {
    const container = document.getElementById('recallMiniDiagram');
    if (container) DIAGRAMS[c.visualRef.diagram].draw(container, { step: c.visualRef.step, mini: true });
  }

  document.getElementById('ratingButtons').style.display = 'flex';
}

function render(){
  document.getElementById('ratingButtons').style.display = 'none';
  if(currentMode === 'quiz'){ renderQuiz(); return; }
  if(currentMode === 'recall'){ renderRecall(); return; }
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
  cardFront.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-question">${esc(c.front)}</div>${c.hint ? '<div class="card-hint">' + esc(c.hint) + '</div>' : ''}`;
  cardBack.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-answer">${escBack(c.back)}</div><div class="card-task"><span>Task ${c.taskId} &middot; ${c.domainName}</span><button class="speak-btn" onclick="speakDefinition(event)" title="Read definition aloud"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></button></div>`;
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
  // Inline code: backticks, quotes around code-like terms, and bare code identifiers
  s = s.replace(/`([^`]+)`/g, '<code class="hl">$1</code>');
  s = s.replace(/&quot;([\w_.\-\/]+(?:\([^)]*\))?)&quot;/g, '<code class="hl">$1</code>');
  // Highlight common API terms that appear unquoted
  s = s.replace(/\b(stop_reason|end_turn|tool_use|tool_choice|tool_result|content_block|max_tokens|temperature|system|messages\[\]|stop_sequence|custom_id)\b/g, '<code class="hl">$1</code>');
  // Highlight key phrases after em-dash or colon as emphasis
  s = s.replace(/ — /g, ' <span class="sep">—</span> ');
  return s;
}
function escBack(s){
  s = esc(s);
  // For long answers, add paragraph breaks at major sentence transitions
  // Split on ". " followed by a capital letter when answer is long
  if (s.length > 250) {
    // Add breaks before key transition words in long answers
    s = s.replace(/\. (The correct|The key|This is|This means|This ensures|Without this|Example:|Use case:|Important:|Note:|However,|Additionally,|In contrast,|For example,)/g,
      '.<br><br>$1');
  }
  return s;
}

function updateStats(){
  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = filtered.length;
  const due = filtered.filter(c => isDue(cardKey(c))).length;
  const newCards = filtered.filter(c => !srsData[cardKey(c)]).length;
  document.getElementById('statDue').textContent = due;
  document.getElementById('statNew').textContent = newCards;
  document.getElementById('statReviewed').textContent = reviewedThisSession;
}

function next(){ if(filtered.length){ idx=(idx+1)%filtered.length; render(); } }
function prev(){ if(filtered.length){ idx=(idx-1+filtered.length)%filtered.length; render(); } }
function shuffle(){
  for(let i=filtered.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[filtered[i],filtered[j]]=[filtered[j],filtered[i]]; }
  idx=0; render();
}
cardScene.addEventListener('click',()=>{
  cardInner.classList.toggle('flipped');
  if(currentMode === 'flashcard' && cardInner.classList.contains('flipped')){
    document.getElementById('ratingButtons').style.display = 'flex';
  }
});
domainFilter.addEventListener('change',applyFilters);
typeFilter.addEventListener('change',applyFilters);
hideMastered.addEventListener('change',applyFilters);

document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
  if(e.target.tagName==='TEXTAREA'){
    if((e.metaKey || e.ctrlKey) && e.key==='Enter'){ e.preventDefault(); checkRecall(); }
    return;
  }
  // Recall mode: only allow nav after checking
  if(currentMode==='recall'){
    if(recallChecked && (e.key==='ArrowRight' || e.key==='Enter')){ next(); return; }
    if(e.key==='ArrowLeft'){ prev(); return; }
    if(e.key==='1') rate('again');
    else if(e.key==='2') rate('hard');
    else if(e.key==='3') rate('good');
    return;
  }
  if(e.key==='ArrowRight' || (e.key==='Enter' && currentMode==='quiz' && quizAnswered)) next();
  else if(e.key==='ArrowLeft') prev();
  else if(e.key===' '){ e.preventDefault(); if(currentMode==='flashcard'){ cardInner.classList.toggle('flipped'); if(cardInner.classList.contains('flipped')) document.getElementById('ratingButtons').style.display='flex'; else document.getElementById('ratingButtons').style.display='none'; } }
  else if(e.key==='1') rate('again');
  else if(e.key==='2') rate('hard');
  else if(e.key==='3') rate('good');
  // Quiz answer keys
  if(currentMode==='quiz' && !quizAnswered){
    const keyMap = {a:0, b:1, c:2, d:3};
    const ki = keyMap[e.key.toLowerCase()];
    if(ki !== undefined){
      const btns = quizChoices.querySelectorAll('.quiz-choice');
      if(btns[ki]) selectAnswer(btns[ki]);
    }
  }
});


// URL query param support: ?domain=N auto-filters
const urlParams = new URLSearchParams(window.location.search);
const domainParam = urlParams.get('domain');
if (domainParam && !isNaN(Number(domainParam))) {
  domainFilter.value = domainParam;
}
const modeParam = urlParams.get('mode');
if (modeParam === 'quiz') setMode('quiz');
else if (modeParam === 'recall') setMode('recall');

applyFilters();
