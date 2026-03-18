# Readiness Dashboard Design

**Date:** 2026-03-18
**Status:** Approved

## Purpose

Add an exam readiness dashboard to the index page so users can see at a glance what they've completed and what's left. Combines auto-detected progress (flashcards, quiz, exercises) with manual checkboxes (study guide reading, practice exam).

## Location

Between the resource cards grid and the "What's on the Exam" topics section on the index page.

## Readiness Section Layout

Overall progress bar at top, then five activity rows:

1. **Study Guide** — manual checkboxes per domain (D1-D5)
2. **Flashcards** — auto-detected, % of cards reviewed per domain, threshold 80%
3. **Quiz Mode** — auto-detected, best quiz score % per domain, threshold 80%
4. **Coding Exercises** — auto-detected, count of completed exercises
5. **Practice Exam** — manual checkbox (external link)

## Data Sources

| Activity | localStorage Key | Auto/Manual |
|----------|-----------------|-------------|
| Study Guide | `readiness-study-guide` — `{"1":true,"2":true,...}` | Manual checkboxes |
| Flashcards | `flashcards-srs` (existing) — compute % with reps>=1 per domain | Auto |
| Quiz | `readiness-quiz` — `{"1":88,"2":72,...}` best % per domain | Auto (new tracking in flashcards.js) |
| Coding Exercises | `readiness-exercises` — `["id1","id2",...]` completed IDs | Auto (new tracking in exercises.js) |
| Practice Exam | `readiness-practice-exam` — `true/false` | Manual checkbox |

## Overall Readiness Score

Weighted average:
- Study Guide: 20% (5 domains, each 4%)
- Flashcards >=80% per domain: 25% (5 domains, each 5%)
- Quiz >=80% per domain: 25% (5 domains, each 5%)
- Coding Exercises: 15% (proportional completed/total)
- Practice Exam: 15% (done or not)

## Thresholds

- Flashcards: domain passes when >=80% of cards in that domain have been reviewed at least once (reps >= 1)
- Quiz: domain passes when best session score for that domain reaches >=80%
- Coding Exercises: each correctly completed exercise counts toward total

## New Tracking Needed

### flashcards.js
After quiz answer scoring (in `selectAnswer` and `rate` for quiz mode), compute and persist per-domain accuracy to `readiness-quiz`. On each answer, update running totals per domain. Save best % seen per domain.

### exercises.js
After `checkExercise()` when all blanks correct, add exercise ID to `readiness-exercises` set in localStorage.

## Files to Modify

- `src/pages/index.astro` — add readiness section HTML, CSS, and inline JS that reads localStorage
- `public/flashcards.js` — add quiz score tracking per domain to `readiness-quiz`
- `public/exercises.js` — add completed exercise tracking to `readiness-exercises`
