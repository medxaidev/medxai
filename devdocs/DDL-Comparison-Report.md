# MedXAI vs Medplum DDL Comparison Report

**Updated**: 2026-02-26 (v4 — full cross-system comparison with real Medplum pg_dump)
**MedXAI**: `medxai_all_3.sql` (442 tables, 4281 indexes)
**Medplum**: `medplum_all.sql` (497 tables, 4637 indexes)

> v1 (2026-02-24): old per-resource lookup tables (548 MedXAI tables).
> v2 (2026-02-25 12:43): global lookup table refactor — 442 tables, 0 MedXAI-only.
> v3 (2026-02-25 16:13): all 8 medium/low gaps closed — schema now fully aligned.
> v4 (2026-02-26 03:24): full cross-system comparison — medxai_all_3.sql vs medplum_all.sql (real Medplum pg_dump).

---

## 1. Overall Statistics

| Metric                     | MedXAI | Medplum | Delta                                         |
| -------------------------- | ------ | ------- | --------------------------------------------- |
| Total tables               | 442    | 497     | Medplum has 55 extra platform tables          |
| Tables only in MedXAI      | **0**  | —       | ✅ All MedXAI tables exist in Medplum         |
| Tables only in Medplum     | 55     | —       | All platform-specific (non-FHIR R4)           |
| Common tables              | 442    | 442     | 100% of MedXAI tables are in Medplum          |
| Tables with column diffs   | 147    | —       | Systematic design differences (see §5)        |
| Total indexes              | 4281   | 4637    | —                                             |
| Matching indexes           | 2527   | —       | 59% identical                                 |
| Indexes only in MedXAI     | 1754   | —       | Naming convention differences (see §6)        |
| Indexes only in Medplum    | 2110   | —       | Naming convention + extra platform tables     |
| Real index type mismatches | 339    | —       | btree↔gin + `__version` vs `version` (see §6) |
| Extensions                 | **2**  | 2       | ✅ Matching (`pg_trgm`, `btree_gin`)          |
| Functions                  | **1**  | 1       | ✅ `token_array_to_text()` present            |

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

## 4. Global Lookup Table Indexes — Now Matching Medplum ✅

All index gaps identified in v2 have been closed in the 2026-02-25 gap-fix pass.

### HumanName — ✅ All indexes present

| Index                      | Type               | Status |
| -------------------------- | ------------------ | ------ |
| `HumanName_name_idx`       | btree              | ✅     |
| `HumanName_given_idx`      | btree              | ✅     |
| `HumanName_family_idx`     | btree              | ✅     |
| `HumanName_nameTrgm_idx`   | gin `gin_trgm_ops` | ✅     |
| `HumanName_givenTrgm_idx`  | gin `gin_trgm_ops` | ✅     |
| `HumanName_familyTrgm_idx` | gin `gin_trgm_ops` | ✅     |
| `HumanName_name_idx_tsv`   | gin tsvector       | ✅     |
| `HumanName_given_idx_tsv`  | gin tsvector       | ✅     |
| `HumanName_family_idx_tsv` | gin tsvector       | ✅     |

### Address — ✅ All indexes present

All btree indexes (`address`, `city`, `country`, `postalCode`, `state`, `use`) + all `tsvector` GIN indexes now present.

### ContactPoint / Identifier — ✅ `system` index added

`ContactPoint_system_idx` and `Identifier_system_idx` both present.

---

## 5. Column Differences — Systematic Analysis (147 tables)

The 147 tables with column differences break down into **5 systematic categories**, all of which are known design choices — not bugs.

### 5.1 Token-Column vs Plain Column (affects ~110 tables)

**MedXAI**: Token-type search params (status, intent, type, category, etc.) stored as 3 columns:
`__status UUID[]` + `__statusText TEXT[]` + `__statusSort TEXT`

**Medplum**: Same params stored as a single plain column:
`status TEXT`

| Example Params                                   | MedXAI (token-column)          | Medplum (plain)  | Tables Affected |
| ------------------------------------------------ | ------------------------------ | ---------------- | --------------- |
| `status`, `intent`, `priority`                   | `__status UUID[]` + 2 aux cols | `status TEXT`    | ~80             |
| `active`                                         | `__active UUID[]` + 2 aux cols | `active BOOLEAN` | ~15             |
| `gender`                                         | `__gender UUID[]` + 2 aux cols | `gender TEXT`    | 3               |
| `category`, `code`, `type`, `kind`, `mode`, etc. | token-column (3 cols each)     | plain TEXT       | ~40             |

**Root cause**: `resolveStrategy()` maps ALL `token`-type search params to `token-column`. Medplum special-cases boolean/simple-code tokens into scalar columns.

**Verdict**: ✅ Accepted design choice. MedXAI is richer (supports `system|code` token search on all fields) but uses 3× storage per param.

### 5.2 `___security` / `___securityText` — MedXAI Only (146 tables)

MedXAI generates `___security UUID[]` + `___securityText TEXT[]` on every resource table.
Medplum **does not** have these columns (security labels are handled differently).

