import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';

/**
 * FHIR R4 ContactDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContactDetail {

  /**
   * ContactDetail.id
   */
  id?: string;

  /**
   * ContactDetail.extension
   */
  extension?: Extension[];

  /**
   * ContactDetail.name
   */
  name?: string;

  /**
   * ContactDetail.telecom
   */
  telecom?: ContactPoint[];
}
