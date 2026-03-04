/**
 * @medxai/cli — evaluate command
 *
 * Evaluate a FHIRPath expression against a FHIR resource.
 */
import type { CliArgs } from '../types.js';
import { EXIT_SUCCESS, EXIT_FHIR_ERROR, EXIT_USAGE_ERROR } from '../types.js';
import { readJsonFile, evaluateFhirPath, evaluateFhirPathBoolean } from '../runtime/engine.js';
import { bold, cyan, printJson, printKV, successMark } from '../runtime/output.js';

export async function execute(args: CliArgs): Promise<number> {
  const expression = args.positionals[0];
  const file = args.positionals[1];

  if (!expression || !file) {
    console.error('Usage: medxai evaluate <expression> <resource.json> [--json] [--boolean]');
    return EXIT_USAGE_ERROR;
  }

  const isJson = args.flags['json'] === true;
  const isBoolean = args.flags['boolean'] === true;

  try {
    const json = readJsonFile(file);
    const resource = JSON.parse(json) as unknown;

    if (isBoolean) {
      const result = await evaluateFhirPathBoolean(expression, resource);
      if (isJson) {
        printJson({ expression, result, type: 'boolean' });
      } else {
        console.log();
        console.log(`${successMark()} ${bold('FHIRPath evaluated')}`);
        printKV('Expression', cyan(expression));
        printKV('Result', String(result));
        printKV('Type', 'boolean');
        console.log();
      }
      return EXIT_SUCCESS;
    }

    const results = await evaluateFhirPath(expression, resource);

    if (isJson) {
      printJson({
        expression,
        results,
        count: results.length,
        type: results.length > 0 ? typeof results[0] : 'empty',
      });
      return EXIT_SUCCESS;
    }

    console.log();
    console.log(`${successMark()} ${bold('FHIRPath evaluated')}`);
    printKV('Expression', cyan(expression));
    printKV('Result', JSON.stringify(results));
    printKV('Type', results.length > 0 ? `${typeof results[0]}${results.length > 1 ? '[]' : ''}` : 'empty');
    printKV('Count', String(results.length));
    console.log();

    return EXIT_SUCCESS;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isJson) {
      printJson({ expression, error: message });
    } else {
      console.error(`Error evaluating FHIRPath: ${message}`);
    }
    return EXIT_FHIR_ERROR;
  }
}

export const description = 'Evaluate a FHIRPath expression against a resource';
export const usage = 'medxai evaluate <expression> <resource.json> [--json] [--boolean]';
