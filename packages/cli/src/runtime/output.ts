/**
 * @medxai/cli — Output Formatting
 *
 * Human-readable and JSON output formatters.
 * Zero external dependencies — uses Node.js built-in APIs only.
 */

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

const isColorEnabled = process.stdout.isTTY !== false && !process.env['NO_COLOR'];

function color(code: string, text: string): string {
  return isColorEnabled ? `${code}${text}${RESET}` : text;
}

export function bold(text: string): string {
  return color(BOLD, text);
}

export function green(text: string): string {
  return color(GREEN, text);
}

export function red(text: string): string {
  return color(RED, text);
}

export function yellow(text: string): string {
  return color(YELLOW, text);
}

export function cyan(text: string): string {
  return color(CYAN, text);
}

export function dim(text: string): string {
  return color(DIM, text);
}

export function successMark(): string {
  return green('✓');
}

export function failMark(): string {
  return red('✗');
}

export function warnMark(): string {
  return yellow('⚠');
}

/** Print a labeled key-value pair */
export function printKV(key: string, value: string, indent = 2): void {
  const pad = ' '.repeat(indent);
  console.log(`${pad}${dim(key + ':')}  ${value}`);
}

/** Print JSON to stdout */
export function printJson(obj: unknown): void {
  console.log(JSON.stringify(obj, null, 2));
}

/** Print severity-colored issue line */
export function printIssue(severity: string, path: string | undefined, message: string): void {
  const tag =
    severity === 'error' ? red('ERROR')
    : severity === 'warning' ? yellow('WARN')
    : dim('INFO');
  const pathStr = path ? cyan(path) : '';
  console.log(`  ${tag}  ${pathStr}  ${message}`);
}
