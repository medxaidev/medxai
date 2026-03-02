import { Extension } from './Extension';
import { Quantity } from './Quantity';

/**
 * FHIR R4 Ratio
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Ratio {

  /**
   * Ratio.id
   */
  id?: string;

  /**
   * Ratio.extension
   */
  extension?: Extension[];

  /**
   * Ratio.numerator
   */
  numerator?: Quantity;

  /**
   * Ratio.denominator
   */
  denominator?: Quantity;
}
