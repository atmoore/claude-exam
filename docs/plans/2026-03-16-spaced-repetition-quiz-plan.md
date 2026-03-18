# Spaced Repetition + Quiz Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add spaced repetition scheduling and an exam-style quiz mode to the flashcard app to optimize study efficiency for the Anthropic cert exam.

**Architecture:** Extend existing vanilla JS app. SRS state stored in localStorage alongside existing data. Quiz mode is a UI toggle on the same page — no new routes. Quiz data (`quiz` field) added to each card in the ALL_CARDS array.

**Tech Stack:** Vanilla JS, Astro (static), localStorage

---

### Task 1: Add SRS Engine to flashcards.js

**Files:**
- Modify: `public/flashcards.js:701-704` (replace mastered storage with SRS)

**Step 1: Add SRS data model and helpers**

After the `ALL_CARDS` array closing bracket (line 700), replace the mastered localStorage code with:

```js
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
  // rating: 'again' | 'hard' | 'good'
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
```

**Step 2: Update card ordering in applyFilters**

Replace the `applyFilters` function to sort due cards first:

```js
function applyFilters() {
  const d = domainFilter.value;
  const t = typeFilter.value;
  const hm = hideMastered.checked;
  filtered = ALL_CARDS.filter(c => {
    if (d !== 'all' && c.domain !== Number(d)) return false;
    if (t !== 'all' && c.type !== t) return false;
    if (hm) {
      const s = getSRS(cardKey(c));
      if (s.reps >= 3 && !isDue(cardKey(c))) return false;
    }
    return true;
  });
  // Sort: due/overdue first (oldest due first), then new cards
  filtered.sort((a, b) => {
    const sa = getSRS(cardKey(a));
    const sb = getSRS(cardKey(b));
    const aDue = isDue(cardKey(a));
    const bDue = isDue(cardKey(b));
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;
    if (aDue && bDue) {
      const aDate = sa.due || '0000';
      const bDate = sb.due || '0000';
      return aDate.localeCompare(bDate);
    }
    return 0;
  });
  idx = 0;
  render();
}
```

**Step 3: Remove old mastered functions**

Remove `saveMastered`, `toggleMaster`, and the mastered Set. Update `updateStats` to use SRS data.

**Step 4: Verify manually**

Run: `npm run dev` and confirm cards load, SRS buttons work, localStorage stores SRS data.

**Step 5: Commit**

```bash
git add public/flashcards.js
git commit -m "feat: add spaced repetition engine replacing binary mastered system"
```

---

### Task 2: Update HTML/CSS for SRS Rating Buttons & Mode Toggle

**Files:**
- Modify: `src/pages/index.astro:72-147` (nav-buttons, stats, add mode toggle + quiz container + new styles)

**Step 1: Add new CSS styles**

Add after the existing styles (before `</style>`):

- `.mode-toggle` — pill button group for Flashcards/Quiz toggle
- `.rating-buttons` — container for Again/Hard/Good buttons
- `.rating-buttons button` — styled with colors (red/orange/green borders)
- `.quiz-choices` — container for A/B/C/D answer buttons
- `.quiz-choice` — individual answer button styling
- `.quiz-choice.correct` — green background
- `.quiz-choice.wrong` — red background
- `.quiz-explanation` — explanation panel after answering

**Step 2: Add mode toggle HTML**

Add after the controls div (line 118), before progress-wrap:
```html
<div class="mode-toggle">
  <button id="modeFlashcard" class="active" onclick="setMode('flashcard')">Flashcards</button>
  <button id="modeQuiz" onclick="setMode('quiz')">Quiz</button>
</div>
```

**Step 3: Add quiz container HTML**

Add after card-scene div (line 130), hidden by default:
```html
<div id="quizContainer" style="display:none">
  <div class="quiz-card" id="quizCard"></div>
  <div class="quiz-choices" id="quizChoices"></div>
  <div class="quiz-explanation" id="quizExplanation" style="display:none"></div>
</div>
```

**Step 4: Replace nav-buttons**

