# Spaced Repetition + Quiz Mode Design

## Overview
Optimize the flashcard app for exam preparation by adding two features:
1. **Spaced repetition** — SM-2-based card scheduling replacing binary mastered/not-mastered
2. **Quiz mode** — MCQ format matching the exam's scenario-based multiple choice style

## Spaced Repetition System

### Rating Buttons
Replace "Mark Mastered" with three buttons (visible after flipping/answering):
- **Again** (red) — Reset to learning state, re-shown in current session
- **Hard** (orange) — Short interval progression (1d → 2d)
- **Good** (green) — Longer interval progression (1d → 3d → 7d → 14d)

### Data Model (localStorage key: `flashcards-srs`)
```js
{
  "cardKey": {
    ease: 2.5,         // SM-2 easiness factor
    interval: 1,       // days until next review
    due: "2026-03-17", // next review date (ISO string)
    reps: 0            // successful consecutive reps
  }
}
```

### Card Ordering
1. Due/overdue cards first (sorted oldest-due-first)
2. Then new (unseen) cards
3. "Due today" count shown in stats bar

### Migration
Existing `flashcards-mastered` data migrated on first load:
- Mastered cards → 3-day interval
- Unmastered cards → fresh/new state

## Quiz Mode

### Toggle
Pill buttons in controls bar: `Flashcards | Quiz`

### Flow
1. Card front shown as question stem (scenario-framed when `quiz` field exists)
2. Four shuffled answer choices (A/B/C/D buttons)
3. User selects → immediate green/red feedback + explanation
4. Spaced repetition auto-applied: correct = Good, incorrect = Again
5. Next button advances

### Card Data Extension
Each card gets an optional `quiz` field:
```js
{
  front: "...",
  back: "...",
  quiz: {
    stem: "scenario-framed question...",
    correct: "the correct answer...",
    distractors: [
      "plausible wrong answer 1...",
      "plausible wrong answer 2...",
      "plausible wrong answer 3..."
    ]
  }
}
```
Cards without `quiz` fall back to flashcard-style (flip to reveal, then rate).

### Keyboard Shortcuts
A/B/C/D to select answer, Enter for next

## UI Changes

### Flashcard Mode
- Rating buttons (Again/Hard/Good) replace "Mark Mastered", visible after flip
- Stats bar: `Due: X | New: X | Reviewed: X`

### Quiz Mode
- Question stem in card (no flip mechanic)
- Four outlined pill answer buttons with A/B/C/D prefix
- Correct → green, wrong → red, explanation panel slides in
- "Next" button after answering

### Shared
- Progress bar, domain/type filters, shuffle all work in both modes
- Spaced repetition drives card order in both modes

## Files Modified
- `public/flashcards.js` — card data (quiz fields), SRS logic, quiz mode UI, migration
- `src/pages/index.astro` — HTML structure updates (mode toggle, rating buttons, quiz layout, stats)

## No New Dependencies
Everything stays vanilla JS + localStorage.
