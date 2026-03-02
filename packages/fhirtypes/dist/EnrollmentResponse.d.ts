import { EnrollmentRequest } from './EnrollmentRequest';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 EnrollmentResponse
 * @see https://hl7.org/fhir/R4/enrollmentresponse.html
 */
export interface EnrollmentResponse {

  /**
   * This is a EnrollmentResponse resource
   */
  readonly resourceType: 'EnrollmentResponse';

  /**
   * EnrollmentResponse.id
   */
  id?: string;

  /**
   * EnrollmentResponse.meta
   */
  meta?: Meta;

  /**
   * EnrollmentResponse.implicitRules
   */
  implicitRules?: string;

  /**
   * EnrollmentResponse.language
   */
  language?: string;

  /**
   * EnrollmentResponse.text
   */
  text?: Narrative;

  /**
   * EnrollmentResponse.contained
   */
  contained?: Resource[];

  /**
   * EnrollmentResponse.extension
   */
  extension?: Extension[];

  /**
   * EnrollmentResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EnrollmentResponse.identifier
   */
  identifier?: Identifier[];

  /**
   * EnrollmentResponse.status
   */
  status?: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * EnrollmentResponse.request
   */
  request?: Reference<EnrollmentRequest>;

  /**
   * EnrollmentResponse.outcome
   */
  outcome?: string;

  /**
   * EnrollmentResponse.disposition
   */
  disposition?: string;

  /**
   * EnrollmentResponse.created
   */
  created?: string;

  /**
   * EnrollmentResponse.organization
   */
  organization?: Reference<Organization>;

  /**
   * EnrollmentResponse.requestProvider
   */
  requestProvider?: Reference<Practitioner | PractitionerRole | Organization>;
}
