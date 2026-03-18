# Readiness Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an exam readiness dashboard to the index page that shows auto-detected and manual progress across all study activities.

**Architecture:** Three changes: (1) add quiz score and exercise completion tracking to existing JS files, (2) add a readiness section with inline JS to the index page that reads all localStorage data and renders a progress dashboard. No new pages or files.

**Tech Stack:** Astro, vanilla JS, CSS, localStorage

---

### Task 1: Add Quiz Score Tracking per Domain

**Files:**
- Modify: `public/flashcards.js`

**Context:** The quiz mode in flashcards.js tracks `quizCorrect`/`quizWrong` as session-level counters but doesn't persist per-domain scores. We need to track the best quiz accuracy per domain in `readiness-quiz` localStorage key.

**Step 1: Add quiz domain tracking**

In `public/flashcards.js`, find the `selectAnswer` function (which handles quiz MCQ answers). After the line that calls `updateQuizScore()` (around line 1783), add domain-level tracking:

```javascript
// Track per-domain quiz accuracy for readiness
(function trackQuizDomain() {
  const key = 'readiness-quiz-session';
  const session = JSON.parse(localStorage.getItem(key) || '{}');
  const d = String(c.domain);
  if (!session[d]) session[d] = { correct: 0, total: 0 };
  session[d].total++;
  if (isCorrect) session[d].correct++;
  localStorage.setItem(key, JSON.stringify(session));

  // Update best scores
  const best = JSON.parse(localStorage.getItem('readiness-quiz') || '{}');
  const pct = Math.round(session[d].correct / session[d].total * 100);
  if (!best[d] || pct > best[d]) {
    best[d] = pct;
    localStorage.setItem('readiness-quiz', JSON.stringify(best));
  }
})();
```

Also, in the `setMode` function, reset the session tracking when switching modes (add after the existing `quizCorrect = 0; quizWrong = 0;` line):

```javascript
localStorage.removeItem('readiness-quiz-session');
```

**Step 2: Commit**

```bash
git add public/flashcards.js
git commit -m "feat: track per-domain quiz scores for readiness dashboard"
```

---

### Task 2: Add Exercise Completion Tracking

**Files:**
- Modify: `public/exercises.js`

**Context:** The exercises page tracks session score but doesn't persist which exercises have been completed. We need to save completed exercise IDs to `readiness-exercises` localStorage key.

**Step 1: Add completion tracking**

In `public/exercises.js`, find the `checkExercise` function. After the block that sets `scoreCorrect++` when all blanks are correct (the `if (allCorrect)` block), add:

```javascript
    // Persist completed exercise for readiness tracking
    const completed = JSON.parse(localStorage.getItem('readiness-exercises') || '[]');
    if (!completed.includes(ex.id)) {
      completed.push(ex.id);
      localStorage.setItem('readiness-exercises', JSON.stringify(completed));
    }
```

This goes inside the `if (allCorrect) {` block, after `scoreCorrect++`.

**Step 2: Commit**

```bash
git add public/exercises.js
git commit -m "feat: track completed exercises for readiness dashboard"
```

---

### Task 3: Add Readiness Dashboard to Index Page

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Add readiness CSS**

Add these styles inside the existing `<style>` block, after the `.res-card .external-badge` rule (around line 174):