Replace mastered button with rating buttons (hidden until card flipped/answered):
```html
<div class="nav-buttons">
  <button onclick="prev()">&#8592; Prev</button>
  <button onclick="shuffle()">Shuffle</button>
  <button onclick="next()">Next &#8594;</button>
</div>
<div class="rating-buttons" id="ratingButtons" style="display:none">
  <button class="rate-again" onclick="rate('again')">Again</button>
  <button class="rate-hard" onclick="rate('hard')">Hard</button>
  <button class="rate-good" onclick="rate('good')">Good</button>
</div>
```

**Step 5: Update stats HTML**

Replace mastered/remaining with due/new/reviewed:
```html
<div class="stats">
  <span>Due: <b id="statDue">0</b></span>
  <span>New: <b id="statNew">0</b></span>
  <span>Reviewed: <b id="statReviewed">0</b></span>
  <span class="stats-actions">
    <button onclick="exportState()">Copy State</button>
    <button onclick="importState()">Paste State</button>
  </span>
</div>
```

**Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: update HTML/CSS for SRS rating buttons and quiz mode layout"
```

---

### Task 3: Implement Flashcard Mode with SRS Rating

**Files:**
- Modify: `public/flashcards.js:745-837` (render, navigation, key handlers)

**Step 1: Update render function**

Show rating buttons only after card is flipped. Hide them on card change.

**Step 2: Add rate function**

```js
function rate(rating) {
  if (!filtered.length) return;
  rateSRS(cardKey(filtered[idx]), rating);
  reviewedThisSession++;
  document.getElementById('ratingButtons').style.display = 'none';
  next();
}
```

**Step 3: Show rating buttons on flip**

Modify the card click handler to show rating buttons when flipped:
```js
cardScene.addEventListener('click', () => {
  cardInner.classList.toggle('flipped');
  if (cardInner.classList.contains('flipped')) {
    document.getElementById('ratingButtons').style.display = 'flex';
  }
});
```

**Step 4: Update updateStats for SRS**

```js
function updateStats() {
  const due = filtered.filter(c => isDue(cardKey(c))).length;
  const newCards = filtered.filter(c => !srsData[cardKey(c)]).length;
  document.getElementById('statDue').textContent = due;
  document.getElementById('statNew').textContent = newCards;
  document.getElementById('statReviewed').textContent = reviewedThisSession;
}
```

**Step 5: Update keyboard shortcuts**

Add 1/2/3 keys for Again/Hard/Good when card is flipped.

**Step 6: Update export/import for SRS data**

**Step 7: Verify manually** — flip cards, rate them, check localStorage, refresh and confirm due ordering.

**Step 8: Commit**

```bash
git add public/flashcards.js
git commit -m "feat: implement flashcard mode with SRS rating buttons"
```

---

### Task 4: Add Quiz Data to All 83 Cards

**Files:**
- Modify: `public/flashcards.js:1-700` (ALL_CARDS array — add `quiz` field to each card)

**Step 1: Add quiz field to each card**

For each of the 83 cards, add a `quiz` object with:
- `stem`: scenario-framed question matching exam style (use the 6 scenarios from the exam guide as context frames)
- `correct`: concise correct answer (derived from `back`)
- `distractors`: 3 plausible wrong answers that test common misconceptions (match exam distractor patterns: over-engineered solutions, prompt-only approaches when programmatic is needed, wrong tool selection, etc.)

Reference the exam guide's distractor patterns:
- Option that addresses wrong problem
- Option that's over-engineered for the situation
- Option that relies on probabilistic LLM behavior when deterministic is needed
- Option that uses non-existent features/flags

**Step 2: Verify all cards have valid quiz fields**

Quick console check: `ALL_CARDS.filter(c => !c.quiz || c.quiz.distractors.length !== 3).length === 0`

**Step 3: Commit**

```bash
git add public/flashcards.js
git commit -m "feat: add exam-style quiz data with distractors for all 83 cards"
```

---

### Task 5: Implement Quiz Mode UI Logic

**Files:**
- Modify: `public/flashcards.js` (add quiz rendering and interaction logic)

**Step 1: Add mode state and toggle**

```js
let currentMode = 'flashcard'; // 'flashcard' | 'quiz'
let quizAnswered = false;

