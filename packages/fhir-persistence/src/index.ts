/**
 * `@medxai/fhir-persistence` — Public API
 *
 * Provides schema generation from FHIR StructureDefinitions and
 * SearchParameters to PostgreSQL DDL. No database dependency —
 * all functions are pure and fully unit-testable.
 *
 * @packageDocumentation
 */

// ─── Schema Types ────────────────────────────────────────────────────────────
export type {
  SqlColumnType,
  ColumnSchema,
  IndexSchema,
  ConstraintSchema,
  MainTableSchema,
  HistoryTableSchema,
  ReferencesTableSchema,
  ResourceTableSet,
  SchemaDefinition,
} from './schema/index.js';

// ─── Registry ────────────────────────────────────────────────────────────────
export { StructureDefinitionRegistry } from './registry/index.js';
export { SearchParameterRegistry } from './registry/index.js';
export type {
  SearchParamType,
  SearchStrategy,
  SearchColumnType,
  SearchParameterImpl,
  SearchParameterResource,
  SearchParameterBundle,
} from './registry/index.js';

// ─── Schema Builder ──────────────────────────────────────────────────────────
export {
  buildResourceTableSet,
  buildAllResourceTableSets,
  buildSchemaDefinition,
} from './schema/table-schema-builder.js';

// ─── DDL Generator ───────────────────────────────────────────────────────────
export {
  generateCreateMainTable,
  generateCreateHistoryTable,
  generateCreateReferencesTable,
  generateCreateIndex,
  generateResourceDDL,
  generateSchemaDDL,
  generateSchemaDDLString,
} from './schema/ddl-generator.js';

// ─── Database ───────────────────────────────────────────────────────────────
export type { DatabaseConfig } from './db/index.js';
export { loadDatabaseConfig } from './db/index.js';
export { DatabaseClient } from './db/index.js';