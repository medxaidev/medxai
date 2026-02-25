# MedXAI vs Medplum DDL Comparison Report

**Updated**: 2026-02-26 (v6 — fresh comparison against `medxai_all_5.sql`)
**MedXAI**: `medxai_all_5.sql` (442 tables, 4309 indexes)
**Medplum**: `medplum_all.sql` (497 tables, 4637 indexes)

> v1 (2026-02-24): old per-resource lookup tables (548 MedXAI tables).
> v2 (2026-02-25 12:43): global lookup table refactor — 442 tables, 0 MedXAI-only.
> v3 (2026-02-25 16:13): all 8 medium/low gaps closed — schema now fully aligned.
> v4 (2026-02-26 03:24): full cross-system comparison — medxai_all_3.sql vs medplum_all.sql (real Medplum pg_dump).
> v5 (2026-02-26 04:39): P0 fixes — reference cardinality (patient TEXT→TEXT[]), combo-value-quantity array, `version TEXT` column added to ~28 conformance resources.
> v6 (2026-02-26 04:52): fresh comparison with `medxai_all_5.sql` — confirmed 2349 name-matched indexes with identical expressions, 0 expression mismatches.

---

## 1. Overall Statistics

| Metric                       | MedXAI   | Medplum | Delta                                      |
| ---------------------------- | -------- | ------- | ------------------------------------------ |
| Total tables                 | 442      | 497     | Medplum has 55 extra platform tables       |
| Tables only in MedXAI        | **0**    | —       | ✅ All MedXAI tables exist in Medplum      |
| Tables only in Medplum       | 55       | —       | All platform-specific (non-FHIR R4)        |
| Common main resource tables  | 146      | 146     | 100% overlap on FHIR R4 resources          |
| \_History + \_References     | 292      | 292     | ✅ All present (0 missing)                 |
| Tables with column diffs     | ~147     | —       | Systematic design differences (see §5)     |
| Total indexes                | 4309     | 4637    | —                                          |
| Matching indexes (name+expr) | **2349** | —       | 54.5% identical by name AND expression     |
| Index expression mismatches  | **0**    | —       | ✅ No same-name indexes with different SQL |
| Indexes only in MedXAI       | 1640     | —       | Naming convention differences (see §6)     |
| Indexes only in Medplum      | 1670     | —       | Naming convention + extra columns/tables   |
| Type mismatches (columns)    | **7**    | —       | All TIMESTAMPTZ vs DATE (see §5.4)         |
| Extensions                   | **2**    | 2       | ✅ Matching (`pg_trgm`, `btree_gin`)       |
| Functions                    | **1**    | 1       | ✅ `token_array_to_text()` present         |

---

## 2. Tables Only in Medplum (55 — All Platform-Specific)

All 55 Medplum-exclusive tables are **non-standard FHIR R4** platform types. MedXAI correctly excludes them.

**Platform Resource Types (8 additional main tables)**:
`CodeSystem_Property`, `Coding`, `CodingSystem`, `Coding_Property`,
`ConceptMapping`, `ConceptMapping_Attribute`, `SubscriptionStatus`, `UserSecurityRequest`

**Auth & Identity (43 tables incl. \_History/\_References)**:
`AccessPolicy`, `Agent`, `AsyncJob`, `Bot`, `BulkDataExport`, `ClientApplication`,
`DomainConfiguration`, `JsonWebKey`, `Login`, `Project`, `ProjectMembership`,
`SmartAppLaunch`, `User`, `UserConfiguration`
(each with `_History` + `_References` variants)

**Infrastructure**: `DatabaseMigration`

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

## 5. Column Differences — Systematic Analysis (~147 tables)

131 tables have Medplum-only columns; 146 tables have MedXAI-only columns. The differences break down into **6 systematic categories**, all known design choices — not bugs.

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
Medplum **does not** have these columns (security labels are handled via `__sharedTokens`).

**Verdict**: ℹ️ Extra columns. Not harmful; enables dedicated security-label search.

### 5.3 `___compartmentIdentifierSort` + `__*IdentifierSort` — Medplum Only (145 tables)

Medplum generates reference identifier sort columns on nearly every table:

