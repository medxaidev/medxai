import { Coding } from './Coding';
import { Extension } from './Extension';

/**
 * FHIR R4 CodeableConcept
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CodeableConcept {

  /**
   * CodeableConcept.id
   */
  id?: string;

  /**
   * CodeableConcept.extension
   */
  extension?: Extension[];

  /**
   * CodeableConcept.coding
   */
  coding?: Coding[];

  /**
   * CodeableConcept.text
   */
  text?: string;
}
