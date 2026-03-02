import { Extension } from './Extension';

/**
 * FHIR R4 Period
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Period {

  /**
   * Period.id
   */
  id?: string;

  /**
   * Period.extension
   */
  extension?: Extension[];

  /**
   * Period.start
   */
  start?: string;

  /**
   * Period.end
   */
  end?: string;
}
