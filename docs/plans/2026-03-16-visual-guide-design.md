# Visual Guide Design

## Summary

Add interactive SVG-based visual diagrams to the Anthropic Cert Prep app for all 5 exam domains. Two integration points: a dedicated Visual Guide page and mini diagrams embedded in flashcard backs.

## Visual Guide Page (`public/visual-guide.html`)

New tab in the nav bar: **Flashcards | Visual Guide | Practice Exam**

### Diagrams (one per domain)

1. **Agentic Loop Lifecycle** (Domain 1) — animated request/response cycle: send request → inspect stop_reason → execute tool → append result → loop. Shows client, Claude API, and tool nodes.
2. **Multi-Agent Orchestration** (Domain 1) — hub-and-spoke: coordinator center, subagents around it. Steps: task decomposition → delegation → isolated execution → result aggregation → final response.
3. **Context Window Management** (Domain 3) — token budget bar: system prompt, conversation history, tools, cache regions. Steps show how context fills, caching, eviction.
4. **Tool Design & MCP** (Domain 2) — flow: tool definition → Claude selects tool → input schema validated → execution → result returned. MCP server/client relationship.
5. **Prompt Engineering** (Domain 4) — layered: system prompt → prefill → chain of thought → structured output. Step through each technique's effect.

### Interaction Model

- **Step-through controls**: play / pause / step-forward / step-back
- **Hover tooltips**: hover any node for definition + related flashcard link
- **Current step label**: text explaining what's happening at each step
- **"Related cards" link**: filters flashcards page to that topic
- **State persistence**: current step per diagram saved to localStorage

## Flashcard Mini Diagrams (`public/index.html`)

- Each flashcard back gets a ~200px tall mini SVG of its domain diagram
- The relevant node/step is **highlighted** (colored border + pulse animation), rest dimmed
- Tapping the mini diagram navigates to the full Visual Guide at that step
- Cards get a `visualRef` field: `{ diagram: "agentic-loop", step: 3 }`
- Cards without a clear visual mapping show text-only (no forced diagrams)

## Technical Architecture

### Files

- `public/visual-guide.html` — Visual Guide page
- `public/diagrams.js` — shared SVG diagram module, loaded by both pages
- `public/index.html` — modified to include mini diagrams on card backs

### Shared Diagram Module (`diagrams.js`)

Exports functions per diagram:
- `drawAgenticLoop(container, { step, highlight, mini })`
- `drawMultiAgent(container, { step, highlight, mini })`
- `drawContextWindow(container, { step, highlight, mini })`
- `drawToolDesign(container, { step, highlight, mini })`
- `drawPromptEngineering(container, { step, highlight, mini })`

Parameters:
- `container`: DOM element to render into
- `step`: current animation step (0-based)
- `highlight`: specific step to highlight (for mini mode)
- `mini`: boolean, renders compact version for flashcard backs

### No external dependencies

Pure SVG + CSS animations + vanilla JS. Works on iPad via Add to Home Screen.

### Mobile/iPad

SVG scales naturally. Step controls become large tap targets. Swipe support optional.

## Nav Bar Update

```
ANTHROPIC CERT PREP    Flashcards    Visual Guide    Practice Exam
```
