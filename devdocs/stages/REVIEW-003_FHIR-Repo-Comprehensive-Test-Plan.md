# REVIEW-003: FHIR Repository Comprehensive Test Plan

**Created**: 2026-02-26
**Status**: COMPLETED
**Target**: `packages/fhir-persistence/src/repo/fhir-repo.ts` (FhirRepository class)
**Database**: PostgreSQL localhost:5433/medxai_dev (real DB, no mocks)

---

## Test Infrastructure

- **Framework**: Vitest
- **Database**: Real PostgreSQL (no mocks)
- **Isolation**: Each test creates unique resources via `randomUUID()`, cleanup after each test
- **Concurrency**: `Promise.allSettled` / `Promise.all` for parallel operations
- **Repeatability**: All tests idempotent, no shared state between tests

---

## Coverage Gap Analysis

### Existing Test Files (integration, real DB):

| File                                 | Tests | Coverage                                               |
| ------------------------------------ | ----- | ------------------------------------------------------ |
| `repo-integration.test.ts`           | 25    | Basic CRUD, locking, history, lifecycle                |
| `repo-contract.test.ts`              | 12    | DB physical state, concurrent races, history integrity |
| `concurrent.integration.test.ts`     | 11    | B-01~B-07 concurrent patterns                          |
| `transaction.integration.test.ts`    | 11    | C-01~C-09 transaction atomicity                        |
| `large-resource.integration.test.ts` | 10    | D-01~D-06 large/edge data                              |
| `real-data.integration.test.ts`      | 21    | Real FHIR data, bundles, cache, CJK                    |

### New Tests Needed (gaps from user requirements):

| Category           | Gap Description                                                          | Est. Tests |
| ------------------ | ------------------------------------------------------------------------ | ---------- |
| 1. CREATE          | Duplicate id → 409/UPSERT behavior, resourceType immutability            | 4          |
| 2. READ            | read deleted history version specifically                                | 2          |
| 3. UPDATE          | resourceType/id immutability, no-ifMatch strategy clarity                | 4          |
| 4. DELETE          | delete version increments, double-delete consistency                     | 3          |
| 5. HISTORY         | 100x update stress, version monotonic increment, each version data exact | 5          |
| 6. TRANSACTION     | Multi-table write consistency verification                               | 2          |
| 7. CONCURRENCY     | 100 concurrent updates, deadlock detection, no version skip              | 5          |
| 8. DATA INTEGRITY  | JSON round-trip, extension preservation, array order                     | 4          |
| 9. BUNDLE          | Transaction atomicity, rollback, version ordering                        | 3          |
| 10. SEARCH PRE     | Query by resourceType, id, version, deleted exclusion                    | 4          |
| 11. FHIR SEMANTICS | Server-generated meta, resourceType-table consistency                    | 4          |
| 13. LIMITS         | 1000x update, high-volume CRUD, sustained write                          | 4          |
| 14. SECURITY       | Illegal JSON, SQL injection, overlong id, empty body, illegal unicode    | 6          |
| 15. PERFORMANCE    | Baseline timing for create/update/history/concurrent                     | 4          |
| **TOTAL**          |                                                                          | **~54**    |

---

## Test Categories (Detailed)

### Category 1: CREATE Tests

