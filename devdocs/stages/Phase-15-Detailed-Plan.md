# Phase 15: Metadata Search Parameters & Token Enhancement — Detailed Plan

## Status

**Status:** ✅ Complete  
**Version:** v1.1  
**Phase:** 15 (Stage-3)  
**Completed:** 2026-02-24  
**Last Updated:** 2026-02-24  
**Depends On:** Phase 14 ✅ Complete (654 tests, 0 failures)  
**Final Results:** 693 tests passing (589 persistence + 104 server), 0 regressions, tsc clean

---

## Overview

Phase 15 adds support for **FHIR metadata search parameters** (`_tag`, `_security`,
`_profile`, `_source`) and enhances **token search** to support `system|code` syntax,
`:text` modifier, and `:of-type` modifier.

**Current State:**

- `_tag` and `_security` are listed in `SPECIAL_PARAMS` (param-parser.ts) but have
  no `resolveImpl` handler in where-builder — searches silently skip them.
- `_profile` and `_source` have fixed columns (`_profile TEXT[]`, `_source TEXT`) but
  no search WHERE handler.
- Token search currently matches raw text values (`male`, `final`) but does NOT
  support `system|code` syntax (`http://hl7.org/fhir/gender|male`).
- Row indexer stores `system|code` in `__*Text` columns but the where-builder
  passes the raw query value directly — no `system|code` parsing at query time.

**Phase 15 Goal:** After this phase, all 4 metadata parameters are searchable,
token search supports full `system|code` syntax with `:text` and `:not` modifiers,
and the row indexer populates metadata columns on write.

---

## Architecture

```
Metadata Search Flow:
  GET /Patient?_tag=http://example.com|urgent
    ↓ param-parser.ts (already in SPECIAL_PARAMS)
    ↓ where-builder.ts resolveImpl() → synthetic impl for _tag
    ↓ buildTokenColumnFragment() → "__tagText" && ARRAY[$1]::text[]
    ↓ PostgreSQL query
    ↓ Bundle response

Token system|code Flow:
  GET /Patient?identifier=http://example.com|12345
    ↓ param-parser.ts → values: ["http://example.com|12345"]
    ↓ where-builder.ts → buildTokenColumnFragment()
    ↓ value passed as-is to "__identifierText" && ARRAY[$1]::text[]
    ↓ Row indexer stores "http://example.com|12345" in __identifierText
    ↓ Match! ✅

Token :text modifier Flow:
  GET /Patient?code:text=body weight
    ↓ param-parser.ts → modifier: 'text', values: ["body weight"]
    ↓ where-builder.ts → buildTokenTextFragment()
    ↓ NEW: search __*Sort column with ILIKE
    ↓ "__codeSort" ILIKE $1 → '%body weight%'
```

---

## Tasks

### Task 15.1: Metadata Parameter WHERE Handlers

**File Modified:** `packages/fhir-persistence/src/search/where-builder.ts`

Add synthetic `SearchParameterImpl` entries in `resolveImpl()` for `_tag`,
`_security`, `_profile`, and `_source`.

#### \_tag and \_security

These are token-type parameters stored in fixed columns:

- `_tag` → columns `__tag UUID[]`, `__tagText TEXT[]`, `__tagSort TEXT`
- `_security` → columns `__security UUID[]`, `__securityText TEXT[]`, `__securitySort TEXT`

Schema generation already creates these columns (they come from the spec's
SearchParameter bundle as token-type params on Resource base).

Synthetic impl:

```typescript
case '_tag':
  return {
    code: '_tag',
    type: 'token',
    resourceTypes: [resourceType],
    expression: 'meta.tag',
    strategy: 'token-column',
    columnName: 'tag',
    columnType: 'UUID[]',
    array: true,
  };
```

#### \_profile

`_profile` is a URI-type parameter stored in the fixed `_profile TEXT[]` column.
It needs array overlap search (since `_profile` is `TEXT[]`).

Synthetic impl:

```typescript
case '_profile':
  return {
    code: '_profile',
    type: 'uri',
    resourceTypes: [resourceType],
    expression: 'meta.profile',
    strategy: 'column',
    columnName: '_profile',
    columnType: 'TEXT[]',
    array: true,
  };
```

