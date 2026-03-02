import { Extension } from './Extension';

/**
 * FHIR R4 Coding
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Coding {

  /**
   * Coding.id
   */
  id?: string;

  /**
   * Coding.extension
   */
  extension?: Extension[];

  /**
   * Coding.system
   */
  system?: string;

  /**
   * Coding.version
   */
  version?: string;

  /**
   * Coding.code
   */
  code?: string;

  /**
   * Coding.display
   */
  display?: string;

  /**
   * Coding.userSelected
   */
  userSelected?: boolean;
}
