import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 HealthcareService
 * @see https://hl7.org/fhir/R4/healthcareservice.html
 */
export interface HealthcareService {

  /**
   * This is a HealthcareService resource
   */
  readonly resourceType: 'HealthcareService';

  /**
   * HealthcareService.id
   */
  id?: string;

  /**
   * HealthcareService.meta
   */
  meta?: Meta;

  /**
   * HealthcareService.implicitRules
   */
  implicitRules?: string;

  /**
   * HealthcareService.language
   */
  language?: string;

  /**
   * HealthcareService.text
   */
  text?: Narrative;

  /**
   * HealthcareService.contained
   */
  contained?: Resource[];

  /**
   * HealthcareService.extension
   */
  extension?: Extension[];

  /**
   * HealthcareService.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * HealthcareService.identifier
   */
  identifier?: Identifier[];

  /**
   * HealthcareService.active
   */
  active?: boolean;

  /**
   * HealthcareService.providedBy
   */
  providedBy?: Reference<Organization>;

  /**
   * HealthcareService.category
   */
  category?: CodeableConcept[];

  /**
   * HealthcareService.type
   */
  type?: CodeableConcept[];

  /**
   * HealthcareService.specialty
   */
  specialty?: CodeableConcept[];

  /**
   * HealthcareService.location
   */
  location?: Reference<Location>[];

  /**
   * HealthcareService.name
   */
  name?: string;

  /**
   * HealthcareService.comment
   */
  comment?: string;

  /**
   * HealthcareService.extraDetails
   */
  extraDetails?: string;

  /**
   * HealthcareService.photo
   */
  photo?: Attachment;

  /**
   * HealthcareService.telecom
   */
  telecom?: ContactPoint[];

  /**
   * HealthcareService.coverageArea
   */
  coverageArea?: Reference<Location>[];

  /**
   * HealthcareService.serviceProvisionCode
   */
  serviceProvisionCode?: CodeableConcept[];

  /**
   * HealthcareService.eligibility
   */
  eligibility?: HealthcareServiceEligibility[];

  /**
   * HealthcareService.program
   */
  program?: CodeableConcept[];

  /**
   * HealthcareService.characteristic
   */
  characteristic?: CodeableConcept[];

  /**
   * HealthcareService.communication
   */
  communication?: CodeableConcept[];

  /**
   * HealthcareService.referralMethod
   */
  referralMethod?: CodeableConcept[];

  /**
   * HealthcareService.appointmentRequired
   */
  appointmentRequired?: boolean;

  /**
   * HealthcareService.availableTime
   */
  availableTime?: HealthcareServiceAvailableTime[];

  /**
   * HealthcareService.notAvailable
   */
  notAvailable?: HealthcareServiceNotAvailable[];

  /**
   * HealthcareService.availabilityExceptions
   */
  availabilityExceptions?: string;

  /**
   * HealthcareService.endpoint
   */
  endpoint?: Reference<Endpoint>[];
}

/**
 * FHIR R4 HealthcareServiceAvailableTime
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface HealthcareServiceAvailableTime {

  /**
   * HealthcareService.availableTime.id
   */
  id?: string;

  /**
   * HealthcareService.availableTime.extension
   */
  extension?: Extension[];

  /**
   * HealthcareService.availableTime.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * HealthcareService.availableTime.daysOfWeek
   */
  daysOfWeek?: string[];

  /**
   * HealthcareService.availableTime.allDay
   */
  allDay?: boolean;

  /**
   * HealthcareService.availableTime.availableStartTime
   */
  availableStartTime?: string;

  /**
   * HealthcareService.availableTime.availableEndTime
   */
  availableEndTime?: string;
}

/**
 * FHIR R4 HealthcareServiceEligibility
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface HealthcareServiceEligibility {

  /**
   * HealthcareService.eligibility.id
   */
  id?: string;

  /**
   * HealthcareService.eligibility.extension
   */
  extension?: Extension[];

  /**
   * HealthcareService.eligibility.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * HealthcareService.eligibility.code
   */
  code?: CodeableConcept;

  /**
   * HealthcareService.eligibility.comment
   */
  comment?: string;
}

/**
 * FHIR R4 HealthcareServiceNotAvailable
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface HealthcareServiceNotAvailable {

  /**
   * HealthcareService.notAvailable.id
   */
  id?: string;

  /**
   * HealthcareService.notAvailable.extension
   */
  extension?: Extension[];

  /**
   * HealthcareService.notAvailable.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * HealthcareService.notAvailable.description
   */
  description: string;

  /**
   * HealthcareService.notAvailable.during
   */
  during?: Period;
}
