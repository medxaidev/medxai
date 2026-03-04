/**
 * @medxai/cli — Engine Runtime
 *
 * Lazy initialization of fhir-core engine components.
 * Loads profiles on demand to keep startup fast.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

import {
  parseFhirJson,
  parseStructureDefinition,
  buildCanonicalProfile,
  StructureValidator,
  SnapshotGenerator,
  FhirContextImpl,
  MemoryLoader,
  loadBundleFromFile,
  evalFhirPath as _evalFhirPath,
  evalFhirPathBoolean as _evalFhirPathBoolean,
} from '@medxai/fhir-core';
import type {
  CanonicalProfile,
  StructureDefinition,
  FhirContext,
  Resource,
  ParseResult,
  ValidationResult,
  SnapshotResult,
} from '@medxai/fhir-core';

// Re-export types for command layer
export type { CanonicalProfile, StructureDefinition, Resource, ParseResult, ValidationResult, SnapshotResult };

/** Cached engine state */
let cachedContext: FhirContext | null = null;
let cachedProfiles: Map<string, CanonicalProfile> | null = null;

/**
 * Read a JSON file and return its raw content as string.
 */
export function readJsonFile(filePath: string): string {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }
  return readFileSync(absPath, 'utf-8');
}

/**
 * Parse a FHIR JSON file.
 */
export function parseFile(filePath: string): ParseResult<Resource> {
  const json = readJsonFile(filePath);
  return parseFhirJson(json);
}

/**
 * Parse a StructureDefinition from a JSON file.
 */
export function parseSDFile(filePath: string): { sd: StructureDefinition; raw: Record<string, unknown> } {
  const json = readJsonFile(filePath);
  const raw = JSON.parse(json) as Record<string, unknown>;
  const result = parseStructureDefinition(raw, 'StructureDefinition');
  if (!result.success) {
    const errors = result.issues.filter((i) => i.severity === 'error');
    throw new Error(`Failed to parse StructureDefinition: ${errors.map((e) => e.message).join('; ')}`);
  }
  return { sd: result.data, raw };
}

/**
 * Load R4 core profiles from a spec directory.
 * Looks for profiles-resources.json and profiles-types.json.
 */
export function loadCoreProfiles(coreDir?: string): Map<string, CanonicalProfile> {
  if (cachedProfiles && !coreDir) return cachedProfiles;

  const profiles = new Map<string, CanonicalProfile>();

  if (!coreDir) {
    // Try to find spec dir relative to common locations
    const candidates = [
      resolve(process.cwd(), 'spec', 'fhir', 'r4'),
      resolve(process.cwd(), '..', 'spec', 'fhir', 'r4'),
      resolve(process.cwd(), '..', '..', 'spec', 'fhir', 'r4'),
    ];
    coreDir = candidates.find((d) => existsSync(join(d, 'profiles-resources.json')));
  }

  if (!coreDir || !existsSync(join(coreDir, 'profiles-resources.json'))) {
    return profiles;
  }

  // Load profiles-resources.json
  const resourcesPath = join(coreDir, 'profiles-resources.json');
  try {
    const result = loadBundleFromFile(resourcesPath, {
      filterKind: 'resource',
      excludeAbstract: true,
    });
    for (const profile of result.profiles) {
      if (profile.url) profiles.set(profile.url, profile);
      if (profile.type) profiles.set(profile.type, profile);
    }
  } catch {
    // Silently skip if load fails
  }

  // Load profiles-types.json if available
  const typesPath = join(coreDir, 'profiles-types.json');
  if (existsSync(typesPath)) {
    try {
      const result = loadBundleFromFile(typesPath);
      for (const profile of result.profiles) {
        if (profile.url) profiles.set(profile.url, profile);
        if (profile.type) profiles.set(profile.type, profile);
      }
    } catch {
      // Silently skip
    }
  }

  if (!coreDir) {
    cachedProfiles = profiles;
  }
  return profiles;
}

/**
 * Build a CanonicalProfile from a StructureDefinition.
 */
export function buildProfile(sd: StructureDefinition): CanonicalProfile {
  return buildCanonicalProfile(sd);
}

