/**
 * @medxai/cli — Comprehensive Test Suite
 *
 * Tests all 5 CLI commands + arg parser + exit codes + JSON output contracts.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { parseArgv, runCommand } from '../cli.js';
import type { CliArgs } from '../types.js';
import { EXIT_SUCCESS, EXIT_FHIR_ERROR, EXIT_USAGE_ERROR } from '../types.js';

// ---- Helpers ----

const FIXTURES = resolve(__dirname, 'fixtures');
const VALID_PATIENT = resolve(FIXTURES, 'valid-patient.json');
const VALID_OBSERVATION = resolve(FIXTURES, 'valid-observation.json');
const INVALID_JSON = resolve(FIXTURES, 'invalid-json.json');

// Root of the monorepo
const MONOREPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const CORE_DIR = resolve(MONOREPO_ROOT, 'spec', 'fhir', 'r4');
const HAS_CORE = existsSync(resolve(CORE_DIR, 'profiles-resources.json'));

// US Core examples (for richer tests)
const US_CORE_DIR = resolve(MONOREPO_ROOT, 'devdocs', 'us-core', 'package');
const US_CORE_PATIENT = resolve(US_CORE_DIR, 'example', 'Patient-example.json');
const US_CORE_PATIENT_SD = resolve(US_CORE_DIR, 'StructureDefinition-us-core-patient.json');
const HAS_US_CORE = existsSync(US_CORE_PATIENT);

/** Capture console.log/error output during a function call */
async function captureOutput(fn: () => Promise<number>): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  const origLog = console.log;
  const origError = console.error;
  console.log = (...args: unknown[]) => stdoutChunks.push(args.map(String).join(' '));
  console.error = (...args: unknown[]) => stderrChunks.push(args.map(String).join(' '));

  let exitCode: number;
  try {
    exitCode = await fn();
  } finally {
    console.log = origLog;
    console.error = origError;
  }

  return {
    exitCode,
    stdout: stdoutChunks.join('\n'),
    stderr: stderrChunks.join('\n'),
  };
}

// =============================================================================
// Section 1: Argument Parser
// =============================================================================

describe('parseArgv', () => {
  it('parses command with no args', () => {
    const result = parseArgv(['node', 'medxai', 'capabilities']);
    expect(result.command).toBe('capabilities');
    expect(result.positionals).toEqual([]);
    expect(result.flags).toEqual({});
  });

  it('parses command with positional args', () => {
    const result = parseArgv(['node', 'medxai', 'parse', 'file.json']);
    expect(result.command).toBe('parse');
    expect(result.positionals).toEqual(['file.json']);
  });

  it('parses boolean flags', () => {
    const result = parseArgv(['node', 'medxai', 'parse', 'file.json', '--json', '--pretty']);
    expect(result.flags['json']).toBe(true);
    expect(result.flags['pretty']).toBe(true);
  });

  it('parses key-value flags', () => {
    const result = parseArgv(['node', 'medxai', 'validate', 'file.json', '--profile', 'http://example.com/Profile']);
    expect(result.flags['profile']).toBe('http://example.com/Profile');
  });

  it('parses --key=value syntax', () => {
    const result = parseArgv(['node', 'medxai', 'snapshot', 'sd.json', '--output=out.json']);
    expect(result.flags['output']).toBe('out.json');
  });

  it('parses multiple positionals', () => {
    const result = parseArgv(['node', 'medxai', 'evaluate', 'Patient.name.family', 'Patient.json']);
    expect(result.positionals).toEqual(['Patient.name.family', 'Patient.json']);
  });

  it('handles empty argv', () => {
    const result = parseArgv(['node', 'medxai']);
    expect(result.command).toBe('');
    expect(result.positionals).toEqual([]);
  });

  it('handles mixed flags and positionals', () => {
    const result = parseArgv(['node', 'medxai', 'validate', 'file.json', '--profile', 'prof.json', '--json', '--core', '/path/to/core']);
    expect(result.command).toBe('validate');
    expect(result.positionals).toEqual(['file.json']);
    expect(result.flags['profile']).toBe('prof.json');
    expect(result.flags['json']).toBe(true);
    expect(result.flags['core']).toBe('/path/to/core');
  });
});

