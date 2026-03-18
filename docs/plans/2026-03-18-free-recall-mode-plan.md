# Free Recall Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a free recall study mode with textarea input and split-screen answer comparison to the flashcards page.

**Architecture:** Third mode ("recall") alongside existing flashcard and quiz modes. Adds a recall container div with textarea + check button, and a compare view that shows user's answer beside the correct answer. Reuses the same SRS state and rating buttons.

**Tech Stack:** Vanilla JS, Astro, CSS

---

### Task 1: Add Recall Mode Button and CSS

**Files:**
- Modify: `src/pages/flashcards.astro:148-158` (mode-toggle styles)
- Modify: `src/pages/flashcards.astro:227-230` (mode-toggle HTML)

**Step 1: Update mode-toggle CSS for 3 buttons**

In `src/pages/flashcards.astro`, replace the mode-toggle button border-radius rules:

```css
.mode-toggle button:first-child { border-radius:999px 0 0 999px; }
.mode-toggle button:last-child { border-radius:0 999px 999px 0; }
```

These already work for 3 buttons since they target `:first-child` and `:last-child`. The middle button gets no radius, which is correct. No CSS change needed here.

**Step 2: Add the Recall button to HTML**

In `src/pages/flashcards.astro`, change the mode-toggle div to:

```html
<div class="mode-toggle">
  <button id="modeFlashcard" class="active" onclick="setMode('flashcard')">Flashcards</button>
  <button id="modeQuiz" onclick="setMode('quiz')">Quiz</button>
  <button id="modeRecall" onclick="setMode('recall')">Recall</button>
</div>
```

**Step 3: Verify visually**

Run: `npm run dev` and check that all 3 buttons render correctly with proper border radius.

**Step 4: Commit**

```bash
git add src/pages/flashcards.astro
git commit -m "feat: add Recall button to mode toggle"
```

---

### Task 2: Add Recall Container HTML and CSS

**Files:**
- Modify: `src/pages/flashcards.astro` (add CSS + HTML)

**Step 1: Add recall CSS**

Add these styles after the `.quiz-explanation b` rule (around line 205) in the `<style is:global>` block:

```css
.recall-container {
  margin-bottom:16px;
}
.recall-question {
  background:#fff; border-radius:16px; padding:28px 32px;
  border:1px solid rgba(20,20,19,0.1);
  box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  margin-bottom:16px;
}
.recall-textarea {
  width:100%; min-height:80px; max-height:300px; padding:14px 18px;
  font-family:'Source Serif 4',Georgia,serif; font-size:0.95rem; line-height:1.6;
  color:#3d3d3a; border:2px solid #d1cdc4; border-radius:12px;
  resize:vertical; background:#fff; transition:border-color 0.15s;
  box-sizing:border-box;
}
.recall-textarea:focus { outline:none; border-color:#d97757; }
.recall-textarea::placeholder { color:#b0aea5; }
.recall-check-btn {
  display:block; margin:12px auto 0; font-family:'Inter',sans-serif;
  font-size:0.85rem; font-weight:600; padding:10px 28px;
  border:2px solid #d97757; border-radius:999px; background:#fff; color:#d97757;
  cursor:pointer; transition:all 0.15s;
}
.recall-check-btn:hover:not(:disabled) { background:#d97757; color:#fff; }
.recall-check-btn:disabled { opacity:0.4; cursor:default; }
.recall-compare {
  display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;
}
.recall-compare-panel {
  background:#fff; border-radius:12px; padding:20px 22px;
  border:1px solid #e5e3dd;
}
.recall-compare-panel h4 {
  font-family:'Inter',sans-serif; font-size:0.75rem; font-weight:600;
  text-transform:uppercase; letter-spacing:0.04em; margin:0 0 10px;
}
.recall-compare-yours h4 { color:#87867f; }
.recall-compare-correct h4 { color:#27ae60; }
.recall-compare-correct {
  border-color:#c8e6c9;
}
.recall-compare-text {
  font-size:0.92rem; line-height:1.65; color:#3d3d3a;
  white-space:pre-wrap; word-wrap:break-word;
}
@media(max-width:600px){
  .recall-compare { grid-template-columns:1fr; }
}
```

**Step 2: Add recall container HTML**

After the `quizContainer` div (around line 266), add:

```html
<div id="recallContainer" style="display:none">
  <div class="recall-question" id="recallQuestion"></div>
  <div id="recallInput">
    <textarea class="recall-textarea" id="recallTextarea" placeholder="Type what you remember..." rows="3"></textarea>
    <button class="recall-check-btn" id="recallCheckBtn" disabled onclick="checkRecall()">Check</button>
  </div>
  <div class="recall-compare" id="recallCompare" style="display:none">
    <div class="recall-compare-panel recall-compare-yours">
      <h4>Your Answer</h4>
      <div class="recall-compare-text" id="recallYourAnswer"></div>
    </div>
    <div class="recall-compare-panel recall-compare-correct">
      <h4>Correct Answer</h4>
      <div class="recall-compare-text" id="recallCorrectAnswer"></div>
    </div>
  </div>
</div>
```

**Step 3: Commit**

```bash
git add src/pages/flashcards.astro
git commit -m "feat: add recall container HTML and CSS"
```

---

### Task 3: Add Recall Mode Logic in JavaScript

**Files:**
- Modify: `public/flashcards.js`

**Step 1: Update `setMode()` to handle recall**