function setMode(mode) {
  currentMode = mode;
  document.getElementById('modeFlashcard').classList.toggle('active', mode === 'flashcard');
  document.getElementById('modeQuiz').classList.toggle('active', mode === 'quiz');
  // Toggle visibility of flashcard vs quiz containers
  cardScene.style.display = mode === 'flashcard' ? 'block' : 'none';
  document.getElementById('quizContainer').style.display = mode === 'quiz' ? 'block' : 'none';
  document.getElementById('ratingButtons').style.display = 'none';
  render();
}
```

**Step 2: Add quiz render function**

```js
function renderQuiz() {
  const c = filtered[idx];
  if (!c) return;
  quizAnswered = false;

  const quizCard = document.getElementById('quizCard');
  const quizChoices = document.getElementById('quizChoices');
  const quizExplanation = document.getElementById('quizExplanation');
  quizExplanation.style.display = 'none';

  if (c.quiz) {
    quizCard.innerHTML = `<div class="card-tags">...</div><div class="card-question">${esc(c.quiz.stem)}</div>`;

    // Shuffle answers
    const answers = [
      { text: c.quiz.correct, isCorrect: true },
      ...c.quiz.distractors.map(d => ({ text: d, isCorrect: false }))
    ];
    shuffleArray(answers);

    const letters = ['A', 'B', 'C', 'D'];
    quizChoices.innerHTML = answers.map((a, i) =>
      `<button class="quiz-choice" data-correct="${a.isCorrect}" onclick="selectAnswer(this)">
        <span class="choice-letter">${letters[i]}</span> ${esc(a.text)}
      </button>`
    ).join('');
  } else {
    // Fallback: show as flashcard-style in quiz container
    quizCard.innerHTML = `<div class="card-question">${esc(c.front)}</div>`;
    quizChoices.innerHTML = `<button class="quiz-choice" onclick="revealQuizAnswer()">Reveal Answer</button>`;
  }
}
```

**Step 3: Add answer selection handler**

```js
function selectAnswer(btn) {
  if (quizAnswered) return;
  quizAnswered = true;

  const allBtns = document.querySelectorAll('.quiz-choice');
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === 'true') b.classList.add('correct');
  });

  const isCorrect = btn.dataset.correct === 'true';
  if (!isCorrect) btn.classList.add('wrong');

  // Auto-rate SRS
  const key = cardKey(filtered[idx]);
  rateSRS(key, isCorrect ? 'good' : 'again');
  reviewedThisSession++;

  // Show explanation
  const c = filtered[idx];
  const explanation = document.getElementById('quizExplanation');
  explanation.innerHTML = `<b>${isCorrect ? 'Correct!' : 'Incorrect.'}</b><br><br>${esc(c.back)}`;
  explanation.style.display = 'block';

  updateStats();
}
```

**Step 4: Add keyboard shortcuts for quiz**

A/B/C/D keys select answers, Enter/Right arrow advances to next.

**Step 5: Update render() to dispatch**

```js
function render() {
  if (currentMode === 'quiz') { renderQuiz(); return; }
  // ... existing flashcard render
}
```

**Step 6: Verify manually** — toggle to quiz mode, answer questions, check SRS updates, keyboard shortcuts.

**Step 7: Commit**

```bash
git add public/flashcards.js src/pages/index.astro
git commit -m "feat: implement quiz mode with MCQ interface and auto-SRS rating"
```

---

### Task 6: Polish & Final Integration

**Files:**
- Modify: `public/flashcards.js`, `src/pages/index.astro`

**Step 1:** Ensure export/import state includes SRS data and current mode.

**Step 2:** Ensure URL param `?domain=N` works with both modes.

**Step 3:** Ensure "Hide mastered" checkbox label updated to "Hide reviewed" or similar.

**Step 4:** Add visual indicator on cards showing SRS status (due today badge, new badge).

**Step 5:** Manual end-to-end test: study in flashcard mode, switch to quiz, answer questions, refresh, verify SRS ordering persists, export/import works.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: polish SRS + quiz mode integration, update export/import"
```