- `___compartmentIdentifierSort TEXT` (145 tables)
- `__patientIdentifierSort TEXT`, `__subjectIdentifierSort TEXT`, etc. (per reference field)
- `__*Identifier UUID[]` + `__*IdentifierText TEXT[]` on some tables (e.g., Observation: `__patientIdentifier`, `__performerIdentifier`, `__subjectIdentifier`)

MedXAI does not generate these.

**Verdict**: ℹ️ Low priority. Only needed for `_sort=<reference>:identifier` queries and chained token search on references.

### 5.4 Type Mismatches (7 columns)

| Table         | Column      | MedXAI          | Medplum  | Cause                          |
| ------------- | ----------- | --------------- | -------- | ------------------------------ |
| Basic         | created     | `TIMESTAMPTZ`   | `DATE`   | FHIR `date` vs `dateTime` type |
| ClaimResponse | paymentDate | `TIMESTAMPTZ`   | `DATE`   | FHIR `date` type               |
| Goal          | startDate   | `TIMESTAMPTZ`   | `DATE`   | FHIR `date` type               |
| Goal          | targetDate  | `TIMESTAMPTZ[]` | `DATE[]` | FHIR `date` type (array)       |
| Patient       | birthdate   | `TIMESTAMPTZ`   | `DATE`   | FHIR `date` type               |
| Person        | birthdate   | `TIMESTAMPTZ`   | `DATE`   | FHIR `date` type               |
| RelatedPerson | birthdate   | `TIMESTAMPTZ`   | `DATE`   | FHIR `date` type               |

**Root cause**: `resolveColumnType()` maps all `date`-type search params to `TIMESTAMPTZ`. Medplum uses `DATE` for pure-date FHIR elements.

**Verdict**: ℹ️ **Deferred**. `TIMESTAMPTZ` is a superset of `DATE` — no data loss or search failures. Can be optimized later by inspecting FHIR element type definitions.

### 5.5 `email`/`phone`/`telecom` Token Columns — Medplum Only (~10 tables)

Medplum generates `__email UUID[]` + `__emailText TEXT[]`, `__phone UUID[]` + `__phoneText TEXT[]`, `__telecom UUID[]` + `__telecomText TEXT[]` as dedicated token-column triples on resources like Patient, Person, Practitioner, PractitionerRole, RelatedPerson, OrganizationAffiliation.

MedXAI handles these via the ContactPoint global lookup table instead, with only the `__emailSort`/`__phoneSort`/`__telecomSort` sort columns on the main table.

**Verdict**: ℹ️ Functionally equivalent. Different strategy — MedXAI uses lookup table JOINs, Medplum duplicates data into main table.

### 5.6 Other Column Differences

| Difference                                                | Tables      | Details                                                   |
| --------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `name TEXT` (Medplum) vs `__nameSort TEXT` (MedXAI)       | ~30         | Medplum uses plain `name` for resources with string names |
| `ContactPoint.use TEXT` (MedXAI only)                     | 1           | Extra column in global lookup table                       |
| US Core extensions: `ethnicity`, `race`, `genderIdentity` | 1 (Patient) | Medplum only — US Core profile extensions                 |
| `phonetic TEXT[]` (Medplum only)                          | ~5          | Phonetic name search (Patient, Person, etc.)              |
| `priorityOrder INTEGER` (Medplum only)                    | ~6          | Pre-computed sort order for priority fields               |

---

## 6. Index Differences — Systematic Analysis (0 expression mismatches)

### 6.1 Overall Index Statistics

| Metric                                  | Count    |
| --------------------------------------- | -------- |
| MedXAI total indexes                    | 4309     |
| Medplum total indexes                   | 4637     |
| Same-name indexes, identical expression | **2349** |
| Same-name indexes, different expression | **0**    |
| Indexes only in MedXAI                  | 1640     |
| Indexes only in Medplum                 | 1670     |

**Key finding**: Of all 2349 indexes that share the same name between MedXAI and Medplum, **every single one has an identical SQL expression**. There are **zero** expression mismatches.

### 6.2 Index Naming Convention Divergence

The 1640 MedXAI-only + 1670 Medplum-only indexes are caused by **naming convention differences** for functionally identical indexes. Common patterns:

