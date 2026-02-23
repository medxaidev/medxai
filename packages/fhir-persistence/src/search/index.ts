/**
 * Search module — Public API
 *
 * @module fhir-persistence/search
 */

// Types
export type {
  SearchPrefix,
  SearchModifier,
  ParsedSearchParam,
  SortRule,
  SearchRequest,
  WhereFragment,
  SearchSQL,
  CountSQL,
} from './types.js';
export {
  SEARCH_PREFIXES,
  PREFIX_TYPES,
  DEFAULT_SEARCH_COUNT,
  MAX_SEARCH_COUNT,
} from './types.js';

// Parser
export {
  parseSearchRequest,
  parseParamKey,
  splitSearchValues,
  extractPrefix,
  parseSortParam,
} from './param-parser.js';

// WHERE Builder
export {
  prefixToOperator,
  buildWhereFragment,
  buildWhereClause,
} from './where-builder.js';

// Search SQL Builder
export {
  buildSearchSQL,
  buildCountSQL,
} from './search-sql-builder.js';
