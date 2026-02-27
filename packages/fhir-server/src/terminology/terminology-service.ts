/**
 * Terminology Service
 *
 * Implements FHIR terminology operations:
 * - $expand — expand a ValueSet into a flat list of codes
 * - $validate-code — check if a code belongs to a CodeSystem or ValueSet
 * - $lookup — retrieve details about a code in a CodeSystem
 *
 * Uses the standard FHIR CRUD via ResourceRepository to read
 * CodeSystem and ValueSet resources.
 *
 * @module fhir-server/terminology
 */

import type { ResourceRepository } from "@medxai/fhir-persistence";

// =============================================================================
// Section 1: Types
// =============================================================================

/**
 * A concept in a CodeSystem or ValueSet expansion.
 */
export interface Coding {
  system?: string;
  code: string;
  display?: string;
  version?: string;
}

/**
 * Result of a $expand operation.
 */
export interface ExpandResult {
  url?: string;
  name?: string;
  total: number;
  contains: Coding[];
}

/**
 * Result of a $validate-code operation.
 */
export interface ValidateCodeResult {
  result: boolean;
  display?: string;
  message?: string;
}

/**
 * Result of a $lookup operation.
 */
export interface LookupResult {
  name: string;
  display?: string;
  property?: Array<{ code: string; value: unknown }>;
}

// =============================================================================
// Section 2: Terminology Service
// =============================================================================

export class TerminologyService {
  constructor(private readonly repo: ResourceRepository) { }

  // ── $expand ──────────────────────────────────────────────────────────────

  /**
   * Expand a ValueSet by ID.
   */
  async expandById(id: string, filter?: string): Promise<ExpandResult> {
    const vs = await this.repo.readResource("ValueSet", id);
    return this.expandValueSet(vs as any, filter);
  }

  /**
   * Expand a ValueSet by canonical URL.
   */
  async expandByUrl(url: string, filter?: string): Promise<ExpandResult> {
    const result = await this.repo.searchResources({
      resourceType: "ValueSet",
      params: [{ code: "url", values: [url] }],
      count: 1,
    });
    if (result.resources.length === 0) {
      throw new TerminologyError(404, `ValueSet not found: ${url}`);
    }
    return this.expandValueSet(result.resources[0] as any, filter);
  }

  /**
   * Expand a ValueSet resource into a flat coding list.
   */
  private async expandValueSet(
    vs: Record<string, any>,
    filter?: string,
  ): Promise<ExpandResult> {
    const contains: Coding[] = [];

    // 1. If the ValueSet has an expansion, use it directly
    if (vs.expansion?.contains) {
      for (const c of vs.expansion.contains) {
        contains.push({
          system: c.system,
          code: c.code,
          display: c.display,
          version: c.version,
        });
      }
    }

    // 2. Process compose.include
    if (vs.compose?.include) {
      for (const include of vs.compose.include) {
        const system = include.system as string | undefined;

        // Direct concept list
        if (include.concept) {
          for (const c of include.concept) {
            contains.push({
              system,
              code: c.code,
              display: c.display,
            });
          }
        }

        // If no concept list but has a system, try to load all codes from CodeSystem
        if (!include.concept && system) {
          const csCodes = await this.getCodeSystemCodes(system);
          contains.push(...csCodes);
        }
      }
    }

    // 3. Apply filter if provided
    let filtered = contains;
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = contains.filter(
        (c) =>
          c.code.toLowerCase().includes(lowerFilter) ||
          (c.display?.toLowerCase().includes(lowerFilter) ?? false),
      );
    }