```css
    /* ---- Readiness Dashboard ---- */
    .readiness-section {
      margin-bottom: 40px;
    }
    .readiness-header {
      display: flex; align-items: baseline; justify-content: space-between;
      margin-bottom: 20px; padding-bottom: 12px;
      border-bottom: 2px solid #141413;
    }
    .readiness-header h2 {
      font-family: 'Source Serif 4', serif;
      font-size: 1.4rem; font-weight: 600; color: #141413;
    }
    .readiness-pct {
      font-family: 'Inter', sans-serif;
      font-size: 1.1rem; font-weight: 700; color: #d97757;
    }
    .readiness-bar {
      height: 10px; background: #e8e6dc; border-radius: 5px;
      overflow: hidden; margin-bottom: 24px;
    }
    .readiness-fill {
      height: 100%; background: #d97757; border-radius: 5px;
      transition: width 0.5s ease;
    }
    .readiness-fill.complete { background: #27ae60; }

    .readiness-item {
      background: #fff; border: 1px solid #e8e6dc; border-radius: 14px;
      padding: 18px 22px; margin-bottom: 10px;
    }
    .readiness-item-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .readiness-item-title {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem; font-weight: 600; color: #141413;
      display: flex; align-items: center; gap: 8px;
    }
    .readiness-item-status {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem; font-weight: 600;
    }
    .readiness-item-status.done { color: #27ae60; }
    .readiness-item-status.partial { color: #e67e22; }
    .readiness-item-status.none { color: #b0aea5; }

    .readiness-domains {
      display: flex; flex-wrap: wrap; gap: 8px;
    }
    .readiness-domain {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem; font-weight: 600;
      padding: 4px 12px; border-radius: 999px;
      display: flex; align-items: center; gap: 5px;
    }
    .readiness-domain.pass {
      background: #eafaf1; color: #27ae60;
    }
    .readiness-domain.fail {
      background: #f5f4f0; color: #87867f;
    }
    .readiness-domain.na {
      background: #f5f4f0; color: #b0aea5;
    }

    .readiness-check {
      display: flex; align-items: center; gap: 6px;
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      color: #3d3d3a; cursor: pointer; user-select: none;
    }
    .readiness-check input { accent-color: #d97757; width: 16px; height: 16px; cursor: pointer; }

    .readiness-exercise-bar {
      height: 6px; background: #e8e6dc; border-radius: 3px;
      overflow: hidden; margin-top: 8px;
    }
    .readiness-exercise-fill {
      height: 100%; background: #d97757; border-radius: 3px;
      transition: width 0.3s;
    }

    @media (max-width: 600px) {
      .readiness-domains { gap: 6px; }
      .readiness-domain { font-size: 0.7rem; padding: 3px 10px; }
    }
```

**Step 2: Add readiness HTML**

In the HTML section, after the closing `</div>` of the `resources-grid` div (around line 322) and before the `topics-section` div, add:

```html
    <div class="readiness-section" id="readinessSection">
      <div class="readiness-header">
        <h2>Exam Readiness</h2>
        <span class="readiness-pct" id="readinessPct">0%</span>
      </div>
      <div class="readiness-bar">
        <div class="readiness-fill" id="readinessFill" style="width:0%"></div>
      </div>

      <!-- Study Guide (manual) -->
      <div class="readiness-item" id="riStudyGuide">
        <div class="readiness-item-header">
          <span class="readiness-item-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Study Guide
          </span>
          <span class="readiness-item-status" id="sgStatus">0 / 5</span>
        </div>
        <div class="readiness-domains" id="sgDomains"></div>
      </div>

      <!-- Flashcards (auto) -->
      <div class="readiness-item" id="riFlashcards">
        <div class="readiness-item-header">
          <span class="readiness-item-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="16" height="16" rx="2"/><path d="M6 12h8"/><path d="M6 16h5"/></svg>
            Flashcards &mdash; 80%+ reviewed per domain
          </span>
          <span class="readiness-item-status" id="fcStatus">0 / 5</span>
        </div>
        <div class="readiness-domains" id="fcDomains"></div>
      </div>

      <!-- Quiz (auto) -->
      <div class="readiness-item" id="riQuiz">
        <div class="readiness-item-header">
          <span class="readiness-item-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Quiz Mode &mdash; 80%+ per domain
          </span>
          <span class="readiness-item-status" id="qzStatus">0 / 5</span>
        </div>
        <div class="readiness-domains" id="qzDomains"></div>
      </div>

      <!-- Coding Exercises (auto) -->
      <div class="readiness-item" id="riExercises">
        <div class="readiness-item-header">
          <span class="readiness-item-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Coding Exercises
          </span>
          <span class="readiness-item-status" id="exStatus">0 / 28</span>
        </div>
        <div class="readiness-exercise-bar">
          <div class="readiness-exercise-fill" id="exFill" style="width:0%"></div>
        </div>
      </div>

      <!-- Practice Exam (manual) -->
      <div class="readiness-item" id="riPracticeExam">
        <div class="readiness-item-header">
          <span class="readiness-item-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
            Practice Exam
          </span>
          <span class="readiness-item-status" id="peStatus"></span>
        </div>
        <label class="readiness-check">
          <input type="checkbox" id="peCheckbox" onchange="togglePracticeExam()">
          I've completed the practice exam on Skilljar
        </label>
      </div>
    </div>
```

