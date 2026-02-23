/**
 * SearchParameter Registry
 *
 * Indexes FHIR SearchParameter definitions and determines the physical
 * storage strategy for each parameter. Drives search column generation
 * in `TableSchemaBuilder`.
 *
 * ## Strategy Mapping (from WF-MIG-003)
 *
 * | SearchParam.type | Strategy       | Column Type                          |
 * |------------------|----------------|--------------------------------------|
 * | date             | column         | TIMESTAMPTZ (or DATE)                |
 * | string           | column         | TEXT                                 |
 * | reference        | column         | TEXT                                 |
 * | number           | column         | DOUBLE PRECISION                     |
 * | quantity         | column         | DOUBLE PRECISION                     |
 * | uri              | column         | TEXT                                 |
 * | boolean          | column         | BOOLEAN (not used in practice)       |
 * | token            | token-column   | UUID[] + TEXT[] + TEXT (3 cols)       |
 * | special          | skipped        | —                                    |
 * | composite        | skipped        | —                                    |
 *
 * Lookup-table strategy is determined by matching specific search param
 * codes (name, address, etc.) — generates a sort column only in the
 * main table; actual data is written by the Repository layer (Phase 9).
 *
 * @module fhir-persistence/registry
 */

import type { SqlColumnType } from '../schema/table-schema.js';

// =============================================================================
// Section 1: Types
// =============================================================================

/**
 * FHIR SearchParameter type codes.
 */
export type SearchParamType =
  | 'number'
  | 'date'
  | 'string'
  | 'token'
  | 'reference'
  | 'composite'
  | 'quantity'
  | 'uri'
  | 'special';

/**
 * Physical storage strategy for a search parameter.
 *
 * - `column` — single column in the main table
 * - `token-column` — three columns (UUID[], TEXT[], TEXT) for token search
 * - `lookup-table` — separate lookup table; only a sort column in main table
 */
export type SearchStrategy = 'column' | 'token-column' | 'lookup-table';

/**
 * Column type for search parameter columns.
 */
export type SearchColumnType = SqlColumnType;

/**
 * Resolved implementation details for a single search parameter
 * on a specific resource type.
 */
export interface SearchParameterImpl {
  /** SearchParameter.code (e.g., `'birthdate'`). */
  code: string;

  /** FHIR search parameter type. */
  type: SearchParamType;

  /** Resource types this parameter applies to. */
  resourceTypes: string[];

  /** FHIRPath expression for value extraction. */
  expression: string;

  /** Physical storage strategy. */
  strategy: SearchStrategy;

  /** Column name in the main table (for `column` strategy). */
  columnName: string;

  /** PostgreSQL column type (for `column` strategy). */
  columnType: SearchColumnType;

  /** Whether the column stores an array of values. */
  array: boolean;
}

/**
 * Raw FHIR SearchParameter shape (subset of fields we need).
 */
export interface SearchParameterResource {
  resourceType: 'SearchParameter';
  code: string;
  type: SearchParamType;
  base: string[];
  expression?: string;
  url?: string;
  name?: string;
}

/**
 * Shape of a FHIR Bundle containing SearchParameter entries.
 */
export interface SearchParameterBundle {
  resourceType: 'Bundle';
  entry?: Array<{
    resource?: SearchParameterResource;
  }>;
}

// =============================================================================
// Section 2: Constants
// =============================================================================

/**
 * SearchParameter codes that are already handled by fixed columns
 * and should NOT generate additional search columns.
 */
const IGNORED_SEARCH_PARAMS = new Set([
  '_id',
  '_lastUpdated',
  '_profile',
  '_compartment',
  '_source',
  '_version',
  'version',
]);

/**
 * SearchParameter types that are skipped entirely.
 */
const SKIPPED_TYPES = new Set<SearchParamType>(['composite', 'special']);

/**
 * Search parameter codes that use the lookup-table strategy.
 *
 * These parameters target complex FHIR types (HumanName, Address, etc.)
 * that require multi-column storage in separate lookup tables.
 * Only a sort column is generated in the main table.
 */
