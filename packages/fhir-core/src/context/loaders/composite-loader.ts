/**
 * fhir-context — CompositeLoader
 *
 * Chains multiple {@link StructureDefinitionLoader} instances using the
 * chain-of-responsibility pattern. Each loader is tried in order until
 * one returns a non-null result.
 *
 * Conceptually equivalent to HAPI's `ValidationSupportChain`.
 *
 * @module fhir-context
 */

import type { StructureDefinition } from '../../model/index.js';
import type { StructureDefinitionLoader } from '../types.js';
import { LoaderError } from '../errors.js';

/**
 * A loader that delegates to an ordered list of child loaders.
 *
 * Resolution stops at the first loader that returns a non-null result.
 * If a loader throws a {@link LoaderError}, the error is propagated
 * immediately (no fallback for hard failures).
 *
 * @example
 * ```typescript
 * const composite = new CompositeLoader([memoryLoader, fileLoader]);
 * const sd = await composite.load(url);
 * // Tries memoryLoader first, then fileLoader
 * ```
 */
export class CompositeLoader implements StructureDefinitionLoader {
  private readonly _loaders: readonly StructureDefinitionLoader[];

  /**
   * @param loaders - Ordered list of loaders to try. First match wins.
   * @throws Error if loaders array is empty
   */
  constructor(loaders: StructureDefinitionLoader[]) {
    if (loaders.length === 0) {
      throw new Error('CompositeLoader requires at least one child loader');
    }
    this._loaders = loaders;
  }

  async load(url: string): Promise<StructureDefinition | null> {
    for (const loader of this._loaders) {
      try {
        const result = await loader.load(url);
        if (result !== null) {
          return result;
        }
      } catch (err) {
        // Re-throw LoaderError directly (hard failure from a specific loader)
        if (err instanceof LoaderError) {
          throw err;
        }
        // Wrap unexpected errors
        throw new LoaderError(url, loader.getSourceType(), err as Error);
      }
    }
    return null;
  }

  canLoad(url: string): boolean {
    return this._loaders.some((loader) => loader.canLoad(url));
  }

  getSourceType(): string {
    const types = this._loaders.map((l) => l.getSourceType());
    return `composite(${types.join(', ')})`;
  }

  /**
   * Number of child loaders in the chain.
   */
  get loaderCount(): number {
    return this._loaders.length;
  }
}
