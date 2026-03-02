import { Extension } from './Extension';
import { Quantity } from './Quantity';

/**
 * FHIR R4 Range
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Range {

  /**
   * Range.id
   */
  id?: string;

  /**
   * Range.extension
   */
  extension?: Extension[];

  /**
   * Range.low
   */
  low?: Quantity;

  /**
   * Range.high
   */
  high?: Quantity;
}
