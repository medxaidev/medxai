import { Extension } from './Extension';

/**
 * FHIR R4 BackboneElement
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BackboneElement {

  /**
   * BackboneElement.id
   */
  id?: string;

  /**
   * BackboneElement.extension
   */
  extension?: Extension[];

  /**
   * BackboneElement.modifierExtension
   */
  modifierExtension?: Extension[];
}
