import { Meta } from './Meta';
import { Reference } from './Reference';

/**
 * FHIR R4 Binary
 * @see https://hl7.org/fhir/R4/binary.html
 */
export interface Binary {

  /**
   * This is a Binary resource
   */
  readonly resourceType: 'Binary';

  /**
   * Binary.id
   */
  id?: string;

  /**
   * Binary.meta
   */
  meta?: Meta;

  /**
   * Binary.implicitRules
   */
  implicitRules?: string;

  /**
   * Binary.language
   */
  language?: string;

  /**
   * Binary.contentType
   */
  contentType: string;

  /**
   * Binary.securityContext
   */
  securityContext?: Reference;

  /**
   * Binary.data
   */
  data?: string;
}
