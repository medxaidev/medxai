import { Coding } from './Coding';
import { Device } from './Device';
import { Extension } from './Extension';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';

/**
 * FHIR R4 Signature
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Signature {

  /**
   * Signature.id
   */
  id?: string;

  /**
   * Signature.extension
   */
  extension?: Extension[];

  /**
   * Signature.type
   */
  type: Coding[];

  /**
   * Signature.when
   */
  when: string;

  /**
   * Signature.who
   */
  who: Reference<Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization>;

  /**
   * Signature.onBehalfOf
   */
  onBehalfOf?: Reference<Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization>;

  /**
   * Signature.targetFormat
   */
  targetFormat?: string;

  /**
   * Signature.sigFormat
   */
  sigFormat?: string;

  /**
   * Signature.data
   */
  data?: string;
}
