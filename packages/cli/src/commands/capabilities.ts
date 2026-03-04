/**
 * @medxai/cli — capabilities command
 *
 * Display engine capability summary.
 */
import type { CliArgs } from '../types.js';
import { EXIT_SUCCESS } from '../types.js';
import { bold, green, red, dim, printJson, printKV } from '../runtime/output.js';

const ENGINE_VERSION = '0.1.0';
const FHIR_VERSION = 'R4 (4.0.1)';

interface CapabilitySummary {
  engineVersion: string;
  fhirVersion: string;
  modules: Record<string, { supported: boolean; detail?: string }>;
}

function getCapabilities(): CapabilitySummary {
  return {
    engineVersion: ENGINE_VERSION,
    fhirVersion: FHIR_VERSION,
    modules: {
      parsing: { supported: true },
      context: { supported: true, detail: '73 core definitions' },
      snapshot: { supported: true, detail: 'HAPI-equivalent' },
      validation: { supported: true, detail: '9 structural rules' },
      fhirpath: { supported: true, detail: '60+ functions' },
      terminology: { supported: false },
      search: { supported: false },
    },
  };
}

export async function execute(args: CliArgs): Promise<number> {
  const isJson = args.flags['json'] === true;
  const caps = getCapabilities();

  if (isJson) {
    printJson({
      engineVersion: caps.engineVersion,
      fhirVersion: caps.fhirVersion,
      modules: Object.fromEntries(
        Object.entries(caps.modules).map(([k, v]) => [k, v.supported]),
      ),
    });
    return EXIT_SUCCESS;
  }

  console.log();
  console.log(bold(`@medxai/fhir-core v${caps.engineVersion}`));
  printKV('FHIR Version', caps.fhirVersion);
  console.log();
  console.log(dim('  Modules:'));

  for (const [name, info] of Object.entries(caps.modules)) {
    const status = info.supported
      ? green('✓') + ' supported' + (info.detail ? dim(` (${info.detail})`) : '')
      : red('✗') + ' not supported';
    console.log(`    ${name.padEnd(14)} ${status}`);
  }

  console.log();
  return EXIT_SUCCESS;
}

export const description = 'Display engine capabilities';
export const usage = 'medxai capabilities [--json]';
