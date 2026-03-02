import { Extension } from './Extension';

/**
 * FHIR R4 Element
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Element {

  /**
   * Element.id
   */
  id?: string;

  /**
   * Element.extension
   */
  extension?: Extension[];
}
