import { Extension } from './Extension';
import { Period } from './Period';

/**
 * FHIR R4 Address
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Address {

  /**
   * Address.id
   */
  id?: string;

  /**
   * Address.extension
   */
  extension?: Extension[];

  /**
   * Address.use
   */
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';

  /**
   * Address.type
   */
  type?: 'postal' | 'physical' | 'both';

  /**
   * Address.text
   */
  text?: string;

  /**
   * Address.line
   */
  line?: string[];

  /**
   * Address.city
   */
  city?: string;

  /**
   * Address.district
   */
  district?: string;

  /**
   * Address.state
   */
  state?: string;

  /**
   * Address.postalCode
   */
  postalCode?: string;

  /**
   * Address.country
   */
  country?: string;

  /**
   * Address.period
   */
  period?: Period;
}
