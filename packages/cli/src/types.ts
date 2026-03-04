/**
 * @medxai/cli — Shared Types
 */

/** Exit codes per CLI contract */
export const EXIT_SUCCESS = 0;
export const EXIT_FHIR_ERROR = 1;
export const EXIT_USAGE_ERROR = 2;
export const EXIT_ENGINE_CRASH = 3;

/** Parsed CLI arguments */
export interface CliArgs {
  command: string;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

/** Command handler interface */
export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  execute(args: CliArgs): Promise<number>;
}
