# MedXAI vs Medplum DDL Comparison Report

**Updated**: 2026-02-25 (post Lookup-Table-Refactor)
**MedXAI**: `medxai_all_1.sql` (442 tables, generated 2026-02-25 12:43)
**Medplum**: `medplum_all.sql` (497 tables)

> Previous report (2026-02-24) was based on the old per-resource lookup table design (548 MedXAI tables).
> This version reflects the global shared lookup table design matching Medplum's production approach.

---

## 1. Overall Statistics

| Metric                 | MedXAI | Medplum | Delta                                    |
| ---------------------- | ------ | ------- | ---------------------------------------- |
| Total tables           | 442    | 497     | Medplum has 55 extra platform tables     |
| Tables only in MedXAI  | **0**  | —       | ✅ Down from 51 (lookup refactor)        |
| Tables only in Medplum | 55     | —       | All platform-specific                    |
| Common tables          | 442    | 442     | 100% of MedXAI tables are in Medplum     |
| Extensions             | **2**  | 2       | ✅ Now matching (`pg_trgm`, `btree_gin`) |
| Functions              | 0      | 1       | `token_array_to_text()` still missing    |

---

## 2. Tables Only in Medplum (55 — All Platform-Specific)

All 55 Medplum-exclusive tables are **non-standard FHIR R4** platform types. MedXAI correctly excludes them.

**Auth & Identity (18 tables)**:
`AccessPolicy`, `Agent`, `AsyncJob`, `Bot`, `BulkDataExport`, `ClientApplication`,
`DomainConfiguration`, `JsonWebKey`, `Login`, `Project`, `ProjectMembership`,
`SmartAppLaunch`, `SubscriptionStatus`, `User`, `UserConfiguration`, `UserSecurityRequest`
(plus `_History` / `_References` variants)

**Terminology Engine (7 tables)**:
`CodeSystem_Property`, `Coding`, `Coding_Property`, `CodingSystem`,
`ConceptMapping`, `ConceptMapping_Attribute`, `DatabaseMigration`

**Verdict**: ✅ Expected. These are Medplum's proprietary platform layer, not FHIR R4 resources.

---

## 3. Global Lookup Tables — Now Matching Medplum ✅

After the 2026-02-25 refactor, all 4 global lookup table **column structures are identical** to Medplum:

### HumanName / Identifier — Exact match ✅

| Table        | MedXAI columns                    | Medplum columns                   | Match |
| ------------ | --------------------------------- | --------------------------------- | ----- |
| `HumanName`  | `resourceId, name, given, family` | `resourceId, name, given, family` | ✅    |
| `Identifier` | `resourceId, system, value`       | `resourceId, system, value`       | ✅    |

### Address — Exact match ✅

Both: `resourceId, address, city, country, postalCode, state, use`

### ContactPoint — MedXAI has one extra column

| Column                     | MedXAI | Medplum        |
| -------------------------- | ------ | -------------- |
| `resourceId UUID NOT NULL` | ✅     | ✅             |
| `system TEXT`              | ✅     | ✅             |
| `value TEXT`               | ✅     | ✅             |
| `use TEXT`                 | ✅     | ❌ not present |

**Verdict**: ✅ 3/4 tables identical. `ContactPoint.use` is an extra column — semantically richer, not a problem.

---

## 4. Global Lookup Table Index Gaps

Medplum adds more indexes on lookup tables that MedXAI currently lacks:

### HumanName index gaps

| Missing index                                  | Type               | Purpose                       |
| ---------------------------------------------- | ------------------ | ----------------------------- |
| `gin_trgm_ops` opclass on existing gin indexes | gin + trgm opclass | true trigram substring search |
| `HumanName_name_idx_tsv`                       | gin tsvector       | full-text search              |
| `HumanName_given_idx_tsv`                      | gin tsvector       | full-text search              |
| `HumanName_family_idx_tsv`                     | gin tsvector       | full-text search              |

### Address index gaps

| Missing index                    | Type         |
| -------------------------------- | ------------ |
| `Address_country_idx`            | btree        |
| `Address_postalCode_idx`         | btree        |
| `Address_state_idx`              | btree        |
| `Address_use_idx`                | btree        |
| All `*_idx_tsv` tsvector indexes | gin tsvector |

### ContactPoint / Identifier index gaps

| Missing index             | Type  |
| ------------------------- | ----- |
| `ContactPoint_system_idx` | btree |
| `Identifier_system_idx`   | btree |

**Verdict**: ⚠️ Missing indexes reduce search performance and limit full-text search on lookup tables. Medium priority.

---

## 5. Patient Main Table Column Differences

### Columns in MedXAI but NOT Medplum

