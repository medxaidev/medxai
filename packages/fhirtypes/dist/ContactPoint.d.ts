import { Extension } from './Extension';
import { Period } from './Period';

/**
 * FHIR R4 ContactPoint
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContactPoint {

  /**
   * ContactPoint.id
   */
  id?: string;

  /**
   * ContactPoint.extension
   */
  extension?: Extension[];

  /**
   * ContactPoint.system
   */
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';

  /**
   * ContactPoint.value
   */
  value?: string;

  /**
   * ContactPoint.use
   */
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';

  /**
   * ContactPoint.rank
   */
  rank?: number;

  /**
   * ContactPoint.period
   */
  period?: Period;
}