**Step 3: Add readiness inline script**

At the bottom of the page, before the closing `</Layout>` tag, add:

```html
  <script is:inline>
    const DOMAIN_NAMES = {
      1: 'D1: Architecture',
      2: 'D2: Tools & MCP',
      3: 'D3: Claude Code',
      4: 'D4: Prompts',
      5: 'D5: Context'
    };
    const TOTAL_EXERCISES = 28;
    const THRESHOLD = 80;

    // ── Study Guide (manual checkboxes) ──
    function loadStudyGuide() {
      const saved = JSON.parse(localStorage.getItem('readiness-study-guide') || '{}');
      const container = document.getElementById('sgDomains');
      let count = 0;
      container.innerHTML = '';
      for (let d = 1; d <= 5; d++) {
        const checked = saved[d] || false;
        if (checked) count++;
        container.innerHTML += `<label class="readiness-check"><input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleStudyGuide(${d}, this.checked)">${DOMAIN_NAMES[d]}</label>`;
      }
      const statusEl = document.getElementById('sgStatus');
      statusEl.textContent = count + ' / 5';
      statusEl.className = 'readiness-item-status ' + (count === 5 ? 'done' : count > 0 ? 'partial' : 'none');
      return count;
    }

    function toggleStudyGuide(domain, checked) {
      const saved = JSON.parse(localStorage.getItem('readiness-study-guide') || '{}');
      saved[domain] = checked;
      localStorage.setItem('readiness-study-guide', JSON.stringify(saved));
      loadStudyGuide();
      updateOverall();
    }

    // ── Flashcards (auto from SRS data) ──
    function loadFlashcards() {
      const srs = JSON.parse(localStorage.getItem('flashcards-srs') || '{}');

      // We need card data to know domains — parse from SRS keys
      // SRS keys are "taskId|frontText". TaskId starts with domain number.
      const domainTotals = {};
      const domainReviewed = {};

      // Count all cards per domain from SRS keys + unreviewed cards
      // Since we can't access ALL_CARDS from here, we use what's in SRS
      // plus we need to know totals. We'll fetch from a data attribute.
      // Simpler: read the SRS data and compute per-domain review rates.
      // Cards with reps >= 1 are "reviewed".
      for (const [key, data] of Object.entries(srs)) {
        const domain = key.split('.')[0]; // taskId format: "1.1", "2.3", etc.
        if (!domain || isNaN(Number(domain))) continue;
        const d = domain;
        domainTotals[d] = (domainTotals[d] || 0) + 1;
        if (data.reps >= 1) domainReviewed[d] = (domainReviewed[d] || 0) + 1;
      }

      const container = document.getElementById('fcDomains');
      container.innerHTML = '';
      let passCount = 0;
      for (let d = 1; d <= 5; d++) {
        const total = domainTotals[d] || 0;
        const reviewed = domainReviewed[d] || 0;
        const pct = total > 0 ? Math.round(reviewed / total * 100) : 0;
        const pass = pct >= THRESHOLD;
        if (pass) passCount++;
        const cls = total === 0 ? 'na' : pass ? 'pass' : 'fail';
        const label = total === 0 ? '--' : pct + '%';
        container.innerHTML += `<span class="readiness-domain ${cls}">${DOMAIN_NAMES[d]} ${label}</span>`;
      }
      const statusEl = document.getElementById('fcStatus');
      statusEl.textContent = passCount + ' / 5';
      statusEl.className = 'readiness-item-status ' + (passCount === 5 ? 'done' : passCount > 0 ? 'partial' : 'none');
      return passCount;
    }

    // ── Quiz (auto from readiness-quiz) ──
    function loadQuiz() {
      const best = JSON.parse(localStorage.getItem('readiness-quiz') || '{}');
      const container = document.getElementById('qzDomains');
      container.innerHTML = '';
      let passCount = 0;
      for (let d = 1; d <= 5; d++) {
        const pct = best[d] || best[String(d)] || 0;
        const attempted = pct > 0;
        const pass = pct >= THRESHOLD;
        if (pass) passCount++;
        const cls = !attempted ? 'na' : pass ? 'pass' : 'fail';
        const label = !attempted ? '--' : pct + '%';
        container.innerHTML += `<span class="readiness-domain ${cls}">${DOMAIN_NAMES[d]} ${label}</span>`;
      }
      const statusEl = document.getElementById('qzStatus');
      statusEl.textContent = passCount + ' / 5';
      statusEl.className = 'readiness-item-status ' + (passCount === 5 ? 'done' : passCount > 0 ? 'partial' : 'none');
      return passCount;
    }

    // ── Exercises (auto from readiness-exercises) ──
    function loadExercises() {
      const completed = JSON.parse(localStorage.getItem('readiness-exercises') || '[]');
      const count = completed.length;
      document.getElementById('exStatus').textContent = count + ' / ' + TOTAL_EXERCISES;
      document.getElementById('exStatus').className = 'readiness-item-status ' + (count >= TOTAL_EXERCISES ? 'done' : count > 0 ? 'partial' : 'none');
      document.getElementById('exFill').style.width = (count / TOTAL_EXERCISES * 100) + '%';
      return count;
    }

    // ── Practice Exam (manual) ──
    function loadPracticeExam() {
      const done = localStorage.getItem('readiness-practice-exam') === 'true';
      document.getElementById('peCheckbox').checked = done;
      const statusEl = document.getElementById('peStatus');
      statusEl.textContent = done ? 'Done' : 'Not yet';
      statusEl.className = 'readiness-item-status ' + (done ? 'done' : 'none');
      return done ? 1 : 0;
    }

    function togglePracticeExam() {
      const checked = document.getElementById('peCheckbox').checked;
      localStorage.setItem('readiness-practice-exam', String(checked));
      loadPracticeExam();
      updateOverall();
    }

    // ── Overall Score ──
    function updateOverall() {
      const sg = loadStudyGuide();       // 0-5 domains
      const fc = loadFlashcards();       // 0-5 domains
      const qz = loadQuiz();            // 0-5 domains
      const ex = loadExercises();        // 0-TOTAL count
      const pe = loadPracticeExam();     // 0 or 1

      // Weighted: SG 20%, FC 25%, QZ 25%, EX 15%, PE 15%
      const score = Math.round(
        (sg / 5) * 20 +
        (fc / 5) * 25 +
        (qz / 5) * 25 +
        (ex / TOTAL_EXERCISES) * 15 +
        pe * 15
      );

      document.getElementById('readinessPct').textContent = score + '%';
      const fill = document.getElementById('readinessFill');
      fill.style.width = score + '%';
      fill.classList.toggle('complete', score >= 100);
    }

    // Init
    updateOverall();
  </script>
```

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add readiness dashboard to index page"
```

---

### Task 4: Build Check and Manual Testing

**Step 1: Build**

Run: `npm run build`
Expected: 11 pages, clean build.

**Step 2: Manual test matrix**

| Test | Expected |
|------|----------|
| Index page loads | Readiness section visible between resource cards and topics |
| All fresh (no localStorage) | 0% overall, all statuses show "0/5" or "--" |
| Check study guide D1 checkbox | Updates to "1/5", overall % increases |
| Check all 5 study guide domains | "5/5" green, overall goes up by 20% |
| Go to flashcards, review some D1 cards | Return to index, flashcards D1 shows % |
| Go to quiz mode, answer D1 questions | Return to index, quiz D1 shows best % |
| Go to practice, complete an exercise | Return to index, exercises count increases |
| Check practice exam checkbox | Status shows "Done", overall goes up by 15% |
| Complete everything | 100%, bar turns green |
| Mobile (<600px) | Domain pills wrap, checkboxes tappable |
| Refresh page | All state persists from localStorage |

**Step 3: Commit fixes if any**

```bash
git add src/pages/index.astro public/flashcards.js public/exercises.js
git commit -m "fix: readiness dashboard edge cases"
```
