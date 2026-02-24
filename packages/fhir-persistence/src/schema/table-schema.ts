/**
 * Table Schema — Type Definitions
 *
 * Intermediate data model representing PostgreSQL table structure.
 * These types are the output of `TableSchemaBuilder` and the input
 * to `DDLGenerator`. They are pure data — no behavior, no DB dependency.
 *
 * ## Design
 *
 * Each FHIR resource type maps to a `ResourceTableSet` containing
 * exactly 3 tables:
 * - **Main table** (`Patient`) — current version + search columns
 * - **History table** (`Patient_History`) — all versions
 * - **References table** (`Patient_References`) — outgoing references
 *
 * This mirrors Medplum's 3-table-per-resource strategy (WF-MIG-002).
 *
 * @module fhir-persistence/schema
 */

// =============================================================================
// Section 1: Column Types
// =============================================================================

/**
 * PostgreSQL column types used in FHIR resource tables.
 */
export type SqlColumnType =
  | 'UUID'
  | 'TEXT'
  | 'TEXT[]'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'BIGINT'
  | 'TIMESTAMPTZ'
  | 'TIMESTAMPTZ[]'
  | 'DATE'
  | 'DATE[]'
  | 'NUMERIC'
  | 'DOUBLE PRECISION'
  | 'DOUBLE PRECISION[]'
  | 'UUID[]';

// =============================================================================
// Section 2: Column Schema
// =============================================================================

/**
 * Definition of a single PostgreSQL column.
 */
export interface ColumnSchema {
  /** Column name (e.g., `id`, `content`, `birthdate`). */
  name: string;

  /** PostgreSQL data type. */
  type: SqlColumnType;

  /** Whether the column has a NOT NULL constraint. */
  notNull: boolean;

  /** Whether this column is the primary key. */
  primaryKey: boolean;

  /** SQL default value expression (e.g., `'false'`). */
  defaultValue?: string;

  /** Source FHIRPath expression (documentation only). */
  fhirPath?: string;

  /** Source SearchParameter.code (documentation only). */
  searchParamCode?: string;
}

// =============================================================================
// Section 3: Index Schema
// =============================================================================

/**
 * Definition of a PostgreSQL index.
 */
export interface IndexSchema {
  /** Index name (e.g., `Patient_lastUpdated_idx`). */
  name: string;

  /** Columns included in the index key. */
  columns: string[];

  /** Index type. */
  indexType: 'btree' | 'gin' | 'gist';

  /** Whether this is a unique index. */
  unique: boolean;

  /** Partial index WHERE clause (e.g., `'deleted = false'`). */
  where?: string;

  /** INCLUDE columns for covering indexes. */
  include?: string[];
}

// =============================================================================
// Section 4: Constraint Schema
// =============================================================================

/**
 * Definition of a PostgreSQL table constraint.
 */
export interface ConstraintSchema {
  /** Constraint name (e.g., `Patient_pk`). */
  name: string;

  /** Constraint type. */
  type: 'primary_key' | 'unique' | 'check';

  /** Columns involved (for primary_key and unique). */
  columns?: string[];

  /** SQL expression (for check constraints). */
  expression?: string;
}

// =============================================================================
// Section 5: Table Schemas
// =============================================================================

/**
 * Schema for a FHIR resource main table (current version).
 *
 * Contains fixed columns (id, content, lastUpdated, etc.) plus
 * dynamic search columns derived from SearchParameters.
 */
export interface MainTableSchema {
  /** Table name (e.g., `'Patient'`). */
  tableName: string;

  /** FHIR resource type name. */
  resourceType: string;

  /** All columns (fixed + search). */
  columns: ColumnSchema[];

  /** All indexes (fixed + search). */
  indexes: IndexSchema[];

  /** Table constraints (PK, unique, check). */
  constraints: ConstraintSchema[];
}

/**
 * Schema for a FHIR resource history table.
 *
 * Stores all historical versions of a resource.
 * Fixed structure — no search columns.
 */
export interface HistoryTableSchema {
  /** Table name (e.g., `'Patient_History'`). */
  tableName: string;

  /** FHIR resource type name. */
  resourceType: string;

  /** All columns (fixed). */
  columns: ColumnSchema[];

  /** All indexes (fixed). */
  indexes: IndexSchema[];
}

/**
 * Schema for a FHIR resource references table.
 *
 * Stores outgoing reference relationships for `_revinclude` support.
 * Uses a composite primary key.
 */
export interface ReferencesTableSchema {
  /** Table name (e.g., `'Patient_References'`). */
  tableName: string;

  /** FHIR resource type name. */
  resourceType: string;

  /** All columns (fixed). */
  columns: ColumnSchema[];

  /** All indexes. */
  indexes: IndexSchema[];

  /** Composite primary key column names. */
  compositePrimaryKey: string[];
}

// =============================================================================
// Section 5b: Lookup Table Schema
// =============================================================================

/**
 * Schema for a lookup sub-table (e.g., `Patient_Name`, `Patient_Address`).
 *
 * Stores decomposed complex types (HumanName, Address, ContactPoint)
 * for precise search via JOINs.
 */
export interface LookupTableSchema {
  /** Table name (e.g., `'Patient_Name'`). */
  tableName: string;

  /** FHIR resource type name. */
  resourceType: string;

  /** Search parameter code (e.g., `'name'`, `'address'`). */
  searchParamCode: string;

  /** All columns. */
  columns: ColumnSchema[];

  /** All indexes. */
  indexes: IndexSchema[];

  /** Composite primary key column names. */
  compositePrimaryKey: string[];
}

// =============================================================================
// Section 6: Resource Table Set & Schema Definition
// =============================================================================

/**
 * Complete table set for a single FHIR resource type.
 *
 * Contains 3 core tables (main, history, references) plus optional lookup sub-tables.
 */
export interface ResourceTableSet {
  /** FHIR resource type (e.g., `'Patient'`). */
  resourceType: string;

  /** Main table (current version + search columns). */
  main: MainTableSchema;

  /** History table (all versions). */
  history: HistoryTableSchema;

  /** References table (outgoing references). */
  references: ReferencesTableSchema;

  /** Lookup sub-tables for complex type search (HumanName, Address, etc.). */
  lookupTables?: LookupTableSchema[];
}

/**
 * Complete schema definition for all resource types.
 *
 * This is the top-level output of the schema generation pipeline.
 */
export interface SchemaDefinition {
  /** Schema version identifier (e.g., `'fhir-r4-v4.0.1'`). */
  version: string;

  /** ISO timestamp of when the schema was generated. */
  generatedAt: string;

  /** Table sets for all resource types. */
  tableSets: ResourceTableSet[];
}
