import { Extension } from './Extension';

/**
 * FHIR R4 Age
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Age {

  /**
   * Age.id
   */
  id?: string;

  /**
   * Age.extension
   */
  extension?: Extension[];

  /**
   * Age.value
   */
  value?: number;

  /**
   * Age.comparator
   */
  comparator?: '<' | '<=' | '>=' | '>';

  /**
   * Age.unit
   */
  unit?: string;

  /**
   * Age.system
   */
  system?: string;

  /**
   * Age.code
   */
  code?: string;
}
