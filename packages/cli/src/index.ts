/**
 * @medxai/cli — Programmatic API
 *
 * Exports command handlers for programmatic use (testing, embedding).
 */
export { parseArgv, runCommand } from './cli.js';
export type { CliArgs, CommandHandler } from './types.js';
export { EXIT_SUCCESS, EXIT_FHIR_ERROR, EXIT_USAGE_ERROR, EXIT_ENGINE_CRASH } from './types.js';
