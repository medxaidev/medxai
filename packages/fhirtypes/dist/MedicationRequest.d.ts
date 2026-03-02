import { Annotation } from './Annotation';
import { CarePlan } from './CarePlan';
import { CareTeam } from './CareTeam';
import { ClaimResponse } from './ClaimResponse';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Coverage } from './Coverage';
import { DetectedIssue } from './DetectedIssue';
import { Device } from './Device';
import { Dosage } from './Dosage';
import { Duration } from './Duration';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { ImmunizationRecommendation } from './ImmunizationRecommendation';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Provenance } from './Provenance';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';

/**
 * FHIR R4 MedicationRequest
 * @see https://hl7.org/fhir/R4/medicationrequest.html
 */
export interface MedicationRequest {

  /**
   * This is a MedicationRequest resource
   */
  readonly resourceType: 'MedicationRequest';

  /**
   * MedicationRequest.id
   */
  id?: string;

  /**
   * MedicationRequest.meta
   */
  meta?: Meta;

  /**
   * MedicationRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicationRequest.language
   */
  language?: string;

  /**
   * MedicationRequest.text
   */
  text?: Narrative;

  /**
   * MedicationRequest.contained
   */
  contained?: Resource[];

  /**
   * MedicationRequest.extension
   */
  extension?: Extension[];

  /**
   * MedicationRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicationRequest.status
   */
  status: string;

  /**
   * MedicationRequest.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * MedicationRequest.intent
   */
  intent: string;

  /**
   * MedicationRequest.category
   */
  category?: CodeableConcept[];

  /**
   * MedicationRequest.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * MedicationRequest.doNotPerform
   */
  doNotPerform?: boolean;

  /**
   * MedicationRequest.reported[x]
   */
  reportedBoolean?: boolean;

  /**
   * MedicationRequest.reported[x]
   */
  reportedReference?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Organization>;

  /**
   * MedicationRequest.medication[x]
   */
  medicationCodeableConcept: CodeableConcept;

  /**
   * MedicationRequest.medication[x]
   */
  medicationReference: Reference<Medication>;

  /**
   * MedicationRequest.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * MedicationRequest.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * MedicationRequest.supportingInformation
   */
  supportingInformation?: Reference[];

  /**
   * MedicationRequest.authoredOn
   */
  authoredOn?: string;

  /**
   * MedicationRequest.requester
   */
  requester?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device>;

  /**
   * MedicationRequest.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson | CareTeam>;

  /**
   * MedicationRequest.performerType
   */
  performerType?: CodeableConcept;

  /**
   * MedicationRequest.recorder
   */
  recorder?: Reference<Practitioner | PractitionerRole>;

  /**
   * MedicationRequest.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * MedicationRequest.reasonReference
   */
  reasonReference?: Reference<Condition | Observation>[];

  /**
   * MedicationRequest.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * MedicationRequest.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * MedicationRequest.basedOn
   */
  basedOn?: Reference<CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation>[];

  /**
   * MedicationRequest.groupIdentifier
   */
  groupIdentifier?: Identifier;

  /**
   * MedicationRequest.courseOfTherapyType
   */
  courseOfTherapyType?: CodeableConcept;

  /**
   * MedicationRequest.insurance
   */
  insurance?: Reference<Coverage | ClaimResponse>[];

  /**
   * MedicationRequest.note
   */
  note?: Annotation[];

  /**
   * MedicationRequest.dosageInstruction
   */
  dosageInstruction?: Dosage[];

  /**
   * MedicationRequest.dispenseRequest
   */
  dispenseRequest?: MedicationRequestDispenseRequest;

  /**
   * MedicationRequest.substitution
   */
  substitution?: MedicationRequestSubstitution;

  /**
   * MedicationRequest.priorPrescription
   */
  priorPrescription?: Reference<MedicationRequest>;

  /**
   * MedicationRequest.detectedIssue
   */
  detectedIssue?: Reference<DetectedIssue>[];

  /**
   * MedicationRequest.eventHistory
   */
  eventHistory?: Reference<Provenance>[];
}

/**
 * MedicationRequest.reported[x]
 */
export type MedicationRequestReported = boolean | Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Organization>;
/**
 * MedicationRequest.medication[x]
 */
export type MedicationRequestMedication = CodeableConcept | Reference<Medication>;

/**
 * FHIR R4 MedicationRequestDispenseRequest
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationRequestDispenseRequest {

  /**
   * MedicationRequest.dispenseRequest.id
   */
  id?: string;

  /**
   * MedicationRequest.dispenseRequest.extension
   */
  extension?: Extension[];

  /**
   * MedicationRequest.dispenseRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationRequest.dispenseRequest.initialFill
   */
  initialFill?: MedicationRequestDispenseRequestInitialFill;

  /**
   * MedicationRequest.dispenseRequest.dispenseInterval
   */
  dispenseInterval?: Duration;

  /**
   * MedicationRequest.dispenseRequest.validityPeriod
   */
  validityPeriod?: Period;

  /**
   * MedicationRequest.dispenseRequest.numberOfRepeatsAllowed
   */
  numberOfRepeatsAllowed?: number;

  /**
   * MedicationRequest.dispenseRequest.quantity
   */
  quantity?: Quantity;

  /**
   * MedicationRequest.dispenseRequest.expectedSupplyDuration
   */
  expectedSupplyDuration?: Duration;

  /**
   * MedicationRequest.dispenseRequest.performer
   */
  performer?: Reference<Organization>;
}

/**
 * FHIR R4 MedicationRequestDispenseRequestInitialFill
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationRequestDispenseRequestInitialFill {

  /**
   * MedicationRequest.dispenseRequest.initialFill.id
   */
  id?: string;

  /**
   * MedicationRequest.dispenseRequest.initialFill.extension
   */
  extension?: Extension[];

  /**
   * MedicationRequest.dispenseRequest.initialFill.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationRequest.dispenseRequest.initialFill.quantity
   */
  quantity?: Quantity;

  /**
   * MedicationRequest.dispenseRequest.initialFill.duration
   */
  duration?: Duration;
}

/**
 * FHIR R4 MedicationRequestSubstitution
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationRequestSubstitution {

  /**
   * MedicationRequest.substitution.id
   */
  id?: string;

  /**
   * MedicationRequest.substitution.extension
   */
  extension?: Extension[];

  /**
   * MedicationRequest.substitution.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationRequest.substitution.allowed[x]
   */
  allowedBoolean: boolean;

  /**
   * MedicationRequest.substitution.allowed[x]
   */
  allowedCodeableConcept: CodeableConcept;

  /**
   * MedicationRequest.substitution.reason
   */
  reason?: CodeableConcept;
}