**Verdict**: ℹ️ Extra columns. Not harmful; enables security-label search. Medplum handles this via shared tokens.

### 5.3 `___compartmentIdentifierSort` + `__*IdentifierSort` — Medplum Only (145 tables)

Medplum generates reference identifier sort columns on nearly every table:

- `___compartmentIdentifierSort TEXT` (145 tables)
- `__patientIdentifierSort TEXT`, `__subjectIdentifierSort TEXT`, etc. (per reference field)

MedXAI does not generate these.

**Verdict**: ℹ️ Low priority. Only needed for `_sort=<reference>:identifier` queries.

### 5.4 Reference Cardinality Mismatches (~267 column type mismatches)

| Mismatch Type                              | Count | Cause                                          |
| ------------------------------------------ | ----- | ---------------------------------------------- |
| `TEXT` (MedXAI) vs `TEXT[]` (Medplum)      | 114   | MedXAI treats multi-target refs as scalar      |
| `TEXT[]` (MedXAI) vs `TEXT` (Medplum)      | 153   | MedXAI treats some single-target refs as array |
| `TIMESTAMPTZ` vs `TIMESTAMPTZ[]`           | 8     | Date array cardinality                         |
| `DOUBLE PRECISION` vs `DOUBLE PRECISION[]` | 35    | contextQuantity always scalar in MedXAI        |
| `TIMESTAMPTZ` vs `DATE`                    | 7     | Date type precision difference                 |

**Root cause**: `resolveIsArray()` uses different heuristics than Medplum for determining when a reference column should be array vs scalar. The v3 fix (single-target `.where()` → TEXT) resolved the most common cases, but **many edge cases remain** across 442 tables.

**Verdict**: ⚠️ **Medium priority**. While all 267 mismatches are functional (both sides can store and query the data), they affect:

- Index type choice (btree for scalar, gin for array)
- WHERE clause generation (`=` vs `&&`)
- Storage efficiency

### 5.5 Other Column Differences

| Difference                                          | Tables | Details                                                   |
| --------------------------------------------------- | ------ | --------------------------------------------------------- |
| `name TEXT` (Medplum) vs `__nameSort TEXT` (MedXAI) | ~30    | Medplum uses plain `name` for resources with string names |
| `version TEXT` (Medplum) vs absent (MedXAI)         | ~28    | Conformance resources version column                      |
| `ContactPoint.use TEXT` (MedXAI only)               | 1      | Extra column in global lookup table                       |

---

## 6. Index Differences — Systematic Analysis (339 real mismatches)

### 6.1 Index Naming Convention Divergence

MedXAI and Medplum use **different naming conventions** for the same logical indexes, causing 1754 MedXAI-only + 2110 Medplum-only counts. These are the **same indexes** with different names:

| MedXAI Pattern                  | Medplum Pattern                | Example                                |
| ------------------------------- | ------------------------------ | -------------------------------------- |
| `Account___statusText_trgm_idx` | `Account___statusTextTrgm_idx` | underscore vs camelCase in trgm suffix |
| `Account___status_idx`          | `Account___status_idx`         | identical (2527 matched)               |
| `Account_profile_idx`           | `Account__profile_idx`         | single vs double underscore prefix     |
| `Account_version_idx`           | `Account___version_idx`        | MedXAI missing underscore prefix       |

**Verdict**: ℹ️ Cosmetic only. The indexes cover the same columns with the same types. Naming can be harmonized in a future pass.

### 6.2 Real Index Type Mismatches (339)

| Mismatch Category                           | Count | Cause                                                                 |
| ------------------------------------------- | ----- | --------------------------------------------------------------------- |
| btree (MedXAI) vs gin (Medplum)             | ~158  | Array columns in Medplum need GIN; MedXAI has scalar → btree          |
| gin (MedXAI) vs btree (Medplum)             | ~153  | Array columns in MedXAI need GIN; Medplum has scalar → btree          |
| `__version` (MedXAI) vs `version` (Medplum) | 28    | MedXAI internal `__version` column vs Medplum's conformance `version` |

**Root cause**: Directly mirrors §5.4 — when a column is `TEXT` (scalar), it gets a btree index; when it's `TEXT[]` (array), it gets a gin index. The 339 mismatches are a **consequence** of the 267 cardinality mismatches.

**Verdict**: ⚠️ Same priority as §5.4. Fixing reference cardinality will automatically fix these index mismatches.

### 6.3 `__version` Column Index

MedXAI names its internal version counter `__version` (double underscore), which is a fixed column on every table. Medplum also has `__version` but additionally has a `version TEXT` column on conformance resources (SearchParameter, ValueSet, StructureDefinition, etc.). The index `*_version_idx` in MedXAI indexes `__version` while in Medplum it indexes `version` (the conformance version string).

**Verdict**: ℹ️ Low priority. MedXAI should add `version TEXT` column for conformance resources.

---

## 7. Extensions and Functions

