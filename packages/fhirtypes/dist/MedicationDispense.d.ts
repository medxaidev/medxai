import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { DetectedIssue } from './DetectedIssue';
import { Device } from './Device';
import { Dosage } from './Dosage';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
import { MedicationRequest } from './MedicationRequest';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Provenance } from './Provenance';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicationDispense
 * @see https://hl7.org/fhir/R4/medicationdispense.html
 */
export interface MedicationDispense {

  /**
   * This is a MedicationDispense resource
   */
  readonly resourceType: 'MedicationDispense';

  /**
   * MedicationDispense.id
   */
  id?: string;

  /**
   * MedicationDispense.meta
   */
  meta?: Meta;

  /**
   * MedicationDispense.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicationDispense.language
   */
  language?: string;

  /**
   * MedicationDispense.text
   */
  text?: Narrative;

  /**
   * MedicationDispense.contained
   */
  contained?: Resource[];

  /**
   * MedicationDispense.extension
   */
  extension?: Extension[];

  /**
   * MedicationDispense.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationDispense.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicationDispense.partOf
   */
  partOf?: Reference<Procedure>[];

  /**
   * MedicationDispense.status
   */
  status: string;

  /**
   * MedicationDispense.statusReason[x]
   */
  statusReasonCodeableConcept?: CodeableConcept;

  /**
   * MedicationDispense.statusReason[x]
   */
  statusReasonReference?: Reference<DetectedIssue>;

  /**
   * MedicationDispense.category
   */
  category?: CodeableConcept;

  /**
   * MedicationDispense.medication[x]
   */
  medicationCodeableConcept: CodeableConcept;

  /**
   * MedicationDispense.medication[x]
   */
  medicationReference: Reference<Medication>;

  /**
   * MedicationDispense.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * MedicationDispense.context
   */
  context?: Reference<Encounter | EpisodeOfCare>;

  /**
   * MedicationDispense.supportingInformation
   */
  supportingInformation?: Reference[];

  /**
   * MedicationDispense.performer
   */
  performer?: MedicationDispensePerformer[];

  /**
   * MedicationDispense.location
   */
  location?: Reference<Location>;

  /**
   * MedicationDispense.authorizingPrescription
   */
  authorizingPrescription?: Reference<MedicationRequest>[];

  /**
   * MedicationDispense.type
   */
  type?: CodeableConcept;

  /**
   * MedicationDispense.quantity
   */
  quantity?: Quantity;

  /**
   * MedicationDispense.daysSupply
   */
  daysSupply?: Quantity;

  /**
   * MedicationDispense.whenPrepared
   */
  whenPrepared?: string;

  /**
   * MedicationDispense.whenHandedOver
   */
  whenHandedOver?: string;

  /**
   * MedicationDispense.destination
   */
  destination?: Reference<Location>;

  /**
   * MedicationDispense.receiver
   */
  receiver?: Reference<Patient | Practitioner>[];

  /**
   * MedicationDispense.note
   */
  note?: Annotation[];

  /**
   * MedicationDispense.dosageInstruction
   */
  dosageInstruction?: Dosage[];

  /**
   * MedicationDispense.substitution
   */
  substitution?: MedicationDispenseSubstitution;

  /**
   * MedicationDispense.detectedIssue
   */
  detectedIssue?: Reference<DetectedIssue>[];

  /**
   * MedicationDispense.eventHistory
   */
  eventHistory?: Reference<Provenance>[];
}

/**
 * MedicationDispense.statusReason[x]
 */
export type MedicationDispenseStatusReason = CodeableConcept | Reference<DetectedIssue>;
/**
 * MedicationDispense.medication[x]
 */
export type MedicationDispenseMedication = CodeableConcept | Reference<Medication>;

/**
 * FHIR R4 MedicationDispensePerformer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationDispensePerformer {

  /**
   * MedicationDispense.performer.id
   */
  id?: string;

  /**
   * MedicationDispense.performer.extension
   */
  extension?: Extension[];

  /**
   * MedicationDispense.performer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationDispense.performer.function
   */
  function?: CodeableConcept;

  /**
   * MedicationDispense.performer.actor
   */
  actor: Reference<Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson>;
}

/**
 * FHIR R4 MedicationDispenseSubstitution
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationDispenseSubstitution {

  /**
   * MedicationDispense.substitution.id
   */
  id?: string;

  /**
   * MedicationDispense.substitution.extension
   */
  extension?: Extension[];

  /**
   * MedicationDispense.substitution.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationDispense.substitution.wasSubstituted
   */
  wasSubstituted: boolean;

  /**
   * MedicationDispense.substitution.type
   */
  type?: CodeableConcept;

  /**
   * MedicationDispense.substitution.reason
   */
  reason?: CodeableConcept[];

  /**
   * MedicationDispense.substitution.responsibleParty
   */
  responsibleParty?: Reference<Practitioner | PractitionerRole>[];
}
