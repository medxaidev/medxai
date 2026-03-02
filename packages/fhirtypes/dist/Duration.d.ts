import { Extension } from './Extension';

/**
 * FHIR R4 Duration
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Duration {

  /**
   * Duration.id
   */
  id?: string;

  /**
   * Duration.extension
   */
  extension?: Extension[];

  /**
   * Duration.value
   */
  value?: number;

  /**
   * Duration.comparator
   */
  comparator?: '<' | '<=' | '>=' | '>';

  /**
   * Duration.unit
   */
  unit?: string;

  /**
   * Duration.system
   */
  system?: string;

  /**
   * Duration.code
   */
  code?: string;
}
