import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Quantity } from './Quantity';

/**
 * FHIR R4 ProductShelfLife
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ProductShelfLife {

  /**
   * ProductShelfLife.id
   */
  id?: string;

  /**
   * ProductShelfLife.extension
   */
  extension?: Extension[];

  /**
   * ProductShelfLife.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ProductShelfLife.identifier
   */
  identifier?: Identifier;

  /**
   * ProductShelfLife.type
   */
  type: CodeableConcept;

  /**
   * ProductShelfLife.period
   */
  period: Quantity;

  /**
   * ProductShelfLife.specialPrecautionsForStorage
   */
  specialPrecautionsForStorage?: CodeableConcept[];
}
