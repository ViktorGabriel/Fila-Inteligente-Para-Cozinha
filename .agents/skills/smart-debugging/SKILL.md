---
name: smart-debugging
description: Systematic root cause analysis and diagnostic workflows for Node.js backends, WebSocket race conditions, dynamic SLA calculation divergences, and state corruption. Use when investigating bugs, fixing failing tests, or troubleshooting runtime issues.
---

# Smart Debugging & Root Cause Analysis Toolkit

## 1. The 4-Step Systematic Debugging Protocol

### Step 1: Reproduce & Isolate
- Write a minimal failing unit or integration test reproducing the exact scenario before touching any production code.
- Avoid guessing or changing code at random.

### Step 2: Formulate Hypotheses
- List 2-3 specific technical hypotheses explaining why the failure occurs:
  1. *Timezone / Reference Date mismatch* in elapsed SLA calculations.
  2. *State mutation race condition* during asynchronous status updates.
  3. *Uncaught async promise rejection* or unhandled WebSocket disconnect.

### Step 3: Inspect State & Validate
- Inspect inputs, internal entity states, and timestamps at each boundary.
- For dynamic queue calculations:
  - Check `receivedAt` vs `referenceDate` in minutes: `Math.floor((ref.getTime() - received.getTime()) / 60000)`.
  - Check whether `maxPrepTimeMinutes` correctly picks the max of all item prep times.
  - Verify boundary comparisons (`<=` vs `<`).

### Step 4: Fix, Verify & Prevent Regression
- Implement the targeted fix at the lowest layer responsible (Domain > Application > Infra).
- Run the full test suite (`npm test`) to confirm zero regressions.
