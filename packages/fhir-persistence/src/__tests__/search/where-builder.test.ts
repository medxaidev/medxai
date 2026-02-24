/**
 * WHERE Clause Builder — Unit Tests
 */

import { describe, it, expect } from 'vitest';
import type { SearchParameterImpl } from '../../registry/search-parameter-registry.js';
import type { ParsedSearchParam } from '../../search/types.js';
import {
  prefixToOperator,
  buildWhereFragment,
  buildWhereClause,
} from '../../search/where-builder.js';
import { SearchParameterRegistry } from '../../registry/search-parameter-registry.js';

// =============================================================================
// Helper: build a minimal SearchParameterImpl
// =============================================================================

function makeImpl(overrides: Partial<SearchParameterImpl> & { code: string; type: SearchParameterImpl['type'] }): SearchParameterImpl {
  return {
    resourceTypes: ['Patient'],
    expression: '',
    strategy: 'column',
    columnName: overrides.code,
    columnType: 'TEXT',
    array: false,
    ...overrides,
  };
}

// =============================================================================
// prefixToOperator
// =============================================================================

describe('prefixToOperator', () => {
  it('returns = for eq', () => expect(prefixToOperator('eq')).toBe('='));
  it('returns = for undefined', () => expect(prefixToOperator(undefined)).toBe('='));
  it('returns <> for ne', () => expect(prefixToOperator('ne')).toBe('<>'));
  it('returns < for lt', () => expect(prefixToOperator('lt')).toBe('<'));
  it('returns > for gt', () => expect(prefixToOperator('gt')).toBe('>'));
  it('returns <= for le', () => expect(prefixToOperator('le')).toBe('<='));
  it('returns >= for ge', () => expect(prefixToOperator('ge')).toBe('>='));
  it('returns > for sa', () => expect(prefixToOperator('sa')).toBe('>'));
  it('returns < for eb', () => expect(prefixToOperator('eb')).toBe('<'));
  it('returns ap for ap (handled by type-specific builders)', () => expect(prefixToOperator('ap')).toBe('ap'));
});

// =============================================================================
// buildWhereFragment — string type
// =============================================================================

