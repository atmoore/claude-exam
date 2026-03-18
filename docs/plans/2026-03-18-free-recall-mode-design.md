# Free Recall Mode Design

**Date:** 2026-03-18
**Status:** Approved

## Purpose

Add a free recall study mode where learners type what they remember before seeing the answer. This addresses the gap that all existing modes (flashcard flip, MCQ quiz) are recognition-based. Free recall produces stronger memory traces and forces active engagement, which is especially beneficial for ADHD learners.

## Design

### Mode Toggle

Add "Recall" as a third button in the existing mode toggle: `Flashcards | Quiz | Recall`. Supported via URL param `?mode=recall`.

### User Flow

1. **Question displayed** — same card front as flashcard mode (tags, question, task ID)
2. **Textarea below the card** — placeholder "Type what you remember...", auto-focused, starts at 3 rows, grows with input. No minimum length.
3. **"Check" button** — enabled when any text is entered. Keyboard shortcut: Cmd/Ctrl+Enter.
4. **Split compare view** — replaces the textarea after Check:
   - Left panel (top on mobile): "Your Answer" — learner's typed text in a neutral container
   - Right panel (bottom on mobile): "Correct Answer" — card back content including mini diagram if `visualRef` exists
5. **Rating buttons** — same Again/Hard/Good as flashcard mode, appear below the compare view
6. **After rating** — advance to next card, clear textarea, apply SRS scheduling

### SRS Integration

- Reuses the same `flashcards-srs` localStorage state
- Rating in recall mode updates the same ease/interval/due as flashcard and quiz modes
- No separate tracking per mode

### Shared Features (unchanged)

- Domain and type filters
- "Hide reviewed" checkbox
- Progress bar and card counter
- Shuffle, prev/next navigation
- Text-to-speech on the correct answer panel

### Compare View Layout

Desktop: side-by-side panels.

```
┌─────────────────────────────────────┐
│  Your Answer          Correct Answer│
│ ┌───────────────┐  ┌───────────────┐│
│ │ user's text   │  │ card back     ││
│ │               │  │ + mini diagram││
│ └───────────────┘  └───────────────┘│
│                                     │
│     [Again]  [Hard]  [Good]         │
└─────────────────────────────────────┘
```

Mobile (<600px): stacked vertically, your answer on top, correct answer below.

### Keyboard Shortcuts

- Cmd/Ctrl+Enter: submit answer (Check)
- Arrow keys: prev/next (after rating)
- 1/2/3: Again/Hard/Good (when rating buttons visible)

### ADHD-Friendly Considerations

- Small, inviting textarea (not a big empty void)
- Auto-focus on textarea when card loads
- No timer, no minimum length, no word count pressure
- Immediate reveal on Check
- Split compare gives clear visual structure for honest self-rating

### Cards

All cards available in recall mode — no filtering by answer length.

## Files to Modify

- `src/pages/flashcards.astro` — add mode toggle button, recall container HTML, compare view CSS
- `public/flashcards.js` — add recall mode logic to `setMode()`, render functions, keyboard handling