The where-builder's `buildUriFragment` currently uses simple equality. For array
columns, we need array overlap. We'll add array handling to `buildUriFragment`.

#### \_source

`_source` is a URI-type parameter stored in the fixed `_source TEXT` column.

Synthetic impl:

```typescript
case '_source':
  return {
    code: '_source',
    type: 'uri',
    resourceTypes: [resourceType],
    expression: 'meta.source',
    strategy: 'column',
    columnName: '_source',
    columnType: 'TEXT',
    array: false,
  };
```

#### Tests (10)

**File:** `packages/fhir-persistence/src/__tests__/search/where-builder.test.ts` (extend)

```
15.1-01: _tag resolves to token-column impl with __tagText
15.1-02: _tag search generates array overlap SQL
15.1-03: _tag:not generates NOT array overlap SQL
15.1-04: _security resolves to token-column impl with __securityText
15.1-05: _security search generates array overlap SQL
15.1-06: _profile resolves to uri impl with _profile column
15.1-07: _profile search generates array overlap SQL (TEXT[])
15.1-08: _source resolves to uri impl with _source column
15.1-09: _source search generates equality SQL
15.1-10: buildWhereClause with mixed _tag + _id + gender
```

---

### Task 15.2: Token Search Enhancement — system|code Syntax

**File Modified:** `packages/fhir-persistence/src/search/where-builder.ts`

Currently, `buildTokenColumnFragment` passes query values directly to the
`__*Text` array overlap. The row indexer stores tokens as `system|code` in
`__*Text` columns (e.g., `["http://hl7.org/fhir/gender|male"]`).

For token search to work with `system|code` syntax:

1. **`code` only** (e.g., `gender=male`):
   - Current: passes `"male"` → no match against `"|male"` or `"http://...|male"`
   - Fix: The row indexer stores plain codes without system as just `"male"`.
     For codes WITH system, we need to match any entry ending with `|code`.
   - Strategy: Use the hash column (`__gender UUID[]`) for exact `system|code`
     matches, and the text column for code-only matches.
   - **Simpler approach**: For code-only queries, search `__*Text` with a
     PostgreSQL `EXISTS` + `unnest` + `LIKE '%|code'` OR exact match.
   - **Simplest approach (Phase 15 MVP)**: When the query value has no `|`,
     search the text column for any entry that equals the value OR ends with
     `|value`. Use: `EXISTS (SELECT 1 FROM unnest("__genderText") t WHERE t = $1 OR t LIKE '%|' || $1)`.
   - **Actually simplest**: The row indexer already stores plain code values
     without system prefix for simple tokens (gender → `"male"`, not `"|male"`).
     So `"male"` in the query matches `"male"` in the array. ✅ Already works!

2. **`system|code`** (e.g., `identifier=http://example.com|12345`):
   - Row indexer stores `"http://example.com|12345"` in `__identifierText`.
   - Query value `"http://example.com|12345"` matches directly. ✅ Already works!

3. **`system|`** (any code in system):
   - Query: `identifier=http://example.com|`
   - Need: match any entry starting with `"http://example.com|"`.
   - Strategy: Use `EXISTS (SELECT 1 FROM unnest("__identifierText") t WHERE t LIKE $1)` with value `"http://example.com|%"`.

4. **`|code`** (code with no system):
   - Query: `identifier=|12345`
   - Need: match entries that are exactly `"12345"` (no system prefix).
   - Strategy: Search for exact match on `"12345"`.

#### Implementation

Modify `buildTokenColumnFragment` to detect `system|code` patterns:

```typescript
function parseTokenValue(value: string): {
  system?: string;
  code?: string;
  raw: string;
} {
  const pipeIdx = value.indexOf("|");
  if (pipeIdx === -1) return { code: value, raw: value };
  const system = value.slice(0, pipeIdx);
  const code = value.slice(pipeIdx + 1);
  return { system: system || undefined, code: code || undefined, raw: value };
}
```

For each value:

- No pipe → pass as-is (matches plain code in array)
- `system|code` → pass as-is (matches `system|code` in array)
- `system|` → use LIKE `system|%` with unnest
- `|code` → pass just `code` (matches plain code stored without system)

