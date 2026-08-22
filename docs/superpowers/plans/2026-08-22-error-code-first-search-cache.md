# Error Code First Search Cache Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first error-code lookup fast while keeping browser cache useful for later searches.

**Architecture:** Keep first search on targeted Firebase queries. Load IndexedDB cache without triggering full Firebase fetch during page startup. Refresh full records only after first visible result or during browser idle time, then build an in-memory search index and clear stale term-result cache.

**Tech Stack:** Static HTML, Firebase Realtime Database compat SDK, IndexedDB, service worker cache versioning.

---

### Task 1: First Search Path

**Files:**
- Modify: `error_codes.html`

- [x] **Step 1: Keep startup cache read local-only**

Change `warmErrorCodeCache()` so it reads IndexedDB and does not call `refreshAllRecords()` before the first search.

- [x] **Step 2: Schedule full refresh after user-visible work**

Add an idle/background scheduler. Use it after first search render and after local cache load when no query is active.

- [x] **Step 3: Invalidate cache correctly**

Treat browser cache as valid only when `version === APP_VERSION` and TTL has not expired. Clear `searchResultCache` when replacing `cachedRecords`.

- [x] **Step 4: Build local index**

When records load, precompute compact code and uppercase search text. Use that index for local code and keyword filtering.

- [x] **Step 5: Verify**

Run inline script parse check and `npm run build`.
