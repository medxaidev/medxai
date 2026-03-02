import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Medication } from './Medication';
import { MedicationRequest } from './MedicationRequest';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Provenance } from './Provenance';
import { Quantity } from './Quantity';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicationAdministration
 * @see https://hl7.org/fhir/R4/medicationadministration.html
 */
export interface MedicationAdministration {

  /**
   * This is a MedicationAdministration resource
   */
  readonly resourceType: 'MedicationAdministration';

  /**
   * MedicationAdministration.id
   */
  id?: string;

  /**
   * MedicationAdministration.meta
   */
  meta?: Meta;

  /**
   * MedicationAdministration.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicationAdministration.language
   */
  language?: string;

  /**
   * MedicationAdministration.text
   */
  text?: Narrative;

  /**
   * MedicationAdministration.contained
   */
  contained?: Resource[];

  /**
   * MedicationAdministration.extension
   */
  extension?: Extension[];

  /**
   * MedicationAdministration.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationAdministration.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicationAdministration.instantiates
   */
  instantiates?: string[];

  /**
   * MedicationAdministration.partOf
   */
  partOf?: Reference<MedicationAdministration | Procedure>[];

  /**
   * MedicationAdministration.status
   */
  status: string;

  /**
   * MedicationAdministration.statusReason
   */
  statusReason?: CodeableConcept[];

  /**
   * MedicationAdministration.category
   */
  category?: CodeableConcept;

  /**
   * MedicationAdministration.medication[x]
   */
  medicationCodeableConcept: CodeableConcept;

  /**
   * MedicationAdministration.medication[x]
   */
  medicationReference: Reference<Medication>;

  /**
   * MedicationAdministration.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * MedicationAdministration.context
   */
  context?: Reference<Encounter | EpisodeOfCare>;

  /**
   * MedicationAdministration.supportingInformation
   */
  supportingInformation?: Reference[];

  /**
   * MedicationAdministration.effective[x]
   */
  effectiveDateTime: string;

  /**
   * MedicationAdministration.effective[x]
   */
  effectivePeriod: Period;

  /**
   * MedicationAdministration.performer
   */
  performer?: MedicationAdministrationPerformer[];

  /**
   * MedicationAdministration.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * MedicationAdministration.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport>[];

  /**
   * MedicationAdministration.request
   */
  request?: Reference<MedicationRequest>;

  /**
   * MedicationAdministration.device
   */
  device?: Reference<Device>[];

  /**
   * MedicationAdministration.note
   */
  note?: Annotation[];

  /**
   * MedicationAdministration.dosage
   */
  dosage?: MedicationAdministrationDosage;

  /**
   * MedicationAdministration.eventHistory
   */
  eventHistory?: Reference<Provenance>[];
}

/**
 * MedicationAdministration.medication[x]
 */
export type MedicationAdministrationMedication = CodeableConcept | Reference<Medication>;
/**
 * MedicationAdministration.effective[x]
 */
export type MedicationAdministrationEffective = string | Period;

/**
 * FHIR R4 MedicationAdministrationDosage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationAdministrationDosage {

  /**
   * MedicationAdministration.dosage.id
   */
  id?: string;

  /**
   * MedicationAdministration.dosage.extension
   */
  extension?: Extension[];

  /**
   * MedicationAdministration.dosage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationAdministration.dosage.text
   */
  text?: string;

  /**
   * MedicationAdministration.dosage.site
   */
  site?: CodeableConcept;

  /**
   * MedicationAdministration.dosage.route
   */
  route?: CodeableConcept;

  /**
   * MedicationAdministration.dosage.method
   */
  method?: CodeableConcept;

  /**
   * MedicationAdministration.dosage.dose
   */
  dose?: Quantity;

  /**
   * MedicationAdministration.dosage.rate[x]
   */
  rateRatio?: Ratio;

  /**
   * MedicationAdministration.dosage.rate[x]
   */
  rateQuantity?: Quantity;
}

/**
 * FHIR R4 MedicationAdministrationPerformer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationAdministrationPerformer {

  /**
   * MedicationAdministration.performer.id
   */
  id?: string;

  /**
   * MedicationAdministration.performer.extension
   */
  extension?: Extension[];

  /**
   * MedicationAdministration.performer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationAdministration.performer.function
   */
  function?: CodeableConcept;

  /**
   * MedicationAdministration.performer.actor
   */
  actor: Reference<Practitioner | PractitionerRole | Patient | RelatedPerson | Device>;
}