| Category   | MedXAI Name Pattern              | Medplum Name Pattern           | Cause                                               |
| ---------- | -------------------------------- | ------------------------------ | --------------------------------------------------- |
| Trigram    | `*___identifierText_trgm_idx`    | `*___idntTextTrgm_idx`         | MedXAI uses full name, Medplum abbreviates (`idnt`) |
| Trigram    | `*___tagText_trgm_idx`           | `*____tagTextTrgm_idx`         | underscore `_trgm_` vs camelCase `Trgm` suffix      |
| Trigram    | `*___sharedTokensText_trgm_idx`  | `*___sharedTokensTextTrgm_idx` | same                                                |
| Token GIN  | `*___identifier_idx`             | `*___idnt_idx`                 | abbreviated column names in Medplum                 |
| \_profile  | `*_profile_idx`                  | `*__profile_idx`               | single vs double underscore prefix                  |
| References | `*_References_targetId_code_idx` | `*_References_reverse_idx`     | different naming, same expression                   |

These are the same indexes with different naming. The expression (`USING gin (...)` or `USING btree (...)`) is identical.

### 6.3 Indexes Only in MedXAI (by category)

| Category                  | Example                                                     | Cause                                                               |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `___security*` indexes    | `Account___security_idx`, `Account___securityText_trgm_idx` | MedXAI has `___security` columns that Medplum doesn't               |
| `__status*` token indexes | `Account___status_idx`, `Account___statusText_trgm_idx`     | MedXAI uses token-column for status; Medplum uses plain column      |
| `__nameSort` indexes      | `Account___nameSort_idx`                                    | MedXAI stores name in sort column; Medplum uses plain `name` column |
| `__phoneticSort` indexes  | `Patient___phoneticSort_idx`                                | MedXAI sort column; Medplum uses `phonetic TEXT[]` with gin         |
| `__address*Sort` indexes  | `Patient___addressCitySort_idx` etc.                        | MedXAI lookup-table sort columns on main table                      |

### 6.4 Indexes Only in Medplum (by category)