describe('buildWhereFragment — string', () => {
  const impl = makeImpl({ code: 'family', type: 'string', columnName: 'family' });

  it('default: prefix match with LOWER/LIKE', () => {
    const param: ParsedSearchParam = { code: 'family', values: ['Smith'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result).not.toBeNull();
    expect(result!.sql).toContain('LOWER("family") LIKE $1');
    expect(result!.values).toEqual(['smith%']);
  });

  it(':exact modifier: equality', () => {
    const param: ParsedSearchParam = { code: 'family', modifier: 'exact', values: ['Smith'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"family" = $1');
    expect(result!.values).toEqual(['Smith']);
  });

  it(':contains modifier: infix match', () => {
    const param: ParsedSearchParam = { code: 'family', modifier: 'contains', values: ['mit'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toContain('LOWER("family") LIKE $1');
    expect(result!.values).toEqual(['%mit%']);
  });

  it('multiple values produce OR', () => {
    const param: ParsedSearchParam = { code: 'family', values: ['Smith', 'Jones'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toContain('OR');
    expect(result!.values).toHaveLength(2);
  });

  it('escapes LIKE special characters', () => {
    const param: ParsedSearchParam = { code: 'family', values: ['100%'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.values[0]).toBe('100\\%%');
  });
});

// =============================================================================
// buildWhereFragment — date type
// =============================================================================

describe('buildWhereFragment — date', () => {
  const impl = makeImpl({ code: 'birthdate', type: 'date', columnName: 'birthdate', columnType: 'TIMESTAMPTZ' });

  it('default (eq): equality', () => {
    const param: ParsedSearchParam = { code: 'birthdate', values: ['1990-01-01'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"birthdate" = $1');
    expect(result!.values).toEqual(['1990-01-01']);
  });

  it('ge prefix: >=', () => {
    const param: ParsedSearchParam = { code: 'birthdate', prefix: 'ge', values: ['1990-01-01'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"birthdate" >= $1');
  });

  it('lt prefix: <', () => {
    const param: ParsedSearchParam = { code: 'birthdate', prefix: 'lt', values: ['2026-12-31'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"birthdate" < $1');
  });

  it('ne prefix: <>', () => {
    const param: ParsedSearchParam = { code: 'birthdate', prefix: 'ne', values: ['1990-01-01'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"birthdate" <> $1');
  });

  it('ap prefix: BETWEEN ±1 day', () => {
    const param: ParsedSearchParam = { code: 'birthdate', prefix: 'ap', values: ['2026-01-15T00:00:00.000Z'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result).not.toBeNull();
    expect(result!.sql).toContain('BETWEEN $1 AND $2');
    expect(result!.values).toHaveLength(2);
    // lo should be ~2026-01-14, hi should be ~2026-01-16
    expect(new Date(result!.values[0] as string).getTime()).toBeLessThan(new Date('2026-01-15T00:00:00.000Z').getTime());
    expect(new Date(result!.values[1] as string).getTime()).toBeGreaterThan(new Date('2026-01-15T00:00:00.000Z').getTime());
  });

  it('ap prefix with multiple values: OR of BETWEENs', () => {
    const param: ParsedSearchParam = { code: 'birthdate', prefix: 'ap', values: ['2026-01-15T00:00:00.000Z', '2026-06-15T00:00:00.000Z'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toContain('OR');
    expect(result!.values).toHaveLength(4);
  });
});

// =============================================================================
// buildWhereFragment — number type
// =============================================================================

describe('buildWhereFragment — number', () => {
  const impl = makeImpl({ code: 'length', type: 'number', columnName: 'length', columnType: 'DOUBLE PRECISION' });

  it('default: equality with numeric value', () => {
    const param: ParsedSearchParam = { code: 'length', values: ['100'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"length" = $1');
    expect(result!.values).toEqual([100]);
  });

  it('gt prefix: >', () => {
    const param: ParsedSearchParam = { code: 'length', prefix: 'gt', values: ['50'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"length" > $1');
    expect(result!.values).toEqual([50]);
  });

  it('ap prefix: BETWEEN ±10%', () => {
    const param: ParsedSearchParam = { code: 'length', prefix: 'ap', values: ['100'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result).not.toBeNull();
    expect(result!.sql).toContain('BETWEEN $1 AND $2');
    expect(result!.values).toHaveLength(2);
    expect(result!.values[0]).toBeCloseTo(90, 5);
    expect(result!.values[1]).toBeCloseTo(110, 5);
  });

  it('ap prefix with multiple values: OR of BETWEENs', () => {
    const param: ParsedSearchParam = { code: 'length', prefix: 'ap', values: ['100', '200'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toContain('OR');
    expect(result!.values).toHaveLength(4);
    expect(result!.values[0]).toBeCloseTo(90, 5);
    expect(result!.values[1]).toBeCloseTo(110, 5);
    expect(result!.values[2]).toBeCloseTo(180, 5);
    expect(result!.values[3]).toBeCloseTo(220, 5);
  });
});

// =============================================================================
// buildWhereFragment — reference type
// =============================================================================

describe('buildWhereFragment — reference', () => {
  const impl = makeImpl({ code: 'subject', type: 'reference', columnName: 'subject' });

  it('equality match', () => {
    const param: ParsedSearchParam = { code: 'subject', values: ['Patient/123'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"subject" = $1');
    expect(result!.values).toEqual(['Patient/123']);
  });

  it('multiple values produce OR', () => {
    const param: ParsedSearchParam = { code: 'subject', values: ['Patient/1', 'Patient/2'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toContain('OR');
    expect(result!.values).toHaveLength(2);
  });
});

// =============================================================================
// buildWhereFragment — uri type
// =============================================================================

describe('buildWhereFragment — uri', () => {
  const impl = makeImpl({ code: 'url', type: 'uri', columnName: 'url' });

  it('exact match', () => {
    const param: ParsedSearchParam = { code: 'url', values: ['http://example.com'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"url" = $1');
    expect(result!.values).toEqual(['http://example.com']);
  });
});

// =============================================================================
// buildWhereFragment — token type
// =============================================================================

describe('buildWhereFragment — token', () => {
  const impl = makeImpl({ code: 'gender', type: 'token', columnName: 'gender', strategy: 'token-column' });

  it('array overlap match on __genderText', () => {
    const param: ParsedSearchParam = { code: 'gender', values: ['male'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"__genderText" && ARRAY[$1]::text[]');
    expect(result!.values).toEqual(['male']);
  });

  it(':not modifier: NOT array overlap', () => {
    const param: ParsedSearchParam = { code: 'gender', modifier: 'not', values: ['male'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('NOT ("__genderText" && ARRAY[$1]::text[])');
  });

  it('multiple values in single ARRAY', () => {
    const param: ParsedSearchParam = { code: 'gender', values: ['male', 'female'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"__genderText" && ARRAY[$1, $2]::text[]');
    expect(result!.values).toEqual(['male', 'female']);
  });
});

// =============================================================================
// buildWhereFragment — :missing modifier
// =============================================================================

describe('buildWhereFragment — :missing', () => {
  const impl = makeImpl({ code: 'active', type: 'token', columnName: 'active' });

  it(':missing=true → IS NULL', () => {
    const param: ParsedSearchParam = { code: 'active', modifier: 'missing', values: ['true'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"active" IS NULL');
    expect(result!.values).toEqual([]);
  });

  it(':missing=false → IS NOT NULL', () => {
    const param: ParsedSearchParam = { code: 'active', modifier: 'missing', values: ['false'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result!.sql).toBe('"active" IS NOT NULL');
    expect(result!.values).toEqual([]);
  });
});

// =============================================================================
// buildWhereFragment — lookup-table strategy
// =============================================================================

describe('buildWhereFragment — lookup-table', () => {
  it('returns null for lookup-table strategy', () => {
    const impl = makeImpl({ code: 'name', type: 'string', columnName: 'name', strategy: 'lookup-table' });
    const param: ParsedSearchParam = { code: 'name', values: ['Smith'] };
    const result = buildWhereFragment(impl, param, 1);
    expect(result).toBeNull();
  });
});

// =============================================================================
// buildWhereFragment — parameter index
// =============================================================================

describe('buildWhereFragment — parameter indexing', () => {
  it('uses startIndex for $N placeholder (token-column)', () => {
    const impl = makeImpl({ code: 'gender', type: 'token', columnName: 'gender', strategy: 'token-column' });
    const param: ParsedSearchParam = { code: 'gender', values: ['male'] };
    const result = buildWhereFragment(impl, param, 5);
    expect(result!.sql).toBe('"__genderText" && ARRAY[$5]::text[]');
  });

  it('increments index for multiple values (token-column)', () => {
    const impl = makeImpl({ code: 'gender', type: 'token', columnName: 'gender', strategy: 'token-column' });
    const param: ParsedSearchParam = { code: 'gender', values: ['male', 'female'] };
    const result = buildWhereFragment(impl, param, 3);
    expect(result!.sql).toContain('$3');
    expect(result!.sql).toContain('$4');
  });
});

// =============================================================================
// buildWhereClause — composite
// =============================================================================

describe('buildWhereClause', () => {
  const registry = new SearchParameterRegistry();

  // Manually index some test impls
  registry.indexImpl('Patient', makeImpl({ code: 'gender', type: 'token', columnName: 'gender', strategy: 'token-column' }));
  registry.indexImpl('Patient', makeImpl({ code: 'active', type: 'token', columnName: 'active', strategy: 'token-column' }));
  registry.indexImpl('Patient', makeImpl({ code: 'birthdate', type: 'date', columnName: 'birthdate', columnType: 'TIMESTAMPTZ' }));

  it('combines multiple params with AND', () => {
    const params: ParsedSearchParam[] = [
      { code: 'gender', values: ['male'] },
      { code: 'active', values: ['true'] },
    ];
    const result = buildWhereClause(params, registry, 'Patient');
    expect(result).not.toBeNull();
    expect(result!.sql).toContain('"__genderText" && ARRAY[$1]::text[]');
    expect(result!.sql).toContain('AND');
    expect(result!.sql).toContain('"__activeText" && ARRAY[$2]::text[]');
    expect(result!.values).toEqual(['male', 'true']);
  });

  it('handles _id special parameter', () => {
    const params: ParsedSearchParam[] = [
      { code: '_id', values: ['abc-123'] },
    ];
    const result = buildWhereClause(params, registry, 'Patient');
    expect(result!.sql).toContain('"id" = $1');
    expect(result!.values).toEqual(['abc-123']);
  });

  it('handles _lastUpdated special parameter with prefix', () => {
    const params: ParsedSearchParam[] = [
      { code: '_lastUpdated', prefix: 'ge', values: ['2026-01-01'] },
    ];
    const result = buildWhereClause(params, registry, 'Patient');
    expect(result!.sql).toContain('"lastUpdated" >= $1');
  });

  it('returns null for empty params', () => {
    const result = buildWhereClause([], registry, 'Patient');
    expect(result).toBeNull();
  });

  it('skips unknown params without registry match', () => {
    const params: ParsedSearchParam[] = [
      { code: 'nonexistent', values: ['value'] },
    ];
    const result = buildWhereClause(params, registry, 'Patient');
    expect(result).toBeNull();
  });

  it('handles mixed special and registry params', () => {
    const params: ParsedSearchParam[] = [
      { code: '_id', values: ['abc'] },
      { code: 'gender', values: ['male'] },
      { code: 'birthdate', prefix: 'ge', values: ['1990-01-01'] },
    ];
    const result = buildWhereClause(params, registry, 'Patient');
    expect(result).not.toBeNull();
    expect(result!.sql).toContain('"id"');
    expect(result!.sql).toContain('"__genderText" && ARRAY[$2]::text[]');
    expect(result!.sql).toContain('"birthdate" >= $3');
    expect(result!.values).toEqual(['abc', 'male', '1990-01-01']);
  });
});
