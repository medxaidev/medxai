import { Annotation } from './Annotation';
import { CarePlan } from './CarePlan';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { DiagnosticReport } from './DiagnosticReport';
import { Dosage } from './Dosage';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Medication } from './Medication';
import { MedicationAdministration } from './MedicationAdministration';
import { MedicationDispense } from './MedicationDispense';
import { MedicationRequest } from './MedicationRequest';
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
 * FHIR R4 MedicationStatement
 * @see https://hl7.org/fhir/R4/medicationstatement.html
 */
export interface MedicationStatement {

  /**
   * This is a MedicationStatement resource
   */
  readonly resourceType: 'MedicationStatement';

  /**
   * MedicationStatement.id
   */
  id?: string;

  /**
   * MedicationStatement.meta
   */
  meta?: Meta;

  /**
   * MedicationStatement.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicationStatement.language
   */
  language?: string;

  /**
   * MedicationStatement.text
   */
  text?: Narrative;

  /**
   * MedicationStatement.contained
   */
  contained?: Resource[];

  /**
   * MedicationStatement.extension
   */
  extension?: Extension[];

  /**
   * MedicationStatement.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationStatement.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicationStatement.basedOn
   */
  basedOn?: Reference<MedicationRequest | CarePlan | ServiceRequest>[];

  /**
   * MedicationStatement.partOf
   */
  partOf?: Reference<MedicationAdministration | MedicationDispense | MedicationStatement | Procedure | Observation>[];

  /**
   * MedicationStatement.status
   */
  status: string;

  /**
   * MedicationStatement.statusReason
   */
  statusReason?: CodeableConcept[];

  /**
   * MedicationStatement.category
   */
  category?: CodeableConcept;

  /**
   * MedicationStatement.medication[x]
   */
  medicationCodeableConcept: CodeableConcept;

  /**
   * MedicationStatement.medication[x]
   */
  medicationReference: Reference<Medication>;

  /**
   * MedicationStatement.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * MedicationStatement.context
   */
  context?: Reference<Encounter | EpisodeOfCare>;

  /**
   * MedicationStatement.effective[x]
   */
  effectiveDateTime?: string;

  /**
   * MedicationStatement.effective[x]
   */
  effectivePeriod?: Period;

  /**
   * MedicationStatement.dateAsserted
   */
  dateAsserted?: string;

  /**
   * MedicationStatement.informationSource
   */
  informationSource?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Organization>;

  /**
   * MedicationStatement.derivedFrom
   */
  derivedFrom?: Reference[];

  /**
   * MedicationStatement.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * MedicationStatement.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport>[];

  /**
   * MedicationStatement.note
   */
  note?: Annotation[];

  /**
   * MedicationStatement.dosage
   */
  dosage?: Dosage[];
}

/**
 * MedicationStatement.medication[x]
 */
export type MedicationStatementMedication = CodeableConcept | Reference<Medication>;
/**
 * MedicationStatement.effective[x]
 */
export type MedicationStatementEffective = string | Period;