Replace the existing `setMode` function (line ~1569) with:

```javascript
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
```

**Step 2: Add DOM references for recall elements**

After the existing DOM refs (around line 1611), add:

```javascript
const recallContainer = document.getElementById('recallContainer');
const recallQuestion = document.getElementById('recallQuestion');
const recallTextarea = document.getElementById('recallTextarea');
const recallCheckBtn = document.getElementById('recallCheckBtn');
const recallCompare = document.getElementById('recallCompare');
const recallInput = document.getElementById('recallInput');
const recallYourAnswer = document.getElementById('recallYourAnswer');
const recallCorrectAnswer = document.getElementById('recallCorrectAnswer');
```

**Step 3: Add textarea enable/disable logic**

After the DOM refs, add:

```javascript
recallTextarea.addEventListener('input', () => {
  recallCheckBtn.disabled = recallTextarea.value.trim().length === 0;
  // Auto-grow
  recallTextarea.style.height = 'auto';
  recallTextarea.style.height = Math.min(recallTextarea.scrollHeight, 300) + 'px';
});
```

**Step 4: Add `renderRecall()` function**

After `renderQuiz()` (around line 1762), add:

```javascript
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

  recallQuestion.innerHTML = `<div class="card-tags">${domTag}${typeTag}</div><div class="card-question">${esc(c.front)}</div><div class="card-task"><span>Task ${c.taskId} &middot; ${c.domainName}</span></div>`;

  // Reset input state
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

  // Show compare view
  recallInput.style.display = 'none';
  recallCompare.style.display = 'grid';
  recallYourAnswer.innerHTML = esc(recallTextarea.value.trim());

  let correctHtml = esc(c.back);
  // Add mini diagram if available
  if (c.visualRef && window.DIAGRAMS && DIAGRAMS[c.visualRef.diagram]) {
    correctHtml += '<div id="recallMiniDiagram" style="margin-top:12px;border-top:1px solid #e5e3dd;padding-top:10px;max-height:200px;"></div>';
  }
  correctHtml += `<div class="card-task" style="margin-top:12px;"><span>Task ${c.taskId} &middot; ${c.domainName}</span><button class="speak-btn" onclick="speakDefinition(event)" title="Read definition aloud"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></button></div>`;
  recallCorrectAnswer.innerHTML = correctHtml;

  // Render mini diagram into the placeholder
  if (c.visualRef && window.DIAGRAMS && DIAGRAMS[c.visualRef.diagram]) {
    const container = document.getElementById('recallMiniDiagram');
    if (container) DIAGRAMS[c.visualRef.diagram].draw(container, { step: c.visualRef.step, mini: true });
  }

  // Show rating buttons
  document.getElementById('ratingButtons').style.display = 'flex';
}
```

**Step 5: Update `render()` to dispatch to recall mode**

Change the top of `render()` (line ~1796) from:

```javascript
if(currentMode === 'quiz'){ renderQuiz(); return; }
```

to:

```javascript
if(currentMode === 'quiz'){ renderQuiz(); return; }
if(currentMode === 'recall'){ renderRecall(); return; }
```

**Step 6: Update keyboard handling**

In the `keydown` handler (line ~1882), change the guard that skips input elements:

From:
```javascript
if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
```

To:
```javascript
if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
if(e.target.tagName==='TEXTAREA'){
  // Only handle Cmd/Ctrl+Enter in textarea
  if((e.metaKey || e.ctrlKey) && e.key==='Enter'){ e.preventDefault(); checkRecall(); }
  return;
}
```

Also add recall-specific nav after the existing quiz answer keys block:

```javascript
// Recall: Enter to advance after checking
if(currentMode==='recall' && recallChecked && (e.key==='ArrowRight' || e.key==='Enter')) next();
```

**Step 7: Update URL param support**

At the bottom of the file (line ~1909), after the quiz mode param check, add:

```javascript
else if (modeParam === 'recall') setMode('recall');
```

**Step 8: Commit**

```bash
git add public/flashcards.js
git commit -m "feat: add recall mode logic with compare view"
```

---

### Task 4: Test All Modes and Fix Edge Cases

**Step 1: Manual test matrix**

Run `npm run dev` and verify:

| Test | Expected |
|------|----------|
| Click "Recall" button | Mode switches, textarea appears with question |
| Type text, Check button enables | Button goes from disabled to enabled |
| Click Check with text | Split compare appears, rating buttons show |
| Cmd+Enter submits | Same as clicking Check |
| Rate Again/Hard/Good | Advances to next card, textarea resets, auto-focused |
| Arrow keys after rating | Navigate between cards |
| 1/2/3 keys after Check | Triggers Again/Hard/Good |
| Switch modes mid-card | Clears state, renders correctly |
| Empty filter results | "No cards match" shown |
| Mobile (<600px) | Compare panels stack vertically |
| `?mode=recall` URL param | Loads directly into recall mode |
| `?mode=recall&domain=2` | Loads recall mode filtered to domain 2 |

**Step 2: Fix any issues found**

**Step 3: Commit fixes if any**

```bash
git add src/pages/flashcards.astro public/flashcards.js
git commit -m "fix: recall mode edge cases"
```

---

### Task 5: Final Commit

**Step 1: Verify all 3 modes work end-to-end**

Switch between Flashcards → Quiz → Recall → Flashcards. Confirm SRS state persists across modes.

**Step 2: Build check**

Run: `npm run build`
Expected: Clean build with no errors.
