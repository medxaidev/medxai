/**
 * fhir-profile — Barrel Exports
 *
 * Re-exports all public types, interfaces, error classes, and helper
 * functions from the FHIR profile module.
 *
 * @module fhir-profile
 */

// ─── Types & Interfaces ───
export type {
  SnapshotGeneratorOptions,
  SnapshotResult,
  SnapshotIssue,
  SnapshotIssueCode,
  DiffElementTracker,
  TraversalScope,
} from './types.js';

// ─── Helper Functions ───
export {
  createSnapshotIssue,
  createDiffTracker,
} from './types.js';

// ─── Errors ───
export {
  ProfileError,
  SnapshotCircularDependencyError,
  BaseNotFoundError,
  ConstraintViolationError,
  UnconsumedDifferentialError,
} from './errors.js';
