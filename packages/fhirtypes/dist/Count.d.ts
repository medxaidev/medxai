import { Extension } from './Extension';

/**
 * FHIR R4 Count
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Count {

  /**
   * Count.id
   */
  id?: string;

  /**
   * Count.extension
   */
  extension?: Extension[];

  /**
   * Count.value
   */
  value?: number;

  /**
   * Count.comparator
   */
  comparator?: '<' | '<=' | '>=' | '>';

  /**
   * Count.unit
   */
  unit?: string;

  /**
   * Count.system
   */
  system?: string;

  /**
   * Count.code
   */
  code?: string;
}
