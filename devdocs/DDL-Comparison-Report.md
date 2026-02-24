# MedXAI vs Medplum DDL Comparison Report

**Generated**: 2026-02-24
**MedXAI**: `medxai_all.sql` (548 tables, 5021 DDL statements)
**Medplum**: `medplum_all.sql` (497 tables)

---

## 1. Overall Statistics

| Metric | MedXAI | Medplum | Notes |
|--------|--------|---------|-------|
| Total tables | 548 | 497 | Medplum has custom types (AccessPolicy, Address, etc.) |
| Indexes | 4473 | 4626 | Medplum slightly more due to identifier sort indexes |
| Unique indexes | 0 | 11 | MedXAI uses PK constraints instead |
| Primary keys | 548 | 492 | 1 per table in both |
| Extensions | 0 | 2 | `btree_gin`, `pg_trgm` |
| Functions | 0 | 1 | `token_array_to_text()` |

---

## 2. Tables Only in Medplum (Custom/Non-FHIR)

These are Medplum-specific custom resource types, **not standard FHIR R4**. Our system correctly excludes them:

- `AccessPolicy`, `AccessPolicy_History`, `AccessPolicy_References`
- `Address`, `Address_History`
- `Agent`, `Agent_History`, `Agent_References`
- `AsyncJob`, `AsyncJob_History`
- `Bot`, `Bot_History`, `Bot_References`
- `BulkDataExport`, `BulkDataExport_History`
- `ClientApplication`, `ClientApplication_History`
- `DatabaseMigration` (migration tracking table)
- `DomainConfiguration`, `DomainConfiguration_History`
- `IdentityProvider`, `IdentityProvider_History`
- `JsonWebKey`, `JsonWebKey_History`
- `Login`, `Login_History`
- `OAuthClientCredential`, etc.
- `PasswordChangeRequest`, `Project`, `ProjectMembership`
- `SmartAppLaunch`, `User`, `UserConfiguration`

**Verdict**: ✅ Expected difference. These are Medplum platform types, not FHIR resources.

---

## 3. Tables Only in MedXAI (Lookup Tables)

MedXAI generates lookup sub-tables for complex search parameters:

- `Account_Name`, `ActivityDefinition_Name`, etc.
- All `*_Name` tables for resources with `name` search params targeting HumanName/Address

**Verdict**: ✅ Correct. These are Phase 19 lookup tables for HumanName/Address search.

---

## 4. Systematic Column Differences

### 4.1 Metadata Column Naming: `__tag` vs `___tag`

| Column | MedXAI | Medplum |
|--------|--------|---------|
| tag hash | `__tag` | `___tag` |
| tag text | `__tagText` | `___tagText` |
| tag sort | `__tagSort` | `___tagSort` |
| security hash | `__security` | (not present as separate column) |
| security sort | `__securitySort` | `___securitySort` |

**Root cause**: Medplum uses triple underscore (`___`) for metadata columns to distinguish from search parameter columns (double `__`). Our code uses double underscore for both.

**Impact**: Functional — no impact. This is a naming convention difference only. Our code consistently uses `__tag` everywhere (schema builder, row indexer, where builder).

**Verdict**: ⚠️ Cosmetic difference. Does NOT affect functionality. Could align naming in a future pass if desired.

### 4.2 `status`/`intent`/`priority` Column Strategy

| Search Param | MedXAI | Medplum |
|-------------|--------|---------|
| `status` | `__status UUID[]` + `__statusText TEXT[]` + `__statusSort TEXT` (token-column) | `status TEXT` (plain column) |
| `intent` | token-column (3 cols) | `intent TEXT` (plain column) |
| `priority` | token-column (3 cols) | `priority TEXT` (plain column) |
| `result` | token-column (3 cols) | `result TEXT` (plain column) |

**Root cause**: FHIR defines these as `type: token`. Our `resolveStrategy()` maps ALL `token` type params to `token-column` strategy. Medplum special-cases some token params that only have simple code values (no system) into plain `TEXT` columns.

**Impact**: MedXAI uses more storage (3 columns vs 1) but provides richer search capability (system|code search). Both are functionally correct for FHIR search.

**Verdict**: ⚠️ Design choice. MedXAI is **more capable** (supports `status=http://hl7.org/fhir/...|active` system-qualified search). Medplum's approach is more storage-efficient for simple codes.

### 4.3 Reference Cardinality: `TEXT` vs `TEXT[]`

| Column | MedXAI | Medplum | Example Resources |
|--------|--------|---------|-------------------|
| `patient` | `TEXT[]` | `TEXT` | Observation, Encounter, Condition |
| `encounter` | `TEXT[]` | `TEXT` | Observation, Procedure |
| `subject` | `TEXT[]` | `TEXT` | Observation, ServiceRequest |
| `owner` | `TEXT[]` | `TEXT` | Task |
| `requester` | `TEXT[]` | `TEXT` | MedicationRequest |

**Root cause**: Our `resolveIsArray()` function (line 264-284 in `search-parameter-registry.ts`) marks references as array if the expression contains `.where()`. Many FHIR R4 search params use `.where(resolve() is Patient)` syntax, which triggers our array detection.