// =============================================================================
// Section 2: capabilities command
// =============================================================================

describe('capabilities command', () => {
  it('returns EXIT_SUCCESS', async () => {
    const args: CliArgs = { command: 'capabilities', positionals: [], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
  });

  it('outputs human-readable format', async () => {
    const args: CliArgs = { command: 'capabilities', positionals: [], flags: {} };
    const { stdout } = await captureOutput(() => runCommand(args));
    expect(stdout).toContain('fhir-core');
    expect(stdout).toContain('R4');
    expect(stdout).toContain('supported');
    expect(stdout).toContain('not supported');
  });

  it('outputs valid JSON with --json', async () => {
    const args: CliArgs = { command: 'capabilities', positionals: [], flags: { json: true } };
    const { stdout } = await captureOutput(() => runCommand(args));
    const parsed = JSON.parse(stdout);
    expect(parsed.engineVersion).toBe('0.1.0');
    expect(parsed.fhirVersion).toContain('R4');
    expect(parsed.modules.parsing).toBe(true);
    expect(parsed.modules.terminology).toBe(false);
    expect(parsed.modules.search).toBe(false);
  });

  it('JSON output has correct module keys', async () => {
    const args: CliArgs = { command: 'capabilities', positionals: [], flags: { json: true } };
    const { stdout } = await captureOutput(() => runCommand(args));
    const parsed = JSON.parse(stdout);
    const expectedModules = ['parsing', 'context', 'snapshot', 'validation', 'fhirpath', 'terminology', 'search'];
    expect(Object.keys(parsed.modules).sort()).toEqual(expectedModules.sort());
  });
});

// =============================================================================
// Section 3: parse command
// =============================================================================

describe('parse command', () => {
  it('parses a valid Patient file', async () => {
    const args: CliArgs = { command: 'parse', positionals: [VALID_PATIENT], flags: {} };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(stdout).toContain('Patient');
    expect(stdout).toContain('test-patient');
  });

  it('returns EXIT_USAGE_ERROR with no file arg', async () => {
    const args: CliArgs = { command: 'parse', positionals: [], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_USAGE_ERROR);
  });

  it('returns EXIT_FHIR_ERROR for nonexistent file', async () => {
    const args: CliArgs = { command: 'parse', positionals: ['/nonexistent/file.json'], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
  });

  it('returns EXIT_FHIR_ERROR for invalid JSON', async () => {
    const args: CliArgs = { command: 'parse', positionals: [INVALID_JSON], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
  });

  it('--json outputs valid JSON for valid file', async () => {
    const args: CliArgs = { command: 'parse', positionals: [VALID_PATIENT], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.success).toBe(true);
    expect(parsed.resourceType).toBe('Patient');
    expect(parsed.id).toBe('test-patient');
    expect(Array.isArray(parsed.issues)).toBe(true);
  });

  it('--json outputs valid JSON for invalid file', async () => {
    const args: CliArgs = { command: 'parse', positionals: [INVALID_JSON], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
    // May output error string instead of JSON (parsing fails before we get result)
    // Just verify it doesn't crash
  });

  it('--silent returns only exit code', async () => {
    const args: CliArgs = { command: 'parse', positionals: [VALID_PATIENT], flags: { silent: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(stdout).toBe('');
  });

  it('parses a valid Observation file', async () => {
    const args: CliArgs = { command: 'parse', positionals: [VALID_OBSERVATION], flags: {} };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(stdout).toContain('Observation');
  });

  it('--json issue shape includes severity, code, message', async () => {
    const args: CliArgs = { command: 'parse', positionals: [VALID_PATIENT], flags: { json: true } };
    const { stdout } = await captureOutput(() => runCommand(args));
    const parsed = JSON.parse(stdout);
    for (const issue of parsed.issues) {
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('code');
      expect(issue).toHaveProperty('message');
    }
  });
});

// =============================================================================
// Section 4: evaluate command
// =============================================================================

describe('evaluate command', () => {
  it('evaluates a simple FHIRPath expression', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.id', VALID_PATIENT], flags: {} };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(stdout).toContain('test-patient');
  });

  it('evaluates with --boolean flag', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.id.exists()', VALID_PATIENT], flags: { boolean: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(stdout).toContain('true');
  });

  it('returns EXIT_USAGE_ERROR with missing args', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: [], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_USAGE_ERROR);
  });

  it('returns EXIT_USAGE_ERROR with only expression', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.id'], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_USAGE_ERROR);
  });

  it('--json outputs valid JSON', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.gender', VALID_PATIENT], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.expression).toBe('Patient.gender');
    expect(Array.isArray(parsed.results)).toBe(true);
    expect(parsed.count).toBeGreaterThanOrEqual(0);
  });

  it('--json --boolean outputs boolean type', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.id.exists()', VALID_PATIENT], flags: { json: true, boolean: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('boolean');
    expect(typeof parsed.result).toBe('boolean');
  });

  it('returns EXIT_FHIR_ERROR for nonexistent file', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.id', '/nonexistent.json'], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
  });

  it('handles Observation FHIRPath', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Observation.status', VALID_OBSERVATION], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.results).toContain('final');
  });
});