| Column(s)                                                             | Strategy     | Notes                                             |
| --------------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| `__active UUID[]` + `__activeText TEXT[]` + `__activeSort TEXT`       | token-column | Medplum uses plain `active BOOLEAN`               |
| `__deceased UUID[]` + `__deceasedText TEXT[]` + `__deceasedSort TEXT` | token-column | Medplum uses plain `deceased BOOLEAN`             |
| `__gender UUID[]` + `__genderText TEXT[]` + `__genderSort TEXT`       | token-column | Medplum uses plain `gender TEXT`                  |
| `__addressSort TEXT` + 5 sub-sort cols                                | sort         | Medplum omits; uses Address lookup table only     |
| `__phoneticSort TEXT`                                                 | sort         | Medplum stores `phonetic TEXT[]` in Patient table |
| `__tag UUID[]` + `__tagText TEXT[]` + `__tagSort TEXT`                | metadata     | Medplum uses `___tag` (triple underscore)         |
| `__security UUID[]` + `__securityText TEXT[]` + `__securitySort TEXT` | metadata     | Medplum uses `___security` naming                 |

### Columns in Medplum but NOT MedXAI

| Column                                                     | Type         | Notes                             |
| ---------------------------------------------------------- | ------------ | --------------------------------- |
| `active BOOLEAN`                                           | plain        | MedXAI uses token-column instead  |
| `deceased BOOLEAN`                                         | plain        | same                              |
| `gender TEXT`                                              | plain        | same                              |
| `phonetic TEXT[]`                                          | array        | MedXAI uses `__phoneticSort TEXT` |
| `___tag UUID[]`, `___tagText TEXT[]`, `___tagSort TEXT`    | metadata     | triple-underscore naming          |
| `___securitySort TEXT`                                     | metadata     | triple-underscore naming          |
| `__email UUID[]` + `__emailText TEXT[]`                    | token-column | MedXAI has sort-only approach     |
| `__phone UUID[]` + `__phoneText TEXT[]`                    | token-column | same                              |
| `__telecom UUID[]` + `__telecomText TEXT[]`                | token-column | same                              |
| `___compartmentIdentifierSort TEXT`                        | sort         | reference identifier sort         |
| `__generalPractitionerIdentifierSort TEXT`                 | sort         | reference identifier sort         |
| `__linkIdentifierSort TEXT`                                | sort         | reference identifier sort         |
| `__organizationIdentifierSort TEXT`                        | sort         | reference identifier sort         |
| `ethnicity TEXT[]`, `genderIdentity TEXT[]`, `race TEXT[]` | array        | US Core extensions                |

---

## 6. Systematic Design Differences

### 6.1 Boolean/Simple Token Fields: token-column vs plain column

| Search Param                   | MedXAI                                                       | Medplum                    |
| ------------------------------ | ------------------------------------------------------------ | -------------------------- |
| `active`                       | `__active UUID[]` + `__activeText TEXT[]` (token-column)     | `active BOOLEAN` (plain)   |
| `deceased`                     | `__deceased UUID[]` + `__deceasedText TEXT[]` (token-column) | `deceased BOOLEAN` (plain) |
| `gender`                       | `__gender UUID[]` + `__genderText TEXT[]` (token-column)     | `gender TEXT` (plain)      |
| `status`, `intent`, `priority` | token-column (3 cols each)                                   | `TEXT` plain column        |

**Root cause**: `resolveStrategy()` maps ALL `token`-type search params to token-column. Medplum special-cases boolean/simple-code tokens into scalar columns.

**Verdict**: ⚠️ Design choice. MedXAI is richer (supports system-qualified token search) but uses 3× storage per param. Not a correctness issue.

### 6.2 Metadata Column Naming: `__tag` vs `___tag`

Medplum uses triple underscore (`___`) for metadata columns (`___tag`, `___security`) to distinguish from search-param columns (`__`). MedXAI uses double underscore for both.

**Verdict**: ⚠️ Cosmetic. No functional impact.

### 6.3 `email`/`phone`/`telecom` Search Strategy

| Param     | MedXAI                                             | Medplum                                                    |
| --------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `email`   | `__emailSort TEXT` + global `ContactPoint` table   | `__email UUID[]` + `__emailText TEXT[]` (token-column)     |
| `phone`   | `__phoneSort TEXT` + global `ContactPoint` table   | `__phone UUID[]` + `__phoneText TEXT[]` (token-column)     |
| `telecom` | `__telecomSort TEXT` + global `ContactPoint` table | `__telecom UUID[]` + `__telecomText TEXT[]` (token-column) |

**Verdict**: ⚠️ MedXAI searches via EXISTS on global `ContactPoint`; Medplum additionally keeps hash arrays in the main table. Functionally equivalent for most queries.

### 6.4 `token_array_to_text()` Function

Medplum's trigram indexes on token text arrays use:

```sql
USING gin (public.token_array_to_text("__identifierText") public.gin_trgm_ops)
```

MedXAI uses plain GIN without the opclass:

```sql
USING gin ("__identifierText")
```