/**
 * Resolve a profile for validation:
 * - If --profile is a file path, load and build it
 * - If --profile is a URL, look up in core profiles
 * - If no --profile, use the resource's resourceType to find a base profile
 */
export function resolveProfile(
  profileArg: string | undefined,
  resourceType: string,
  coreDir?: string,
): CanonicalProfile | undefined {
  const coreProfiles = loadCoreProfiles(coreDir);

  if (profileArg) {
    // Try as file path first
    if (existsSync(resolve(profileArg))) {
      try {
        const { sd } = parseSDFile(profileArg);
        return buildCanonicalProfile(sd);
      } catch {
        // Fall through to URL lookup
      }
    }
    // Try as canonical URL
    return coreProfiles.get(profileArg);
  }

  // Fallback: match by resourceType
  return coreProfiles.get(resourceType) ??
    coreProfiles.get(`http://hl7.org/fhir/StructureDefinition/${resourceType}`);
}

/**
 * Create a StructureValidator instance.
 */
export function createValidator(): StructureValidator {
  return new StructureValidator({
    skipInvariants: true,
    validateSlicing: false,
  });
}

/**
 * Load raw StructureDefinitions from a FHIR Bundle JSON file.
 * Returns a Map of canonical URL → parsed StructureDefinition.
 */
function loadRawSDsFromBundle(filePath: string): Map<string, StructureDefinition> {
  const map = new Map<string, StructureDefinition>();
  const raw = readFileSync(filePath, 'utf-8');
  const bundle = JSON.parse(raw) as { resourceType?: string; entry?: Array<{ resource?: Record<string, unknown> }> };

  if (bundle.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) return map;

  for (const entry of bundle.entry) {
    const res = entry.resource;
    if (!res || res['resourceType'] !== 'StructureDefinition') continue;
    try {
      const parseResult = parseStructureDefinition(res, 'StructureDefinition');
      if (parseResult.success && parseResult.data) {
        const url = parseResult.data.url;
        if (url) map.set(url, parseResult.data);
      }
    } catch {
      // Skip unparseable SDs
    }
  }
  return map;
}

/**
 * Create a FhirContext for snapshot generation.
 * When coreDir is provided, loads profiles-resources.json and profiles-types.json
 * as raw StructureDefinitions into a MemoryLoader so the context can resolve base SDs.
 */
export async function createContext(coreDir?: string): Promise<FhirContext> {
  if (cachedContext && !coreDir) return cachedContext;

  const sdMap = new Map<string, StructureDefinition>();

  // Load core SDs from the spec directory if provided
  if (coreDir) {
    const resourcesPath = join(coreDir, 'profiles-resources.json');
    const typesPath = join(coreDir, 'profiles-types.json');
    if (existsSync(resourcesPath)) {
      const sds = loadRawSDsFromBundle(resourcesPath);
      sds.forEach((sd, url) => sdMap.set(url, sd));
    }
    if (existsSync(typesPath)) {
      const sds = loadRawSDsFromBundle(typesPath);
      sds.forEach((sd, url) => sdMap.set(url, sd));
    }
  }

  const memLoader = new MemoryLoader(sdMap);
  const ctx = new FhirContextImpl({ loaders: [memLoader] });

  if (!coreDir) {
    // Try to preload core definitions (may not be available without coreDir)
    try {
      await ctx.preloadCoreDefinitions();
    } catch {
      // Core definitions may not be available
    }
    cachedContext = ctx;
  }

  return ctx;
}

/**
 * Generate a snapshot for a StructureDefinition.
 */
export async function generateSnapshot(
  sd: StructureDefinition,
  coreDir?: string,
): Promise<SnapshotResult> {
  const ctx = await createContext(coreDir);
  const generator = new SnapshotGenerator(ctx, {
    throwOnError: false,
    generateCanonical: true,
  });
  return generator.generate(sd);
}

// ---- FHIRPath wrappers ----

/**
 * Evaluate a FHIRPath expression against a resource.
 */
export function evaluateFhirPath(expression: string, resource: unknown): unknown[] {
  return _evalFhirPath(expression, resource);
}

/**
 * Evaluate a FHIRPath expression as a boolean.
 */
export function evaluateFhirPathBoolean(expression: string, resource: unknown): boolean {
  return _evalFhirPathBoolean(expression, resource);
}
