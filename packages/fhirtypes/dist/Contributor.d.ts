import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';

/**
 * FHIR R4 Contributor
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Contributor {

  /**
   * Contributor.id
   */
  id?: string;

  /**
   * Contributor.extension
   */
  extension?: Extension[];

  /**
   * Contributor.type
   */
  type: string;

  /**
   * Contributor.name
   */
  name: string;

  /**
   * Contributor.contact
   */
  contact?: ContactDetail[];
}