    return {
      url: vs.url,
      name: vs.name,
      total: filtered.length,
      contains: filtered,
    };
  }

  // ── $validate-code ───────────────────────────────────────────────────────

  /**
   * Validate a code against a CodeSystem by ID.
   */
  async validateCodeById(
    id: string,
    code: string,
    system?: string,
  ): Promise<ValidateCodeResult> {
    const cs = await this.repo.readResource("CodeSystem", id);
    return this.validateInCodeSystem(cs as any, code, system);
  }

  /**
   * Validate a code against a CodeSystem by URL.
   */
  async validateCodeByUrl(
    url: string,
    code: string,
  ): Promise<ValidateCodeResult> {
    const result = await this.repo.searchResources({
      resourceType: "CodeSystem",
      params: [{ code: "url", values: [url] }],
      count: 1,
    });
    if (result.resources.length === 0) {
      throw new TerminologyError(404, `CodeSystem not found: ${url}`);
    }
    return this.validateInCodeSystem(result.resources[0] as any, code);
  }

  /**
   * Validate a code against a ValueSet by ID.
   */
  async validateCodeInValueSetById(
    id: string,
    code: string,
    system?: string,
  ): Promise<ValidateCodeResult> {
    const expansion = await this.expandById(id);
    const match = expansion.contains.find(
      (c) => c.code === code && (!system || c.system === system),
    );
    return {
      result: !!match,
      display: match?.display,
      message: match ? undefined : `Code '${code}' not found in ValueSet`,
    };
  }

  private validateInCodeSystem(
    cs: Record<string, any>,
    code: string,
    system?: string,
  ): ValidateCodeResult {
    if (system && cs.url && cs.url !== system) {
      return {
        result: false,
        message: `CodeSystem URL mismatch: expected ${system}, got ${cs.url}`,
      };
    }

    const found = this.findConcept(cs.concept, code);
    return {
      result: !!found,
      display: found?.display,
      message: found ? undefined : `Code '${code}' not found in CodeSystem '${cs.url ?? cs.id}'`,
    };
  }

  // ── $lookup ──────────────────────────────────────────────────────────────

  /**
   * Lookup a code in a CodeSystem by ID.
   */
  async lookupById(
    id: string,
    code: string,
  ): Promise<LookupResult> {
    const cs = await this.repo.readResource("CodeSystem", id);
    return this.lookupInCodeSystem(cs as any, code);
  }

  /**
   * Lookup a code in a CodeSystem by URL.
   */
  async lookupByUrl(
    system: string,
    code: string,
  ): Promise<LookupResult> {
    const result = await this.repo.searchResources({
      resourceType: "CodeSystem",
      params: [{ code: "url", values: [system] }],
      count: 1,
    });
    if (result.resources.length === 0) {
      throw new TerminologyError(404, `CodeSystem not found: ${system}`);
    }
    return this.lookupInCodeSystem(result.resources[0] as any, code);
  }

  private lookupInCodeSystem(
    cs: Record<string, any>,
    code: string,
  ): LookupResult {
    const found = this.findConcept(cs.concept, code);
    if (!found) {
      throw new TerminologyError(
        404,
        `Code '${code}' not found in CodeSystem '${cs.url ?? cs.id}'`,
      );
    }

    const properties: Array<{ code: string; value: unknown }> = [];
    if (found.property) {
      for (const p of found.property) {
        properties.push({
          code: p.code,
          value: p.valueString ?? p.valueCoding ?? p.valueCode ?? p.valueBoolean ?? p.valueInteger,
        });
      }
    }

    return {
      name: cs.name ?? cs.title ?? cs.id,
      display: found.display,
      property: properties.length > 0 ? properties : undefined,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Find a concept in a (possibly hierarchical) concept list.
   */
  private findConcept(
    concepts: any[] | undefined,
    code: string,
  ): Record<string, any> | undefined {
    if (!concepts) return undefined;
    for (const c of concepts) {
      if (c.code === code) return c;
      // Recurse into children
      if (c.concept) {
        const found = this.findConcept(c.concept, code);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Load all codes from a CodeSystem by its URL.
   */
  private async getCodeSystemCodes(systemUrl: string): Promise<Coding[]> {
    try {
      const result = await this.repo.searchResources({
        resourceType: "CodeSystem",
        params: [{ code: "url", values: [systemUrl] }],
        count: 1,
      });
      if (result.resources.length === 0) return [];

      const cs = result.resources[0] as Record<string, any>;
      return this.flattenConcepts(cs.concept, systemUrl);
    } catch {
      return [];
    }
  }

  /**
   * Flatten a hierarchical concept tree into a flat list.
   */
  private flattenConcepts(
    concepts: any[] | undefined,
    system: string,
  ): Coding[] {
    if (!concepts) return [];
    const result: Coding[] = [];
    for (const c of concepts) {
      result.push({ system, code: c.code, display: c.display });
      if (c.concept) {
        result.push(...this.flattenConcepts(c.concept, system));
      }
    }
    return result;
  }
}

// =============================================================================
// Section 3: Error
// =============================================================================

export class TerminologyError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "TerminologyError";
    this.status = status;
  }
}