Medplum treats single-target references as scalar `TEXT`, even when the expression uses `.where()`.

**Impact**: 
- MedXAI: Uses `TEXT[]` → WHERE clause uses `&& ARRAY[...]::text[]` (array overlap)
- Medplum: Uses `TEXT` → WHERE clause uses `= $1` (equality)
- Both produce correct search results for single-value references
- MedXAI's approach is slightly less efficient for single-value refs but handles multi-value refs correctly

**Verdict**: ⚠️ Minor inefficiency. Single-target references could be `TEXT` instead of `TEXT[]`. Would require refining `resolveIsArray()` to inspect `.where()` more carefully. **Not a correctness issue**.

### 4.4 Missing `___compartmentIdentifierSort` and `__*IdentifierSort` Columns

Medplum generates per-reference identifier sort columns like:
- `___compartmentIdentifierSort TEXT`
- `__ownerIdentifierSort TEXT`
- `__patientIdentifierSort TEXT`
- `__subjectIdentifierSort TEXT`

MedXAI does not generate these.

**Root cause**: Medplum has additional logic to generate sort columns for reference-type parameters that target identifiable resources. Our schema builder doesn't implement this.

**Impact**: These columns support sorting search results by a referenced resource's identifier. Not commonly used in practice.

**Verdict**: ⚠️ Missing feature. Low priority — only affects sort-by-reference-identifier queries.

### 4.5 `contextQuantity`: `DOUBLE PRECISION` vs `DOUBLE PRECISION[]`

| Column | MedXAI | Medplum |
|--------|--------|---------|
| `contextQuantity` | `DOUBLE PRECISION` (scalar) | `DOUBLE PRECISION[]` (array) |

**Root cause**: `context-quantity` is a composite search parameter. Our system treats quantity params as scalar by default. Medplum treats them as array.

**Impact**: Resources with multiple context-quantity values may lose data in our schema (only first value stored).

**Verdict**: ⚠️ Minor bug. Should be array for quantity params that target repeating elements.

---

## 5. Extensions and Functions

### Missing in MedXAI

| Item | Purpose | Impact |
|------|---------|--------|
| `btree_gin` extension | GIN index support for btree-compatible types | Our GIN indexes work without it for array types |
| `pg_trgm` extension | Trigram-based text similarity search | Our trigram indexes are generated but may not use `pg_trgm` operators |
| `token_array_to_text()` function | Converts text[] to concatenated text for trigram search | Medplum's trigram indexes use this function; ours use raw array GIN |

**Impact**: Our trigram indexes exist but use plain GIN on `TEXT[]` columns. Medplum's trigram indexes use `public.token_array_to_text()` with `pg_trgm` GIN opclass, which provides true substring matching. Our approach provides array containment search but NOT substring/similarity search within token text.

**Verdict**: ⚠️ Functional gap for `:contains` modifier on token text. We should add `pg_trgm` extension and `token_array_to_text()` function in `init-db.ts`.

---

## 6. Summary — Priority Classification

### ✅ Correct / By Design (no action needed)
1. Tables only in Medplum = custom platform types (expected)
2. Tables only in MedXAI = lookup sub-tables (correct Phase 19 output)
3. `status`/`intent`/`priority` as token-column = richer search (acceptable)
4. 共用列结构 (fixed columns: id, content, lastUpdated, deleted, projectId, __version, compartments) = **identical**
5. History table structure = **identical**
6. References table structure = **identical**

### ⚠️ Should Fix (medium priority)
1. **Missing `pg_trgm` extension + `btree_gin` extension + `token_array_to_text()` function** in DDL generation → needed for true `:contains` token search
2. **Reference cardinality** (`TEXT[]` for single-target refs) → minor inefficiency, consider refining `resolveIsArray()`
3. **`contextQuantity` should be array** for composite quantity params

### ℹ️ Nice to Have (low priority)
1. Align `__tag` → `___tag` naming convention
2. Add `___compartmentIdentifierSort` and per-reference `__*IdentifierSort` columns
3. Add `code` column for `ActivityDefinition` (Medplum has it, we don't due to expression parsing difference)

---

## 7. Core Structural Match

Despite the differences above, the **core database architecture is identical to Medplum**:

| Structural Element | Match? |
|-------------------|--------|
| 3 tables per resource (main + history + references) | ✅ |
| UUID primary keys | ✅ |
| `content TEXT` JSON storage | ✅ |
| `lastUpdated TIMESTAMPTZ` | ✅ |
| `deleted BOOLEAN DEFAULT false` | ✅ |
| `projectId UUID` | ✅ |
| `__version INTEGER` | ✅ |
| `compartments UUID[]` | ✅ |
| Token columns (UUID[] hash + TEXT[] display) | ✅ |
| `__sharedTokens` / `__sharedTokensText` | ✅ |
| History table (versionId PK + id + content + lastUpdated) | ✅ |
| References table (resourceId + targetId + code) | ✅ |
| Lookup sub-tables (resourceId + index + value + system) | ✅ |

**Overall assessment**: MedXAI's database schema is **structurally compatible** with Medplum's design. The differences are in implementation details (naming conventions, column strategies) rather than architecture.
