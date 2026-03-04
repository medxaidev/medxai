/**
 * @medxai/cli — Binary Entry Point
 *
 * Parses process.argv and dispatches to the appropriate command handler.
 * Zero external dependencies — uses Node.js built-in APIs only.
 */
import { EXIT_USAGE_ERROR, EXIT_ENGINE_CRASH } from '../types.js';
import type { CliArgs } from '../types.js';
import { bold, dim } from '../runtime/output.js';

import * as parseCmd from '../commands/parse.js';
import * as snapshotCmd from '../commands/snapshot.js';
import * as validateCmd from '../commands/validate.js';
import * as evaluateCmd from '../commands/evaluate.js';
import * as capabilitiesCmd from '../commands/capabilities.js';

const VERSION = '0.1.0';

const COMMANDS: Record<string, { execute: (args: CliArgs) => Promise<number>; description: string; usage: string }> = {
  parse: parseCmd,
  snapshot: snapshotCmd,
  validate: validateCmd,
  evaluate: evaluateCmd,
  capabilities: capabilitiesCmd,
};

/**
 * Parse process.argv into a structured CliArgs object.
 *
 * Supports:
 *   --flag           → { flag: true }
 *   --key value      → { key: "value" }
 *   --key=value      → { key: "value" }
 *   positional args  → positionals[]
 */
function parseArgv(argv: string[]): CliArgs {
  // Skip node and script path
  const raw = argv.slice(2);
  const command = raw[0] ?? '';
  const rest = raw.slice(1);

  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  let i = 0;
  while (i < rest.length) {
    const arg = rest[i]!;

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        // --key=value
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        const key = arg.slice(2);
        const next = rest[i + 1];
        if (next && !next.startsWith('--')) {
          // --key value  (only if next is not a flag)
          // But for boolean flags like --json, --pretty, --silent, --boolean, we want true
          const booleanFlags = ['json', 'pretty', 'silent', 'boolean', 'help', 'version'];
          if (booleanFlags.includes(key)) {
            flags[key] = true;
          } else {
            flags[key] = next;
            i++;
          }
        } else {
          flags[key] = true;
        }
      }
    } else {
      positionals.push(arg);
    }
    i++;
  }

  return { command, positionals, flags };
}

function printHelp(): void {
  console.log();
  console.log(bold('@medxai/cli') + dim(` v${VERSION}`) + ' — FHIR Engine Operational Console');
  console.log();
  console.log('Usage: medxai <command> [options]');
  console.log();
  console.log('Commands:');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(16)} ${cmd.description}`);
  }
  console.log();
  console.log('Global Options:');
  console.log('  --help           Show help');
  console.log('  --version        Show version');
  console.log('  --json           Machine-readable JSON output');
  console.log();
  console.log('Examples:');
  console.log('  medxai parse Patient.json');
  console.log('  medxai validate Patient.json --profile us-core-patient.json');
  console.log('  medxai evaluate "Patient.name.family" Patient.json');
  console.log('  medxai snapshot us-core-patient.json --output snapshot.json');
  console.log('  medxai capabilities --json');
  console.log();
}

async function main(): Promise<void> {
  const args = parseArgv(process.argv);

  // --version
  if (args.flags['version'] === true || args.command === '--version') {
    console.log(VERSION);
    process.exit(0);
  }

  // --help or no command
  if (args.flags['help'] === true || args.command === '--help' || args.command === 'help' || !args.command) {
    printHelp();
    process.exit(0);
  }

  // Look up command
  const cmd = COMMANDS[args.command];
  if (!cmd) {
    console.error(`Unknown command: ${args.command}`);
    console.error('Run "medxai --help" for available commands.');
    process.exit(EXIT_USAGE_ERROR);
  }

  try {
    const exitCode = await cmd.execute(args);
    process.exit(exitCode);
  } catch (err) {
    console.error(`Engine crash: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(EXIT_ENGINE_CRASH);
  }
}

main();
