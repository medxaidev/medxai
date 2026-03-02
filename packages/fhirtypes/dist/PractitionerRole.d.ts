import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 PractitionerRole
 * @see https://hl7.org/fhir/R4/practitionerrole.html
 */
export interface PractitionerRole {

  /**
   * This is a PractitionerRole resource
   */
  readonly resourceType: 'PractitionerRole';

  /**
   * PractitionerRole.id
   */
  id?: string;

  /**
   * PractitionerRole.meta
   */
  meta?: Meta;

  /**
   * PractitionerRole.implicitRules
   */
  implicitRules?: string;

  /**
   * PractitionerRole.language
   */
  language?: string;

  /**
   * PractitionerRole.text
   */
  text?: Narrative;

  /**
   * PractitionerRole.contained
   */
  contained?: Resource[];

  /**
   * PractitionerRole.extension
   */
  extension?: Extension[];

  /**
   * PractitionerRole.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PractitionerRole.identifier
   */
  identifier?: Identifier[];

  /**
   * PractitionerRole.active
   */
  active?: boolean;

  /**
   * PractitionerRole.period
   */
  period?: Period;

  /**
   * PractitionerRole.practitioner
   */
  practitioner?: Reference<Practitioner>;

  /**
   * PractitionerRole.organization
   */
  organization?: Reference<Organization>;

  /**
   * PractitionerRole.code
   */
  code?: CodeableConcept[];

  /**
   * PractitionerRole.specialty
   */
  specialty?: CodeableConcept[];

  /**
   * PractitionerRole.location
   */
  location?: Reference<Location>[];

  /**
   * PractitionerRole.healthcareService
   */
  healthcareService?: Reference<HealthcareService>[];

  /**
   * PractitionerRole.telecom
   */
  telecom?: ContactPoint[];

  /**
   * PractitionerRole.availableTime
   */
  availableTime?: PractitionerRoleAvailableTime[];

  /**
   * PractitionerRole.notAvailable
   */
  notAvailable?: PractitionerRoleNotAvailable[];

  /**
   * PractitionerRole.availabilityExceptions
   */
  availabilityExceptions?: string;

  /**
   * PractitionerRole.endpoint
   */
  endpoint?: Reference<Endpoint>[];
}

/**
 * FHIR R4 PractitionerRoleAvailableTime
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PractitionerRoleAvailableTime {

  /**
   * PractitionerRole.availableTime.id
   */
  id?: string;

  /**
   * PractitionerRole.availableTime.extension
   */
  extension?: Extension[];

  /**
   * PractitionerRole.availableTime.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PractitionerRole.availableTime.daysOfWeek
   */
  daysOfWeek?: string[];

  /**
   * PractitionerRole.availableTime.allDay
   */
  allDay?: boolean;

  /**
   * PractitionerRole.availableTime.availableStartTime
   */
  availableStartTime?: string;

  /**
   * PractitionerRole.availableTime.availableEndTime
   */
  availableEndTime?: string;
}

/**
 * FHIR R4 PractitionerRoleNotAvailable
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PractitionerRoleNotAvailable {

  /**
   * PractitionerRole.notAvailable.id
   */
  id?: string;

  /**
   * PractitionerRole.notAvailable.extension
   */
  extension?: Extension[];

  /**
   * PractitionerRole.notAvailable.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PractitionerRole.notAvailable.description
   */
  description: string;

  /**
   * PractitionerRole.notAvailable.during
   */
  during?: Period;
}
