import { Appointment } from './Appointment';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 AppointmentResponse
 * @see https://hl7.org/fhir/R4/appointmentresponse.html
 */
export interface AppointmentResponse {

  /**
   * This is a AppointmentResponse resource
   */
  readonly resourceType: 'AppointmentResponse';

  /**
   * AppointmentResponse.id
   */
  id?: string;

  /**
   * AppointmentResponse.meta
   */
  meta?: Meta;

  /**
   * AppointmentResponse.implicitRules
   */
  implicitRules?: string;

  /**
   * AppointmentResponse.language
   */
  language?: string;

  /**
   * AppointmentResponse.text
   */
  text?: Narrative;

  /**
   * AppointmentResponse.contained
   */
  contained?: Resource[];

  /**
   * AppointmentResponse.extension
   */
  extension?: Extension[];

  /**
   * AppointmentResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AppointmentResponse.identifier
   */
  identifier?: Identifier[];

  /**
   * AppointmentResponse.appointment
   */
  appointment: Reference<Appointment>;

  /**
   * AppointmentResponse.start
   */
  start?: string;

  /**
   * AppointmentResponse.end
   */
  end?: string;

  /**
   * AppointmentResponse.participantType
   */
  participantType?: CodeableConcept[];

  /**
   * AppointmentResponse.actor
   */
  actor?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Device | HealthcareService | Location>;

  /**
   * AppointmentResponse.participantStatus
   */
  participantStatus: string;

  /**
   * AppointmentResponse.comment
   */
  comment?: string;
}
