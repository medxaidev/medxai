import { Extension } from './Extension';

/**
 * FHIR R4 MoneyQuantity
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MoneyQuantity {

  /**
   * Quantity.id
   */
  id?: string;

  /**
   * Quantity.extension
   */
  extension?: Extension[];

  /**
   * Quantity.value
   */
  value?: number;

  /**
   * Quantity.comparator
   */
  comparator?: '<' | '<=' | '>=' | '>';

  /**
   * Quantity.unit
   */
  unit?: string;

  /**
   * Quantity.system
   */
  system?: string;

  /**
   * Quantity.code
   */
  code?: string;
}
