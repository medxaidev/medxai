# Phase 10: History Mechanism — Detailed Plan

> **Status:** ✅ Completed (2026-02-23)
> **Duration:** 2-3 days
> **Complexity:** Medium
> **Risk:** Low
> **Dependencies:** Phase 9 ✅ (FhirRepository with readHistory/readVersion)

---

## Overview

Phase 10 extends the persistence layer with FHIR-compliant history operations:

- **Instance history** — all versions of a single resource
- **Type-level history** — all changes to a resource type
- **System-level history** — all changes across all resource types
- **History Bundle construction** — FHIR Bundle type `history` with proper entries
- **Filtering** — `_since`, `_count` parameters
- **Pagination** — cursor-based (lastUpdated-based)

### What's Already Done (Phase 9)

- `FhirRepository.readHistory(resourceType, id)` — returns all versions
- `FhirRepository.readVersion(resourceType, id, versionId)` — reads specific version
- History table indexes: `id` btree + `lastUpdated` btree

### What Phase 10 Adds

- `HistoryOptions` type (`_since`, `_count`, `_at`)
- Enhanced `readHistory()` with filtering/pagination
- `readTypeHistory()` — type-level history
- `readSystemHistory()` — system-level history (across all 146 resource types)
- `buildHistoryBundle()` — constructs FHIR Bundle type `history`
- Delete entries in history bundles (method=DELETE, no resource)

---

## Task Breakdown

### Task 10.1: History Types & SQL Extensions

- `HistoryOptions` interface
- Extended SQL builders for `_since`, `_count`, pagination
- History row type with `deleted` flag detection

### Task 10.2: History Bundle Construction

- `buildHistoryBundle()` — pure function, no DB dependency
- Each entry: `request` (method + URL), `response` (status + ETag), `resource`
- Delete entries: `request.method = DELETE`, no `resource`
- `Bundle.total` and `Bundle.link` (self, next)

### Task 10.3: FhirRepository History Extensions

- `readHistory()` enhanced with `HistoryOptions`
- `readTypeHistory()` — `SELECT FROM "{Type}_History" ORDER BY lastUpdated DESC`
- `readSystemHistory()` — UNION across all resource types (or sequential queries)

### Task 10.4: Tests (35+)

- Unit: bundle construction, SQL generation
- Integration: instance/type/system history, \_since, \_count, pagination, delete entries

---

## Package Location

All code in `packages/fhir-persistence/src/repo/` (extends existing module).
