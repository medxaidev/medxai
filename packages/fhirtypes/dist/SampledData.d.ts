import { Extension } from './Extension';
import { Quantity } from './Quantity';

/**
 * FHIR R4 SampledData
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SampledData {

  /**
   * SampledData.id
   */
  id?: string;

  /**
   * SampledData.extension
   */
  extension?: Extension[];

  /**
   * SampledData.origin
   */
  origin: Quantity;

  /**
   * SampledData.period
   */
  period: number;

  /**
   * SampledData.factor
   */
  factor?: number;

  /**
   * SampledData.lowerLimit
   */
  lowerLimit?: number;

  /**
   * SampledData.upperLimit
   */
  upperLimit?: number;

  /**
   * SampledData.dimensions
   */
  dimensions: number;

  /**
   * SampledData.data
   */
  data?: string;
}