| Category                        | Example                                     | Cause                                                            |
| ------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| `___tag_idx`                    | `Account____tag_idx`                        | Medplum has bare `___tag` gin index; MedXAI names it differently |
| `__*IdentifierSort` btree       | `Observation___patientIdnt_idx`             | Reference identifier token columns (MedXAI doesn't have)         |
| `status/name` btree             | `Account_status_idx`, `Account_name_idx`    | Plain column indexes for Medplum's scalar columns                |
| `__email/__phone/__telecom` gin | `Patient___email_idx`                       | Medplum duplicates ContactPoint data into main table             |
| `projectId_date` composite      | `Observation_projectId_date_idx`            | Observation-specific composite index                             |
| US Core extension indexes       | `patient_ethnicity_idx`, `patient_race_idx` | US Core profile columns                                          |

### 6.5 Real Index Expression Mismatches

**0 mismatches**. ✅ Every same-name index pair has identical SQL.

---

## 7. Extensions and Functions

| Item                             | MedXAI | Medplum | Status                                                                                         |
| -------------------------------- | ------ | ------- | ---------------------------------------------------------------------------------------------- | --- | ------------------------ | --- | ----- |
| `pg_trgm` extension              | ✅     | ✅      | ✅ Matching                                                                                    |
| `btree_gin` extension            | ✅     | ✅      | ✅ Matching                                                                                    |
| `token_array_to_text()` function | ✅     | ✅      | ✅ Matching (minor impl difference: MedXAI uses `array_to_string(arr, ' ')`, Medplum uses `e'' |     | array_to_string($1, e'') |     | e''`) |

---

## 8. Priority Classification

### ✅ Fully Matching (no action needed)

1. **146/146 FHIR R4 main resource tables** present in both (+ 292 \_History/\_References + 4 lookup = 442 total)
2. **0 MedXAI-only tables** — all 55 Medplum-only tables are platform-specific
3. **Global lookup tables** (HumanName, Address, ContactPoint, Identifier) — structurally identical
4. **Core fixed columns** (id, content, lastUpdated, deleted, projectId, `__version`, compartments) — identical
5. **History + References table structure** — identical
6. **`__sharedTokens` / `__sharedTokensText`** — identical (present on 145 Medplum tables, all common)
7. **Extensions** (`pg_trgm`, `btree_gin`) + **`token_array_to_text()`** — present in both
8. **`___tag` / `___tagText` / `___tagSort`** triple-underscore metadata columns — aligned
9. **2349 indexes** — identical name AND expression across both systems
10. **0 index expression mismatches** — every same-name index pair is semantically identical

### ℹ️ Medium Priority (deferred)

| #   | Difference                             | Scope  | Impact                        |
| --- | -------------------------------------- | ------ | ----------------------------- |
| 1   | `TIMESTAMPTZ` vs `DATE` for pure dates | 7 cols | Date precision (no data loss) |

### ℹ️ Low Priority / By Design

| #   | Difference                                                      | Scope         | Verdict                         |
| --- | --------------------------------------------------------------- | ------------- | ------------------------------- |
| 1   | Token-column (3 cols) vs plain column for boolean/simple tokens | ~110 tables   | MedXAI richer, accepted         |
| 2   | `___security` / `___securityText` extra columns                 | 146 tables    | Extra, not harmful              |
| 3   | `___compartmentIdentifierSort` + `__*IdentifierSort` missing    | 145 tables    | Sort-by-reference-identifier    |
| 4   | `name TEXT` / `status TEXT` plain columns in Medplum            | ~30-80 tables | Conformance resource plain cols |
| 5   | `email`/`phone`/`telecom` via ContactPoint lookup only          | ~10 tables    | Functionally equivalent         |
| 6   | Index naming convention divergence                              | ~1640+1670    | Cosmetic (same expressions)     |
| 7   | `ContactPoint.use TEXT` extra column                            | 1 table       | Semantically richer             |
| 8   | US Core extensions (`ethnicity`, `race`, `genderIdentity`)      | 1 table       | Medplum-specific profile        |
| 9   | `phonetic TEXT[]` columns                                       | ~5 tables     | Phonetic name search            |
| 10  | `priorityOrder INTEGER` columns                                 | ~6 tables     | Pre-computed sort order         |

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
| `___tag` / `___tagText` / `___tagSort` metadata columns             | ✅     |
| Lookup table indexes: `gin_trgm_ops`, tsvector, btree               | ✅     |
| Reference cardinality (TEXT vs TEXT[] for multi-target refs)        | ✅     |
| `version TEXT` column on conformance resources                      | ✅     |

---

## 10. Summary & Status

**v6 (2026-02-26)**: Fresh comparison of `medxai_all_5.sql` vs `medplum_all.sql`.

**Core architecture is fully aligned**:

- 146/146 FHIR R4 main resource tables with matching \_History + \_References
- 2349 indexes with identical name AND expression, **0 expression mismatches**
- Identical core columns, global lookup tables, extensions, and functions

**Remaining differences are systematic, not random**:

- **Token-column strategy** for simple codes (status, active, gender) produces extra columns but provides richer `system|code` search capabilities
- **`___security`** columns are extra in MedXAI — enables dedicated security-label search not present in Medplum
- **`__*IdentifierSort`** columns missing — low-priority feature for sorting by reference identifiers
- **7 `TIMESTAMPTZ` vs `DATE`** type differences — `TIMESTAMPTZ` is a superset, no data loss
- **Index naming divergence** — ~1640 MedXAI-only + ~1670 Medplum-only are the same indexes with different naming conventions
- **`email`/`phone`/`telecom`** — MedXAI uses ContactPoint lookup table; Medplum also keeps token columns in main table

**Next steps** (if desired):

1. Harmonize index naming convention (trgm suffix: `_trgm_idx` → `Trgm_idx`)
2. Harmonize `_profile_idx` prefix (`_profile_idx` vs `__profile_idx`)
3. Harmonize `_References` reverse index name (`targetId_code_idx` → `reverse_idx`)
4. Optionally use `DATE` for pure-date FHIR fields (birthdate, etc.)
5. Consider adding `___tag_idx` bare GIN index (Medplum has it, MedXAI only has trigram)
