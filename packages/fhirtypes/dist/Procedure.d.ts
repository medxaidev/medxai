import { Age } from './Age';
import { Annotation } from './Annotation';
import { CarePlan } from './CarePlan';
import { CodeableConcept } from './CodeableConcept';
import { Composition } from './Composition';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
import { MedicationAdministration } from './MedicationAdministration';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Substance } from './Substance';

/**
 * FHIR R4 Procedure
 * @see https://hl7.org/fhir/R4/procedure.html
 */
export interface Procedure {

  /**
   * This is a Procedure resource
   */
  readonly resourceType: 'Procedure';

  /**
   * Procedure.id
   */
  id?: string;

  /**
   * Procedure.meta
   */
  meta?: Meta;

  /**
   * Procedure.implicitRules
   */
  implicitRules?: string;

  /**
   * Procedure.language
   */
  language?: string;

  /**
   * Procedure.text
   */
  text?: Narrative;

  /**
   * Procedure.contained
   */
  contained?: Resource[];

  /**
   * Procedure.extension
   */
  extension?: Extension[];

  /**
   * Procedure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Procedure.identifier
   */
  identifier?: Identifier[];

  /**
   * Procedure.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * Procedure.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * Procedure.basedOn
   */
  basedOn?: Reference<CarePlan | ServiceRequest>[];

  /**
   * Procedure.partOf
   */
  partOf?: Reference<Procedure | Observation | MedicationAdministration>[];

  /**
   * Procedure.status
   */
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * Procedure.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * Procedure.category
   */
  category?: CodeableConcept;

  /**
   * Procedure.code
   */
  code?: CodeableConcept;

  /**
   * Procedure.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * Procedure.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Procedure.performed[x]
   */
  performedDateTime?: string;

  /**
   * Procedure.performed[x]
   */
  performedPeriod?: Period;

  /**
   * Procedure.performed[x]
   */
  performedString?: string;

  /**
   * Procedure.performed[x]
   */
  performedAge?: Age;

  /**
   * Procedure.performed[x]
   */
  performedRange?: Range;

  /**
   * Procedure.recorder
   */
  recorder?: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole>;

  /**
   * Procedure.asserter
   */
  asserter?: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole>;

  /**
   * Procedure.performer
   */
  performer?: ProcedurePerformer[];

  /**
   * Procedure.location
   */
  location?: Reference<Location>;

  /**
   * Procedure.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Procedure.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | Procedure | DiagnosticReport | DocumentReference>[];

  /**
   * Procedure.bodySite
   */
  bodySite?: CodeableConcept[];

  /**
   * Procedure.outcome
   */
  outcome?: CodeableConcept;

  /**
   * Procedure.report
   */
  report?: Reference<DiagnosticReport | DocumentReference | Composition>[];

  /**
   * Procedure.complication
   */
  complication?: CodeableConcept[];

  /**
   * Procedure.complicationDetail
   */
  complicationDetail?: Reference<Condition>[];

  /**
   * Procedure.followUp
   */
  followUp?: CodeableConcept[];

  /**
   * Procedure.note
   */
  note?: Annotation[];

  /**
   * Procedure.focalDevice
   */
  focalDevice?: ProcedureFocalDevice[];

  /**
   * Procedure.usedReference
   */
  usedReference?: Reference<Device | Medication | Substance>[];

  /**
   * Procedure.usedCode
   */
  usedCode?: CodeableConcept[];
}

/**
 * Procedure.performed[x]
 */
export type ProcedurePerformed = string | Period | Age | Range;

/**
 * FHIR R4 ProcedureFocalDevice
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ProcedureFocalDevice {

  /**
   * Procedure.focalDevice.id
   */
  id?: string;

  /**
   * Procedure.focalDevice.extension
   */
  extension?: Extension[];

  /**
   * Procedure.focalDevice.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Procedure.focalDevice.action
   */
  action?: CodeableConcept;

  /**
   * Procedure.focalDevice.manipulated
   */
  manipulated: Reference<Device>;
}

/**
 * FHIR R4 ProcedurePerformer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ProcedurePerformer {

  /**
   * Procedure.performer.id
   */
  id?: string;

  /**
   * Procedure.performer.extension
   */
  extension?: Extension[];

  /**
   * Procedure.performer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Procedure.performer.function
   */
  function?: CodeableConcept;

  /**
   * Procedure.performer.actor
   */
  actor: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device>;

  /**
   * Procedure.performer.onBehalfOf
   */
  onBehalfOf?: Reference<Organization>;
}
