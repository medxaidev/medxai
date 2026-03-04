/**
 * @medxai/cli — snapshot command
 *
 * Generate a complete snapshot for a StructureDefinition.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CliArgs } from '../types.js';
import { EXIT_SUCCESS, EXIT_FHIR_ERROR, EXIT_USAGE_ERROR } from '../types.js';
import { parseSDFile, generateSnapshot } from '../runtime/engine.js';
import {
  successMark, failMark, bold, printKV, printJson, printIssue,
} from '../runtime/output.js';

export async function execute(args: CliArgs): Promise<number> {
  const file = args.positionals[0];
  if (!file) {
    console.error('Usage: medxai snapshot <structureDefinition.json> [--output <file>] [--json] [--core <dir>]');
    return EXIT_USAGE_ERROR;
  }

  const isJson = args.flags['json'] === true;
  const outputFile = typeof args.flags['output'] === 'string' ? args.flags['output'] : undefined;
  const coreDir = typeof args.flags['core'] === 'string' ? args.flags['core'] : undefined;

  try {
    // Parse the StructureDefinition
    const { sd, raw } = parseSDFile(file);
    const profileName = (raw['name'] as string) || (raw['url'] as string) || file;
    const baseUrl = (raw['baseDefinition'] as string) || 'unknown';

    // Generate snapshot
    const result = await generateSnapshot(sd, coreDir);

    const errors = result.issues.filter((i) => i.severity === 'error');
    const warnings = result.issues.filter((i) => i.severity === 'warning');
    const elementCount = result.structureDefinition.snapshot?.element?.length ?? 0;

    // Write output file if requested
    if (outputFile && result.success) {
      const sdObj = JSON.parse(JSON.stringify(result.structureDefinition));
      writeFileSync(resolve(outputFile), JSON.stringify(sdObj, null, 2), 'utf-8');
    }

    if (isJson) {
      printJson({
        success: result.success,
        profile: profileName,
        base: baseUrl,
        elementCount,
        issues: result.issues.map((i) => ({
          severity: i.severity,
          code: i.code,
          message: i.message,
          path: i.path,
        })),
        ...(outputFile ? { outputFile: resolve(outputFile) } : {}),
      });
      return result.success ? EXIT_SUCCESS : EXIT_FHIR_ERROR;
    }

    // Human-readable output
    console.log();
    if (result.success) {
      console.log(`${successMark()} ${bold('Snapshot generated')}`);
    } else {
      console.log(`${failMark()} ${bold('Snapshot generation failed')}`);
    }
    printKV('Profile', profileName);
    printKV('Base', baseUrl);
    printKV('Elements', String(elementCount));
    printKV('Issues', `${errors.length} errors, ${warnings.length} warnings`);
    if (outputFile) {
      printKV('Output', resolve(outputFile));
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
    const message = err instanceof Error ? err.message : String(err);
    if (isJson) {
      printJson({ success: false, error: message, issues: [] });
    } else {
      console.error(`Error: ${message}`);
    }
    return EXIT_FHIR_ERROR;
  }
}

export const description = 'Generate a snapshot for a StructureDefinition';
export const usage = 'medxai snapshot <sd.json> [--output <file>] [--json] [--core <dir>]';