For the common cases (no pipe, full system|code), the existing array overlap
works. Only `system|` and `|code` need special handling.

#### Tests (8)

**File:** `packages/fhir-persistence/src/__tests__/search/where-builder.test.ts` (extend)

```
15.2-01: token value without pipe → array overlap as-is
15.2-02: token value system|code → array overlap as-is
15.2-03: token value system| → LIKE-based search
15.2-04: token value |code → searches for plain code
15.2-05: token :text modifier → ILIKE on __*Sort column
15.2-06: token :text with multiple values → OR of ILIKEs
15.2-07: token :not with system|code → NOT overlap
15.2-08: mixed token values (some with pipe, some without)
```

---

### Task 15.3: Token :text Modifier

**File Modified:** `packages/fhir-persistence/src/search/where-builder.ts`

The `:text` modifier searches the display text of a token. For token-column
strategy, the `__*Sort` column stores the first display/text value.

```
GET /Observation?code:text=body weight
→ LOWER("__codeSort") LIKE $1   with value 'body weight%'
```

This is a prefix match on the sort column, similar to string search.

---

### Task 15.4: Row Indexer — Metadata Column Population

**File Modified:** `packages/fhir-persistence/src/repo/row-indexer.ts`

Currently, `buildSearchColumns()` only processes impls from the registry.
Metadata values (`meta.tag`, `meta.security`) need to be extracted and stored
in the fixed metadata columns.

Add a new function `buildMetadataColumns()` that extracts:

- `meta.tag` → `__tag UUID[]`, `__tagText TEXT[]`, `__tagSort TEXT`
- `meta.security` → `__security UUID[]`, `__securityText TEXT[]`, `__securitySort TEXT`

These are always populated (not dependent on registry impls) because they
apply to all resource types.

#### Implementation

```typescript
export function buildMetadataColumns(
  resource: FhirResource,
): SearchColumnValues {
  const columns: SearchColumnValues = {};
  const meta = resource.meta as Record<string, unknown> | undefined;
  if (!meta) return columns;

  // _tag
  if (Array.isArray(meta.tag)) {
    const tokens = meta.tag.flatMap(extractTokenValues);
    if (tokens.length > 0) {
      columns["__tag"] = tokens.map((t) => hashToken(t.system, t.code));
      columns["__tagText"] = tokens.map((t) =>
        t.system ? `${t.system}|${t.code}` : t.code,
      );
      columns["__tagSort"] = columns["__tagText"][0];
    }
  }

  // _security
  if (Array.isArray(meta.security)) {
    const tokens = meta.security.flatMap(extractTokenValues);
    if (tokens.length > 0) {
      columns["__security"] = tokens.map((t) => hashToken(t.system, t.code));
      columns["__securityText"] = tokens.map((t) =>
        t.system ? `${t.system}|${t.code}` : t.code,
      );
      columns["__securitySort"] = columns["__securityText"][0];
    }
  }

  return columns;
}
```

Integrate into `buildResourceRowWithSearch()` in `row-builder.ts`.

#### Tests (8)

**File:** `packages/fhir-persistence/src/__tests__/repo/row-indexer.test.ts` (extend)

```
15.4-01: buildMetadataColumns extracts meta.tag → __tag, __tagText, __tagSort
15.4-02: buildMetadataColumns extracts meta.security → __security columns
15.4-03: buildMetadataColumns with no meta.tag → no __tag columns
15.4-04: buildMetadataColumns with multiple tags → arrays
15.4-05: buildMetadataColumns with system|code tag → correct text format
15.4-06: buildMetadataColumns with code-only tag → no system prefix
15.4-07: buildMetadataColumns with empty meta → empty result
15.4-08: buildResourceRowWithSearch includes metadata columns
```

---

### Task 15.5: Integration Tests

**File:** `packages/fhir-persistence/src/__tests__/integration/search-integration.test.ts` (extend)

End-to-end tests with real PostgreSQL:

```
15.5-01: create Patient with meta.tag, search by _tag → found
15.5-02: create Patient with meta.security, search by _security → found
15.5-03: search by _profile → found
15.5-04: search by _source → found
15.5-05: token search with system|code (identifier) → found
15.5-06: token search with |code → found
15.5-07: token search with system| → found
15.5-08: token :text modifier search → found
15.5-09: mixed metadata + regular params → AND logic works
15.5-10: _tag:not excludes matching resources
```

