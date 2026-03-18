# Code Practice Page Design

**Date:** 2026-03-18
**Status:** Approved

## Purpose

Add a `/practice` page with interactive code exercises (fill-in-the-blank and spot-the-bug) for hands-on/kinesthetic learning. Targets the gap that all existing modes are recognition-based — this one requires producing code. Focused on the Anthropic certification's highest-weight domains.

## Architecture

New standalone page at `/practice`. Separate data file `public/exercises.js` (different schema from flashcards). No SRS — exercises are repeatable drills. ~10-15 hand-crafted exercises covering D1 (Agentic Architecture), D3 (Claude Code), and D4 (Prompt Engineering).

## Exercise Types

### Fill-in-the-blank
Code block with 1-3 inline `<input>` fields replacing key tokens. Each blank has a list of accepted answers (normalized: trimmed, lowercased, quotes stripped).

### Spot-the-bug
Same UI, but blanks are pre-filled with buggy values. Learner replaces them with the fix. A badge indicates "1 bug" or "2 bugs".

## Exercise Data Shape (`public/exercises.js`)

```javascript
const EXERCISES = [
  {
    id: "agentic-loop-stop",
    type: "fill-blank",       // or "spot-bug"
    domain: 1,
    domainName: "Agentic Architecture & Orchestration",
    title: "Agentic Loop Termination",
    description: "Complete the agentic loop by filling in the stop condition.",
    code: [
      "while True:",
      "  response = client.messages.create(...)",
      "  if response.stop_reason == {{blank:0}}:",
      "    break",
      "  elif response.stop_reason == {{blank:1}}:",
      "    result = execute_tool(response)",
      "    messages.append(result)"
    ],
    blanks: [
      { accepted: ["end_turn"], hint: "When should the loop stop?" },
      { accepted: ["tool_use"], hint: "When should we execute a tool?" }
    ]
  },
  {
    id: "tool-schema-bug",
    type: "spot-bug",
    domain: 2,
    domainName: "Tool Design & MCP Integration",
    title: "Tool Definition Schema Type",
    description: "Find and fix the bug in this tool definition.",
    code: [
      "tool = {",
      "  \"name\": \"get_weather\",",
      "  \"description\": \"Get current weather\",",
      "  \"input_schema\": {",
      "    \"type\": {{blank:0}},",
      "    \"properties\": { \"city\": { \"type\": \"string\" } }",
      "  }",
      "}"
    ],
    blanks: [
      { prefilled: "\"string\"", accepted: ["object", "\"object\""], hint: "What type should input_schema be?" }
    ]
  }
];
```

## Validation

Normalized string match per blank:
1. Trim whitespace
2. Lowercase
3. Strip surrounding quotes (both `"` and `'`)
4. Compare against accepted answers list

No regex, no AST parsing. Accepted answers list covers common variations.

## UI Flow

1. **Exercise card** — title, description, domain tag, type badge (fill-blank / spot-bug)
2. **Code block** — dark-themed `<pre>` (`#1e1e1e` background). Blanks rendered as `<input>` fields styled inline: monospace font, transparent background, bottom-border only (#d97757 accent), width sized to expected answer length
3. **"Show Hints" button** — reveals per-blank hints below each blank (optional)
4. **"Check" button** — validates all blanks:
   - Correct: input border turns green, light green background
   - Wrong: input border turns red, correct answer shown as label below the input
   - Overall: pass (all correct) or fail
5. **"Next" button** — advance to next exercise after checking
6. **Progress bar** — "Exercise 3 of 12" with fill bar
7. **Session score** — "8/12 correct" running tally

## Keyboard

- Tab: move between blanks
- Cmd/Ctrl+Enter: check answers
- ArrowRight: advance after checking

## Responsive

- Code block: horizontal scroll on mobile, inputs stay inline
- Card/description: full-width

## Styling

- Dark code block matching study guide's existing code examples
- Input fields: monospace, transparent bg, bottom-border accent, blend into code
- Same design tokens as rest of site: #d97757 accent, #141413 dark, Inter/Source Serif fonts
- Exercise card: same card styling as quiz/flashcard cards

## Scope

- ~10-15 exercises for v1
- Domains: D1 (Agentic Architecture, 27%), D3 (Claude Code, 20%), D4 (Prompt Engineering, 20%)
- No SRS integration — repeatable drills
- No code execution — validation is string matching only

## Files

- Create: `src/pages/practice.astro` — page layout and styles
- Create: `public/exercises.js` — exercise data and all interactive logic
- Modify: `src/components/NavBar.astro` — add Practice nav link
