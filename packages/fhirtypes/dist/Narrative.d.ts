import { Extension } from './Extension';

/**
 * FHIR R4 Narrative
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Narrative {

  /**
   * Narrative.id
   */
  id?: string;

  /**
   * Narrative.extension
   */
  extension?: Extension[];

  /**
   * Narrative.status
   */
  status: 'generated' | 'extensions' | 'additional' | 'empty';

  /**
   * Narrative.div
   */
  div: string;
}
