# Phase 21: Bundle Transaction/Batch, Cache & Retry — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 21 (Stage-4)  
**Started:** 2026-02-24  
**Completed:** 2026-02-24  
**Depends On:** Phase 20 ✅ Complete  
**Entry Test Count:** 3307  
**Exit Test Count:** 3324 (+17 new tests, 0 regressions)

---

## Overview

Phase 21 implements FHIR Bundle processing (transaction and batch modes), an in-memory read cache (LRU), and serialization conflict retry logic.

---

## Tasks

### Task 21.1: Bundle Transaction Processing

**Files:** `repo/bundle-processor.ts` (new), `routes/bundle-routes.ts` (new)

- `POST /` with `Bundle.type = 'transaction'`
- All entries in a single PostgreSQL transaction
- Rollback all on any failure
- Support: create, update, delete within bundle
- Resolve internal references (`urn:uuid:...` → actual IDs)
- Return response Bundle with per-entry results

### Task 21.2: Bundle Batch Processing

**Files:** `repo/bundle-processor.ts`

- `POST /` with `Bundle.type = 'batch'`
- Each entry processed independently (no shared transaction)
- Individual success/failure per entry
- Return response Bundle with per-entry outcomes

### Task 21.3: Read Cache (LRU)

**Files:** `cache/resource-cache.ts` (new)

- In-memory LRU cache for `readResource` results
- Cache key: `{resourceType}/{id}`
- Invalidation on update and delete
- Configurable max size (default 1000) and TTL (default 60s)
- Disabled by default, enabled via config

### Task 21.4: Serialization Conflict Retry

**Files:** `db/client.ts`

- Detect PostgreSQL error code `40001` (serialization_failure)
- Auto-retry with exponential backoff (max 3 retries)
- Log retry attempts

### Task 21.5: Tests + Verification

- Unit tests for bundle transaction (all-or-nothing, urn:uuid resolution)
- Unit tests for bundle batch (per-entry outcomes)
- Unit tests for cache (hit/miss/invalidation/TTL)
- Unit tests for retry logic
- Full suite verification

---

## Acceptance Criteria

- [x] Transaction bundle: all-or-nothing processing
- [x] Batch bundle: per-entry outcomes
- [x] Internal reference resolution (`urn:uuid:...`)
- [x] Cache reduces DB reads for repeated access (LRU with TTL)
- [x] Cache correctly invalidated on writes
- [x] Serialization retry works (exponential backoff, max 3)
- [x] 17 new tests passing
- [x] Zero regressions
- [x] `tsc --noEmit` clean
- [x] `npm run build` clean
