import { Extension } from './Extension';
import { Identifier } from './Identifier';

/**
 * FHIR R4 Reference
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Reference<T extends Resource = Resource> {

  /**
   * Reference.id
   */
  id?: string;

  /**
   * Reference.extension
   */
  extension?: Extension[];

  /**
   * Reference.reference
   */
  reference?: string;

  /**
   * Reference.type
   */
  type?: string;

  /**
   * Reference.identifier
   */
  identifier?: Identifier;

  /**
   * Reference.display
   */
  display?: string;

  /**
   * Optional Resource referred to by this reference.
   */
  resource?: T;
}