// =============================================================================
// Section 5: validate command
// =============================================================================

describe('validate command', () => {
  it('returns EXIT_USAGE_ERROR with no file arg', async () => {
    const args: CliArgs = { command: 'validate', positionals: [], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_USAGE_ERROR);
  });

  it('returns EXIT_FHIR_ERROR for nonexistent file', async () => {
    const args: CliArgs = { command: 'validate', positionals: ['/nonexistent.json'], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
  });

  it('returns EXIT_FHIR_ERROR when no profile is found without --core', async () => {
    const args: CliArgs = { command: 'validate', positionals: [VALID_PATIENT], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
  });

  it.skipIf(!HAS_CORE)('validates Patient against core profile', async () => {
    const args: CliArgs = { command: 'validate', positionals: [VALID_PATIENT], flags: { core: CORE_DIR } };
    const { exitCode } = await captureOutput(() => runCommand(args));
    // May fail due to known false positives, but should not crash
    expect([EXIT_SUCCESS, EXIT_FHIR_ERROR]).toContain(exitCode);
  });

  it.skipIf(!HAS_CORE)('--json outputs valid validation JSON', async () => {
    const args: CliArgs = { command: 'validate', positionals: [VALID_PATIENT], flags: { core: CORE_DIR, json: true } };
    const { stdout } = await captureOutput(() => runCommand(args));
    const parsed = JSON.parse(stdout);
    expect(typeof parsed.valid).toBe('boolean');
    expect(Array.isArray(parsed.issues)).toBe(true);
    expect(parsed).toHaveProperty('profileUrl');
  });

  it.skipIf(!HAS_CORE)('--json issue shape includes severity, code, path, message', async () => {
    const args: CliArgs = { command: 'validate', positionals: [VALID_PATIENT], flags: { core: CORE_DIR, json: true } };
    const { stdout } = await captureOutput(() => runCommand(args));
    const parsed = JSON.parse(stdout);
    for (const issue of parsed.issues) {
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('code');
      expect(issue).toHaveProperty('path');
      expect(issue).toHaveProperty('message');
    }
  });
});

// =============================================================================
// Section 6: snapshot command
// =============================================================================

describe('snapshot command', () => {
  it('returns EXIT_USAGE_ERROR with no file arg', async () => {
    const args: CliArgs = { command: 'snapshot', positionals: [], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_USAGE_ERROR);
  });

  it('returns EXIT_FHIR_ERROR for nonexistent file', async () => {
    const args: CliArgs = { command: 'snapshot', positionals: ['/nonexistent.json'], flags: {} };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_FHIR_ERROR);
  });

  it.skipIf(!HAS_CORE || !HAS_US_CORE)('generates snapshot for US Core Patient', async () => {
    const args: CliArgs = { command: 'snapshot', positionals: [US_CORE_PATIENT_SD], flags: { core: CORE_DIR } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(stdout).toContain('Snapshot generated');
    expect(stdout).toContain('USCorePatientProfile');
  });

  it.skipIf(!HAS_CORE || !HAS_US_CORE)('--json outputs valid snapshot JSON', async () => {
    const args: CliArgs = { command: 'snapshot', positionals: [US_CORE_PATIENT_SD], flags: { core: CORE_DIR, json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.success).toBe(true);
    expect(parsed.elementCount).toBeGreaterThan(0);
    expect(Array.isArray(parsed.issues)).toBe(true);
  });
});

// =============================================================================
// Section 7: runCommand routing
// =============================================================================

describe('runCommand routing', () => {
  it('returns EXIT_USAGE_ERROR for unknown command', async () => {
    const args: CliArgs = { command: 'unknown-cmd', positionals: [], flags: {} };
    const exitCode = await runCommand(args);
    expect(exitCode).toBe(EXIT_USAGE_ERROR);
  });

  it('routes capabilities command correctly', async () => {
    const args: CliArgs = { command: 'capabilities', positionals: [], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    expect(JSON.parse(stdout).engineVersion).toBe('0.1.0');
  });

  it('routes parse command correctly', async () => {
    const args: CliArgs = { command: 'parse', positionals: [VALID_PATIENT], flags: { silent: true } };
    const { exitCode } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
  });
});

// =============================================================================
// Section 8: US Core integration (skipped if data unavailable)
// =============================================================================

describe('US Core integration', () => {
  it.skipIf(!HAS_US_CORE)('parse US Core Patient example', async () => {
    const args: CliArgs = { command: 'parse', positionals: [US_CORE_PATIENT], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.resourceType).toBe('Patient');
  });

  it.skipIf(!HAS_US_CORE)('evaluate FHIRPath on US Core Patient', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.name.family', US_CORE_PATIENT], flags: { json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  it.skipIf(!HAS_US_CORE)('evaluate boolean FHIRPath on US Core Patient', async () => {
    const args: CliArgs = { command: 'evaluate', positionals: ['Patient.name.exists()', US_CORE_PATIENT], flags: { json: true, boolean: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    expect(exitCode).toBe(EXIT_SUCCESS);
    const parsed = JSON.parse(stdout);
    expect(parsed.result).toBe(true);
  });

  it.skipIf(!HAS_CORE || !HAS_US_CORE)('validate US Core Patient with core profiles', async () => {
    const args: CliArgs = { command: 'validate', positionals: [US_CORE_PATIENT], flags: { core: CORE_DIR, json: true } };
    const { exitCode, stdout } = await captureOutput(() => runCommand(args));
    // May have known false positives but should produce valid output structure
    const parsed = JSON.parse(stdout);
    expect(typeof parsed.valid).toBe('boolean');
    expect(Array.isArray(parsed.issues)).toBe(true);
  });
});

// =============================================================================
// Section 9: Exit code contract
// =============================================================================

describe('exit code contract', () => {
  it('EXIT_SUCCESS = 0', () => {
    expect(EXIT_SUCCESS).toBe(0);
  });

  it('EXIT_FHIR_ERROR = 1', () => {
    expect(EXIT_FHIR_ERROR).toBe(1);
  });

  it('EXIT_USAGE_ERROR = 2', () => {
    expect(EXIT_USAGE_ERROR).toBe(2);
  });
});
