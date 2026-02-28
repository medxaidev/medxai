/**
 * Strip server-managed meta fields before editing.
 * Prevents 412 Precondition Failed on update.
 * Reference: Medplum cleanResource() pattern.
 */
export function cleanResource(resource: Record<string, any>): Record<string, any> {
  const clone = { ...resource };
  if (clone.meta && typeof clone.meta === 'object') {
    const meta = { ...clone.meta };
    delete meta.versionId;
    delete meta.lastUpdated;
    delete meta.author;
    clone.meta = meta;
  }
  return clone;
}
