import { Account } from './Account';
import { Appointment } from './Appointment';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Condition } from './Condition';
import { Duration } from './Duration';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { ImmunizationRecommendation } from './ImmunizationRecommendation';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';

/**
 * FHIR R4 Encounter
 * @see https://hl7.org/fhir/R4/encounter.html
 */
export interface Encounter {

  /**
   * This is a Encounter resource
   */
  readonly resourceType: 'Encounter';

  /**
   * Encounter.id
   */
  id?: string;

  /**
   * Encounter.meta
   */
  meta?: Meta;

  /**
   * Encounter.implicitRules
   */
  implicitRules?: string;

  /**
   * Encounter.language
   */
  language?: string;

  /**
   * Encounter.text
   */
  text?: Narrative;

  /**
   * Encounter.contained
   */
  contained?: Resource[];

  /**
   * Encounter.extension
   */
  extension?: Extension[];

  /**
   * Encounter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.identifier
   */
  identifier?: Identifier[];

  /**
   * Encounter.status
   */
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';

  /**
   * Encounter.statusHistory
   */
  statusHistory?: EncounterStatusHistory[];

  /**
   * Encounter.class
   */
  class: Coding;

  /**
   * Encounter.classHistory
   */
  classHistory?: EncounterClassHistory[];

  /**
   * Encounter.type
   */
  type?: CodeableConcept[];

  /**
   * Encounter.serviceType
   */
  serviceType?: CodeableConcept;

  /**
   * Encounter.priority
   */
  priority?: CodeableConcept;

  /**
   * Encounter.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * Encounter.episodeOfCare
   */
  episodeOfCare?: Reference<EpisodeOfCare>[];

  /**
   * Encounter.basedOn
   */
  basedOn?: Reference<ServiceRequest>[];

  /**
   * Encounter.participant
   */
  participant?: EncounterParticipant[];

  /**
   * Encounter.appointment
   */
  appointment?: Reference<Appointment>[];

  /**
   * Encounter.period
   */
  period?: Period;

  /**
   * Encounter.length
   */
  length?: Duration;

  /**
   * Encounter.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Encounter.reasonReference
   */
  reasonReference?: Reference<Condition | Procedure | Observation | ImmunizationRecommendation>[];

  /**
   * Encounter.diagnosis
   */
  diagnosis?: EncounterDiagnosis[];

  /**
   * Encounter.account
   */
  account?: Reference<Account>[];

  /**
   * Encounter.hospitalization
   */
  hospitalization?: EncounterHospitalization;

  /**
   * Encounter.location
   */
  location?: EncounterLocation[];

  /**
   * Encounter.serviceProvider
   */
  serviceProvider?: Reference<Organization>;

  /**
   * Encounter.partOf
   */
  partOf?: Reference<Encounter>;
}

/**
 * FHIR R4 EncounterClassHistory
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EncounterClassHistory {

  /**
   * Encounter.classHistory.id
   */
  id?: string;

  /**
   * Encounter.classHistory.extension
   */
  extension?: Extension[];

  /**
   * Encounter.classHistory.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.classHistory.class
   */
  class: Coding;

  /**
   * Encounter.classHistory.period
   */
  period: Period;
}

/**
 * FHIR R4 EncounterDiagnosis
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EncounterDiagnosis {

  /**
   * Encounter.diagnosis.id
   */
  id?: string;

  /**
   * Encounter.diagnosis.extension
   */
  extension?: Extension[];

  /**
   * Encounter.diagnosis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.diagnosis.condition
   */
  condition: Reference<Condition | Procedure>;

  /**
   * Encounter.diagnosis.use
   */
  use?: CodeableConcept;

  /**
   * Encounter.diagnosis.rank
   */
  rank?: number;
}

/**
 * FHIR R4 EncounterHospitalization
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EncounterHospitalization {

  /**
   * Encounter.hospitalization.id
   */
  id?: string;

  /**
   * Encounter.hospitalization.extension
   */
  extension?: Extension[];

  /**
   * Encounter.hospitalization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.hospitalization.preAdmissionIdentifier
   */
  preAdmissionIdentifier?: Identifier;

  /**
   * Encounter.hospitalization.origin
   */
  origin?: Reference<Location | Organization>;

  /**
   * Encounter.hospitalization.admitSource
   */
  admitSource?: CodeableConcept;

  /**
   * Encounter.hospitalization.reAdmission
   */
  reAdmission?: CodeableConcept;

  /**
   * Encounter.hospitalization.dietPreference
   */
  dietPreference?: CodeableConcept[];

  /**
   * Encounter.hospitalization.specialCourtesy
   */
  specialCourtesy?: CodeableConcept[];

  /**
   * Encounter.hospitalization.specialArrangement
   */
  specialArrangement?: CodeableConcept[];

  /**
   * Encounter.hospitalization.destination
   */
  destination?: Reference<Location | Organization>;

  /**
   * Encounter.hospitalization.dischargeDisposition
   */
  dischargeDisposition?: CodeableConcept;
}

/**
 * FHIR R4 EncounterLocation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EncounterLocation {

  /**
   * Encounter.location.id
   */
  id?: string;

  /**
   * Encounter.location.extension
   */
  extension?: Extension[];

  /**
   * Encounter.location.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.location.location
   */
  location: Reference<Location>;

  /**
   * Encounter.location.status
   */
  status?: string;

  /**
   * Encounter.location.physicalType
   */
  physicalType?: CodeableConcept;

  /**
   * Encounter.location.period
   */
  period?: Period;
}

/**
 * FHIR R4 EncounterParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EncounterParticipant {

  /**
   * Encounter.participant.id
   */
  id?: string;

  /**
   * Encounter.participant.extension
   */
  extension?: Extension[];

  /**
   * Encounter.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.participant.type
   */
  type?: CodeableConcept[];

  /**
   * Encounter.participant.period
   */
  period?: Period;

  /**
   * Encounter.participant.individual
   */
  individual?: Reference<Practitioner | PractitionerRole | RelatedPerson>;
}

/**
 * FHIR R4 EncounterStatusHistory
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EncounterStatusHistory {

  /**
   * Encounter.statusHistory.id
   */
  id?: string;

  /**
   * Encounter.statusHistory.extension
   */
  extension?: Extension[];

  /**
   * Encounter.statusHistory.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Encounter.statusHistory.status
   */
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';

  /**
   * Encounter.statusHistory.period
   */
  period: Period;
}
