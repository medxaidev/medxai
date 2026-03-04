/**
 * @medxai/cli — Programmatic CLI Runner
 *
 * Provides parseArgv and runCommand for programmatic use and testing.
 */
import type { CliArgs } from './types.js';
import { EXIT_USAGE_ERROR, EXIT_ENGINE_CRASH } from './types.js';

import * as parseCmd from './commands/parse.js';
import * as snapshotCmd from './commands/snapshot.js';
import * as validateCmd from './commands/validate.js';
import * as evaluateCmd from './commands/evaluate.js';
import * as capabilitiesCmd from './commands/capabilities.js';

const COMMANDS: Record<string, { execute: (args: CliArgs) => Promise<number>; description: string; usage: string }> = {
  parse: parseCmd,
  snapshot: snapshotCmd,
  validate: validateCmd,
  evaluate: evaluateCmd,
  capabilities: capabilitiesCmd,
};

/**
 * Parse an argv-style array into structured CliArgs.
 * Input should be the full process.argv (node, script, command, ...args).
 */
export function parseArgv(argv: string[]): CliArgs {
  const raw = argv.slice(2);
  const command = raw[0] ?? '';
  const rest = raw.slice(1);

  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  const booleanFlags = ['json', 'pretty', 'silent', 'boolean', 'help', 'version'];

  let i = 0;
  while (i < rest.length) {
    const arg = rest[i]!;

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        const key = arg.slice(2);
        const next = rest[i + 1];
        if (next && !next.startsWith('--') && !booleanFlags.includes(key)) {
          flags[key] = next;
          i++;
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

/**
 * Run a CLI command programmatically. Returns exit code.
 */
export async function runCommand(args: CliArgs): Promise<number> {
  const cmd = COMMANDS[args.command];
  if (!cmd) {
    return EXIT_USAGE_ERROR;
  }

  try {
    return await cmd.execute(args);
  } catch {
    return EXIT_ENGINE_CRASH;
  }
}