---

### Task 15.6: HTTP E2E Tests

**File:** `packages/fhir-server/src/__tests__/search-e2e.test.ts` (extend)

```
15.6-01: GET /Patient?_tag=http://example.com|urgent → Bundle with match
15.6-02: GET /Patient?_security=http://terminology.hl7.org/CodeSystem/v3-Confidentiality|R → match
15.6-03: GET /Patient?_profile=http://hl7.org/fhir/StructureDefinition/Patient → match
15.6-04: GET /Patient?_source=http://example.com → match
```

---

## File Plan

### Modified Files

| File                                                   | Changes                                                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `src/search/where-builder.ts`                          | Add \_tag, \_security, \_profile, \_source to resolveImpl(); enhance token system\|code; add :text modifier |
| `src/repo/row-indexer.ts`                              | Add buildMetadataColumns() for meta.tag, meta.security                                                      |
| `src/repo/row-builder.ts`                              | Integrate buildMetadataColumns() into buildResourceRowWithSearch()                                          |
| `src/__tests__/search/where-builder.test.ts`           | +18 tests for metadata params and token enhancement                                                         |
| `src/__tests__/repo/row-indexer.test.ts`               | +8 tests for metadata column extraction                                                                     |
| `src/__tests__/integration/search-integration.test.ts` | +10 integration tests                                                                                       |
| `fhir-server/src/__tests__/search-e2e.test.ts`         | +4 HTTP E2E tests                                                                                           |

### No New Files

All changes extend existing files.

---

## Execution Order

```
1. Task 15.1 — Metadata WHERE handlers (_tag, _security, _profile, _source) + 10 unit tests
2. Task 15.2 — Token system|code parsing in where-builder + 8 unit tests
3. Task 15.3 — Token :text modifier (part of 15.2 tests)
4. Task 15.4 — Row indexer metadata column population + 8 unit tests
5. Task 15.5 — Integration tests (real PostgreSQL) + 10 tests
6. Task 15.6 — HTTP E2E tests + 4 tests
7. Rebuild fhir-persistence package
8. Full test suite verification
9. Update Phase-14 and Stage-3 docs with completion markers
```

---

## Acceptance Criteria

- [ ] `_tag` search works (token-column on `__tagText`)
- [ ] `_security` search works (token-column on `__securityText`)
- [ ] `_profile` search works (array overlap on `_profile TEXT[]`)
- [ ] `_source` search works (equality on `_source TEXT`)
- [ ] Token `system|code` syntax works for all 4 patterns
- [ ] Token `:text` modifier works (ILIKE on sort column)
- [ ] Token `:not` modifier works with system|code
- [ ] Row indexer populates `__tag*` and `__security*` columns on write
- [ ] 40+ new tests passing
- [ ] Zero regressions on existing 654 tests
- [ ] `tsc --noEmit` clean
- [ ] `fhir-persistence` package rebuilt

---

## Risk Mitigation

| Risk                                                        | Mitigation                                        |
| ----------------------------------------------------------- | ------------------------------------------------- |
| `system\|` pattern requires unnest + LIKE (slower)          | Rare query pattern; acceptable for Phase 15 MVP   |
| `__tag` / `__security` columns may not exist in DB          | Re-run `db:init --reset` to regenerate schema     |
| `:text` modifier on sort column may miss multi-value tokens | Acceptable — sort column stores first value only  |
| Array overlap on `_profile TEXT[]` column                   | PostgreSQL `&&` operator works on TEXT[] natively |

---

## References

- [Stage-3-Development-Roadmap.md](./Stage-3-Development-Roadmap.md)
- [Phase-14-Detailed-Plan.md](./Phase-14-Detailed-Plan.md)
- [FHIR R4 Search — Token](https://hl7.org/fhir/R4/search.html#token)
- [FHIR R4 Search — Metadata Parameters](https://hl7.org/fhir/R4/search.html#_tag)
- Current `where-builder.ts` — token-column fragment builder
- Current `row-indexer.ts` — search column extraction
