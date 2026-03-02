import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Schedule
 * @see https://hl7.org/fhir/R4/schedule.html
 */
export interface Schedule {

  /**
   * This is a Schedule resource
   */
  readonly resourceType: 'Schedule';

  /**
   * Schedule.id
   */
  id?: string;

  /**
   * Schedule.meta
   */
  meta?: Meta;

  /**
   * Schedule.implicitRules
   */
  implicitRules?: string;

  /**
   * Schedule.language
   */
  language?: string;

  /**
   * Schedule.text
   */
  text?: Narrative;

  /**
   * Schedule.contained
   */
  contained?: Resource[];

  /**
   * Schedule.extension
   */
  extension?: Extension[];

  /**
   * Schedule.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Schedule.identifier
   */
  identifier?: Identifier[];

  /**
   * Schedule.active
   */
  active?: boolean;

  /**
   * Schedule.serviceCategory
   */
  serviceCategory?: CodeableConcept[];

  /**
   * Schedule.serviceType
   */
  serviceType?: CodeableConcept[];

  /**
   * Schedule.specialty
   */
  specialty?: CodeableConcept[];

  /**
   * Schedule.actor
   */
  actor: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Device | HealthcareService | Location>[];

  /**
   * Schedule.planningHorizon
   */
  planningHorizon?: Period;

  /**
   * Schedule.comment
   */
  comment?: string;
}
