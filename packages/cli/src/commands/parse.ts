/**
 * @medxai/cli — parse command
 *
 * Parse a FHIR R4 JSON file and report structure.
 */
import type { CliArgs } from '../types.js';
import { EXIT_SUCCESS, EXIT_FHIR_ERROR, EXIT_USAGE_ERROR } from '../types.js';
import { parseFile } from '../runtime/engine.js';
import {
  successMark, failMark, bold, dim, printKV, printJson, printIssue,
} from '../runtime/output.js';
import { serializeToFhirJson } from '@medxai/fhir-core';
import type { Resource } from '@medxai/fhir-core';

export async function execute(args: CliArgs): Promise<number> {
  const file = args.positionals[0];
  if (!file) {
    console.error('Usage: medxai parse <file> [--pretty] [--json] [--silent]');
    return EXIT_USAGE_ERROR;
  }

  const isJson = args.flags['json'] === true;
  const isPretty = args.flags['pretty'] === true;
  const isSilent = args.flags['silent'] === true;

  try {
    const result = parseFile(file);
    const errors = result.issues.filter((i) => i.severity === 'error');
    const warnings = result.issues.filter((i) => i.severity === 'warning');

    if (isJson) {
      printJson({
        success: result.success,
        resourceType: result.data?.resourceType ?? null,
        id: (result.data as unknown as Record<string, unknown>)?.['id'] ?? null,
        issues: result.issues.map((i) => ({
          severity: i.severity,
          code: i.code,
          message: i.message,
          path: i.path,
        })),
      });
      return result.success ? EXIT_SUCCESS : EXIT_FHIR_ERROR;
    }

    if (isSilent) {
      return result.success ? EXIT_SUCCESS : EXIT_FHIR_ERROR;
    }

    if (result.success && result.data) {
      console.log();
      console.log(`${successMark()} ${bold('Valid FHIR R4 resource')}`);
      printKV('Type', result.data.resourceType);
      const id = (result.data as unknown as Record<string, unknown>)['id'];
      if (id) printKV('Id', String(id));
      printKV('Issues', `${errors.length} errors, ${warnings.length} warnings`);

      if (isPretty) {
        console.log();
        console.log(dim('--- Parsed Output ---'));
        try {
          console.log(serializeToFhirJson(result.data as Resource));
        } catch {
          console.log(JSON.stringify(result.data, null, 2));
        }
      }
    } else {
      console.log();
      console.log(`${failMark()} ${bold('Parse failed')}`);
      printKV('Issues', `${errors.length} errors, ${warnings.length} warnings`);
    }

    if (result.issues.length > 0) {
      console.log();
      for (const issue of result.issues) {
        printIssue(issue.severity, issue.path, issue.message);
      }
    }

    console.log();
    return result.success ? EXIT_SUCCESS : EXIT_FHIR_ERROR;
  } catch (err) {
    if (!isSilent) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    return EXIT_FHIR_ERROR;
  }
}

export const description = 'Parse a FHIR R4 JSON file';
export const usage = 'medxai parse <file> [--pretty] [--json] [--silent]';
