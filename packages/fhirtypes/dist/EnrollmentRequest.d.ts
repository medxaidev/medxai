import { Coverage } from './Coverage';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 EnrollmentRequest
 * @see https://hl7.org/fhir/R4/enrollmentrequest.html
 */
export interface EnrollmentRequest {

  /**
   * This is a EnrollmentRequest resource
   */
  readonly resourceType: 'EnrollmentRequest';

  /**
   * EnrollmentRequest.id
   */
  id?: string;

  /**
   * EnrollmentRequest.meta
   */
  meta?: Meta;

  /**
   * EnrollmentRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * EnrollmentRequest.language
   */
  language?: string;

  /**
   * EnrollmentRequest.text
   */
  text?: Narrative;

  /**
   * EnrollmentRequest.contained
   */
  contained?: Resource[];

  /**
   * EnrollmentRequest.extension
   */
  extension?: Extension[];

  /**
   * EnrollmentRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EnrollmentRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * EnrollmentRequest.status
   */
  status?: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * EnrollmentRequest.created
   */
  created?: string;

  /**
   * EnrollmentRequest.insurer
   */
  insurer?: Reference<Organization>;

  /**
   * EnrollmentRequest.provider
   */
  provider?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * EnrollmentRequest.candidate
   */
  candidate?: Reference<Patient>;

  /**
   * EnrollmentRequest.coverage
   */
  coverage?: Reference<Coverage>;
}
