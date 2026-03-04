/**
 * @medxai/cli — validate command
 *
 * Validate a FHIR resource against a profile.
 */
import type { CliArgs } from '../types.js';
import { EXIT_SUCCESS, EXIT_FHIR_ERROR, EXIT_USAGE_ERROR } from '../types.js';
import { parseFile, resolveProfile, createValidator } from '../runtime/engine.js';
import {
  successMark, failMark, bold, printKV, printJson, printIssue,
} from '../runtime/output.js';
import type { Resource } from '@medxai/fhir-core';

export async function execute(args: CliArgs): Promise<number> {
  const file = args.positionals[0];
  if (!file) {
    console.error('Usage: medxai validate <resource.json> [--profile <url|file>] [--json] [--core <dir>]');
    return EXIT_USAGE_ERROR;
  }

  const isJson = args.flags['json'] === true;
  const profileArg = typeof args.flags['profile'] === 'string' ? args.flags['profile'] : undefined;
  const coreDir = typeof args.flags['core'] === 'string' ? args.flags['core'] : undefined;

  try {
    // Parse the resource
    const parseResult = parseFile(file);
    if (!parseResult.success || !parseResult.data) {
      if (isJson) {
        printJson({
          valid: false,
          error: 'Failed to parse resource',
          issues: parseResult.issues.map((i) => ({
            severity: i.severity, code: i.code, message: i.message, path: i.path,
          })),
        });
      } else {
        console.log();
        console.log(`${failMark()} ${bold('Parse failed — cannot validate')}`);
        for (const issue of parseResult.issues) {
          printIssue(issue.severity, issue.path, issue.message);
        }
        console.log();
      }
      return EXIT_FHIR_ERROR;
    }

    const resource = parseResult.data;
    const resourceType = resource.resourceType;

    // Resolve profile
    const profile = resolveProfile(profileArg, resourceType, coreDir);
    if (!profile) {
      const msg = profileArg
        ? `Profile not found: ${profileArg}`
        : `No profile found for resource type: ${resourceType}. Use --profile or --core to specify.`;
      if (isJson) {
        printJson({ valid: false, error: msg, issues: [] });
      } else {
        console.error(`Error: ${msg}`);
      }
      return EXIT_FHIR_ERROR;
    }

    // Validate
    const validator = createValidator();
    const result = validator.validate(resource as unknown as Resource, profile);

    const errors = result.issues.filter((i) => i.severity === 'error');
    const warnings = result.issues.filter((i) => i.severity === 'warning');

    if (isJson) {
      printJson({
        valid: result.valid,
        profileUrl: result.profileUrl || profile.url || profileArg || resourceType,
        issues: result.issues.map((i) => ({
          severity: i.severity,
          code: i.code,
          path: i.path,
          message: i.message,
        })),
      });
      return result.valid ? EXIT_SUCCESS : EXIT_FHIR_ERROR;
    }

    // Human-readable output
    console.log();
    if (result.valid) {
      console.log(`${successMark()} ${bold('Validation passed')}`);
    } else {
      console.log(`${failMark()} ${bold('Validation failed')}`);
    }
    printKV('Profile', profile.url || profileArg || resourceType);
    printKV('Valid', String(result.valid));
    printKV('Issues', `${errors.length} errors, ${warnings.length} warnings`);

    if (result.issues.length > 0) {
      console.log();
      for (const issue of result.issues) {
        printIssue(issue.severity, issue.path, issue.message);
      }
    }

    console.log();
    return result.valid ? EXIT_SUCCESS : EXIT_FHIR_ERROR;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isJson) {
      printJson({ valid: false, error: message, issues: [] });
    } else {
      console.error(`Error: ${message}`);
    }
    return EXIT_FHIR_ERROR;
  }
}

export const description = 'Validate a FHIR resource against a profile';
export const usage = 'medxai validate <resource.json> [--profile <url|file>] [--json] [--core <dir>]';
