/**
 * Repository Errors — Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  RepositoryError,
  ResourceNotFoundError,
  ResourceGoneError,
  ResourceVersionConflictError,
} from '../../repo/errors.js';

describe('RepositoryError', () => {
  it('is an instance of Error', () => {
    const err = new RepositoryError('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RepositoryError);
    expect(err.name).toBe('RepositoryError');
    expect(err.message).toBe('test');
  });
});

describe('ResourceNotFoundError', () => {
  it('has correct name, message, and properties', () => {
    const err = new ResourceNotFoundError('Patient', 'abc-123');
    expect(err).toBeInstanceOf(RepositoryError);
    expect(err).toBeInstanceOf(ResourceNotFoundError);
    expect(err.name).toBe('ResourceNotFoundError');
    expect(err.message).toBe('Patient/abc-123 not found');
    expect(err.resourceType).toBe('Patient');
    expect(err.resourceId).toBe('abc-123');
  });
});

describe('ResourceGoneError', () => {
  it('has correct name, message, and properties', () => {
    const err = new ResourceGoneError('Observation', 'xyz-789');
    expect(err).toBeInstanceOf(RepositoryError);
    expect(err).toBeInstanceOf(ResourceGoneError);
    expect(err.name).toBe('ResourceGoneError');
    expect(err.message).toBe('Observation/xyz-789 has been deleted');
    expect(err.resourceType).toBe('Observation');
    expect(err.resourceId).toBe('xyz-789');
  });
});

describe('ResourceVersionConflictError', () => {
  it('has correct name, message, and properties', () => {
    const err = new ResourceVersionConflictError('Patient', 'abc', 'v1', 'v2');
    expect(err).toBeInstanceOf(RepositoryError);
    expect(err).toBeInstanceOf(ResourceVersionConflictError);
    expect(err.name).toBe('ResourceVersionConflictError');
    expect(err.message).toContain('Version conflict');
    expect(err.message).toContain('expected v1');
    expect(err.message).toContain('actual v2');
    expect(err.resourceType).toBe('Patient');
    expect(err.resourceId).toBe('abc');
    expect(err.expectedVersion).toBe('v1');
    expect(err.actualVersion).toBe('v2');
  });
});
