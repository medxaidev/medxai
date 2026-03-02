import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { ImmunizationRecommendation } from './ImmunizationRecommendation';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Slot } from './Slot';

/**
 * FHIR R4 Appointment
 * @see https://hl7.org/fhir/R4/appointment.html
 */
export interface Appointment {

  /**
   * This is a Appointment resource
   */
  readonly resourceType: 'Appointment';

  /**
   * Appointment.id
   */
  id?: string;

  /**
   * Appointment.meta
   */
  meta?: Meta;

  /**
   * Appointment.implicitRules
   */
  implicitRules?: string;

  /**
   * Appointment.language
   */
  language?: string;

  /**
   * Appointment.text
   */
  text?: Narrative;

  /**
   * Appointment.contained
   */
  contained?: Resource[];

  /**
   * Appointment.extension
   */
  extension?: Extension[];

  /**
   * Appointment.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Appointment.identifier
   */
  identifier?: Identifier[];

  /**
   * Appointment.status
   */
  status: string;

  /**
   * Appointment.cancelationReason
   */
  cancelationReason?: CodeableConcept;

  /**
   * Appointment.serviceCategory
   */
  serviceCategory?: CodeableConcept[];

  /**
   * Appointment.serviceType
   */
  serviceType?: CodeableConcept[];

  /**
   * Appointment.specialty
   */
  specialty?: CodeableConcept[];

  /**
   * Appointment.appointmentType
   */
  appointmentType?: CodeableConcept;

  /**
   * Appointment.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Appointment.reasonReference
   */
  reasonReference?: Reference<Condition | Procedure | Observation | ImmunizationRecommendation>[];

  /**
   * Appointment.priority
   */
  priority?: number;

  /**
   * Appointment.description
   */
  description?: string;

  /**
   * Appointment.supportingInformation
   */
  supportingInformation?: Reference[];

  /**
   * Appointment.start
   */
  start?: string;

  /**
   * Appointment.end
   */
  end?: string;

  /**
   * Appointment.minutesDuration
   */
  minutesDuration?: number;

  /**
   * Appointment.slot
   */
  slot?: Reference<Slot>[];

  /**
   * Appointment.created
   */
  created?: string;

  /**
   * Appointment.comment
   */
  comment?: string;

  /**
   * Appointment.patientInstruction
   */
  patientInstruction?: string;

  /**
   * Appointment.basedOn
   */
  basedOn?: Reference<ServiceRequest>[];

  /**
   * Appointment.participant
   */
  participant: AppointmentParticipant[];

  /**
   * Appointment.requestedPeriod
   */
  requestedPeriod?: Period[];
}

/**
 * FHIR R4 AppointmentParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AppointmentParticipant {

  /**
   * Appointment.participant.id
   */
  id?: string;

  /**
   * Appointment.participant.extension
   */
  extension?: Extension[];

  /**
   * Appointment.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Appointment.participant.type
   */
  type?: CodeableConcept[];

  /**
   * Appointment.participant.actor
   */
  actor?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Device | HealthcareService | Location>;

  /**
   * Appointment.participant.required
   */
  required?: string;

  /**
   * Appointment.participant.status
   */
  status: string;

  /**
   * Appointment.participant.period
   */
  period?: Period;
}