| ID    | Test Case                                                        | Expected                                   | Status   |
| ----- | ---------------------------------------------------------------- | ------------------------------------------ | -------- |
| CR-01 | create without id → auto-generates UUID                          | id is valid UUIDv4                         | NEW      |
| CR-02 | create with assignedId → uses provided id                        | id === assignedId                          | EXISTING |
| CR-03 | create returns complete resource with all fields                 | all input fields present in result         | NEW      |
| CR-04 | meta.versionId is valid UUID on create                           | matches UUID regex                         | EXISTING |
| CR-05 | meta.lastUpdated is ISO 8601 on create                           | matches ISO regex                          | EXISTING |
| CR-06 | resourceType preserved exactly                                   | result.resourceType === input.resourceType | EXISTING |
| CR-07 | create same assignedId twice → UPSERT (last-write-wins)          | second create overwrites, readable         | NEW      |
| CR-08 | concurrent create same assignedId → both settle, resource exists | exactly one readable state                 | EXISTING |
| CR-09 | create with invalid resourceType (table doesn't exist) → error   | throws error                               | NEW      |
| CR-10 | create returns history entry with version=1                      | history length === 1                       | EXISTING |

### Category 2: READ Tests

| ID    | Test Case                                                        | Expected                         | Status   |
| ----- | ---------------------------------------------------------------- | -------------------------------- | -------- |
| RD-01 | read existing resource                                           | returns correct resource         | EXISTING |
| RD-02 | read non-existent id → 404                                       | throws ResourceNotFoundError     | EXISTING |
| RD-03 | read deleted resource → 410 Gone                                 | throws ResourceGoneError         | EXISTING |
| RD-04 | readVersion for specific historical version                      | returns that version's data      | EXISTING |
| RD-05 | readVersion for deleted version → Gone                           | throws ResourceGoneError         | NEW      |
| RD-06 | read after create-update-delete: history versions still readable | all non-delete versions readable | NEW      |

### Category 3: UPDATE Tests

| ID    | Test Case                                           | Expected                                    | Status   |
| ----- | --------------------------------------------------- | ------------------------------------------- | -------- |
| UP-01 | update increments versionId                         | new versionId !== old                       | EXISTING |
| UP-02 | update adds history entry                           | history length increases by 1               | EXISTING |
| UP-03 | meta.lastUpdated changes on update                  | new > old                                   | NEW      |
| UP-04 | original resource preserved in history              | readVersion(oldVersionId) returns old data  | EXISTING |
| UP-05 | If-Match correct version → success                  | update succeeds                             | EXISTING |
| UP-06 | If-Match wrong version → conflict                   | throws ResourceVersionConflictError         | EXISTING |
| UP-07 | update without ifMatch → succeeds (last-write-wins) | update succeeds                             | NEW      |
| UP-08 | update cannot change resourceType                   | resourceType stays same regardless of input | NEW      |
| UP-09 | update cannot change id                             | id stays same                               | NEW      |
| UP-10 | update on non-existent resource → 404               | throws ResourceNotFoundError                | EXISTING |
| UP-11 | update on deleted resource → 410                    | throws ResourceGoneError                    | EXISTING |

### Category 4: DELETE Tests

| ID    | Test Case                                                          | Expected                              | Status   |
| ----- | ------------------------------------------------------------------ | ------------------------------------- | -------- |
| DE-01 | delete marks resource as gone                                      | readResource throws ResourceGoneError | EXISTING |
| DE-02 | delete adds history entry with empty content                       | history has delete marker             | EXISTING |
| DE-03 | delete twice → second throws ResourceGoneError                     | idempotent error behavior             | EXISTING |
| DE-04 | delete version number increments (DB state)                        | history count = create + updates + 1  | NEW      |
| DE-05 | deleted resource excluded from normal reads, history still visible | readHistory returns all versions      | NEW      |
| DE-06 | delete non-existent → 404                                          | throws ResourceNotFoundError          | EXISTING |

### Category 5: HISTORY Tests

| ID    | Test Case                                                     | Expected                              | Status   |
| ----- | ------------------------------------------------------------- | ------------------------------------- | -------- |
| HI-01 | create→update→delete: 3 history entries in order              | newest first                          | EXISTING |
| HI-02 | meta.versionId monotonically unique across versions           | all different                         | EXISTING |
| HI-03 | each history version data matches what was written            | exact field comparison                | NEW      |
| HI-04 | 100 consecutive updates → 101 history entries                 | all present, correct order            | NEW      |
| HI-05 | each historical version individually readable via readVersion | all 101 readable                      | NEW      |
| HI-06 | history pagination with \_count                               | respects limit                        | NEW      |
| HI-07 | history \_since filter                                        | only returns versions after timestamp | NEW      |

### Category 6: TRANSACTION SAFETY Tests

| ID    | Test Case                                                   | Expected                                     | Status   |
| ----- | ----------------------------------------------------------- | -------------------------------------------- | -------- |
| TX-01 | update mid-failure → no history produced                    | history count unchanged                      | EXISTING |
| TX-02 | create failure → no dirty data in main or history           | both tables clean                            | EXISTING |
| TX-03 | multi-table write consistency (main + history atomicity)    | both or neither committed                    | EXISTING |
| TX-04 | verify main table + history table row counts always in sync | count(history) >= count(main where !deleted) | NEW      |
| TX-05 | rollback leaves no partial state in any table               | all-or-nothing                               | EXISTING |

### Category 7: CONCURRENCY Tests

| ID    | Test Case                                                          | Expected                         | Status   |
| ----- | ------------------------------------------------------------------ | -------------------------------- | -------- |
| CC-01 | 2 concurrent updates with ifMatch → one wins one conflicts         | exactly 1 success                | EXISTING |
| CC-02 | concurrent create same assignedId                                  | resource exists, readable        | EXISTING |
| CC-03 | 20 concurrent updates → no deadlock, no version skip               | all settle, history consistent   | NEW      |
| CC-04 | 20 concurrent creates → all succeed, unique ids                    | 20 unique resources              | NEW      |
| CC-05 | concurrent delete + update → consistent state                      | no data corruption               | EXISTING |
| CC-06 | history entry count == successful write count after concurrent ops | exact match                      | NEW      |
| CC-07 | no duplicate versionId after concurrent writes                     | all versionIds unique in history | NEW      |

### Category 8: DATA INTEGRITY Tests

| ID    | Test Case                                               | Expected                    | Status             |
| ----- | ------------------------------------------------------- | --------------------------- | ------------------ |
| DI-01 | JSON round-trip: all fields preserved after create→read | deep equality               | EXISTING (partial) |
| DI-02 | extension arrays preserved completely                   | length + content match      | EXISTING           |
| DI-03 | large resource (>1MB) round-trip                        | content intact              | EXISTING           |
| DI-04 | deep nested structure (10+ levels)                      | no truncation               | EXISTING           |
| DI-05 | array ordering preserved                                | same order after round-trip | NEW                |
| DI-06 | complex Patient with all common fields                  | every field preserved       | NEW                |
| DI-07 | Observation with nested valueQuantity, code, component  | full structure preserved    | NEW                |

### Category 9: BUNDLE TRANSACTION Tests

| ID    | Test Case                                                         | Expected              | Status   |
| ----- | ----------------------------------------------------------------- | --------------------- | -------- |
| BN-01 | transaction bundle: all entries succeed atomically                | all resources created | EXISTING |
| BN-02 | transaction bundle: one failure → all rolled back                 | none created          | EXISTING |
| BN-03 | batch bundle: independent entries (failure doesn't affect others) | partial success       | EXISTING |
| BN-04 | urn:uuid reference resolution in transaction                      | references resolved   | EXISTING |
| BN-05 | version ordering correct in transaction bundle                    | sequential versionIds | NEW      |

### Category 10: SEARCH PRE-REQUISITE Tests

| ID    | Test Case                                               | Expected                                        | Status |
| ----- | ------------------------------------------------------- | ----------------------------------------------- | ------ |
| SP-01 | raw SQL query by resourceType returns created resources | rows found                                      | NEW    |
| SP-02 | raw SQL query by id returns exact resource              | single row                                      | NEW    |
| SP-03 | deleted resources excluded from WHERE deleted=false     | not in results                                  | NEW    |
| SP-04 | main table has correct \_\_version after CRUD           | 1 after create, 1 after update, -1 after delete | NEW    |

### Category 11: FHIR SEMANTIC CONSISTENCY Tests

| ID    | Test Case                                                              | Expected                         | Status   |
| ----- | ---------------------------------------------------------------------- | -------------------------------- | -------- |
| FS-01 | server overwrites client-provided meta.versionId                       | server-generated, not client     | NEW      |
| FS-02 | server overwrites client-provided meta.lastUpdated                     | server-generated timestamp       | NEW      |
| FS-03 | resourceType in stored JSON matches table                              | JSON.resourceType === table name | NEW      |
| FS-04 | soft delete conforms to FHIR: content='', deleted=true, \_\_version=-1 | all 3 conditions                 | EXISTING |

### Category 13: LIMIT/STRESS Tests

| ID    | Test Case                                            | Expected                          | Status |
| ----- | ---------------------------------------------------- | --------------------------------- | ------ |
| LM-01 | single resource 100 consecutive updates              | 101 history entries, all readable | NEW    |
| LM-02 | create 50 resources of same type rapidly             | all created, all readable         | NEW    |
| LM-03 | sustained write: 30 create-update cycles in sequence | all complete, no errors           | NEW    |

### Category 14: SECURITY BOUNDARY Tests

| ID    | Test Case                                              | Expected                       | Status   |
| ----- | ------------------------------------------------------ | ------------------------------ | -------- |
| SE-01 | SQL injection in string field → stored as literal      | parameterized query protection | EXISTING |
| SE-02 | extremely long id (1000 chars) → handled gracefully    | error or truncation, no crash  | NEW      |
| SE-03 | empty body (no resourceType) → rejected                | throws error                   | NEW      |
| SE-04 | null/undefined resource fields → handled               | no crash                       | NEW      |
| SE-05 | special unicode (RTL, zero-width) → preserved          | round-trip intact              | NEW      |
| SE-06 | resource with `__proto__` or `constructor` keys → safe | no prototype pollution         | NEW      |

### Category 15: PERFORMANCE BASELINE Tests

| ID    | Test Case                                 | Metric          | Status |
| ----- | ----------------------------------------- | --------------- | ------ |
| PF-01 | create average latency (100 creates)      | ms/op logged    | NEW    |
| PF-02 | update average latency (100 updates)      | ms/op logged    | NEW    |
| PF-03 | readHistory latency (50-version resource) | ms/op logged    | NEW    |
| PF-04 | concurrent 20 requests latency            | total ms logged | NEW    |

---

## Execution Plan

1. Create single test file: `fhir-repo-comprehensive.test.ts`
2. All tests use real PostgreSQL (no mocks)
3. Each test creates its own resources with unique IDs
4. Cleanup after each test
5. Performance tests log timing but don't assert thresholds (baseline only)
6. Stress tests use smaller counts (100 instead of 1000/100k) for CI feasibility

---

## Results

| Category           | Total  | Pass   | Fail  | Skip  | Notes                                       |
| ------------------ | ------ | ------ | ----- | ----- | ------------------------------------------- |
| 1. CREATE          | 10     | 10     | 0     | 0     | CR-01~CR-11                                 |
| 2. READ            | 6      | 6      | 0     | 0     | RD-01~RD-06                                 |
| 3. UPDATE          | 11     | 11     | 0     | 0     | UP-01~UP-11                                 |
| 4. DELETE          | 6      | 6      | 0     | 0     | DE-01~DE-06                                 |
| 5. HISTORY         | 7      | 7      | 0     | 0     | HI-01~HI-07, 100x update stress             |
| 6. TRANSACTION     | 5      | 5      | 0     | 0     | TX-01~TX-05                                 |
| 7. CONCURRENCY     | 7      | 7      | 0     | 0     | CC-01~CC-07, 20 concurrent ops              |
| 8. DATA INTEGRITY  | 7      | 7      | 0     | 0     | DI-01~DI-07, >1MB, deep nesting             |
| 9. BUNDLE          | 5      | 5      | 0     | 0     | BN-01~BN-05                                 |
| 10. SEARCH PRE     | 4      | 4      | 0     | 0     | SP-01~SP-04 raw SQL verification            |
| 11. FHIR SEMANTICS | 4      | 4      | 0     | 0     | FS-01~FS-04                                 |
| 13. LIMITS         | 3      | 3      | 0     | 0     | LM-01~LM-03, 100x update, 50 rapid creates  |
| 14. SECURITY       | 6      | 6      | 0     | 0     | SE-01~SE-06, SQL injection, proto pollution |
| 15. PERFORMANCE    | 4      | 4      | 0     | 0     | PF-01~PF-04, baselines logged               |
| **TOTAL**          | **85** | **85** | **0** | **0** | **All passing**                             |

### Performance Baselines (2026-02-26)

| Metric                     | Value                     |
| -------------------------- | ------------------------- |
| CREATE avg (100 ops)       | **1.6 ms/op**             |
| UPDATE avg (100 ops)       | **2.1 ms/op**             |
| HISTORY read (50 versions) | **1.0 ms**                |
| CONCURRENT CREATE (20 ops) | **7 ms total, 0.3 ms/op** |

### Regression Check

- **fhir-persistence total**: 883/883 passing (35 test files)
- **New tests added**: 85
- **Regressions**: 0
- **Duration**: 15.66s total suite

---

## Sign-off

- [x] All NEW tests passing (85/85)
- [x] Zero regressions on existing tests (883/883)
- [x] Performance baselines recorded
- [x] Document updated with final results (2026-02-26)