const LOOKUP_TABLE_PARAMS = new Set([
  // HumanName-related
  'name',
  'given',
  'family',
  'phonetic',
  // Address-related
  'address',
  'address-city',
  'address-country',
  'address-postalcode',
  'address-state',
  'address-use',
  // Contact-related
  'email',
  'phone',
  'telecom',
]);

// =============================================================================
// Section 3: Strategy Resolution
// =============================================================================

/**
 * Determine the search strategy for a given search parameter.
 */
function resolveStrategy(code: string, type: SearchParamType): SearchStrategy {
  if (LOOKUP_TABLE_PARAMS.has(code)) {
    return 'lookup-table';
  }
  if (type === 'token') {
    return 'token-column';
  }
  return 'column';
}

/**
 * Convert a hyphenated search parameter code to a camelCase column name.
 *
 * Examples:
 * - `'birth-date'` → `'birthDate'`
 * - `'address-city'` → `'addressCity'`
 * - `'active'` → `'active'`
 */
function codeToColumnName(code: string): string {
  return code.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Determine the PostgreSQL column type for a search parameter.
 *
 * @param type - FHIR search parameter type
 * @param array - Whether the column stores multiple values
 * @returns The PostgreSQL column type
 */
function resolveColumnType(type: SearchParamType, array: boolean): SearchColumnType {
  switch (type) {
    case 'date':
      return array ? 'TIMESTAMPTZ[]' : 'TIMESTAMPTZ';
    case 'number':
    case 'quantity':
      return array ? 'DOUBLE PRECISION[]' : 'DOUBLE PRECISION';
    case 'string':
    case 'uri':
    case 'reference':
      return array ? 'TEXT[]' : 'TEXT';
    case 'token':
      // Token columns use UUID[] for the hash column;
      // the actual column type is set by the token-column strategy
      return 'UUID[]';
    default:
      return 'TEXT';
  }
}

/**
 * Determine whether a search parameter produces an array column.
 *
 * A parameter is considered array if its expression can match
 * multiple values (e.g., `Patient.address` is repeating).
 *
 * Heuristic: if the expression contains `|` (union) or the
 * parameter targets a repeating element, it's likely an array.
 * For simplicity, we default to `false` for column strategy
 * and `true` for token-column strategy (tokens are always arrays).
 */
function resolveIsArray(type: SearchParamType, strategy: SearchStrategy): boolean {
  if (strategy === 'token-column') {
    return true; // Token columns are always arrays
  }
  // For column strategy, most params are scalar.
  // Array detection would require StructureDefinition analysis;
  // for now, we use a conservative default.
  // Reference params that target multiple paths are arrays.
  if (type === 'reference') {
    return false; // Default scalar; overridden per-param if needed
  }
  return false;
}

// =============================================================================
// Section 4: SearchParameterRegistry
// =============================================================================

/**
 * Indexes SearchParameter definitions by resource type.
 *
 * ## Usage
 *
 * ```typescript
 * const registry = new SearchParameterRegistry();
 * const bundle = JSON.parse(fs.readFileSync('search-parameters.json', 'utf8'));
 * registry.indexBundle(bundle);
 *
 * const patientParams = registry.getForResource('Patient');
 * ```
 */
export class SearchParameterRegistry {
  /**
   * Map from resource type → Map from param code → SearchParameterImpl.
   */
  private readonly byResource = new Map<string, Map<string, SearchParameterImpl>>();

  /**
   * Total number of indexed implementations (across all resource types).
   */
  private _totalCount = 0;

  /**
   * Number of skipped parameters (composite, special, ignored).
   */
  private _skippedCount = 0;

  /**
   * Index all SearchParameter entries from a FHIR Bundle.
   *
   * Skips entries that are:
   * - Not a SearchParameter resource
   * - Of type `composite` or `special`
   * - In the ignored list (`_id`, `_lastUpdated`, etc.)
   *
   * @returns Stats about the indexing operation.
   */
  indexBundle(bundle: SearchParameterBundle): { indexed: number; skipped: number } {
    let indexed = 0;
    let skipped = 0;

    if (!bundle.entry) {
      return { indexed: 0, skipped: 0 };
    }

    for (const entry of bundle.entry) {
      const resource = entry.resource;
      if (!resource || resource.resourceType !== 'SearchParameter') {
        skipped++;
        continue;
      }

      if (SKIPPED_TYPES.has(resource.type)) {
        skipped++;
        continue;
      }

      if (IGNORED_SEARCH_PARAMS.has(resource.code)) {
        skipped++;
        continue;
      }

      if (!resource.base || resource.base.length === 0) {
        skipped++;
        continue;
      }

      const impl = this.buildImpl(resource);
      if (!impl) {
        skipped++;
        continue;
      }

      // Index for each base resource type
      for (const base of resource.base) {
        // Skip abstract base types — they don't have tables
        if (base === 'Resource' || base === 'DomainResource') {
          continue;
        }

        let resourceMap = this.byResource.get(base);
        if (!resourceMap) {
          resourceMap = new Map();
          this.byResource.set(base, resourceMap);
        }
        resourceMap.set(impl.code, impl);
      }

      indexed++;
    }

    this._totalCount += indexed;
    this._skippedCount += skipped;

    return { indexed, skipped };
  }

  /**
   * Index a single SearchParameterImpl directly.
   *
   * Useful for adding platform-specific or custom search parameters.
   */
  indexImpl(resourceType: string, impl: SearchParameterImpl): void {
    let resourceMap = this.byResource.get(resourceType);
    if (!resourceMap) {
      resourceMap = new Map();
      this.byResource.set(resourceType, resourceMap);
    }
    resourceMap.set(impl.code, impl);
    this._totalCount++;
  }

  /**
   * Get all search parameter implementations for a resource type.
   *
   * @returns Array of SearchParameterImpl, sorted by code for deterministic output.
   */
  getForResource(resourceType: string): SearchParameterImpl[] {
    const resourceMap = this.byResource.get(resourceType);
    if (!resourceMap) {
      return [];
    }
    return Array.from(resourceMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Get a specific search parameter implementation for a resource type.
   */
  getImpl(resourceType: string, code: string): SearchParameterImpl | undefined {
    return this.byResource.get(resourceType)?.get(code);
  }

  /**
   * Check if a resource type has any indexed search parameters.
   */
  hasResource(resourceType: string): boolean {
    return this.byResource.has(resourceType);
  }

  /**
   * Get all resource types that have indexed search parameters.
   */
  getResourceTypes(): string[] {
    return Array.from(this.byResource.keys()).sort();
  }

  /**
   * Get the total number of indexed implementations.
   */
  get totalCount(): number {
    return this._totalCount;
  }

  /**
   * Get the number of skipped parameters.
   */
  get skippedCount(): number {
    return this._skippedCount;
  }

  /**
   * Get the number of resource types with indexed parameters.
   */
  get resourceTypeCount(): number {
    return this.byResource.size;
  }

  /**
   * Remove all indexed parameters.
   */
  clear(): void {
    this.byResource.clear();
    this._totalCount = 0;
    this._skippedCount = 0;
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  /**
   * Build a SearchParameterImpl from a raw SearchParameter resource.
   */
  private buildImpl(resource: SearchParameterResource): SearchParameterImpl | null {
    const { code, type, base, expression } = resource;

    if (!code || !type || !base) {
      return null;
    }

    const strategy = resolveStrategy(code, type);
    const columnName = codeToColumnName(code);
    const array = resolveIsArray(type, strategy);
    const columnType = resolveColumnType(type, array);

    return {
      code,
      type,
      resourceTypes: [...base],
      expression: expression ?? '',
      strategy,
      columnName,
      columnType,
      array,
    };
  }
}