**Impact**: MedXAI's `__identifierText` GIN supports array containment (`&&`) but NOT trigram substring matching. The `:contains` modifier on token fields will not use the trigram index efficiently.

**Verdict**: ⚠️ Functional gap. Requires adding `token_array_to_text()` function to DDL.

### 6.5 Reference Cardinality: `TEXT` vs `TEXT[]`

Single-target references like `patient`, `subject`, `encounter` are `TEXT[]` in MedXAI vs `TEXT` in Medplum, because MedXAI's `resolveIsArray()` triggers on `.where()` expressions.

**Verdict**: ⚠️ Minor storage inefficiency. Not a correctness issue.

### 6.6 Missing `__*IdentifierSort` Columns

Medplum generates `___compartmentIdentifierSort`, `__generalPractitionerIdentifierSort`, etc. for sort-by-reference-identifier. MedXAI does not.

**Verdict**: ℹ️ Low priority. Only affects sort-by-reference-identifier queries.

---

## 7. Extensions and Functions

| Item                             | MedXAI              | Medplum | Status      |
| -------------------------------- | ------------------- | ------- | ----------- |
| `pg_trgm` extension              | ✅ added 2026-02-25 | ✅      | ✅ Matching |
| `btree_gin` extension            | ✅ added 2026-02-25 | ✅      | ✅ Matching |
| `token_array_to_text()` function | ❌ missing          | ✅      | ⚠️ Gap      |

---

## 8. Summary — Priority Classification

### ✅ Correct / By Design

1. All 55 Medplum-only tables are platform-specific — correct to exclude
2. **Zero MedXAI-only tables** — lookup table refactor complete ✅
3. Global lookup tables (HumanName, Address, ContactPoint, Identifier) — structurally identical ✅
4. `pg_trgm` + `btree_gin` extensions — now present ✅
5. Core fixed columns (id, content, lastUpdated, deleted, projectId, `__version`, compartments) — **identical** ✅
6. History table structure — **identical** ✅
7. References table structure — **identical** ✅
8. `__sharedTokens` / `__sharedTokensText` pattern — **identical** ✅
9. `status`/`intent`/`priority` as token-column — richer search, acceptable design choice

### ⚠️ Should Fix (medium priority)

1. **Missing `token_array_to_text()` function** — needed for `:contains` trigram search on token text arrays
2. **Global lookup table index gaps** — missing btree indexes for Address fields (`country`, `postalCode`, `state`, `use`), missing `system` indexes on ContactPoint/Identifier, missing `gin_trgm_ops` opclass on trigram indexes
3. **`email`/`phone`/`telecom`** — consider adding token-column hash arrays in main table alongside ContactPoint rows
4. **Reference cardinality** (`TEXT[]` → `TEXT` for single-target refs) — minor storage efficiency

### ℹ️ Nice to Have (low priority)

1. Align `__tag` → `___tag` metadata naming convention
2. Add `___compartmentIdentifierSort` and per-reference `__*IdentifierSort` sort columns
3. Add `tsvector` full-text indexes on lookup table text columns
4. US Core extension columns (`ethnicity`, `genderIdentity`, `race`) for Patient

---

## 9. Core Structural Match

| Structural Element                                                  | Match?     |
| ------------------------------------------------------------------- | ---------- |
| 3 tables per resource (main + history + references)                 | ✅         |
| UUID primary keys                                                   | ✅         |
| `content TEXT` JSON storage                                         | ✅         |
| `lastUpdated TIMESTAMPTZ`                                           | ✅         |
| `deleted BOOLEAN DEFAULT false`                                     | ✅         |
| `projectId UUID`                                                    | ✅         |
| `__version INTEGER`                                                 | ✅         |
| `compartments UUID[]`                                               | ✅         |
| Token columns (UUID[] hash + TEXT[] display)                        | ✅         |
| `__sharedTokens` / `__sharedTokensText`                             | ✅         |
| History table (versionId PK + id + content + lastUpdated)           | ✅         |
| References table (resourceId + targetId + code)                     | ✅         |
| Global lookup tables (HumanName, Address, ContactPoint, Identifier) | ✅ **new** |
| `pg_trgm` + `btree_gin` extensions                                  | ✅ **new** |

**Overall assessment**: After the lookup table refactor, MedXAI's database schema is now **structurally near-identical** to Medplum's production design. The 442 FHIR R4 resource tables are 100% present in Medplum. Remaining gaps are in index completeness and the `token_array_to_text()` function, not in architecture.

---

## 10. Next Steps

1. **Add `token_array_to_text()` function** to DDL generation.
2. **Complete global lookup table indexes** (Address, ContactPoint, Identifier).
3. **Refine `resolveIsArray()`** to avoid `TEXT[]` for single-target references.
4. **Consider adding `___compartmentIdentifierSort` and per-reference `__*IdentifierSort` columns**.
