import { Extension } from './Extension';

/**
 * FHIR R4 Distance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Distance {

  /**
   * Distance.id
   */
  id?: string;

  /**
   * Distance.extension
   */
  extension?: Extension[];

  /**
   * Distance.value
   */
  value?: number;

  /**
   * Distance.comparator
   */
  comparator?: '<' | '<=' | '>=' | '>';

  /**
   * Distance.unit
   */
  unit?: string;

  /**
   * Distance.system
   */
  system?: string;

  /**
   * Distance.code
   */
  code?: string;
}