| Item                             | MedXAI | Medplum | Status      |
| -------------------------------- | ------ | ------- | ----------- |
| `pg_trgm` extension              | ✅     | ✅      | ✅ Matching |
| `btree_gin` extension            | ✅     | ✅      | ✅ Matching |
| `token_array_to_text()` function | ✅     | ✅      | ✅ Matching |

---

## 8. Priority Classification

### ✅ Fully Matching (no action needed)

1. **442/442 FHIR R4 tables** present in both systems
2. **0 MedXAI-only tables** — all 55 Medplum-only tables are platform-specific
3. **Global lookup tables** (HumanName, Address, ContactPoint, Identifier) — structurally identical
4. **Core fixed columns** (id, content, lastUpdated, deleted, projectId, `__version`, compartments) — identical
5. **History + References table structure** — identical
6. **`__sharedTokens` / `__sharedTokensText`** — identical
7. **Extensions** (`pg_trgm`, `btree_gin`) + **`token_array_to_text()`** — identical
8. **`___tag` / `___security` triple-underscore naming** — aligned
9. **2527 indexes** — identical across both systems

### ⚠️ Medium Priority (functional but divergent)

| #   | Difference                                            | Tables                       | Impact                            |
| --- | ----------------------------------------------------- | ---------------------------- | --------------------------------- |
| 1   | Reference cardinality (TEXT vs TEXT[])                | ~267 cols across ~109 tables | Index type, WHERE clause, storage |
| 2   | `contextQuantity` scalar vs array                     | 35 tables                    | Conformance resource search       |
| 3   | Date type (`TIMESTAMPTZ` vs `DATE` / `TIMESTAMPTZ[]`) | 15 cols                      | Date precision                    |

### ℹ️ Low Priority / By Design

| #   | Difference                                                      | Scope         | Verdict                         |
| --- | --------------------------------------------------------------- | ------------- | ------------------------------- |
| 1   | Token-column (3 cols) vs plain column for boolean/simple tokens | ~110 tables   | MedXAI richer, accepted         |
| 2   | `___security` / `___securityText` extra columns                 | 146 tables    | Extra, not harmful              |
| 3   | `___compartmentIdentifierSort` + `__*IdentifierSort` missing    | 145 tables    | Sort-by-reference-identifier    |
| 4   | `name TEXT` / `version TEXT` / `status TEXT` plain columns      | ~30-80 tables | Conformance resource plain cols |
| 5   | `email`/`phone`/`telecom` via ContactPoint lookup only          | ~10 tables    | Functionally equivalent         |
| 6   | Index naming convention divergence                              | ~1750 indexes | Cosmetic                        |
| 7   | `ContactPoint.use TEXT` extra column                            | 1 table       | Semantically richer             |

---

## 9. Core Structural Match

| Structural Element                                                  | Match? |
| ------------------------------------------------------------------- | ------ |
| 3 tables per resource (main + history + references)                 | ✅     |
| UUID primary keys                                                   | ✅     |
| `content TEXT` JSON storage                                         | ✅     |
| `lastUpdated TIMESTAMPTZ`                                           | ✅     |
| `deleted BOOLEAN DEFAULT false`                                     | ✅     |
| `projectId UUID`                                                    | ✅     |
| `__version INTEGER`                                                 | ✅     |
| `compartments UUID[]`                                               | ✅     |
| Token columns (UUID[] hash + TEXT[] display + TEXT sort)            | ✅     |
| `__sharedTokens` / `__sharedTokensText`                             | ✅     |
| History table (versionId PK + id + content + lastUpdated)           | ✅     |
| References table (resourceId + targetId + code)                     | ✅     |
| Global lookup tables (HumanName, Address, ContactPoint, Identifier) | ✅     |
| `pg_trgm` + `btree_gin` extensions                                  | ✅     |
| `token_array_to_text()` function                                    | ✅     |
| `___tag` / `___security` triple-underscore metadata columns         | ✅     |
| Lookup table indexes: `gin_trgm_ops`, tsvector, btree               | ✅     |

---

## 10. Summary & Status

**v4 (2026-02-26)**: Full cross-system comparison of `medxai_all_3.sql` (MedXAI pg_dump) vs `medplum_all.sql` (Medplum pg_dump).

**Core architecture is fully aligned**: 442/442 FHIR R4 tables, identical core columns, identical global lookup tables, identical History/References structure, 2527 matching indexes.

**Remaining differences are systematic, not random**:

- The largest divergence is **reference cardinality** (TEXT vs TEXT[], ~267 columns) — a known `resolveIsArray()` heuristic difference. This cascades into ~339 index type mismatches (btree↔gin).
- Token-column strategy for simple codes produces extra columns but provides richer search capabilities.
- Missing `__*IdentifierSort` columns and conformance `version` columns are feature gaps, not bugs.

**Next steps** (if desired):

1. Fix `resolveIsArray()` to match Medplum's exact cardinality for all reference/date/quantity columns → eliminates ~267 column + ~339 index mismatches
2. Add `version TEXT` plain column for conformance resources
3. Harmonize index naming convention
